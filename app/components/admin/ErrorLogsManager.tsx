"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FaBug,
    FaExclamationTriangle,
    FaSync,
    FaSearch,
    FaTrash,
    FaCopy,
    FaCheck,
    FaTimes,
    FaAndroid,
    FaApple,
    FaGlobe,
    FaWindows,
    FaLinux,
    FaClock,
    FaUser,
    FaFileCode,
    FaChevronLeft,
    FaChevronRight,
    FaTerminal,
    FaFire,
    FaMobileAlt,
    FaCode,
    FaDatabase
} from "react-icons/fa";

export interface AppErrorLog {
    id: string;
    uid: string;
    app_name: string;
    platform: string;
    event: string;
    message: string;
    stack_trace?: string | null;
    metadata?: any;
    ip_address?: string;
    user_agent?: string;
    timestamp: string;
    created_at?: string;
}

export interface UserProfileInfo {
    name: string;
    email?: string;
    avatar_url?: string;
}

interface ErrorLogsManagerProps {
    authToken: string;
    onNavigate?: (moduleId: string) => void;
}

export default function ErrorLogsManager({ authToken, onNavigate }: ErrorLogsManagerProps) {
    const [logs, setLogs] = useState<AppErrorLog[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, UserProfileInfo>>({});
    const [totalInDb, setTotalInDb] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [tableMissing, setTableMissing] = useState<boolean>(false);

    // Filters
    const [selectedApp, setSelectedApp] = useState<string>("all");
    const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [fetchLimit, setFetchLimit] = useState<string>("300");

    // Modal & Selection
    const [selectedLog, setSelectedLog] = useState<AppErrorLog | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 25;

    // Fetch data
    const fetchErrorLogs = useCallback(async (isSilent = false) => {
        if (!authToken) return;
        if (!isSilent) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const params = new URLSearchParams();
            if (fetchLimit) params.set("limit", fetchLimit);
            if (selectedApp && selectedApp !== "all") params.set("app", selectedApp);
            if (searchQuery.trim()) params.set("search", searchQuery.trim());

            const res = await fetch(`/api/admin/error-logs?${params.toString()}`, {
                headers: { "x-auth-token": authToken },
            });

            if (!res.ok) throw new Error("Hata logları yüklenemedi");

            const data = await res.json();
            if (data.tableMissing) {
                setTableMissing(true);
                setLogs([]);
                setTotalInDb(0);
            } else {
                setTableMissing(false);
                setLogs(data.logs || []);
                setTotalInDb(data.total_count || 0);
                if (data.users) setUsersMap(data.users);
            }
        } catch (err) {
            console.error("Fetch error logs error:", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [authToken, fetchLimit, selectedApp, searchQuery]);

    useEffect(() => {
        fetchErrorLogs();
    }, [fetchErrorLogs]);

    // Unique apps and platforms
    const uniqueApps = useMemo(() => {
        return Array.from(new Set(logs.map((l) => l.app_name).filter(Boolean)));
    }, [logs]);

    const uniquePlatforms = useMemo(() => {
        return Array.from(new Set(logs.map((l) => l.platform).filter(Boolean)));
    }, [logs]);

    // Filtered logs
    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            if (selectedPlatform !== "all" && log.platform !== selectedPlatform) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const mMatch = (log.message || "").toLowerCase().includes(q);
                const eMatch = (log.event || "").toLowerCase().includes(q);
                const uMatch = (log.uid || "").toLowerCase().includes(q);
                const ipMatch = (log.ip_address || "").toLowerCase().includes(q);
                const appMatch = (log.app_name || "").toLowerCase().includes(q);
                const userName = usersMap[log.uid]?.name?.toLowerCase() || "";
                if (!mMatch && !eMatch && !uMatch && !ipMatch && !appMatch && !userName.includes(q)) {
                    return false;
                }
            }
            return true;
        });
    }, [logs, selectedPlatform, searchQuery, usersMap]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredLogs.slice(start, start + pageSize);
    }, [filteredLogs, currentPage, pageSize]);

    // Top error clusters / patterns
    const topErrorPatterns = useMemo(() => {
        const counts: Record<string, { count: number; event: string; sampleMessage: string; app: string }> = {};
        for (const log of logs) {
            const key = `${log.app_name}:${log.event}`;
            if (!counts[key]) {
                counts[key] = {
                    count: 0,
                    event: log.event,
                    sampleMessage: log.message,
                    app: log.app_name,
                };
            }
            counts[key].count += 1;
        }
        return Object.values(counts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [logs]);

    // Stats
    const stats = useMemo(() => {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        let todayCount = 0;
        const uids = new Set<string>();

        for (const l of logs) {
            const t = new Date(l.timestamp).getTime();
            if (now - t <= oneDayMs) todayCount++;
            if (l.uid) uids.add(l.uid);
        }

        // Top failing app
        const appCounts: Record<string, number> = {};
        for (const l of logs) {
            appCounts[l.app_name] = (appCounts[l.app_name] || 0) + 1;
        }
        let topApp = "-";
        let topAppCount = 0;
        for (const [app, cnt] of Object.entries(appCounts)) {
            if (cnt > topAppCount) {
                topApp = app;
                topAppCount = cnt;
            }
        }

        return {
            total: logs.length,
            today: todayCount,
            uniqueUsers: uids.size,
            topApp: topApp !== "-" ? `${topApp} (${topAppCount})` : "-",
        };
    }, [logs]);

    // Single delete
    const handleDeleteSingle = async (id: string) => {
        if (!confirm("Bu hata kaydını silmek istediğinize emin misiniz?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch("/api/admin/error-logs", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken,
                },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                setLogs((prev) => prev.filter((l) => l.id !== id));
                if (selectedLog?.id === id) setSelectedLog(null);
            }
        } catch (e) {
            console.error("Silme hatası:", e);
        } finally {
            setIsDeleting(false);
        }
    };

    // Bulk delete
    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Seçilen ${selectedIds.size} adet hata kaydını silmek istediğinize emin misiniz?`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch("/api/admin/error-logs", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken,
                },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });
            if (res.ok) {
                setLogs((prev) => prev.filter((l) => !selectedIds.has(l.id)));
                setSelectedIds(new Set());
            }
        } catch (e) {
            console.error("Toplu silme hatası:", e);
        } finally {
            setIsDeleting(false);
        }
    };

    // Clear all
    const handleClearAll = async () => {
        const appLabel = selectedApp === "all" ? "tüm uygulamalara ait" : `'${selectedApp}' uygulamasına ait`;
        if (!confirm(`DİKKAT: ${appLabel} TÜM hata kayıtları kalıcı olarak silinecek. Emin misiniz?`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch("/api/admin/error-logs", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken,
                },
                body: JSON.stringify({ clear_all: true, app: selectedApp }),
            });
            if (res.ok) {
                if (selectedApp === "all") {
                    setLogs([]);
                } else {
                    setLogs((prev) => prev.filter((l) => l.app_name !== selectedApp));
                }
                setSelectedIds(new Set());
            }
        } catch (e) {
            console.error("Tümünü silme hatası:", e);
        } finally {
            setIsDeleting(false);
        }
    };

    // Copy to clipboard helper
    const copyToClipboard = (text: string, fieldKey: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Selection helpers
    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedLogs.length && paginatedLogs.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedLogs.map((l) => l.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    // Format relative & absolute time
    const formatTimestamp = (ts: string) => {
        const date = new Date(ts);
        if (isNaN(date.getTime())) return { formatted: ts, relative: "" };

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);

        let relative = "";
        if (diffSec < 0) {
            relative = "Gelecek tarih (Hatalı)";
        } else if (diffSec < 60) {
            relative = "Az önce";
        } else if (diffMin < 60) {
            relative = `${diffMin} dk önce`;
        } else if (diffHours < 24) {
            relative = `${diffHours} sa önce`;
        } else if (diffDays === 1) {
            relative = "Dün";
        } else if (diffDays < 7) {
            relative = `${diffDays} gün önce`;
        } else {
            relative = `${Math.floor(diffDays / 7)} hf önce`;
        }

        const formatted = date.toLocaleString("tr-TR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        return { formatted, relative };
    };

    // Platform icon
    const getPlatformIcon = (platform: string) => {
        const p = (platform || "").toLowerCase();
        if (p.includes("android")) return <FaAndroid className="text-emerald-500" />;
        if (p.includes("ios") || p.includes("apple") || p.includes("macos")) return <FaApple className="text-gray-300" />;
        if (p.includes("windows")) return <FaWindows className="text-sky-500" />;
        if (p.includes("linux")) return <FaLinux className="text-amber-500" />;
        return <FaGlobe className="text-indigo-400" />;
    };

    // App color badge
    const getAppBadge = (app: string) => {
        const a = (app || "").toLowerCase();
        if (a === "geogame") {
            return "bg-purple-500/10 text-purple-400 border-purple-500/30";
        }
        if (a === "okey-defteri") {
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
        }
        if (a === "website") {
            return "bg-blue-500/10 text-blue-400 border-blue-500/30";
        }
        return "bg-zinc-500/10 text-zinc-300 border-zinc-500/30";
    };

    const sqlCreateTableScript = `-- Supabase SQL Editor'da çalıştırınız:
create table if not exists public.app_error_logs (
    id uuid not null default gen_random_uuid(),
    uid text not null,
    app_name text not null,
    platform text not null,
    event text not null,
    message text not null,
    stack_trace text null,
    metadata jsonb null,
    ip_address text null,
    user_agent text null,
    timestamp timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now(),
    constraint app_error_logs_pkey primary key (id)
);

create index if not exists idx_app_error_logs_timestamp on public.app_error_logs (timestamp desc);
create index if not exists idx_app_error_logs_app_name on public.app_error_logs (app_name);
create index if not exists idx_app_error_logs_uid on public.app_error_logs (uid);`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                            <FaBug className="text-xl" />
                        </span>
                        Hata Analizi & Logları
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Mobil ve web uygulamalarından gelen istisna (exception) ve çökme (crash) raporları
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchErrorLogs(true)}
                        disabled={isLoading || isRefreshing}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center gap-2 text-sm font-medium transition shadow-sm"
                    >
                        <FaSync className={isRefreshing ? "animate-spin text-red-500" : ""} />
                        Yenile
                    </button>

                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            disabled={isDeleting}
                            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 text-sm font-medium transition shadow-sm shadow-red-500/20"
                        >
                            <FaTrash />
                            Seçilenleri Sil ({selectedIds.size})
                        </button>
                    )}

                    {logs.length > 0 && selectedIds.size === 0 && (
                        <button
                            onClick={handleClearAll}
                            disabled={isDeleting}
                            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-2 text-sm font-medium transition"
                        >
                            <FaTrash />
                            Tümünü Temizle
                        </button>
                    )}
                </div>
            </div>

            {/* Table Missing Alert */}
            {tableMissing && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 font-bold text-amber-400 text-base">
                            <FaDatabase />
                            <span>Supabase Tablosu Bulunamadı (`app_error_logs`)</span>
                        </div>
                        <button
                            onClick={() => copyToClipboard(sqlCreateTableScript, "sql")}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                            {copiedField === "sql" ? <FaCheck /> : <FaCopy />}
                            SQL&apos;i Kopyala
                        </button>
                    </div>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                        Hata kayıtlarını Supabase üzerinde tutabilmek için <strong>app_error_logs</strong> tablosunun oluşturulması gerekmektedir.
                        Aşağıdaki SQL betiğini Supabase SQL Editor&apos;e yapıştırıp çalıştırarak tablonuzu tek tıkla oluşturabilirsiniz:
                    </p>
                    <pre className="p-3 bg-black/40 rounded-xl font-mono text-[11px] overflow-x-auto text-amber-300/90 border border-amber-500/20">
                        {sqlCreateTableScript}
                    </pre>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Toplam Hata</span>
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                            <FaExclamationTriangle />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                            {totalInDb.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">kayıtlı rapor</span>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Son 24 Saat</span>
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <FaClock />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                            {stats.today.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">bugün gerçekleşen</span>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Etkilenen Kullanıcı</span>
                        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                            <FaUser />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                            {stats.uniqueUsers.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">farklı UID</span>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">En Çok Hata Veren</span>
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                            <FaFire />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-lg font-bold text-gray-900 dark:text-white truncate block">
                            {stats.topApp}
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">uygulama dağılımı</span>
                    </div>
                </div>
            </div>

            {/* Top Error Patterns / Sık Karşılaşılan Hatalar */}
            {topErrorPatterns.length > 0 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <FaFire className="text-red-500" />
                            En Sık Karşılaşılan Hata Tipleri
                        </h3>
                        <span className="text-xs text-gray-400">İlk 5 Hata Şablonu</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                        {topErrorPatterns.map((pat, idx) => {
                            const percent = logs.length > 0 ? Math.round((pat.count / logs.length) * 100) : 0;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSearchQuery(pat.event)}
                                    className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-white/5 hover:border-red-500/40 text-left transition space-y-2 group"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getAppBadge(pat.app)}`}>
                                            {pat.app}
                                        </span>
                                        <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                                            {pat.count} kez ({percent}%)
                                        </span>
                                    </div>
                                    <div className="font-mono text-xs font-bold text-gray-900 dark:text-white truncate">
                                        {pat.event}
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                        {pat.sampleMessage}
                                    </p>
                                    <div className="w-full bg-gray-200 dark:bg-zinc-700 h-1 rounded-full overflow-hidden">
                                        <div
                                            className="bg-red-500 h-full rounded-full transition-all"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Hata mesajı, event, UID veya IP ara..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:border-red-500 transition"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                {/* Filter dropdowns */}
                <div className="flex items-center gap-2 overflow-x-auto">
                    {/* App Filter */}
                    <select
                        value={selectedApp}
                        onChange={(e) => {
                            setSelectedApp(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-200 text-xs font-semibold focus:outline-none focus:border-red-500"
                    >
                        <option value="all">Tüm Uygulamalar</option>
                        {uniqueApps.map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </select>

                    {/* Platform Filter */}
                    <select
                        value={selectedPlatform}
                        onChange={(e) => {
                            setSelectedPlatform(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-200 text-xs font-semibold focus:outline-none focus:border-red-500"
                    >
                        <option value="all">Tüm Platformlar</option>
                        {uniquePlatforms.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>

                    {/* Limit Selector */}
                    <select
                        value={fetchLimit}
                        onChange={(e) => setFetchLimit(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-200 text-xs font-semibold focus:outline-none focus:border-red-500"
                    >
                        <option value="100">100 Kayıt</option>
                        <option value="300">300 Kayıt</option>
                        <option value="1000">1.000 Kayıt</option>
                        <option value="all">Tümü (5.000)</option>
                    </select>
                </div>
            </div>

            {/* Error Logs Table */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-zinc-800/80 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/5 font-semibold">
                            <tr>
                                <th className="p-3.5 pl-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={paginatedLogs.length > 0 && selectedIds.size === paginatedLogs.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 dark:border-zinc-700 text-red-600 focus:ring-red-500"
                                    />
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Zaman</th>
                                <th className="p-3.5 whitespace-nowrap">Uygulama</th>
                                <th className="p-3.5 whitespace-nowrap">Olay (Event)</th>
                                <th className="p-3.5">Hata Mesajı</th>
                                <th className="p-3.5 whitespace-nowrap">Kullanıcı / UID</th>
                                <th className="p-3.5 whitespace-nowrap">IP / Platform</th>
                                <th className="p-3.5 text-right pr-4 whitespace-nowrap">İşlemler</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-400">
                                        <FaSync className="animate-spin text-2xl mx-auto text-red-500 mb-2" />
                                        Hata kayıtları yükleniyor...
                                    </td>
                                </tr>
                            ) : paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-400">
                                        <FaCheck className="text-3xl text-emerald-500 mx-auto mb-2" />
                                        Kayıtlı hata bulunamadı. Tebrikler, her şey yolunda görünüyor!
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log) => {
                                    const { formatted, relative } = formatTimestamp(log.timestamp);
                                    const userInfo = usersMap[log.uid];
                                    const isSelected = selectedIds.has(log.id);

                                    return (
                                        <tr
                                            key={log.id}
                                            className={`hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition group ${
                                                isSelected ? "bg-red-500/5 dark:bg-red-500/10" : ""
                                            }`}
                                        >
                                            <td className="p-3.5 pl-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectOne(log.id)}
                                                    className="rounded border-gray-300 dark:border-zinc-700 text-red-600 focus:ring-red-500"
                                                />
                                            </td>

                                            {/* Zaman */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900 dark:text-gray-200">
                                                    {formatted}
                                                </div>
                                                <div className={`text-[10px] ${relative.includes("Gelecek") ? "text-amber-500 font-bold" : "text-gray-400"}`}>
                                                    {relative}
                                                </div>
                                            </td>

                                            {/* Uygulama */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${getAppBadge(log.app_name)}`}>
                                                    {log.app_name}
                                                </span>
                                            </td>

                                            {/* Olay */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                                    {log.event}
                                                </span>
                                            </td>

                                            {/* Mesaj */}
                                            <td className="p-3.5 max-w-xs md:max-w-md">
                                                <p
                                                    onClick={() => setSelectedLog(log)}
                                                    className="text-gray-900 dark:text-gray-100 font-mono font-medium line-clamp-2 hover:text-red-400 cursor-pointer transition"
                                                    title={log.message}
                                                >
                                                    {log.message}
                                                </p>
                                                {log.stack_trace && (
                                                    <span className="text-[10px] text-red-400/80 font-mono flex items-center gap-1 mt-0.5">
                                                        <FaCode className="text-[9px]" /> Stack trace mevcut
                                                    </span>
                                                )}
                                            </td>

                                            {/* Kullanıcı / UID */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                {userInfo ? (
                                                    <div>
                                                        <span className="font-bold text-gray-900 dark:text-white block">
                                                            {userInfo.name}
                                                        </span>
                                                        <span className="font-mono text-[10px] text-gray-400">
                                                            {log.uid.slice(0, 12)}...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="font-mono text-gray-500 dark:text-gray-400">
                                                        {log.uid.slice(0, 16)}...
                                                    </span>
                                                )}
                                            </td>

                                            {/* IP / Platform */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                                                    {getPlatformIcon(log.platform)}
                                                    <span className="capitalize">{log.platform}</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-gray-400">
                                                    {log.ip_address || "Bilinmiyor"}
                                                </span>
                                            </td>

                                            {/* İşlemler */}
                                            <td className="p-3.5 text-right pr-4 whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 font-semibold transition"
                                                    >
                                                        Detay
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSingle(log.id)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition"
                                                        title="Sil"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                <div className="p-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div>
                        Toplam <strong>{filteredLogs.length}</strong> hata listeleniyor (Sayfa {currentPage} / {totalPages})
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition"
                        >
                            <FaChevronLeft />
                        </button>

                        <span className="px-3 py-1 font-bold text-gray-900 dark:text-white">
                            {currentPage}
                        </span>

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Detail Modal */}
            {selectedLog && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedLog(null)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-red-500/10 to-rose-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-lg shadow-md shadow-red-500/30 shrink-0">
                                    <FaBug />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Hata Raporu</h3>
                                        <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                            {selectedLog.event}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                                        ID: {selectedLog.id}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 md:p-6 overflow-y-auto space-y-5 text-xs">
                            {/* Meta Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <span className="text-gray-400 font-semibold block mb-1">Uygulama</span>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                                        {selectedLog.app_name}
                                    </span>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <span className="text-gray-400 font-semibold block mb-1">Platform</span>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm capitalize flex items-center gap-1.5">
                                        {getPlatformIcon(selectedLog.platform)}
                                        {selectedLog.platform}
                                    </span>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <span className="text-gray-400 font-semibold block mb-1">IP Adresi</span>
                                    <span className="font-bold text-gray-900 dark:text-white font-mono">
                                        {selectedLog.ip_address || "Bilinmiyor"}
                                    </span>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <span className="text-gray-400 font-semibold block mb-1">Zaman</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {new Date(selectedLog.timestamp).toLocaleString("tr-TR")}
                                    </span>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div>
                                    <span className="text-gray-400 font-semibold block text-[11px]">Kullanıcı / Cihaz UID</span>
                                    <span className="font-mono text-gray-900 dark:text-white font-bold text-sm block mt-0.5">
                                        {selectedLog.uid}
                                    </span>
                                    {usersMap[selectedLog.uid] && (
                                        <span className="text-emerald-500 font-semibold text-xs block mt-0.5">
                                            ✓ Kayıtlı Hesap: {usersMap[selectedLog.uid].name} ({usersMap[selectedLog.uid].email})
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(selectedLog.uid, "uid")}
                                    className="p-2 rounded-xl bg-white dark:bg-zinc-700 text-gray-600 dark:text-gray-300 hover:text-white transition"
                                    title="UID Kopyala"
                                >
                                    {copiedField === "uid" ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                                </button>
                            </div>

                            {/* Error Message */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                        <FaExclamationTriangle className="text-red-500" />
                                        Hata Mesajı
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(selectedLog.message, "message")}
                                        className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                                    >
                                        {copiedField === "message" ? <FaCheck /> : <FaCopy />}
                                        Kopyala
                                    </button>
                                </div>
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap">
                                    {selectedLog.message}
                                </div>
                            </div>

                            {/* Stack Trace */}
                            {selectedLog.stack_trace && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <FaTerminal className="text-gray-400" />
                                            Stack Trace
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(selectedLog.stack_trace!, "stack")}
                                            className="text-gray-400 hover:text-gray-200 flex items-center gap-1 font-semibold"
                                        >
                                            {copiedField === "stack" ? <FaCheck /> : <FaCopy />}
                                            Kopyala
                                        </button>
                                    </div>
                                    <pre className="p-4 rounded-2xl bg-black/60 border border-white/5 text-gray-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-60">
                                        {selectedLog.stack_trace}
                                    </pre>
                                </div>
                            )}

                            {/* Metadata */}
                            {selectedLog.metadata && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <FaFileCode className="text-gray-400" />
                                            Metadata
                                        </span>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    JSON.stringify(selectedLog.metadata, null, 2),
                                                    "meta"
                                                )
                                            }
                                            className="text-gray-400 hover:text-gray-200 flex items-center gap-1 font-semibold"
                                        >
                                            {copiedField === "meta" ? <FaCheck /> : <FaCopy />}
                                            Kopyala
                                        </button>
                                    </div>
                                    <pre className="p-4 rounded-2xl bg-black/60 border border-white/5 text-indigo-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-48">
                                        {JSON.stringify(selectedLog.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* User Agent */}
                            {selectedLog.user_agent && (
                                <div className="space-y-1">
                                    <span className="text-gray-400 font-semibold block text-[11px]">User Agent</span>
                                    <p className="p-3 bg-gray-50 dark:bg-zinc-800/40 rounded-xl font-mono text-[11px] text-gray-400 break-all border border-gray-100 dark:border-white/5">
                                        {selectedLog.user_agent}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/40">
                            <button
                                onClick={() => handleDeleteSingle(selectedLog.id)}
                                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold flex items-center gap-2 transition"
                            >
                                <FaTrash />
                                Bu Kaydı Sil
                            </button>

                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600 font-bold transition"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
