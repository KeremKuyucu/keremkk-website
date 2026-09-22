import { NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const url = new URL(request.url);
        const limitParam = url.searchParams.get("limit") || "all";
        const appParam = url.searchParams.get("app");

        const isAll = limitParam.toLowerCase() === "all";
        const targetLimit = isAll ? 20000 : Math.max(parseInt(limitParam, 10) || 300, 10);

        const supabase = createAdminClient();

        const CHUNK_SIZE = 1000;
        const allLogs: any[] = [];
        let from = 0;
        let totalCount = 0;

        while (allLogs.length < targetLimit) {
            const currentFetchSize = Math.min(CHUNK_SIZE, targetLimit - allLogs.length);
            const to = from + currentFetchSize - 1;

            let query = supabase
                .from('app_logs')
                .select('*', { count: 'exact' })
                .order('timestamp', { ascending: false })
                .range(from, to);

            if (appParam && appParam !== "all") {
                query = query.eq('app_name', appParam);
            }

            const { data: logs, count, error: logsError } = await query;
            if (logsError) throw logsError;

            if (typeof count === 'number') {
                totalCount = count;
            }

            if (!logs || logs.length === 0) {
                break;
            }

            allLogs.push(...logs);

            if (logs.length < currentFetchSize || (totalCount > 0 && allLogs.length >= totalCount)) {
                break;
            }

            from += logs.length;
        }

        return NextResponse.json({
            logs: allLogs,
            total_count: totalCount || allLogs.length
        });
    } catch (error) {
        console.error("Analytics GET error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, ids } = body;

        const supabase = createAdminClient();

        if (id) {
            const { error } = await supabase
                .from('app_logs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return NextResponse.json({ success: true, deleted: [id] });
        }

        if (Array.isArray(ids) && ids.length > 0) {
            const { error } = await supabase
                .from('app_logs')
                .delete()
                .in('id', ids);

            if (error) throw error;
            return NextResponse.json({ success: true, deleted: ids });
        }

        return NextResponse.json({ error: "Missing log ID(s)" }, { status: 400 });
    } catch (error) {
        console.error("Analytics DELETE error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
