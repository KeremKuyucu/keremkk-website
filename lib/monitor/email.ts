import { sendEmail, escapeHtml } from "@/lib/email";
import type { MonitorTargetType } from "@/lib/monitor/monitor";

export interface MonitorAlertOptions {
    projectName: string;
    projectType: MonitorTargetType;
    targetUrl: string;
    status: "error" | "timeout" | "ok";
    error?: string;
    duration?: number;
    timestamp?: string;
}

const TYPE_LABELS: Record<MonitorTargetType, string> = {
    website: "🌐 Web Sitesi",
    tcp: "🔌 TCP / Sunucu Portu",
    udp: "📡 UDP Portu",
    supabase: "⚡ Supabase Projesi",
};

function formatIstanbulTime(timestamp?: string): string {
    const date = timestamp ? new Date(timestamp) : new Date();
    if (Number.isNaN(date.getTime())) {
        return new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
    }
    return date.toLocaleString("tr-TR", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

/**
 * Tek bir hedef olumsuz yanıt verdiğinde alarm e-postası gönderir
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
    const formattedDate = formatIstanbulTime(timestamp);
    const isTimeout = status === "timeout";
    const typeLabel = TYPE_LABELS[projectType] || "⚡ Supabase Projesi";
    const statusLabel = isTimeout ? "⏱️ Zaman Aşımı (Timeout)" : "❌ Hata (Erişilemez)";
    const isSocketTarget = projectType === "tcp" || projectType === "udp";

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
                <td style="padding: 10px 0; color: #6b7280; width: 140px; border-bottom: 1px solid #f3f4f6;"><strong>Hedef Adı:</strong></td>
                <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">${escapeHtml(projectName)}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;"><strong>Hedef Türü:</strong></td>
                <td style="padding: 10px 0; color: #374151; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${typeLabel}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;"><strong>${isSocketTarget ? "Hedef Host / Port:" : "Hedef URL:"}</strong></td>
                <td style="padding: 10px 0; font-family: monospace; border-bottom: 1px solid #f3f4f6;">
                    ${isSocketTarget
            ? `<span style="color: #111827; word-break: break-all;">${escapeHtml(targetUrl)}</span>`
            : `<a href="${escapeHtml(targetUrl)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none; word-break: break-all;">${escapeHtml(targetUrl)}</a>`
        }
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;"><strong>Durum:</strong></td>
                <td style="padding: 10px 0; color: #dc2626; font-weight: bold; border-bottom: 1px solid #f3f4f6;">${statusLabel}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;"><strong>Yanıt Süresi (Ping):</strong></td>
                <td style="padding: 10px 0; color: #111827; font-family: monospace; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${duration !== undefined ? `${duration} ms` : "-"}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #6b7280;"><strong>Test Zamanı:</strong></td>
                <td style="padding: 10px 0; color: #4b5563;">${escapeHtml(formattedDate)}</td>
            </tr>
        </table>

        ${error
            ? `
        <div style="background-color: #fef2f2; border-radius: 12px; padding: 16px; border-left: 4px solid #ef4444; margin-bottom: 24px;">
            <p style="color: #991b1b; font-size: 11px; text-transform: uppercase; font-weight: bold; margin: 0 0 6px 0; letter-spacing: 0.5px;">Hata Detayı:</p>
            <p style="color: #b91c1c; font-family: monospace; font-size: 13px; line-height: 1.5; margin: 0; word-break: break-all;">${escapeHtml(error)}</p>
        </div>
        `
            : ""
        }

        <div style="text-align: center; margin: 28px 0 20px 0;">
            <a href="https://keremkuyucu.com.tr/admin" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 12px; font-weight: bold; font-size: 13px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                🛠️ Yönetim Paneline Git
            </a>
        </div>

        <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; color: #9ca3af; font-size: 11px;">
            <span>KeremKK Otomatik Sunucu & Web İzleme Servisi</span> • <span>${escapeHtml(formattedDate)}</span>
        </div>
    </div>
    `;

    return sendEmail({
        subject: `🚨 [Erişim Hatası] ${projectName} (${typeLabel}) yanıt vermiyor!`,
        html: emailHtml,
    });
}

/**
 * Birden fazla hedef aynı anda düştüğünde Resend rate-limit (2 req/s) sınırına
 * takılmadan tek bir özet e-posta gönderir.
 */
export async function sendBatchMonitorAlertEmail(
    alerts: MonitorAlertOptions[]
): Promise<{ success: boolean; error?: string }> {
    if (alerts.length === 0) return { success: true };
    if (alerts.length === 1) return sendMonitorAlertEmail(alerts[0]);

    const formattedDate = formatIstanbulTime(alerts[0].timestamp);

    const rowsHtml = alerts
        .map((item) => {
            const typeLabel = TYPE_LABELS[item.projectType] || "⚡ Supabase Projesi";
            const statusText = item.status === "timeout" ? "⏱️ Timeout" : "❌ Hata";
            return `
            <tr>
                <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-weight: 700; color: #111827;">${escapeHtml(item.projectName)}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; color: #374151;">${typeLabel}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-family: monospace; font-size: 12px; color: #111827; word-break: break-all;">${escapeHtml(item.targetUrl)}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; color: #dc2626; font-weight: 700;">${statusText}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-family: monospace; font-size: 12px; color: #b91c1c; word-break: break-all;">${escapeHtml(item.error || "-")}</td>
            </tr>`;
        })
        .join("");

    const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 28px; background-color: #ffffff; border-radius: 18px; border: 1px solid #fee2e2;">
        <div style="border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #fef2f2; color: #ef4444; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                🚨 Çoklu Kesinti Uyarısı (${alerts.length} Hedef)
            </div>
            <h2 style="color: #991b1b; margin: 0; font-size: 22px; font-weight: 800;">
                ${alerts.length} izlenen hedef yanıt vermiyor!
            </h2>
            <p style="color: #6b7280; font-size: 13px; margin: 6px 0 0 0;">
                Test Zamanı: ${escapeHtml(formattedDate)}
            </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; text-align: left;">
            <thead>
                <tr style="background-color: #fef2f2; color: #991b1b;">
                    <th style="padding: 10px 8px; border-bottom: 2px solid #fecaca;">Hedef</th>
                    <th style="padding: 10px 8px; border-bottom: 2px solid #fecaca;">Tür</th>
                    <th style="padding: 10px 8px; border-bottom: 2px solid #fecaca;">Adres / Port</th>
                    <th style="padding: 10px 8px; border-bottom: 2px solid #fecaca;">Durum</th>
                    <th style="padding: 10px 8px; border-bottom: 2px solid #fecaca;">Hata</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>

        <div style="text-align: center; margin: 28px 0 20px 0;">
            <a href="https://keremkuyucu.com.tr/admin" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 12px; font-weight: bold; font-size: 13px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                🛠️ Yönetim Paneline Git
            </a>
        </div>

        <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; color: #9ca3af; font-size: 11px;">
            <span>KeremKK Otomatik Sunucu & Web İzleme Servisi</span> • <span>${escapeHtml(formattedDate)}</span>
        </div>
    </div>
    `;

    return sendEmail({
        subject: `🚨 [Çoklu Erişim Hatası] ${alerts.length} hedef yanıt vermiyor!`,
        html: emailHtml,
    });
}