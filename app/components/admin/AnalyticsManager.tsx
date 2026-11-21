"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getAuthHeaders } from "@/lib/auth-headers";
import {
    FaChartBar,
    FaChartLine,
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
    FaBolt,
    FaHistory,
    FaChevronLeft,
    FaChevronRight,
    FaFileCsv,
    FaFileCode,
    FaLayerGroup,
    FaLaptop,
    FaBug,
    FaMagic,
    FaRobot,
    FaRoute,
    FaExternalLinkAlt,
    FaCodeBranch,
    FaShieldAlt,
    FaDesktop,
    FaTabletAlt
} from "react-icons/fa";

// ============================================================================
// Types
// ============================================================================

export interface LogMetadata {
    country?: string;
    city?: string;
    region?: string;
    path?: string;
    referrer?: string;
    title?: string;
    screen?: string;
    language?: string;
    app_version?: string;
    is_debug?: boolean;
    client_timestamp?: string;
    [key: string]: unknown;
}

export interface AppLog {
    id: string;
    uid: string;
    timestamp: string;
    event: string;
    platform: string;
    app_name?: string;
    metadata?: LogMetadata;
    ip_address?: string;
    user_agent?: string;
    created_at?: string;
}

export interface UserProfileInfo {
    name: string;
    email?: string;
    avatar_url?: string;
}

interface AnalyticsManagerProps {
    authToken: string;
    onNavigate?: (moduleId: string) => void;
}

// Country Code to Flag emoji helper
function getCountryFlag(code?: string): string {
    if (!code || code.length !== 2) return "🌐";
    try {
        const upper = code.toUpperCase();
        return String.fromCodePoint(...[...upper].map(c => 127397 + c.charCodeAt(0)));
    } catch {
        return "🌐";
    }
}

const COUNTRY_NAMES: Record<string, string> = {
    TR: "Türkiye",
    US: "ABD",
    DE: "Almanya",
    GB: "Birleşik Krallık",
    FR: "Fransa",
    NL: "Hollanda",
    AZ: "Azerbaycan",
    RU: "Rusya",
    IT: "İtalya",
    ES: "İspanya",
    CA: "Kanada",
    BR: "Brezilya",
    IN: "Hindistan",
    UA: "Ukrayna",
    PL: "Polonya",
    SE: "İsveç",
    CH: "İsviçre",
    AT: "Avusturya",
    BE: "Belçika",
    CY: "Kıbrıs"
};

// ============================================================================
// Component
// ============================================================================

export default function AnalyticsManager({ authToken, onNavigate }: AnalyticsManagerProps) {
    // Data states
    const [logs, setLogs] = useState<AppLog[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, UserProfileInfo>>({});
    const [totalInDb, setTotalInDb] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [logLimit, setLogLimit] = useState<number | "all">("all");
    const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

    // Multi-App & Filter States
    const [selectedApp, setSelectedApp] = useState<string>("all");
    const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
    const [selectedEvent, setSelectedEvent] = useState<string>("all");
    const [selectedCountry, setSelectedCountry] = useState<string>("all");
    const [selectedDateRange, setSelectedDateRange] = useState<"all" | "today" | "yesterday" | "7d" | "30d" | "90d">("all");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Chart Tabs & Controls
    const [activeChartTab, setActiveChartTab] = useState<"trend" | "hourly" | "platforms" | "events" | "geo" | "pages" | "mobile">("trend");
    const [trendDaysRange, setTrendDaysRange] = useState<7 | 14 | 30 | 90 | "all">(14);
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; date: string; count: number; users: number } | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

    // Modals
    const [selectedLog, setSelectedLog] = useState<AppLog | null>(null);
    const [journeyUserId, setJourneyUserId] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Resolved Geo Cache for old logs without country in metadata
    const [resolvedGeoMap, setResolvedGeoMap] = useState<Record<string, { country: string; countryCode: string; city: string }>>({});
    const [isResolvingIp, setIsResolvingIp] = useState<boolean>(false);

    // Auto-resolve IP location when opening a log detail that lacks country
    useEffect(() => {
        if (!selectedLog) return;
        const ip = selectedLog.ip_address;
        if (!ip || ip === "unknown" || ip === "127.0.0.1") return;
        if (selectedLog.metadata?.country) return;
        if (resolvedGeoMap[ip]) return;

        setIsResolvingIp(true);
        fetch(`/api/admin/analytics/resolve-ip?ip=${encodeURIComponent(ip)}`, {
            headers: getAuthHeaders(authToken)
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.countryCode) {
                    setResolvedGeoMap(prev => ({ ...prev, [ip]: data }));
                }
            })
            .catch(() => {})
            .finally(() => setIsResolvingIp(false));
    }, [selectedLog, authToken, resolvedGeoMap]);

    // AI Insights State
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
    const [aiInsights, setAiInsights] = useState<string | null>(null);
    const [aiRedactionCount, setAiRedactionCount] = useState<number>(0);
    const [showAiModal, setShowAiModal] = useState<boolean>(false);

    // Fetch Logs
    const fetchLogs = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        setIsRefreshing(true);
        try {
            const res = await fetch(`/api/admin/analytics?limit=${logLimit}`, {
                headers: getAuthHeaders(authToken)
            });
            if (res.ok) {
                const data = await res.json();
                const fetchedLogs: AppLog[] = data.logs || [];
                setLogs(fetchedLogs);
                setTotalInDb(data.total_count || fetchedLogs.length || 0);
                if (data.users) {
                    setUsersMap(data.users);
                }
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

    // Auto-refresh interval (30s)
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
                headers: getAuthHeaders(authToken, { "Content-Type": "application/json" }),
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

    // Helper: Parse Platform info
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

    // Helper: Parse Browser & Device
    const parseUserAgent = (ua?: string) => {
        if (!ua) return { browser: "Bilinmiyor", device: "Bilinmiyor", icon: FaDesktop };
        const lower = ua.toLowerCase();
        let browser = "Diğer";
        let icon = FaDesktop;

        if (lower.includes("edg/")) browser = "Edge";
        else if (lower.includes("chrome") && !lower.includes("edg")) browser = "Chrome";
        else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
        else if (lower.includes("firefox")) browser = "Firefox";
        else if (lower.includes("opera") || lower.includes("opr")) browser = "Opera";

        let device = "Masaüstü";
        if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
            device = "Mobil";
            icon = FaMobileAlt;
        } else if (lower.includes("ipad") || lower.includes("tablet")) {
            device = "Tablet";
            icon = FaTabletAlt;
        }

        return { browser, device, icon };
    };

    // Helper: Event badge style
    const getEventBadgeStyle = (event: string) => {
        const ev = (event || "").toLowerCase();
        if (ev.includes("open") || ev.includes("launch")) {
            return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
        }
        if (ev.includes("page_view") || ev.includes("view") || ev.includes("route")) {
            return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
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
        if (ev.includes("click") || ev.includes("select") || ev.includes("tap")) {
            return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
        }
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    };

    // Helper: Format date & relative time
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
            relative = "Gelecek tarih";
        } else if (diffSec < 60) {
            relative = `${Math.max(diffSec, 1)} sn önce`;
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

        const isCurrentYear = date.getFullYear() === now.getFullYear();
        const formatted = date.toLocaleString("tr-TR", {
            day: "numeric",
            month: "short",
            ...(isCurrentYear ? {} : { year: "numeric" }),
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        return { formatted, relative };
    };

    // Multi-App Options & Counts
    const appBreakdown = useMemo(() => {
        const map: Record<string, { count: number; uids: Set<string>; lastSeen: string }> = {};
        logs.forEach(l => {
            const name = l.app_name || "Bilinmiyor";
            if (!map[name]) {
                map[name] = { count: 0, uids: new Set(), lastSeen: l.timestamp };
            }
            map[name].count += 1;
            map[name].uids.add(l.uid);
            if (new Date(l.timestamp) > new Date(map[name].lastSeen)) {
                map[name].lastSeen = l.timestamp;
            }
        });

        return Object.entries(map).map(([name, data]) => ({
            name,
            count: data.count,
            uniqueUsers: data.uids.size,
            lastSeen: data.lastSeen
        })).sort((a, b) => b.count - a.count);
    }, [logs]);

    const uniquePlatforms = useMemo(() => {
        return Array.from(new Set(logs.map(log => log.platform).filter(Boolean))) as string[];
    }, [logs]);

    const uniqueEvents = useMemo(() => {
        return Array.from(new Set(logs.map(log => log.event).filter(Boolean))) as string[];
    }, [logs]);

    // Filter logs
    const filteredLogs = useMemo(() => {
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterdayMidnight = todayMidnight - 86400000;
        const sevenDaysAgo = todayMidnight - 7 * 86400000;
        const thirtyDaysAgo = todayMidnight - 30 * 86400000;
        const ninetyDaysAgo = todayMidnight - 90 * 86400000;
        const query = searchQuery.toLowerCase().trim();

        return logs.filter(log => {
            // App filter
            if (selectedApp !== "all" && log.app_name !== selectedApp) return false;

            // Platform filter
            if (selectedPlatform !== "all" && log.platform?.toLowerCase() !== selectedPlatform.toLowerCase()) return false;

            // Event filter
            if (selectedEvent !== "all" && log.event !== selectedEvent) return false;

            // Country filter
            if (selectedCountry !== "all") {
                const country = log.metadata?.country;
                if (!country || country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
            }

            // Date Range filter
            if (selectedDateRange !== "all") {
                const logTime = new Date(log.timestamp).getTime();
                if (isNaN(logTime)) return false;

                if (selectedDateRange === "today" && logTime < todayMidnight) return false;
                if (selectedDateRange === "yesterday" && (logTime < yesterdayMidnight || logTime >= todayMidnight)) return false;
                if (selectedDateRange === "7d" && logTime < sevenDaysAgo) return false;
                if (selectedDateRange === "30d" && logTime < thirtyDaysAgo) return false;
                if (selectedDateRange === "90d" && logTime < ninetyDaysAgo) return false;
            }

            // Search query
            if (query) {
                const matchUid = log.uid?.toLowerCase().includes(query);
                const userName = (usersMap[log.uid]?.name || "").toLowerCase();
                const userEmail = (usersMap[log.uid]?.email || "").toLowerCase();
                const matchName = userName.includes(query) || userEmail.includes(query);
                const matchEvent = log.event?.toLowerCase().includes(query);
                const matchApp = log.app_name?.toLowerCase().includes(query);
                const matchPlatform = log.platform?.toLowerCase().includes(query);
                const matchIp = log.ip_address?.toLowerCase().includes(query);
                const matchUa = log.user_agent?.toLowerCase().includes(query);
                const matchPath = log.metadata?.path?.toLowerCase().includes(query);
                const matchCity = log.metadata?.city?.toLowerCase().includes(query);
                const matchCountry = log.metadata?.country?.toLowerCase().includes(query);

                if (!matchUid && !matchName && !matchEvent && !matchApp && !matchPlatform && !matchIp && !matchUa && !matchPath && !matchCity && !matchCountry) {
                    return false;
                }
            }

            return true;
        });
    }, [logs, selectedApp, selectedPlatform, selectedEvent, selectedCountry, selectedDateRange, searchQuery, usersMap]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedApp, selectedPlatform, selectedEvent, selectedCountry, selectedDateRange]);

    // Real-time Active Pulse (Users active in the last 15 minutes)
    const activePulseMetrics = useMemo(() => {
        const now = Date.now();
        const fifteenMinutesAgo = now - 15 * 60 * 1000;
        const recentLogs = filteredLogs.filter(l => {
            const t = new Date(l.timestamp).getTime();
            return !isNaN(t) && t >= fifteenMinutesAgo;
        });

        const activeUids = new Set(recentLogs.map(l => l.uid));
        const activeIps = new Set(recentLogs.map(l => l.ip_address).filter(Boolean));

        return {
            activeUsersNow: activeUids.size,
            activeIpsNow: activeIps.size,
            recentLogsCount: recentLogs.length
        };
    }, [filteredLogs]);

    // High-Level KPIs
    const metrics = useMemo(() => {
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const todayLogs = filteredLogs.filter(l => {
            const t = new Date(l.timestamp).getTime();
            return !isNaN(t) && t >= todayMidnight;
        });

        const uniqueUsersAll = new Set(filteredLogs.map(l => l.uid)).size;
        const uniqueUsersToday = new Set(todayLogs.map(l => l.uid)).size;
        const totalAppOpensToday = todayLogs.filter(l => l.event === "app_opened_daily" || l.event?.toLowerCase().includes("open")).length;
        const totalAppOpensAll = filteredLogs.filter(l => l.event === "app_opened_daily" || l.event?.toLowerCase().includes("open")).length;
        const uniqueIPs = new Set(filteredLogs.map(l => l.ip_address).filter(Boolean)).size;

        // Stickiness (DAU / Total ratio)
        const stickinessPct = uniqueUsersAll > 0 ? Math.round((uniqueUsersToday / uniqueUsersAll) * 100) : 0;

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

        // Countries breakdown
        const countryCounts: Record<string, number> = {};
        filteredLogs.forEach(l => {
            const c = l.metadata?.country || "Bilinmiyor";
            countryCounts[c] = (countryCounts[c] || 0) + 1;
        });
        const topCountryEntry = Object.entries(countryCounts).filter(([c]) => c !== "Bilinmiyor").sort((a, b) => b[1] - a[1])[0];
        const topCountry = topCountryEntry ? {
            code: topCountryEntry[0],
            name: COUNTRY_NAMES[topCountryEntry[0].toUpperCase()] || topCountryEntry[0],
            flag: getCountryFlag(topCountryEntry[0]),
            count: topCountryEntry[1]
        } : null;

        return {
            uniqueUsersAll,
            uniqueUsersToday,
            stickinessPct,
            totalLogs: filteredLogs.length,
            totalAppOpensToday,
            totalAppOpensAll,
            uniqueIPs,
            topPlatform,
            topCountry
        };
    }, [filteredLogs]);

    // Chart: Daily Activity Trend with Bezier Spline
    const dailyTrendData = useMemo(() => {
        const daysMap: Record<string, { count: number; uids: Set<string>; date: string; label: string }> = {};

        if (trendDaysRange === "all") {
            filteredLogs.forEach(log => {
                const d = new Date(log.timestamp);
                if (isNaN(d.getTime())) return;
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const label = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
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
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const label = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
                daysMap[dateStr] = { count: 0, uids: new Set<string>(), date: dateStr, label };
            }

            filteredLogs.forEach(log => {
                const d = new Date(log.timestamp);
                if (isNaN(d.getTime())) return;
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                if (daysMap[dateStr]) {
                    daysMap[dateStr].count += 1;
                    daysMap[dateStr].uids.add(log.uid);
                }
            });
        }

        const list = Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date));
        const maxCount = Math.max(...list.map(d => d.count), 1);
        const maxUsers = Math.max(...list.map(d => d.uids.size), 1);

        // Calculate growth delta vs previous equivalent half
        const half = Math.floor(list.length / 2);
        const firstHalf = list.slice(0, half).reduce((acc, curr) => acc + curr.count, 0);
        const secondHalf = list.slice(half).reduce((acc, curr) => acc + curr.count, 0);
        const growthDelta = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : secondHalf > 0 ? 100 : 0;

        return {
            items: list.map(d => ({
                ...d,
                uniqueUsers: d.uids.size,
                percentage: Math.round((d.count / maxCount) * 100)
            })),
            maxCount,
            maxUsers,
            growthDelta
        };
    }, [filteredLogs, trendDaysRange]);

    // Build SVG path for smooth bezier curve
    const svgSplinePath = useMemo(() => {
        const items = dailyTrendData.items;
        if (items.length < 2) return { pathD: "", areaD: "", points: [] };

        const width = 800;
        const height = 220;
        const paddingX = 20;
        const paddingTop = 25;
        const paddingBottom = 35;
        const usableWidth = width - paddingX * 2;
        const usableHeight = height - paddingTop - paddingBottom;
        const maxVal = Math.max(dailyTrendData.maxCount, 1);

        const points = items.map((item, index) => {
            const x = paddingX + (index / (items.length - 1)) * usableWidth;
            const y = height - paddingBottom - (item.count / maxVal) * usableHeight;
            return { x, y, item };
        });

        // Compute cubic bezier spline
        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(i - 1, 0)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(i + 2, points.length - 1)];

            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }

        const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

        return { pathD, areaD, points };
    }, [dailyTrendData]);

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

    // Geo: Countries & Cities Breakdown
    const geoBreakdown = useMemo(() => {
        const countryMap: Record<string, { count: number; uids: Set<string>; cities: Record<string, number> }> = {};

        filteredLogs.forEach(l => {
            const country = l.metadata?.country || "Bilinmiyor";
            const city = l.metadata?.city || null;

            if (!countryMap[country]) {
                countryMap[country] = { count: 0, uids: new Set(), cities: {} };
            }
            countryMap[country].count += 1;
            countryMap[country].uids.add(l.uid);

            if (city) {
                countryMap[country].cities[city] = (countryMap[country].cities[city] || 0) + 1;
            }
        });

        const total = filteredLogs.length || 1;
        return Object.entries(countryMap)
            .map(([code, data]) => ({
                code,
                name: COUNTRY_NAMES[code.toUpperCase()] || code,
                flag: getCountryFlag(code),
                count: data.count,
                uniqueUsers: data.uids.size,
                percentage: Math.round((data.count / total) * 100),
                cities: Object.entries(data.cities).sort((a, b) => b[1] - a[1]).slice(0, 5)
            }))
            .sort((a, b) => b.count - a.count);
    }, [filteredLogs]);

    // Device and Browser Breakdown (From User Agent)
    const devicesAndBrowsers = useMemo(() => {
        const browsers: Record<string, number> = {};
        const devices: Record<string, number> = {};

        filteredLogs.forEach(l => {
            const parsed = parseUserAgent(l.user_agent);
            browsers[parsed.browser] = (browsers[parsed.browser] || 0) + 1;
            devices[parsed.device] = (devices[parsed.device] || 0) + 1;
        });

        const total = filteredLogs.length || 1;
        return {
            browsers: Object.entries(browsers).map(([name, count]) => ({
                name,
                count,
                percentage: Math.round((count / total) * 100)
            })).sort((a, b) => b.count - a.count),
            devices: Object.entries(devices).map(([name, count]) => ({
                name,
                count,
                percentage: Math.round((count / total) * 100)
            })).sort((a, b) => b.count - a.count)
        };
    }, [filteredLogs]);

    // Web Traffic: Top Pages & Referrers (When website is part of scope)
    const webTrafficData = useMemo(() => {
        const pageCounts: Record<string, number> = {};
        const referrerCounts: Record<string, number> = {};
        const screens: Record<string, number> = {};

        filteredLogs.forEach(l => {
            if (l.app_name === "website" || l.metadata?.path) {
                const path = l.metadata?.path || (l.event === "page_view" ? "/" : null);
                if (path) pageCounts[path] = (pageCounts[path] || 0) + 1;

                const ref = l.metadata?.referrer;
                if (ref) referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;

                const screen = l.metadata?.screen;
                if (screen) screens[screen] = (screens[screen] || 0) + 1;
            }
        });

        const totalPages = Object.values(pageCounts).reduce((a, b) => a + b, 0) || 1;

        return {
            topPages: Object.entries(pageCounts)
                .map(([path, count]) => ({
                    path,
                    count,
                    percentage: Math.round((count / totalPages) * 100)
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10),
            topReferrers: Object.entries(referrerCounts)
                .map(([referrer, count]) => ({ referrer, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 8),
            screens: Object.entries(screens).sort((a, b) => b[1] - a[1]).slice(0, 5)
        };
    }, [filteredLogs]);

    // Mobile / Games Telemetry: App Versions & Debug/Release
    const mobileTelemetryData = useMemo(() => {
        const versions: Record<string, number> = {};
        let debugCount = 0;
        let releaseCount = 0;

        filteredLogs.forEach(l => {
            const ver = l.metadata?.app_version;
            if (ver) versions[ver] = (versions[ver] || 0) + 1;

            if (l.metadata?.is_debug === true) debugCount += 1;
            else if (l.metadata?.is_debug === false) releaseCount += 1;
        });

        const totalVersions = Object.values(versions).reduce((a, b) => a + b, 0) || 1;

        return {
            versions: Object.entries(versions)
                .map(([version, count]) => ({
                    version,
                    count,
                    percentage: Math.round((count / totalVersions) * 100)
                }))
                .sort((a, b) => b.count - a.count),
            debugCount,
            releaseCount
        };
    }, [filteredLogs]);

    // Top 10 Power Users
    const powerUsers = useMemo(() => {
        const userActivity: Record<string, { count: number; lastLog: AppLog; platforms: Record<string, number>; apps: Record<string, number> }> = {};

        filteredLogs.forEach(l => {
            if (!userActivity[l.uid]) {
                userActivity[l.uid] = { count: 0, lastLog: l, platforms: {}, apps: {} };
            }
            userActivity[l.uid].count += 1;
            userActivity[l.uid].platforms[l.platform] = (userActivity[l.uid].platforms[l.platform] || 0) + 1;
            const app = l.app_name || "Bilinmiyor";
            userActivity[l.uid].apps[app] = (userActivity[l.uid].apps[app] || 0) + 1;

            if (new Date(l.timestamp) > new Date(userActivity[l.uid].lastLog.timestamp)) {
                userActivity[l.uid].lastLog = l;
            }
        });

        return Object.entries(userActivity)
            .map(([uid, data]) => {
                const primaryPlatform = Object.entries(data.platforms).sort((a, b) => b[1] - a[1])[0]?.[0] || "web";
                const primaryApp = Object.entries(data.apps).sort((a, b) => b[1] - a[1])[0]?.[0] || "website";
                const userProfile = usersMap[uid];

                return {
                    uid,
                    name: userProfile?.name || "Misafir Kullanıcı",
                    email: userProfile?.email,
                    avatar: userProfile?.avatar_url,
                    isRegistered: !!userProfile,
                    count: data.count,
                    lastSeen: data.lastLog.timestamp,
                    primaryPlatform,
                    primaryApp
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [filteredLogs, usersMap]);

    // Live Stream: 6 Most recent events
    const liveStreamEvents = useMemo(() => {
        return filteredLogs.slice(0, 6);
    }, [filteredLogs]);

    // Chronological User Journey for Selected User
    const userJourneyLogs = useMemo(() => {
        if (!journeyUserId) return [];
        return logs
            .filter(l => l.uid === journeyUserId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [logs, journeyUserId]);

    // Paginated logs
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredLogs.slice(startIndex, startIndex + pageSize);
    }, [filteredLogs, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;

    // AI Insights Generator Trigger
    const handleGenerateAiInsights = async () => {
        setIsAiLoading(true);
        setShowAiModal(true);
        setAiRedactionCount(0);
        try {
            const payload = {
                appName: selectedApp,
                metrics: {
                    totalLogs: metrics.totalLogs,
                    uniqueUsersAll: metrics.uniqueUsersAll,
                    uniqueUsersToday: metrics.uniqueUsersToday,
                    uniqueIPs: metrics.uniqueIPs,
                    totalAppOpensAll: metrics.totalAppOpensAll,
                },
                topEvents: eventsBreakdown.slice(0, 6).map(e => ({
                    event: e.event,
                    count: e.count,
                    percentage: e.percentage,
                })),
                topPlatforms: platformDistribution.slice(0, 4).map(p => ({
                    platform: p.platform,
                    count: p.count,
                    percentage: p.percentage,
                })),
                dailyTrend: dailyTrendData.items.slice(-7).map(d => ({
                    date: d.date,
                    label: d.label,
                    count: d.count,
                    uniqueUsers: d.uniqueUsers,
                    percentage: d.percentage,
                })),
                topCountries: geoBreakdown.slice(0, 5).map(g => ({ code: g.code, name: g.name, count: g.count })),
                topPages: webTrafficData.topPages.slice(0, 5).map(p => ({
                    path: p.path,
                    count: p.count,
                    percentage: p.percentage,
                })),
            };

            const res = await fetch("/api/admin/analytics/ai-insights", {
                method: "POST",
                headers: getAuthHeaders(authToken, { "Content-Type": "application/json" }),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setAiInsights(data.insights);
                setAiRedactionCount(data.redaction?.summary?.totalRedactions || 0);
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`AI analizi alınamadı: ${errData.error || "Sunucu hatası"}`);
                setShowAiModal(false);
            }
        } catch (err) {
            console.error("AI Insights fetch error:", err);
            alert("AI servisine bağlanırken bir hata oluştu.");
            setShowAiModal(false);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Export helpers
    const exportCSV = () => {
        if (filteredLogs.length === 0) return;
        const headers = ["ID", "Tarih", "Olay (Event)", "Uygulama", "Platform", "Kullanici (UID)", "IP", "Ulke", "Sehir", "User Agent"];
        const rows = filteredLogs.map(log => [
            `"${log.id || ""}"`,
            `"${log.timestamp || ""}"`,
            `"${log.event || ""}"`,
            `"${log.app_name || ""}"`,
            `"${log.platform || ""}"`,
            `"${log.uid || ""}"`,
            `"${log.ip_address || ""}"`,
            `"${log.metadata?.country || ""}"`,
            `"${log.metadata?.city || ""}"`,
            `"${(log.user_agent || "").replace(/"/g, '""')}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `telemetry_logs_${selectedApp}_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportJSON = () => {
        if (filteredLogs.length === 0) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `telemetry_logs_${selectedApp}_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasActiveFilters = searchQuery !== "" || selectedPlatform !== "all" || selectedEvent !== "all" || selectedCountry !== "all" || selectedDateRange !== "all";

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedPlatform("all");
        setSelectedEvent("all");
        setSelectedCountry("all");
        setSelectedDateRange("all");
    };

    return (
        <div className="flex flex-col gap-6 animate-fadeIn pb-16 w-full max-w-full min-w-0 overflow-hidden">
            {/* Top Control Bar */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-5 md:p-6 rounded-3xl border border-white/20 dark:border-white/10 shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-violet-500/25 shrink-0">
                        <FaChartBar />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                {selectedApp === "all" ? "Çoklu Uygulama Telemetrisi & Analitik" : `${selectedApp} Analitiği`}
                            </h2>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${autoRefresh ? "animate-ping" : ""}`} />
                                {autoRefresh ? "Canlı (30s)" : "Canlı Akış Hazır"}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {lastUpdated ? `Son senkron: ${lastUpdated.toLocaleTimeString("tr-TR")}` : "Veriler alınıyor..."} • {
                                totalInDb > 0 && logs.length >= totalInDb
                                    ? `Tüm ${totalInDb.toLocaleString("tr-TR")} kayıt hafızada`
                                    : `${logs.length.toLocaleString("tr-TR")} / Toplam ${totalInDb.toLocaleString("tr-TR")} kayıt`
                            }
                        </p>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    {/* Gemini AI Insights Button */}
                    <button
                        onClick={handleGenerateAiInsights}
                        disabled={isAiLoading || filteredLogs.length === 0}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-md shadow-violet-500/20 active:scale-95 transition-all disabled:opacity-50"
                        title="Gemini AI ile son verileri analiz et ve özet rapor al"
                    >
                        <FaMagic className={isAiLoading ? "animate-spin" : ""} />
                        <span>{isAiLoading ? "Analiz Ediliyor..." : "AI Raporu Al"}</span>
                    </button>

                    {onNavigate && (
                        <button
                            onClick={() => onNavigate("error-logs")}
                            className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20 hover:bg-red-500/20 transition-all"
                            title="Hata Analizi sekmesine git"
                        >
                            <FaBug />
                            <span>Hata Analizi</span>
                        </button>
                    )}

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
                        onChange={(e) => setLogLimit(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="px-3 py-2 text-xs font-semibold bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-700 dark:text-gray-300 outline-none hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                        title="Alınacak maksimum log sayısı"
                    >
                        <option value="all">Tüm Loglar {totalInDb > 0 ? `(${totalInDb.toLocaleString("tr-TR")})` : "(Sınırsız)"}</option>
                        <option value={5000}>Son 5.000 Log</option>
                        <option value={2000}>Son 2.000 Log</option>
                        <option value={1000}>Son 1.000 Log</option>
                        <option value={500}>Son 500 Log</option>
                    </select>

                    {/* Manual Refresh */}
                    <button
                        onClick={() => fetchLogs()}
                        disabled={isLoading || isRefreshing}
                        className="px-3.5 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FaSync className={isRefreshing ? "animate-spin" : ""} />
                        <span>{isRefreshing ? "Yenileniyor..." : "Yenile"}</span>
                    </button>

                    {/* Export */}
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

            {/* Multi-App Switcher Pills (Wrap into rows) */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-3.5 md:p-4 rounded-3xl border border-white/20 dark:border-white/10 shadow-md flex flex-wrap items-center gap-2 w-full">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1 pr-1.5 flex items-center gap-1.5 py-1">
                    <FaLayerGroup className="text-violet-500" /> Uygulama:
                </span>

                {/* All Apps Pill */}
                <button
                    onClick={() => setSelectedApp("all")}
                    className={`px-3.5 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                        selectedApp === "all"
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 ring-2 ring-violet-500/30"
                            : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    }`}
                >
                    <FaGlobe />
                    <span>Tüm Uygulamalar (Global Hub)</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedApp === "all" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-400"}`}>
                        {logs.length}
                    </span>
                </button>

                {/* Individual App Pills */}
                {appBreakdown.map(app => (
                    <button
                        key={app.name}
                        onClick={() => setSelectedApp(app.name)}
                        className={`px-3.5 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                            selectedApp === app.name
                                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 ring-2 ring-violet-500/30"
                                : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                        }`}
                    >
                        <span className="capitalize">{app.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedApp === app.name ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-400"}`}>
                            {app.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-4 w-full">
                {/* 1. Unique Users & Stickiness */}
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tekil Kullanıcı</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm shadow-inner shrink-0">
                            <FaUser />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {metrics.uniqueUsersAll.toLocaleString("tr-TR")}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1 truncate">
                            <FaBolt className="text-[10px]" /> Bugün: {metrics.uniqueUsersToday}
                        </span>
                        <span className="text-gray-400 text-[10px]">%{metrics.stickinessPct} aktiflik</span>
                    </div>
                </div>

                {/* 2. Total Events & Growth */}
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:bg-purple-500/20 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Toplam Olay</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-sm shadow-inner shrink-0">
                            <FaChartBar />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {metrics.totalLogs.toLocaleString("tr-TR")}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-purple-600 dark:text-purple-400 truncate">
                        <FaHistory className="text-[10px] shrink-0" />
                        <span className="truncate">
                            {dailyTrendData.growthDelta >= 0 ? `+${dailyTrendData.growthDelta}% son periyot` : `${dailyTrendData.growthDelta}% son periyot`}
                        </span>
                    </div>
                </div>

                {/* 3. Live Active Pulse (Real-Time 15m) */}
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Canlı Nabız</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm shadow-inner shrink-0 relative">
                            <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <FaBolt />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight flex items-center gap-2">
                        {activePulseMetrics.activeUsersNow}
                        <span className="text-xs font-semibold text-gray-400 font-normal">Kullanıcı</span>
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate">
                        Son 15 dk: {activePulseMetrics.recentLogsCount} işlem ({activePulseMetrics.activeIpsNow} IP)
                    </div>
                </div>

                {/* 4. Top Platform */}
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
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
                    <div className="mt-2 text-[11px] font-medium text-amber-600 dark:text-amber-400 truncate">
                        Dağılım: %{metrics.topPlatform ? metrics.topPlatform.percent : 0} ({metrics.topPlatform?.count || 0} log)
                    </div>
                </div>

                {/* 5. Geo / Top Country */}
                <div className="col-span-2 md:col-span-1 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:bg-rose-500/20 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Ziyaretçi Ülkesi</span>
                        <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-sm shadow-inner shrink-0">
                            <FaGlobe />
                        </div>
                    </div>
                    <div className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 truncate">
                        <span className="text-2xl">{metrics.topCountry?.flag || "🌍"}</span>
                        <span className="truncate">{metrics.topCountry ? metrics.topCountry.name : "Küresel"}</span>
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-rose-600 dark:text-rose-400 truncate">
                        {metrics.uniqueIPs} tekil IP • {metrics.topCountry ? `${metrics.topCountry.count} istek` : "Dağıtık"}
                    </div>
                </div>
            </div>

            {/* Visual Analytics & Charts Section */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-lg p-5 md:p-6 flex flex-col gap-5 w-full">
                {/* Chart Header & Tabs */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4 w-full">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Gelişmiş Görsel İstatistikler</span>
                        <span className="text-xs text-gray-400 font-medium">({filteredLogs.length} veri noktası)</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-zinc-800/80 p-1 rounded-2xl overflow-x-auto max-w-full">
                        <button
                            onClick={() => setActiveChartTab("trend")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                activeChartTab === "trend"
                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            <FaChartLine className="text-violet-500" />
                            <span>Aktivite Eğrisi</span>
                        </button>
                        <button
                            onClick={() => setActiveChartTab("hourly")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                activeChartTab === "hourly"
                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            <FaClock className="text-amber-500" />
                            <span>24s Yoğunluk</span>
                        </button>
                        <button
                            onClick={() => setActiveChartTab("platforms")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                activeChartTab === "platforms"
                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            <FaLaptop className="text-blue-500" />
                            <span>Platformlar</span>
                        </button>
                        <button
                            onClick={() => setActiveChartTab("events")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                activeChartTab === "events"
                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            <FaBolt className="text-fuchsia-500" />
                            <span>Olaylar</span>
                        </button>
                        <button
                            onClick={() => setActiveChartTab("geo")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                activeChartTab === "geo"
                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            <FaGlobe className="text-emerald-500" />
                            <span>Coğrafya</span>
                        </button>
                        {(selectedApp === "website" || selectedApp === "all") && (
                            <button
                                onClick={() => setActiveChartTab("pages")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                    activeChartTab === "pages"
                                        ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                            >
                                <FaRoute className="text-indigo-500" />
                                <span>Web Sayfaları</span>
                            </button>
                        )}
                        {(selectedApp !== "website") && (
                            <button
                                onClick={() => setActiveChartTab("mobile")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                    activeChartTab === "mobile"
                                        ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                            >
                                <FaMobileAlt className="text-teal-500" />
                                <span>Uygulama Sürümleri</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab 1: Smooth SVG Bezier Area Chart */}
                {activeChartTab === "trend" && (
                    <div className="space-y-4 w-full">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 px-1">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-700 dark:text-gray-300 mr-1">Grafik Aralığı:</span>
                                {([7, 14, 30, 90, "all"] as const).map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setTrendDaysRange(r)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                            trendDaysRange === r
                                                ? "bg-violet-600 text-white shadow-sm"
                                                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                                        }`}
                                    >
                                        {r === "all" ? "Tümü" : `Son ${r} Gün`}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-violet-600" /> Toplam Olay
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tekil Kullanıcı
                                </span>
                            </div>
                        </div>

                        {dailyTrendData.items.length === 0 || dailyTrendData.maxCount === 0 ? (
                            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
                                Seçilen filtrede yeterli trend verisi yok.
                            </div>
                        ) : (
                            <div className="relative w-full overflow-hidden bg-gradient-to-b from-violet-500/5 to-transparent rounded-2xl p-2 border border-gray-100 dark:border-white/5">
                                {/* SVG Chart */}
                                <svg
                                    viewBox="0 0 800 220"
                                    className="w-full h-56 overflow-visible select-none"
                                    onMouseLeave={() => setHoveredPoint(null)}
                                >
                                    <defs>
                                        <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Horizontal Grid lines */}
                                    {[0.25, 0.5, 0.75, 1].map((pct, i) => {
                                        const y = 220 - 35 - pct * (220 - 25 - 35);
                                        return (
                                            <g key={i}>
                                                <line
                                                    x1="20"
                                                    y1={y}
                                                    x2="780"
                                                    y2={y}
                                                    stroke="currentColor"
                                                    strokeOpacity="0.08"
                                                    strokeDasharray="4 4"
                                                />
                                                <text
                                                    x="25"
                                                    y={y - 4}
                                                    className="text-[9px] fill-gray-400 dark:fill-zinc-500 font-mono"
                                                >
                                                    {Math.round(dailyTrendData.maxCount * pct)}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Filled Area */}
                                    {svgSplinePath.areaD && (
                                        <path d={svgSplinePath.areaD} fill="url(#trendGradient)" />
                                    )}

                                    {/* Main Stroke Path */}
                                    {svgSplinePath.pathD && (
                                        <path
                                            d={svgSplinePath.pathD}
                                            fill="none"
                                            stroke="#8b5cf6"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    )}

                                    {/* Hover Cursor Vertical Line */}
                                    {hoveredPoint && (
                                        <line
                                            x1={hoveredPoint.x}
                                            y1="10"
                                            x2={hoveredPoint.x}
                                            y2="185"
                                            stroke="#8b5cf6"
                                            strokeWidth="1.5"
                                            strokeDasharray="3 3"
                                        />
                                    )}

                                    {/* Interactive Dots & Touch targets */}
                                    {svgSplinePath.points.map((pt, idx) => (
                                        <g key={idx}>
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r={hoveredPoint?.date === pt.item.date ? 6 : 3.5}
                                                className="fill-white dark:fill-zinc-900 stroke-violet-600 transition-all cursor-pointer"
                                                strokeWidth="2.5"
                                            />
                                            {/* Transparent hover capture zone */}
                                            <rect
                                                x={pt.x - 15}
                                                y="0"
                                                width="30"
                                                height="220"
                                                fill="transparent"
                                                className="cursor-pointer"
                                                onMouseEnter={() => setHoveredPoint({
                                                    x: pt.x,
                                                    y: pt.y,
                                                    date: pt.item.label,
                                                    count: pt.item.count,
                                                    users: pt.item.uniqueUsers
                                                })}
                                            />
                                            {/* X-Axis Date Labels */}
                                            {(svgSplinePath.points.length <= 14 || idx % Math.ceil(svgSplinePath.points.length / 10) === 0 || idx === svgSplinePath.points.length - 1) && (
                                                <text
                                                    x={pt.x}
                                                    y="210"
                                                    textAnchor="middle"
                                                    className="text-[10px] fill-gray-400 font-semibold"
                                                >
                                                    {pt.item.label}
                                                </text>
                                            )}
                                        </g>
                                    ))}
                                </svg>

                                {/* Tooltip Card */}
                                {hoveredPoint && (
                                    <div
                                        style={{ left: Math.min(Math.max(hoveredPoint.x - 60, 10), 650) }}
                                        className="absolute top-4 pointer-events-none bg-gray-900/95 dark:bg-white/95 text-white dark:text-black py-2 px-3.5 rounded-xl shadow-2xl backdrop-blur-md flex flex-col gap-1 z-30 transition-all border border-white/10 dark:border-black/10"
                                    >
                                        <div className="font-bold text-xs">{hoveredPoint.date}</div>
                                        <div className="flex items-center gap-3 text-[11px] font-semibold">
                                            <span className="text-violet-400 dark:text-violet-600">{hoveredPoint.count} işlem</span>
                                            <span className="text-emerald-400 dark:text-emerald-600">{hoveredPoint.users} tekil kullanıcı</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: 24-Hour Peak Heatmap */}
                {activeChartTab === "hourly" && (
                    <div className="space-y-4 w-full">
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 px-1">
                            <span>24 Saatlik Zaman Dilimi Dağılımı (Kullanıcı Alışkanlıkları)</span>
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
                                                Saat {hourItem.label}: {hourItem.count} işlem
                                            </div>

                                            <div
                                                style={{ height: `${heightPct}%` }}
                                                className={`w-full rounded-t-md transition-all duration-300 group-hover:scale-110 ${
                                                    isPeak
                                                        ? "bg-gradient-to-t from-rose-600 to-amber-500 shadow-md shadow-rose-500/20"
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

                {/* Tab 3: Platform Breakdown */}
                {activeChartTab === "platforms" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
                        {platformDistribution.map(item => {
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
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.count} işlem</div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-gray-700 dark:text-gray-300 ml-2">%{item.percentage}</span>
                                    </div>

                                    <div className="w-full h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${item.percentage}%` }}
                                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Tab 4: Events Breakdown */}
                {activeChartTab === "events" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
                        {eventsBreakdown.map((item) => (
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
                        ))}
                    </div>
                )}

                {/* Tab 5: Geo Breakdown (Countries & Cities) */}
                {activeChartTab === "geo" && (
                    <div className="space-y-4 w-full">
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 px-1">
                            <span>Ziyaretçi Ülke ve Şehir Dağılımı (IP & Ağ Konumu)</span>
                            <span>{geoBreakdown.length} Ülke Tespit Edildi</span>
                        </div>

                        {geoBreakdown.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">Henüz coğrafi konum verisi toplanmadı.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {geoBreakdown.map(geo => (
                                    <div
                                        key={geo.code}
                                        onClick={() => setSelectedCountry(selectedCountry === geo.code ? "all" : geo.code)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                                            selectedCountry.toLowerCase() === geo.code.toLowerCase()
                                                ? "bg-rose-500/10 border-rose-500/50 shadow-md ring-1 ring-rose-500/30"
                                                : "bg-white/40 dark:bg-zinc-800/40 border-gray-100 dark:border-white/5 hover:bg-white/80 dark:hover:bg-zinc-800/80"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{geo.flag}</span>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-900 dark:text-white">{geo.name}</div>
                                                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                                        {geo.uniqueUsers} tekil kullanıcı • {geo.count} log
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-rose-600 dark:text-rose-400">%{geo.percentage}</span>
                                        </div>

                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${geo.percentage}%` }}
                                                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                                            />
                                        </div>

                                        {geo.cities.length > 0 && (
                                            <div className="pt-1 flex flex-wrap items-center gap-1 text-[10px] text-gray-400">
                                                <span className="font-semibold text-gray-500">Şehirler:</span>
                                                {geo.cities.map(([cityName, count]) => (
                                                    <span key={cityName} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800">
                                                        {cityName} ({count})
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Device & Browser Intelligence */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-white/5">
                            {/* Browsers */}
                            <div className="p-4 bg-white/40 dark:bg-zinc-800/40 rounded-2xl border border-gray-100 dark:border-white/5 space-y-3">
                                <span className="font-bold text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <FaDesktop className="text-violet-500" /> Tarayıcı Dağılımı
                                </span>
                                <div className="space-y-2">
                                    {devicesAndBrowsers.browsers.map(b => (
                                        <div key={b.name} className="flex flex-col gap-1 text-xs">
                                            <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
                                                <span>{b.name}</span>
                                                <span className="text-gray-500 font-normal">{b.count} (%{b.percentage})</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div style={{ width: `${b.percentage}%` }} className="h-full bg-violet-500 rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Device Types */}
                            <div className="p-4 bg-white/40 dark:bg-zinc-800/40 rounded-2xl border border-gray-100 dark:border-white/5 space-y-3">
                                <span className="font-bold text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <FaMobileAlt className="text-emerald-500" /> Cihaz Türü
                                </span>
                                <div className="space-y-2">
                                    {devicesAndBrowsers.devices.map(d => (
                                        <div key={d.name} className="flex flex-col gap-1 text-xs">
                                            <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
                                                <span>{d.name}</span>
                                                <span className="text-gray-500 font-normal">{d.count} (%{d.percentage})</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div style={{ width: `${d.percentage}%` }} className="h-full bg-emerald-500 rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 6: Web Pages & Referrers */}
                {activeChartTab === "pages" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                        {/* Top Visited Pages */}
                        <div className="p-4 bg-white/40 dark:bg-zinc-800/40 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaRoute className="text-violet-500" /> En Çok Gezilen Sayfalar / Projeler
                                </span>
                                <span className="text-xs text-gray-400 font-semibold">{webTrafficData.topPages.length} sayfa</span>
                            </div>

                            {webTrafficData.topPages.length === 0 ? (
                                <div className="py-8 text-center text-gray-400 text-xs">Sayfa verisi bulunamadı.</div>
                            ) : (
                                <div className="space-y-2">
                                    {webTrafficData.topPages.map(page => (
                                        <div key={page.path} className="flex flex-col gap-1 text-xs">
                                            <div className="flex items-center justify-between font-mono">
                                                <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[70%]">
                                                    {page.path}
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {page.count} görüntülenme (%{page.percentage})
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div
                                                    style={{ width: `${page.percentage}%` }}
                                                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Top Referrers & Screen resolutions */}
                        <div className="flex flex-col gap-4">
                            {/* Referrers */}
                            <div className="p-4 bg-white/40 dark:bg-zinc-800/40 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col gap-3">
                                <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaExternalLinkAlt className="text-emerald-500 text-xs" /> Trafik Kaynakları (Referrer)
                                </span>
                                {webTrafficData.topReferrers.length === 0 ? (
                                    <div className="py-4 text-center text-gray-400 text-xs">Kaynak verisi bulunamadı.</div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {webTrafficData.topReferrers.map(r => (
                                            <span key={r.referrer} className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 text-xs font-medium border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
                                                <span className="font-semibold">{r.referrer === "direct" ? "Doğrudan Giriş" : r.referrer}</span>
                                                <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-900 text-[10px] text-gray-500 font-bold">
                                                    {r.count}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Screen resolutions */}
                            <div className="p-4 bg-white/40 dark:bg-zinc-800/40 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col gap-2">
                                <span className="font-bold text-xs text-gray-700 dark:text-gray-300">Ekran Çözünürlükleri</span>
                                <div className="flex flex-wrap gap-2">
                                    {webTrafficData.screens.map(([res, count]) => (
                                        <span key={res} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-[11px] font-mono text-gray-600 dark:text-gray-400">
                                            {res} ({count})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 7: Mobile Telemetry & App Versions */}
                {activeChartTab === "mobile" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {/* App Versions */}
                        <div className="p-4 bg-white/40 dark:bg-zinc-800/40 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col gap-3">
                            <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <FaCodeBranch className="text-teal-500" /> Uygulama Versiyon Dağılımı
                            </span>
                            {mobileTelemetryData.versions.length === 0 ? (
                                <div className="py-6 text-center text-gray-400 text-xs">Versiyon bilgisi bulunamadı.</div>
                            ) : (
                                <div className="space-y-2">
                                    {mobileTelemetryData.versions.map(v => (
                                        <div key={v.version} className="flex flex-col gap-1 text-xs">
                                            <div className="flex items-center justify-between font-mono">
                                                <span className="font-bold text-gray-800 dark:text-gray-200">v{v.version}</span>
                                                <span className="text-gray-500">{v.count} log (%{v.percentage})</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div style={{ width: `${v.percentage}%` }} className="h-full bg-teal-500 rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Environment Debug vs Release */}
                        <div className="p-4 bg-white/40 dark:bg-zinc-800/40 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col justify-between">
                            <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <FaShieldAlt className="text-amber-500" /> Çalışma Ortamı (Debug vs Release)
                            </span>
                            <div className="grid grid-cols-2 gap-3 my-4">
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">Production / Release</span>
                                    <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 block">
                                        {mobileTelemetryData.releaseCount}
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block">Geliştirici / Debug</span>
                                    <span className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1 block">
                                        {mobileTelemetryData.debugCount}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400 text-center">
                                Flutter veya harici istemcilerden gelen `is_debug` alanı baz alınmıştır.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Power Users & Real-time Live Stream Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                {/* Top Power Users (2 cols) */}
                <div className="lg:col-span-2 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-lg p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <FaUser className="text-violet-500 text-sm" />
                            <h3 className="font-bold text-base text-gray-900 dark:text-white">En Aktif Kullanıcılar (Top Power Users)</h3>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">İlk 10 Kullanıcı</span>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead>
                                <tr className="text-gray-400 font-semibold border-b border-gray-100 dark:border-white/5 pb-2">
                                    <th className="pb-2.5 font-bold">Kullanıcı</th>
                                    <th className="pb-2.5 font-bold">Birincil Platform / App</th>
                                    <th className="pb-2.5 font-bold">Toplam İşlem</th>
                                    <th className="pb-2.5 font-bold">Son Görülme</th>
                                    <th className="pb-2.5 font-bold text-right">Yolculuk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {powerUsers.map(user => {
                                    const time = formatTimestamp(user.lastSeen);
                                    return (
                                        <tr key={user.uid} className="hover:bg-violet-50/50 dark:hover:bg-zinc-800/50 transition">
                                            <td className="py-2.5 pr-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-violet-600/20 text-violet-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[140px]">{user.name}</div>
                                                        <div className="font-mono text-[10px] text-gray-400 truncate max-w-[120px]">{user.uid}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2.5 pr-3">
                                                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-semibold text-[11px] capitalize">
                                                    {user.primaryPlatform} • {user.primaryApp}
                                                </span>
                                            </td>
                                            <td className="py-2.5 pr-3">
                                                <span className="font-black text-gray-900 dark:text-white">{user.count}</span>
                                            </td>
                                            <td className="py-2.5 pr-3 text-gray-400 text-[11px]">
                                                {time.relative}
                                            </td>
                                            <td className="py-2.5 text-right">
                                                <button
                                                    onClick={() => setJourneyUserId(user.uid)}
                                                    className="px-2.5 py-1 bg-violet-500/10 hover:bg-violet-500 hover:text-white text-violet-600 dark:text-violet-400 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                                                    title="Kullanıcının yaptığı tüm adımları zaman tünelinde incele"
                                                >
                                                    <FaRoute className="text-[10px]" />
                                                    <span>Yolculuk</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Real-Time Live Activity Stream Ticker (1 col) */}
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-lg p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="font-bold text-base text-gray-900 dark:text-white">Canlı Olay Akışı</h3>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Canlı Telemetri</span>
                    </div>

                    <div className="space-y-3">
                        {liveStreamEvents.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 text-xs">Henüz olay gelmedi.</div>
                        ) : (
                            liveStreamEvents.map(eventLog => {
                                const time = formatTimestamp(eventLog.timestamp);
                                const user = usersMap[eventLog.uid];
                                return (
                                    <div
                                        key={eventLog.id}
                                        onClick={() => setSelectedLog(eventLog)}
                                        className="p-2.5 rounded-2xl bg-white/40 dark:bg-zinc-800/40 border border-gray-100 dark:border-white/5 hover:border-violet-500/30 transition cursor-pointer flex items-center justify-between gap-2"
                                    >
                                        <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getEventBadgeStyle(eventLog.event)}`}>
                                                    {eventLog.event}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 capitalize truncate">
                                                    {eventLog.app_name || "web"}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium truncate">
                                                {user?.name || eventLog.uid}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                                            {time.relative}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Smart Filters & Search Bar */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-4 md:p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-lg flex flex-col gap-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
                    {/* Search Input */}
                    <div className="lg:col-span-2 relative min-w-0">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="UID, IP, Olay, Uygulama, Ülke veya Sayfa ara..."
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

                    {/* Country Filter */}
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="px-3.5 py-2.5 bg-white dark:bg-black/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <option value="all">Tüm Ülkeler ({geoBreakdown.length})</option>
                        {geoBreakdown.map(g => (
                            <option key={g.code} value={g.code}>{g.flag} {g.name}</option>
                        ))}
                    </select>
                </div>

                {/* Date Pills & Filter Reset */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-white/5 w-full">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1">
                            <FaFilter className="text-[10px]" /> Süre:
                        </span>
                        {(["all", "today", "yesterday", "7d", "30d", "90d"] as const).map((range) => {
                            const labels: Record<string, string> = {
                                all: "Tümü",
                                today: "Bugün",
                                yesterday: "Dün",
                                "7d": "Son 7 Gün",
                                "30d": "Son 30 Gün",
                                "90d": "Son 90 Gün"
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
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden flex flex-col w-full">
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
                <div className="overflow-x-auto custom-scrollbar min-h-[350px] w-full">
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
                                    <th className="px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400">Kullanıcı / UID</th>
                                    <th className="px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400">Konum / IP</th>
                                    <th className="px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
                                {paginatedLogs.map((log) => {
                                    const timeInfo = formatTimestamp(log.timestamp);
                                    const platformInfo = getPlatformInfo(log.platform, log.user_agent);
                                    const PlatformIcon = platformInfo.icon;
                                    const eventBadgeStyle = getEventBadgeStyle(log.event);
                                    const rawCountry = log.metadata?.country;
                                    const resolvedCountry = log.ip_address ? resolvedGeoMap[log.ip_address] : null;
                                    const countryCode = rawCountry || resolvedCountry?.countryCode;
                                    const countryFlag = getCountryFlag(countryCode);

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
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 capitalize">
                                                    <FaLayerGroup className="text-[10px] text-violet-500" />
                                                    {log.app_name || "Bilinmiyor"}
                                                </span>
                                            </td>

                                            {/* Event */}
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${eventBadgeStyle}`}>
                                                    {log.event}
                                                </span>
                                                {log.metadata?.path && (
                                                    <span className="ml-2 font-mono text-[10px] text-gray-400 max-w-[120px] truncate inline-block align-middle">
                                                        {log.metadata.path}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Platform */}
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-semibold">
                                                    <PlatformIcon className="text-sm" />
                                                    <span className="capitalize">{platformInfo.name}</span>
                                                </span>
                                            </td>

                                            {/* UID / Kullanıcı */}
                                            <td className="px-5 py-3.5">
                                                {usersMap[log.uid] ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate max-w-[150px]" title={usersMap[log.uid].name}>
                                                                {usersMap[log.uid].name}
                                                            </span>
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 shrink-0">
                                                                Kayıtlı
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-mono text-[10px] text-gray-400 truncate max-w-[130px]" title={log.uid}>
                                                                {log.uid}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="font-mono text-[11px] text-gray-600 dark:text-gray-400 truncate max-w-[150px] inline-block" title={log.uid}>
                                                        {log.uid}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Geo / IP */}
                                            <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    {countryCode && <span className="text-sm">{countryFlag}</span>}
                                                    <span className="font-mono text-[11px]">
                                                        {log.metadata?.city ? `${log.metadata.city}, ` : ""}{log.ip_address || "-"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setJourneyUserId(log.uid)}
                                                        className="px-2 py-1 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-lg text-xs font-bold hover:bg-violet-100 transition"
                                                        title="Kullanıcının Yolculuğunu Gör"
                                                    >
                                                        Yolculuk
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold transition text-gray-700 dark:text-gray-300"
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

            {/* AI Insights Modal */}
            {showAiModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
                    onClick={() => !isAiLoading && setShowAiModal(false)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white flex items-center justify-center text-lg shadow-md shadow-violet-500/30 shrink-0">
                                    <FaRobot />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                        Gemini AI Analiz & İçgörü Raporu
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Kapsam: {selectedApp === "all" ? "Tüm Uygulamalar" : selectedApp} • Gerçek Zamanlı Telemetri Analizi
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowAiModal(false)}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                            {isAiLoading ? (
                                <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
                                    <FaMagic className="animate-spin text-3xl text-violet-500" />
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Gemini telemetri verilerinizi analiz ediyor...
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Trendler, anomali tespiti ve kullanıcı alışkanlıkları işleniyor.
                                    </p>
                                </div>
                            ) : aiInsights ? (
                                <div className="prose dark:prose-invert max-w-none text-xs space-y-3">
                                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                                        <FaShieldAlt className="shrink-0 text-emerald-500" />
                                        <span>
                                            Veriler AI&apos;ya gönderilmeden önce kişisel bilgilerden arındırıldı
                                            {aiRedactionCount > 0 ? ` (${aiRedactionCount} alan sansürlendi)` : " (yalnızca anonim toplu metrikler paylaşıldı)"}.
                                        </span>
                                    </div>
                                    <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed p-4 bg-gray-50/70 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-white/5">
                                        {aiInsights}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-400">Rapor üretilemedi.</div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 md:p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
                            {aiInsights && (
                                <button
                                    onClick={() => handleCopy(aiInsights, "ai-report")}
                                    className="px-4 py-2 bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold flex items-center gap-2 border border-gray-200 dark:border-zinc-600 transition"
                                >
                                    {copiedField === "ai-report" ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                                    <span>{copiedField === "ai-report" ? "Kopyalandı!" : "Raporu Kopyala"}</span>
                                </button>
                            )}

                            <button
                                onClick={() => setShowAiModal(false)}
                                className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-black dark:hover:bg-gray-200 transition ml-auto"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Journey Modal / Drawer */}
            {journeyUserId && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
                    onClick={() => setJourneyUserId(null)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-violet-600/10 to-indigo-600/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center text-lg shadow-md shadow-violet-500/30 shrink-0">
                                    <FaRoute />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                                        Kullanıcı Zaman Tüneli (User Journey)
                                    </h3>
                                    <p className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate">
                                        UID: {journeyUserId} ({userJourneyLogs.length} Adım)
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setJourneyUserId(null)}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Body: Chronological Timeline */}
                        <div className="p-5 md:p-6 overflow-y-auto space-y-4">
                            {userJourneyLogs.length === 0 ? (
                                <div className="py-8 text-center text-gray-400 text-xs">Bu kullanıcı için kayıt bulunamadı.</div>
                            ) : (
                                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-violet-500/30">
                                    {userJourneyLogs.map((jLog, idx) => {
                                        const prevLog = idx > 0 ? userJourneyLogs[idx - 1] : null;
                                        let diffSec = 0;
                                        if (prevLog) {
                                            const t1 = new Date(prevLog.timestamp).getTime();
                                            const t2 = new Date(jLog.timestamp).getTime();
                                            diffSec = Math.round((t2 - t1) / 1000);
                                        }

                                        return (
                                            <div key={jLog.id} className="relative group">
                                                <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-zinc-900 border-2 border-violet-600 group-hover:scale-125 transition" />
                                                <div className="bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-white/5 space-y-1.5">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getEventBadgeStyle(jLog.event)}`}>
                                                            {jLog.event}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-gray-400">
                                                            {new Date(jLog.timestamp).toLocaleTimeString("tr-TR")}
                                                            {diffSec > 0 && ` (+${diffSec}s)`}
                                                        </span>
                                                    </div>

                                                    <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                                        <span className="capitalize font-bold text-gray-900 dark:text-white mr-1.5">
                                                            {jLog.app_name || "web"}:
                                                        </span>
                                                        {jLog.metadata?.path || jLog.platform}
                                                    </div>

                                                    {jLog.metadata && Object.keys(jLog.metadata).length > 0 && (
                                                        <pre className="text-[10px] p-2 bg-white dark:bg-zinc-900 rounded-lg text-gray-500 overflow-x-auto">
                                                            {JSON.stringify(jLog.metadata)}
                                                        </pre>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 md:p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
                            <button
                                onClick={() => {
                                    setSearchQuery(journeyUserId);
                                    setJourneyUserId(null);
                                }}
                                className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition"
                            >
                                Bu Kullanıcıyı Listede Filtrele
                            </button>

                            <button
                                onClick={() => setJourneyUserId(null)}
                                className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold hover:bg-black dark:hover:bg-gray-200 transition"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Detail Modal (Inspector) */}
            {selectedLog && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
                    onClick={() => setSelectedLog(null)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
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

                        {/* Body */}
                        <div className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <span className="text-gray-400 font-semibold block mb-1">Uygulama</span>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm capitalize">
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

                            {/* User Info */}
                            <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5 space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="space-y-1">
                                        <span className="text-gray-400 font-semibold block">Kullanıcı Bilgisi</span>
                                        {usersMap[selectedLog.uid] ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {usersMap[selectedLog.uid].name}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300">
                                                        Kayıtlı Kullanıcı
                                                    </span>
                                                </div>
                                                {usersMap[selectedLog.uid].email && (
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {usersMap[selectedLog.uid].email}
                                                    </p>
                                                )}
                                                <p className="font-mono text-gray-600 dark:text-gray-400 select-all break-all text-[11px] pt-1">
                                                    UID: {selectedLog.uid}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="font-mono text-gray-800 dark:text-gray-200 select-all break-all">
                                                {selectedLog.uid}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleCopy(selectedLog.uid, "modal-uid")}
                                            className="px-3 py-1.5 bg-white dark:bg-zinc-700 rounded-xl font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-600 flex items-center gap-1.5"
                                        >
                                            {copiedField === "modal-uid" ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                                            <span>{copiedField === "modal-uid" ? "Kopyalandı" : "Kopyala"}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setJourneyUserId(selectedLog.uid);
                                                setSelectedLog(null);
                                            }}
                                            className="px-3 py-1.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition"
                                        >
                                            Yolculuk
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Geo & Network */}
                            <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5 space-y-2">
                                <span className="text-gray-400 font-semibold block">Ağ & Konum</span>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const currentIp = selectedLog.ip_address;
                                            const resolved = currentIp ? resolvedGeoMap[currentIp] : null;
                                            const code = selectedLog.metadata?.country || resolved?.countryCode;
                                            const name = selectedLog.metadata?.country
                                                ? (COUNTRY_NAMES[selectedLog.metadata.country.toUpperCase()] || selectedLog.metadata.country)
                                                : resolved ? (COUNTRY_NAMES[resolved.countryCode.toUpperCase()] || resolved.country) : null;
                                            const city = selectedLog.metadata?.city || resolved?.city;

                                            if (code && name) {
                                                return (
                                                    <>
                                                        <span className="text-2xl">{getCountryFlag(code)}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                {name}{city ? ` (${city})` : ""}
                                                            </span>
                                                            {!selectedLog.metadata?.country && resolved && (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                                    IP'den Çözüldü
                                                                </span>
                                                            )}
                                                        </div>
                                                    </>
                                                );
                                            }

                                            if (isResolvingIp) {
                                                return (
                                                    <span className="text-xs text-violet-500 font-semibold flex items-center gap-1.5">
                                                        <FaSync className="animate-spin text-xs" /> IP üzerinden konum sorgulanıyor...
                                                    </span>
                                                );
                                            }

                                            return (
                                                <>
                                                    <span className="text-xl">🌐</span>
                                                    <span className="font-bold text-gray-500">Bilinmiyor</span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <span className="font-mono text-gray-500">{selectedLog.ip_address || "IP yok"}</span>
                                </div>
                            </div>

                            {/* Metadata */}
                            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-white/5 space-y-2">
                                    <span className="text-gray-400 font-semibold block">Ekstra Telemetri Verisi (Metadata)</span>
                                    <pre className="p-3 bg-white dark:bg-zinc-900 rounded-xl font-mono text-[11px] text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-white/5 overflow-x-auto">
                                        {JSON.stringify(selectedLog.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Raw JSON */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 font-semibold">Ham JSON</span>
                                    <button
                                        onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2), "modal-json")}
                                        className="text-violet-600 dark:text-violet-400 font-bold hover:underline flex items-center gap-1"
                                    >
                                        {copiedField === "modal-json" ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                                        <span>{copiedField === "modal-json" ? "JSON Kopyalandı!" : "JSON Kopyala"}</span>
                                    </button>
                                </div>
                                <pre className="p-4 bg-gray-950 text-gray-200 rounded-2xl font-mono text-[11px] overflow-x-auto border border-gray-800">
                                    {JSON.stringify(selectedLog, null, 2)}
                                </pre>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 md:p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
                            <button
                                onClick={() => handleDeleteLog(selectedLog.id)}
                                disabled={deletingId === selectedLog.id}
                                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-xl font-bold flex items-center gap-2 transition"
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
