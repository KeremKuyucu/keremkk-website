import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const SESSION_TTL = 3600; // 1 hour

export async function POST(request: Request) {
    try {
        const passwordHeader = request.headers.get("x-sync-password");
        const correctPassword = process.env.SYNC_PASSWORD;

        if (!correctPassword || passwordHeader !== correctPassword) {
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
