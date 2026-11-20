import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import {
    getMonitorProjects,
    checkMonitorTarget,
    recordMonitorResult,
    HealthResult,
} from '@/lib/monitor/monitor';
import { sendBatchMonitorAlertEmail } from '@/lib/monitor/email';
import { validateSession } from '@/lib/server-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

const RESPONSE_HEADERS: HeadersInit = {
    'Cache-Control': 'no-store, max-age=0',
};

function verifyCronSecret(authHeader: string | null, secret: string | undefined): boolean {
    if (!authHeader || !secret) return false;
    const expected = `Bearer ${secret.trim()}`;
    if (authHeader.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));
}

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const isCronAuthorized = verifyCronSecret(authHeader, process.env.CRON_SECRET);
    const isAdminAuthorized = isCronAuthorized ? false : await validateSession(req);

    if (!isCronAuthorized && !isAdminAuthorized) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401, headers: RESPONSE_HEADERS }
        );
    }

    const expectedParam = req.nextUrl.searchParams.get('expected');
    let expectedCount: number | null = null;

    if (expectedParam !== null) {
        expectedCount = Number(expectedParam);
        if (!Number.isInteger(expectedCount) || expectedCount <= 0) {
            return NextResponse.json(
                { error: '`expected` must be a positive integer' },
                { status: 400, headers: RESPONSE_HEADERS },
            );
        }
    }

    let projects;
    try {
        projects = await getMonitorProjects(true);
    } catch (err) {
        console.error('[monitor] Error fetching monitor projects from Supabase:', err);
        return NextResponse.json(
            {
                error: 'Failed to fetch monitor projects from database',
                details: err instanceof Error ? err.message : 'Unknown error',
            },
            { status: 500, headers: RESPONSE_HEADERS },
        );
    }

    if (projects.length === 0) {
        return NextResponse.json(
            { error: 'No active monitor projects found' },
            { status: 503, headers: RESPONSE_HEADERS },
        );
    }

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

    const settledChecks = await Promise.allSettled(
        projects.map(async (project) => {
            const result = await checkMonitorTarget({
                id: project.id,
                name: project.name,
                type: project.type,
                url: project.url,
                key: project.key,
            });

            await recordMonitorResult(project.id, result);
            return { project, result };
        })
    );

    const results: (HealthResult & { alert_sent?: boolean })[] = [];
    const failedItems: { project: (typeof projects)[number]; result: HealthResult }[] = [];

    for (const item of settledChecks) {
        if (item.status === 'fulfilled') {
            const { project, result } = item.value;
            if (result.status !== 'ok') {
                console.warn(
                    `🚨 [monitor] Hedef başarısız: "${project.name}" (${project.type}) - Durum: ${result.status} - Hata: ${result.error}`,
                );
                failedItems.push({ project, result });
            } else {
                results.push({ ...result, alert_sent: false });
            }
        }
    }

    if (failedItems.length > 0) {
        const emailRes = await sendBatchMonitorAlertEmail(
            failedItems.map(({ project, result }) => ({
                projectName: project.name,
                projectType: project.type,
                targetUrl: project.url,
                status: result.status,
                error: result.error,
                duration: result.duration,
                timestamp: result.server_time,
            }))
        );

        for (const { result } of failedItems) {
            results.push({
                ...result,
                alert_sent: emailRes.success,
            });
        }
    }

    const failedCount = results.filter((r) => r.status !== 'ok').length;

    return NextResponse.json(
        {
            success: true,
            total_checked: projects.length,
            healthy_count: projects.length - failedCount,
            failed_count: failedCount,
            results,
        },
        {
            status: failedCount > 0 ? 207 : 200,
            headers: RESPONSE_HEADERS,
        },
    );
}