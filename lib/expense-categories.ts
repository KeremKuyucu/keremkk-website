// ─── Expense Categories ──────────────────────────────────────────────────────
// Tek kaynak. Frontend ve API route'larının hepsi buradan import eder.
// Kategori eklemek / çıkarmak için yalnızca bu dosyayı düzenlemek yeterli.

export const EXPENSE_CATEGORIES = [
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
    "Ev",
    "Kişisel Bakım",
    "Seyahat",
    "Konaklama",
    "Sigorta",
    "Finans",
    "Vergi",
    "Bağış",
    "Diğer",
] as const;

export type ExpenseCategory =
    (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_COLORS: Record<
    string,
    string
> = {
    Market:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",

    "Yeme-İçme":
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",

    Akaryakıt:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",

    Teknoloji:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",

    Fatura:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",

    Giyim:
        "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",

    Ulaşım:
        "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",

    Sağlık:
        "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",

    Eğlence:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",

    Eğitim:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",

    Ev:
        "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",

    "Kişisel Bakım":
        "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",

    Seyahat:
        "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",

    Konaklama:
        "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",

    Sigorta:
        "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",

    Finans:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",

    Vergi:
        "bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400",

    Bağış:
        "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",

    Diğer:
        "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
};

export const EXPENSE_CATEGORY_ICONS: Record<
    string,
    string
> = {
    Market: "🛒",
    "Yeme-İçme": "🍽️",
    Akaryakıt: "⛽",
    Teknoloji: "💻",
    Fatura: "📄",
    Giyim: "👗",
    Ulaşım: "🚗",
    Sağlık: "🏥",
    Eğlence: "🎬",
    Eğitim: "📚",
    Ev: "🏠",
    "Kişisel Bakım": "🧴",
    Seyahat: "✈️",
    Konaklama: "🏨",
    Sigorta: "🛡️",
    Finans: "💳",
    Vergi: "🧾",
    Bağış: "❤️",
    Diğer: "📦",
};