import { NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// GET: Fetch all monitor projects (both enabled & disabled)
// -----------------------------------------------------------------------------
export async function GET(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = createAdminClient();
        const { data: projects, error } = await supabase
            .from("monitor_projects")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, projects: projects || [] });
    } catch (error) {
        console.error("[admin/monitor] GET error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Error" },
            { status: 500 },
        );
    }
}

// -----------------------------------------------------------------------------
// POST: Add new monitor project OR test connection
// -----------------------------------------------------------------------------
export async function POST(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { action, name, supabase_url, supabase_key, enabled } = body;

        // Action: Live Health Check Test
        if (action === "test") {
            if (!supabase_url || !supabase_key) {
                return NextResponse.json(
                    { error: "supabase_url and supabase_key are required for testing" },
                    { status: 400 },
                );
            }

            const cleanUrl = String(supabase_url).trim().replace(/\/+$/, "");
            const cleanKey = String(supabase_key).trim();

            const testClient = createSupabaseClient(cleanUrl, cleanKey, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                },
            });

            const start = Date.now();
            try {
                const result = await Promise.race([
                    testClient.rpc("healthcheck"),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout (10s)")), 10_000),
                    ),
                ]);

                const duration = Date.now() - start;

                if (result.error) {
                    return NextResponse.json({
                        ok: false,
                        status: "error",
                        error: result.error.message,
                        duration,
                    });
                }

                return NextResponse.json({
                    ok: true,
                    status: "ok",
                    data: result.data,
                    duration,
                });
            } catch (testErr) {
                const duration = Date.now() - start;
                const isTimeout =
                    testErr instanceof Error && testErr.message.includes("Timeout");
                return NextResponse.json({
                    ok: false,
                    status: isTimeout ? "timeout" : "error",
                    error:
                        testErr instanceof Error ? testErr.message : "Connection failed",
                    duration,
                });
            }
        }

        // Action: Create Project
        if (!name || !supabase_url || !supabase_key) {
            return NextResponse.json(
                { error: "Proje adı, Supabase URL ve Key zorunludur." },
                { status: 400 },
            );
        }

        const cleanUrl = String(supabase_url).trim().replace(/\/+$/, "");
        const cleanKey = String(supabase_key).trim();
        const cleanName = String(name).trim();

        const supabase = createAdminClient();
        const { data: newProject, error } = await supabase
            .from("monitor_projects")
            .insert({
                name: cleanName,
                supabase_url: cleanUrl,
                supabase_key: cleanKey,
                enabled: enabled !== undefined ? Boolean(enabled) : true,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, project: newProject });
    } catch (error) {
        console.error("[admin/monitor] POST error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Error" },
            { status: 500 },
        );
    }
}

// -----------------------------------------------------------------------------
// PUT: Update project (name, url, key, enabled)
// -----------------------------------------------------------------------------
export async function PUT(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, name, supabase_url, supabase_key, enabled } = body;

        if (!id) {
            return NextResponse.json({ error: "Proje ID zorunludur." }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = String(name).trim();
        if (supabase_url !== undefined) {
            updateData.supabase_url = String(supabase_url).trim().replace(/\/+$/, "");
        }
        if (supabase_key !== undefined) updateData.supabase_key = String(supabase_key).trim();
        if (enabled !== undefined) updateData.enabled = Boolean(enabled);

        const supabase = createAdminClient();
        const { data: updatedProject, error } = await supabase
            .from("monitor_projects")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, project: updatedProject });
    } catch (error) {
        console.error("[admin/monitor] PUT error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Error" },
            { status: 500 },
        );
    }
}

// -----------------------------------------------------------------------------
// DELETE: Remove project
// -----------------------------------------------------------------------------
export async function DELETE(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "Proje ID zorunludur." }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("monitor_projects")
            .delete()
            .eq("id", id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[admin/monitor] DELETE error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Error" },
            { status: 500 },
        );
    }
}
