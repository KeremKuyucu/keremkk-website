import { NextResponse } from "next/server";

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
        const body = await request.json();

        const {
            uid,
            timestamp,
            event,
            platform,
            app,
            message,
            stackTrace,
            metadata,
        } = body;

        // Required fields
        if (!uid || !timestamp || !event || !platform || !app || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        const botToken = process.env.BOT_TOKEN;
        const channelId = "1549880972819046561";

        if (!botToken || !channelId) {
            console.error(
                "Discord error logger is not configured. Missing BOT_TOKEN or DISCORD_ERROR_CHANNEL_ID."
            );

            return NextResponse.json(
                { error: "Error logging service is not configured" },
                {
                    status: 500,
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

        // Parse timestamp
        const date = new Date(timestamp);
        const unixTimestamp = isNaN(date.getTime())
            ? Math.floor(Date.now() / 1000)
            : Math.floor(date.getTime() / 1000);

        // Safely convert values to strings
        const safeMessage = String(message).slice(0, 1000);
        const safeStackTrace = stackTrace
            ? String(stackTrace).slice(0, 1000)
            : null;

        // Metadata
        let metadataText: string | null = null;

        if (metadata !== undefined && metadata !== null) {
            try {
                metadataText = JSON.stringify(
                    metadata,
                    null,
                    2
                ).slice(0, 1000);
            } catch {
                metadataText = String(metadata).slice(0, 1000);
            }
        }

        const fields = [
            {
                name: "Event",
                value: `\`${String(event).slice(0, 100)}\``,
                inline: true,
            },
            {
                name: "Platform",
                value: `\`${String(platform).slice(0, 100)}\``,
                inline: true,
            },
            {
                name: "UID",
                value: `\`${String(uid).slice(0, 200)}\``,
                inline: false,
            },
            {
                name: "Message",
                value: `\`\`\`\n${safeMessage}\n\`\`\``,
                inline: false,
            },
            {
                name: "IP",
                value: `\`${String(ipAddress).slice(0, 200)}\``,
                inline: true,
            },
            {
                name: "User Agent",
                value: `\`${String(userAgent).slice(0, 500)}\``,
                inline: false,
            },
            {
                name: "Time",
                value: `<t:${unixTimestamp}:F>`,
                inline: false,
            },
        ];

        if (safeStackTrace) {
            fields.push({
                name: "Stack Trace",
                value: `\`\`\`\n${safeStackTrace}\n\`\`\``,
                inline: false,
            });
        }

        if (metadataText) {
            fields.push({
                name: "Metadata",
                value: `\`\`\`json\n${metadataText}\n\`\`\``,
                inline: false,
            });
        }

        const embed = {
            title: `🔴 ${app} Error`,
            color: 0xff3333,
            fields,
            footer: {
                text: "GeoGame Error Logger",
            },
            timestamp: new Date().toISOString(),
        };

        // Send directly to Discord using the bot
        const discordResponse = await fetch(
            `https://discord.com/api/v10/channels/${channelId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bot ${botToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    embeds: [embed],
                }),
            }
        );

        if (!discordResponse.ok) {
            const discordError = await discordResponse.text();

            console.error(
                "Discord API error:",
                discordResponse.status,
                discordError
            );

            return NextResponse.json(
                {
                    error: "Failed to send error log",
                },
                {
                    status: 502,
                    headers: corsHeaders,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
            },
            {
                status: 201,
                headers: corsHeaders,
            }
        );
    } catch (error) {
        console.error("Error Logs API error:", error);

        return NextResponse.json(
            {
                error: "Internal Server Error",
            },
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