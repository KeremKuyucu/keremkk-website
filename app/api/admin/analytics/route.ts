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
                .order('created_at', { ascending: false })
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

        // Map unique UIDs to Supabase users (auth.users and profiles)
        const uniqueUids = Array.from(new Set(allLogs.map((l) => l.uid).filter(Boolean)));
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
            console.error("Error fetching auth users:", e);
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
            // Profiles table may not exist
        }

        // 3. For any missing UIDs that look like valid UUIDs, try single lookup
        const missingUids = uniqueUids.filter((uid) => !usersMap[uid] && uid.length === 36);
        for (const mUid of missingUids.slice(0, 20)) {
            try {
                const { data: singleUser } = await supabase.auth.admin.getUserById(mUid);
                if (singleUser?.user) {
                    const meta = singleUser.user.user_metadata || {};
                    const name =
                        meta.full_name ||
                        meta.name ||
                        meta.display_name ||
                        (singleUser.user.email ? singleUser.user.email.split("@")[0] : null);

                    usersMap[mUid] = {
                        name: name || "Kayıtlı Kullanıcı",
                        email: singleUser.user.email,
                        avatar_url: meta.avatar_url,
                    };
                }
            } catch {
                // Not a valid auth user
            }
        }

        const normalizedLogs = allLogs.map((l) => ({
            ...l,
            timestamp: l.created_at || l.timestamp,
        }));

        return NextResponse.json({
            logs: normalizedLogs,
            total_count: totalCount || normalizedLogs.length,
            users: usersMap
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
