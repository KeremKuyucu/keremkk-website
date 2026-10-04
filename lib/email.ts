// ============================================================================
// 📧 GENEL RESEND E-POSTA GÖNDERİM SERVİSİ
// ============================================================================

export interface SendEmailOptions {
    to?: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
}

export interface MonitorAlertOptions {
    projectName: string;
    projectType: 'supabase' | 'website';
    targetUrl: string;
    status: 'error' | 'timeout' | 'ok';
    error?: string;
    duration?: number;
    timestamp?: string;
}

/**
 * HTML karakterlerini güvenli hale getirir
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 * Resend API üzerinden e-posta gönderir
 */
export async function sendEmail({
    to,
    subject,
    html,
    text,
    replyTo,
}: SendEmailOptions): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const resendToken = process.env.RESEND_TOKEN || process.env.RESEND_API_KEY;
    const defaultTo = process.env.NOTIFICATION_TO_EMAIL;
    const fromEmail = process.env.NOTIFICATION_FROM_EMAIL;

    const recipients = to ? (Array.isArray(to) ? to : [to]) : (defaultTo ? [defaultTo] : []);

    if (!resendToken) {
        console.warn("[email] RESEND_TOKEN veya RESEND_API_KEY tanımlanmamış. E-posta gönderilemedi.");
        return { success: false, error: "Resend API anahtarı bulunamadı" };
    }

    if (!fromEmail) {
        console.warn("[email] Gönderen e-posta adresi (NOTIFICATION_FROM_EMAIL) tanımlanmamış.");
        return { success: false, error: "Gönderen adresi bulunamadı" };
    }

    if (recipients.length === 0) {
        console.warn("[email] Alıcı e-posta adresi (NOTIFICATION_TO_EMAIL) tanımlanmamış.");
        return { success: false, error: "Alıcı adresi bulunamadı" };
    }

    try {
        const payload: Record<string, unknown> = {
            from: fromEmail,
            to: recipients,
            subject,
            html,
        };

        if (replyTo) {
            payload.reply_to = replyTo;
        }

        if (text) {
            payload.text = text;
        }

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("[email] Resend API hatası:", res.status, errText);
            return { success: false, error: `Resend HTTP ${res.status}: ${errText}` };
        }

        const data = await res.json();
        console.log("✅ [email] E-posta başarıyla gönderildi:", subject);
        return { success: true, data };
    } catch (err) {
        console.error("[email] Gönderim hatası:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Bilinmeyen gönderim hatası",
        };
    }
}

/**
 * İzlenen hedef (website veya supabase) olumsuz yanıt verdiğinde alarm e-postası gönderir
 */
export async function sendMonitorAlertEmail({
    projectName,
    projectType,
    targetUrl,
    status,
    error,
    duration,
    timestamp,
}: MonitorAlertOptions): Promise<{ success: boolean; error?: string }> {
    const formattedDate = timestamp || new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
    const isTimeout = status === "timeout";
    const typeLabel = projectType === "website" ? "🌐 Web Sitesi" : "⚡ Supabase Projesi";
    const statusLabel = isTimeout ? "⏱️ Zaman Aşımı (Timeout)" : "❌ Hata (Erişilemez)";

    const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background-color: #ffffff; border-radius: 18px; border: 1px solid #fee2e2;">
        <div style="border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #fef2f2; color: #ef4444; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                🚨 Kesinti / Hata Uyarısı
            </div>
            <h2 style="color: #991b1b; margin: 0; font-size: 22px; font-weight: 800;">
                ${escapeHtml(projectName)} yanıt vermiyor!
            </h2>
            <p style="color: #6b7280; font-size: 13px; margin: 6px 0 0 0;">
                Otomatik izleme sistemi hedef kontrolünde olumsuz bir durum tespit etti.
            </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
            <tr>
                <td style="padding: 10px 0; color: #6b7280; width: 130px; border-bottom: 1px solid #f3f4f6;"><strong>Hedef Adı:</strong></td>
                <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">${escapeHtml(projectName)}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;"><strong>Hedef Türü:</strong></td>
                <td style="padding: 10px 0; color: #374151; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${typeLabel}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;"><strong>Hedef URL:</strong></td>
                <td style="padding: 10px 0; font-family: monospace; border-bottom: 1px solid #f3f4f6;">
                    <a href="${escapeHtml(targetUrl)}" target="_blank" style="color: #2563eb; text-decoration: none; word-break: break-all;">${escapeHtml(targetUrl)}</a>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;"><strong>Durum:</strong></td>
                <td style="padding: 10px 0; color: #dc2626; font-weight: bold; border-bottom: 1px solid #f3f4f6;">${statusLabel}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;"><strong>Yanıt Süresi (Ping):</strong></td>
                <td style="padding: 10px 0; color: #111827; font-family: monospace; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${duration !== undefined ? `${duration} ms` : '-'}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #6b7280;"><strong>Test Zamanı:</strong></td>
                <td style="padding: 10px 0; color: #4b5563;">${escapeHtml(formattedDate)}</td>
            </tr>
        </table>

        ${
            error
                ? `
        <div style="background-color: #fef2f2; border-radius: 12px; padding: 16px; border-left: 4px solid #ef4444; margin-bottom: 24px;">
            <p style="color: #991b1b; font-size: 11px; text-transform: uppercase; font-weight: bold; margin: 0 0 6px 0; letter-spacing: 0.5px;">Hata Detayı:</p>
            <p style="color: #b91c1c; font-family: monospace; font-size: 13px; line-height: 1.5; margin: 0; word-break: break-all;">${escapeHtml(error)}</p>
        </div>
        `
                : ''
        }

        <div style="text-align: center; margin: 28px 0 20px 0;">
            <a href="https://keremkk.com.tr/admin" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 12px; font-weight: bold; font-size: 13px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                🛠️ Yönetim Paneline Git
            </a>
        </div>

        <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; color: #9ca3af; font-size: 11px;">
            <span>KeremKK Otomatik Sunucu & Web İzleme Servisi</span> • <span>${escapeHtml(formattedDate)}</span>
        </div>
    </div>
    `;

    return sendEmail({
        subject: `🚨 [Erişim Hatası] ${projectName} (${projectType === "website" ? "Web Sitesi" : "Supabase"}) yanıt vermiyor!`,
        html: emailHtml,
    });
}
