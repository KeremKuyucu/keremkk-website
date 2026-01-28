import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const SESSION_TTL = 3600; // 1 saat
const PBKDF2_ITERATIONS = 200_000;

// --- Utils ---
function hexToUint8(hex: string) {
    return new Uint8Array(
        hex.match(/.{1,2}/g)!.map(b => parseInt(b, 16))
    );
}
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
    return u8.buffer.slice(
        u8.byteOffset,
        u8.byteOffset + u8.byteLength
    ) as ArrayBuffer;
}

async function pbkdf2Hash(password: string, salt: Uint8Array) {
    const enc = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: toArrayBuffer(salt),
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        256
    );

    return new Uint8Array(bits);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a[i] ^ b[i];
    }
    return diff === 0;
}

// --- Handler ---
export async function POST(request: Request) {
    try {
        const password = request.headers.get("x-sync-password");
        const stored = process.env.SYNC_PASSWORD;
        const duress = process.env.SYNC_DURESS_PASSWORD;

        if (!password || !stored) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // --- Rate limit (IP bazlı) ---
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0] ??
            "unknown";

        const rlKey = `rl:${ip}`;
        const attempts = await kv.incr(rlKey);
        if (attempts === 1) await kv.expire(rlKey, 60);
        if (attempts > 5) {
            return NextResponse.json(
                { error: "Too many attempts" },
                { status: 429 }
            );
        }

        // --- Password verify ---
        const [saltHex, hashHex] = stored.split(":");
        if (!saltHex || !hashHex) {
            return NextResponse.json(
                { error: "Server misconfigured" },
                { status: 500 }
            );
        }

        const salt = hexToUint8(saltHex);
        const storedHash = hexToUint8(hashHex);
        const computedHash = await pbkdf2Hash(password, salt);

        // --- Duress Check ---
        // Verify Duress Password using Hash
        if (duress && duress.includes(":")) {
            const [dSaltHex, dHashHex] = duress.split(":");
            if (dSaltHex && dHashHex) {
                const dSalt = hexToUint8(dSaltHex);
                const dStoredHash = hexToUint8(dHashHex);
                const dComputedHash = await pbkdf2Hash(password, dSalt);

                // If matches Duress Password
                if (timingSafeEqual(dComputedHash, dStoredHash)) {
                    // DANGER: Wipe all data
                    const keys = await kv.keys("sync:msg:*");
                    if (keys.length > 0) await kv.del(...keys);

                    // Generate valid session so UI acts "normal" (but empty)
                    const token = crypto.randomUUID();
                    await kv.set(`session:${token}`, { createdAt: Date.now(), ip, ua: request.headers.get("user-agent") ?? "" }, { ex: SESSION_TTL });
                    return NextResponse.json({ token });
                }
            }
        }

        if (!timingSafeEqual(computedHash, storedHash)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // --- Session ---
        const token = crypto.randomUUID();
        await kv.set(
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
