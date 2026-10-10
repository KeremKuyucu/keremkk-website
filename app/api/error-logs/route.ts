import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getCorsHeaders(origin: string | null) {
    let allowedOrigin = "https://keremkk.com.tr";

    if (origin) {
        try {
            const hostname = new URL(origin).hostname;

            if (
                hostname === "keremkk.com.tr" ||
                hostname.endsWith(".keremkk.com.tr")
            ) {
                allowedOrigin = origin;
            }
        } catch {
            // Invalid origin, use default
        }
    }

    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}

export async function POST(request: Request) {
    const origin = request.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    try {
        let body: any;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body" },
                { status: 400, headers: corsHeaders }
            );
        }

        const {
            uid,
            event,
            platform,
            app,
            app_name,
            message,
            stackTrace,
            stack_trace,
            metadata,
            app_version,
            is_debug,
            timestamp,
            ...rest
        } = body || {};

        const targetApp = app || app_name;
        const rawStackTrace = stackTrace !== undefined ? stackTrace : stack_trace;

        // Required fields
        if (!uid || !event || !platform || !targetApp || !message) {
            return NextResponse.json(
                { error: "Missing required fields (uid, event, platform, app, message)" },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // Get request information
        const ipAddress =
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown";

        const userAgent =
            request.headers.get("user-agent") ||
            "unknown";

        // Always use authoritative server time to prevent clock skew / exploits
        const serverNow = new Date().toISOString();

        // Safely format strings & metadata
        const safeMessage = String(message).slice(0, 5000);
        const safeStackTrace = rawStackTrace
            ? String(rawStackTrace).slice(0, 10000)
            : null;

        let parsedMetadata: Record<string, any> = {};
        if (metadata !== undefined && metadata !== null) {
            if (typeof metadata === "object" && !Array.isArray(metadata)) {
                parsedMetadata = { ...metadata };
            } else if (typeof metadata === "string") {
                try {
                    parsedMetadata = JSON.parse(metadata);
                } catch {
                    parsedMetadata = { raw: metadata };
                }
            }
        }

        if (app_version !== undefined && app_version !== null) {
            parsedMetadata.app_version = String(app_version).slice(0, 50);
        }
        if (is_debug !== undefined && is_debug !== null) {
            parsedMetadata.is_debug = Boolean(is_debug);
        }
        if (timestamp) {
            parsedMetadata.client_timestamp = String(timestamp).slice(0, 50);
        }

        // Capture any additional properties passed in the root body
        for (const [key, value] of Object.entries(rest)) {
            if (value !== undefined && value !== null) {
                parsedMetadata[key] = value;
            }
        }

        const baseRecord = {
            uid: String(uid).slice(0, 200),
            app_name: String(targetApp).slice(0, 100),
            platform: String(platform).slice(0, 50),
            event: String(event).slice(0, 150),
            message: safeMessage,
            stack_trace: safeStackTrace,
            ip_address: String(ipAddress).slice(0, 150),
            user_agent: String(userAgent).slice(0, 500),
            timestamp: serverNow,
        };

        const hasMetadata = Object.keys(parsedMetadata).length > 0;
        const supabase = createAdminClient();

        let dbError = null;

        if (hasMetadata) {
            const { error: insertWithMetaError } = await supabase
                .from("app_error_logs")
                .insert([{ ...baseRecord, metadata: parsedMetadata }]);

            if (insertWithMetaError) {
                const isMetadataColumnMissing =
                    insertWithMetaError.code === "PGRST204" ||
                    insertWithMetaError.code === "42703" ||
                    (insertWithMetaError.message &&
                        insertWithMetaError.message.toLowerCase().includes("metadata"));

                if (isMetadataColumnMissing) {
                    console.warn(
                        "app_error_logs tablosunda metadata sütunu bulunamadı. Base hata kaydı kaydediliyor:",
                        insertWithMetaError.message
                    );
                    const { error: fallbackError } = await supabase
                        .from("app_error_logs")
                        .insert([baseRecord]);
                    dbError = fallbackError;
                } else {
                    dbError = insertWithMetaError;
                }
            }
        } else {
            const { error: standardInsertError } = await supabase
                .from("app_error_logs")
                .insert([baseRecord]);
            dbError = standardInsertError;
        }

        if (dbError) {
            console.error("Supabase app_error_logs insert error:", dbError);
            return NextResponse.json(
                { error: "Failed to save error log", details: dbError.message },
                {
                    status: 500,
                    headers: corsHeaders,
                }
            );
        }

        return NextResponse.json(
            { success: true },
            {
                status: 201,
                headers: corsHeaders,
            }
        );
    } catch (error) {
        console.error("Error Logs API error:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            {
                status: 500,
                headers: corsHeaders,
            }
        );
    }
}

export async function OPTIONS(request: Request) {
    const origin = request.headers.get("origin");

    return new NextResponse(null, {
        status: 200,
        headers: getCorsHeaders(origin),
    });
}

/*
================================================================================
 📖 ERROR LOGS API DOKÜMANTASYONU (AGENT & DEVELOPER REHBERİ)
================================================================================

Bu endpoint, mobil/web uygulamalarından (Flutter TelemetryService.sendError vb.) gelen
hata, çökme (crash) ve istisna (exception) raporlarını toplar.

📍 ENDPOINT BİLGİSİ:
  - URL: https://keremkk.com.tr/api/error-logs
  - Metot     : POST
  - Başlıklar : Content-Type: application/json
  - CORS      : keremkk.com.tr ve alt alan adları desteklenir.

--------------------------------------------------------------------------------
📥 REQUEST BODY (JSON ŞEMASI):
--------------------------------------------------------------------------------
{
  "uid": "string",          // [ZORUNLU] Cihaz veya kullanıcı UID'si
  "app": "string",          // [ZORUNLU] Uygulama adı ("geogame" vb.) ("app_name" de geçerlidir)
  "platform": "string",     // [ZORUNLU] Platform adı ("android", "ios", "web", "windows" vb.)
  "event": "string",        // [ZORUNLU] Hata kategorisi / olay adı (Örn: "auth_exception", "api_timeout")
  "message": "string",      // [ZORUNLU] Hata mesajı (max 5000 karakter)
  "stackTrace": "string",   // [OPSİYONEL] Stack trace / çağrı yığını ("stack_trace" de geçerlidir)
  "metadata": object,       // [OPSİYONEL] Ekstra bağlam objesi veya JSON dizesi
  "app_version": "string",  // [OPSİYONEL] Uygulama versiyonu (metadata.app_version olarak kaydedilir)
  "is_debug": boolean,      // [OPSİYONEL] Debug modu (metadata.is_debug olarak kaydedilir)
  "timestamp": "string"     // [OPSİYONEL] Cihaz zamanı (metadata.client_timestamp olarak kaydedilir)
}
*/