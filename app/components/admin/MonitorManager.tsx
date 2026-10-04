"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    FaServer,
    FaGlobe,
    FaDatabase,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSync,
    FaPlay,
    FaCopy,
    FaEye,
    FaEyeSlash,
    FaExternalLinkAlt,
    FaClock,
    FaSearch,
    FaCheck,
    FaTimes,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaBell,
    FaWifi,
    FaBolt,
    FaFilter,
} from "react-icons/fa";

export type MonitorTargetType = "supabase" | "website";

export interface MonitorProject {
    id: string;
    name: string;
    supabase_url: string;
    supabase_key?: string | null;
    type: MonitorTargetType;
    enabled: boolean;
    last_tested_at?: string | null;
    last_ping_ms?: number | null;
    last_status?: "ok" | "error" | "timeout" | null;
    last_error?: string | null;
    created_at?: string;
    updated_at?: string;
}

interface TestResult {
    status: "idle" | "testing" | "ok" | "error" | "timeout";
    duration?: number;
    error?: string;
    timestamp?: number;
}

interface MonitorManagerProps {
    authToken: string;
}

// Tarih formatlayıcı helper
function formatTestDate(dateStr?: string | null): string {
    if (!dateStr) return "Henüz test edilmedi";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "Bilinmeyen tarih";

        return d.toLocaleString("tr-TR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

export default function MonitorManager({ authToken }: MonitorManagerProps) {
    const [projects, setProjects] = useState<MonitorProject[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<"all" | "website" | "supabase">("all");
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingProject, setEditingProject] = useState<MonitorProject | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        type: MonitorTargetType;
        supabase_url: string;
        supabase_key: string;
        enabled: boolean;
    }>({
        name: "",
        type: "website",
        supabase_url: "",
        supabase_key: "",
        enabled: true,
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [modalTestResult, setModalTestResult] = useState<TestResult>({ status: "idle" });

    // Delete confirmation modal
    const [deletingProject, setDeletingProject] = useState<MonitorProject | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Visibility toggles for keys
    const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Health check results per project id (for live test status)
    const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
    const [isTestingAll, setIsTestingAll] = useState<boolean>(false);

    // Show temporary notification
    const showNotice = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    // Fetch projects from DB
    const fetchProjects = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        setIsRefreshing(true);
        try {
            const res = await fetch("/api/admin/monitor", {
                headers: { "x-auth-token": authToken },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setProjects(data.projects || []);
            } else {
                showNotice("error", data.error || "Projeler yüklenemedi.");
            }
        } catch {
            showNotice("error", "Bağlantı hatası: Projeler getirilemedi.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [authToken]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Copy to clipboard helper
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Toggle key visibility
    const toggleRevealKey = (id: string) => {
        setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Test a single project health
    const handleTestProject = async (project: MonitorProject) => {
        setTestResults((prev) => ({
            ...prev,
            [project.id]: { status: "testing" },
        }));

        try {
            const res = await fetch("/api/admin/monitor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken,
                },
                body: JSON.stringify({
                    action: "test",
                    id: project.id,
                    name: project.name,
                    type: project.type,
                    supabase_url: project.supabase_url,
                    supabase_key: project.supabase_key,
                    send_alert: true, // Hata durumunda alarm e-postası tetiklenir
                }),
            });
            const data = await res.json();

            const status = data.ok ? "ok" : data.status === "timeout" ? "timeout" : "error";
            const duration = data.duration;
            const error = data.error;

            setTestResults((prev) => ({
                ...prev,
                [project.id]: {
                    status,
                    duration,
                    error,
                    timestamp: Date.now(),
                },
            }));

            // Veritabanı ve yerel state'i güncelle (Son test tarihi & Ping süresi)
            setProjects((prev) =>
                prev.map((p) =>
                    p.id === project.id
                        ? {
                              ...p,
                              last_tested_at: data.last_tested_at || new Date().toISOString(),
                              last_ping_ms: duration !== undefined ? duration : p.last_ping_ms,
                              last_status: status,
                              last_error: error || null,
                          }
                        : p,
                ),
            );

            if (!data.ok) {
                showNotice(
                    "error",
                    `"${project.name}" olumsuz yanıt verdi! Hata alarm e-postası gönderildi.`,
                );
            }
        } catch {
            setTestResults((prev) => ({
                ...prev,
                [project.id]: {
                    status: "error",
                    error: "Ağ bağlantı hatası",
                    timestamp: Date.now(),
                },
            }));
            showNotice("error", `"${project.name}" için ağ bağlantısı sağlanamadı.`);
        }
    };

    // Test all enabled projects
    const handleTestAll = async () => {
        const activeProjects = projects.filter((p) => p.enabled);
        if (activeProjects.length === 0) {
            showNotice("error", "Test edilecek aktif proje/site bulunamadı.");
            return;
        }

        setIsTestingAll(true);
        for (const project of activeProjects) {
            await handleTestProject(project);
        }
        setIsTestingAll(false);
        showNotice("success", "Tüm aktif hedeflerin kontrolü tamamlandı ve kayıtlar güncellendi.");
    };

    // Toggle enabled / disabled
    const handleToggleEnabled = async (project: MonitorProject) => {
        const newStatus = !project.enabled;

        // Optimistic UI update
        setProjects((prev) =>
            prev.map((p) => (p.id === project.id ? { ...p, enabled: newStatus } : p)),
        );

        try {
            const res = await fetch("/api/admin/monitor", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken,
                },
                body: JSON.stringify({
                    id: project.id,
                    enabled: newStatus,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showNotice(
                    "success",
                    `"${project.name}" ${newStatus ? "aktif" : "pasif"} duruma getirildi.`,
                );
            } else {
                // Rollback
                setProjects((prev) =>
                    prev.map((p) =>
                        p.id === project.id ? { ...p, enabled: project.enabled } : p,
                    ),
                );
                showNotice("error", data.error || "Güncelleme başarısız.");
            }
        } catch {
            // Rollback
            setProjects((prev) =>
                prev.map((p) =>
                    p.id === project.id ? { ...p, enabled: project.enabled } : p,
                ),
            );
            showNotice("error", "Bağlantı hatası.");
        }
    };

    // Open Modal for Add or Edit
    const handleOpenModal = (project?: MonitorProject) => {
        setModalTestResult({ status: "idle" });
        if (project) {
            setEditingProject(project);
            setFormData({
                name: project.name,
                type: project.type || "supabase",
                supabase_url: project.supabase_url,
                supabase_key: project.supabase_key || "",
                enabled: project.enabled,
            });
        } else {
            setEditingProject(null);
            setFormData({
                name: "",
                type: "website", // Varsayılan olarak Web Sitesi
                supabase_url: "",
                supabase_key: "",
                enabled: true,
            });
        }
        setIsModalOpen(true);
    };

    // Test credentials/URL inside Modal
    const handleModalTest = async () => {
        if (!formData.supabase_url) {
            setModalTestResult({
                status: "error",
                error: "URL adresini doldurun.",
            });
            return;
        }

        if (formData.type === "supabase" && !formData.supabase_key) {
            setModalTestResult({
                status: "error",
                error: "Supabase projeleri için Key alanı zorunludur.",
            });
            return;
        }

        setModalTestResult({ status: "testing" });
        try {
            const res = await fetch("/api/admin/monitor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken,
                },
                body: JSON.stringify({
                    action: "test",
                    type: formData.type,
                    supabase_url: formData.supabase_url,
                    supabase_key: formData.supabase_key,
                    send_alert: false, // Önizleme testinde e-posta atılmaz
                }),
            });
            const data = await res.json();
            setModalTestResult({
                status: data.ok ? "ok" : data.status === "timeout" ? "timeout" : "error",
                duration: data.duration,
                error: data.error,
            });
        } catch {
            setModalTestResult({
                status: "error",
                error: "Bağlantı sağlanamadı.",
            });
        }
    };

    // Submit Add or Edit Form
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.supabase_url.trim()) {
            showNotice("error", "Lütfen tüm zorunlu alanları doldurun.");
            return;
        }

        if (formData.type === "supabase" && !formData.supabase_key.trim()) {
            showNotice("error", "Supabase projeleri için Key alanı zorunludur.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingProject) {
                // Update
                const res = await fetch("/api/admin/monitor", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": authToken,
                    },
                    body: JSON.stringify({
                        id: editingProject.id,
                        name: formData.name,
                        type: formData.type,
                        supabase_url: formData.supabase_url,
                        supabase_key: formData.type === "website" ? null : formData.supabase_key,
                        enabled: formData.enabled,
                    }),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    showNotice("success", `"${formData.name}" başarıyla güncellendi.`);
                    setIsModalOpen(false);
                    fetchProjects(true);
                } else {
                    showNotice("error", data.error || "Güncelleme hatası.");
                }
            } else {
                // Create
                const res = await fetch("/api/admin/monitor", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": authToken,
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        type: formData.type,
                        supabase_url: formData.supabase_url,
                        supabase_key: formData.type === "website" ? null : formData.supabase_key,
                        enabled: formData.enabled,
                    }),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    showNotice("success", `"${formData.name}" başarıyla eklendi.`);
                    setIsModalOpen(false);
                    fetchProjects(true);
                } else {
                    showNotice("error", data.error || "Ekleme hatası.");
                }
            }
        } catch {
            showNotice("error", "Sunucu ile iletişim kurulamadı.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Project
    const handleDeleteProject = async () => {
        if (!deletingProject) return;

        setIsDeleting(true);
        try {
            const res = await fetch("/api/admin/monitor", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken,
                },
                body: JSON.stringify({ id: deletingProject.id }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showNotice("success", `"${deletingProject.name}" silindi.`);
                setDeletingProject(null);
                fetchProjects(true);
            } else {
                showNotice("error", data.error || "Silme işlemi başarısız.");
            }
        } catch {
            showNotice("error", "Bağlantı hatası.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter projects
    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            const matchesSearch =
                !searchQuery.trim() ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.supabase_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType =
                typeFilter === "all" ||
                (typeFilter === "website" && p.type === "website") ||
                (typeFilter === "supabase" && (p.type === "supabase" || !p.type));

            return matchesSearch && matchesType;
        });
    }, [projects, searchQuery, typeFilter]);

    const activeCount = projects.filter((p) => p.enabled).length;
    const websiteCount = projects.filter((p) => p.type === "website").length;
    const supabaseCount = projects.filter((p) => p.type === "supabase" || !p.type).length;

    // Ping süresi ortalaması
    const validPings = projects.filter((p) => typeof p.last_ping_ms === "number" && p.last_ping_ms! > 0);
    const avgPing =
        validPings.length > 0
            ? Math.round(validPings.reduce((acc, curr) => acc + (curr.last_ping_ms || 0), 0) / validPings.length)
            : null;

    return (
        <div className="flex flex-col gap-6">
            {/* Notification Toast */}
            {notification && (
                <div
                    className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 transition-all animate-bounce ${
                        notification.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                    }`}
                >
                    {notification.type === "success" ? (
                        <FaCheckCircle className="text-xl shrink-0" />
                    ) : (
                        <FaTimesCircle className="text-xl shrink-0" />
                    )}
                    <span className="text-sm font-semibold">{notification.message}</span>
                </div>
            )}

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Targets Card */}
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Toplam İzlenen
                        </p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                {projects.length}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({websiteCount} Site, {supabaseCount} Supabase)
                            </span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xl">
                        <FaServer />
                    </div>
                </div>

                {/* Active Card */}
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Aktif Canlı İzleme
                            </p>
                        </div>
                        <p className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
                            {activeCount}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                        <FaCheck />
                    </div>
                </div>

                {/* Average Ping Card */}
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Ortalama Yanıt (Ping)
                        </p>
                        <p className="text-2xl font-extrabold mt-1 text-cyan-600 dark:text-cyan-400">
                            {avgPing !== null ? `${avgPing} ms` : "—"}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xl">
                        <FaWifi />
                    </div>
                </div>

                {/* Resend Email Alerts Card */}
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Kesinti Bildirimi
                        </p>
                        <p className="text-sm font-bold mt-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <FaBell className="text-emerald-500" /> Resend E-Posta Aktif
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center text-xl">
                        <FaBell />
                    </div>
                </div>
            </div>

            {/* Controls Header & Type Filter */}
            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                    <div className="relative w-full md:w-72">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="İsim veya URL ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-transparent focus:border-violet-500 focus:outline-none text-sm transition-all placeholder-gray-400"
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="hidden sm:flex items-center bg-gray-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-bold">
                        <button
                            onClick={() => setTypeFilter("all")}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                typeFilter === "all"
                                    ? "bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            Tümü ({projects.length})
                        </button>
                        <button
                            onClick={() => setTypeFilter("website")}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                typeFilter === "website"
                                    ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            <FaGlobe className="text-xs" /> Web ({websiteCount})
                        </button>
                        <button
                            onClick={() => setTypeFilter("supabase")}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                typeFilter === "supabase"
                                    ? "bg-white dark:bg-zinc-700 shadow-sm text-violet-600 dark:text-violet-400"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            <FaBolt className="text-xs" /> Supabase ({supabaseCount})
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
                    <button
                        onClick={() => fetchProjects(false)}
                        disabled={isRefreshing}
                        className="p-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                        title="Yenile"
                    >
                        <FaSync className={isRefreshing ? "animate-spin" : ""} />
                    </button>

                    <button
                        onClick={handleTestAll}
                        disabled={isTestingAll || activeCount === 0}
                        className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                        <FaPlay className={isTestingAll ? "animate-pulse" : "text-xs"} />
                        <span>{isTestingAll ? "Tümü Sınanıyor..." : "Tümünü Sına"}</span>
                    </button>

                    <button
                        onClick={() => handleOpenModal()}
                        className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                        <FaPlus />
                        <span>Yeni Hedef Ekle</span>
                    </button>
                </div>
            </div>

            {/* Projects / Sites List */}
            {isLoading ? (
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-12 rounded-2xl border border-white/20 shadow-sm flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-gray-500">Hedefler yükleniyor...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-12 rounded-2xl border border-white/20 shadow-sm flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-2xl text-gray-400">
                        <FaServer />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {searchQuery ? "Eşleşen hedef bulunamadı" : "Henüz izlenen hedef yok"}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-sm mt-1">
                            {searchQuery
                                ? "Farklı bir arama terimi deneyin."
                                : "Web sitelerinizi ve Supabase projelerinizi kesintilere karşı 7/24 izlemek için ilk hedefinizi ekleyin."}
                        </p>
                    </div>
                    {!searchQuery && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                        >
                            <FaPlus /> İlk Hedefi Ekle
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredProjects.map((project) => {
                        const test = testResults[project.id];
                        const isRevealed = Boolean(revealedKeys[project.id]);
                        const isWebsite = project.type === "website";

                        // Anlık veya DB'deki son durum
                        const currentStatus = test?.status !== undefined && test.status !== "idle"
                            ? test.status
                            : project.last_status;
                        const currentDuration = test?.duration !== undefined
                            ? test.duration
                            : project.last_ping_ms;
                        const currentError = test?.error !== undefined
                            ? test.error
                            : project.last_error;

                        return (
                            <div
                                key={project.id}
                                className={`bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-5 rounded-2xl border transition-all duration-200 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden ${
                                    project.enabled
                                        ? currentStatus === "error"
                                            ? "border-red-500/40 bg-red-50/10"
                                            : "border-white/20 hover:border-violet-500/40"
                                        : "border-gray-200/50 dark:border-zinc-800/80 opacity-75 hover:opacity-100"
                                }`}
                            >
                                {/* Top row: Name, Type Badge, status toggle, actions */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Type Icon Badge */}
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1.5 ${
                                                    isWebsite
                                                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                                        : "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                                                }`}
                                            >
                                                {isWebsite ? <FaGlobe className="text-xs" /> : <FaBolt className="text-xs" />}
                                                {isWebsite ? "Web Sitesi" : "Supabase"}
                                            </span>

                                            <h3 className="text-lg font-extrabold truncate text-gray-900 dark:text-white">
                                                {project.name}
                                            </h3>

                                            {/* Active / Passive Badge */}
                                            <span
                                                className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1.5 ${
                                                    project.enabled
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                        : "bg-gray-200 dark:bg-zinc-800 text-gray-500 border border-transparent"
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        project.enabled
                                                            ? "bg-emerald-500 animate-pulse"
                                                            : "bg-gray-400"
                                                    }`}
                                                />
                                                {project.enabled ? "Aktif" : "Pasif"}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-400 font-mono mt-1 truncate">
                                            ID: {project.id}
                                        </p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {/* Toggle Active Switch */}
                                        <button
                                            onClick={() => handleToggleEnabled(project)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                                project.enabled
                                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                                    : "bg-gray-100 dark:bg-zinc-800 border-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
                                            }`}
                                            title={project.enabled ? "Pasife Al" : "Aktif Et"}
                                        >
                                            {project.enabled ? "Aktif" : "Pasif"}
                                        </button>

                                        {/* Edit Button */}
                                        <button
                                            onClick={() => handleOpenModal(project)}
                                            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-sm transition-all"
                                            title="Düzenle"
                                        >
                                            <FaEdit />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => setDeletingProject(project)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm transition-all"
                                            title="Sil"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                {/* URL & Supabase Key (if applicable) Details */}
                                <div className="space-y-2 bg-gray-50/80 dark:bg-black/30 p-3 rounded-xl border border-gray-100 dark:border-zinc-800/60 text-xs">
                                    {/* URL */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-gray-400 font-semibold w-12 flex-shrink-0">
                                            URL:
                                        </span>
                                        <a
                                            href={project.supabase_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono text-gray-700 dark:text-zinc-300 truncate hover:text-violet-500 transition-colors flex-1"
                                        >
                                            {project.supabase_url}
                                        </a>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() =>
                                                    handleCopy(project.supabase_url, `url-${project.id}`)
                                                }
                                                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
                                                title="URL Kopyala"
                                            >
                                                {copiedId === `url-${project.id}` ? (
                                                    <FaCheck className="text-emerald-500" />
                                                ) : (
                                                    <FaCopy />
                                                )}
                                            </button>
                                            <a
                                                href={project.supabase_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
                                                title="Tarayıcıda Aç"
                                            >
                                                <FaExternalLinkAlt className="text-[10px]" />
                                            </a>
                                        </div>
                                    </div>

                                    {/* Key (Only for Supabase) */}
                                    {!isWebsite && (
                                        <div className="flex items-center justify-between gap-2 border-t border-gray-200/50 dark:border-zinc-800/50 pt-1.5">
                                            <span className="text-gray-400 font-semibold w-12 flex-shrink-0">
                                                Key:
                                            </span>
                                            <span className="font-mono text-gray-700 dark:text-zinc-300 truncate flex-1 select-all">
                                                {isRevealed
                                                    ? project.supabase_key || "—"
                                                    : "•".repeat(24)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleRevealKey(project.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
                                                    title={isRevealed ? "Gizle" : "Göster"}
                                                >
                                                    {isRevealed ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleCopy(
                                                            project.supabase_key || "",
                                                            `key-${project.id}`,
                                                        )
                                                    }
                                                    className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
                                                    title="Key Kopyala"
                                                >
                                                    {copiedId === `key-${project.id}` ? (
                                                        <FaCheck className="text-emerald-500" />
                                                    ) : (
                                                        <FaCopy />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Metrics Section: Son Test Tarihi & Ping Süresi */}
                                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/50 dark:bg-zinc-800/30 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800/40">
                                    <div>
                                        <span className="text-gray-400 font-semibold block text-[11px]">
                                            Son Test Tarihi:
                                        </span>
                                        <span className="font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1 mt-0.5">
                                            <FaClock className="text-[10px] text-gray-400" />
                                            {formatTestDate(project.last_tested_at)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 font-semibold block text-[11px]">
                                            Ping Süresi:
                                        </span>
                                        <span className="font-medium mt-0.5 inline-flex items-center gap-1.5">
                                            {currentDuration !== null && currentDuration !== undefined ? (
                                                <span
                                                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                                        currentDuration < 300
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                            : currentDuration < 800
                                                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                    }`}
                                                >
                                                    {currentDuration} ms
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Last Error Message Alert (if present) */}
                                {currentError && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-2 rounded-xl text-xs flex items-center gap-2">
                                        <FaExclamationTriangle className="shrink-0 text-sm" />
                                        <span className="truncate">{currentError}</span>
                                    </div>
                                )}

                                {/* Footer: Test Results & Test Button */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                                    <div className="flex items-center gap-2 text-xs">
                                        {test?.status === "testing" ? (
                                            <span className="flex items-center gap-1.5 text-violet-500 font-medium">
                                                <FaSync className="animate-spin text-xs" />
                                                Kontrol yapılıyor...
                                            </span>
                                        ) : currentStatus === "ok" ? (
                                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                                <FaCheckCircle />
                                                Çalışıyor ({currentDuration || 0}ms)
                                            </span>
                                        ) : currentStatus === "timeout" ? (
                                            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg">
                                                <FaClock />
                                                Zaman Aşımı (10s)
                                            </span>
                                        ) : currentStatus === "error" ? (
                                            <span
                                                className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold bg-red-500/10 px-2.5 py-1 rounded-lg truncate max-w-[200px]"
                                                title={currentError || "Hata"}
                                            >
                                                <FaTimesCircle />
                                                {currentError || "Hata"}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 font-medium flex items-center gap-1">
                                                <FaClock className="text-[10px]" />
                                                Henüz sınanmadı
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleTestProject(project)}
                                        disabled={test?.status === "testing"}
                                        className="px-3.5 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <FaPlay className="text-[10px]" />
                                        <span>Sına</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-white/20 shadow-2xl p-6 md:p-8 flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center text-lg">
                                    {editingProject ? <FaEdit /> : <FaPlus />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {editingProject ? "Hedefi Düzenle" : "Yeni İzleme Hedefi Ekle"}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Web sitesi HTTP pingleme veya Supabase veritabanı kontrolü
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                            {/* Hedef Türü Seçimi (Web Sitesi vs Supabase) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Hedef Türü *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Web Sitesi Seçeneği */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                type: "website",
                                            }))
                                        }
                                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                                            formData.type === "website"
                                                ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
                                                : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                                        }`}
                                    >
                                        <div
                                            className={`p-2 rounded-lg text-lg ${
                                                formData.type === "website"
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100 dark:bg-zinc-800 text-gray-500"
                                            }`}
                                        >
                                            <FaGlobe />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                Web Sitesi / URL
                                            </p>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                                HTTP durum kodu ve ping takibi
                                            </p>
                                        </div>
                                    </button>

                                    {/* Supabase Seçeneği */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                type: "supabase",
                                            }))
                                        }
                                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                                            formData.type === "supabase"
                                                ? "border-violet-500 bg-violet-50/20 dark:bg-violet-950/20 ring-2 ring-violet-500/20"
                                                : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                                        }`}
                                    >
                                        <div
                                            className={`p-2 rounded-lg text-lg ${
                                                formData.type === "supabase"
                                                    ? "bg-violet-500 text-white"
                                                    : "bg-gray-100 dark:bg-zinc-800 text-gray-500"
                                            }`}
                                        >
                                            <FaBolt />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                Supabase Projesi
                                            </p>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                                RPC sağlık kontrolü ve uyandırma
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Hedef Adı */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    {formData.type === "website" ? "Site veya Servis Adı *" : "Proje Adı *"}
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={
                                        formData.type === "website"
                                            ? "Örn: KeremKK Portföy veya API Sunucusu"
                                            : "Örn: Proje-1 veya Egl-Yıllık DB"
                                    }
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-medium transition-all"
                                />
                            </div>

                            {/* URL */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    {formData.type === "website" ? "Web Sitesi URL *" : "Supabase URL *"}
                                </label>
                                <input
                                    type="url"
                                    required
                                    placeholder={
                                        formData.type === "website"
                                            ? "https://keremkk.com.tr"
                                            : "https://xxxxxxxx.supabase.co"
                                    }
                                    value={formData.supabase_url}
                                    onChange={(e) =>
                                        setFormData({ ...formData, supabase_url: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono transition-all"
                                />
                            </div>

                            {/* Supabase Key (Sadece Supabase seçili ise) */}
                            {formData.type === "supabase" ? (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Supabase Key (Anon / Publishable) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="sb_publishable_... veya anon JWT"
                                        value={formData.supabase_key}
                                        onChange={(e) =>
                                            setFormData({ ...formData, supabase_key: e.target.value })
                                        }
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono transition-all"
                                    />
                                </div>
                            ) : (
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                    <FaGlobe className="shrink-0 text-base" />
                                    <span>
                                        Web siteleri için HTTP GET isteği ile yanıt kodu ve ping ölçülür. API anahtarı gerekmez.
                                    </span>
                                </div>
                            )}

                            {/* Enabled Switch */}
                            <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                                        İzleme Durumu
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Aktif hedefler periyodik olarak kontrol edilir ve kesintide e-posta gönderilir
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({ ...formData, enabled: !formData.enabled })
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        formData.enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-zinc-700"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            formData.enabled ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Connection Test before Save */}
                            <div className="flex items-center justify-between gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={handleModalTest}
                                    disabled={
                                        modalTestResult.status === "testing" ||
                                        !formData.supabase_url ||
                                        (formData.type === "supabase" && !formData.supabase_key)
                                    }
                                    className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <FaPlay className="text-[10px]" />
                                    <span>
                                        {modalTestResult.status === "testing"
                                            ? "Sınanıyor..."
                                            : "Bağlantıyı Sına"}
                                    </span>
                                </button>

                                {modalTestResult.status === "ok" && (
                                    <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                        <FaCheckCircle /> Yanıt Alındı ({modalTestResult.duration}ms)
                                    </span>
                                )}
                                {modalTestResult.status === "error" && (
                                    <span
                                        className="text-xs text-red-500 font-bold flex items-center gap-1 truncate max-w-[200px]"
                                        title={modalTestResult.error}
                                    >
                                        <FaTimesCircle /> {modalTestResult.error || "Hata"}
                                    </span>
                                )}
                                {modalTestResult.status === "timeout" && (
                                    <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                                        <FaClock /> Zaman aşımı (10s)
                                    </span>
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSync className="animate-spin text-xs" />
                                            <span>Kaydediliyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck />
                                            <span>{editingProject ? "Güncelle" : "Kaydet"}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-white/20 shadow-2xl p-6 md:p-8 flex flex-col items-center text-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center text-2xl">
                            <FaExclamationTriangle />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Hedefi Silmek İstiyor musunuz?
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    "{deletingProject.name}"
                                </span>{" "}
                                tablodan kalıcı olarak silinecek ve artık sağlık kontrolü ile
                                ping izlemesi yapılmayacaktır.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full mt-2">
                            <button
                                onClick={() => setDeletingProject(null)}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-sm transition-all"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleDeleteProject}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <FaSync className="animate-spin text-xs" />
                                        <span>Siliniyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaTrash />
                                        <span>Evet, Sil</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
