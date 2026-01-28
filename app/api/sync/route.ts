import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const RATELIMIT_DURATION = 900; // 15 minutes
const MAX_ATTEMPTS = 5;

async function checkRateLimit(ip: string) {
    const key = `ratelimit:${ip}`;
    const attempts = await kv.get<number>(key);
    return !attempts || attempts <= MAX_ATTEMPTS;
}

async function incrementRateLimit(ip: string) {
    const key = `ratelimit:${ip}`;
    const attempts = await kv.incr(key);
    if (attempts === 1) {
        await kv.expire(key, RATELIMIT_DURATION);
    }
}

interface SessionData {
    createdAt: number;
    ip: string;
    ua: string;
}

async function validateSession(token: string | null, reqIp: string) {
    if (!token) return false;
    const session = await kv.get<SessionData>(`session:${token}`);
    if (!session || session.ip !== reqIp) return false;
    return true;
}

function getClientIP(request: Request): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    return forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
}

// ✅ TRUE E2EE: Sunucu sadece şifreli blob saklar
// Metadata (burnOnCopy, deleteAfterRead) de şifreli payload içinde
export async function POST(request: Request) {
    const ip = getClientIP(request);

    try {
        const { text, ttl } = await request.json();
        const token = request.headers.get("x-sync-token");

        // Rate Limit Check
        if (!(await checkRateLimit(ip))) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 }
            );
        }

        // Verify Session
        if (!(await validateSession(token, ip))) {
            await incrementRateLimit(ip);
            return NextResponse.json({ error: "Invalid or Expired Session" }, { status: 401 });
        }

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        // Generate ID
        const id = crypto.randomUUID();

        // ✅ ZERO KNOWLEDGE: Sadece şifreli text ve TTL bilgisi
        // Metadata leak YOK - her şey encrypted blob içinde
        if (ttl === -1) {
            await kv.set(`sync:msg:${id}`, text);
        } else {
            const expiration = ttl && ttl > 0 ? ttl : 600; // Default 10 mins
            await kv.set(`sync:msg:${id}`, text, { ex: expiration });
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Sync POST error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET - Fetch all messages (returns only encrypted blobs)
export async function GET(request: Request) {
    const ip = getClientIP(request);

    try {
        const token = request.headers.get("x-sync-token");

        // Rate Limit Check
        if (!(await checkRateLimit(ip))) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 }
            );
        }

        // Verify Session
        if (!(await validateSession(token, ip))) {
            await incrementRateLimit(ip);
            return NextResponse.json({ error: "Invalid or Expired Session" }, { status: 401 });
        }

        // Get all message keys
        const keys = await kv.keys("sync:msg:*");
        const messages = [];

        for (const key of keys) {
            const text = await kv.get<string>(key);

            if (text) {
                const ttl = await kv.ttl(key);
                const id = key.split(":").pop();

                // ✅ ZERO KNOWLEDGE: Sadece şifreli blob dönülüyor
                messages.push({
                    id,
                    text,  // Encrypted blob (metadata dahil içinde)
                    ttl
                });
            }
        }

        // Sort by creation time (newest first)
        messages.sort((a, b) => Number(b.id) - Number(a.id));

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Sync GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE - Delete message (no metadata leak - just deletes by ID)
export async function DELETE(request: Request) {
    const ip = getClientIP(request);

    try {
        const { id } = await request.json();
        const token = request.headers.get("x-sync-token");

        // Rate Limit Check
        if (!(await checkRateLimit(ip))) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 }
            );
        }

        // Verify Session
        if (!(await validateSession(token, ip))) {
            await incrementRateLimit(ip);
            return NextResponse.json({ error: "Invalid or Expired Session" }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: "No ID provided" }, { status: 400 });
        }

        // ✅ ZERO KNOWLEDGE: Sunucu sadece ID ile siliyor
        // Neden silindiği hakkında hiçbir bilgisi yok
        await kv.del(`sync:msg:${id}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Sync DELETE error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH - Update message TTL
export async function PATCH(request: Request) {
    const ip = getClientIP(request);

    try {
        const { id, ttl } = await request.json();
        const token = request.headers.get("x-sync-token");

        if (!(await checkRateLimit(ip))) {
            return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
        }

        if (!(await validateSession(token, ip))) {
            await incrementRateLimit(ip);
            return NextResponse.json({ error: "Invalid Session" }, { status: 401 });
        }

        if (!id || ttl === undefined) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const key = `sync:msg:${id}`;

        // Check if message exists
        const exists = await kv.exists(key);
        if (!exists) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        // Update TTL
        if (ttl === -1) {
            await kv.persist(key);
        } else {
            await kv.expire(key, ttl);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Sync PATCH error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}