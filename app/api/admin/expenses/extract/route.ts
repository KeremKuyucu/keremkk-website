import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { GoogleGenAI, Type } from "@google/genai";
import * as XLSX from "xlsx";

// ---------- Config ----------
const GEMINI_MODEL = "gemini-2.5-flash";

const CATEGORIES = [
    "Market",
    "Yeme-İçme",
    "Akaryakıt",
    "Teknoloji",
    "Fatura",
    "Giyim",
    "Ulaşım",
    "Sağlık",
    "Eğlence",
    "Eğitim",
    "Diğer",
];

const SYSTEM_INSTRUCTION = `Sen bir kredi kartı ve banka ekstresi ayrıştırma uzmanısın.

Sana verilen görsel, PDF veya tablo verisindeki harcama kalemlerini ayıkla.

KURALLAR:
- Sadece harcama ve çekim işlemlerini dahil et.
- Karta yapılan borç ödemelerini, hesaba transferleri, artı bakiye hareketlerini ve iade işlemlerini DAHİL ETME.
- Yıl bilgisi eksikse, dönemin yılını kullan.
- Tutarları her zaman pozitif sayı olarak yaz.
- Taksit bilgisi yoksa installment null olsun (örn: "2/6" formatında yaz).
- Tarih formatı: YYYY-MM-DD
- Dönem (period) formatı: YYYY-MM (ekstrenin ait olduğu ay)`;

// ---------- POST: Dosyadan harcama ayıkla ----------
export async function POST(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);

        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured" },
                { status: 500 }
            );
        }

        // multipart/form-data'dan dosyayı al
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Dosya tipi kontrolü
        const imageTypes = [
            "image/png",
            "image/jpeg",
            "image/webp",
            "application/pdf",
        ];
        const spreadsheetTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        const allAllowedTypes = [...imageTypes, ...spreadsheetTypes];

        // Bazı tarayıcılar .xls dosyalarını boş MIME ile gönderebilir
        const fileName = file.name?.toLowerCase() || "";
        const isSpreadsheetByExtension = fileName.endsWith(".xls") || fileName.endsWith(".xlsx");
        const isAllowed = allAllowedTypes.includes(file.type) || isSpreadsheetByExtension;

        if (!isAllowed) {
            return NextResponse.json(
                { error: "Unsupported file type. Use PNG, JPG, WEBP, PDF, XLS or XLSX." },
                { status: 400 }
            );
        }

        const isSpreadsheet = spreadsheetTypes.includes(file.type) || isSpreadsheetByExtension;

        // Dosya boyutu kontrolü (20MB)
        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File size exceeds 20MB limit" },
                { status: 400 }
            );
        }

        // Dosyayı oku
        const arrayBuffer = await file.arrayBuffer();

        // Google GenAI ile ayrıştır
        const ai = new GoogleGenAI({ apiKey });

        // XLS/XLSX ise parse et, değilse base64 olarak gönder
        let contentParts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }>;

        if (isSpreadsheet) {
            // xlsx ile parse et ve metin tablosuna çevir
            const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
            let allSheetsText = "";

            for (const sheetName of workbook.SheetNames) {
                const sheet = workbook.Sheets[sheetName];
                const csv = XLSX.utils.sheet_to_csv(sheet, { FS: " | ", strip: true });
                allSheetsText += `--- Sayfa: ${sheetName} ---\n${csv}\n\n`;
            }

            contentParts = [
                {
                    text: `Bu banka/kredi kartı ekstresi tablo verisi:\n\n${allSheetsText}\n\nYukarıdaki tablo verisindeki harcama kalemlerini ayıkla.`,
                },
            ];
        } else {
            const base64Data = Buffer.from(arrayBuffer).toString("base64");
            contentParts = [
                {
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data,
                    },
                },
                {
                    text: "Bu kredi kartı/banka ekstresindeki harcama kalemlerini ayıkla.",
                },
            ];
        }

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {
                    role: "user",
                    parts: contentParts,
                },
            ],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0,
                maxOutputTokens: 65536,
                thinkingConfig: {
                    thinkingBudget: 1024,
                },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        period: {
                            type: Type.STRING,
                            description: "Ekstre dönemi, YYYY-MM formatında",
                        },
                        expenses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: {
                                        type: Type.STRING,
                                        description: "İşlem tarihi, YYYY-MM-DD formatında",
                                    },
                                    description: {
                                        type: Type.STRING,
                                        description: "İşlem açıklaması",
                                    },
                                    amount: {
                                        type: Type.NUMBER,
                                        description: "İşlem tutarı (pozitif sayı)",
                                    },
                                    category: {
                                        type: Type.STRING,
                                        enum: CATEGORIES,
                                        description: "Harcama kategorisi",
                                    },
                                    installment: {
                                        type: Type.STRING,
                                        description: "Taksit bilgisi (varsa)",
                                        nullable: true,
                                    },
                                },
                                required: ["date", "description", "amount", "category"],
                            },
                        },
                    },
                    required: ["period", "expenses"],
                },
            },
        });

        const text = response.text;

        if (!text) {
            return NextResponse.json(
                { error: "No response from AI model" },
                { status: 500 }
            );
        }

        const parsed = JSON.parse(text);

        return NextResponse.json({
            success: true,
            data: parsed,
        });
    } catch (error) {
        console.error("Error extracting expenses:", error);
        const message =
            error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to extract expenses: ${message}` },
            { status: 500 }
        );
    }
}