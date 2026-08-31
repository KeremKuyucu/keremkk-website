"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
} from "react-icons/fa";

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

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
    "Market",
    "Yeme-İçme",
    "Akaryakıt",
    "Teknoloji",
    "Fatura",
    "Giyim",
    "Ulaşım",
    "Sağlık",
    "Eğlence",
    "Eğitim",
    "Diğer",
];

const CATEGORY_COLORS: Record<string, string> = {
    "Market": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "Yeme-İçme": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "Akaryakıt": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "Teknoloji": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Fatura": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "Giyim": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    "Ulaşım": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    "Sağlık": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    "Eğlence": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "Eğitim": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    "Diğer": "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
};

const CATEGORY_ICONS: Record<string, string> = {
    "Market": "🛒",
    "Yeme-İçme": "🍽️",
    "Akaryakıt": "⛽",
    "Teknoloji": "💻",
    "Fatura": "📄",
    "Giyim": "👗",
    "Ulaşım": "🚗",
    "Sağlık": "🏥",
    "Eğlence": "🎬",
    "Eğitim": "📚",
    "Diğer": "📦",
};

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
    return dateStr.substring(0, 7); // "YYYY-MM"
}

function generateTempId(): string {
    return Math.random().toString(36).substring(2, 11);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ExpenseTracker({ authToken }: ExpenseTrackerProps) {
    // Data state
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [cpiIndices, setCpiIndices] = useState<CpiIndex[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Upload & extract state
    const [isDragging, setIsDragging] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState<string | null>(null);
    const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
    const [previewPeriod, setPreviewPeriod] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Table state
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [showRealValues, setShowRealValues] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ─── CPI Helpers ─────────────────────────────────────────────────────────

    const cpiMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const c of cpiIndices) {
            map.set(c.period, Number(c.index_value));
        }
        return map;
    }, [cpiIndices]);

    const latestCpi = useMemo(() => {
        if (cpiIndices.length === 0) return null;
        // cpiIndices zaten period DESC sıralı
        return Number(cpiIndices[0].index_value);
    }, [cpiIndices]);

    const calculateRealValue = useCallback(
        (amount: number, date: string): number | null => {
            if (!latestCpi) return null;
            const period = getPeriodFromDate(date);
            const periodCpi = cpiMap.get(period);
            if (!periodCpi) return null;
            return amount * (latestCpi / periodCpi);
        },
        [latestCpi, cpiMap]
    );

    // ─── Data Fetching ──────────────────────────────────────────────────────

    const fetchData = useCallback(
        async (silent = false) => {
            if (!silent) setIsLoading(true);
            setIsRefreshing(true);
            try {
                const res = await fetch("/api/admin/expenses", {
                    headers: { "x-auth-token": authToken },
                });
                if (!res.ok) throw new Error("Fetch failed");
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

            const res = await fetch("/api/admin/expenses/extract", {
                method: "POST",
                headers: { "x-auth-token": authToken },
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Ayrıştırma başarısız");
            }

            const json = await res.json();
            const result = json.data as ExtractResult;

            setPreviewPeriod(result.period);
            setPreviewRows(
                result.expenses.map((e) => ({
                    ...e,
                    _tempId: generateTempId(),
                    _excluded: false,
                    _editing: false,
                }))
            );
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
            setExtractError(msg);
        } finally {
            setIsExtracting(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => setIsDragging(false);

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        // Reset so same file can be selected again
        e.target.value = "";
    };

    // ─── Preview Actions ─────────────────────────────────────────────────────

    const toggleExclude = (tempId: string) => {
        setPreviewRows((prev) =>
            prev.map((r) =>
                r._tempId === tempId ? { ...r, _excluded: !r._excluded } : r
            )
        );
    };

    const toggleEdit = (tempId: string) => {
        setPreviewRows((prev) =>
            prev.map((r) =>
                r._tempId === tempId ? { ...r, _editing: !r._editing } : r
            )
        );
    };

    const updatePreviewField = (
        tempId: string,
        field: keyof ExtractedExpense,
        value: string | number | null
    ) => {
        setPreviewRows((prev) =>
            prev.map((r) =>
                r._tempId === tempId ? { ...r, [field]: value } : r
            )
        );
    };

    const removePreviewRow = (tempId: string) => {
        setPreviewRows((prev) => prev.filter((r) => r._tempId !== tempId));
    };

    const saveExtracted = async () => {
        const toSave = previewRows
            .filter((r) => !r._excluded)
            .map(({ date, description, amount, category, installment }) => ({
                date,
                description,
                amount,
                category,
                installment,
            }));

        if (toSave.length === 0) return;

        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/expenses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken,
                },
                body: JSON.stringify({ expenses: toSave }),
            });

            if (!res.ok) throw new Error("Kayıt başarısız");

            setPreviewRows([]);
            setPreviewPeriod("");
            await fetchData(true);
        } catch (err) {
            console.error("Save error:", err);
            setExtractError("Kayıt sırasında hata oluştu");
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Delete Expense ──────────────────────────────────────────────────────

    const deleteExpense = async (id: string) => {
        setDeletingId(id);
        try {
            const res = await fetch("/api/admin/expenses", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken,
                },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) throw new Error("Silme başarısız");
            setExpenses((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setDeletingId(null);
        }
    };

    // ─── Filtered & Computed Data ────────────────────────────────────────────

    const filteredExpenses = useMemo(() => {
        return expenses.filter((e) => {
            const matchesSearch =
                !searchQuery ||
                e.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
                categoryFilter === "all" || e.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [expenses, searchQuery, categoryFilter]);

    const stats = useMemo(() => {
        const totalNominal = expenses.reduce(
            (sum, e) => sum + Number(e.amount),
            0
        );

        let totalReal = 0;
        let realAvailable = false;
        for (const e of expenses) {
            const rv = calculateRealValue(Number(e.amount), e.date);
            if (rv !== null) {
                totalReal += rv;
                realAvailable = true;
            } else {
                totalReal += Number(e.amount);
            }
        }

        // En çok harcanan kategori
        const categoryTotals = new Map<string, number>();
        for (const e of expenses) {
            const current = categoryTotals.get(e.category) || 0;
            categoryTotals.set(e.category, current + Number(e.amount));
        }
        let topCategory = "-";
        let topCategoryAmount = 0;
        for (const [cat, total] of categoryTotals) {
            if (total > topCategoryAmount) {
                topCategoryAmount = total;
                topCategory = cat;
            }
        }

        return { totalNominal, totalReal, realAvailable, topCategory, topCategoryAmount };
    }, [expenses, calculateRealValue]);

    const activeCategories = useMemo(() => {
        const cats = new Set(expenses.map((e) => e.category));
        return Array.from(cats).sort();
    }, [expenses]);

    // ─── Render ──────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <FaSpinner className="animate-spin text-3xl text-violet-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* ────── Stat Cards ────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Toplam Nominal */}
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-800/50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
                            <FaWallet className="text-sm" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Toplam Harcama (Nominal)
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.totalNominal)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {expenses.length} işlem
                    </p>
                </div>

                {/* Toplam Reel */}
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-800/50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                            <FaExchangeAlt className="text-sm" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Toplam Harcama (Reel)
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.realAvailable
                            ? formatCurrency(stats.totalReal)
                            : "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {stats.realAvailable
                            ? "TÜFE düzeltmeli"
                            : "TÜFE verisi yok"}
                    </p>
                </div>

                {/* Top Kategori */}
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
                        {CATEGORY_ICONS[stats.topCategory] || "📦"}{" "}
                        {stats.topCategory}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {stats.topCategoryAmount > 0
                            ? formatCurrency(stats.topCategoryAmount)
                            : "—"}
                    </p>
                </div>
            </div>

            {/* ────── Upload Area ────── */}
            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-800/50 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <FaFileInvoiceDollar className="text-violet-500 text-lg" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Ekstre Yükle & Ayrıştır
                    </h2>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
                    <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                        Kişisel bilgilerinizi (Ad-Soyad, IBAN, kart numarası) kırparak
                        yüklemeniz önerilir.
                    </p>
                </div>

                {/* Drop Zone */}
                <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                        isDragging
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
                                    Bu işlem birkaç saniye sürebilir
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
                                    Dosyayı sürükleyin veya tıklayın
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    PNG, JPG, WEBP, PDF, XLS veya XLSX (maks. 20MB)
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Extract Error */}
                {extractError && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <FaTimes className="flex-shrink-0" />
                        {extractError}
                    </div>
                )}

                {/* ────── Preview Table ────── */}
                {previewRows.length > 0 && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Ayrıştırılan Harcamalar{" "}
                                <span className="text-gray-400 font-normal">
                                    — {previewPeriod}
                                </span>
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                    {previewRows.filter((r) => !r._excluded).length} /{" "}
                                    {previewRows.length} seçili
                                </span>
                                <button
                                    onClick={saveExtracted}
                                    disabled={
                                        isSaving ||
                                        previewRows.filter((r) => !r._excluded).length === 0
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
                                            ✓
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
                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 w-20">
                                            İşlem
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                    {previewRows.map((row) => (
                                        <tr
                                            key={row._tempId}
                                            className={`transition-all ${
                                                row._excluded
                                                    ? "opacity-40 bg-gray-50 dark:bg-zinc-900/30"
                                                    : "hover:bg-gray-50 dark:hover:bg-zinc-800/30"
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() =>
                                                        toggleExclude(row._tempId)
                                                    }
                                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                                        row._excluded
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
                                                        value={row.date}
                                                        onChange={(e) =>
                                                            updatePreviewField(
                                                                row._tempId,
                                                                "date",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm w-36"
                                                    />
                                                ) : (
                                                    <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                        {formatDate(row.date)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {row._editing ? (
                                                    <input
                                                        type="text"
                                                        value={row.description}
                                                        onChange={(e) =>
                                                            updatePreviewField(
                                                                row._tempId,
                                                                "description",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm w-full min-w-[200px]"
                                                    />
                                                ) : (
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {row.description}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {row._editing ? (
                                                    <select
                                                        value={row.category}
                                                        onChange={(e) =>
                                                            updatePreviewField(
                                                                row._tempId,
                                                                "category",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                                                    >
                                                        {CATEGORIES.map(
                                                            (cat) => (
                                                                <option
                                                                    key={cat}
                                                                    value={cat}
                                                                >
                                                                    {cat}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                ) : (
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                                            CATEGORY_COLORS[row.category] ||
                                                            CATEGORY_COLORS["Diğer"]
                                                        }`}
                                                    >
                                                        {CATEGORY_ICONS[row.category] || "📦"}{" "}
                                                        {row.category}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                {row._editing ? (
                                                    <input
                                                        type="text"
                                                        value={row.installment || ""}
                                                        onChange={(e) =>
                                                            updatePreviewField(
                                                                row._tempId,
                                                                "installment",
                                                                e.target.value || null
                                                            )
                                                        }
                                                        placeholder="—"
                                                        className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm w-20"
                                                    />
                                                ) : (
                                                    row.installment || "—"
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900 dark:text-white">
                                                {row._editing ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={row.amount}
                                                        onChange={(e) =>
                                                            updatePreviewField(
                                                                row._tempId,
                                                                "amount",
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm w-28 text-right"
                                                    />
                                                ) : (
                                                    formatCurrency(row.amount)
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() =>
                                                            toggleEdit(row._tempId)
                                                        }
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-violet-500 transition-colors"
                                                        title={row._editing ? "Kaydet" : "Düzenle"}
                                                    >
                                                        {row._editing ? (
                                                            <FaCheck className="text-xs" />
                                                        ) : (
                                                            <FaEdit className="text-xs" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            removePreviewRow(row._tempId)
                                                        }
                                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Kaldır"
                                                    >
                                                        <FaTrash className="text-xs" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ────── Expenses Table ────── */}
            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-800/50 p-6 shadow-sm">
                {/* Header & Controls */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <FaWallet className="text-violet-500 text-lg" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Kayıtlı Harcamalar
                        </h2>
                        <button
                            onClick={() => fetchData(true)}
                            disabled={isRefreshing}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 transition-colors"
                            title="Yenile"
                        >
                            <FaSync
                                className={`text-sm ${
                                    isRefreshing ? "animate-spin" : ""
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 lg:flex-none lg:w-60">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Açıklamada ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer transition-all"
                            >
                                <option value="all">Tüm Kategoriler</option>
                                {activeCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {CATEGORY_ICONS[cat] || "📦"} {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nominal/Reel Toggle */}
                        <button
                            onClick={() => setShowRealValues(!showRealValues)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                showRealValues
                                    ? "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                                    : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700"
                            }`}
                            title="TÜFE düzeltmeli reel değeri göster"
                        >
                            <FaExchangeAlt className="text-xs" />
                            {showRealValues ? "Reel Değer" : "Nominal"}
                        </button>
                    </div>
                </div>

                {showRealValues && !stats.realAvailable && (
                    <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <FaInfoCircle className="flex-shrink-0" />
                        TÜFE verisi bulunamadı. <code className="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30">cpi_indices</code> tablosuna endeks değerlerini eklemeniz gerekiyor.
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
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-right">
                                        {showRealValues
                                            ? "Reel Tutar"
                                            : "Tutar"}
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 w-12" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {filteredExpenses.map((expense) => {
                                    const realValue = calculateRealValue(
                                        Number(expense.amount),
                                        expense.date
                                    );
                                    const displayAmount =
                                        showRealValues && realValue !== null
                                            ? realValue
                                            : Number(expense.amount);

                                    return (
                                        <tr
                                            key={expense.id}
                                            className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors"
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                                {formatDate(expense.date)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                                                {expense.description}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                                        CATEGORY_COLORS[expense.category] ||
                                                        CATEGORY_COLORS["Diğer"]
                                                    }`}
                                                >
                                                    {CATEGORY_ICONS[expense.category] || "📦"}{" "}
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                {expense.installment || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                                {formatCurrency(displayAmount)}
                                                {showRealValues &&
                                                    realValue !== null && (
                                                        <span className="block text-[10px] font-normal text-gray-400">
                                                            nom.{" "}
                                                            {formatCurrency(
                                                                Number(expense.amount)
                                                            )}
                                                        </span>
                                                    )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() =>
                                                        deleteExpense(expense.id)
                                                    }
                                                    disabled={
                                                        deletingId === expense.id
                                                    }
                                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                                                    title="Sil"
                                                >
                                                    {deletingId === expense.id ? (
                                                        <FaSpinner className="animate-spin text-xs" />
                                                    ) : (
                                                        <FaTrash className="text-xs" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                {filteredExpenses.length > 0 && (
                    <div className="mt-3 text-xs text-gray-400 text-right">
                        {filteredExpenses.length} kayıt gösteriliyor
                        {filteredExpenses.length !== expenses.length && (
                            <span> / toplam {expenses.length}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
