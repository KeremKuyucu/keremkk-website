import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import {
    EXPENSE_CATEGORIES as CATEGORIES,
    isExpenseCategory,
} from "@/lib/expense-categories";

// ---------- Types ----------

interface ExpenseInsert {
    date: string;
    description: string;
    amount: number;
    currency?: string;
    category: string;
    installment?: string | null;
}


// ---------- Helpers ----------

function isValidDate(value: unknown): value is string {
    if (typeof value !== "string") {
        return false;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeDescription(value: string): string {
    return value.trim();
}

function makeExpenseKey(
    date: string,
    amount: number,
    description: string
): string {
    return `${date}|${Number(amount).toFixed(2)}|${description
        .trim()
        .toLocaleLowerCase("tr-TR")}`;
}

// ---------- GET: Harcamaları ve TÜFE verisini getir ----------

export async function GET(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");

        const isValid = await validateSession(authToken);

        if (!isValid) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const supabase = createAdminClient();

        const [expensesResult, cpiResult] = await Promise.all([
            supabase
                .from("expenses")
                .select(
                    "id, date, description, amount, currency, category, installment, created_at"
                )
                .order("date", {
                    ascending: false,
                })
                .order("created_at", {
                    ascending: false,
                }),

            supabase
                .from("cpi_indices")
                .select("period, index_value")
                .order("period", {
                    ascending: false,
                }),
        ]);

        if (expensesResult.error) {
            console.error(
                "Expenses fetch error:",
                expensesResult.error
            );

            return NextResponse.json(
                {
                    error: "Failed to fetch expenses",
                },
                { status: 500 }
            );
        }

        if (cpiResult.error) {
            console.error(
                "CPI fetch error:",
                cpiResult.error
            );

            return NextResponse.json(
                {
                    error: "Failed to fetch CPI data",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            expenses: expensesResult.data || [],
            cpiIndices: cpiResult.data || [],
        });
    } catch (error) {
        console.error(
            "Error fetching expenses:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to fetch expenses",
            },
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
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const { expenses } = body as {
            expenses: ExpenseInsert[];
        };

        if (
            !Array.isArray(expenses) ||
            expenses.length === 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Expenses array is required",
                },
                { status: 400 }
            );
        }

        if (expenses.length > 1000) {
            return NextResponse.json(
                {
                    error:
                        "Maximum 1000 expenses can be inserted at once",
                },
                { status: 400 }
            );
        }

        // ---------- Validate input ----------

        const invalidIndex = expenses.findIndex(
            (expense) => {
                if (!expense) {
                    return true;
                }

                if (!isValidDate(expense.date)) {
                    return true;
                }

                if (
                    typeof expense.description !==
                        "string" ||
                    !expense.description.trim()
                ) {
                    return true;
                }

                if (
                    typeof expense.amount !== "number" ||
                    !Number.isFinite(expense.amount) ||
                    expense.amount < 0
                ) {
                    return true;
                }

                if (
                    typeof expense.category !==
                        "string" ||
                    !expense.category.trim()
                ) {
                    return true;
                }

                if (
                    expense.installment !==
                        undefined &&
                    expense.installment !== null &&
                    typeof expense.installment !==
                        "string"
                ) {
                    return true;
                }

                return false;
            }
        );

        if (invalidIndex !== -1) {
            return NextResponse.json(
                {
                    error: `Invalid expense at index ${invalidIndex}`,
                },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // ---------- Normalize ----------

        const rows = expenses.map((expense) => ({
            date: expense.date,
            description: normalizeDescription(
                expense.description
            ),
            amount: Number(
                expense.amount.toFixed(2)
            ),
            currency:
                expense.currency?.trim() || "TRY",
            category: expense.category.trim(),
            installment:
                expense.installment?.trim() ||
                null,
        }));

        // ---------- Remove duplicates inside request ----------

        const requestKeys = new Set<string>();

        const requestUniqueRows = rows.filter(
            (row) => {
                const key = makeExpenseKey(
                    row.date,
                    row.amount,
                    row.description
                );

                if (requestKeys.has(key)) {
                    return false;
                }

                requestKeys.add(key);

                return true;
            }
        );

        // ---------- Find existing expenses ----------

        const dates = [
            ...new Set(
                requestUniqueRows.map(
                    (row) => row.date
                )
            ),
        ];

        const {
            data: existing,
            error: existingError,
        } = await supabase
            .from("expenses")
            .select(
                "date, amount, description"
            )
            .in("date", dates);

        if (existingError) {
            console.error(
                "Existing expenses fetch error:",
                existingError
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to check existing expenses",
                },
                { status: 500 }
            );
        }

        const existingKeys = new Set(
            (existing || []).map(
                (expense) =>
                    makeExpenseKey(
                        expense.date,
                        Number(expense.amount),
                        expense.description
                    )
            )
        );

        // ---------- Remove database duplicates ----------

        const uniqueRows =
            requestUniqueRows.filter(
                (row) =>
                    !existingKeys.has(
                        makeExpenseKey(
                            row.date,
                            row.amount,
                            row.description
                        )
                    )
            );

        const skipped =
            rows.length - uniqueRows.length;

        if (uniqueRows.length === 0) {
            return NextResponse.json({
                success: true,
                inserted: [],
                skipped,
                message:
                    "Tüm harcamalar zaten kayıtlı",
            });
        }

        // ---------- Insert ----------

        const {
            data,
            error,
        } = await supabase
            .from("expenses")
            .insert(uniqueRows)
            .select();

        if (error) {
            console.error(
                "Expenses insert error:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to save expenses",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            inserted: data || [],
            skipped,
        });
    } catch (error) {
        console.error(
            "Error saving expenses:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to save expenses",
            },
            { status: 500 }
        );
    }
}

// ---------- DELETE: Tekil harcama sil ----------

export async function DELETE(
    request: NextRequest
) {
    try {
        const authToken =
            request.headers.get("x-auth-token");

        const isValid =
            await validateSession(authToken);

        if (!isValid) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        const { id } = body as {
            id: string;
        };

        if (
            typeof id !== "string" ||
            !id.trim()
        ) {
            return NextResponse.json(
                {
                    error:
                        "Expense ID is required",
                },
                { status: 400 }
            );
        }

        const supabase =
            createAdminClient();

        const {
            data,
            error,
        } = await supabase
            .from("expenses")
            .delete()
            .eq("id", id)
            .select("id")
            .maybeSingle();

        if (error) {
            console.error(
                "Expense delete error:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to delete expense",
                },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                {
                    error:
                        "Expense not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            deleted: data.id,
        });
    } catch (error) {
        console.error(
            "Error deleting expense:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to delete expense",
            },
            { status: 500 }
        );
    }
}


export async function PATCH(request: NextRequest) {
    try {
        // ─── Auth ───────────────────────────────────────────────────────

        const authToken = request.headers.get("x-auth-token");

        const isValid = await validateSession(authToken);

        if (!isValid) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        // ─── Body ───────────────────────────────────────────────────────

        const body = await request.json();

        const id =
            typeof body.id === "string"
                ? body.id.trim()
                : "";

        const description =
            typeof body.description === "string"
                ? body.description.trim()
                : "";

        const category =
            typeof body.category === "string"
                ? body.category.trim()
                : "";

        if (!id) {
            return NextResponse.json(
                {
                    error: "Harcama ID gerekli.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!description) {
            return NextResponse.json(
                {
                    error: "Açıklama boş bırakılamaz.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!isExpenseCategory(category)) {
            return NextResponse.json(
                {
                    error: "Geçersiz kategori.",
                },
                {
                    status: 400,
                }
            );
        }

        // ─── Supabase ───────────────────────────────────────────────────

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("expenses")
            .update({
                description,
                category,
            })
            .eq("id", id)
            .select(
                "id, date, description, amount, currency, category, installment, created_at"
            )
            .single();

        if (error) {
            console.error(
                "Expense update error:",
                error
            );

            return NextResponse.json(
                {
                    error: "Harcama güncellenemedi.",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            success: true,
            expense: data,
        });
    } catch (error) {
        console.error(
            "PATCH /api/admin/expenses error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Bilinmeyen hata",
            },
            {
                status: 500,
            }
        );
    }
}