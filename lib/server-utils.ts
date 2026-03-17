import { createAdminClient } from "./supabase/admin";

export interface SessionData {
    createdAt: number;
    ua: string;
}

export async function validateSession(token: string | null): Promise<boolean> {
    if (!token) return false;

    // Use admin client for session validation to avoid RLS issues
    const supabase = createAdminClient();

    const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', token)
        .single();

    if (error || !session) {
        return false;
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < now) {
        // Automatically clean up expired session (optional)
        await supabase.from('sessions').delete().eq('token', token);
        return false;
    }

    return true;
}
