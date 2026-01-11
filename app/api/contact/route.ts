import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { name, email, subject, message } = await request.json();

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
        }

        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error('DISCORD_WEBHOOK_URL not configured');
            return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
        }

        // Discord embed
        const embed = {
            title: '📬 Yeni İletişim Mesajı',
            color: 0x7c3aed, // Violet
            fields: [
                { name: '👤 Ad', value: name, inline: true },
                { name: '📧 E-posta', value: email, inline: true },
                { name: '📋 Konu', value: subject, inline: false },
                { name: '💬 Mesaj', value: message, inline: false },
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'keremkk.com.tr İletişim Formu',
            },
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [embed],
            }),
        });

        if (!response.ok) {
            throw new Error('Discord webhook failed');
        }

        return NextResponse.json({ success: true, message: 'Mesajınız gönderildi!' });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
    }
}
