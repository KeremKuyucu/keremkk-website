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
        const limitParam = url.searchParams.get("limit") || "300";
        const appParam = url.searchParams.get("app");
        const searchParam = url.searchParams.get("search");

        const isAll = limitParam.toLowerCase() === "all";
        const targetLimit = isAll ? 5000 : Math.max(parseInt(limitParam, 10) || 300, 10);

        const supabase = createAdminClient();

        let query = supabase
            .from("app_error_logs")
            .select("*", { count: "exact" })
            .order("timestamp", { ascending: false })
            .limit(targetLimit);

        if (appParam && appParam !== "all") {
            query = query.eq("app_name", appParam);
        }

        if (searchParam && searchParam.trim()) {
            const s = searchParam.trim();
            query = query.or(`message.ilike.%${s}%,event.ilike.%${s}%,uid.ilike.%${s}%,ip_address.ilike.%${s}%`);
        }

        const { data: logs, count, error: logsError } = await query;

        if (logsError) {
            // If table does not exist yet in Supabase
            if (logsError.code === "42P01" || logsError.message?.includes("does not exist")) {
                return NextResponse.json({
                    logs: [],
                    total_count: 0,
                    users: {},
                    tableMissing: true,
                    error: "Table 'app_error_logs' does not exist yet. Please create it in Supabase.",
                });
            }
            throw logsError;
        }

        const errorLogs = logs || [];

        // Map unique UIDs to Supabase users (auth.users and profiles)
        const uniqueUids = Array.from(new Set(errorLogs.map((l) => l.uid).filter(Boolean)));
        const usersMap: Record<string, { name: string; email?: string; avatar_url?: string }> = {};

        try {
            // 1. Fetch Supabase auth users
            const { data: authData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
            if (authData?.users) {
                for (const u of authData.users) {
                    const meta = u.user_metadata || {};
                    const name =
                        meta.full_name ||
                        meta.name ||
                        meta.display_name ||
                        (u.email ? u.email.split("@")[0] : null);

                    usersMap[u.id] = {
                        name: name || "Kayıtlı Kullanıcı",
                        email: u.email,
                        avatar_url: meta.avatar_url,
                    };
                }
            }
        } catch (e) {
            console.error("Error fetching auth users for error-logs:", e);
        }

        try {
            // 2. Fetch profiles table if exists
            const { data: profiles } = await supabase
                .from("profiles")
                .select("uid, full_name, avatar_url");

            if (profiles && Array.isArray(profiles)) {
                for (const p of profiles) {
                    if (p.uid) {
                        if (!usersMap[p.uid]) {
                            usersMap[p.uid] = {
                                name: p.full_name || "Kullanıcı",
                                avatar_url: p.avatar_url,
                            };
                        } else if (p.full_name) {
                            usersMap[p.uid].name = p.full_name;
                            if (p.avatar_url) usersMap[p.uid].avatar_url = p.avatar_url;
                        }
                    }
                }
            }
        } catch {
            // Ignore if profiles table does not exist
        }

        return NextResponse.json({
            logs: errorLogs,
            total_count: count ?? errorLogs.length,
            users: usersMap,
        });
    } catch (error) {
        console.error("Admin Error Logs GET error:", error);
        return NextResponse.json({ error: "Failed to load error logs" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, ids, clear_all, app } = body;

        const supabase = createAdminClient();

        if (clear_all) {
            let query = supabase.from("app_error_logs").delete();
            if (app && app !== "all") {
                query = query.eq("app_name", app);
            } else {
                query = query.neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all
            }

            const { error } = await query;
            if (error) throw error;
            return NextResponse.json({ success: true, message: "Cleared all error logs" });
        }

        if (id) {
            const { error } = await supabase
                .from("app_error_logs")
                .delete()
                .eq("id", id);

            if (error) throw error;
            return NextResponse.json({ success: true, deleted: [id] });
        }

        if (Array.isArray(ids) && ids.length > 0) {
            const { error } = await supabase
                .from("app_error_logs")
                .delete()
                .in("id", ids);

            if (error) throw error;
            return NextResponse.json({ success: true, deleted: ids });
        }

        return NextResponse.json({ error: "Missing log ID(s)" }, { status: 400 });
    } catch (error) {
        console.error("Admin Error Logs DELETE error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
