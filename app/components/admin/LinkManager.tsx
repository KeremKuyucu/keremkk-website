"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FaLink,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSync,
    FaSearch,
    FaCopy,
    FaCheck,
    FaExternalLinkAlt,
    FaMousePointer,
    FaToggleOn,
    FaToggleOff,
    FaTimes,
    FaExclamationCircle,
    FaCalendarAlt,
    FaChartLine,
    FaGlobe,
    FaBolt
} from "react-icons/fa";

export interface ShortLink {
    id: string;
    slug: string;
    title: string;
    target_url: string;
    description: string | null;
    clicks: number;
    is_active: boolean;
    last_clicked_at: string | null;
    created_at: string;
    updated_at: string;
}

interface LinkManagerProps {
    authToken: string;
}

export default function LinkManager({ authToken }: LinkManagerProps) {
    const [links, setLinks] = useState<ShortLink[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [tableMissing, setTableMissing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [sortBy, setSortBy] = useState<"created" | "clicks" | "title">("created");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingLink, setEditingLink] = useState<ShortLink | null>(null);
    const [formTitle, setFormTitle] = useState<string>("");
    const [formSlug, setFormSlug] = useState<string>("");
    const [formTargetUrl, setFormTargetUrl] = useState<string>("");
    const [formDescription, setFormDescription] = useState<string>("");
    const [formIsActive, setFormIsActive] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [modalError, setModalError] = useState<string>("");

    // Feedback
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Origin
    const [originUrl, setOriginUrl] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOriginUrl(window.location.origin);
        }
    }, []);

    // Fetch links
    const fetchLinks = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        setIsRefreshing(true);
        setErrorMessage("");
        setTableMissing(false);

        try {
            const res = await fetch("/api/admin/links", {
                headers: { "x-auth-token": authToken }
            });

            const data = await res.json();
            if (res.ok) {
                setLinks(data.links || []);
            } else {
                if (data.code === "42P01" || data.error?.includes("relation") || data.error?.includes("does not exist")) {
                    setTableMissing(true);
                }
                setErrorMessage(data.error || "Linkler yüklenirken bir hata oluştu.");
            }
        } catch (err: any) {
            setErrorMessage("Bağlantı hatası: Sunucuya ulaşılamadı.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [authToken]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    // Copy short link helper
    const handleCopyShortUrl = (slug: string) => {
        const fullUrl = `${originUrl || "https://keremkk.com.tr"}/go/${slug}`;
        navigator.clipboard.writeText(fullUrl);
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
    };

    // Auto-generate slug from title
    const handleAutoGenerateSlug = (title: string) => {
        const generated = title
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
        setFormSlug(generated);
    };

    // Open Modal for Create
    const handleOpenCreateModal = () => {
        setEditingLink(null);
        setFormTitle("");
        setFormSlug("");
        setFormTargetUrl("");
        setFormDescription("");
        setFormIsActive(true);
        setModalError("");
        setIsModalOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEditModal = (link: ShortLink) => {
        setEditingLink(link);
        setFormTitle(link.title);
        setFormSlug(link.slug);
        setFormTargetUrl(link.target_url);
        setFormDescription(link.description || "");
        setFormIsActive(link.is_active);
        setModalError("");
        setIsModalOpen(true);
    };

    // Submit form (create or edit)
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError("");

        if (!formTitle.trim() || !formSlug.trim() || !formTargetUrl.trim()) {
            setModalError("Başlık, slug ve hedef URL alanları zorunludur.");
            return;
        }

        setIsSubmitting(true);
        try {
            const isEditing = Boolean(editingLink);
            const endpoint = "/api/admin/links";
            const method = isEditing ? "PUT" : "POST";
            const payload: any = {
                title: formTitle,
                slug: formSlug,
                target_url: formTargetUrl,
                description: formDescription,
                is_active: formIsActive
            };

            if (isEditing && editingLink) {
                payload.id = editingLink.id;
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
                fetchLinks(true);
            } else {
                setModalError(result.error || "İşlem sırasında bir hata oluştu.");
            }
        } catch (err: any) {
            setModalError("Sunucu hatası: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle active status
    const handleToggleStatus = async (link: ShortLink) => {
        try {
            // Optimistik UI güncellemesi
            setLinks(prev => prev.map(l => l.id === link.id ? { ...l, is_active: !l.is_active } : l));

            const res = await fetch("/api/admin/links", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken
                },
                body: JSON.stringify({
                    id: link.id,
                    is_active: !link.is_active
                })
            });

            if (!res.ok) {
                // Geri al
                fetchLinks(true);
            }
        } catch {
            fetchLinks(true);
        }
    };

    // Delete link
    const handleDeleteLink = async (id: string) => {
        if (!confirm("Bu kısa linki silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

        setDeletingId(id);
        try {
            const res = await fetch("/api/admin/links", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken
                },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setLinks(prev => prev.filter(l => l.id !== id));
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

    // Metrics
    const totalClicks = useMemo(() => links.reduce((sum, l) => sum + (l.clicks || 0), 0), [links]);
    const activeCount = useMemo(() => links.filter(l => l.is_active).length, [links]);
    const mostPopularLink = useMemo(() => {
        if (links.length === 0) return null;
        return [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];
    }, [links]);

    // Filtered & Sorted links
    const filteredLinks = useMemo(() => {
        return links
            .filter(link => {
                const query = searchQuery.toLowerCase().trim();
                const matchesSearch =
                    !query ||
                    link.title.toLowerCase().includes(query) ||
                    link.slug.toLowerCase().includes(query) ||
                    link.target_url.toLowerCase().includes(query) ||
                    (link.description && link.description.toLowerCase().includes(query));

                if (!matchesSearch) return false;

                if (filterStatus === "active") return link.is_active;
                if (filterStatus === "inactive") return !link.is_active;
                return true;
            })
            .sort((a, b) => {
                if (sortBy === "clicks") return (b.clicks || 0) - (a.clicks || 0);
                if (sortBy === "title") return a.title.localeCompare(b.title);
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
    }, [links, searchQuery, filterStatus, sortBy]);

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-600/10 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400 flex items-center justify-center text-lg">
                            <FaLink />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kısa Link Yöneticisi</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-mono font-semibold text-violet-600 dark:text-violet-400">/go/[slug]</span> ile yönlendirmeler oluşturun ve tıklanma istatistiklerini takip edin.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchLinks()}
                        disabled={isRefreshing}
                        title="Yenile"
                        className="p-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        <FaSync className={isRefreshing ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <FaPlus /> Yeni Link Oluştur
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
                            Kısa linkler tablosunun aktifleşmesi için lütfen <code className="px-2 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/50 font-mono">lib/supabase/schema_links_subscriptions.sql</code> dosyasındaki SQL kodlarını Supabase Dashboard &gt; SQL Editor alanında çalıştırın.
                        </p>
                    </div>
                </div>
            )}

            {/* General Error Message */}
            {errorMessage && !tableMissing && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center justify-between">
                    <span>{errorMessage}</span>
                    <button onClick={() => fetchLinks()} className="underline hover:no-underline text-xs">Tekrar Dene</button>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Toplam Link</span>
                        <FaLink className="text-violet-500 text-sm" />
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {links.length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {activeCount} aktif, {links.length - activeCount} pasif
                    </div>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Toplam Tıklanma</span>
                        <FaMousePointer className="text-emerald-500 text-sm" />
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {totalClicks.toLocaleString("tr-TR")}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <FaChartLine /> Tüm yönlendirmeler
                    </div>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">En Popüler Link</span>
                        <FaBolt className="text-amber-500 text-sm" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white truncate" title={mostPopularLink?.title || "-"}>
                        {mostPopularLink ? mostPopularLink.title : "-"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                        {mostPopularLink ? `/go/${mostPopularLink.slug} (${mostPopularLink.clicks} tık)` : "Veri yok"}
                    </div>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Kısa Link Formatı</span>
                        <FaGlobe className="text-indigo-500 text-sm" />
                    </div>
                    <div className="text-sm font-mono font-semibold text-violet-600 dark:text-violet-400 truncate">
                        {originUrl ? `${originUrl.replace(/^https?:\/\//, "")}/go/...` : "/go/[slug]"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Otomatik 307 Yönlendirme
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-gray-200/70 dark:border-zinc-800">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Link başlığı, slug veya hedef URL ile ara..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
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
                    <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                        <button
                            onClick={() => setFilterStatus("all")}
                            className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "all" ? "bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            Tümü ({links.length})
                        </button>
                        <button
                            onClick={() => setFilterStatus("active")}
                            className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "active" ? "bg-white dark:bg-zinc-700 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            Aktif ({activeCount})
                        </button>
                        <button
                            onClick={() => setFilterStatus("inactive")}
                            className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "inactive" ? "bg-white dark:bg-zinc-700 shadow-sm text-amber-600 dark:text-amber-400" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            Pasif ({links.length - activeCount})
                        </button>
                    </div>

                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="created">En Yeni</option>
                        <option value="clicks">En Çok Tıklanan</option>
                        <option value="title">İsme Göre (A-Z)</option>
                    </select>
                </div>
            </div>

            {/* Links List */}
            {isLoading ? (
                <div className="py-20 text-center text-gray-400">
                    <FaSync className="animate-spin text-3xl mx-auto mb-3 text-violet-500" />
                    <p className="text-sm font-medium">Linkler yükleniyor...</p>
                </div>
            ) : filteredLinks.length === 0 ? (
                <div className="py-16 text-center bg-white/40 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800 p-8">
                    <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center text-2xl mx-auto mb-4">
                        <FaLink />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {searchQuery ? "Aramaya uygun link bulunamadı" : "Henüz bir kısa link eklenmemiş"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-5">
                        {searchQuery ? "Farklı anahtar kelimelerle arama yapmayı deneyebilirsiniz." : "Sosyal medya veya CV'nizde paylaşabileceğiniz ilk kısa yönlendirmenizi oluşturun."}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={handleOpenCreateModal}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                        >
                            <FaPlus /> İlk Linki Oluştur
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filteredLinks.map(link => {
                        const shortPath = `/go/${link.slug}`;
                        const fullShortUrl = `${originUrl || ""}${shortPath}`;
                        const isCopied = copiedSlug === link.slug;

                        return (
                            <div
                                key={link.id}
                                className={`group bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border transition-all hover:shadow-md ${link.is_active
                                    ? "border-gray-200/90 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-800/60"
                                    : "border-gray-200/50 dark:border-zinc-900 opacity-60 bg-gray-50/50 dark:bg-zinc-950/50"
                                    }`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Left: Info */}
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                                                {link.title}
                                            </h3>

                                            {/* Slug Badge */}
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-mono text-xs font-bold border border-violet-200 dark:border-violet-800/40">
                                                <span>{shortPath}</span>
                                            </div>

                                            {/* Status Badge */}
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${link.is_active
                                                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                                                    : "bg-gray-100 dark:bg-zinc-800 text-gray-500 border border-gray-200 dark:border-zinc-700"
                                                    }`}
                                            >
                                                {link.is_active ? "Aktif" : "Pasif"}
                                            </span>
                                        </div>

                                        {/* Target URL */}
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-medium text-gray-400 dark:text-gray-500">Hedef:</span>
                                            <a
                                                href={link.target_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-violet-600 dark:hover:text-violet-400 underline underline-offset-2 truncate max-w-lg flex items-center gap-1"
                                            >
                                                <span className="truncate">{link.target_url}</span>
                                                <FaExternalLinkAlt className="text-[10px] flex-shrink-0" />
                                            </a>
                                        </div>

                                        {/* Description */}
                                        {link.description && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                                {link.description}
                                            </p>
                                        )}

                                        {/* Meta: Clicks & Dates */}
                                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500 pt-1">
                                            <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-semibold">
                                                <FaMousePointer className="text-emerald-500 text-[10px]" />
                                                {link.clicks || 0} tıklanma
                                            </span>
                                            {link.last_clicked_at && (
                                                <span className="flex items-center gap-1">
                                                    Son tık: {new Date(link.last_clicked_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <FaCalendarAlt className="text-[10px]" />
                                                Oluşturuldu: {new Date(link.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-zinc-800">
                                        {/* Copy Link Button */}
                                        <button
                                            onClick={() => handleCopyShortUrl(link.slug)}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isCopied
                                                ? "bg-emerald-500 text-white shadow-sm"
                                                : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950/60 dark:hover:text-violet-300"
                                                }`}
                                            title="Kısa linki panoya kopyala"
                                        >
                                            {isCopied ? <FaCheck /> : <FaCopy />}
                                            <span>{isCopied ? "Kopyalandı!" : "Kopyala"}</span>
                                        </button>

                                        {/* Test Direct Redirect in New Tab */}
                                        <a
                                            href={shortPath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl text-xs font-semibold transition-colors"
                                            title="Yeni sekmede dene (/go/[slug])"
                                        >
                                            <FaExternalLinkAlt />
                                        </a>

                                        {/* Status Toggle Button */}
                                        <button
                                            onClick={() => handleToggleStatus(link)}
                                            className="p-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl text-base transition-colors"
                                            title={link.is_active ? "Pasife al" : "Aktifleştir"}
                                        >
                                            {link.is_active ? (
                                                <FaToggleOn className="text-emerald-500" />
                                            ) : (
                                                <FaToggleOff className="text-gray-400" />
                                            )}
                                        </button>

                                        {/* Edit Button */}
                                        <button
                                            onClick={() => handleOpenEditModal(link)}
                                            className="p-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-xs font-semibold transition-colors"
                                            title="Düzenle"
                                        >
                                            <FaEdit />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDeleteLink(link.id)}
                                            disabled={deletingId === link.id}
                                            className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                                            title="Sil"
                                        >
                                            <FaTrash className={deletingId === link.id ? "animate-spin" : ""} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal: Create / Edit Link */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                                    <FaLink />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                        {editingLink ? "Kısa Linki Düzenle" : "Yeni Kısa Link Oluştur"}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {editingLink ? "Var olan yönlendirmeyi güncelleyin." : "Hedef URL için kalıcı bir kısa bağlantı tanımlayın."}
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

                        {/* Modal Body */}
                        <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                            {modalError && (
                                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                                    {modalError}
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    Link Başlığı *
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={e => {
                                        setFormTitle(e.target.value);
                                        if (!editingLink && !formSlug) {
                                            handleAutoGenerateSlug(e.target.value);
                                        }
                                    }}
                                    placeholder="Örn: Güncel CV & Portföy, GitHub, Takvim..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Slug Input with Preview */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Kısaltma (Slug) *
                                    </label>
                                    {formTitle && !editingLink && (
                                        <button
                                            type="button"
                                            onClick={() => handleAutoGenerateSlug(formTitle)}
                                            className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-semibold"
                                        >
                                            Başlıktan Üret
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 overflow-hidden focus-within:ring-2 focus-within:ring-violet-500">
                                    <span className="px-3 text-xs font-mono text-gray-400 border-r border-gray-200 dark:border-zinc-700 select-none">
                                        /go/
                                    </span>
                                    <input
                                        type="text"
                                        value={formSlug}
                                        onChange={e => setFormSlug(e.target.value)}
                                        placeholder="cv, github, proje-x..."
                                        className="w-full px-3 py-3 bg-transparent text-sm font-mono focus:outline-none text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">
                                    Önizleme: <span className="font-mono text-violet-600 dark:text-violet-400 font-semibold">{originUrl || "https://keremkk.com.tr"}/go/{formSlug || "..."}</span>
                                </p>
                            </div>

                            {/* Target URL */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    Hedef URL (Yönlendirilecek Adres) *
                                </label>
                                <input
                                    type="text"
                                    value={formTargetUrl}
                                    onChange={e => setFormTargetUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    Açıklama / Not (Opsiyonel)
                                </label>
                                <textarea
                                    value={formDescription}
                                    onChange={e => setFormDescription(e.target.value)}
                                    rows={2}
                                    placeholder="Bu link nerede kullanılıyor veya ne amaçla oluşturuldu?"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white resize-none"
                                />
                            </div>

                            {/* Is Active Toggle */}
                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">Aktif Durumda Başlat</div>
                                    <div className="text-xs text-gray-400">Pasife alırsanız link ana sayfaya yönlendirir.</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormIsActive(!formIsActive)}
                                    className="text-2xl transition-colors"
                                >
                                    {formIsActive ? (
                                        <FaToggleOn className="text-emerald-500" />
                                    ) : (
                                        <FaToggleOff className="text-gray-400" />
                                    )}
                                </button>
                            </div>

                            {/* Modal Footer */}
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
                                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? "Kaydediliyor..." : editingLink ? "Güncelle" : "Oluştur"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
