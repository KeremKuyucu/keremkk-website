import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";

export const SUPER_ADMIN_UID = "5f0df305-3684-4e5a-bd66-8101c1c6aff9";

export interface SessionData {
    createdAt: number;
    ua: string;
}

export async function validateSession(token?: string | null): Promise<boolean> {
    const adminSupabase = createAdminClient();
    let userId: string | null = null;
    let userEmail: string | null = null;

    // 1. If a token was provided in header (Supabase JWT access_token or legacy token)
    if (token) {
        try {
            const { data: { user }, error } = await adminSupabase.auth.getUser(token);
            if (!error && user) {
                userId = user.id;
                userEmail = user.email ?? null;
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
                userEmail = user.email ?? null;
            }
        } catch {
            // Cookies not available or SSR context error
        }
    }

    if (!userId) {
        return false;
    }

    // 4. Verify admin authorization
    // Super Admin UID fast path
    if (userId === SUPER_ADMIN_UID) {
        return true;
    }

    // Check admin_users table in Supabase
    try {
        const query = userEmail 
            ? `user_id.eq.${userId},email.eq.${userEmail}`
            : `user_id.eq.${userId}`;

        const { data: adminRecord, error: adminError } = await adminSupabase
            .from('admin_users')
            .select('role')
            .or(query)
            .maybeSingle();

        if (!adminError && adminRecord) {
            return true;
        }
    } catch (err) {
        console.error("Error verifying admin_users:", err);
    }

    return false;
}

