import { NextRequest, NextResponse } from "next/server";
import { validateSession, extractAuthToken } from "@/lib/server-utils";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import ExcelJS from "exceljs";
import { extractTextItems } from "unpdf";
import {
    EXPENSE_CATEGORIES as CATEGORIES,
    isExpenseCategory,
} from "@/lib/expense-categories";
import {
    extractSensitiveTermsFromLabeledText,
    extractSensitiveTermsFromSpreadsheetRows,
    mergeRedactionSummaries,
    redactPiiText,
    type RedactionSummary,
} from "@/lib/pii-redactor";

// ---------- Config ----------

const GEMINI_MODEL = "gemini-3.5-flash-lite";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const GEMINI_CHUNK_SIZE = 100;

// ---------- Types ----------

interface ExtractedExpense {
    date: string;
    description: string;
    amount: number;
    category: string;
    installment: string | null;
}

interface ExtractResult {
    period: string;
    expenses: ExtractedExpense[];
}

interface ParsedSpreadsheetExpense {
    sourceId: number;
    date: string;
    description: string;
    amount: number;
}

interface ClassifiedExpense {
    sourceId: number;
    category: string;
    installment: string | null;
}

// ---------- Gemini Instructions ----------

const IMAGE_SYSTEM_INSTRUCTION = `
Sen bir banka ve kredi kartı ekstresi ayrıştırma uzmanısın.

Sana verilen görsel içindeki işlem hareketlerini ayıkla.
Görselde kişisel bilgileri gizlemek için karartılmış/sansürlenmiş alanlar olabilir; bu alanları yoksay ve sadece gerçek harcama işlemlerine odaklan.

KURALLAR:

- Görselin tamamını incele.
- Birden fazla ay/yıl varsa TÜM aylardaki uygun harcamaları dahil et.
- Sadece gerçek harcama ve para çekme işlemlerini dahil et.
- Hesaba gelen para, FAST, EFT, havale, para yatırma ve benzeri para girişlerini dahil etme.
- Karta yapılan borç ödemelerini dahil etme.
- İade işlemlerini dahil etme.
- İptal işlemlerini dahil etme.
- Blokaj işlemlerini dahil etme.
- Blokaj kaldırma işlemlerini dahil etme.
- 0 tutarlı işlemleri dahil etme.
- Tutarları her zaman pozitif sayı olarak döndür.
- Örneğin -440 -> 440.
- Tarih formatı kesinlikle YYYY-MM-DD olsun.
- İşlem tarihi olarak gerçek işlem tarihini kullan.
- Valör tarihini işlem tarihi olarak kullanma.
- Taksit bilgisi açıkça bulunuyorsa "2/6", "3/12" gibi formatta yaz.
- Taksit bilgisi yoksa null döndür.
- Açıklamada kişisel bilgi (IBAN, kart no, TCKN, ad-soyad, telefon, e-posta, adres) varsa çıktıya dahil etme.
- Her harcamayı aşağıdaki kategorilerden tam olarak biriyle sınıflandır:

${CATEGORIES.join(", ")}

ÇOK ÖNEMLİ:
Kaynak birden fazla ay içeriyorsa sadece belirli bir ayın işlemlerini seçme.
Görselin BAŞINDAN SONUNA kadar bütün işlemleri değerlendir.
`;

const REDACTED_PDF_TEXT_SYSTEM_INSTRUCTION = `
Sen bir banka ve kredi kartı ekstresi ayrıştırma uzmanısın.

Sana bir PDF ekstresinden çıkarılmış ve kişisel bilgileri gizlilik amacıyla sansürlenmiş ([AD_SOYAD], [IBAN], [KART_NO], [TCKN], [ADRES], [HESAP_NO], [MUSTERI_NO], [TELEFON], [EPOSTA], [KISISEL_BILGI] vb.) düz metin verilecek.

KURALLAR:

- Metnin tamamını (tüm sayfaları) incele.
- Sadece son ayı veya son sayfayı inceleme.
- Birden fazla ay/yıl varsa TÜM aylardaki uygun harcamaları dahil et.
- Sansür yer tutucularını ([KART_NO], [IBAN], [AD_SOYAD] vb.) kişisel bilgi olarak algıla ve çıktı açıklamalarına gereksiz yere taşıma; yalnızca işyeri/işlem adını anlaşılır biçimde koru.
- Sadece gerçek harcama ve para çekme işlemlerini dahil et.
- Hesaba gelen para, FAST, EFT, havale, para yatırma ve benzeri para girişlerini dahil etme.
- Karta yapılan borç ödemelerini dahil etme.
- İade işlemlerini dahil etme.
- İptal işlemlerini dahil etme.
- Blokaj işlemlerini dahil etme.
- Blokaj kaldırma işlemlerini dahil etme.
- 0 tutarlı işlemleri dahil etme.
- Tutarları her zaman pozitif sayı olarak döndür.
- Örneğin -440 -> 440.
- Tarih formatı kesinlikle YYYY-MM-DD olsun.
- İşlem tarihi olarak gerçek işlem tarihini kullan.
- Valör tarihini işlem tarihi olarak kullanma.
- Taksit bilgisi açıkça bulunuyorsa "2/6", "3/12" gibi formatta yaz.
- Taksit bilgisi yoksa null döndür.
- Her harcamayı aşağıdaki kategorilerden tam olarak biriyle sınıflandır:

${CATEGORIES.join(", ")}

ÇOK ÖNEMLİ:
Kaynak birden fazla ay içeriyorsa sadece belirli bir ayın işlemlerini seçme.
Metnin BAŞINDAN SONUNA kadar bütün işlemleri değerlendir.
`;

const SPREADSHEET_SYSTEM_INSTRUCTION = `
Sen banka hesap hareketlerini sınıflandıran bir uzmansın.

Sana kod tarafından zaten tespit edilmiş ve kişisel bilgileri sansürlenmiş ([IBAN], [KART_NO], [TCKN], [AD_SOYAD], [TELEFON], [EPOSTA], [ABONE_NO], [KISISEL_BILGI] vb.) gerçek harcama işlemleri verilecek.

GÖREV:
Her işlem için kategori ve varsa taksit bilgisini belirle.

KATEGORİLER:
${CATEGORIES.join(", ")}

KURALLAR:

- Her sourceId için mutlaka bir sonuç döndür.
- Hiçbir sourceId'yi atlama.
- sourceId değerini değiştirme.
- Sadece verilen işlemleri sınıflandır.
- Yeni işlem oluşturma.
- Tutar veya tarih değiştirme.
- Harcama açıklamasından mümkün olduğunca doğru kategori çıkar.
- Taksit bilgisi açıklamada açıkça bulunuyorsa "2/6", "3/12" gibi formatta yaz.
- Taksit bilgisi yoksa null döndür.
- Emin değilsen kategori olarak "Diğer" kullan.
`;

// ---------- Helpers ----------

function normalizeText(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
}

function parseAmount(value: unknown): number | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    let text = String(value).trim();

    if (!text) {
        return null;
    }

    // Türkçe sayı formatlarını destekle:
    // -1.234,56
    // -1234,56
    // -1234.56
    text = text.replace(/\s/g, "");

    if (text.includes(",") && text.includes(".")) {
        // 1.234,56
        if (text.lastIndexOf(",") > text.lastIndexOf(".")) {
            text = text.replace(/\./g, "").replace(",", ".");
        } else {
            // 1,234.56
            text = text.replace(/,/g, "");
        }
    } else if (text.includes(",")) {
        text = text.replace(",", ".");
    }

    const parsed = Number(text);

    return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: unknown): string | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const text = String(value).trim();

    if (!text) {
        return null;
    }

    // 09/04/2026-15:50:29
    const dateTimeMatch = text.match(
        /^(\d{2})\/(\d{2})\/(\d{4})/
    );

    if (dateTimeMatch) {
        const [, day, month, year] = dateTimeMatch;

        return `${year}-${month}-${day}`;
    }

    // 09/04/2026
    const slashMatch = text.match(
        /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (slashMatch) {
        const [, day, month, year] = slashMatch;

        return `${year}-${month}-${day}`;
    }

    // 2026-04-09
    const isoMatch = text.match(
        /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    return null;
}

function getPeriodFromDate(date: string): string {
    return date.substring(0, 7);
}

function containsExcludedKeyword(
    description: string,
    transactionType: string,
    transaction: string
): boolean {
    const text = [
        description,
        transactionType,
        transaction,
    ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

    const excludedKeywords = [
        "blokaj",
        "blk kayd",
        "blk i̇ptl",
        "blk iptl",
        "bloke",
        "para yatırma",
        "para yatirma",
        "fast",
        "eft",
        "havale",
        "iade",
        "geri ödeme",
        "geri odeme",
        "borç ödeme",
        "borc odeme",
        "kart ödeme",
        "kart odeme",
        "ödeme",
        "odeme",
        "transfer",
    ];

    return excludedKeywords.some((keyword) =>
        text.includes(keyword)
    );
}

function findColumn(
    headers: string[],
    candidates: string[]
): number {
    const normalizedHeaders = headers.map((header) =>
        header
            .trim()
            .toLocaleLowerCase("tr-TR")
            .replace(/\s+/g, " ")
    );

    for (const candidate of candidates) {
        const normalizedCandidate = candidate
            .trim()
            .toLocaleLowerCase("tr-TR")
            .replace(/\s+/g, " ");

        const exactIndex = normalizedHeaders.findIndex(
            (header) =>
                header === normalizedCandidate
        );

        if (exactIndex !== -1) {
            return exactIndex;
        }
    }

    for (const candidate of candidates) {
        const normalizedCandidate = candidate
            .trim()
            .toLocaleLowerCase("tr-TR");

        const partialIndex = normalizedHeaders.findIndex(
            (header) =>
                header.includes(normalizedCandidate)
        );

        if (partialIndex !== -1) {
            return partialIndex;
        }
    }

    return -1;
}

// ---------- Spreadsheet Parser ----------

function extractExcelCellValue(value: ExcelJS.CellValue): unknown {
    if (value === null || value === undefined) {
        return "";
    }

    if (value instanceof Date) {
        return value;
    }

    if (
        typeof value === "number" ||
        typeof value === "string" ||
        typeof value === "boolean"
    ) {
        return value;
    }

    if (typeof value === "object") {
        if ("richText" in value && Array.isArray(value.richText)) {
            return value.richText.map((part) => part.text ?? "").join("");
        }

        if ("result" in value) {
            return extractExcelCellValue(
                value.result as ExcelJS.CellValue
            );
        }

        if ("text" in value) {
            return extractExcelCellValue(
                value.text as ExcelJS.CellValue
            );
        }

        if ("error" in value) {
            return "";
        }
    }

    return String(value);
}

async function parseSpreadsheet(
    arrayBuffer: ArrayBuffer
): Promise<{
    expenses: ParsedSpreadsheetExpense[];
    period: string;
    headerSensitiveTerms: string[];
}> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const allExpenses: ParsedSpreadsheetExpense[] = [];

    const detectedPeriods = new Set<string>();
    const headerSensitiveTerms = new Set<string>();

    for (const sheet of workbook.worksheets) {
        const sheetName = sheet.name;

        // Ham satırları al (0-indexed dense array, boş hücreler "").
        const rows: unknown[][] = [];

        sheet.eachRow({ includeEmpty: false }, (row) => {
            const maxCol = Math.max(sheet.columnCount, row.cellCount);
            const rowValues: unknown[] = [];

            for (let col = 1; col <= maxCol; col++) {
                rowValues.push(
                    extractExcelCellValue(row.getCell(col).value)
                );
            }

            rows.push(rowValues);
        });

        if (!rows.length) {
            continue;
        }

        // Header satırını "Tarih/Saat" kolonunu bularak tespit et.
        let headerIndex = -1;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            const hasDateHeader = row.some(
                (cell) =>
                    normalizeText(cell)
                        .toLocaleLowerCase(
                            "tr-TR"
                        )
                        .includes("tarih/saat")
            );

            if (hasDateHeader) {
                headerIndex = i;
                break;
            }
        }

        if (headerIndex === -1) {
            console.warn(
                `Header bulunamadı: ${sheetName}`
            );
            continue;
        }

        // Tablo başlığından önceki üstbilgi satırlarındaki hesap sahibi / IBAN / kart no
        // gibi kişisel bilgileri yerel olarak topla (AI'ya gönderilmez; açıklamalarda geçerse sansürlenir).
        if (headerIndex > 0) {
            const termsFromHeader = extractSensitiveTermsFromSpreadsheetRows(
                rows.slice(0, headerIndex)
            );
            for (const term of termsFromHeader) {
                headerSensitiveTerms.add(term);
            }
        }

        const headers = rows[headerIndex].map(
            (cell) => normalizeText(cell)
        );

        // Banka dosyasındaki kolonları bul.
        const dateColumn = findColumn(
            headers,
            [
                "Tarih/Saat",
                "Tarih",
            ]
        );

        const amountColumn = findColumn(
            headers,
            [
                "İşlem Tutarı*",
                "İşlem Tutarı",
                "İşlem Tutar",
            ]
        );

        const descriptionColumn = findColumn(
            headers,
            [
                "Açıklama",
                "Aciklama",
            ]
        );

        const transactionColumn = findColumn(
            headers,
            [
                "İşlem",
                "Islem",
            ]
        );

        const transactionTypeColumn = findColumn(
            headers,
            [
                "İşlem Tipi",
                "Islem Tipi",
            ]
        );

        if (
            dateColumn === -1 ||
            amountColumn === -1 ||
            descriptionColumn === -1
        ) {
            console.error(
                "Gerekli kolonlar bulunamadı:",
                {
                    sheetName,
                    headers,
                    dateColumn,
                    amountColumn,
                    descriptionColumn,
                }
            );

            continue;
        }

        // Header'dan sonraki TÜM satırları tara.
        for (
            let rowIndex = headerIndex + 1;
            rowIndex < rows.length;
            rowIndex++
        ) {
            const row = rows[rowIndex];

            if (!row || row.length === 0) {
                continue;
            }

            const rawDate =
                row[dateColumn];

            const rawAmount =
                row[amountColumn];

            const description =
                normalizeText(
                    row[descriptionColumn]
                );

            const transaction =
                transactionColumn !== -1
                    ? normalizeText(
                          row[transactionColumn]
                      )
                    : "";

            const transactionType =
                transactionTypeColumn !== -1
                    ? normalizeText(
                          row[
                              transactionTypeColumn
                          ]
                      )
                    : "";

            const date = parseDate(rawDate);
            const amount =
                parseAmount(rawAmount);

            if (!date || amount === null) {
                continue;
            }

            if (!description) {
                continue;
            }

            // 0 tutarlı işlemleri çıkar.
            if (amount === 0) {
                continue;
            }

            // Banka ekstresinde çekimler negatif.
            // Pozitif tutarlar para girişidir.
            if (amount >= 0) {
                continue;
            }

            // İade, transfer, blokaj vb. işlemleri çıkar.
            if (
                containsExcludedKeyword(
                    description,
                    transactionType,
                    transaction
                )
            ) {
                continue;
            }

            const absoluteAmount =
                Math.abs(amount);

            detectedPeriods.add(
                getPeriodFromDate(date)
            );

            allExpenses.push({
                sourceId:
                    allExpenses.length,
                date,
                description,
                amount: Number(
                    absoluteAmount.toFixed(2)
                ),
            });
        }
    }

    // Tarihe göre sırala.
    allExpenses.sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    // sourceId'leri sıralama sonrasında yeniden oluştur.
    const normalizedExpenses =
        allExpenses.map(
            (expense, index) => ({
                ...expense,
                sourceId: index,
            })
        );

    const periods = Array.from(
        detectedPeriods
    ).sort();

    let period = "";

    if (periods.length === 1) {
        period = periods[0];
    } else if (periods.length > 1) {
        period = `${periods[0]} → ${
            periods[periods.length - 1]
        }`;
    }

    return {
        expenses: normalizedExpenses,
        period,
        headerSensitiveTerms: Array.from(headerSensitiveTerms),
    };
}

// ---------- PDF Structured Text Extraction (Local) ----------

async function extractPdfTextStructured(
    arrayBuffer: ArrayBuffer
): Promise<{ text: string; totalPages: number }> {
    const { totalPages, items: pages } = await extractTextItems(
        new Uint8Array(arrayBuffer)
    );

    const pageTexts: string[] = [];

    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
        const items = pages[pageIdx].filter(
            (item) => item.str && item.str.trim().length > 0
        );

        if (items.length === 0) {
            continue;
        }

        // Aynı görsel satırdaki öğeleri Y koordinatına göre grupla (PDF origin: sol alt)
        const sorted = [...items].sort((a, b) => {
            if (Math.abs(a.y - b.y) > 3) {
                return b.y - a.y;
            }
            return a.x - b.x;
        });

        const lines: { y: number; items: typeof items }[] = [];

        for (const item of sorted) {
            const existingLine = lines.find(
                (line) => Math.abs(line.y - item.y) <= 3
            );
            if (existingLine) {
                existingLine.items.push(item);
            } else {
                lines.push({ y: item.y, items: [item] });
            }
        }

        const formattedLines = lines.map((line) => {
            line.items.sort((a, b) => a.x - b.x);
            let lineText = "";
            let prevEndX: number | null = null;

            for (const item of line.items) {
                if (prevEndX !== null) {
                    const gap = item.x - prevEndX;
                    // Sütun ayrımı varsa çift boşluk bırak (sansürleyicinin sütun sınırını tanıması için)
                    if (gap > 14) {
                        lineText += "   ";
                    } else if (gap > 1.5 && !lineText.endsWith(" ")) {
                        lineText += " ";
                    }
                }
                lineText += item.str;
                prevEndX = item.x + (item.width || 0);
            }

            return lineText.trim();
        });

        pageTexts.push(
            `--- SAYFA ${pageIdx + 1} ---\n${formattedLines.filter(Boolean).join("\n")}`
        );
    }

    return {
        text: pageTexts.join("\n\n"),
        totalPages,
    };
}

// ---------- Image Metadata Stripper (EXIF / XMP / IPTC / PNG Text) ----------

function stripPngMetadata(buffer: Buffer): Buffer {
    const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    if (buffer.length < 16 || !buffer.subarray(0, 8).equals(PNG_SIG)) {
        return buffer;
    }

    const STRIP_CHUNKS = new Set(["tEXt", "zTXt", "iTXt", "eXIf", "tIME"]);
    const parts: Buffer[] = [PNG_SIG];
    let offset = 8;

    try {
        while (offset + 12 <= buffer.length) {
            const length = buffer.readUInt32BE(offset);
            const type = buffer.toString("ascii", offset + 4, offset + 8);
            const totalChunkSize = 12 + length;

            if (offset + totalChunkSize > buffer.length) {
                return buffer;
            }

            if (!STRIP_CHUNKS.has(type)) {
                parts.push(buffer.subarray(offset, offset + totalChunkSize));
            }

            offset += totalChunkSize;
            if (type === "IEND") {
                break;
            }
        }

        return Buffer.concat(parts);
    } catch {
        return buffer;
    }
}

function stripJpegMetadata(buffer: Buffer): Buffer {
    if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
        return buffer;
    }

    const parts: Buffer[] = [buffer.subarray(0, 2)];
    let offset = 2;

    try {
        while (offset + 2 <= buffer.length) {
            if (buffer[offset] !== 0xff) {
                return buffer;
            }

            // Dolgu 0xFF baytlarını atla
            while (offset < buffer.length && buffer[offset] === 0xff) {
                offset++;
            }
            if (offset >= buffer.length) break;

            const marker = buffer[offset];
            offset++;

            // Start of Scan (SOS) veya EOI: kalan tüm veriyi olduğu gibi ekle
            if (marker === 0xda || marker === 0xd9) {
                parts.push(Buffer.from([0xff, marker]), buffer.subarray(offset));
                return Buffer.concat(parts);
            }

            // Uzunluk alanı olmayan standalone marker'lar (RST0-RST7, TEM)
            if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
                parts.push(Buffer.from([0xff, marker]));
                continue;
            }

            if (offset + 2 > buffer.length) {
                return buffer;
            }

            const segmentLength = buffer.readUInt16BE(offset);
            if (segmentLength < 2 || offset + segmentLength > buffer.length) {
                return buffer;
            }

            // APP1..APP15 (EXIF, XMP, IPTC, ICC vb.) ve COM (0xFE) segmentlerini atla
            const isSensitiveMetadata =
                (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe;

            if (!isSensitiveMetadata) {
                parts.push(
                    Buffer.from([0xff, marker]),
                    buffer.subarray(offset, offset + segmentLength)
                );
            }

            offset += segmentLength;
        }

        return Buffer.concat(parts);
    } catch {
        return buffer;
    }
}

function stripImageMetadata(buffer: Buffer, mimeType: string): Buffer {
    if (mimeType === "image/png") {
        return stripPngMetadata(buffer);
    }
    if (mimeType === "image/jpeg") {
        return stripJpegMetadata(buffer);
    }
    return buffer;
}

// ---------- Shared Gemini Response Schema ----------

const EXTRACT_RESULT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        period: {
            type: Type.STRING,
            description:
                "Verinin kapsadığı genel dönem. YYYY-MM veya YYYY-MM → YYYY-MM.",
        },
        expenses: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    date: {
                        type: Type.STRING,
                        description: "İşlem tarihi, YYYY-MM-DD",
                    },
                    description: {
                        type: Type.STRING,
                    },
                    amount: {
                        type: Type.NUMBER,
                    },
                    category: {
                        type: Type.STRING,
                        enum: CATEGORIES,
                    },
                    installment: {
                        type: Type.STRING,
                        nullable: true,
                    },
                },
                required: ["date", "description", "amount", "category"],
            },
        },
    },
    required: ["period", "expenses"],
};

// ---------- Gemini: Retry & Fallback Helper ----------

async function callGeminiWithRetry(
    ai: GoogleGenAI,
    params: Parameters<typeof ai.models.generateContent>[0],
    maxRetries = 4
) {
    const candidateModels = [
        params.model || GEMINI_MODEL,
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3.8-flash",
        "gemini-3.5-flash"
    ];

    let lastError: any = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const currentModel = candidateModels[attempt % candidateModels.length];
        try {
            return await ai.models.generateContent({
                ...params,
                model: currentModel,
            });
        } catch (error: any) {
            lastError = error;
            const status = error?.status || error?.code || error?.error?.code;
            const msg = String(error?.message || "");
            const isTransient =
                status === 503 ||
                status === 429 ||
                status === 500 ||
                status === 504 ||
                msg.includes("high demand") ||
                msg.includes("UNAVAILABLE") ||
                msg.includes("temporarily") ||
                msg.includes("RESOURCE_EXHAUSTED");

            if (!isTransient || attempt === maxRetries - 1) {
                throw error;
            }

            const delay = (attempt + 1) * 2000 + Math.random() * 1000;
            console.warn(
                `[Gemini Retry] Model ${currentModel} returned ${status || "error"} (${msg.slice(0, 80)}...). Retrying attempt ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

// ---------- Gemini: Spreadsheet Classification ----------

async function classifySpreadsheetExpenses(
    ai: GoogleGenAI,
    expenses: ParsedSpreadsheetExpense[],
    extraSensitiveTerms: string[]
): Promise<{
    classifications: ClassifiedExpense[];
    redactionSummary: RedactionSummary;
}> {
    if (expenses.length === 0) {
        return {
            classifications: [],
            redactionSummary: { totalRedactions: 0, byCategory: {} },
        };
    }

    const chunks: ParsedSpreadsheetExpense[][] = [];

    for (
        let i = 0;
        i < expenses.length;
        i += GEMINI_CHUNK_SIZE
    ) {
        chunks.push(
            expenses.slice(
                i,
                i + GEMINI_CHUNK_SIZE
            )
        );
    }

    const results: ClassifiedExpense[] = [];
    const summaries: RedactionSummary[] = [];

    // Chunk'ları sırayla işliyoruz.
    // Böylece çok sayıda eşzamanlı Gemini isteği
    // ile rate limit'e girme ihtimali azalıyor.
    for (const chunk of chunks) {
        const input = chunk.map((expense) => {
            const { text: redactedDescription, summary } = redactPiiText(
                expense.description,
                { extraSensitiveTerms }
            );
            summaries.push(summary);

            return {
                sourceId: expense.sourceId,
                date: expense.date,
                description: redactedDescription,
                amount: expense.amount,
            };
        });

        const response =
            await callGeminiWithRetry(ai, {
                model: GEMINI_MODEL,
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `
Aşağıdaki kişisel bilgileri sansürlenmiş banka harcama listesindeki HER sourceId için kategori ve taksit bilgisini belirle.

Hiçbir sourceId'yi atlama.

İŞLEMLER:

${JSON.stringify(
    input,
    null,
    2
)}
`,
                            },
                        ],
                    },
                ],
                config: {
                    systemInstruction:
                        SPREADSHEET_SYSTEM_INSTRUCTION,
                    temperature: 0,
                    maxOutputTokens: 16384,
                    thinkingConfig: {
                        thinkingLevel: ThinkingLevel.LOW,
                    },
                    responseMimeType:
                        "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                sourceId: {
                                    type: Type.NUMBER,
                                },
                                category: {
                                    type: Type.STRING,
                                    enum: CATEGORIES,
                                },
                                installment: {
                                    type: Type.STRING,
                                    nullable: true,
                                },
                            },
                            required: [
                                "sourceId",
                                "category",
                            ],
                        },
                    },
                },
            });

        const text = response.text;

        if (!text) {
            console.error(
                "Gemini classification returned empty response"
            );
            continue;
        }

        try {
            const parsed =
                JSON.parse(text) as ClassifiedExpense[];

            if (Array.isArray(parsed)) {
                results.push(...parsed);
            }
        } catch (error) {
            console.error(
                "Gemini classification JSON parse error:",
                error
            );
        }
    }

    return {
        classifications: results,
        redactionSummary: mergeRedactionSummaries(...summaries),
    };
}

// ---------- Gemini: Redacted PDF Text Extraction ----------

async function extractFromRedactedPdfText(
    ai: GoogleGenAI,
    redactedText: string
): Promise<ExtractResult> {
    const response = await callGeminiWithRetry(ai, {
        model: GEMINI_MODEL,
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `
Aşağıdaki metin bir banka/kredi kartı PDF ekstresinden çıkarılmış ve kişisel bilgiler sansürlenmiştir.
TÜM sayfalardaki gerçek harcama ve nakit çekim hareketlerini ayıkla.

Özellikle:
- İlk sayfalardaki işlemleri atlama.
- Son sayfadaki işlemlerle sınırlı kalma.
- Birden fazla ay varsa tüm ayları işle.
- Tüm gerçek harcamaları expenses dizisine dahil et.

EKSTRE METNİ (SANSÜRLENMİŞ):

${redactedText}
`,
                    },
                ],
            },
        ],
        config: {
            systemInstruction: REDACTED_PDF_TEXT_SYSTEM_INSTRUCTION,
            temperature: 0,
            maxOutputTokens: 65536,
            thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
            },
            responseMimeType: "application/json",
            responseSchema: EXTRACT_RESULT_SCHEMA,
        },
    });

    const text = response.text;

    if (!text) {
        throw new Error("No response from AI model");
    }

    return JSON.parse(text) as ExtractResult;
}

// ---------- Gemini: Image Extraction (EXIF-stripped & Client-Redacted) ----------

async function extractFromImage(
    ai: GoogleGenAI,
    mimeType: string,
    imageBuffer: Buffer
): Promise<ExtractResult> {
    const cleanedBuffer = stripImageMetadata(imageBuffer, mimeType);
    const base64Data = cleanedBuffer.toString("base64");

    const response =
        await callGeminiWithRetry(ai, {
            model: GEMINI_MODEL,
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType,
                                data: base64Data,
                            },
                        },
                        {
                            text: `
Bu görseldeki banka/kredi kartı hareketlerinin TAMAMINI incele.

Özellikle:
- Karartılmış/sansürlenmiş kişisel bilgi alanlarını yoksay.
- Birden fazla ay varsa tüm ayları işle.
- Tüm gerçek harcamaları expenses dizisine dahil et.

Sadece gerçek harcama ve çekim işlemlerini çıkar.
`,
                        },
                    ],
                },
            ],
            config: {
                systemInstruction: IMAGE_SYSTEM_INSTRUCTION,
                temperature: 0,
                maxOutputTokens: 65536,
                thinkingConfig: {
                    thinkingLevel: ThinkingLevel.LOW,
                },
                responseMimeType: "application/json",
                responseSchema: EXTRACT_RESULT_SCHEMA,
            },
        });

    const text = response.text;

    if (!text) {
        throw new Error(
            "No response from AI model"
        );
    }

    const parsed =
        JSON.parse(text) as ExtractResult;

    return parsed;
}

function parseCustomRedactTerms(raw: FormDataEntryValue | null): string[] {
    if (typeof raw !== "string" || !raw.trim()) {
        return [];
    }

    return raw
        .split(/[,;\n]/)
        .map((term) => term.trim())
        .filter((term) => term.length >= 3);
}

// ---------- POST ----------

export async function POST(
    request: NextRequest
) {
    try {
        // ---------- Auth ----------

        const authToken = extractAuthToken(request);

        const isValid =
            await validateSession(
                authToken
            );

        if (!isValid) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        // ---------- API Key ----------

        const apiKey =
            process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    error:
                        "GEMINI_API_KEY is not configured",
                },
                {
                    status: 500,
                }
            );
        }

        // ---------- File ----------

        const formData =
            await request.formData();

        const file =
            formData.get("file");

        const customRedactTerms = parseCustomRedactTerms(
            formData.get("customRedactTerms")
        );

        const clientRedactedRegions = Number(
            formData.get("redactedRegionsCount") || 0
        );

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    error:
                        "No file provided",
                },
                {
                    status: 400,
                }
            );
        }

        // ---------- Size ----------

        if (
            file.size >
            MAX_FILE_SIZE
        ) {
            return NextResponse.json(
                {
                    error:
                        "File size exceeds 20MB limit",
                },
                {
                    status: 400,
                }
            );
        }

        // ---------- File Type ----------

        const imageTypes = [
            "image/png",
            "image/jpeg",
            "image/webp",
        ];

        const pdfTypes = [
            "application/pdf",
        ];

        const spreadsheetTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/octet-stream",
        ];

        const fileName =
            file.name
                ?.toLowerCase() || "";

        const isSpreadsheetByExtension =
            fileName.endsWith(".xls") ||
            fileName.endsWith(".xlsx");

        const isSpreadsheet =
            spreadsheetTypes.includes(
                file.type
            ) ||
            isSpreadsheetByExtension;

        const isImage =
            imageTypes.includes(
                file.type
            );

        const isPdf =
            pdfTypes.includes(
                file.type
            ) || fileName.endsWith(".pdf");

        if (
            !isSpreadsheet &&
            !isImage &&
            !isPdf
        ) {
            return NextResponse.json(
                {
                    error:
                        "Unsupported file type. Use PNG, JPG, WEBP, PDF, XLS or XLSX.",
                },
                {
                    status: 400,
                }
            );
        }

        // ---------- Read File ----------

        const arrayBuffer =
            await file.arrayBuffer();

        const ai =
            new GoogleGenAI({
                apiKey,
            });

        // ==========================================================
        // XLS / XLSX (Yerel parse + PII sansürleme sonrası AI sınıflandırma)
        // ==========================================================

        if (isSpreadsheet) {
            let parsedExpenses: ParsedSpreadsheetExpense[];
            let period: string;
            let headerSensitiveTerms: string[];

            try {
                const parsed = await parseSpreadsheet(arrayBuffer);
                parsedExpenses = parsed.expenses;
                period = parsed.period;
                headerSensitiveTerms = parsed.headerSensitiveTerms;
            } catch (err) {
                console.error("[Expense Extract] ExcelJS parse error:", err);
                return NextResponse.json(
                    {
                        error: fileName.endsWith(".xls")
                            ? "Eski .xls formatı desteklenmiyor. Lütfen dosyayı .xlsx olarak kaydedip tekrar yükleyin."
                            : "Excel dosyası okunamadı. Geçerli bir .xlsx dosyası olduğundan emin olun.",
                    },
                    { status: 400 }
                );
            }

            console.log(
                `[Expense Extract] Parsed spreadsheet: ${parsedExpenses.length} expense transactions`
            );

            if (
                parsedExpenses.length ===
                0
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Excel dosyasında gerçek harcama işlemi bulunamadı.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const extraSensitiveTerms = [
                ...customRedactTerms,
                ...headerSensitiveTerms,
            ];

            // Gemini'ye sadece kişisel bilgileri sansürlenmiş açıklamalar gider;
            // Gemini yalnızca kategori/taksit belirler.
            const { classifications, redactionSummary } =
                await classifySpreadsheetExpenses(
                    ai,
                    parsedExpenses,
                    extraSensitiveTerms
                );

            const classificationMap =
                new Map<
                    number,
                    ClassifiedExpense
                >();

            for (
                const classification of classifications
            ) {
                classificationMap.set(
                    classification.sourceId,
                    classification
                );
            }

            // Çok önemli:
            // Gemini bir satırı atlamış olsa bile
            // o harcama kaybolmuyor.
            // Varsayılan kategori "Diğer".
            const finalExpenses =
                parsedExpenses.map(
                    (expense) => {
                        const classification =
                            classificationMap.get(
                                expense.sourceId
                            );

                        const category =
                            classification &&
                            isExpenseCategory(
                                classification.category
                            )
                                ? classification.category
                                : "Diğer";

                        const installment =
                            classification
                                ?.installment ||
                            null;

                        return {
                            date: expense.date,
                            description:
                                expense.description,
                            amount: expense.amount,
                            category,
                            installment,
                        };
                    }
                );

            return NextResponse.json({
                success: true,
                data: {
                    period,
                    expenses:
                        finalExpenses,
                },
                redaction: {
                    applied: true,
                    method: "spreadsheet_text_redaction",
                    summary: redactionSummary,
                },
            });
        }

        // ==========================================================
        // PDF (Yerel metin çıkarımı + PII sansürleme -> ham PDF AI'ya gitmez)
        // ==========================================================

        if (isPdf) {
            const { text: rawPdfText, totalPages } =
                await extractPdfTextStructured(arrayBuffer);

            const meaningfulTextLength = rawPdfText
                .replace(/--- SAYFA \d+ ---/g, "")
                .replace(/\s+/g, "").length;

            if (meaningfulTextLength < 30) {
                return NextResponse.json(
                    {
                        error:
                            "Bu PDF metin katmanı içermiyor (taranmış görsel). Kişisel bilgilerinizi korumak için ham PDF AI'ya gönderilmedi. Bankanızdan metin tabanlı PDF/Excel ekstresi indirin veya ekran görüntüsü alıp görsel sansürleme aracıyla yükleyin.",
                    },
                    {
                        status: 422,
                    }
                );
            }

            const labeledTerms =
                extractSensitiveTermsFromLabeledText(rawPdfText);
            const extraSensitiveTerms = [
                ...customRedactTerms,
                ...labeledTerms,
            ];

            const { text: redactedPdfText, summary: redactionSummary } =
                redactPiiText(rawPdfText, {
                    extraSensitiveTerms,
                });

            console.log(
                `[Expense Extract] Extracted & redacted PDF (${totalPages} pages, ${redactionSummary.totalRedactions} PII items redacted)`
            );

            const result = await extractFromRedactedPdfText(
                ai,
                redactedPdfText
            );

            return NextResponse.json({
                success: true,
                data: result,
                redaction: {
                    applied: true,
                    method: "pdf_text_redaction",
                    summary: redactionSummary,
                },
            });
        }

        // ==========================================================
        // IMAGE (EXIF/Metadata temizliği + İstemci görsel sansürü)
        // ==========================================================

        if (isImage) {
            console.log(
                `[Expense Extract] Sending metadata-stripped image to Gemini (clientRedactedRegions=${clientRedactedRegions})`
            );

            const result = await extractFromImage(
                ai,
                file.type,
                Buffer.from(arrayBuffer)
            );

            return NextResponse.json({
                success: true,
                data: result,
                redaction: {
                    applied: true,
                    method: "image_visual_and_metadata_redaction",
                    redactedRegionsCount: clientRedactedRegions,
                    metadataStripped: true,
                },
            });
        }

        // Bu noktaya normalde ulaşılmaz.
        return NextResponse.json(
            {
                error:
                    "Unsupported file type",
            },
            {
                status: 400,
            }
        );
    } catch (error) {
        console.error(
            "Error extracting expenses:",
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : "Unknown error";

        return NextResponse.json(
            {
                error: `Failed to extract expenses: ${message}`,
            },
            {
                status: 500,
            }
        );
    }
}
