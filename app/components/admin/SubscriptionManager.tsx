"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FaCreditCard,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSync,
    FaSearch,
    FaExternalLinkAlt,
    FaCheck,
    FaTimes,
    FaExclamationCircle,
    FaCalendarAlt,
    FaGlobe,
    FaServer,
    FaCode,
    FaRobot,
    FaCloud,
    FaMusic,
    FaEllipsisH,
    FaForward,
    FaLayerGroup,
    FaMoneyBillWave,
    FaCalendarCheck,
    FaClock
} from "react-icons/fa";

export interface Subscription {
    id: string;
    name: string;
    category: "hosting" | "domain" | "dev_tools" | "ai" | "service" | "entertainment" | "other";
    price: number;
    currency: "TRY" | "USD" | "EUR" | "GBP";
    billing_cycle: "monthly" | "yearly" | "quarterly" | "one_time";
    renewal_date: string; // YYYY-MM-DD
    status: "active" | "paused" | "cancelled";
    payment_method: string | null;
    auto_renew: boolean;
    url: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

interface SubscriptionManagerProps {
    authToken: string;
}

const CATEGORIES: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    hosting: { label: "Sunucu & Hosting", icon: FaServer, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40" },
    domain: { label: "Alan Adı (Domain)", icon: FaGlobe, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/40" },
    dev_tools: { label: "Yazılım & Araçlar", icon: FaCode, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40" },
    ai: { label: "Yapay Zeka (AI)", icon: FaRobot, color: "text-fuchsia-500", bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40 border-fuchsia-200 dark:border-fuchsia-900/40" },
    service: { label: "SaaS & Hizmet", icon: FaCloud, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/40" },
    entertainment: { label: "Medya & Eğlence", icon: FaMusic, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40" },
    other: { label: "Diğer", icon: FaLayerGroup, color: "text-gray-500", bg: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }
};

export default function SubscriptionManager({ authToken }: SubscriptionManagerProps) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [tableMissing, setTableMissing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"date" | "price_desc" | "name">("date");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingSub, setEditingSub] = useState<Subscription | null>(null);
    const [formName, setFormName] = useState<string>("");
    const [formCategory, setFormCategory] = useState<Subscription["category"]>("hosting");
    const [formPrice, setFormPrice] = useState<string>("");
    const [formCurrency, setFormCurrency] = useState<Subscription["currency"]>("TRY");
    const [formBillingCycle, setFormBillingCycle] = useState<Subscription["billing_cycle"]>("monthly");
    const [formRenewalDate, setFormRenewalDate] = useState<string>("");
    const [formStatus, setFormStatus] = useState<Subscription["status"]>("active");
    const [formPaymentMethod, setFormPaymentMethod] = useState<string>("");
    const [formAutoRenew, setFormAutoRenew] = useState<boolean>(true);
    const [formUrl, setFormUrl] = useState<string>("");
    const [formNotes, setFormNotes] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [modalError, setModalError] = useState<string>("");

    // Feedback
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [advancingId, setAdvancingId] = useState<string | null>(null);

    // Fetch subscriptions
    const fetchSubscriptions = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        setIsRefreshing(true);
        setErrorMessage("");
        setTableMissing(false);

        try {
            const res = await fetch("/api/admin/subscriptions", {
                headers: { "x-auth-token": authToken }
            });

            const data = await res.json();
            if (res.ok) {
                setSubscriptions(data.subscriptions || []);
            } else {
                if (data.code === "42P01" || data.error?.includes("relation") || data.error?.includes("does not exist")) {
                    setTableMissing(true);
                }
                setErrorMessage(data.error || "Abonelikler yüklenirken bir hata oluştu.");
            }
        } catch {
            setErrorMessage("Bağlantı hatası: Sunucuya ulaşılamadı.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [authToken]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    // Open Modal for Create
    const handleOpenCreateModal = () => {
        setEditingSub(null);
        setFormName("");
        setFormCategory("hosting");
        setFormPrice("");
        setFormCurrency("TRY");
        setFormBillingCycle("monthly");
        const today = new Date().toISOString().split("T")[0];
        setFormRenewalDate(today);
        setFormStatus("active");
        setFormPaymentMethod("");
        setFormAutoRenew(true);
        setFormUrl("");
        setFormNotes("");
        setModalError("");
        setIsModalOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEditModal = (sub: Subscription) => {
        setEditingSub(sub);
        setFormName(sub.name);
        setFormCategory(sub.category);
        setFormPrice(sub.price.toString());
        setFormCurrency(sub.currency);
        setFormBillingCycle(sub.billing_cycle);
        setFormRenewalDate(sub.renewal_date);
        setFormStatus(sub.status);
        setFormPaymentMethod(sub.payment_method || "");
        setFormAutoRenew(sub.auto_renew);
        setFormUrl(sub.url || "");
        setFormNotes(sub.notes || "");
        setModalError("");
        setIsModalOpen(true);
    };

    // Submit form
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError("");

        if (!formName.trim() || !formPrice || !formRenewalDate) {
            setModalError("Abonelik adı, fiyat ve yenileme tarihi zorunludur.");
            return;
        }

        setIsSubmitting(true);
        try {
            const isEditing = Boolean(editingSub);
            const endpoint = "/api/admin/subscriptions";
            const method = isEditing ? "PUT" : "POST";
            const payload: any = {
                name: formName,
                category: formCategory,
                price: parseFloat(formPrice),
                currency: formCurrency,
                billing_cycle: formBillingCycle,
                renewal_date: formRenewalDate,
                status: formStatus,
                payment_method: formPaymentMethod,
                auto_renew: formAutoRenew,
                url: formUrl,
                notes: formNotes
            };

            if (isEditing && editingSub) {
                payload.id = editingSub.id;
            }

            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (res.ok) {
                setIsModalOpen(false);
                fetchSubscriptions(true);
            } else {
                setModalError(result.error || "İşlem sırasında bir hata oluştu.");
            }
        } catch (err: any) {
            setModalError("Sunucu hatası: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Advance cycle ("Ödendi / 1 Dönem İlerlet")
    const handleAdvanceCycle = async (sub: Subscription) => {
        setAdvancingId(sub.id);
        try {
            const res = await fetch("/api/admin/subscriptions", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken
                },
                body: JSON.stringify({
                    id: sub.id,
                    renewal_date: sub.renewal_date,
                    billing_cycle: sub.billing_cycle,
                    advance_cycle: true
                })
            });

            if (res.ok) {
                fetchSubscriptions(true);
            } else {
                const data = await res.json();
                alert(data.error || "İlerleme işlemi başarısız.");
            }
        } catch {
            alert("Bağlantı hatası.");
        } finally {
            setAdvancingId(null);
        }
    };

    // Delete subscription
    const handleDeleteSub = async (id: string) => {
        if (!confirm("Bu aboneliği silmek istediğinize emin misiniz?")) return;

        setDeletingId(id);
        try {
            const res = await fetch("/api/admin/subscriptions", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken
                },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setSubscriptions(prev => prev.filter(s => s.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || "Silinirken hata oluştu.");
            }
        } catch {
            alert("Bağlantı hatası.");
        } finally {
            setDeletingId(null);
        }
    };

    // Day countdown calculation
    const getDaysRemaining = (dateString: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateString);
        target.setHours(0, 0, 0, 0);
        const diffMs = target.getTime() - today.getTime();
        return Math.round(diffMs / (1000 * 60 * 60 * 24));
    };

    // Financial Metrics
    const metrics = useMemo(() => {
        let monthlyTRY = 0;
        let monthlyUSD = 0;
        let monthlyEUR = 0;

        let activeCount = 0;
        let upcoming7Days = 0;
        let upcoming30Days = 0;

        subscriptions.forEach(sub => {
            if (sub.status === "active") {
                activeCount++;

                // Aylık eşdeğer hesaplama
                let monthlyPrice = Number(sub.price) || 0;
                if (sub.billing_cycle === "yearly") monthlyPrice = monthlyPrice / 12;
                else if (sub.billing_cycle === "quarterly") monthlyPrice = monthlyPrice / 3;
                else if (sub.billing_cycle === "one_time") monthlyPrice = 0;

                if (sub.currency === "TRY") monthlyTRY += monthlyPrice;
                else if (sub.currency === "USD") monthlyUSD += monthlyPrice;
                else if (sub.currency === "EUR") monthlyEUR += monthlyPrice;

                // Gün kontrolü
                const days = getDaysRemaining(sub.renewal_date);
                if (days >= 0 && days <= 7) upcoming7Days++;
                if (days >= 0 && days <= 30) upcoming30Days++;
            }
        });

        return {
            monthlyTRY: Math.round(monthlyTRY),
            monthlyUSD: Math.round(monthlyUSD * 10) / 10,
            monthlyEUR: Math.round(monthlyEUR * 10) / 10,
            activeCount,
            upcoming7Days,
            upcoming30Days
        };
    }, [subscriptions]);

    // Filtered & Sorted Subscriptions
    const filteredSubs = useMemo(() => {
        return subscriptions
            .filter(sub => {
                const query = searchQuery.toLowerCase().trim();
                const matchesSearch =
                    !query ||
                    sub.name.toLowerCase().includes(query) ||
                    (sub.payment_method && sub.payment_method.toLowerCase().includes(query)) ||
                    (sub.notes && sub.notes.toLowerCase().includes(query));

                if (!matchesSearch) return false;

                if (filterCategory !== "all" && sub.category !== filterCategory) return false;
                if (filterStatus !== "all" && sub.status !== filterStatus) return false;

                return true;
            })
            .sort((a, b) => {
                if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
                if (sortBy === "name") return a.name.localeCompare(b.name);
                return new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime();
            });
    }, [subscriptions, searchQuery, filterCategory, filterStatus, sortBy]);

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
                        <FaCreditCard />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Abonelik & Domain Takibi</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            SaaS araçları, alan adları, sunucular ve düzenli ödemelerinizi yönetin.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchSubscriptions()}
                        disabled={isRefreshing}
                        title="Yenile"
                        className="p-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        <FaSync className={isRefreshing ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <FaPlus /> Yeni Abonelik Ekle
                    </button>
                </div>
            </div>

            {/* Table Missing Alert */}
            {tableMissing && (
                <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-amber-900 dark:text-amber-200 flex items-start gap-4">
                    <FaExclamationCircle className="text-2xl flex-shrink-0 text-amber-600 mt-1" />
                    <div className="space-y-1 text-sm">
                        <h4 className="font-bold text-base">Veritabanı Tablosu Henüz Oluşturulmamış</h4>
                        <p className="text-amber-800 dark:text-amber-300/90">
                            Abonelikler modülünü kullanabilmek için <code className="px-2 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/50 font-mono">lib/supabase/schema_links_subscriptions.sql</code> dosyasındaki SQL kodunu Supabase &gt; SQL Editor alanında çalıştırın.
                        </p>
                    </div>
                </div>
            )}

            {/* General Error Message */}
            {errorMessage && !tableMissing && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center justify-between">
                    <span>{errorMessage}</span>
                    <button onClick={() => fetchSubscriptions()} className="underline hover:no-underline text-xs">Tekrar Dene</button>
                </div>
            )}

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Aylık Sabit Maliyet</span>
                        <FaMoneyBillWave className="text-emerald-500 text-sm" />
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {metrics.monthlyTRY > 0 && `${metrics.monthlyTRY.toLocaleString("tr-TR")} ₺`}
                        {metrics.monthlyTRY > 0 && metrics.monthlyUSD > 0 && " + "}
                        {metrics.monthlyUSD > 0 && `$${metrics.monthlyUSD}`}
                        {metrics.monthlyTRY === 0 && metrics.monthlyUSD === 0 && "0 ₺"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Yıllık tahmini: ~{((metrics.monthlyTRY * 12)).toLocaleString("tr-TR")} ₺ {metrics.monthlyUSD > 0 && `+ $${metrics.monthlyUSD * 12}`}
                    </div>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">7 Gün İçinde</span>
                        <FaClock className="text-amber-500 text-sm" />
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {metrics.upcoming7Days}
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                        {metrics.upcoming7Days > 0 ? "Yaklaşan yenileme var!" : "Yakında ödeme yok"}
                    </div>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">30 Gün İçinde</span>
                        <FaCalendarCheck className="text-indigo-500 text-sm" />
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {metrics.upcoming30Days} servis
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Önümüzdeki bir ayda ödenecek
                    </div>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Aktif Servisler</span>
                        <FaLayerGroup className="text-blue-500 text-sm" />
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {metrics.activeCount} <span className="text-sm font-normal text-gray-400">/ {subscriptions.length}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {subscriptions.length - metrics.activeCount} duraklatılmış veya iptal
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-gray-200/70 dark:border-zinc-800">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Abonelik adı, kart veya notlarda ara..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="active">Sadece Aktif</option>
                        <option value="paused">Duraklatıldı</option>
                        <option value="cancelled">İptal Edildi</option>
                    </select>

                    {/* Category Filter */}
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">Tüm Kategoriler</option>
                        {Object.entries(CATEGORIES).map(([key, cat]) => (
                            <option key={key} value={key}>{cat.label}</option>
                        ))}
                    </select>

                    {/* Sort By */}
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="date">Yenileme Tarihine Göre</option>
                        <option value="price_desc">Fiyata Göre (Yüksek-Düşük)</option>
                        <option value="name">İsme Göre (A-Z)</option>
                    </select>
                </div>
            </div>

            {/* Subscriptions Grid */}
            {isLoading ? (
                <div className="py-20 text-center text-gray-400">
                    <FaSync className="animate-spin text-3xl mx-auto mb-3 text-indigo-500" />
                    <p className="text-sm font-medium">Abonelikler yükleniyor...</p>
                </div>
            ) : filteredSubs.length === 0 ? (
                <div className="py-16 text-center bg-white/40 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800 p-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mx-auto mb-4">
                        <FaCreditCard />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {searchQuery ? "Aramaya uygun abonelik bulunamadı" : "Henüz bir abonelik veya domain eklenmemiş"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-5">
                        {searchQuery ? "Filtreleri temizleyip tekrar deneyin." : "Vercel, Supabase, Domainleriniz veya AI araçlarınızı ekleyerek son ödeme tarihlerini kaçırmayın."}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={handleOpenCreateModal}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                        >
                            <FaPlus /> İlk Aboneliği Ekle
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubs.map(sub => {
                        const days = getDaysRemaining(sub.renewal_date);
                        const categoryMeta = CATEGORIES[sub.category] || CATEGORIES.other;
                        const CategoryIcon = categoryMeta.icon;

                        // Countdown styling
                        let badgeBg = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40";
                        let badgeText = `${days} gün kaldı`;

                        if (sub.status !== "active") {
                            badgeBg = "bg-gray-100 dark:bg-zinc-800 text-gray-500 border-gray-200 dark:border-zinc-700";
                            badgeText = sub.status === "paused" ? "Duraklatıldı" : "İptal Edildi";
                        } else if (days < 0) {
                            badgeBg = "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/40";
                            badgeText = `${Math.abs(days)} gün geçti!`;
                        } else if (days === 0) {
                            badgeBg = "bg-rose-500 text-white animate-pulse font-extrabold shadow-sm";
                            badgeText = "Bugün Yenileniyor!";
                        } else if (days <= 3) {
                            badgeBg = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40 font-bold";
                            badgeText = `${days} gün kaldı!`;
                        }

                        const cycleLabel = {
                            monthly: "Aylık",
                            yearly: "Yıllık",
                            quarterly: "3 Aylık",
                            one_time: "Tek Seferlik"
                        }[sub.billing_cycle] || sub.billing_cycle;

                        return (
                            <div
                                key={sub.id}
                                className={`flex flex-col justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border transition-all hover:shadow-md ${sub.status === "active"
                                    ? "border-gray-200/90 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800/60"
                                    : "border-gray-200/50 dark:border-zinc-900 opacity-60 bg-gray-50/50 dark:bg-zinc-950/50"
                                    }`}
                            >
                                {/* Card Header */}
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm border ${categoryMeta.bg} ${categoryMeta.color}`}>
                                                <CategoryIcon />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                                                    {sub.name}
                                                </h3>
                                                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    {categoryMeta.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Countdown / Status Badge */}
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${badgeBg}`}>
                                            {badgeText}
                                        </span>
                                    </div>

                                    {/* Price & Cycle */}
                                    <div className="flex items-baseline gap-1.5 my-3 pb-3 border-b border-gray-100 dark:border-zinc-800">
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                                            {sub.currency === "TRY" ? `${sub.price} ₺` : `${sub.currency === "USD" ? "$" : sub.currency === "EUR" ? "€" : sub.currency} ${sub.price}`}
                                        </span>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            / {cycleLabel}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">Yenileme Tarihi:</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                                <FaCalendarAlt className="text-[10px] text-indigo-500" />
                                                {new Date(sub.renewal_date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                                            </span>
                                        </div>

                                        {sub.payment_method && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Ödeme Yöntemi:</span>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                    {sub.payment_method}
                                                </span>
                                            </div>
                                        )}

                                        {sub.notes && (
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg mt-2">
                                                {sub.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-1.5">
                                        {/* Advance Cycle ("Ödendi") Button */}
                                        <button
                                            onClick={() => handleAdvanceCycle(sub)}
                                            disabled={advancingId === sub.id}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                            title="Ödendi olarak işaretle ve bir sonraki döneme ilerlet"
                                        >
                                            <FaForward className={advancingId === sub.id ? "animate-pulse" : "text-[10px]"} />
                                            <span>Ödendi</span>
                                        </button>

                                        {/* Portal URL */}
                                        {sub.url && (
                                            <a
                                                href={sub.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 rounded-xl text-xs transition-colors"
                                                title="Sağlayıcı Yönetim Paneline Git"
                                            >
                                                <FaExternalLinkAlt />
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {/* Edit */}
                                        <button
                                            onClick={() => handleOpenEditModal(sub)}
                                            className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 rounded-xl text-xs transition-colors"
                                            title="Düzenle"
                                        >
                                            <FaEdit />
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDeleteSub(sub.id)}
                                            disabled={deletingId === sub.id}
                                            className="p-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-xl text-xs transition-colors disabled:opacity-50"
                                            title="Sil"
                                        >
                                            <FaTrash className={deletingId === sub.id ? "animate-spin" : ""} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal: Create / Edit Subscription */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                                    <FaCreditCard />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                        {editingSub ? "Aboneliği Düzenle" : "Yeni Abonelik / Domain Ekle"}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Yenileme ve maliyet takibi için bilgileri doldurun.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            {modalError && (
                                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                                    {modalError}
                                </div>
                            )}

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    Abonelik / Servis Adı *
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    placeholder="Örn: Vercel Pro, Supabase, keremkk.com Domain, ChatGPT Plus..."
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Category & Status */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                        Kategori
                                    </label>
                                    <select
                                        value={formCategory}
                                        onChange={e => setFormCategory(e.target.value as any)}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                    >
                                        {Object.entries(CATEGORIES).map(([key, cat]) => (
                                            <option key={key} value={key}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                        Durum
                                    </label>
                                    <select
                                        value={formStatus}
                                        onChange={e => setFormStatus(e.target.value as any)}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="paused">Duraklatıldı</option>
                                        <option value="cancelled">İptal Edildi</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price & Currency & Billing Cycle */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                        Fiyat *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formPrice}
                                        onChange={e => setFormPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                        Para Birimi
                                    </label>
                                    <select
                                        value={formCurrency}
                                        onChange={e => setFormCurrency(e.target.value as any)}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                    >
                                        <option value="TRY">TRY (₺)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                        Periyot
                                    </label>
                                    <select
                                        value={formBillingCycle}
                                        onChange={e => setFormBillingCycle(e.target.value as any)}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                    >
                                        <option value="monthly">Aylık</option>
                                        <option value="yearly">Yıllık</option>
                                        <option value="quarterly">3 Aylık</option>
                                        <option value="one_time">Tek Sefer</option>
                                    </select>
                                </div>
                            </div>

                            {/* Renewal Date & Payment Method */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                        Yenileme Tarihi *
                                    </label>
                                    <input
                                        type="date"
                                        value={formRenewalDate}
                                        onChange={e => setFormRenewalDate(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                        Ödeme Yöntemi
                                    </label>
                                    <input
                                        type="text"
                                        value={formPaymentMethod}
                                        onChange={e => setFormPaymentMethod(e.target.value)}
                                        placeholder="Örn: Enpara Sanal Kart..."
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Portal URL */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    Giriş / Yönetim Paneli Linki (Opsiyonel)
                                </label>
                                <input
                                    type="url"
                                    value={formUrl}
                                    onChange={e => setFormUrl(e.target.value)}
                                    placeholder="https://vercel.com/dashboard..."
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    Notlar / Hatırlatma
                                </label>
                                <textarea
                                    value={formNotes}
                                    onChange={e => setFormNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Örn: 2026 Kasım'a kadar indirimli, iptal etmek için 15 gün önce bildir..."
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white resize-none"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? "Kaydediliyor..." : editingSub ? "Güncelle" : "Ekle"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
