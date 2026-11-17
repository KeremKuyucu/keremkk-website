import { NextRequest, NextResponse } from "next/server";
import { validateSession, extractAuthToken } from "@/lib/server-utils";
import { GoogleGenAI } from "@google/genai";

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
        const { appName, metrics, topEvents, topPlatforms, dailyTrend, topCountries, topPages } = body;

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
Sen üst düzey bir Ürün Yöneticisi ve Veri Analitiği Uzmanısın (Principal Product & Telemetry Analyst).
Aşağıda Kerem'in çoklu uygulama ekosisteminden (Web siteleri, mobil uygulamalar, oyunlar ve backend servisleri) toplanan gerçek telemetri ve analitik verileri yer almaktadır.

Analiz Edilen Kapsam: ${appName === "all" ? "TÜM UYGULAMALAR (Global Hub)" : `Uygulama: ${appName}`}

Özet Metrikler:
- Toplam Olay Sayısı: ${metrics?.totalLogs || 0}
- Tekil Kullanıcı Sayısı (Total / Bugün): ${metrics?.uniqueUsersAll || 0} / ${metrics?.uniqueUsersToday || 0}
- Tekil IP Sayısı: ${metrics?.uniqueIPs || 0}
- Uygulama Açılış Sayısı: ${metrics?.totalAppOpensAll || 0}
- Lider Platform: ${JSON.stringify(topPlatforms || [])}
- En Çok Tetiklenen Olaylar: ${JSON.stringify(topEvents || [])}
- Son Günlerin Aktivite Trendi: ${JSON.stringify(dailyTrend || [])}
- Ziyaretçi Ülkeleri: ${JSON.stringify(topCountries || [])}
${topPages && topPages.length > 0 ? `- En Çok Ziyaret Edilen Sayfalar: ${JSON.stringify(topPages)}` : ""}

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
            generatedAt: new Date().toISOString()
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
