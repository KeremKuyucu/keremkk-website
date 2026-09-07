"use client";

import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
} from "react";

import {
    FaWallet,
    FaCloudUploadAlt,
    FaTrash,
    FaSync,
    FaSearch,
    FaCheck,
    FaTimes,
    FaFileInvoiceDollar,
    FaChartPie,
    FaExchangeAlt,
    FaSpinner,
    FaExclamationTriangle,
    FaEdit,
    FaSave,
    FaInfoCircle,
    FaFilter,
    FaSortAmountDown,
    FaSortAmountUp,
    FaSortAlphaDown,
    FaSortAlphaUp,
    FaCalendarAlt,
    FaArrowDown,
    FaArrowUp,
} from "react-icons/fa";

import {
    EXPENSE_CATEGORIES as CATEGORIES,
    EXPENSE_CATEGORY_COLORS as CATEGORY_COLORS,
    EXPENSE_CATEGORY_ICONS as CATEGORY_ICONS,
    isExpenseCategory,
} from "@/lib/expense-categories";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Expense {
    id: string;
    date: string;
    description: string;
    amount: number;
    currency: string;
    category: string;
    installment: string | null;
    created_at: string;
}

interface CpiIndex {
    period: string;
    index_value: number;
}

interface ExtractedExpense {
    date: string;
    description: string;
    amount: number;
    category: string;
    installment: string | null;
}

interface ExtractResult {
    period: string;
    expenses: ExtractedExpense[];
}

interface PreviewRow extends ExtractedExpense {
    _tempId: string;
    _excluded: boolean;
    _editing: boolean;
}

interface ExpenseTrackerProps {
    authToken: string;
}

type SortField = "date" | "amount" | "description";

type SortDirection = "asc" | "desc";

// ─── Constants ───────────────────────────────────────────────────────────────
// CATEGORIES, CATEGORY_COLORS ve CATEGORY_ICONS → @/lib/expense-categories

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        minimumFractionDigits: 2,
    }).format(amount);
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");

    return d.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getPeriodFromDate(dateStr: string): string {
    return dateStr.substring(0, 7);
}

function generateTempId(): string {
    return Math.random().toString(36).substring(2, 11);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ExpenseTracker({
    authToken,
}: ExpenseTrackerProps) {
    // ─── Data state ──────────────────────────────────────────────────────────

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [cpiIndices, setCpiIndices] = useState<CpiIndex[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // ─── Upload & extract state ──────────────────────────────────────────────

    const [isDragging, setIsDragging] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState<string | null>(null);
    const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
    const [previewPeriod, setPreviewPeriod] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [skippedDuplicates, setSkippedDuplicates] = useState<number>(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Table state ─────────────────────────────────────────────────────────

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [showRealValues, setShowRealValues] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingExpenseId, setEditingExpenseId] =
        useState<string | null>(null);

    const [editingDescription, setEditingDescription] =
        useState("");

    const [editingCategory, setEditingCategory] =
        useState("");

    const [isUpdatingExpense, setIsUpdatingExpense] =
        useState(false);

    const [sortField, setSortField] =
        useState<SortField>("date");

    const [sortDirection, setSortDirection] =
        useState<SortDirection>("desc");

    // ─── CPI Helpers ─────────────────────────────────────────────────────────

    const cpiMap = useMemo(() => {
        const map = new Map<string, number>();

        for (const cpi of cpiIndices) {
            map.set(cpi.period, Number(cpi.index_value));
        }

        return map;
    }, [cpiIndices]);

    const latestCpi = useMemo(() => {
        if (cpiIndices.length === 0) {
            return null;
        }

        const latest = [...cpiIndices].sort((a, b) =>
            b.period.localeCompare(a.period)
        )[0];

        return Number(latest.index_value);
    }, [cpiIndices]);

    const latestCpiPeriod = useMemo(() => {
        if (cpiIndices.length === 0) {
            return null;
        }

        return [...cpiIndices].sort((a, b) =>
            b.period.localeCompare(a.period)
        )[0].period;
    }, [cpiIndices]);

    const calculateRealValue = useCallback(
        (
            amount: number,
            date: string
        ): number | null => {
            if (!latestCpi) {
                return null;
            }

            const period = getPeriodFromDate(date);
            const periodCpi = cpiMap.get(period);

            if (!periodCpi) {
                return null;
            }

            return amount * (latestCpi / periodCpi);
        },
        [latestCpi, cpiMap]
    );

    // ─── Data Fetching ───────────────────────────────────────────────────────

    const fetchData = useCallback(
        async (silent = false) => {
            if (!silent) {
                setIsLoading(true);
            }

            setIsRefreshing(true);

            try {
                const res = await fetch("/api/admin/expenses", {
                    headers: {
                        "x-auth-token": authToken,
                    },
                });

                if (!res.ok) {
                    throw new Error("Fetch failed");
                }

                const data = await res.json();

                setExpenses(data.expenses || []);
                setCpiIndices(data.cpiIndices || []);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [authToken]
    );

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ─── File Upload & AI Extraction ─────────────────────────────────────────

    const handleFile = async (file: File) => {
        setExtractError(null);
        setIsExtracting(true);
        setPreviewRows([]);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(
                "/api/admin/expenses/extract",
                {
                    method: "POST",
                    headers: {
                        "x-auth-token": authToken,
                    },
                    body: formData,
                }
            );

            if (!res.ok) {
                const err = await res.json();

                throw new Error(
                    err.error || "Ayrıştırma başarısız"
                );
            }

            const json = await res.json();
            const result = json.data as ExtractResult;

            setPreviewPeriod(result.period);

            // ─── Duplicate filter (date + amount) ────────────────────────
            // Mevcut expenses'taki date+amount anahtarlarını oluştur.
            const existingKeys = new Set(
                expenses.map(
                    (expense) =>
                        `${expense.date}|${Number(expense.amount).toFixed(2)}`
                )
            );

            // AI sonucundaki aynı dosya içi tekrarları da ele al.
            const seenInBatch = new Set<string>();

            let skipped = 0;

            const filteredExpenses = result.expenses.filter((e) => {
                const key = `${e.date}|${Number(e.amount).toFixed(2)}`;

                if (existingKeys.has(key) || seenInBatch.has(key)) {
                    skipped++;
                    return false;
                }

                seenInBatch.add(key);
                return true;
            });

            setSkippedDuplicates(skipped);

            setPreviewRows(
                filteredExpenses.map((e) => ({
                    ...e,
                    _tempId: generateTempId(),
                    _excluded: false,
                    _editing: false,
                }))
            );
        } catch (err) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Bilinmeyen hata";

            setExtractError(msg);
        } finally {
            setIsExtracting(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();

        setIsDragging(false);

        const file = e.dataTransfer.files[0];

        if (file) {
            handleFile(file);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onFileSelect = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (file) {
            handleFile(file);
        }

        e.target.value = "";
    };

    // ─── Preview Actions ─────────────────────────────────────────────────────

    const toggleExclude = (tempId: string) => {
        setPreviewRows((prev) =>
            prev.map((row) =>
                row._tempId === tempId
                    ? {
                        ...row,
                        _excluded: !row._excluded,
                    }
                    : row
            )
        );
    };

    const toggleEdit = (tempId: string) => {
        setPreviewRows((prev) =>
            prev.map((row) =>
                row._tempId === tempId
                    ? {
                        ...row,
                        _editing: !row._editing,
                    }
                    : row
            )
        );
    };

    const updatePreviewField = (
        tempId: string,
        field: keyof ExtractedExpense,
        value: string | number | null
    ) => {
        setPreviewRows((prev) =>
            prev.map((row) =>
                row._tempId === tempId
                    ? {
                        ...row,
                        [field]: value,
                    }
                    : row
            )
        );
    };

    const removePreviewRow = (tempId: string) => {
        setPreviewRows((prev) =>
            prev.filter((row) => row._tempId !== tempId)
        );
    };

    const saveExtracted = async () => {
        const toSave = previewRows
            .filter((row) => !row._excluded)
            .map(
                ({
                    date,
                    description,
                    amount,
                    category,
                    installment,
                }) => ({
                    date,
                    description,
                    amount,
                    category,
                    installment,
                })
            );

        if (toSave.length === 0) {
            return;
        }

        setIsSaving(true);

        try {
            const res = await fetch("/api/admin/expenses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken,
                },
                body: JSON.stringify({
                    expenses: toSave,
                }),
            });

            if (!res.ok) {
                throw new Error("Kayıt başarısız");
            }

            setPreviewRows([]);
            setPreviewPeriod("");

            await fetchData(true);
        } catch (err) {
            console.error("Save error:", err);

            setExtractError(
                "Kayıt sırasında hata oluştu"
            );
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Delete Expense ──────────────────────────────────────────────────────

    const deleteExpense = async (id: string) => {
        setDeletingId(id);

        try {
            const res = await fetch(
                "/api/admin/expenses",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "x-auth-token": authToken,
                    },
                    body: JSON.stringify({
                        id,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Silme başarısız");
            }

            setExpenses((prev) =>
                prev.filter(
                    (expense) => expense.id !== id
                )
            );
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setDeletingId(null);
        }
    };

    // ─── Update Expense ─────────────────────────────────────────────────────

    const startEditingExpense = (expense: Expense) => {
        setEditingExpenseId(expense.id);
        setEditingDescription(expense.description);
        setEditingCategory(
            isExpenseCategory(expense.category)
                ? expense.category
                : "Diğer"
        );
    };

    // isUpdatingExpense kontrolü olmadan edit state'ini sıfırlar.
    // Başarılı PATCH sonrasında çağrılır; o an isUpdatingExpense===true
    // olduğu için cancelEditingExpense kullanmak edit modunu kapatamıyor.
    const resetEditingExpense = () => {
        setEditingExpenseId(null);
        setEditingDescription("");
        setEditingCategory("");
    };

    const cancelEditingExpense = () => {
        if (isUpdatingExpense) {
            return;
        }

        resetEditingExpense();
    };

    const updateExpense = async () => {
        if (!editingExpenseId) {
            return;
        }

        const description =
            editingDescription.trim();

        if (!description) {
            return;
        }

        if (!isExpenseCategory(editingCategory)) {
            return;
        }

        setIsUpdatingExpense(true);

        try {
            const res = await fetch(
                "/api/admin/expenses",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "x-auth-token": authToken,
                    },
                    body: JSON.stringify({
                        id: editingExpenseId,
                        description,
                        category: editingCategory,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                    "Harcama güncellenemedi."
                );
            }

            const updatedExpense =
                data.expense as Expense;

            setExpenses((prev) =>
                prev.map((expense) =>
                    expense.id ===
                        editingExpenseId
                        ? {
                            ...expense,
                            description:
                                updatedExpense.description,
                            category:
                                updatedExpense.category,
                        }
                        : expense
                )
            );

            resetEditingExpense();
        } catch (error) {
            console.error(
                "Update expense error:",
                error
            );

            setExtractError(
                error instanceof Error
                    ? error.message
                    : "Harcama güncellenemedi."
            );
        } finally {
            setIsUpdatingExpense(false);
        }
    };

    // ─── Sorting ─────────────────────────────────────────────────────────────

    const changeSort = (
        field: SortField,
        direction?: SortDirection
    ) => {
        if (sortField === field && !direction) {
            setSortDirection((prev) =>
                prev === "asc" ? "desc" : "asc"
            );

            return;
        }

        setSortField(field);

        setSortDirection(
            direction ||
            (field === "description"
                ? "asc"
                : "desc")
        );
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return null;
        }

        return sortDirection === "asc" ? (
            <FaArrowUp className="text-[9px]" />
        ) : (
            <FaArrowDown className="text-[9px]" />
        );
    };

    // ─── Filtered & Sorted Data ──────────────────────────────────────────────

    const filteredExpenses = useMemo(() => {
        const query = searchQuery
            .trim()
            .toLocaleLowerCase("tr-TR");

        const filtered = expenses.filter((expense) => {
            const searchableText = [
                expense.description,
                expense.category,
                expense.installment || "",
            ]
                .join(" ")
                .toLocaleLowerCase("tr-TR");

            const matchesSearch =
                !query ||
                searchableText.includes(query);

            const matchesCategory =
                categoryFilter === "all" ||
                expense.category === categoryFilter;

            return (
                matchesSearch &&
                matchesCategory
            );
        });

        return [...filtered].sort((a, b) => {
            let comparison = 0;

            if (sortField === "amount") {
                comparison =
                    Number(a.amount) -
                    Number(b.amount);
            } else if (sortField === "date") {
                comparison =
                    a.date.localeCompare(b.date);
            } else if (sortField === "description") {
                comparison =
                    a.description.localeCompare(
                        b.description,
                        "tr-TR",
                        {
                            sensitivity: "base",
                        }
                    );
            }

            if (comparison === 0) {
                comparison =
                    a.id.localeCompare(b.id);
            }

            return sortDirection === "asc"
                ? comparison
                : -comparison;
        });
    }, [
        expenses,
        searchQuery,
        categoryFilter,
        sortField,
        sortDirection,
    ]);

    // ─── Stats ───────────────────────────────────────────────────────────────

    const stats = useMemo(() => {
        const totalNominal = expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount),
            0
        );

        const filteredNominal =
            filteredExpenses.reduce(
                (sum, expense) =>
                    sum + Number(expense.amount),
                0
            );

        let totalReal = 0;
        let filteredReal = 0;

        let realAvailable = false;

        for (const expense of expenses) {
            const realValue = calculateRealValue(
                Number(expense.amount),
                expense.date
            );

            if (realValue !== null) {
                totalReal += realValue;
                realAvailable = true;
            } else {
                totalReal += Number(expense.amount);
            }
        }

        for (const expense of filteredExpenses) {
            const realValue = calculateRealValue(
                Number(expense.amount),
                expense.date
            );

            if (realValue !== null) {
                filteredReal += realValue;
            } else {
                filteredReal += Number(expense.amount);
            }
        }

        // En çok harcanan kategori
        const categoryTotals =
            new Map<string, number>();

        for (const expense of expenses) {
            const current =
                categoryTotals.get(
                    expense.category
                ) || 0;

            categoryTotals.set(
                expense.category,
                current + Number(expense.amount)
            );
        }

        let topCategory = "-";
        let topCategoryAmount = 0;

        for (const [category, total] of categoryTotals) {
            if (total > topCategoryAmount) {
                topCategoryAmount = total;
                topCategory = category;
            }
        }

        return {
            totalNominal,
            filteredNominal,
            totalReal,
            filteredReal,
            realAvailable,
            topCategory,
            topCategoryAmount,
        };
    }, [
        expenses,
        filteredExpenses,
        calculateRealValue,
    ]);

    const activeCategories = useMemo(() => {
        const cats = new Set(
            expenses.map(
                (expense) => expense.category
            )
        );

        return Array.from(cats).sort((a, b) =>
            a.localeCompare(b, "tr-TR")
        );
    }, [expenses]);

    // ─── Loading ─────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <FaSpinner className="animate-spin text-3xl text-violet-500" />
            </div>
        );
    }

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6 animate-fadeIn">

            {/* ───────────────── Stat Cards ───────────────── */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Total */}

                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-800/50 p-5 shadow-sm">

                    <div className="flex items-center gap-3 mb-3">

                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
                            <FaWallet className="text-sm" />
                        </div>

                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Toplam Harcama
                        </span>
                    </div>

                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                            showRealValues &&
                                stats.realAvailable
                                ? stats.totalReal
                                : stats.totalNominal
                        )}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        {expenses.length} işlem
                    </p>
                </div>

                {/* Filtered total */}

                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-800/50 p-5 shadow-sm">

                    <div className="flex items-center gap-3 mb-3">

                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                            <FaExchangeAlt className="text-sm" />
                        </div>

                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Görüntülenen Toplam
                        </span>
                    </div>

                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                            showRealValues &&
                                stats.realAvailable
                                ? stats.filteredReal
                                : stats.filteredNominal
                        )}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        {filteredExpenses.length} kayıt
                        {filteredExpenses.length !==
                            expenses.length &&
                            " · filtrelenmiş"}
                    </p>
                </div>

                {/* Top category */}

                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-800/50 p-5 shadow-sm">

                    <div className="flex items-center gap-3 mb-3">

                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                            <FaChartPie className="text-sm" />
                        </div>

                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            En Çok Harcanan Kategori
                        </span>
                    </div>

                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {CATEGORY_ICONS[
                            stats.topCategory
                        ] || "📦"}{" "}
                        {stats.topCategory}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        {stats.topCategoryAmount > 0
                            ? formatCurrency(
                                stats.topCategoryAmount
                            )
                            : "—"}
                    </p>
                </div>
            </div>

            {/* ───────────────── Upload Area ───────────────── */}

            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-800/50 p-6 shadow-sm">

                <div className="flex items-center gap-3 mb-4">

                    <FaFileInvoiceDollar className="text-violet-500 text-lg" />

                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Ekstre Yükle & Ayrıştır
                    </h2>
                </div>

                <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">

                    <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />

                    <p className="text-xs text-amber-700 dark:text-amber-400">
                        Kişisel bilgilerinizi
                        (Ad-Soyad, IBAN, kart
                        numarası) kırparak
                        yüklemeniz önerilir.
                    </p>
                </div>

                <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                    className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${isDragging
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/10 scale-[1.01]"
                        : "border-gray-200 dark:border-zinc-700 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/5"
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.pdf,.xls,.xlsx"
                        onChange={onFileSelect}
                        className="hidden"
                    />

                    {isExtracting ? (
                        <div className="flex flex-col items-center gap-3 py-4">

                            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                <FaSpinner className="animate-spin text-xl text-violet-500" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    AI ile ayrıştırılıyor...
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                    Bu işlem birkaç
                                    saniye sürebilir
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-4">

                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                <FaCloudUploadAlt className="text-xl text-gray-400" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Dosyayı sürükleyin veya
                                    tıklayın
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                    PNG, JPG, WEBP, PDF,
                                    XLS veya XLSX
                                    (maks. 20MB)
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {extractError && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <FaTimes className="flex-shrink-0" />
                        {extractError}
                    </div>
                )}

                {/* ───────────── Preview Table ───────────── */}

                {previewRows.length > 0 && (
                    <div className="mt-6">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">

                            <div>
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Ayrıştırılan Harcamalar{" "}
                                    <span className="text-gray-400 font-normal">
                                        — {previewPeriod}
                                    </span>
                                </h3>

                                {skippedDuplicates > 0 && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                                        {skippedDuplicates} kayıt zaten mevcut olduğu için atlandı.
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">

                                <span className="text-xs text-gray-400">
                                    {
                                        previewRows.filter(
                                            (row) =>
                                                !row._excluded
                                        ).length
                                    }{" "}
                                    /{" "}
                                    {
                                        previewRows.length
                                    }{" "}
                                    seçili
                                </span>

                                <button
                                    onClick={
                                        saveExtracted
                                    }
                                    disabled={
                                        isSaving ||
                                        previewRows.filter(
                                            (row) =>
                                                !row._excluded
                                        ).length ===
                                        0
                                    }
                                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-violet-500/20"
                                >
                                    {isSaving ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : (
                                        <FaSave />
                                    )}

                                    Veritabanına Kaydet
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-zinc-800">

                            <table className="w-full text-sm">

                                <thead>
                                    <tr className="bg-gray-50 dark:bg-zinc-800/50 text-left">

                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 w-8">
                                            <button
                                                onClick={() => {
                                                    const allSelected = previewRows.every(
                                                        (row) => !row._excluded
                                                    );
                                                    setPreviewRows((prev) =>
                                                        prev.map((row) => ({
                                                            ...row,
                                                            _excluded: allSelected,
                                                        }))
                                                    );
                                                }}
                                                title={
                                                    previewRows.every((row) => !row._excluded)
                                                        ? "Tümünü kaldır"
                                                        : "Tümünü seç"
                                                }
                                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                                    previewRows.every((row) => !row._excluded)
                                                        ? "border-violet-500 bg-violet-500 text-white"
                                                        : previewRows.some((row) => !row._excluded)
                                                        ? "border-violet-400 bg-violet-200 dark:bg-violet-900/40 text-violet-500"
                                                        : "border-gray-300 dark:border-zinc-600"
                                                }`}
                                            >
                                                {previewRows.every((row) => !row._excluded) ? (
                                                    <FaCheck className="text-[10px]" />
                                                ) : previewRows.some((row) => !row._excluded) ? (
                                                    <span className="w-2 h-0.5 bg-violet-500 block rounded" />
                                                ) : null}
                                            </button>
                                        </th>

                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">
                                            Tarih
                                        </th>

                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">
                                            Açıklama
                                        </th>

                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">
                                            Kategori
                                        </th>

                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">
                                            Taksit
                                        </th>

                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-right">
                                            Tutar
                                        </th>

                                        <th className="px-4 py-3 w-20" />
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">

                                    {previewRows.map(
                                        (row) => (
                                            <tr
                                                key={
                                                    row._tempId
                                                }
                                                className={`transition-all ${row._excluded
                                                    ? "opacity-40 bg-gray-50 dark:bg-zinc-900/30"
                                                    : "hover:bg-gray-50 dark:hover:bg-zinc-800/30"
                                                    }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() =>
                                                            toggleExclude(
                                                                row._tempId
                                                            )
                                                        }
                                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${row._excluded
                                                            ? "border-gray-300 dark:border-zinc-600"
                                                            : "border-violet-500 bg-violet-500 text-white"
                                                            }`}
                                                    >
                                                        {!row._excluded && (
                                                            <FaCheck className="text-[10px]" />
                                                        )}
                                                    </button>
                                                </td>

                                                <td className="px-4 py-3">
                                                    {row._editing ? (
                                                        <input
                                                            type="date"
                                                            value={
                                                                row.date
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updatePreviewField(
                                                                    row._tempId,
                                                                    "date",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm w-36"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                            {formatDate(
                                                                row.date
                                                            )}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {row._editing ? (
                                                        <input
                                                            type="text"
                                                            value={
                                                                row.description
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updatePreviewField(
                                                                    row._tempId,
                                                                    "description",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm w-full min-w-[200px]"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            {
                                                                row.description
                                                            }
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {row._editing ? (
                                                        <select
                                                            value={
                                                                row.category
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updatePreviewField(
                                                                    row._tempId,
                                                                    "category",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                                                        >
                                                            {CATEGORIES.map(
                                                                (
                                                                    category
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            category
                                                                        }
                                                                        value={
                                                                            category
                                                                        }
                                                                    >
                                                                        {
                                                                            category
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${CATEGORY_COLORS[
                                                                row
                                                                    .category
                                                            ] ||
                                                                CATEGORY_COLORS[
                                                                "Diğer"
                                                                ]
                                                                }`}
                                                        >
                                                            {CATEGORY_ICONS[
                                                                row.category
                                                            ] ||
                                                                "📦"}{" "}
                                                            {
                                                                row.category
                                                            }
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                    {row._editing ? (
                                                        <input
                                                            type="text"
                                                            value={
                                                                row.installment ||
                                                                ""
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updatePreviewField(
                                                                    row._tempId,
                                                                    "installment",
                                                                    e
                                                                        .target
                                                                        .value ||
                                                                    null
                                                                )
                                                            }
                                                            placeholder="—"
                                                            className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm w-20"
                                                        />
                                                    ) : (
                                                        row.installment ||
                                                        "—"
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900 dark:text-white">
                                                    {row._editing ? (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={
                                                                row.amount
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updatePreviewField(
                                                                    row._tempId,
                                                                    "amount",
                                                                    parseFloat(
                                                                        e
                                                                            .target
                                                                            .value
                                                                    ) ||
                                                                    0
                                                                )
                                                            }
                                                            className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm w-28 text-right"
                                                        />
                                                    ) : (
                                                        formatCurrency(
                                                            row.amount
                                                        )
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">

                                                        <button
                                                            onClick={() =>
                                                                toggleEdit(
                                                                    row._tempId
                                                                )
                                                            }
                                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-violet-500 transition-colors"
                                                            title={
                                                                row._editing
                                                                    ? "Kaydet"
                                                                    : "Düzenle"
                                                            }
                                                        >
                                                            {row._editing ? (
                                                                <FaCheck className="text-xs" />
                                                            ) : (
                                                                <FaEdit className="text-xs" />
                                                            )}
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                removePreviewRow(
                                                                    row._tempId
                                                                )
                                                            }
                                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Kaldır"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}

                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ───────────────── Expenses ───────────────── */}

            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-800/50 p-6 shadow-sm">

                {/* Header */}

                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-5">

                    <div className="flex items-center gap-3">

                        <FaWallet className="text-violet-500 text-lg" />

                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Kayıtlı Harcamalar
                            </h2>

                            <p className="text-xs text-gray-400 mt-0.5">
                                {filteredExpenses.length} kayıt
                                gösteriliyor
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                fetchData(true)
                            }
                            disabled={isRefreshing}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 transition-colors"
                            title="Yenile"
                        >
                            <FaSync
                                className={`text-sm ${isRefreshing
                                    ? "animate-spin"
                                    : ""
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Controls */}

                    <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">

                        {/* Search */}

                        <div className="relative flex-1 min-w-[220px] xl:w-60">

                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />

                            <input
                                type="text"
                                placeholder="Harcama ara..."
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(
                                        e.target.value
                                    )
                                }
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                            />
                        </div>

                        {/* Category */}

                        <div className="relative">

                            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />

                            <select
                                value={
                                    categoryFilter
                                }
                                onChange={(e) =>
                                    setCategoryFilter(
                                        e.target.value
                                    )
                                }
                                className="pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer transition-all"
                            >
                                <option value="all">
                                    Tüm Kategoriler
                                </option>

                                {activeCategories.map(
                                    (category) => (
                                        <option
                                            key={
                                                category
                                            }
                                            value={
                                                category
                                            }
                                        >
                                            {CATEGORY_ICONS[
                                                category
                                            ] || "📦"}{" "}
                                            {category}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* Sort */}

                        <div className="relative">

                            <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />

                            <select
                                value={`${sortField}-${sortDirection}`}
                                onChange={(e) => {
                                    const [
                                        field,
                                        direction,
                                    ] =
                                        e.target.value.split(
                                            "-"
                                        ) as [
                                            SortField,
                                            SortDirection
                                        ];

                                    setSortField(field);
                                    setSortDirection(
                                        direction
                                    );
                                }}
                                className="pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer transition-all"
                            >
                                <option value="date-desc">
                                    Tarih: Yeni → Eski
                                </option>

                                <option value="date-asc">
                                    Tarih: Eski → Yeni
                                </option>

                                <option value="amount-desc">
                                    Tutar: Yüksek → Düşük
                                </option>

                                <option value="amount-asc">
                                    Tutar: Düşük → Yüksek
                                </option>

                                <option value="description-asc">
                                    Açıklama: A → Z
                                </option>

                                <option value="description-desc">
                                    Açıklama: Z → A
                                </option>
                            </select>
                        </div>

                        {/* Real / Nominal */}

                        <button
                            onClick={() =>
                                setShowRealValues(
                                    (prev) => !prev
                                )
                            }
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border whitespace-nowrap ${showRealValues
                                ? "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                                : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700"
                                }`}
                            title="TÜFE düzeltmeli reel değeri göster"
                        >
                            <FaExchangeAlt className="text-xs" />

                            {showRealValues
                                ? "Reel Değer"
                                : "Nominal"}
                        </button>
                    </div>
                </div>

                {/* Active filters / sorting info */}

                <div className="flex flex-wrap items-center gap-2 mb-4">

                    {(searchQuery ||
                        categoryFilter !== "all") && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400 text-xs font-medium">
                                <FaSearch className="text-[9px]" />

                                Filtre aktif
                            </span>
                        )}

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-xs">

                        {sortField === "amount" ? (
                            sortDirection === "desc" ? (
                                <FaSortAmountDown />
                            ) : (
                                <FaSortAmountUp />
                            )
                        ) : sortField ===
                            "description" ? (
                            sortDirection === "desc" ? (
                                <FaSortAlphaUp />
                            ) : (
                                <FaSortAlphaDown />
                            )
                        ) : (
                            <FaCalendarAlt />
                        )}

                        {sortField === "amount"
                            ? `Tutar ${sortDirection ===
                                "desc"
                                ? "yüksekten düşüğe"
                                : "düşükten yükseğe"
                            }`
                            : sortField ===
                                "description"
                                ? `Açıklama ${sortDirection ===
                                    "asc"
                                    ? "A → Z"
                                    : "Z → A"
                                }`
                                : `Tarih ${sortDirection ===
                                    "desc"
                                    ? "yeni → eski"
                                    : "eski → yeni"
                                }`}
                    </span>

                    {showRealValues &&
                        latestCpiPeriod && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 text-xs">
                                TÜFE baz:
                                {" "}
                                {latestCpiPeriod}
                            </span>
                        )}
                </div>

                {/* CPI warning */}

                {showRealValues &&
                    !stats.realAvailable && (
                        <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">

                            <FaInfoCircle className="flex-shrink-0" />

                            TÜFE verisi bulunamadı.{" "}
                            <code className="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30">
                                cpi_indices
                            </code>{" "}
                            tablosuna endeks
                            değerlerini eklemeniz
                            gerekiyor.
                        </div>
                    )}

                {/* Table */}

                {filteredExpenses.length === 0 ? (
                    <div className="text-center py-16">

                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">

                            <FaWallet className="text-2xl text-gray-300 dark:text-zinc-600" />
                        </div>

                        <p className="text-sm text-gray-400">
                            {expenses.length === 0
                                ? "Henüz harcama kaydı yok"
                                : "Filtreye uygun kayıt bulunamadı"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-zinc-800">

                        <table className="w-full text-sm">

                            <thead>

                                <tr className="bg-gray-50 dark:bg-zinc-800/50 text-left">

                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">
                                        Tarih
                                    </th>

                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">
                                        Açıklama
                                    </th>

                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">
                                        Kategori
                                    </th>

                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">
                                        Taksit
                                    </th>

                                    {/* Sortable amount */}

                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-right">

                                        <button
                                            onClick={() =>
                                                changeSort(
                                                    "amount"
                                                )
                                            }
                                            className="ml-auto flex items-center justify-end gap-1.5 hover:text-violet-500 transition-colors"
                                            title="Tutara göre sırala"
                                        >
                                            {showRealValues
                                                ? "Reel Tutar"
                                                : "Tutar"}

                                            {getSortIcon(
                                                "amount"
                                            ) || (
                                                    <span className="opacity-30">
                                                        ↕
                                                    </span>
                                                )}
                                        </button>
                                    </th>

                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 w-12" />
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">

                                {filteredExpenses.map(
                                    (expense) => {
                                        const realValue =
                                            calculateRealValue(
                                                Number(
                                                    expense.amount
                                                ),
                                                expense.date
                                            );

                                        const displayAmount =
                                            showRealValues &&
                                                realValue !==
                                                null
                                                ? realValue
                                                : Number(
                                                    expense.amount
                                                );

                                        return (
                                            <tr
                                                key={
                                                    expense.id
                                                }
                                                className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors"
                                            >
                                                {/* Date */}

                                                <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                                    {formatDate(
                                                        expense.date
                                                    )}
                                                </td>

                                                {/* Description */}

                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs">
                                                    {editingExpenseId === expense.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingDescription}
                                                            onChange={(e) =>
                                                                setEditingDescription(
                                                                    e.target.value
                                                                )
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key === "Enter" &&
                                                                    !isUpdatingExpense
                                                                ) {
                                                                    updateExpense();
                                                                }

                                                                if (
                                                                    e.key === "Escape" &&
                                                                    !isUpdatingExpense
                                                                ) {
                                                                    cancelEditingExpense();
                                                                }
                                                            }}
                                                            autoFocus
                                                            className="w-full min-w-[220px] px-3 py-2 rounded-lg border border-violet-300 dark:border-violet-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="truncate"
                                                            title={expense.description}
                                                        >
                                                            {expense.description}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Category */}

                                                <td className="px-4 py-3">
                                                    {editingExpenseId === expense.id ? (
                                                        <select
                                                            value={editingCategory}
                                                            onChange={(e) =>
                                                                setEditingCategory(
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="px-2.5 py-2 rounded-lg border border-violet-300 dark:border-violet-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                                                        >
                                                            {CATEGORIES.map(
                                                                (category) => (
                                                                    <option
                                                                        key={category}
                                                                        value={category}
                                                                    >
                                                                        {CATEGORY_ICONS[
                                                                            category
                                                                        ] || "📦"}{" "}
                                                                        {category}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${CATEGORY_COLORS[
                                                                expense.category
                                                            ] ||
                                                                CATEGORY_COLORS[
                                                                "Diğer"
                                                                ]
                                                                }`}
                                                        >
                                                            {CATEGORY_ICONS[
                                                                expense.category
                                                            ] || "📦"}{" "}
                                                            {expense.category}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Installment */}

                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {expense.installment ||
                                                        "—"}
                                                </td>

                                                {/* Amount */}

                                                <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap">

                                                    {formatCurrency(
                                                        displayAmount
                                                    )}

                                                    {showRealValues &&
                                                        realValue !==
                                                        null && (
                                                            <span className="block text-[10px] font-normal text-gray-400">
                                                                nom.{" "}
                                                                {formatCurrency(
                                                                    Number(
                                                                        expense.amount
                                                                    )
                                                                )}
                                                            </span>
                                                        )}
                                                </td>

                                                {/* Actions */}

                                                <td className="px-4 py-3">
                                                    {editingExpenseId === expense.id ? (
                                                        <div className="flex items-center gap-1">
                                                            {/* Save */}

                                                            <button
                                                                onClick={updateExpense}
                                                                disabled={
                                                                    isUpdatingExpense ||
                                                                    !editingDescription.trim()
                                                                }
                                                                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/10 text-gray-400 hover:text-emerald-500 disabled:opacity-50 transition-colors"
                                                                title="Kaydet"
                                                            >
                                                                {isUpdatingExpense ? (
                                                                    <FaSpinner className="animate-spin text-xs" />
                                                                ) : (
                                                                    <FaCheck className="text-xs" />
                                                                )}
                                                            </button>

                                                            {/* Cancel */}

                                                            <button
                                                                onClick={
                                                                    cancelEditingExpense
                                                                }
                                                                disabled={
                                                                    isUpdatingExpense
                                                                }
                                                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 transition-colors"
                                                                title="İptal"
                                                            >
                                                                <FaTimes className="text-xs" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            {/* Edit */}

                                                            <button
                                                                onClick={() =>
                                                                    startEditingExpense(
                                                                        expense
                                                                    )
                                                                }
                                                                disabled={
                                                                    editingExpenseId !==
                                                                    null
                                                                }
                                                                className="p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/10 text-gray-400 hover:text-violet-500 disabled:opacity-40 transition-colors"
                                                                title="Düzenle"
                                                            >
                                                                <FaEdit className="text-xs" />
                                                            </button>

                                                            {/* Delete */}

                                                            <button
                                                                onClick={() =>
                                                                    deleteExpense(
                                                                        expense.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    expense.id ||
                                                                    editingExpenseId !==
                                                                    null
                                                                }
                                                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                                                                title="Sil"
                                                            >
                                                                {deletingId ===
                                                                    expense.id ? (
                                                                    <FaSpinner className="animate-spin text-xs" />
                                                                ) : (
                                                                    <FaTrash className="text-xs" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}

                {filteredExpenses.length > 0 && (
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400">

                        <span>
                            {filteredExpenses.length} kayıt
                            gösteriliyor
                            {filteredExpenses.length !==
                                expenses.length && (
                                    <>
                                        {" "}
                                        / toplam{" "}
                                        {expenses.length}
                                    </>
                                )}
                        </span>

                        <span>
                            Görüntülenen toplam:{" "}
                            <strong className="text-gray-600 dark:text-gray-300">
                                {formatCurrency(
                                    showRealValues &&
                                        stats.realAvailable
                                        ? stats.filteredReal
                                        : stats.filteredNominal
                                )}
                            </strong>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}