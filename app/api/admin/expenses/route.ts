import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------- Types ----------
interface ExpenseInsert {
    date: string;
    description: string;
    amount: number;
    currency?: string;
    category: string;
    installment?: string | null;
}

// ---------- GET: Harcamaları ve TÜFE verisini getir ----------
export async function GET(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);

        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createAdminClient();

        // Paralel olarak hem harcamaları hem TÜFE verisini çek
        const [expensesResult, cpiResult] = await Promise.all([
            supabase
                .from("expenses")
                .select("*")
                .order("date", { ascending: false }),
            supabase
                .from("cpi_indices")
                .select("*")
                .order("period", { ascending: false }),
        ]);

        if (expensesResult.error) {
            console.error("Expenses fetch error:", expensesResult.error);
            throw expensesResult.error;
        }

        if (cpiResult.error) {
            console.error("CPI fetch error:", cpiResult.error);
            throw cpiResult.error;
        }

        return NextResponse.json({
            expenses: expensesResult.data || [],
            cpiIndices: cpiResult.data || [],
        });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return NextResponse.json(
            { error: "Failed to fetch expenses" },
            { status: 500 }
        );
    }
}

// ---------- POST: Toplu harcama ekle ----------
export async function POST(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);

        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { expenses } = body as { expenses: ExpenseInsert[] };

        if (!Array.isArray(expenses) || expenses.length === 0) {
            return NextResponse.json(
                { error: "Expenses array is required" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const rows = expenses.map((e) => ({
            date: e.date,
            description: e.description,
            amount: e.amount,
            currency: e.currency || "TRY",
            category: e.category,
            installment: e.installment || null,
        }));

        // Duplikasyon kontrolü: aynı date + amount + description varsa ekleme
        const dates = [...new Set(rows.map((r) => r.date))];
        const { data: existing } = await supabase
            .from("expenses")
            .select("date, amount, description")
            .in("date", dates);

        const existingKeys = new Set(
            (existing || []).map(
                (e: { date: string; amount: number; description: string }) =>
                    `${e.date}|${Number(e.amount)}|${e.description}`
            )
        );

        const uniqueRows = rows.filter(
            (r) => !existingKeys.has(`${r.date}|${r.amount}|${r.description}`)
        );

        if (uniqueRows.length === 0) {
            return NextResponse.json({
                success: true,
                inserted: [],
                skipped: rows.length,
                message: "Tüm harcamalar zaten kayıtlı",
            });
        }

        const { data, error } = await supabase
            .from("expenses")
            .insert(uniqueRows)
            .select();

        if (error) {
            console.error("Expenses insert error:", error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            inserted: data,
            skipped: rows.length - uniqueRows.length,
        });
    } catch (error) {
        console.error("Error saving expenses:", error);
        return NextResponse.json(
            { error: "Failed to save expenses" },
            { status: 500 }
        );
    }
}

// ---------- DELETE: Tekil harcama sil ----------
export async function DELETE(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);

        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id } = body as { id: string };

        if (!id) {
            return NextResponse.json(
                { error: "Expense ID is required" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { error } = await supabase
            .from("expenses")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Expense delete error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, deleted: id });
    } catch (error) {
        console.error("Error deleting expense:", error);
        return NextResponse.json(
            { error: "Failed to delete expense" },
            { status: 500 }
        );
    }
}
