import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: Tüm abonelikleri listele
export async function GET(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);
        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createAdminClient();
        const { data: subscriptions, error } = await supabase
            .from("subscriptions")
            .select("*")
            .order("renewal_date", { ascending: true });

        if (error) {
            console.error("Subscriptions fetch error:", error);
            return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
        }

        return NextResponse.json({ subscriptions: subscriptions || [] });
    } catch (error: any) {
        console.error("Subscriptions GET error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch subscriptions" }, { status: 500 });
    }
}

// POST: Yeni abonelik ekle
export async function POST(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);
        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            category,
            price,
            currency,
            billing_cycle,
            renewal_date,
            status,
            payment_method,
            auto_renew,
            url,
            notes
        } = body;

        if (!name || price === undefined || !renewal_date) {
            return NextResponse.json(
                { error: "Abonelik adı, fiyat ve yenileme tarihi zorunludur." },
                { status: 400 }
            );
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return NextResponse.json({ error: "Geçersiz fiyat tutarı." }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data: newSub, error } = await supabase
            .from("subscriptions")
            .insert({
                name: name.trim(),
                category: category || "other",
                price: parsedPrice,
                currency: currency || "TRY",
                billing_cycle: billing_cycle || "monthly",
                renewal_date: renewal_date,
                status: status || "active",
                payment_method: payment_method?.trim() || null,
                auto_renew: auto_renew ?? true,
                url: url?.trim() || null,
                notes: notes?.trim() || null
            })
            .select()
            .single();

        if (error) {
            console.error("Subscription insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, subscription: newSub });
    } catch (error: any) {
        console.error("Subscriptions POST error:", error);
        return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 });
    }
}

// PUT: Var olan aboneliği güncelle
export async function PUT(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);
        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            id,
            name,
            category,
            price,
            currency,
            billing_cycle,
            renewal_date,
            status,
            payment_method,
            auto_renew,
            url,
            notes,
            advance_cycle // Bir sonraki ödeme dönemine aktarma bayrağı
        } = body;

        if (!id) {
            return NextResponse.json({ error: "Abonelik ID gereklidir." }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Eğer tek tıkla "Yenilendi/Ödendi" yapılmışsa ve advance_cycle istenmişse
        if (advance_cycle && renewal_date && billing_cycle) {
            const currentDate = new Date(renewal_date);
            if (!isNaN(currentDate.getTime())) {
                let nextDate = new Date(currentDate);
                if (billing_cycle === "yearly") {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                } else if (billing_cycle === "quarterly") {
                    nextDate.setMonth(nextDate.getMonth() + 3);
                } else {
                    // monthly
                    nextDate.setMonth(nextDate.getMonth() + 1);
                }

                const nextDateString = nextDate.toISOString().split("T")[0];
                const { data: advancedSub, error } = await supabase
                    .from("subscriptions")
                    .update({
                        renewal_date: nextDateString,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", id)
                    .select()
                    .single();

                if (error) throw error;
                return NextResponse.json({ success: true, subscription: advancedSub });
            }
        }

        const updateData: Record<string, any> = {
            updated_at: new Date().toISOString()
        };

        if (name !== undefined) updateData.name = name.trim();
        if (category !== undefined) updateData.category = category;
        if (price !== undefined) {
            const p = parseFloat(price);
            if (!isNaN(p)) updateData.price = p;
        }
        if (currency !== undefined) updateData.currency = currency;
        if (billing_cycle !== undefined) updateData.billing_cycle = billing_cycle;
        if (renewal_date !== undefined) updateData.renewal_date = renewal_date;
        if (status !== undefined) updateData.status = status;
        if (payment_method !== undefined) updateData.payment_method = payment_method?.trim() || null;
        if (auto_renew !== undefined) updateData.auto_renew = Boolean(auto_renew);
        if (url !== undefined) updateData.url = url?.trim() || null;
        if (notes !== undefined) updateData.notes = notes?.trim() || null;

        const { data: updatedSub, error } = await supabase
            .from("subscriptions")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Subscription update error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, subscription: updatedSub });
    } catch (error: any) {
        console.error("Subscriptions PUT error:", error);
        return NextResponse.json({ error: error.message || "Failed to update subscription" }, { status: 500 });
    }
}

// DELETE: Aboneliği sil
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
            return NextResponse.json({ error: "Silinecek ID belirtilmedi." }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("subscriptions")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Subscription delete error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, deletedId: id });
    } catch (error: any) {
        console.error("Subscriptions DELETE error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete subscription" }, { status: 500 });
    }
}
