import crypto from "crypto";
import { createAdminClient } from "./supabase/admin";

export interface JwtVerificationResult {
    hasToken: boolean;
    valid: boolean;
    user?: any;
    reason?: string;
}

/**
 * Extracts the JWT token strictly from the Authorization: Bearer <token> header.
 */
export function extractToken(request: Request): string | null {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;

    const parts = authHeader.split(" ");
    if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
        return parts[1].trim() || null;
    }
    if (parts.length === 1 && parts[0]) {
        return parts[0].trim() || null;
    }

    return null;
}

/**
 * Safe base64url decode helper
 */
function base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
        base64 += "=";
    }
    return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Verifies HMAC-SHA256 signature of a JWT token against a secret
 */
function verifyHmacSha256(headerAndPayload: string, signature: string, secret: string): boolean {
    try {
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(headerAndPayload);
        const expectedSig = hmac.digest("base64url");
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
    } catch {
        return false;
    }
}

/**
 * Verifies whether the provided token is a valid JWT or Supabase session token.
 */
export async function verifyJwtToken(token: string | null | undefined): Promise<JwtVerificationResult> {
    if (!token || typeof token !== "string" || !token.trim()) {
        return { hasToken: false, valid: false };
    }

    const cleanToken = token.trim();

    // Direct match against known server keys (service role or anon key)
    if (
        cleanToken === process.env.SUPABASE_SERVICE_ROLE_KEY ||
        cleanToken === process.env.CRON_SECRET ||
        (process.env.JWT_SECRET && cleanToken === process.env.JWT_SECRET)
    ) {
        return { hasToken: true, valid: true, user: { role: "service" } };
    }

    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
        return {
            hasToken: true,
            valid: false,
            reason: "Geçersiz JWT formatı (3 bölümden oluşmalıdır: header.payload.signature)"
        };
    }

    const [headerB64, payloadB64, signature] = parts;
    const headerAndPayload = `${headerB64}.${payloadB64}`;

    // Decode and check expiration
    let payload: any = null;
    try {
        const payloadJson = base64UrlDecode(payloadB64);
        payload = JSON.parse(payloadJson);
    } catch {
        return { hasToken: true, valid: false, reason: "JWT payload JSON olarak çözümlenemedi" };
    }

    // Check expiration if present
    if (payload && typeof payload.exp === "number") {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        if (payload.exp < nowInSeconds) {
            return { hasToken: true, valid: false, reason: "JWT token süresi dolmuş (expired)" };
        }
    }

    // 1. Verify HMAC with SUPABASE_JWT_SECRET
    const supabaseSecret = process.env.SUPABASE_JWT_SECRET;
    if (supabaseSecret && verifyHmacSha256(headerAndPayload, signature, supabaseSecret)) {
        return { hasToken: true, valid: true, user: payload };
    }

    // 2. Verify HMAC with custom JWT_SECRET
    const customSecret = process.env.JWT_SECRET;
    if (customSecret && verifyHmacSha256(headerAndPayload, signature, customSecret)) {
        return { hasToken: true, valid: true, user: payload };
    }

    // 3. Fallback: Verify via Supabase Auth client
    try {
        const supabase = createAdminClient();
        const { data: { user }, error } = await supabase.auth.getUser(cleanToken);
        if (!error && user) {
            return { hasToken: true, valid: true, user };
        }
    } catch {
        // Supabase client failure or unreachable
    }

    return {
        hasToken: true,
        valid: false,
        reason: "Geçersiz JWT imzası veya yetkilendirilmemiş oturum"
    };
}
