import net from "net";
import dgram from "dgram";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type MonitorTargetType = 'supabase' | 'website' | 'tcp' | 'udp';

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
// Constants & Helpers
// -----------------------------------------------------------------------------

// Vercel 10s limitine takılmamak ve e-posta gönderimine pay bırakmak için 6s
const HEALTHCHECK_TIMEOUT_MS = 6_000;
const SOCKET_TIMEOUT_MS = 4_500;

const clientCache = new Map<string, SupabaseClient>();

export function getMonitorClient(project: { url: string; key: string }): SupabaseClient {
    const cacheKey = `${project.url}:${project.key}`;

    if (!clientCache.has(cacheKey)) {
        if (clientCache.size >= 50) {
            const firstKey = clientCache.keys().next().value;
            if (firstKey) clientCache.delete(firstKey);
        }

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

function normalizeTargetType(type?: string | null): MonitorTargetType {
    if (type === 'website' || type === 'tcp' || type === 'udp') {
        return type;
    }
    return 'supabase';
}

function parseHostAndPort(rawTarget: string, defaultPort: number): { host: string; port: number } | null {
    const cleaned = rawTarget.trim().replace(/^[a-zA-Z]+:\/\//, '').replace(/\/+$/, '');
    if (!cleaned) return null;

    // Köşeli parantezli IPv6: [2001:db8::1]:5520 veya [2001:db8::1]
    if (cleaned.startsWith('[')) {
        const endBracket = cleaned.indexOf(']');
        if (endBracket === -1) return null;
        const host = cleaned.substring(1, endBracket).trim();
        const rest = cleaned.substring(endBracket + 1);

        if (!rest) return net.isIPv6(host) ? { host, port: defaultPort } : null;
        if (rest.startsWith(':')) {
            const parsedPort = parseInt(rest.substring(1), 10);
            if (!isNaN(parsedPort) && parsedPort > 0 && parsedPort <= 65535 && net.isIPv6(host)) {
                return { host, port: parsedPort };
            }
        }
        return null;
    }

    // Parantezsiz saf IPv6
    if (net.isIPv6(cleaned)) {
        return { host: cleaned, port: defaultPort };
    }

    // IPv4 veya Domain
    if (cleaned.includes(':')) {
        const parts = cleaned.split(':');
        if (parts.length !== 2) return null;
        const host = parts[0].trim();
        const parsedPort = parseInt(parts[1].trim(), 10);
        if (!host || isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
            return null;
        }
        return { host, port: parsedPort };
    }

    return { host: cleaned, port: defaultPort };
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
        type: normalizeTargetType(row.type),
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
        const now = new Date().toISOString();
        const { error } = await supabase
            .from('monitor_projects')
            .update({
                last_tested_at: now,
                last_ping_ms: result.duration,
                last_status: result.status,
                last_error: result.error || null,
                updated_at: now,
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
// Unified Health Check (TCP, UDP, Website, Supabase)
// -----------------------------------------------------------------------------

export async function checkMonitorTarget(target: {
    id?: string;
    name?: string;
    type?: MonitorTargetType;
    url: string;
    key?: string | null;
}): Promise<HealthResult> {
    const id = target.id || 'test';
    const name = target.name || 'Bilinmeyen Hedef';
    const type = normalizeTargetType(target.type);

    // A) TCP / SUNUCU PORTU KONTROLÜ (Socket Ping)
    if (type === 'tcp') {
        const parsed = parseHostAndPort(String(target.url || ''), 80);

        if (!parsed) {
            return {
                id,
                name,
                type,
                status: 'error',
                duration: 0,
                error: 'Geçersiz sunucu adresi, IP veya port.',
                server_time: new Date().toISOString(),
            };
        }

        const { host, port } = parsed;
        const start = Date.now();

        return new Promise<HealthResult>((resolve) => {
            const socket = new net.Socket();
            let isSettled = false;

            const finish = (status: 'ok' | 'error' | 'timeout', errorMsg?: string) => {
                if (isSettled) return;
                isSettled = true;
                socket.destroy();
                resolve({
                    id,
                    name,
                    type,
                    status,
                    duration: Date.now() - start,
                    error: errorMsg,
                    data: { host, port },
                    server_time: new Date().toISOString(),
                });
            };

            socket.setTimeout(SOCKET_TIMEOUT_MS);

            socket.on('connect', () => finish('ok'));
            socket.on('timeout', () => finish('timeout', `Zaman aşımı (${SOCKET_TIMEOUT_MS / 1000}s yanıt alınamadı - ${host}:${port})`));
            socket.on('error', (err) => finish('error', err.message || `TCP bağlantı hatası (${host}:${port})`));

            try {
                socket.connect(port, host);
            } catch (err) {
                finish('error', err instanceof Error ? err.message : 'Soket başlatılamadı');
            }
        });
    }

    // B) UDP / SUNUCU PORTU KONTROLÜ (Datagram Ping)
    if (type === 'udp') {
        const parsed = parseHostAndPort(String(target.url || ''), 53);

        if (!parsed) {
            return {
                id,
                name,
                type,
                status: 'error',
                duration: 0,
                error: 'Geçersiz sunucu adresi, IP veya port.',
                server_time: new Date().toISOString(),
            };
        }

        const { host, port } = parsed;

        // Akıllı veya Özel Paket (Payload) Hazırlığı
        let payload: Buffer;
        const customPayload = String(target.key || '').trim();

        if (customPayload) {
            if (/^0x[0-9a-fA-F]+$/i.test(customPayload) && customPayload.length % 2 === 0) {
                payload = Buffer.from(customPayload.slice(2), 'hex');
            } else {
                payload = Buffer.from(customPayload);
            }
        } else if (port === 53) {
            // Standart DNS sorgusu (google.com A kaydı)
            payload = Buffer.from([
                0x12, 0x34,
                0x01, 0x00,
                0x00, 0x01,
                0x00, 0x00,
                0x00, 0x00,
                0x00, 0x00,
                0x06, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65,
                0x03, 0x63, 0x6f, 0x6d,
                0x00,
                0x00, 0x01,
                0x00, 0x01,
            ]);
        } else if (port === 123) {
            // Standart NTP zaman sorgusu (48 byte, Mode 3 Client)
            payload = Buffer.alloc(48);
            payload[0] = 0x1b;
        } else if (port === 27015 || port === 27016 || port === 7777) {
            // Steam / Source Engine oyun sunucusu sorgusu (A2S_INFO)
            payload = Buffer.from([
                0xff, 0xff, 0xff, 0xff, 0x54, 0x53, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x20,
                0x45, 0x6e, 0x67, 0x69, 0x6e, 0x65, 0x20, 0x51, 0x75, 0x65, 0x72, 0x79, 0x00,
            ]);
        } else if (port === 19132) {
            // Minecraft Bedrock RakNet Unconnected Ping
            payload = Buffer.from([
                0x01,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0xff, 0xff, 0x00, 0xfe, 0xfe, 0xfe, 0xfe, 0xfd, 0xfd, 0xfd, 0xfd, 0x12, 0x34, 0x56, 0x78,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            ]);
        } else if (port === 5520) {
            // Hytale Dedicated Server / QUIC Version Negotiation Probe (RFC 9000)
            const dcid = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
            const scid = Buffer.from([0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18]);
            const header = Buffer.concat([
                Buffer.from([0xc0]),
                Buffer.from([0x1a, 0x2a, 0x3a, 0x4a]),
                Buffer.from([dcid.length]),
                dcid,
                Buffer.from([scid.length]),
                scid,
            ]);
            payload = Buffer.alloc(1200);
            header.copy(payload, 0);
        } else {
            // Genel UDP Ping paketi
            payload = Buffer.from('PING\r\n');
        }

        const start = Date.now();

        return new Promise<HealthResult>((resolve) => {
            const isIpv6 = net.isIPv6(host);
            const socket = dgram.createSocket(isIpv6 ? 'udp6' : 'udp4');
            let isSettled = false;

            const finish = (status: 'ok' | 'error' | 'timeout', errorMsg?: string, extraData?: Record<string, unknown>) => {
                if (isSettled) return;
                isSettled = true;
                clearTimeout(timeoutId);
                try {
                    socket.close();
                } catch {
                    // Yoksay
                }
                resolve({
                    id,
                    name,
                    type,
                    status,
                    duration: Date.now() - start,
                    error: errorMsg,
                    data: { host, port, ...(extraData || {}) },
                    server_time: new Date().toISOString(),
                });
            };

            const timeoutId = setTimeout(() => {
                finish('timeout', `Zaman aşımı (${SOCKET_TIMEOUT_MS / 1000}s yanıt alınamadı - ${host}:${port})`);
            }, SOCKET_TIMEOUT_MS);

            socket.on('message', (msg, rinfo) => {
                finish('ok', undefined, {
                    remoteAddress: rinfo.address,
                    remotePort: rinfo.port,
                    bytesReceived: msg.length,
                });
            });

            socket.on('error', (err) => {
                finish('error', err.message || `UDP soket hatası (${host}:${port})`);
            });

            try {
                socket.send(payload, port, host, (err) => {
                    if (err) {
                        finish('error', err.message || `UDP paketi gönderilemedi (${host}:${port})`);
                    }
                });
            } catch (err) {
                finish('error', err instanceof Error ? err.message : 'UDP soket isteği başlatılamadı');
            }
        });
    }

    let formattedUrl = String(target.url || '').trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
    }

    // C) WEB SİTESİ KONTROLÜ (HTTP HEAD -> GET Fallback)
    if (type === 'website') {
        const start = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), HEALTHCHECK_TIMEOUT_MS);

        try {
            const headers = {
                'User-Agent': 'Mozilla/5.0 (compatible; KeremKKMonitor/1.0; +https://keremkuyucu.com.tr)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            };

            let res = await fetch(formattedUrl, {
                method: 'HEAD',
                signal: controller.signal,
                redirect: 'follow',
                headers,
            });

            if (res.status === 405 || res.status === 501) {
                res = await fetch(formattedUrl, {
                    method: 'GET',
                    signal: controller.signal,
                    redirect: 'follow',
                    headers,
                });
            }

            await res.body?.cancel();
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
                (err.name === 'AbortError' ||
                    err.name === 'TimeoutError' ||
                    err.message.toLowerCase().includes('timeout') ||
                    err.message.toLowerCase().includes('aborted'));

            return {
                id,
                name,
                type,
                status: isTimeout ? 'timeout' : 'error',
                duration,
                error: isTimeout
                    ? `Zaman aşımı (${HEALTHCHECK_TIMEOUT_MS / 1000} saniye yanıt alınamadı)`
                    : err instanceof Error
                        ? err.message
                        : 'Bağlantı sağlanamadı',
                server_time: new Date().toISOString(),
            };
        } finally {
            clearTimeout(timeoutId);
        }
    }

    // D) SUPABASE PROJESİ KONTROLÜ (RPC Healthcheck)
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
    let timeoutId: NodeJS.Timeout | undefined;

    try {
        const result = await Promise.race([
            supabase.rpc('healthcheck'),
            new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('timeout')), HEALTHCHECK_TIMEOUT_MS);
            }),
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
            error: isTimeout
                ? `Zaman aşımı (${HEALTHCHECK_TIMEOUT_MS / 1000} saniye yanıt alınamadı)`
                : err instanceof Error
                    ? err.message
                    : 'Bilinmeyen Supabase hatası',
            duration,
            server_time: new Date().toISOString(),
        };
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}