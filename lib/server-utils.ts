import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";

export interface SessionData {
    createdAt: number;
    ua: string;
}

export async function validateSession(token?: string | null): Promise<boolean> {
    const adminSupabase = createAdminClient();
    let userId: string | null = null;

    // 1. If a token was provided in header (Supabase JWT access_token or legacy token)
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

