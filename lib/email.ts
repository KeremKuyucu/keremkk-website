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

/**
 * HTML karakterlerini ve öznitelik tırnaklarını güvenli hale getirir
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
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
    const resendToken = (process.env.RESEND_TOKEN || process.env.RESEND_API_KEY || "").trim();
    const defaultTo = (process.env.NOTIFICATION_TO_EMAIL || "").trim();
    const fromEmail = (process.env.NOTIFICATION_FROM_EMAIL || "").trim();

    const recipients = to ? (Array.isArray(to) ? to : [to]) : defaultTo ? [defaultTo] : [];

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
            signal: AbortSignal.timeout(4_000),
            headers: {
                Authorization: `Bearer ${resendToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("[email] Resend API hatası:", res.status, errText);
            return { success: false, error: `Resend HTTP ${res.status}:${errText}` };
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