import { NextResponse } from "next/server";
import { TOTP } from "otpauth";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL_2FA;
const TWO_FA_PASSWORD_HASH = process.env.TWO_FA_PASSWORD;
const TWO_FA_SECRET = process.env.TWO_FA_SECRET;

// --- Discord Webhook Notification ---
async function sendDiscordNotification(
    type: "attempt" | "success" | "totp_request",
    ip: string,
    userAgent: string,
    extra?: string
) {
    if (!DISCORD_WEBHOOK_URL) return;

    const colorMap = {
        attempt: 0xff4444,    // Red for failed attempts
        success: 0x44ff44,    // Green for successful login
        totp_request: 0x4488ff // Blue for TOTP code requests
    };

    const titleMap = {
        attempt: "🔴 2FA Giriş Denemesi (Başarısız)",
        success: "🟢 2FA Giriş Başarılı",
        totp_request: "🔵 TOTP Kod Talebi"
    };

    const embed = {
        title: titleMap[type],
        color: colorMap[type],
        fields: [
            { name: "IP Adresi", value: ip || "Bilinmiyor", inline: true },
            { name: "User Agent", value: (userAgent || "Bilinmiyor").substring(0, 200), inline: false },
            { name: "Tarih", value: new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }), inline: true }
        ],
        footer: { text: "keremkk.com.tr | 2FA Güvenlik" }
    };

    if (extra) {
        embed.fields.push({ name: "Detay", value: extra, inline: false });
    }

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch (err) {
        console.error("Discord webhook error:", err);
    }
}

// --- Get Client IP ---
function getClientIP(request: Request): string {
    const headers = new Headers(request.headers);
    return (
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        headers.get("cf-connecting-ip") ||
        "Bilinmiyor"
    );
}

// --- POST: Authenticate ---
export async function POST(request: Request) {
    try {
        const password = request.headers.get("x-2fa-password");
        const ip = getClientIP(request);
        const ua = request.headers.get("user-agent") ?? "";

        if (!password) {
            await sendDiscordNotification("attempt", ip, ua, "Şifre verilmedi");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Hash the provided password and compare
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        if (hashHex !== TWO_FA_PASSWORD_HASH) {
            await sendDiscordNotification("attempt", ip, ua, `Yanlış şifre girildi`);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Successful login
        await sendDiscordNotification("success", ip, ua);

        // Generate TOTP code
        if (!TWO_FA_SECRET) {
            return NextResponse.json({ error: "TOTP secret not configured" }, { status: 500 });
        }

        const totp = new TOTP({
            secret: TWO_FA_SECRET,
            digits: 6,
            period: 30,
            algorithm: "SHA1"
        });

        const code = totp.generate();
        const remaining = totp.period - (Math.floor(Date.now() / 1000) % totp.period);

        return NextResponse.json({
            success: true,
            code,
            remaining,
            period: totp.period
        });
    } catch (err) {
        console.error("2FA auth error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// --- GET: Refresh TOTP (requires password in header) ---
export async function GET(request: Request) {
    try {
        const password = request.headers.get("x-2fa-password");
        const ip = getClientIP(request);
        const ua = request.headers.get("user-agent") ?? "";

        if (!password || !TWO_FA_PASSWORD_HASH) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify password
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        if (hashHex !== TWO_FA_PASSWORD_HASH) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!TWO_FA_SECRET) {
            return NextResponse.json({ error: "TOTP secret not configured" }, { status: 500 });
        }

        await sendDiscordNotification("totp_request", ip, ua);

        const totp = new TOTP({
            secret: TWO_FA_SECRET,
            digits: 6,
            period: 30,
            algorithm: "SHA1"
        });

        const code = totp.generate();
        const remaining = totp.period - (Math.floor(Date.now() / 1000) % totp.period);

        return NextResponse.json({
            code,
            remaining,
            period: totp.period
        });
    } catch (err) {
        console.error("2FA TOTP refresh error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
