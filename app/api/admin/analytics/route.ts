import { NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = createAdminClient();
        
        // Fetch the last 100 logs
        const { data: logs, error: logsError } = await supabase
            .from('app_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);

        if (logsError) throw logsError;

        // Optionally, we can compute simple aggregations here (e.g. today's distinct users)
        // For now, we will return the logs and let the front-end handle basic presentation.
        
        return NextResponse.json({ logs: logs || [] });
    } catch (error) {
        console.error("Analytics GET error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
