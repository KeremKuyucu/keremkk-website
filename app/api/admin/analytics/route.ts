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
        const limitParam = parseInt(url.searchParams.get("limit") || "300", 10);
        const limit = Math.min(Math.max(isNaN(limitParam) ? 300 : limitParam, 10), 1000);

        const appParam = url.searchParams.get("app");

        const supabase = createAdminClient();

        let query = supabase
            .from('app_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (appParam && appParam !== "all") {
            query = query.eq('app_name', appParam);
        }

        const { data: logs, error: logsError } = await query;

        if (logsError) throw logsError;

        return NextResponse.json({ logs: logs || [] });
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
