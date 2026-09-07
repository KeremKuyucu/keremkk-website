import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { GoogleGenAI, Type } from "@google/genai";
import * as XLSX from "xlsx";
import {
    EXPENSE_CATEGORIES as CATEGORIES,
    isExpenseCategory,
} from "@/lib/expense-categories";

// ---------- Config ----------

const GEMINI_MODEL = "gemini-2.5-flash";

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

const IMAGE_PDF_SYSTEM_INSTRUCTION = `
Sen bir banka ve kredi kartı ekstresi ayrıştırma uzmanısın.

Sana verilen görsel veya PDF içindeki işlem hareketlerini ayıkla.

KURALLAR:

- Dosyanın tamamını incele.
- Sadece son ayı veya son sayfayı inceleme.
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
- Açıklamayı mümkün olduğunca kaynak verideki haliyle koru.
- Her harcamayı aşağıdaki kategorilerden tam olarak biriyle sınıflandır:

${CATEGORIES.join(", ")}

ÇOK ÖNEMLİ:
Kaynak birden fazla ay içeriyorsa sadece belirli bir ayın işlemlerini seçme.
Dosyanın BAŞINDAN SONUNA kadar bütün işlemleri değerlendir.
`;

const SPREADSHEET_SYSTEM_INSTRUCTION = `
Sen banka hesap hareketlerini sınıflandıran bir uzmansın.

Sana kod tarafından zaten tespit edilmiş gerçek harcama işlemleri verilecek.

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

function parseSpreadsheet(
    arrayBuffer: ArrayBuffer
): {
    expenses: ParsedSpreadsheetExpense[];
    period: string;
} {
    const workbook = XLSX.read(
        new Uint8Array(arrayBuffer),
        {
            type: "array",
            cellDates: true,
        }
    );

    const allExpenses: ParsedSpreadsheetExpense[] = [];

    const detectedPeriods = new Set<string>();

    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];

        // Ham satırları al.
        const rows = XLSX.utils.sheet_to_json<
            unknown[]
        >(sheet, {
            header: 1,
            defval: "",
            raw: true,
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
    };
}

// ---------- Gemini: Spreadsheet Classification ----------

async function classifySpreadsheetExpenses(
    ai: GoogleGenAI,
    expenses: ParsedSpreadsheetExpense[]
): Promise<ClassifiedExpense[]> {
    if (expenses.length === 0) {
        return [];
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

    const results: ClassifiedExpense[] =
        [];

    // Chunk'ları sırayla işliyoruz.
    // Böylece çok sayıda eşzamanlı Gemini isteği
    // ile rate limit'e girme ihtimali azalıyor.
    for (const chunk of chunks) {
        const input = chunk.map(
            (expense) => ({
                sourceId: expense.sourceId,
                date: expense.date,
                description:
                    expense.description,
                amount: expense.amount,
            })
        );

        const response =
            await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `
Aşağıdaki banka harcama listesindeki HER sourceId için kategori ve taksit bilgisini belirle.

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
                        thinkingBudget: 512,
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

    return results;
}

// ---------- Gemini: Image/PDF Extraction ----------

async function extractFromImageOrPdf(
    ai: GoogleGenAI,
    file: File,
    arrayBuffer: ArrayBuffer
): Promise<ExtractResult> {
    const base64Data =
        Buffer.from(arrayBuffer).toString(
            "base64"
        );

    const response =
        await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType:
                                    file.type,
                                data: base64Data,
                            },
                        },
                        {
                            text: `
Bu dosyadaki banka/kredi kartı hareketlerinin TAMAMINI incele.

Özellikle:
- İlk sayfalardaki işlemleri atlama.
- Son sayfadaki işlemlerle sınırlı kalma.
- Birden fazla ay varsa tüm ayları işle.
- Tüm gerçek harcamaları expenses dizisine dahil et.

Sadece gerçek harcama ve çekim işlemlerini çıkar.
`,
                        },
                    ],
                },
            ],
            config: {
                systemInstruction:
                    IMAGE_PDF_SYSTEM_INSTRUCTION,
                temperature: 0,
                maxOutputTokens: 65536,
                thinkingConfig: {
                    thinkingBudget: 1024,
                },
                responseMimeType:
                    "application/json",
                responseSchema: {
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
                                        description:
                                            "İşlem tarihi, YYYY-MM-DD",
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
                                required: [
                                    "date",
                                    "description",
                                    "amount",
                                    "category",
                                ],
                            },
                        },
                    },
                    required: [
                        "period",
                        "expenses",
                    ],
                },
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

// ---------- POST ----------

export async function POST(
    request: NextRequest
) {
    try {
        // ---------- Auth ----------

        const authToken =
            request.headers.get(
                "x-auth-token"
            );

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
            );

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
        // XLS / XLSX
        // ==========================================================

        if (isSpreadsheet) {
            console.log(
                `[Expense Extract] Parsing spreadsheet: ${file.name}`
            );

            const {
                expenses: parsedExpenses,
                period,
            } = parseSpreadsheet(
                arrayBuffer
            );

            console.log(
                `[Expense Extract] Found ${parsedExpenses.length} expense transactions`
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

            // Gemini sadece kategori/taksit belirliyor.
            const classifications =
                await classifySpreadsheetExpenses(
                    ai,
                    parsedExpenses
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
            });
        }

        // ==========================================================
        // IMAGE / PDF
        // ==========================================================

        if (isImage || isPdf) {
            console.log(
                `[Expense Extract] Sending ${file.name} to Gemini`
            );

            const result =
                await extractFromImageOrPdf(
                    ai,
                    file,
                    arrayBuffer
                );

            return NextResponse.json({
                success: true,
                data: result,
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
