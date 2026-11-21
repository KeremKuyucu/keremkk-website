import { NextRequest, NextResponse } from "next/server";
import { validateSession, extractAuthToken } from "@/lib/server-utils";
import { GoogleGenAI } from "@google/genai";
import { redactPiiObject } from "@/lib/pii-redactor";

function toFiniteNumber(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function toSafeString(value: unknown, maxLen = 160): string {
    if (typeof value !== "string") return "";
    return value.trim().slice(0, maxLen);
}

/**
 * URL path içindeki query string değerlerini ve hassas segmentleri temizler.
 * Örn: /reset?email=a@b.com&id=123 -> /reset?email=[GIZLI]&id=[GIZLI]
 */
function sanitizeAnalyticsPath(rawPath: string): string {
    const trimmed = toSafeString(rawPath, 240);
    if (!trimmed) return "/";

    const [pathOnly, queryPart] = trimmed.split("?");
    if (!queryPart) {
        return pathOnly;
    }

    const sanitizedParams = queryPart
        .split("&")
        .filter(Boolean)
        .map((pair) => {
            const eqIdx = pair.indexOf("=");
            if (eqIdx === -1) return "[GIZLI]";
            const key = pair.slice(0, eqIdx).slice(0, 40);
            return `${key}=[GIZLI]`;
        })
        .join("&");

    return sanitizedParams ? `${pathOnly}?${sanitizedParams}` : pathOnly;
}

export async function POST(request: NextRequest) {
    const token = extractAuthToken(request);
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "GEMINI_API_KEY ortam değişkeni bulunamadı." },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();

        // Yalnızca toplu (aggregate) analitik alanlarını kabul et — ham kullanıcı/log/IP/e-posta alanlarını dışarıda bırak.
        const rawWhitelistedPayload = {
            appName: toSafeString(body?.appName || "all", 80),
            metrics: {
                totalLogs: toFiniteNumber(body?.metrics?.totalLogs),
                uniqueUsersAll: toFiniteNumber(body?.metrics?.uniqueUsersAll),
                uniqueUsersToday: toFiniteNumber(body?.metrics?.uniqueUsersToday),
                uniqueIPs: toFiniteNumber(body?.metrics?.uniqueIPs),
                totalAppOpensAll: toFiniteNumber(body?.metrics?.totalAppOpensAll),
            },
            topPlatforms: Array.isArray(body?.topPlatforms)
                ? body.topPlatforms.slice(0, 10).map((item: Record<string, unknown>) => ({
                      platform: toSafeString(item?.platform, 60),
                      count: toFiniteNumber(item?.count),
                      percentage: toFiniteNumber(item?.percentage),
                  }))
                : [],
            topEvents: Array.isArray(body?.topEvents)
                ? body.topEvents.slice(0, 15).map((item: Record<string, unknown>) => ({
                      event: toSafeString(item?.event, 100),
                      count: toFiniteNumber(item?.count),
                      percentage: toFiniteNumber(item?.percentage),
                  }))
                : [],
            dailyTrend: Array.isArray(body?.dailyTrend)
                ? body.dailyTrend.slice(0, 31).map((item: Record<string, unknown>) => ({
                      date: toSafeString(item?.date, 20),
                      label: toSafeString(item?.label, 30),
                      count: toFiniteNumber(item?.count),
                      uniqueUsers: toFiniteNumber(item?.uniqueUsers),
                      percentage: toFiniteNumber(item?.percentage),
                  }))
                : [],
            topCountries: Array.isArray(body?.topCountries)
                ? body.topCountries.slice(0, 15).map((item: Record<string, unknown>) => ({
                      code: toSafeString(item?.code, 10),
                      name: toSafeString(item?.name, 60),
                      count: toFiniteNumber(item?.count),
                  }))
                : [],
            topPages: Array.isArray(body?.topPages)
                ? body.topPages.slice(0, 15).map((item: Record<string, unknown>) => ({
                      path: sanitizeAnalyticsPath(String(item?.path || "")),
                      count: toFiniteNumber(item?.count),
                      percentage: toFiniteNumber(item?.percentage),
                  }))
                : [],
        };

        // Tüm string alanlardaki olası kişisel verileri (e-posta, IP, telefon, UUID, token, IBAN, TCKN vb.) sansürle.
        const { data: sanitizedPayload, summary: redactionSummary } = redactPiiObject(
            rawWhitelistedPayload,
            {
                redactUuids: true,
                redactUrlQueryParams: true,
            }
        );

        const {
            appName,
            metrics,
            topEvents,
            topPlatforms,
            dailyTrend,
            topCountries,
            topPages,
        } = sanitizedPayload;

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
Sen üst düzey bir Ürün Yöneticisi ve Veri Analitiği Uzmanısın (Principal Product & Telemetry Analyst).
Aşağıda çoklu uygulama ekosisteminden (Web siteleri, mobil uygulamalar, oyunlar ve backend servisleri) toplanan anonimleştirilmiş ve kişisel verilerden arındırılmış toplu telemetri ve analitik verileri yer almaktadır.

Analiz Edilen Kapsam: ${appName === "all" ? "TÜM UYGULAMALAR (Global Hub)" : `Uygulama: ${appName}`}

Özet Metrikler:
- Toplam Olay Sayısı: ${metrics.totalLogs}
- Tekil Kullanıcı Sayısı (Total / Bugün): ${metrics.uniqueUsersAll} / ${metrics.uniqueUsersToday}
- Tekil IP Sayısı: ${metrics.uniqueIPs}
- Uygulama Açılış Sayısı: ${metrics.totalAppOpensAll}
- Lider Platform: ${JSON.stringify(topPlatforms)}
- En Çok Tetiklenen Olaylar: ${JSON.stringify(topEvents)}
- Son Günlerin Aktivite Trendi: ${JSON.stringify(dailyTrend)}
- Ziyaretçi Ülkeleri: ${JSON.stringify(topCountries)}
${topPages.length > 0 ? `- En Çok Ziyaret Edilen Sayfalar: ${JSON.stringify(topPages)}` : ""}

GÖREV:
Bu verileri derinlemesine analiz et ve geliştirici/ürün sahibi için doğrudan aksiyona dökülebilir, Türkçe, son derece profesyonel, yapıcı ve stratejik bir içgörü raporu hazırla.

Yanıtını aşağıdaki 4 ana başlık altında Markdown formatında sun:

### 1. 📊 Yönetici Özeti & Büyüme Trendi
Genel kullanıcı hacmi, aktivite ivmesi ve büyüme sinyallerinin kısa, vurucu özeti.

### 2. 🚀 Öne Çıkan Bulgular & Kullanıcı Davranışı
Kullanıcıların en çok hangi platformda, hangi olaylarda yoğunlaştığı, öne çıkan özellikler.

### 3. ⚠️ Kritik Noktalar & Anomaliler
Trafikteki dalgalanmalar, cihaz/platform dengesizliği veya dikkat edilmesi gereken potansiyel riskler.

### 4. 💡 Stratejik Aksiyon & Geliştirme Önerileri
Geliştiricinin ürünleri büyütmek, performansı veya kullanıcı tutundurmasını (retention) artırmak için atabileceği 2-3 somut adım.

NOT: Çok uzun ve boğucu paragraflardan kaçın. Okunması kolay maddeler, kısa paragraflar ve kalın (bold) anahtar kelimeler kullan.
`;

        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-3.5-flash-lite",
            "gemini-1.5-flash",
            "gemini-2.5-pro"
        ];

        let result = null;
        let lastError: Error | null = null;

        for (const model of candidateModels) {
            try {
                result = await ai.models.generateContent({
                    model,
                    contents: prompt,
                });
                if (result?.text) break;
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                console.warn(`[Analytics AI] Model ${model} failed, trying next...`, lastError.message);
            }
        }

        if (!result || !result.text) {
            throw lastError || new Error("Gemini yanıt üretemedi.");
        }

        return NextResponse.json({
            success: true,
            insights: result.text,
            generatedAt: new Date().toISOString(),
            redaction: {
                applied: true,
                summary: redactionSummary,
            },
        });

    } catch (error) {
        console.error("AI Insights error:", error);
        const errorMsg = error instanceof Error ? error.message : "AI analiz raporu oluşturulurken bir hata oluştu.";
        return NextResponse.json(
            { error: errorMsg },
            { status: 500 }
        );
    }
}
