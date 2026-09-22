import { NextRequest, NextResponse } from 'next/server'
import { getMonitorClient, getMonitorProjects, MonitorProjectConfig } from '@/lib/supabase/monitor'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type HealthResult = {
    id: string
    name: string
    status: 'ok' | 'error' | 'timeout'
    data?: unknown
    error?: string
    duration: number
    server_time: string
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const HEALTHCHECK_TIMEOUT_MS = 10_000

const RESPONSE_HEADERS: HeadersInit = {
    'Cache-Control': 'no-store, max-age=0',
}

// -----------------------------------------------------------------------------
// Health Check
// -----------------------------------------------------------------------------

async function checkProject(project: MonitorProjectConfig): Promise<HealthResult> {
    const supabase = getMonitorClient(project)
    const start = Date.now()

    try {
        const result = await Promise.race([
            supabase.rpc('healthcheck'),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), HEALTHCHECK_TIMEOUT_MS),
            ),
        ])

        const duration = Date.now() - start

        if (result.error) {
            return {
                id: project.id,
                name: project.name,
                status: 'error',
                error: result.error.message,
                duration,
                server_time: new Date().toISOString(),
            }
        }

        return {
            id: project.id,
            name: project.name,
            status: 'ok',
            data: result.data,
            duration,
            server_time: new Date().toISOString(),
        }
    } catch (err) {
        const duration = Date.now() - start

        return {
            id: project.id,
            name: project.name,
            status: err instanceof Error && err.message === 'timeout'
                ? 'timeout'
                : 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
            duration,
            server_time: new Date().toISOString(),
        }
    }
}

// -----------------------------------------------------------------------------
// Route
// -----------------------------------------------------------------------------

export async function GET(req: NextRequest) {
    const expectedParam = req.nextUrl.searchParams.get('expected')
    let expectedCount: number | null = null

    if (expectedParam !== null) {
        expectedCount = Number(expectedParam)
        if (!Number.isInteger(expectedCount) || expectedCount <= 0) {
            return NextResponse.json(
                { error: '`expected` must be a positive integer' },
                { status: 400, headers: RESPONSE_HEADERS },
            )
        }
    }

    let projects: MonitorProjectConfig[]

    try {
        projects = await getMonitorProjects()
    } catch (err) {
        console.error('[monitor] Error fetching monitor projects from Supabase:', err)
        return NextResponse.json(
            {
                error: 'Failed to fetch monitor projects from database',
                details: err instanceof Error ? err.message : 'Unknown error',
            },
            { status: 500, headers: RESPONSE_HEADERS },
        )
    }

    if (projects.length === 0) {
        return NextResponse.json(
            { error: 'No active monitor projects found' },
            { status: 503, headers: RESPONSE_HEADERS },
        )
    }

    if (expectedCount !== null && projects.length !== expectedCount) {
        return NextResponse.json(
            {
                error: `Project count mismatch: expected ${expectedCount}, but found ${projects.length} configured project(s).`,
                expected: expectedCount,
                actual: projects.length,
            },
            { status: 409, headers: RESPONSE_HEADERS },
        )
    }

    const results = await Promise.all(projects.map(checkProject))

    return NextResponse.json(
        {
            results,
            project_count: projects.length,
        },
        { headers: RESPONSE_HEADERS },
    )
}