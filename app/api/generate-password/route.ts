import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { generateWordlistPassword, getWordlistStats, GeneratePasswordOptions } from "@/lib/wordlist";

// Standard CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

function applyRateLimit(request: Request): {
    headers: Record<string, string>;
    limitedResponse?: NextResponse;
} {
    const clientIp = getClientIp(request);
    const rateResult = checkRateLimit(`wordlist_api_${clientIp}`, 60, 60_000);

    const headers: Record<string, string> = {
        ...corsHeaders,
        "X-RateLimit-Limit": "60",
        "X-RateLimit-Remaining": rateResult.remaining.toString(),
        "X-RateLimit-Reset": rateResult.resetAt.toString(),
    };

    if (!rateResult.allowed) {
        return {
            headers,
            limitedResponse: NextResponse.json(
                {
                    error: "İstek limiti aşıldı. Dakikada maksimum 60 istek gönderebilirsiniz.",
                    retryAfter: rateResult.retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        ...headers,
                        "Retry-After": rateResult.retryAfter.toString(),
                    },
                }
            ),
        };
    }

    return { headers };
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

/**
 * GET: API Documentation, usage guide, dictionary statistics, and rate-limit info.
 */
export async function GET(request: Request) {
    const { headers: rateLimitHeaders, limitedResponse } = applyRateLimit(request);
    if (limitedResponse) return limitedResponse;

    try {
        const stats = await getWordlistStats();

        return NextResponse.json(
            {
                service: "Türkçe Kelime Listesi Güvenli Şifre Oluşturucu API",
                version: "1.0.0",
                endpoint: "/api/generate-password",
                rateLimit: {
                    limit: 60,
                    window: "1 dakika (60 saniye)",
                },
                stats,
                usage: {
                    method: "POST",
                    contentType: "application/json",
                    parameters: {
                        wordCount: "number (1-20, varsayılan: 3) - Kaç kelime seçilecek",
                        wordLengths: "number[] (3-10, varsayılan: [5, 6, 7]) - Kelime uzunlukları",
                        separator: "string (varsayılan: '-') - Kelime ayırıcı karakter",
                        capitalize: "'none' | 'first' | 'all' | 'random' (varsayılan: 'none')",
                        includeNumber: "boolean (varsayılan: false) - Sona rastgele sayı ekler",
                        count: "number (1-50, varsayılan: 1) - Tek seferde üretilecek şifre adedi",
                    },
                    samplePayload: {
                        wordCount: 3,
                        wordLengths: [5, 6, 7],
                        separator: "-",
                        capitalize: "first",
                        includeNumber: true,
                        count: 1,
                    },
                },
            },
            {
                status: 200,
                headers: rateLimitHeaders,
            }
        );
    } catch (error) {
        console.error("GET /api/generate-password error:", error);
        return NextResponse.json(
            { error: "API bilgisi yüklenirken bir hata oluştu" },
            { status: 500, headers: corsHeaders }
        );
    }
}

/**
 * POST: Generate Turkish wordlist password(s)
 */
export async function POST(request: Request) {
    let body: any = {};
    try {
        body = await request.json();
    } catch {
        // Body might be empty or invalid JSON, will use defaults
    }

    const { headers: rateLimitHeaders, limitedResponse } = applyRateLimit(request);
    if (limitedResponse) return limitedResponse;

    // Generate Password
    try {
        const options: GeneratePasswordOptions = {
            wordCount: typeof body.wordCount === "number" ? body.wordCount : 3,
            wordLengths: Array.isArray(body.wordLengths) ? body.wordLengths : [5, 6, 7],
            separator: typeof body.separator === "string" ? body.separator : "-",
            capitalize: body.capitalize || "none",
            includeNumber: Boolean(body.includeNumber),
            count: typeof body.count === "number" ? body.count : 1,
        };

        const result = await generateWordlistPassword(options);

        return NextResponse.json(
            result,
            {
                status: 200,
                headers: rateLimitHeaders,
            }
        );
    } catch (error: any) {
        console.error("POST /api/generate-password error:", error);
        return NextResponse.json(
            {
                error: error.message || "Şifre oluşturulurken bir hata oluştu",
            },
            {
                status: 400,
                headers: rateLimitHeaders,
            }
        );
    }
}
