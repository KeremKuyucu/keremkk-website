"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FaChartBar,
    FaUser,
    FaMobileAlt,
    FaClock,
    FaSync,
    FaSearch,
    FaFilter,
    FaTrash,
    FaCopy,
    FaCheck,
    FaTimes,
    FaApple,
    FaAndroid,
    FaWindows,
    FaLinux,
    FaGlobe,
    FaFire,
    FaBolt,
    FaHistory,
    FaChevronLeft,
    FaChevronRight,
    FaFileCsv,
    FaFileCode,
    FaLayerGroup,
    FaLaptop
} from "react-icons/fa";

export interface AppLog {
    id: string;
    uid: string;
    timestamp: string;
    event: string;
    platform: string;
    app_name?: string;
    ip_address?: string;
    user_agent?: string;
    created_at?: string;
}

interface AnalyticsManagerProps {
    authToken: string;
}

export default function AnalyticsManager({ authToken }: AnalyticsManagerProps) {
    // Data states
    const [logs, setLogs] = useState<AppLog[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [logLimit, setLogLimit] = useState<number>(300);
    const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedApp, setSelectedApp] = useState<string>("all");
    const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
    const [selectedEvent, setSelectedEvent] = useState<string>("all");
    const [selectedDateRange, setSelectedDateRange] = useState<"all" | "today" | "yesterday" | "7d" | "30d">("all");
    const [activeChartTab, setActiveChartTab] = useState<"trend" | "hourly" | "platforms" | "events">("trend");
    const [trendDaysRange, setTrendDaysRange] = useState<7 | 14 | 30 | "all">(14);

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

    // Modal & Interactions
    const [selectedLog, setSelectedLog] = useState<AppLog | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Fetch Logs
    const fetchLogs = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        setIsRefreshing(true);
        try {
            const res = await fetch(`/api/admin/analytics?limit=${logLimit}`, {
                headers: { "x-auth-token": authToken }
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error("Error fetching logs:", e);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [authToken, logLimit]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Auto-refresh interval
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            fetchLogs(true);
        }, 30000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchLogs]);

    // Copy to clipboard helper
    const handleCopy = (text: string, fieldKey: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Delete single log
    const handleDeleteLog = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Bu log kaydını kalıcı olarak silmek istediğinizden emin misiniz?")) return;

        setDeletingId(id);
        try {
            const res = await fetch("/api/admin/analytics", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken
                },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setLogs(prev => prev.filter(item => item.id !== id));
                if (selectedLog?.id === id) {
                    setSelectedLog(null);
                }
            } else {
                alert("Log silinemedi.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Bağlantı hatası.");
        } finally {
            setDeletingId(null);
        }
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
        if (diffSec < 60) relative = "Az önce";
        else if (diffMin < 60) relative = `${diffMin} dk önce`;
        else if (diffHours < 24) relative = `${diffHours} sa önce`;
        else if (diffDays === 1) relative = "Dün";
        else if (diffDays < 7) relative = `${diffDays} gün önce`;
        else relative = `${Math.floor(diffDays / 7)} hf önce`;

        const formatted = date.toLocaleString("tr-TR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        return { formatted, relative };
    };

    // Platform helper
    const getPlatformInfo = (platform: string, userAgent?: string) => {
        const p = (platform || "").toLowerCase();
        const ua = (userAgent || "").toLowerCase();

        if (p.includes("android") || ua.includes("android")) {
            return { name: "Android", icon: FaAndroid, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
        }
        if (p.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) {
            return { name: "iOS", icon: FaApple, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
        }
        if (p.includes("web") || ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari")) {
            return { name: "Web", icon: FaGlobe, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" };
        }
        if (p.includes("windows") || ua.includes("windows")) {
            return { name: "Windows", icon: FaWindows, color: "text-sky-500 bg-sky-500/10 border-sky-500/20" };
        }
        if (p.includes("mac") || ua.includes("macintosh")) {
            return { name: "macOS", icon: FaApple, color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20" };
        }
        if (p.includes("linux") || ua.includes("linux")) {
            return { name: "Linux", icon: FaLinux, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
        }
        return { name: platform || "Bilinmiyor", icon: FaLaptop, color: "text-gray-500 bg-gray-500/10 border-gray-500/20" };
    };

    // Event style helper
    const getEventBadgeStyle = (event: string) => {
        const ev = (event || "").toLowerCase();
        if (ev.includes("open") || ev.includes("launch")) {
            return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
        }
        if (ev.includes("login") || ev.includes("auth") || ev.includes("success") || ev.includes("complete")) {
            return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
        }
        if (ev.includes("game") || ev.includes("score") || ev.includes("level") || ev.includes("play")) {
            return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
        }
        if (ev.includes("error") || ev.includes("fail") || ev.includes("crash")) {
            return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
        }
        if (ev.includes("update") || ev.includes("setting") || ev.includes("click")) {
            return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
        }
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    };

    // Unique options for filters
    const uniqueApps = useMemo(() => {
        return Array.from(new Set(logs.map(log => log.app_name).filter(Boolean))) as string[];
    }, [logs]);

    const uniquePlatforms = useMemo(() => {
        return Array.from(new Set(logs.map(log => log.platform).filter(Boolean))) as string[];
    }, [logs]);

    const uniqueEvents = useMemo(() => {
        return Array.from(new Set(logs.map(log => log.event).filter(Boolean))) as string[];
    }, [logs]);

    // Filter logs based on all filters
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // App filter
            if (selectedApp !== "all" && log.app_name !== selectedApp) return false;

            // Platform filter
            if (selectedPlatform !== "all" && log.platform?.toLowerCase() !== selectedPlatform.toLowerCase()) return false;

            // Event filter
            if (selectedEvent !== "all" && log.event !== selectedEvent) return false;

            // Date Range filter
            if (selectedDateRange !== "all") {
                const logDate = new Date(log.timestamp);
                const now = new Date();
                const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                const yesterdayMidnight = todayMidnight - 86400000;
                const logTime = logDate.getTime();

                if (selectedDateRange === "today" && logTime < todayMidnight) return false;
                if (selectedDateRange === "yesterday" && (logTime < yesterdayMidnight || logTime >= todayMidnight)) return false;
                if (selectedDateRange === "7d" && logTime < todayMidnight - 7 * 86400000) return false;
                if (selectedDateRange === "30d" && logTime < todayMidnight - 30 * 86400000) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchUid = log.uid?.toLowerCase().includes(query);
                const matchEvent = log.event?.toLowerCase().includes(query);
                const matchApp = log.app_name?.toLowerCase().includes(query);
                const matchPlatform = log.platform?.toLowerCase().includes(query);
                const matchIp = log.ip_address?.toLowerCase().includes(query);
                const matchUa = log.user_agent?.toLowerCase().includes(query);
                if (!matchUid && !matchEvent && !matchApp && !matchPlatform && !matchIp && !matchUa) {
                    return false;
                }
            }

            return true;
        });
    }, [logs, selectedApp, selectedPlatform, selectedEvent, selectedDateRange, searchQuery]);

    // Reset pagination on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedApp, selectedPlatform, selectedEvent, selectedDateRange]);

    // Aggregations and Metrics
    const metrics = useMemo(() => {
        const todayStr = new Date().toISOString().split("T")[0];
        const todayLogs = filteredLogs.filter(l => l.timestamp.startsWith(todayStr));
        
        const uniqueUsersAll = new Set(filteredLogs.map(l => l.uid)).size;
        const uniqueUsersToday = new Set(todayLogs.map(l => l.uid)).size;
        const totalAppOpensToday = todayLogs.filter(l => l.event === "app_opened_daily" || l.event.toLowerCase().includes("open")).length;
        const totalAppOpensAll = filteredLogs.filter(l => l.event === "app_opened_daily" || l.event.toLowerCase().includes("open")).length;
        
        const uniqueIPs = new Set(filteredLogs.map(l => l.ip_address).filter(Boolean)).size;

        // Platform breakdown
        const platformCounts: Record<string, number> = {};
        filteredLogs.forEach(l => {
            const p = l.platform || "Bilinmiyor";
            platformCounts[p] = (platformCounts[p] || 0) + 1;
        });
        const topPlatformEntry = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0];
        const topPlatform = topPlatformEntry ? {
            name: topPlatformEntry[0],
            count: topPlatformEntry[1],
            percent: filteredLogs.length > 0 ? Math.round((topPlatformEntry[1] / filteredLogs.length) * 100) : 0
        } : null;

        // App breakdown
        const appCounts: Record<string, number> = {};
        filteredLogs.forEach(l => {
            const a = l.app_name || "Bilinmiyor";
            appCounts[a] = (appCounts[a] || 0) + 1;
        });
        const topAppEntry = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0];
        const topApp = topAppEntry ? topAppEntry[0] : "-";

        return {
            uniqueUsersAll,
            uniqueUsersToday,
            totalLogs: filteredLogs.length,
            totalAppOpensToday,
            totalAppOpensAll,
            uniqueIPs,
            topPlatform,
            topApp
        };
    }, [filteredLogs]);

    // Chart: Daily Activity Trend (Controlled by trendDaysRange)
    const dailyTrendData = useMemo(() => {
        const daysMap: Record<string, { count: number; uids: Set<string>; date: string; label: string }> = {};

        if (trendDaysRange === "all") {
            filteredLogs.forEach(log => {
                const dateStr = log.timestamp.split("T")[0];
                const d = new Date(log.timestamp);
                const label = isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
                if (!daysMap[dateStr]) {
                    daysMap[dateStr] = { count: 0, uids: new Set<string>(), date: dateStr, label };
                }
                daysMap[dateStr].count += 1;
                daysMap[dateStr].uids.add(log.uid);
            });
        } else {
            const count = typeof trendDaysRange === "number" ? trendDaysRange : 14;
            for (let i = count - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split("T")[0];
                const label = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
                daysMap[dateStr] = { count: 0, uids: new Set<string>(), date: dateStr, label };
            }

            filteredLogs.forEach(log => {
                const dateStr = log.timestamp.split("T")[0];
                if (daysMap[dateStr]) {
                    daysMap[dateStr].count += 1;
                    daysMap[dateStr].uids.add(log.uid);
                }
            });
        }

        const list = Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date));
        const maxCount = Math.max(...list.map(d => d.count), 1);

        return {
            items: list.map(d => ({
                ...d,
                uniqueUsers: d.uids.size,
                percentage: Math.round((d.count / maxCount) * 100)
            })),
            maxCount
        };
    }, [filteredLogs, trendDaysRange]);

    // Chart: 24-Hour Peak Usage
    const hourlyData = useMemo(() => {
        const hours = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            label: `${i.toString().padStart(2, "0")}:00`,
            count: 0
        }));

        filteredLogs.forEach(log => {
            const d = new Date(log.timestamp);
            if (!isNaN(d.getTime())) {
                const h = d.getHours();
                if (hours[h]) hours[h].count += 1;
            }
        });

        const maxCount = Math.max(...hours.map(h => h.count), 1);
        const peakHour = [...hours].sort((a, b) => b.count - a.count)[0];

        return {
            items: hours.map(h => ({
                ...h,
                percentage: Math.round((h.count / maxCount) * 100)
            })),
            peakHour: peakHour.count > 0 ? peakHour : null
        };
    }, [filteredLogs]);

    // Chart: Platform Distribution
    const platformDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredLogs.forEach(l => {
            const p = l.platform || "Diğer";
            counts[p] = (counts[p] || 0) + 1;
        });

        const total = filteredLogs.length || 1;
        return Object.entries(counts)
            .map(([platform, count]) => {
                const info = getPlatformInfo(platform);
                return {
                    platform,
                    count,
                    percentage: Math.round((count / total) * 100),
                    ...info
                };
            })
            .sort((a, b) => b.count - a.count);
    }, [filteredLogs]);

    // Chart: Events Breakdown
    const eventsBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredLogs.forEach(l => {
            const ev = l.event || "unknown";
            counts[ev] = (counts[ev] || 0) + 1;
        });

        const total = filteredLogs.length || 1;
        return Object.entries(counts)
            .map(([event, count]) => ({
                event,
                count,
                percentage: Math.round((count / total) * 100),
                style: getEventBadgeStyle(event)
            }))
            .sort((a, b) => b.count - a.count);
    }, [filteredLogs]);

    // Paginated logs
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredLogs.slice(startIndex, startIndex + pageSize);
    }, [filteredLogs, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;

    // Export helpers
    const exportCSV = () => {
        if (filteredLogs.length === 0) return;
        const headers = ["ID", "Tarih", "Olay (Event)", "Uygulama", "Platform", "Kullanici (UID)", "IP Adresi", "User Agent"];
        const rows = filteredLogs.map(log => [
            `"${log.id || ""}"`,
            `"${log.timestamp || ""}"`,
            `"${log.event || ""}"`,
            `"${log.app_name || ""}"`,
            `"${log.platform || ""}"`,
            `"${log.uid || ""}"`,
            `"${log.ip_address || ""}"`,
            `"${(log.user_agent || "").replace(/"/g, '""')}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `analytics_logs_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportJSON = () => {
        if (filteredLogs.length === 0) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `analytics_logs_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasActiveFilters = searchQuery !== "" || selectedApp !== "all" || selectedPlatform !== "all" || selectedEvent !== "all" || selectedDateRange !== "all";

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedApp("all");
        setSelectedPlatform("all");
        setSelectedEvent("all");
        setSelectedDateRange("all");
    };

    return (
        <div className="flex flex-col gap-6 animate-fadeIn pb-12 w-full max-w-full min-w-0 overflow-hidden">
            {/* Header Control Bar */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-5 md:p-6 rounded-3xl border border-white/20 dark:border-white/10 shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full max-w-full min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-violet-500/25 shrink-0">
                        <FaChartBar />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">Uygulama Analitiği & Telemetri</h2>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${autoRefresh ? "animate-ping" : ""}`} />
                                {autoRefresh ? "Canlı (30s)" : "Aktif"}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {lastUpdated ? `Son güncelleme: ${lastUpdated.toLocaleTimeString("tr-TR")}` : "Veriler alınıyor..."} • Toplam {logs.length} kayıt hafızada
                        </p>
                    </div>
                </div>

                {/* Actions & Tools */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    {/* Auto-Refresh Toggle */}
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                            autoRefresh
                                ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                                : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700"
                        }`}
                        title="30 saniyede bir otomatik yenile"
                    >
                        <FaSync className={`text-xs ${autoRefresh ? "animate-spin" : ""}`} />
                        <span>Oto-Yenile</span>
                    </button>

                    {/* Limit Selector */}
                    <select
                        value={logLimit}
                        onChange={(e) => setLogLimit(Number(e.target.value))}
                        className="px-3 py-2 text-xs font-semibold bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-700 dark:text-gray-300 outline-none hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                        title="Alınacak maksimum log sayısı"
                    >
                        <option value={100}>100 Log</option>
                        <option value={300}>300 Log</option>
                        <option value={500}>500 Log</option>
                        <option value={1000}>1000 Log</option>
                    </select>

                    {/* Manual Refresh */}
                    <button
                        onClick={() => fetchLogs()}
                        disabled={isLoading || isRefreshing}
                        className="px-4 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FaSync className={isRefreshing ? "animate-spin" : ""} />
                        <span>{isRefreshing ? "Yenileniyor..." : "Yenile"}</span>
                    </button>

                    {/* Export Dropdown / Buttons */}
                    <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
                        <button
                            onClick={exportCSV}
                            disabled={filteredLogs.length === 0}
                            className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
                            title="Filtrelenen verileri CSV formatında indir"
                        >
                            <FaFileCsv className="text-sm" />
                            <span className="hidden sm:inline">CSV</span>
                        </button>
                        <button
                            onClick={exportJSON}
                            disabled={filteredLogs.length === 0}
                            className="px-3 py-2 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
                            title="Filtrelenen verileri JSON formatında indir"
                        >
                            <FaFileCode className="text-sm" />
                            <span className="hidden sm:inline">JSON</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-4 w-full max-w-full min-w-0">
                {/* Unique Users */}
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all min-w-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tekil Kullanıcı</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm shadow-inner shrink-0">
                            <FaUser />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {metrics.uniqueUsersAll}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate">
                        <FaBolt className="text-[10px] shrink-0" />
                        <span className="truncate">Bugün: {metrics.uniqueUsersToday} tekil</span>
                    </div>
                </div>

                {/* Total Filtered Logs */}
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all min-w-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:bg-purple-500/20 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Toplam Olay</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-sm shadow-inner shrink-0">
                            <FaChartBar />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {metrics.totalLogs}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-purple-600 dark:text-purple-400 truncate">
                        <FaHistory className="text-[10px] shrink-0" />
                        <span className="truncate">Tüm logların %{logs.length > 0 ? Math.round((metrics.totalLogs / logs.length) * 100) : 100}</span>
                    </div>
                </div>

                {/* App Opens */}
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all min-w-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Uygulama Açılışı</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm shadow-inner shrink-0">
                            <FaMobileAlt />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {metrics.totalAppOpensAll}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate">
                        <FaFire className="text-[10px] shrink-0" />
                        <span className="truncate">Bugün: {metrics.totalAppOpensToday} açılış</span>
                    </div>
                </div>

                {/* Top Platform */}
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all min-w-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Lider Platform</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm shadow-inner shrink-0">
                            {metrics.topPlatform?.name.toLowerCase().includes("android") ? <FaAndroid /> :
                             metrics.topPlatform?.name.toLowerCase().includes("ios") ? <FaApple /> :
                             <FaGlobe />}
                        </div>
                    </div>
                    <div className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight truncate capitalize">
                        {metrics.topPlatform ? metrics.topPlatform.name : "-"}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 truncate">
                        <span className="truncate">Dağılım: %{metrics.topPlatform ? metrics.topPlatform.percent : 0}</span>
                    </div>
                </div>

                {/* Unique IPs & Peak Info */}
                <div className="col-span-2 md:col-span-1 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all min-w-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:bg-rose-500/20 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tekil IP & Uygulama</span>
                        <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-sm shadow-inner shrink-0">
                            <FaGlobe />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {metrics.uniqueIPs} <span className="text-xs font-semibold text-gray-400 font-normal">IP</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 truncate">
                        <FaLayerGroup className="text-[10px] shrink-0" />
                        <span className="truncate">En aktif: {metrics.topApp}</span>
                    </div>
                </div>
            </div>

            {/* Visual Analytics & Charts Section */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-lg p-5 md:p-6 flex flex-col gap-5 w-full max-w-full min-w-0 overflow-hidden">
                {/* Chart Tabs */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4 w-full">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Görsel İstatistikler</span>
                        <span className="text-xs text-gray-400 font-medium">({filteredLogs.length} veri noktası)</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-zinc-800/80 p-1 rounded-2xl overflow-x-auto max-w-full">
                        <button
                            onClick={() => setActiveChartTab("trend")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                activeChartTab === "trend"
                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            📊 Günlük Aktivite
                        </button>
                        <button
                            onClick={() => setActiveChartTab("hourly")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                activeChartTab === "hourly"
                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            ⏰ 24 Saatlik Yoğunluk
                        </button>
                        <button
                            onClick={() => setActiveChartTab("platforms")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                activeChartTab === "platforms"
                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            📱 Platformlar
                        </button>
                        <button
                            onClick={() => setActiveChartTab("events")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                activeChartTab === "events"
                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            ⚡ Olay Dağılımı
                        </button>
                    </div>
                </div>

                {/* Tab 1: Daily Activity Trend */}
                {activeChartTab === "trend" && (
                    <div className="space-y-4 w-full max-w-full overflow-hidden">
                        {/* Subheader & Range Selectors */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 px-1">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-700 dark:text-gray-300 mr-1">Grafik Aralığı:</span>
                                {([7, 14, 30, "all"] as const).map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setTrendDaysRange(r)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                            trendDaysRange === r
                                                ? "bg-violet-600 text-white shadow-sm"
                                                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                                        }`}
                                    >
                                        {r === "all" ? "Tüm Tarihler" : `Son ${r} Gün`}
                                    </button>
                                ))}
                            </div>
                            <span>En yüksek günlük log: <strong className="text-gray-900 dark:text-white">{dailyTrendData.maxCount}</strong></span>
                        </div>

                        {dailyTrendData.items.length === 0 || dailyTrendData.maxCount === 0 ? (
                            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
                                Seçilen filtrede yeterli trend verisi yok.
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                                <div className={`h-52 pt-8 pb-2 flex items-end justify-between gap-1.5 sm:gap-2 px-2 border-b border-gray-100 dark:border-white/5 ${
                                    dailyTrendData.items.length > 18 ? "min-w-[720px]" : "w-full"
                                }`}>
                                    {dailyTrendData.items.map((day, idx) => {
                                        const isToday = day.date === new Date().toISOString().split("T")[0];
                                        const heightPct = Math.max(day.percentage, 6);
                                        const showLabel = dailyTrendData.items.length <= 16 || idx % Math.ceil(dailyTrendData.items.length / 14) === 0 || isToday;

                                        return (
                                            <div
                                                key={day.date}
                                                className="flex-1 min-w-0 max-w-[48px] flex flex-col items-center gap-2 group relative h-full justify-end"
                                            >
                                                {/* Hover Floating Tooltip */}
                                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gray-900 dark:bg-white text-white dark:text-black text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap z-20">
                                                    {day.label}: {day.count} log ({day.uniqueUsers} tekil)
                                                </div>

                                                {/* Bar count badge */}
                                                {day.count > 0 && (
                                                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-violet-500 transition-colors">
                                                        {day.count}
                                                    </span>
                                                )}

                                                {/* Bar */}
                                                <div
                                                    style={{ height: `${heightPct}%` }}
                                                    className={`w-full rounded-t-xl transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 shadow-sm ${
                                                        isToday
                                                            ? "bg-gradient-to-t from-violet-600 to-fuchsia-500 shadow-violet-500/20"
                                                            : "bg-gradient-to-t from-blue-600/70 to-indigo-500/70 hover:from-blue-600 hover:to-indigo-500"
                                                    }`}
                                                />

                                                {/* Date Label */}
                                                <span className={`text-[10px] font-semibold truncate max-w-full text-center ${
                                                    isToday ? "text-violet-600 dark:text-violet-400 font-bold" : "text-gray-400"
                                                }`}>
                                                    {showLabel ? day.label : "·"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: 24-Hour Peak Heatmap */}
                {activeChartTab === "hourly" && (
                    <div className="space-y-4 w-full max-w-full overflow-hidden">
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 px-1">
                            <span>24 Saatlik Zaman Dilimi Dağılımı</span>
                            {hourlyData.peakHour && (
                                <span className="font-semibold text-violet-600 dark:text-violet-400">
                                    En Yoğun Saat: {hourlyData.peakHour.label} ({hourlyData.peakHour.count} işlem)
                                </span>
                            )}
                        </div>

                        <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                            <div className="h-52 pt-8 pb-2 flex items-end justify-between gap-1 sm:gap-1.5 px-1 border-b border-gray-100 dark:border-white/5 min-w-[500px] sm:min-w-full">
                                {hourlyData.items.map((hourItem) => {
                                    const heightPct = Math.max(hourItem.percentage, 4);
                                    const isPeak = hourlyData.peakHour?.hour === hourItem.hour && hourItem.count > 0;

                                    return (
                                        <div
                                            key={hourItem.hour}
                                            className="flex-1 min-w-[10px] max-w-[36px] flex flex-col items-center gap-1.5 group relative h-full justify-end"
                                        >
                                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gray-900 dark:bg-white text-white dark:text-black text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap z-20">
                                                Saat {hourItem.label}: {hourItem.count} log
                                            </div>

                                            <div
                                                style={{ height: `${heightPct}%` }}
                                                className={`w-full rounded-t-md transition-all duration-300 group-hover:scale-110 ${
                                                    isPeak
                                                        ? "bg-gradient-to-t from-rose-600 to-amber-500"
                                                        : hourItem.count > 0
                                                        ? "bg-gradient-to-t from-cyan-600/70 to-blue-500/70 group-hover:from-cyan-600 group-hover:to-blue-500"
                                                        : "bg-gray-200 dark:bg-zinc-800"
                                                }`}
                                            />

                                            <span className="text-[9px] text-gray-400 font-mono scale-90 sm:scale-100">
                                                {hourItem.hour % 3 === 0 ? hourItem.hour : ""}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 3: Platforms Breakdown */}
                {activeChartTab === "platforms" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
                        {platformDistribution.length === 0 ? (
                            <div className="col-span-full py-8 text-center text-gray-400 text-sm">Platform verisi yok.</div>
                        ) : (
                            platformDistribution.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.platform}
                                        onClick={() => setSelectedPlatform(selectedPlatform === item.platform ? "all" : item.platform)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 min-w-0 ${
                                            selectedPlatform.toLowerCase() === item.platform.toLowerCase()
                                                ? "bg-violet-500/10 border-violet-500/50 shadow-md ring-1 ring-violet-500/30"
                                                : "bg-white/40 dark:bg-zinc-800/40 border-gray-100 dark:border-white/5 hover:bg-white/80 dark:hover:bg-zinc-800/80"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between min-w-0">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border shrink-0 ${item.color}`}>
                                                    <Icon />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-sm text-gray-900 dark:text-white capitalize truncate">{item.name}</div>
                                                    <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.count} log</div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-gray-700 dark:text-gray-300 ml-2">%{item.percentage}</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${item.percentage}%` }}
                                                className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Tab 4: Events Breakdown */}
                {activeChartTab === "events" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
                        {eventsBreakdown.length === 0 ? (
                            <div className="col-span-full py-8 text-center text-gray-400 text-sm">Olay verisi yok.</div>
                        ) : (
                            eventsBreakdown.map((item) => (
                                <div
                                    key={item.event}
                                    onClick={() => setSelectedEvent(selectedEvent === item.event ? "all" : item.event)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 min-w-0 ${
                                        selectedEvent === item.event
                                            ? "bg-violet-500/10 border-violet-500/50 shadow-md ring-1 ring-violet-500/30"
                                            : "bg-white/40 dark:bg-zinc-800/40 border-gray-100 dark:border-white/5 hover:bg-white/80 dark:hover:bg-zinc-800/80"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2 min-w-0">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border truncate ${item.style}`}>
                                            {item.event}
                                        </span>
                                        <span className="text-xs font-black text-gray-700 dark:text-gray-300 whitespace-nowrap ml-2">
                                            {item.count} <span className="text-[10px] text-gray-400 font-normal">(%{item.percentage})</span>
                                        </span>
                                    </div>

                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${item.percentage}%` }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Smart Filters & Search Bar */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-4 md:p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-lg flex flex-col gap-4 w-full max-w-full min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
                    {/* Search Input */}
                    <div className="lg:col-span-2 relative min-w-0">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="UID, IP, Olay, Uygulama veya Cihaz ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-black/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    {/* App Filter */}
                    <select
                        value={selectedApp}
                        onChange={(e) => setSelectedApp(e.target.value)}
                        className="px-3.5 py-2.5 bg-white dark:bg-black/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <option value="all">Tüm Uygulamalar ({uniqueApps.length})</option>
                        {uniqueApps.map(app => (
                            <option key={app} value={app}>{app}</option>
                        ))}
                    </select>

                    {/* Platform Filter */}
                    <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="px-3.5 py-2.5 bg-white dark:bg-black/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <option value="all">Tüm Platformlar ({uniquePlatforms.length})</option>
                        {uniquePlatforms.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>

                    {/* Event Filter */}
                    <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="px-3.5 py-2.5 bg-white dark:bg-black/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <option value="all">Tüm Olaylar ({uniqueEvents.length})</option>
                        {uniqueEvents.map(ev => (
                            <option key={ev} value={ev}>{ev}</option>
                        ))}
                    </select>
                </div>

                {/* Date Pills & Filter Reset */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-white/5 w-full">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1">
                            <FaFilter className="text-[10px]" /> Süre:
                        </span>
                        {(["all", "today", "yesterday", "7d", "30d"] as const).map((range) => {
                            const labels: Record<string, string> = {
                                all: "Tümü",
                                today: "Bugün",
                                yesterday: "Dün",
                                "7d": "Son 7 Gün",
                                "30d": "Son 30 Gün"
                            };
                            return (
                                <button
                                    key={range}
                                    onClick={() => setSelectedDateRange(range)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        selectedDateRange === range
                                            ? "bg-violet-600 text-white shadow-sm"
                                            : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                                    }`}
                                >
                                    {labels[range]}
                                </button>
                            );
                        })}
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1.5 transition-colors"
                        >
                            <FaTimes className="text-[10px]" /> Filtreleri Temizle ({filteredLogs.length} sonuç)
                        </button>
                    )}
                </div>
            </div>

            {/* Logs Table Card */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden flex flex-col w-full max-w-full min-w-0">
                <div className="p-4 md:p-5 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/40 dark:bg-zinc-800/40">
                    <div className="flex items-center gap-2">
                        <FaClock className="text-violet-500 text-sm" />
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">Gerçek Zamanlı Log Kayıtları</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500">
                            {filteredLogs.length} Kayıt
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>Sayfa Başına:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="px-2 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium outline-none cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto custom-scrollbar min-h-[350px] w-full max-w-full">
                    {isLoading && logs.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                            <FaSync className="animate-spin text-2xl text-violet-500" />
                            <p className="text-sm">Analitik verileri yükleniyor...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                            <FaFilter className="text-3xl text-gray-300 dark:text-zinc-700" />
                            <p className="text-sm font-medium">Bu filtre kriterlerine uyan log kaydı bulunamadı.</p>
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition"
                                >
                                    Filtreleri Sıfırla
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-gray-50/60 dark:bg-zinc-800/60 sticky top-0 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
                                <tr>
                                    <th className="px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400">Zaman</th>
                                    <th className="px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400">Uygulama</th>
                                    <th className="px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400">Olay (Event)</th>
                                    <th className="px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400">Platform</th>
                                    <th className="px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400">Kullanıcı (UID)</th>
                                    <th className="px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400">IP / Ağ</th>
                                    <th className="px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
                                {paginatedLogs.map((log) => {
                                    const timeInfo = formatTimestamp(log.timestamp);
                                    const platformInfo = getPlatformInfo(log.platform, log.user_agent);
                                    const PlatformIcon = platformInfo.icon;
                                    const eventBadgeStyle = getEventBadgeStyle(log.event);

                                    return (
                                        <tr
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className="hover:bg-violet-50/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                                        >
                                            {/* Timestamp */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                                                        {timeInfo.formatted}
                                                    </span>
                                                    {timeInfo.relative && (
                                                        <span className="text-[10px] text-gray-400">
                                                            {timeInfo.relative}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* App */}
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700">
                                                    <FaLayerGroup className="text-[10px] text-violet-500" />
                                                    {log.app_name || "Bilinmiyor"}
                                                </span>
                                            </td>

                                            {/* Event */}
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${eventBadgeStyle}`}>
                                                    {log.event}
                                                </span>
                                            </td>

                                            {/* Platform */}
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-semibold">
                                                    <PlatformIcon className="text-sm" />
                                                    <span className="capitalize">{platformInfo.name}</span>
                                                </span>
                                            </td>

                                            {/* UID */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[11px] text-gray-600 dark:text-gray-400 truncate max-w-[130px] sm:max-w-[180px]" title={log.uid}>
                                                        {log.uid}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopy(log.uid, `uid-${log.id}`);
                                                        }}
                                                        className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                                                        title="UID Kopyala"
                                                    >
                                                        {copiedField === `uid-${log.id}` ? (
                                                            <FaCheck className="text-emerald-500 text-[10px]" />
                                                        ) : (
                                                            <FaCopy className="text-[10px]" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* IP Address */}
                                            <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                                                <span className="font-mono text-[11px]">
                                                    {log.ip_address || "-"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 rounded-lg text-xs font-bold transition-all text-gray-700 dark:text-gray-300"
                                                    >
                                                        Detay
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteLog(log.id, e)}
                                                        disabled={deletingId === log.id}
                                                        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                                                        title="Bu logu sil"
                                                    >
                                                        {deletingId === log.id ? (
                                                            <FaSync className="animate-spin text-xs text-rose-500" />
                                                        ) : (
                                                            <FaTrash className="text-xs" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredLogs.length > 0 && (
                    <div className="p-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white/40 dark:bg-zinc-800/40 text-xs w-full">
                        <div className="text-gray-500 dark:text-gray-400 font-medium">
                            <strong className="text-gray-900 dark:text-white">
                                {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)}
                            </strong>{" "}
                            -{" "}
                            <strong className="text-gray-900 dark:text-white">
                                {Math.min(currentPage * pageSize, filteredLogs.length)}
                            </strong>{" "}
                            arası gösteriliyor (Toplam {filteredLogs.length} log)
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>

                            <span className="px-3 py-1.5 font-bold text-gray-700 dark:text-gray-300">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Log Detail Modal (Inspector Drawer) */}
            {selectedLog && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
                    onClick={() => setSelectedLog(null)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-indigo-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center text-lg shadow-md shadow-violet-500/30 shrink-0">
                                    <FaChartBar />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Log Detayları</h3>
                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border ${getEventBadgeStyle(selectedLog.event)}`}>
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
                            {/* General Meta Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <span className="text-gray-400 font-semibold block mb-1">Uygulama</span>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                                        {selectedLog.app_name || "-"}
                                    </span>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <span className="text-gray-400 font-semibold block mb-1">Platform</span>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm capitalize">
                                        {selectedLog.platform}
                                    </span>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5 col-span-2 sm:col-span-1">
                                    <span className="text-gray-400 font-semibold block mb-1">Zaman</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {new Date(selectedLog.timestamp).toLocaleString("tr-TR")}
                                    </span>
                                </div>
                            </div>

                            {/* User & Network Information */}
                            <div className="space-y-3">
                                {/* UID Section */}
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="space-y-1">
                                        <span className="text-gray-400 font-semibold block">Kullanıcı (UID)</span>
                                        <span className="font-mono text-gray-800 dark:text-gray-200 select-all break-all">
                                            {selectedLog.uid}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-0">
                                        <button
                                            onClick={() => handleCopy(selectedLog.uid, "modal-uid")}
                                            className="px-3 py-1.5 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-xl font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-600 flex items-center gap-1.5 transition"
                                        >
                                            {copiedField === "modal-uid" ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                                            <span>{copiedField === "modal-uid" ? "Kopyalandı" : "Kopyala"}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSearchQuery(selectedLog.uid);
                                                setSelectedLog(null);
                                            }}
                                            className="px-3 py-1.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition"
                                            title="Bu kullanıcının diğer loglarını göster"
                                        >
                                            Filtrele
                                        </button>
                                    </div>
                                </div>

                                {/* IP Address */}
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between">
                                    <div>
                                        <span className="text-gray-400 font-semibold block mb-1">IP Adresi</span>
                                        <span className="font-mono text-gray-800 dark:text-gray-200 font-bold text-sm">
                                            {selectedLog.ip_address || "Bilinmiyor"}
                                        </span>
                                    </div>
                                    {selectedLog.ip_address && (
                                        <button
                                            onClick={() => handleCopy(selectedLog.ip_address!, "modal-ip")}
                                            className="px-3 py-1.5 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-xl font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-600 flex items-center gap-1.5 transition"
                                        >
                                            {copiedField === "modal-ip" ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                                            <span>{copiedField === "modal-ip" ? "Kopyalandı" : "Kopyala"}</span>
                                        </button>
                                    )}
                                </div>

                                {/* User Agent */}
                                {selectedLog.user_agent && (
                                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <span className="text-gray-400 font-semibold block mb-1">User Agent</span>
                                        <p className="font-mono text-[11px] text-gray-600 dark:text-gray-400 break-words leading-relaxed">
                                            {selectedLog.user_agent}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Raw JSON Block */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 font-semibold">Ham JSON Verisi</span>
                                    <button
                                        onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2), "modal-json")}
                                        className="text-violet-600 dark:text-violet-400 font-bold hover:underline flex items-center gap-1"
                                    >
                                        {copiedField === "modal-json" ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                                        <span>{copiedField === "modal-json" ? "JSON Kopyalandı!" : "JSON Kopyala"}</span>
                                    </button>
                                </div>
                                <pre className="p-4 bg-gray-950 text-gray-200 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-gray-800">
                                    {JSON.stringify(selectedLog, null, 2)}
                                </pre>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 md:p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
                            <button
                                onClick={() => handleDeleteLog(selectedLog.id)}
                                disabled={deletingId === selectedLog.id}
                                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50"
                            >
                                <FaTrash />
                                <span>{deletingId === selectedLog.id ? "Siliniyor..." : "Bu Logu Sil"}</span>
                            </button>

                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-black dark:hover:bg-gray-200 transition"
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
