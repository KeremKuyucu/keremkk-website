import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProjectConfig {
    id: string;
    url: string;
    key: string;
}

type HealthResult =
    | { id: string; status: 'ok'; data: unknown; duration: number; server_time: string }
    | { id: string; status: 'error'; error: string; duration?: number; server_time: string }
    | { id: string; status: 'timeout'; error: string; duration: number; server_time: string };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Per-project health-check timeout (ms). */
const HEALTHCHECK_TIMEOUT_MS = 10_000;

const RESPONSE_HEADERS: HeadersInit = {
    'Cache-Control': 'no-store, max-age=0',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Module-level client cache – avoids re-creating clients on every request. */
const clientCache = new Map<string, SupabaseClient>();

function getOrCreateClient(project: ProjectConfig): SupabaseClient {
    const cacheKey = project.url;
    let client = clientCache.get(cacheKey);

    if (!client) {
        client = createClient(project.url, project.key, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        });
        clientCache.set(cacheKey, client);
    }

    return client;
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'Unknown error';
}

function isValidProjectConfig(value: unknown): value is ProjectConfig {
    if (typeof value !== 'object' || value === null) return false;
    const obj = value as Record<string, unknown>;
    return (
        typeof obj.id === 'string' &&
        typeof obj.url === 'string' &&
        typeof obj.key === 'string'
    );
}

function parseProjects(raw: string): ProjectConfig[] {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
        throw new TypeError('SUPABASE_MONITOR_PROJECTS must be a JSON array');
    }

    const valid = parsed.filter(isValidProjectConfig);

    if (valid.length !== parsed.length) {
        console.warn(
            `[monitor] ${parsed.length - valid.length} project(s) skipped due to invalid config`,
        );
    }

    return valid;
}

// ---------------------------------------------------------------------------
// Health-check for a single project
// ---------------------------------------------------------------------------

async function checkProject(project: ProjectConfig): Promise<HealthResult> {
    const supabase = getOrCreateClient(project);
    const start = Date.now();

    try {
        const { data, error } = await Promise.race([
            supabase.rpc('healthcheck'),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), HEALTHCHECK_TIMEOUT_MS),
            ),
        ]);

        const duration = Date.now() - start;

        if (error) {
            return {
                id: project.id,
                status: 'error',
                error: error.message,
                duration,
                server_time: new Date().toISOString(),
            };
        }

        return {
            id: project.id,
            status: 'ok',
            data,
            duration,
            server_time: new Date().toISOString(),
        };
    } catch (err) {
        const duration = Date.now() - start;
        const message = getErrorMessage(err);
        const isTimeout = message === 'Timeout';

        return {
            id: project.id,
            status: isTimeout ? 'timeout' : 'error',
            error: isTimeout ? `No response within ${HEALTHCHECK_TIMEOUT_MS}ms` : message,
            duration,
            server_time: new Date().toISOString(),
        };
    }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
    // ------------------------------------------------------------------
    // Parse optional `expected` query param (e.g. /api/monitor?expected=2)
    // ------------------------------------------------------------------
    const expectedParam = req.nextUrl.searchParams.get('expected');
    let expectedCount: number | null = null;

    if (expectedParam !== null) {
        expectedCount = Number(expectedParam);
        if (!Number.isInteger(expectedCount) || expectedCount <= 0) {
            return NextResponse.json(
                { error: '`expected` query parameter must be a positive integer.' },
                { status: 400, headers: RESPONSE_HEADERS },
            );
        }
    }

    // ------------------------------------------------------------------
    // Load & validate project config
    // ------------------------------------------------------------------
    const envProjects = process.env.SUPABASE_MONITOR_PROJECTS;

    if (!envProjects) {
        return NextResponse.json(
            {
                error:
                    'No projects configured. Set SUPABASE_MONITOR_PROJECTS env var with a JSON array of {id, url, key} objects.',
            },
            { status: 503, headers: RESPONSE_HEADERS },
        );
    }

    let projects: ProjectConfig[];

    try {
        projects = parseProjects(envProjects);
    } catch (err) {
        console.error('[monitor] Failed to parse SUPABASE_MONITOR_PROJECTS:', err);
        return NextResponse.json(
            { error: 'Invalid SUPABASE_MONITOR_PROJECTS configuration' },
            { status: 500, headers: RESPONSE_HEADERS },
        );
    }

    if (projects.length === 0) {
        return NextResponse.json(
            { error: 'No valid projects found in SUPABASE_MONITOR_PROJECTS' },
            { status: 503, headers: RESPONSE_HEADERS },
        );
    }

    // ------------------------------------------------------------------
    // Verify project count matches the expected value (if provided)
    // ------------------------------------------------------------------
    if (expectedCount !== null && projects.length !== expectedCount) {
        return NextResponse.json(
            {
                error: `Project count mismatch: expected ${expectedCount}, but found ${projects.length} configured project(s).`,
                expected: expectedCount,
                actual: projects.length,
            },
            { status: 409, headers: RESPONSE_HEADERS },
        );
    }

    // ------------------------------------------------------------------
    // Run health-checks
    // ------------------------------------------------------------------
    const results = await Promise.allSettled(projects.map(checkProject));

    const healthResults: HealthResult[] = results.map((r, i) =>
        r.status === 'fulfilled'
            ? r.value
            : {
                id: projects[i].id,
                status: 'error' as const,
                error: getErrorMessage(r.reason),
                server_time: new Date().toISOString(),
            },
    );

    return NextResponse.json(
        { results: healthResults, project_count: projects.length },
        { headers: RESPONSE_HEADERS },
    );
}
