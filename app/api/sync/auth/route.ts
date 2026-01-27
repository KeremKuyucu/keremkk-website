import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const SESSION_TTL = 3600; // 1 hour

async function hashPassword(password: string) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
    try {
        const passwordHeader = request.headers.get("x-sync-password");
        const correctPassword = process.env.SYNC_PASSWORD;

        if (!passwordHeader || !correctPassword) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hashedPassword = await hashPassword(passwordHeader);

        if (hashedPassword !== correctPassword) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = crypto.randomUUID();
        await kv.set(`session:${token}`, "1", { ex: SESSION_TTL });

        return NextResponse.json({ token });
    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
