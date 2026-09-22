import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Service Role Key ile admin client oluşturur
// DİKKAT: Bu client sadece sunucu tarafında kullanılmalıdır!
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

    if (!supabaseUrl) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable is not set")
    }

    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set")
    }

    return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
