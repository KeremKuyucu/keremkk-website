import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";



// In-memory sliding window rate limiter
// Max 3 contact messages per IP within 5 minutes
const rateLimitMap = new Map<string, { count: number; firstRequestTime: number }>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

function checkRateLimit(ip: string): boolean {
    if (ip === "unknown" || ip === "127.0.0.1" || ip === "::1") return false;

    const now = Date.now();
    const record = rateLimitMap.get(ip);

    // Prune stale records if map grows large
    if (rateLimitMap.size > 500) {
        for (const [key, val] of rateLimitMap.entries()) {
            if (now - val.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
                rateLimitMap.delete(key);
            }
        }
    }

    if (!record) {
        rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
        return false;
    }

    if (now - record.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
        return false;
    }

    record.count += 1;
    return record.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, subject, message, website_url } = body;

        // 1. Honeypot check: If the hidden honeypot field is filled, it's an automated bot
        if (website_url && String(website_url).trim().length > 0) {
            // Silently drop and pretend success to mislead spam bots
            return NextResponse.json({ success: true, message: "Mesajınız başarıyla gönderildi!" });
        }

        // 2. Extract reliable client network & device information from headers
        const rawIp =
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown";
        const ipAddress = rawIp.split(",")[0].trim();
        const userAgent = request.headers.get("user-agent") || "unknown";

        // 3. Rate limiting check (prevent spam floods)
        if (checkRateLimit(ipAddress)) {
            return NextResponse.json(
                { error: "Çok fazla istek gönderdiniz. Lütfen birkaç dakika sonra tekrar deneyin." },
                { status: 429 }
            );
        }

        // 4. Validation
        if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return NextResponse.json(
                { error: "Lütfen tüm alanları doldurun." },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Lütfen geçerli bir e-posta adresi girin." },
                { status: 400 }
            );
        }

        if (name.length > 100 || email.length > 200 || subject.length > 200 || message.length > 5000) {
            return NextResponse.json(
                { error: "Giriş alanları çok uzun." },
                { status: 400 }
            );
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim();
        const cleanSubject = subject.trim();
        const cleanMessage = message.trim();

        // 5. Save to Supabase (with backward compatibility for ip_address column)
        const supabase = createAdminClient();

        let insertError = null;
        const { error: errWithIp } = await supabase.from("contact_messages").insert({
            name: cleanName,
            email: cleanEmail,
            subject: cleanSubject,
            message: cleanMessage,
            user_agent: userAgent,
            ip_address: ipAddress,
            timestamp: Date.now(),
        });

        if (errWithIp) {
            // If ip_address column does not exist yet in contact_messages, fallback without it
            if (errWithIp.message?.includes("ip_address") || errWithIp.code === "42703") {
                const { error: errFallback } = await supabase.from("contact_messages").insert({
                    name: cleanName,
                    email: cleanEmail,
                    subject: cleanSubject,
                    message: cleanMessage,
                    user_agent: userAgent,
                    timestamp: Date.now(),
                });
                insertError = errFallback;
            } else {
                insertError = errWithIp;
            }
        }

        if (insertError) {
            console.error("Supabase contact_messages insert error:", insertError);
            throw insertError;
        }

        // 6. Notifications
        // --- Option A: Resend Email Notification (Direct to Proton Mail / Inbox) ---
        try {
            const emailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e5e7eb;">
                <div style="border-bottom: 2px solid #8b5cf6; padding-bottom: 16px; margin-bottom: 24px;">
                    <h2 style="color: #111827; margin: 0; font-size: 20px; font-weight: 800;">📨 Web Sitenden Yeni İletişim Mesajı</h2>
                    <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">keremkk.com.tr üzerinden yeni bir ziyaretçi formu doldurdu</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 110px;"><strong>Gönderen:</strong></td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: bold;">${escapeHtml(cleanName)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 13px;"><strong>E-posta:</strong></td>
                        <td style="padding: 8px 0; color: #8b5cf6; font-size: 14px; font-weight: bold;">
                            <a href="mailto:${escapeHtml(cleanEmail)}" style="color: #8b5cf6; text-decoration: none;">${escapeHtml(cleanEmail)}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 13px;"><strong>Konu:</strong></td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${escapeHtml(cleanSubject)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 13px;"><strong>IP Adresi:</strong></td>
                        <td style="padding: 8px 0; color: #4b5563; font-size: 13px; font-family: monospace;">${escapeHtml(ipAddress)}</td>
                    </tr>
                </table>

                <div style="background-color: #f9fafb; border-radius: 14px; padding: 20px; border-left: 4px solid #8b5cf6; margin-bottom: 24px;">
                    <p style="color: #6b7280; font-size: 11px; text-transform: uppercase; font-weight: bold; margin: 0 0 8px 0; letter-spacing: 0.5px;">Mesaj:</p>
                    <p style="color: #1f2937; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(cleanMessage)}</p>
                </div>

                <div style="text-align: center; margin: 28px 0;">
                    <a href="mailto:${escapeHtml(cleanEmail)}?subject=Re: ${encodeURIComponent(cleanSubject)}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                        ✉️ ${escapeHtml(cleanName)} Kişisine Yanıt Ver
                    </a>
                </div>

                <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; color: #9ca3af; font-size: 11px;">
                    <span>Cihaz: ${escapeHtml(userAgent.slice(0, 100))}</span> • <span>Tarih: ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</span>
                </div>
            </div>
            `;

            await sendEmail({
                replyTo: cleanEmail,
                subject: `📨 Yeni İletişim Mesajı: ${cleanSubject} (${cleanName})`,
                html: emailHtml,
            });
        } catch (resendErr) {
            console.error("Resend notification error:", resendErr);
        }
        return NextResponse.json({ success: true, message: "Mesajınız başarıyla gönderildi!" });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
            { status: 500 }
        );
    }
}

// Helper to escape HTML characters
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
