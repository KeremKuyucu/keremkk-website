import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Secret Key ile admin client oluşturur
// DİKKAT: Bu client sadece sunucu tarafında kullanılmalıdır!
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

    if (!supabaseUrl) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable is not set")
    }

    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!

    if (!supabaseSecretKey) {
        throw new Error("SUPABASE_SECRET_KEY environment variable is not set")
    }

    return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
