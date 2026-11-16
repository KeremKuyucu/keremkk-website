import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";

export interface SessionData {
    createdAt: number;
    ua: string;
}

/**
 * Extracts the JWT token strictly from the Authorization: Bearer <token> header.
 */
export function extractAuthToken(requestOrToken?: Request | string | null): string | null {
    if (!requestOrToken) return null;

    if (typeof requestOrToken === "string") {
        let clean = requestOrToken.trim();
        if (clean.toLowerCase().startsWith("bearer ")) {
            clean = clean.slice(7).trim();
        }
        return clean || null;
    }

    // It is a Request / NextRequest object
    const authHeader = requestOrToken.headers.get("authorization");
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
 * Validates admin user session from:
 * - Authorization: Bearer <token> in the Request
 * - Or SSR cookies
 */
export async function validateSession(requestOrToken?: Request | string | null): Promise<boolean> {
    const token = extractAuthToken(requestOrToken);
    const adminSupabase = createAdminClient();
    let userId: string | null = null;

    // 1. If a token was provided in Authorization Bearer header
    if (token) {
        try {
            const { data: { user }, error } = await adminSupabase.auth.getUser(token);
            if (!error && user) {
                userId = user.id;
            }
        } catch {
            // Not a valid Supabase JWT
        }
    }

    // 2. If no valid user from token, check SSR cookies
    if (!userId) {
        try {
            const serverSupabase = await createClient();
            const { data: { user }, error } = await serverSupabase.auth.getUser();
            if (!error && user) {
                userId = user.id;
            }
        } catch {
            // Cookies not available or SSR context error
        }
    }

    if (!userId) {
        return false;
    }

    // 3. Verify admin authorization from admin_users table
    try {
        const { data: adminRecord, error: adminError } = await adminSupabase
            .from('admin_users')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();

        if (!adminError && adminRecord) {
            return true;
        }
    } catch (err) {
        console.error("Error verifying admin_users:", err);
    }

    return false;
}
