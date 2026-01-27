
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const RATELIMIT_DURATION = 900; // 15 minutes
const MAX_ATTEMPTS = 5;

async function checkRateLimit(ip: string) {
    const attempts = await kv.get<number>(`ratelimit:${ip}`);
    if (attempts && attempts >= MAX_ATTEMPTS) {
        return false;
    }
    return true;
}

async function incrementRateLimit(ip: string) {
    const key = `ratelimit:${ip}`;
    const attempts = await kv.incr(key);
    if (attempts === 1) {
        await kv.expire(key, RATELIMIT_DURATION);
    }
    return attempts;
}

export async function POST(request: Request) {
    try {
        const { text, ttl, id: paramId } = await request.json();
        const token = request.headers.get("x-sync-token");
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

        // Rate Limit Check
        if (!(await checkRateLimit(ip))) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 }
            );
        }

        // Verify Session
        if (!token || !(await kv.exists(`session:${token}`))) {
            return NextResponse.json({ error: "Invalid or Expired Session" }, { status: 401 });
        }

        if (text) {
            // Use client ID if provided (for AAD binding and idempotency), else generate
            const id = paramId || Date.now().toString();

            // Store the already encrypted text (or plain text in current simpler mode)
            if (ttl === -1) {
                await kv.set(`sync:msg:${id}`, text); // No expiration
            } else {
                const expiration = ttl && ttl > 0 ? ttl : 600; // Default 10 mins
                await kv.set(`sync:msg:${id}`, text, { ex: expiration });
            }
            return NextResponse.json({ success: true, id });
        }

        return NextResponse.json({ error: "No text provided" }, { status: 400 });
    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const token = request.headers.get("x-sync-token");
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

        // Rate Limit Check
        if (!(await checkRateLimit(ip))) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 }
            );
        }

        // Verify Session
        if (!token || !(await kv.exists(`session:${token}`))) {
            return NextResponse.json({ error: "Invalid or Expired Session" }, { status: 401 });
        }

        // Get all keys starting with sync:msg:
        const keys = await kv.keys("sync:msg:*");
        const messages = [];

        for (const key of keys) {
            const text = await kv.get(key);
            // Redis handles expiration, so if it's expired, text will be null
            if (text) {
                const ttl = await kv.ttl(key);
                messages.push({ id: key.split(":").pop(), text, ttl });
            }
        }

        // Sort by creation time (ID is timestamp)
        messages.sort((a, b) => Number(b.id) - Number(a.id));

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Sync fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const token = request.headers.get("x-sync-token");
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

        // Rate Limit Check
        if (!(await checkRateLimit(ip))) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 }
            );
        }

        // Verify Session
        if (!token || !(await kv.exists(`session:${token}`))) {
            return NextResponse.json({ error: "Invalid or Expired Session" }, { status: 401 });
        }

        if (id) {
            await kv.del(`sync:msg:${id}`);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "No ID provided" }, { status: 400 });
    } catch (error) {
        console.error("Sync delete error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}