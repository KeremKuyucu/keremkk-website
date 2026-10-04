import { NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import {
    checkMonitorTarget,
    recordMonitorResult,
    MonitorTargetType,
} from "@/lib/supabase/monitor";
import { sendMonitorAlertEmail } from "@/lib/email";

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
            .select("id, name, supabase_url, supabase_key, type, enabled, last_tested_at, last_ping_ms, last_status, last_error, created_at, updated_at")
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        // Normalize type
        const normalized = (projects || []).map((p) => ({
            ...p,
            type: (p.type === "website" ? "website" : "supabase") as MonitorTargetType,
            last_ping_ms: p.last_ping_ms !== undefined && p.last_ping_ms !== null ? Number(p.last_ping_ms) : null,
        }));

        return NextResponse.json({ success: true, projects: normalized });
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
        const {
            action,
            id,
            name,
            type = "supabase",
            supabase_url,
            url,
            supabase_key,
            enabled,
            send_alert = true,
        } = body;

        const targetUrl = String(supabase_url || url || "").trim();
        const targetType: MonitorTargetType = type === "website" ? "website" : "supabase";

        // Action: Live Health Check Test (Single Target)
        if (action === "test") {
            if (!targetUrl) {
                return NextResponse.json(
                    { error: "URL adresi zorunludur." },
                    { status: 400 },
                );
            }

            if (targetType === "supabase" && !supabase_key) {
                return NextResponse.json(
                    { error: "Supabase projeleri için Key zorunludur." },
                    { status: 400 },
                );
            }

            const result = await checkMonitorTarget({
                id: id || "preview-test",
                name: name || (targetType === "website" ? "Web Sitesi" : "Supabase Projesi"),
                type: targetType,
                url: targetUrl,
                key: supabase_key,
            });

            // Eğer kayıtlı bir proje test edildiyse veritabanına son test tarihini ve ping süresini işle
            if (id) {
                await recordMonitorResult(id, result);

                // Eğer test başarısız olduysa ve bildirim isteniyorsa e-posta uyarısı gönder
                if (result.status !== "ok" && send_alert) {
                    await sendMonitorAlertEmail({
                        projectName: name || "İzlenen Hedef",
                        projectType: targetType,
                        targetUrl,
                        status: result.status,
                        error: result.error,
                        duration: result.duration,
                        timestamp: result.server_time,
                    });
                }
            }

            return NextResponse.json({
                ok: result.status === "ok",
                status: result.status,
                duration: result.duration,
                error: result.error,
                data: result.data,
                last_tested_at: result.server_time,
                last_ping_ms: result.duration,
                last_status: result.status,
                last_error: result.error,
            });
        }

        // Action: Create Project
        if (!name || !targetUrl) {
            return NextResponse.json(
                { error: "Proje / Site adı ve URL zorunludur." },
                { status: 400 },
            );
        }

        if (targetType === "supabase" && !supabase_key) {
            return NextResponse.json(
                { error: "Supabase projeleri için Anon / Service Key zorunludur." },
                { status: 400 },
            );
        }

        const cleanUrl = targetUrl.replace(/\/+$/, "");
        const cleanKey = supabase_key ? String(supabase_key).trim() : null;
        const cleanName = String(name).trim();

        const supabase = createAdminClient();
        const { data: newProject, error } = await supabase
            .from("monitor_projects")
            .insert({
                name: cleanName,
                supabase_url: cleanUrl,
                supabase_key: cleanKey,
                type: targetType,
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
// PUT: Update project (name, type, url, key, enabled)
// -----------------------------------------------------------------------------
export async function PUT(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, name, type, supabase_url, url, supabase_key, enabled } = body;

        if (!id) {
            return NextResponse.json({ error: "Proje ID zorunludur." }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = String(name).trim();
        if (type !== undefined) updateData.type = type === "website" ? "website" : "supabase";
        if (supabase_url !== undefined || url !== undefined) {
            const rawUrl = supabase_url !== undefined ? supabase_url : url;
            updateData.supabase_url = String(rawUrl).trim().replace(/\/+$/, "");
        }
        if (supabase_key !== undefined) {
            updateData.supabase_key = supabase_key ? String(supabase_key).trim() : null;
        }
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
