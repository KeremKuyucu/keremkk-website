import { NextRequest, NextResponse } from 'next/server';
import {
    getMonitorProjects,
    checkMonitorTarget,
    recordMonitorResult,
    HealthResult,
} from '@/lib/supabase/monitor';
import { sendMonitorAlertEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RESPONSE_HEADERS: HeadersInit = {
    'Cache-Control': 'no-store, max-age=0',
};

export async function GET(req: NextRequest) {
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

    // Run health checks on all active targets (Supabase & Websites)
    const results: (HealthResult & { alert_sent?: boolean })[] = [];

    for (const project of projects) {
        const result = await checkMonitorTarget({
            id: project.id,
            name: project.name,
            type: project.type,
            url: project.url,
            key: project.key,
        });

        // 1. Veritabanında son test tarihi ve ping süresini kaydet
        await recordMonitorResult(project.id, result);

        // 2. Eğer hedef olumlu yanıt vermez ise alarm e-postası gönder
        let alertSent = false;
        if (result.status !== 'ok') {
            console.warn(
                `🚨 [monitor] Hedef başarısız: "${project.name}" (${project.type}) - Durum: ${result.status} - Hata: ${result.error}`,
            );
            const emailRes = await sendMonitorAlertEmail({
                projectName: project.name,
                projectType: project.type,
                targetUrl: project.url,
                status: result.status,
                error: result.error,
                duration: result.duration,
                timestamp: result.server_time,
            });
            alertSent = emailRes.success;
        }

        results.push({ ...result, alert_sent: alertSent });
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