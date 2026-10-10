import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// İzin verilen güvenli alan adları
const ALLOWED_HOSTS = new Set([
    "keremkk.com.tr",
    "www.keremkk.com.tr",
    "localhost:3000",
    "127.0.0.1:3000"
]);

function getSafeOrigin(request: Request, requestUrl: URL): string {
    if (process.env.NODE_ENV === "development") {
        return requestUrl.origin;
    }

    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

    if (forwardedHost && ALLOWED_HOSTS.has(forwardedHost)) {
        return `${forwardedProto}://${forwardedHost}`;
    }

    if (ALLOWED_HOSTS.has(requestUrl.host)) {
        return requestUrl.origin;
    }

    return "https://keremkk.com.tr";
}

function sanitizeNextUrl(rawNext: string | null): string {
    if (!rawNext) {
        return "/admin";
    }

    // Açık yönlendirmeyi önle: Sadece tek '/' ile başlamalı, '//' veya ters eğik çizgi barındırmamalı
    if (rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/\\")) {
        return rawNext;
    }

    return "/admin";
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const rawNext = requestUrl.searchParams.get("next");

    const origin = getSafeOrigin(request, requestUrl);
    const safeNext = sanitizeNextUrl(rawNext);

    if (code) {
        const supabase = await createClient();
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && session?.user) {
            const userId = session.user.id;

            // Check admin_users table
            let isAdmin = false;
            try {
                const adminDb = createAdminClient();
                const { data: adminRecord } = await adminDb
                    .from("admin_users")
                    .select("role")
                    .eq("user_id", userId)
                    .maybeSingle();

                if (adminRecord) {
                    isAdmin = true;
                }
            } catch (e) {
                console.error("Error querying admin_users in callback:", e);
            }

            if (isAdmin) {
                return NextResponse.redirect(`${origin}${safeNext}`);
            }

            // Not an admin: sign out immediately and redirect with unauthorized error
            await supabase.auth.signOut();
            return NextResponse.redirect(`${origin}/admin?error=unauthorized`);
        }
    }

    return NextResponse.redirect(`${origin}/admin?error=auth_failed`);
}