import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js"

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface MonitorProjectConfig {
    id: string
    url: string
    key: string
}

// -----------------------------------------------------------------------------
// Client Cache
// -----------------------------------------------------------------------------

const clientCache = new Map<string, SupabaseClient>()

export function getMonitorClient(project: MonitorProjectConfig): SupabaseClient {
    if (!clientCache.has(project.url)) {
        clientCache.set(
            project.url,
            createSupabaseClient(project.url, project.key, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                },
            }),
        )
    }

    return clientCache.get(project.url)!
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

export function parseMonitorProjects(raw: string): MonitorProjectConfig[] {
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
        throw new Error("SUPABASE_MONITOR_PROJECTS must be a JSON array")
    }

    return parsed.filter(
        (p): p is MonitorProjectConfig =>
            p &&
            typeof p.id === "string" &&
            typeof p.url === "string" &&
            typeof p.key === "string",
    )
}
