import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getCorsHeaders(origin: string | null) {
    let allowedOrigin = "https://keremkk.com.tr";

    if (origin) {
        try {
            const hostname = new URL(origin).hostname;

            if (
                hostname === "keremkk.com.tr" ||
                hostname.endsWith(".keremkk.com.tr") ||
                hostname === "localhost" ||
                hostname === "127.0.0.1"
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
        const body = await request.json();

        const {
            uid,
            event,
            platform,
            app,
            message,
            stackTrace,
            metadata,
        } = body;

        // Required fields
        if (!uid || !event || !platform || !app || !message) {
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
        const safeStackTrace = stackTrace
            ? String(stackTrace).slice(0, 10000)
            : null;

        let parsedMetadata: any = null;
        if (metadata !== undefined && metadata !== null) {
            if (typeof metadata === "object") {
                parsedMetadata = metadata;
            } else if (typeof metadata === "string") {
                try {
                    parsedMetadata = JSON.parse(metadata);
                } catch {
                    parsedMetadata = { raw: metadata };
                }
            }
        }

        const supabase = createAdminClient();

        const { error: dbError } = await supabase
            .from("app_error_logs")
            .insert([
                {
                    uid: String(uid).slice(0, 200),
                    app_name: String(app).slice(0, 100),
                    platform: String(platform).slice(0, 50),
                    event: String(event).slice(0, 150),
                    message: safeMessage,
                    stack_trace: safeStackTrace,
                    metadata: parsedMetadata,
                    ip_address: String(ipAddress).slice(0, 150),
                    user_agent: String(userAgent).slice(0, 500),
                    timestamp: serverNow,
                },
            ]);

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