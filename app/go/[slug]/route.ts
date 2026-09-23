import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteProps {
    params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
    try {
        const { slug } = await params;
        if (!slug) {
            return NextResponse.redirect(new URL("/", request.url), 302);
        }

        const normalizedSlug = slug.toLowerCase().trim();
        const supabase = createAdminClient();

        // 1. Linki sorgula
        const { data: link, error } = await supabase
            .from("short_links")
            .select("id, target_url, clicks, is_active")
            .eq("slug", normalizedSlug)
            .maybeSingle();

        if (error || !link || !link.is_active || !link.target_url) {
            // Link bulunamadı veya pasif: Ana sayfaya yönlendir
            return NextResponse.redirect(new URL("/?ref=link_not_found", request.url), 302);
        }

        // 2. Tıklanma sayısını ve son tıklanma zamanını güncelle
        try {
            await supabase
                .from("short_links")
                .update({
                    clicks: (link.clicks || 0) + 1,
                    last_clicked_at: new Date().toISOString()
                })
                .eq("id", link.id);
        } catch (updateErr) {
            console.error("Link click count update error:", updateErr);
            // Yönlendirmeyi aksatmamak için hatayı yut
        }

        // 3. Hedef adrese 307 (Temporary Redirect) ile yönlendir
        // 307 seçildi çünkü 301/308 tarayıcı tarafından agresif şekilde önbelleğe alınır ve sonraki tıklamaları sayamayız.
        let targetUrl = link.target_url;
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = `https://${targetUrl}`;
        }

        return NextResponse.redirect(targetUrl, 307);
    } catch (err) {
        console.error("Short link redirect error:", err);
        return NextResponse.redirect(new URL("/", request.url), 302);
    }
}
