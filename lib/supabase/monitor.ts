import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface MonitorProjectRow {
    id: string
    name: string
    supabase_url: string
    supabase_key: string
    enabled: boolean
    created_at: string
    updated_at: string
}

export interface MonitorProjectConfig {
    id: string
    name: string
    url: string
    key: string
}

// -----------------------------------------------------------------------------
// Client Cache
// -----------------------------------------------------------------------------

const clientCache = new Map<string, SupabaseClient>()

export function getMonitorClient(project: MonitorProjectConfig): SupabaseClient {
    const cacheKey = `${project.url}:${project.key}`

    if (!clientCache.has(cacheKey)) {
        clientCache.set(
            cacheKey,
            createSupabaseClient(project.url, project.key, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                },
            }),
        )
    }

    return clientCache.get(cacheKey)!
}

// -----------------------------------------------------------------------------
// Fetch Projects from Supabase (bypassing RLS via Admin Client)
// -----------------------------------------------------------------------------

export async function getMonitorProjects(): Promise<MonitorProjectConfig[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('monitor_projects')
        .select('id, name, supabase_url, supabase_key, enabled')
        .eq('enabled', true)
        .order('created_at', { ascending: true })

    if (error) {
        throw new Error(`Failed to fetch monitor projects from database: ${error.message}`)
    }

    if (!data) {
        return []
    }

    return data.map((row) => ({
        id: row.id,
        name: row.name,
        url: row.supabase_url,
        key: row.supabase_key,
    }))
}

// -----------------------------------------------------------------------------
// Helpers (Fallback / Legacy)
// -----------------------------------------------------------------------------

export function parseMonitorProjects(raw: string): MonitorProjectConfig[] {
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
        throw new Error("SUPABASE_MONITOR_PROJECTS must be a JSON array")
    }

    return parsed
        .filter(
            (p): p is { id?: string; name?: string; url: string; key: string } =>
                p &&
                typeof p.url === "string" &&
                typeof p.key === "string",
        )
        .map((p) => ({
            id: p.id || p.name || 'unknown',
            name: p.name || p.id || 'unknown',
            url: p.url,
            key: p.key,
        }))
}
