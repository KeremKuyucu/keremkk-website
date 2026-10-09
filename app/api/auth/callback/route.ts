import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/admin";

    // Handle forwarded host for correct redirect when behind reverse proxy (e.g. Vercel)
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const origin = process.env.NODE_ENV === "development"
        ? requestUrl.origin
        : forwardedHost
            ? `${forwardedProto}://${forwardedHost}`
            : requestUrl.origin;

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
                return NextResponse.redirect(`${origin}${next}`);
            }

            // Not an admin: sign out immediately and redirect with unauthorized error
            await supabase.auth.signOut();
            return NextResponse.redirect(`${origin}/admin?error=unauthorized`);
        }
    }

    return NextResponse.redirect(`${origin}/admin?error=auth_failed`);
}
