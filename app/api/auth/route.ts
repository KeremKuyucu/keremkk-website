import { NextResponse } from "next/server";
import { redis } from "@/app/lib/server-utils";

const SESSION_TTL = 3600; // 1 saat

// --- Handler ---
export async function POST(request: Request) {
    try {
        const password = request.headers.get("x-sync-password");
        const stored = process.env.SYNC_PASSWORD;

        if (!password || !stored) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // --- Rate limit (IP bazlı) ---
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0] ??
            "unknown";

        const rlKey = `rl:${ip}`;
        const attempts = await redis.incr(rlKey);
        if (attempts === 1) await redis.expire(rlKey, 60);
        if (attempts > 10) { // Biraz daha esnek
            return NextResponse.json(
                { error: "Too many attempts" },
                { status: 429 }
            );
        }

        // --- Hash Verification ---
        // Compute SHA-256 hash of the provided password
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Compare with stored hash (env variable must be the SHA-256 hash of the password)
        if (hashHex !== stored) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // --- Session ---
        const token = crypto.randomUUID();
        await redis.set(
            `session:${token}`,
            {
                createdAt: Date.now(),
                ip,
                ua: request.headers.get("user-agent") ?? "",
            },
            { ex: SESSION_TTL }
        );

        return NextResponse.json({ token });
    } catch (err) {
        console.error("Auth error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
