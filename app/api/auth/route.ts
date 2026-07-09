import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SESSION_TTL = 3600; // 1 saat (saniye)

// --- Handler ---
export async function POST(request: Request) {
    try {
        const password = request.headers.get("x-sync-password");
        const stored = process.env.SYNC_PASSWORD;

        if (!password || !stored) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createAdminClient();

        // --- Hash Verification ---
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (hashHex !== stored) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // --- Session ---
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + SESSION_TTL * 1000).toISOString();

        const { error: sessionError } = await supabase.from('sessions').insert({
            token,
            user_agent: request.headers.get("user-agent") ?? "",
            expires_at: expiresAt
        });

        if (sessionError) {
            console.error("Session creation error:", sessionError);
            throw sessionError;
        }

        return NextResponse.json({ token });
    } catch (err) {
        console.error("Auth error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
