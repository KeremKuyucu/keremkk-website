import { NextRequest, NextResponse } from "next/server";
import { redis, getClientIP } from "@/lib/server-utils";

interface ContactMessage {
    name: string;
    email: string;
    subject: string;
    message: string;
    ip: string;
    timestamp: number;
}

const RATE_LIMIT_MAX = 3; // Max messages per window
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIP(request);

        // Rate limiting
        const rateLimitKey = `contact:ratelimit:${ip}`;
        const currentCount = await redis.get<number>(rateLimitKey);

        if (currentCount !== null && currentCount >= RATE_LIMIT_MAX) {
            return NextResponse.json(
                { error: "Çok fazla mesaj gönderdiniz. Lütfen bir süre sonra tekrar deneyin." },
                { status: 429 }
            );
        }

        // Parse body
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validation
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

        // Save to Redis
        const contactMessage: ContactMessage = {
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
            ip,
            timestamp: Date.now(),
        };

        const messageId = `contact:msg:${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        await redis.set(messageId, JSON.stringify(contactMessage), { ex: 60 * 60 * 24 * 30 }); // 30 days TTL

        // Push to a list for easy retrieval
        await redis.lpush("contact:messages", messageId);

        // Update rate limit
        if (currentCount === null) {
            await redis.set(rateLimitKey, 1, { ex: RATE_LIMIT_WINDOW });
        } else {
            await redis.incr(rateLimitKey);
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
