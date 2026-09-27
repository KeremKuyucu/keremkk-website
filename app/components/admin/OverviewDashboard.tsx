"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    FaThLarge,
    FaWallet,
    FaCreditCard,
    FaEnvelope,
    FaServer,
    FaLink,
    FaStickyNote,
    FaChartBar,
    FaSync,
    FaArrowRight,
    FaExclamationTriangle,
    FaCheckCircle,
    FaClock,
    FaCalendarAlt,
    FaPlus,
    FaExternalLinkAlt,
    FaShieldAlt,
    FaChevronRight,
    FaBell,
    FaBolt,
    FaLayerGroup
} from "react-icons/fa";

interface OverviewDashboardProps {
    authToken: string;
    onNavigate?: (moduleId: string) => void;
}

interface SubscriptionItem {
    id: string;
    name: string;
    category: string;
    price: number;
    currency: string;
    billing_cycle: string;
    renewal_date: string;
    status: string;
}

interface ExpenseItem {
    id: string;
    date: string;
    description: string;
    amount: number;
    currency?: string;
    category: string;
}

interface MessageItem {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    timestamp: number;
}

interface MonitorItem {
    id: string;
    name: string;
    enabled: boolean;
}

interface LinkItem {
    id: string;
    slug: string;
    title: string;
    target_url: string;
    clicks: number;
    is_active: boolean;
}

interface NoteItem {
    id: string;
    title?: string;
    content: string;
    updatedAt?: number;
    updated_at?: string;
}

export default function OverviewDashboard({ authToken, onNavigate }: OverviewDashboardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Module states
    const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [monitors, setMonitors] = useState<MonitorItem[]>([]);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Fetch all overview metrics in parallel
    const fetchOverviewData = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        setIsRefreshing(true);

        const headers = { "x-auth-token": authToken };

        try {
            const [
                subsRes,
                expensesRes,
                messagesRes,
                monitorsRes,
                linksRes,
                notesRes
            ] = await Promise.allSettled([
                fetch("/api/admin/subscriptions", { headers }).then(r => r.json()),
                fetch("/api/admin/expenses", { headers }).then(r => r.json()),
                fetch("/api/admin/messages", { headers }).then(r => r.json()),
                fetch("/api/admin/monitor", { headers }).then(r => r.json()),
                fetch("/api/admin/links", { headers }).then(r => r.json()),
                fetch("/api/admin/notes", { headers }).then(r => r.json())
            ]);

            if (subsRes.status === "fulfilled" && subsRes.value?.subscriptions) {
                setSubscriptions(subsRes.value.subscriptions);
            }
            if (expensesRes.status === "fulfilled" && expensesRes.value?.expenses) {
                setExpenses(expensesRes.value.expenses);
            }
            if (messagesRes.status === "fulfilled" && messagesRes.value?.messages) {
                setMessages(messagesRes.value.messages);
            }
            if (monitorsRes.status === "fulfilled" && monitorsRes.value?.projects) {
                setMonitors(monitorsRes.value.projects);
            }
            if (linksRes.status === "fulfilled" && linksRes.value?.links) {
                setLinks(linksRes.value.links);
            }
            if (notesRes.status === "fulfilled" && notesRes.value?.notes) {
                setNotes(notesRes.value.notes);
            }

            setLastUpdated(new Date());
        } catch (err) {
            console.error("Overview data fetch error:", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [authToken]);

    useEffect(() => {
        fetchOverviewData();
    }, [fetchOverviewData]);

    // --- Calculations ---

    // 1. Current Month Expenses
    const currentMonthExpenses = useMemo(() => {
        const now = new Date();
        const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        
        const thisMonthList = expenses.filter(e => e.date?.startsWith(currentYearMonth));
        const totalTry = thisMonthList
            .filter(e => !e.currency || e.currency === "TRY")
            .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        
        return {
            totalTry,
            count: thisMonthList.length
        };
    }, [expenses]);

    // 2. Active Subscriptions & Estimated Monthly Recurring Cost
    const subscriptionStats = useMemo(() => {
        const activeSubs = subscriptions.filter(s => s.status === "active");
        let monthlyTotalTry = 0;

        activeSubs.forEach(sub => {
            const price = Number(sub.price) || 0;
            // Approximate to monthly
            let monthly = price;
            if (sub.billing_cycle === "yearly") monthly = price / 12;
            else if (sub.billing_cycle === "quarterly") monthly = price / 3;

            if (sub.currency === "TRY") monthlyTotalTry += monthly;
        });

        // Upcoming renewals within 14 days
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const in14Days = new Date(today);
        in14Days.setDate(in14Days.getDate() + 14);

        const upcoming = activeSubs
            .filter(sub => {
                if (!sub.renewal_date) return false;
                const rDate = new Date(sub.renewal_date);
                return rDate >= today && rDate <= in14Days;
            })
            .sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime());

        return {
            activeCount: activeSubs.length,
            monthlyTotalTry,
            upcoming
        };
    }, [subscriptions]);

    // 3. Link Clicks Total
    const totalClicks = useMemo(() => {
        return links.reduce((sum, l) => sum + (Number(l.clicks) || 0), 0);
    }, [links]);

    // 4. Monitor Services Status
    const monitorStats = useMemo(() => {
        const total = monitors.length;
        const active = monitors.filter(m => m.enabled).length;
        return { total, active };
    }, [monitors]);

    // Helper navigation
    const navigateTo = (tabId: string) => {
        if (onNavigate) {
            onNavigate(tabId);
        }
    };

    const formatCurrency = (val: number, currency: string = "TRY") => {
        const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺";
        return `${symbol}${val.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Top Welcome & Health Status Bar */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-pink-600/10 border border-violet-500/20 backdrop-blur-xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-3">
                            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                            Admin Komuta Merkezi
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Hoş Geldin, Kerem 👋
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Sistem durumu, son harcamalar, yaklaşan abonelikler ve gelen mesajların anlık özeti.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-gray-400 font-medium">Son Güncelleme</div>
                            <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                {lastUpdated.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>

                        <button
                            onClick={() => fetchOverviewData(true)}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-60"
                        >
                            <FaSync className={`text-xs ${isRefreshing ? "animate-spin text-violet-500" : ""}`} />
                            <span>Yenile</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Upcoming Renewals Alert Banner (if any within 14 days) */}
            {subscriptionStats.upcoming.length > 0 && (
                <div className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 text-lg">
                            <FaBell />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                Yaklaşan Abonelik Yenilemeleri ({subscriptionStats.upcoming.length})
                            </h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300/80">
                                Önümüzdeki 14 gün içinde ödemesi gerçekleşecek aboneliklerin bulunuyor.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        {subscriptionStats.upcoming.slice(0, 2).map(sub => (
                            <span
                                key={sub.id}
                                className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-semibold"
                            >
                                {sub.name} ({formatCurrency(sub.price, sub.currency)}) &bull; {sub.renewal_date}
                            </span>
                        ))}
                        <button
                            onClick={() => navigateTo("subscriptions")}
                            className="ml-auto md:ml-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
                        >
                            Tümünü Gör <FaArrowRight className="text-[10px]" />
                        </button>
                    </div>
                </div>
            )}

            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* 1. Harcamalar */}
                <div
                    onClick={() => navigateTo("expenses")}
                    className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-gray-200/80 dark:border-zinc-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                            <FaWallet />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                            Bu Ay <FaChevronRight className="text-[9px]" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {formatCurrency(currentMonthExpenses.totalTry, "TRY")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between">
                            <span>Aylık Harcama</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{currentMonthExpenses.count} İşlem</span>
                        </div>
                    </div>
                </div>

                {/* 2. Abonelikler */}
                <div
                    onClick={() => navigateTo("subscriptions")}
                    className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-gray-200/80 dark:border-zinc-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                            <FaCreditCard />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                            Aktif <FaChevronRight className="text-[9px]" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {subscriptionStats.activeCount}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between">
                            <span>Abonelik</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                ~{formatCurrency(subscriptionStats.monthlyTotalTry, "TRY")}/ay
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Mesajlar */}
                <div
                    onClick={() => navigateTo("messages")}
                    className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-gray-200/80 dark:border-zinc-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                            <FaEnvelope />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-violet-500 transition-colors flex items-center gap-1">
                            Gelen <FaChevronRight className="text-[9px]" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {messages.length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between">
                            <span>İletişim Mesajı</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {messages.length > 0 ? "Son: " + new Date(messages[0].timestamp).toLocaleDateString("tr-TR") : "Kutu boş"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Monitör */}
                <div
                    onClick={() => navigateTo("monitor")}
                    className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-gray-200/80 dark:border-zinc-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                            <FaServer />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-cyan-500 transition-colors flex items-center gap-1">
                            Sağlık <FaChevronRight className="text-[9px]" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <span>{monitorStats.active}/{monitorStats.total}</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between">
                            <span>Monitör Projesi</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Çalışıyor</span>
                        </div>
                    </div>
                </div>

                {/* 5. Kısa Linkler */}
                <div
                    onClick={() => navigateTo("links")}
                    className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-gray-200/80 dark:border-zinc-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                            <FaLink />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-fuchsia-500 transition-colors flex items-center gap-1">
                            Linkler <FaChevronRight className="text-[9px]" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {links.length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between">
                            <span>Kısa Link</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalClicks} Tıklama</span>
                        </div>
                    </div>
                </div>

                {/* 6. Notlar */}
                <div
                    onClick={() => navigateTo("notes")}
                    className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-gray-200/80 dark:border-zinc-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                            <FaStickyNote />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-amber-500 transition-colors flex items-center gap-1">
                            Notlar <FaChevronRight className="text-[9px]" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {notes.length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between">
                            <span>Kayıtlı Not</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Aktif</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-zinc-900/60 rounded-3xl p-6 border border-gray-200 dark:border-zinc-800/80 backdrop-blur-xl">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaBolt className="text-violet-500" /> Hızlı Eylemler (Quick Actions)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <button
                        onClick={() => navigateTo("notes")}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/30 border border-gray-200/60 dark:border-zinc-700/60 hover:border-violet-500/40 transition-all text-center group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <FaStickyNote />
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Hızlı Not Al</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">Notlar modülüne git</span>
                    </button>

                    <button
                        onClick={() => navigateTo("links")}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/30 border border-gray-200/60 dark:border-zinc-700/60 hover:border-violet-500/40 transition-all text-center group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <FaLink />
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Kısa Link Üret</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">/go/link oluştur</span>
                    </button>

                    <button
                        onClick={() => navigateTo("expenses")}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/30 border border-gray-200/60 dark:border-zinc-700/60 hover:border-violet-500/40 transition-all text-center group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <FaWallet />
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Harcama Ekle</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">AI Fiş veya manuel</span>
                    </button>

                    <button
                        onClick={() => navigateTo("subscriptions")}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/30 border border-gray-200/60 dark:border-zinc-700/60 hover:border-violet-500/40 transition-all text-center group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <FaCreditCard />
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Abonelik Yönet</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">Yenileme & ödemeler</span>
                    </button>

                    <button
                        onClick={() => navigateTo("monitor")}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/30 border border-gray-200/60 dark:border-zinc-700/60 hover:border-violet-500/40 transition-all text-center group col-span-2 sm:col-span-1"
                    >
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <FaServer />
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Sistemleri Test Et</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">Uptime & Supabase</span>
                    </button>
                </div>
            </div>

            {/* Two Column Detailed Section: Recent Expenses & Top Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Son Harcamalar */}
                <div className="bg-white dark:bg-zinc-900/60 rounded-3xl p-6 border border-gray-200 dark:border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaWallet className="text-emerald-500" /> Son Harcamalar
                            </h3>
                            <button
                                onClick={() => navigateTo("expenses")}
                                className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                            >
                                Tümünü Gör <FaArrowRight className="text-[10px]" />
                            </button>
                        </div>

                        {expenses.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-400">
                                Henüz kayıtlı harcama bulunmuyor.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {expenses.slice(0, 5).map(item => (
                                    <div key={item.id} className="py-3 flex justify-between items-center">
                                        <div className="min-w-0 pr-3">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                {item.description || "Açıklamasız Harcama"}
                                            </div>
                                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                                <span>{item.date}</span>
                                                <span>&bull;</span>
                                                <span className="capitalize">{item.category}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                                            {formatCurrency(item.amount, item.currency || "TRY")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Popüler Kısa Linkler */}
                <div className="bg-white dark:bg-zinc-900/60 rounded-3xl p-6 border border-gray-200 dark:border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaLink className="text-fuchsia-500" /> En Çok Tıklanan Linkler
                            </h3>
                            <button
                                onClick={() => navigateTo("links")}
                                className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                            >
                                Tümünü Gör <FaArrowRight className="text-[10px]" />
                            </button>
                        </div>

                        {links.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-400">
                                Henüz oluşturulmuş kısa link bulunmuyor.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {[...links]
                                    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
                                    .slice(0, 5)
                                    .map(link => (
                                        <div key={link.id} className="py-3 flex justify-between items-center">
                                            <div className="min-w-0 pr-3">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                    <span className="text-violet-600 dark:text-violet-400 font-mono">/go/{link.slug}</span>
                                                    {link.title && <span className="text-xs text-gray-400 font-normal truncate">({link.title})</span>}
                                                </div>
                                                <div className="text-xs text-gray-400 truncate mt-0.5">
                                                    {link.target_url}
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-2">
                                                <span className="px-2.5 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 text-xs font-bold">
                                                    {link.clicks || 0} tık
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Son Mesajlar & Notlar Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Son Gelen İletişim Mesajları */}
                <div className="bg-white dark:bg-zinc-900/60 rounded-3xl p-6 border border-gray-200 dark:border-zinc-800/80 backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaEnvelope className="text-violet-500" /> Son İletişim Mesajları
                        </h3>
                        <button
                            onClick={() => navigateTo("messages")}
                            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                        >
                            Tüm Mesajlar <FaArrowRight className="text-[10px]" />
                        </button>
                    </div>

                    {messages.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-400">
                            Gelen kutusu boş.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {messages.slice(0, 3).map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => navigateTo("messages")}
                                    className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-gray-100 dark:border-zinc-800"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                                            {msg.name} ({msg.email})
                                        </div>
                                        <span className="text-[10px] text-gray-400 shrink-0">
                                            {new Date(msg.timestamp).toLocaleDateString("tr-TR")}
                                        </span>
                                    </div>
                                    <div className="text-xs font-medium text-violet-600 dark:text-violet-400 mt-0.5 truncate">
                                        {msg.subject || "Konusuz"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Son Güncellenen Notlar */}
                <div className="bg-white dark:bg-zinc-900/60 rounded-3xl p-6 border border-gray-200 dark:border-zinc-800/80 backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaStickyNote className="text-amber-500" /> Hızlı Notlar
                        </h3>
                        <button
                            onClick={() => navigateTo("notes")}
                            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                        >
                            Not Defterine Git <FaArrowRight className="text-[10px]" />
                        </button>
                    </div>

                    {notes.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-400">
                            Henüz kayıtlı bir not yok.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notes.slice(0, 3).map(note => (
                                <div
                                    key={note.id}
                                    onClick={() => navigateTo("notes")}
                                    className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-gray-100 dark:border-zinc-800"
                                >
                                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                        {note.title || "İsimsiz Not"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 whitespace-pre-line">
                                        {note.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
