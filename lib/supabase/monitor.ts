import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type MonitorTargetType = 'supabase' | 'website';

export interface MonitorProjectRow {
    id: string;
    name: string;
    supabase_url: string;
    supabase_key?: string | null;
    type?: MonitorTargetType | null;
    enabled: boolean;
    last_tested_at?: string | null;
    last_ping_ms?: number | null;
    last_status?: 'ok' | 'error' | 'timeout' | null;
    last_error?: string | null;
    created_at: string;
    updated_at: string;
}

export interface MonitorProjectConfig {
    id: string;
    name: string;
    url: string;
    key?: string | null;
    type: MonitorTargetType;
    enabled: boolean;
    last_tested_at?: string | null;
    last_ping_ms?: number | null;
    last_status?: 'ok' | 'error' | 'timeout' | null;
    last_error?: string | null;
}

export interface HealthResult {
    id: string;
    name: string;
    type: MonitorTargetType;
    status: 'ok' | 'error' | 'timeout';
    duration: number;
    data?: unknown;
    error?: string;
    server_time: string;
}

// -----------------------------------------------------------------------------
// Client Cache for Supabase Instances
// -----------------------------------------------------------------------------

const clientCache = new Map<string, SupabaseClient>();

export function getMonitorClient(project: { url: string; key: string }): SupabaseClient {
    const cacheKey = `${project.url}:${project.key}`;

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
        );
    }

    return clientCache.get(cacheKey)!;
}

// -----------------------------------------------------------------------------
// Fetch Projects from Supabase (bypassing RLS via Admin Client)
// -----------------------------------------------------------------------------

export async function getMonitorProjects(onlyEnabled = true): Promise<MonitorProjectConfig[]> {
    const supabase = createAdminClient();
    let query = supabase
        .from('monitor_projects')
        .select('id, name, supabase_url, supabase_key, type, enabled, last_tested_at, last_ping_ms, last_status, last_error')
        .order('created_at', { ascending: true });

    if (onlyEnabled) {
        query = query.eq('enabled', true);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch monitor projects from database: ${error.message}`);
    }

    if (!data) {
        return [];
    }

    return data.map((row) => ({
        id: row.id,
        name: row.name,
        url: row.supabase_url,
        key: row.supabase_key || null,
        type: (row.type === 'website' ? 'website' : 'supabase') as MonitorTargetType,
        enabled: Boolean(row.enabled),
        last_tested_at: row.last_tested_at || null,
        last_ping_ms: row.last_ping_ms !== undefined && row.last_ping_ms !== null ? Number(row.last_ping_ms) : null,
        last_status: row.last_status || null,
        last_error: row.last_error || null,
    }));
}

// -----------------------------------------------------------------------------
// Record Test Result in Database
// -----------------------------------------------------------------------------

export async function recordMonitorResult(projectId: string, result: HealthResult): Promise<void> {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from('monitor_projects')
            .update({
                last_tested_at: new Date().toISOString(),
                last_ping_ms: result.duration,
                last_status: result.status,
                last_error: result.error || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', projectId);

        if (error) {
            console.error(`[monitor] Veritabanı test kaydı güncellenemedi (${projectId}):`, error);
        }
    } catch (err) {
        console.error(`[monitor] recordMonitorResult hatası:`, err);
    }
}

// -----------------------------------------------------------------------------
// Unified Health Check (Supabase & Website)
// -----------------------------------------------------------------------------

const HEALTHCHECK_TIMEOUT_MS = 10_000;

export async function checkMonitorTarget(target: {
    id?: string;
    name?: string;
    type?: MonitorTargetType;
    url: string;
    key?: string | null;
}): Promise<HealthResult> {
    const id = target.id || 'test';
    const name = target.name || 'Bilinmeyen Hedef';
    const type: MonitorTargetType = target.type === 'website' ? 'website' : 'supabase';

    let formattedUrl = String(target.url || '').trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
    }

    // A) WEB SİTESİ KONTROLÜ (HTTP Ping / GET)
    if (type === 'website') {
        const start = Date.now();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), HEALTHCHECK_TIMEOUT_MS);

            const res = await fetch(formattedUrl, {
                method: 'GET',
                signal: controller.signal,
                redirect: 'follow',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; KeremKKMonitor/1.0; +https://keremkk.com.tr)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
            });

            clearTimeout(timeoutId);
            const duration = Date.now() - start;

            if (res.ok) {
                return {
                    id,
                    name,
                    type,
                    status: 'ok',
                    duration,
                    data: { statusCode: res.status, statusText: res.statusText },
                    server_time: new Date().toISOString(),
                };
            }

            return {
                id,
                name,
                type,
                status: 'error',
                duration,
                error: `HTTP ${res.status}: ${res.statusText || 'Olumsuz yanıt alındı'}`,
                server_time: new Date().toISOString(),
            };
        } catch (err) {
            const duration = Date.now() - start;
            const isTimeout =
                err instanceof Error &&
                (err.name === 'AbortError' || err.name === 'TimeoutError' || err.message.toLowerCase().includes('timeout') || err.message.toLowerCase().includes('aborted'));

            return {
                id,
                name,
                type,
                status: isTimeout ? 'timeout' : 'error',
                duration,
                error: isTimeout ? 'Zaman aşımı (10 saniye yanıt alınamadı)' : (err instanceof Error ? err.message : 'Bağlantı sağlanamadı'),
                server_time: new Date().toISOString(),
            };
        }
    }

    // B) SUPABASE PROJESİ KONTROLÜ (RPC Healthcheck)
    const cleanKey = String(target.key || '').trim();
    if (!cleanKey) {
        return {
            id,
            name,
            type,
            status: 'error',
            duration: 0,
            error: 'Supabase Key eksik.',
            server_time: new Date().toISOString(),
        };
    }

    const cleanUrl = formattedUrl.replace(/\/+$/, '');
    const supabase = getMonitorClient({ url: cleanUrl, key: cleanKey });
    const start = Date.now();

    try {
        const result = await Promise.race([
            supabase.rpc('healthcheck'),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), HEALTHCHECK_TIMEOUT_MS),
            ),
        ]);

        const duration = Date.now() - start;

        if (result.error) {
            return {
                id,
                name,
                type,
                status: 'error',
                error: result.error.message,
                duration,
                server_time: new Date().toISOString(),
            };
        }

        return {
            id,
            name,
            type,
            status: 'ok',
            data: result.data,
            duration,
            server_time: new Date().toISOString(),
        };
    } catch (err) {
        const duration = Date.now() - start;
        const isTimeout = err instanceof Error && err.message === 'timeout';

        return {
            id,
            name,
            type,
            status: isTimeout ? 'timeout' : 'error',
            error: isTimeout ? 'Zaman aşımı (10 saniye yanıt alınamadı)' : (err instanceof Error ? err.message : 'Bilinmeyen Supabase hatası'),
            duration,
            server_time: new Date().toISOString(),
        };
    }
}
