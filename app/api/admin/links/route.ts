import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { createAdminClient } from "@/lib/supabase/admin";

// Slug format temizleme (küçük harf, türkçe karakter sadeleştirme, boşlukları tire yapma)
function sanitizeSlug(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

// GET: Tüm kısa linkleri getir
export async function GET(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);
        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createAdminClient();
        const { data: links, error } = await supabase
            .from("short_links")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Short links fetch error:", error);
            // Tablo henüz oluşturulmamışsa bilgilendirici hata ver
            return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
        }

        return NextResponse.json({ links: links || [] });
    } catch (error: any) {
        console.error("Links GET error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch links" }, { status: 500 });
    }
}

// POST: Yeni kısa link ekle
export async function POST(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);
        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, slug, target_url, description, is_active } = body;

        if (!title || !slug || !target_url) {
            return NextResponse.json(
                { error: "Başlık, slug ve hedef URL alanları zorunludur." },
                { status: 400 }
            );
        }

        const cleanSlug = sanitizeSlug(slug);
        if (!cleanSlug) {
            return NextResponse.json(
                { error: "Geçersiz slug formatı." },
                { status: 400 }
            );
        }

        // Hedef URL format kontrolü
        let formattedUrl = target_url.trim();
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
            formattedUrl = `https://${formattedUrl}`;
        }

        const supabase = createAdminClient();

        // Slug benzersizlik kontrolü
        const { data: existing } = await supabase
            .from("short_links")
            .select("id")
            .eq("slug", cleanSlug)
            .maybeSingle();

        if (existing) {
            return NextResponse.json(
                { error: `"${cleanSlug}" kısaltması zaten kullanılıyor. Lütfen farklı bir slug seçin.` },
                { status: 409 }
            );
        }

        const { data: newLink, error } = await supabase
            .from("short_links")
            .insert({
                title: title.trim(),
                slug: cleanSlug,
                target_url: formattedUrl,
                description: description?.trim() || null,
                is_active: is_active ?? true,
                clicks: 0
            })
            .select()
            .single();

        if (error) {
            console.error("Short link insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, link: newLink });
    } catch (error: any) {
        console.error("Links POST error:", error);
        return NextResponse.json({ error: error.message || "Failed to create link" }, { status: 500 });
    }
}

// PUT: Var olan kısa linki güncelle
export async function PUT(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);
        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, title, slug, target_url, description, is_active, reset_clicks } = body;

        if (!id) {
            return NextResponse.json({ error: "Link ID gereklidir." }, { status: 400 });
        }

        const supabase = createAdminClient();

        const updateData: Record<string, any> = {
            updated_at: new Date().toISOString()
        };

        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (is_active !== undefined) updateData.is_active = Boolean(is_active);
        if (reset_clicks === true) updateData.clicks = 0;

        if (target_url !== undefined) {
            let formattedUrl = target_url.trim();
            if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
                formattedUrl = `https://${formattedUrl}`;
            }
            updateData.target_url = formattedUrl;
        }

        if (slug !== undefined) {
            const cleanSlug = sanitizeSlug(slug);
            if (!cleanSlug) {
                return NextResponse.json({ error: "Geçersiz slug." }, { status: 400 });
            }

            // Başka bir link aynı slug'ı kullanıyor mu?
            const { data: conflict } = await supabase
                .from("short_links")
                .select("id")
                .eq("slug", cleanSlug)
                .neq("id", id)
                .maybeSingle();

            if (conflict) {
                return NextResponse.json(
                    { error: `"${cleanSlug}" kısaltması başka bir link tarafından kullanılıyor.` },
                    { status: 409 }
                );
            }
            updateData.slug = cleanSlug;
        }

        const { data: updatedLink, error } = await supabase
            .from("short_links")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Short link update error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, link: updatedLink });
    } catch (error: any) {
        console.error("Links PUT error:", error);
        return NextResponse.json({ error: error.message || "Failed to update link" }, { status: 500 });
    }
}

// DELETE: Linki sil
export async function DELETE(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);
        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "Silinecek link ID'si belirtilmedi." }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("short_links")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Short link delete error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, deletedId: id });
    } catch (error: any) {
        console.error("Links DELETE error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete link" }, { status: 500 });
    }
}
