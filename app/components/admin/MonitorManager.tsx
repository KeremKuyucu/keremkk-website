"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    FaServer,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSync,
    FaPlay,
    FaCopy,
    FaEye,
    FaEyeSlash,
    FaExternalLinkAlt,
    FaShieldAlt,
    FaClock,
    FaSearch,
    FaCheck,
    FaTimes,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
} from "react-icons/fa";

export interface MonitorProject {
    id: string;
    name: string;
    supabase_url: string;
    supabase_key: string;
    enabled: boolean;
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

export default function MonitorManager({ authToken }: MonitorManagerProps) {
    const [projects, setProjects] = useState<MonitorProject[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingProject, setEditingProject] = useState<MonitorProject | null>(null);
    const [formData, setFormData] = useState({
        name: "",
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

    // Health check results per project id
    const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
    const [isTestingAll, setIsTestingAll] = useState<boolean>(false);

    // Show temporary notification
    const showNotice = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
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
                    supabase_url: project.supabase_url,
                    supabase_key: project.supabase_key,
                }),
            });
            const data = await res.json();

            setTestResults((prev) => ({
                ...prev,
                [project.id]: {
                    status: data.ok ? "ok" : data.status === "timeout" ? "timeout" : "error",
                    duration: data.duration,
                    error: data.error,
                    timestamp: Date.now(),
                },
            }));
        } catch {
            setTestResults((prev) => ({
                ...prev,
                [project.id]: {
                    status: "error",
                    error: "Ağ bağlantı hatası",
                    timestamp: Date.now(),
                },
            }));
        }
    };

    // Test all enabled projects
    const handleTestAll = async () => {
        const activeProjects = projects.filter((p) => p.enabled);
        if (activeProjects.length === 0) {
            showNotice("error", "Test edilecek aktif proje bulunamadı.");
            return;
        }

        setIsTestingAll(true);
        await Promise.all(activeProjects.map((p) => handleTestProject(p)));
        setIsTestingAll(false);
        showNotice("success", "Tüm aktif projelerin sağlık kontrolü tamamlandı.");
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
                supabase_url: project.supabase_url,
                supabase_key: project.supabase_key,
                enabled: project.enabled,
            });
        } else {
            setEditingProject(null);
            setFormData({
                name: "",
                supabase_url: "",
                supabase_key: "",
                enabled: true,
            });
        }
        setIsModalOpen(true);
    };

    // Test credentials inside Modal
    const handleModalTest = async () => {
        if (!formData.supabase_url || !formData.supabase_key) {
            setModalTestResult({
                status: "error",
                error: "URL ve Key alanlarını doldurun.",
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
                    supabase_url: formData.supabase_url,
                    supabase_key: formData.supabase_key,
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
        if (!formData.name.trim() || !formData.supabase_url.trim() || !formData.supabase_key.trim()) {
            showNotice("error", "Lütfen tüm zorunlu alanları doldurun.");
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
                        ...formData,
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
                    body: JSON.stringify(formData),
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
        if (!searchQuery.trim()) return projects;
        const q = searchQuery.toLowerCase();
        return projects.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.supabase_url.toLowerCase().includes(q) ||
                p.id.toLowerCase().includes(q),
        );
    }, [projects, searchQuery]);

    const activeCount = projects.filter((p) => p.enabled).length;
    const passiveCount = projects.length - activeCount;

    return (
        <div className="flex flex-col gap-6">
            {/* Notification Toast */}
            {notification && (
                <div
                    className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 transition-all animate-bounce ${
                        notification.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                    }`}
                >
                    {notification.type === "success" ? (
                        <FaCheckCircle className="text-lg" />
                    ) : (
                        <FaTimesCircle className="text-lg" />
                    )}
                    <span className="text-sm font-semibold">{notification.message}</span>
                </div>
            )}

            {/* Top Stats & Actions Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Card */}
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Toplam Proje
                        </p>
                        <p className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">
                            {projects.length}
                        </p>
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
                                Aktif İzlenen
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

                {/* Passive Card */}
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Pasif / Beklemede
                        </p>
                        <p className="text-2xl font-extrabold mt-1 text-amber-600 dark:text-amber-400">
                            {passiveCount}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
                        <FaTimes />
                    </div>
                </div>

                {/* Security Card */}
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Güvenlik Seviyesi
                        </p>
                        <p className="text-sm font-bold mt-1 text-gray-900 dark:text-white flex items-center gap-1.5">
                            <FaShieldAlt className="text-emerald-500" /> RLS Aktif (Admin)
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                        <FaShieldAlt />
                    </div>
                </div>
            </div>

            {/* Controls Header */}
            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-80">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="İsim veya URL ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-transparent focus:border-violet-500 focus:outline-none text-sm transition-all placeholder-gray-400"
                    />
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
                        <span>{isTestingAll ? "Test Ediliyor..." : "Tümünü Sına"}</span>
                    </button>

                    <button
                        onClick={() => handleOpenModal()}
                        className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                        <FaPlus />
                        <span>Yeni Proje Ekle</span>
                    </button>
                </div>
            </div>

            {/* Projects List */}
            {isLoading ? (
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-12 rounded-2xl border border-white/20 shadow-sm flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-gray-500">Projeler yükleniyor...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-12 rounded-2xl border border-white/20 shadow-sm flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-2xl text-gray-400">
                        <FaServer />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {searchQuery ? "Eşleşen proje bulunamadı" : "Henüz izlenen proje yok"}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-sm mt-1">
                            {searchQuery
                                ? "Farklı bir arama terimi deneyin."
                                : "Supabase projelerinizi 24 saatte bir kontrol etmek ve uykuya geçmelerini önlemek için ilk projenizi ekleyin."}
                        </p>
                    </div>
                    {!searchQuery && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                        >
                            <FaPlus /> İlk Projeyi Ekle
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredProjects.map((project) => {
                        const test = testResults[project.id];
                        const isRevealed = Boolean(revealedKeys[project.id]);

                        return (
                            <div
                                key={project.id}
                                className={`bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-5 rounded-2xl border transition-all duration-200 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden ${
                                    project.enabled
                                        ? "border-white/20 hover:border-violet-500/40"
                                        : "border-gray-200/50 dark:border-zinc-800/80 opacity-75 hover:opacity-100"
                                }`}
                            >
                                {/* Top row: Name, status toggle, actions */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <h3 className="text-lg font-extrabold truncate text-gray-900 dark:text-white">
                                                {project.name}
                                            </h3>

                                            {/* Status Badge */}
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
                                    <div className="flex items-center gap-1.5">
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

                                {/* URL & Key Details */}
                                <div className="space-y-2.5 bg-gray-50/80 dark:bg-black/30 p-3.5 rounded-xl border border-gray-100 dark:border-zinc-800/60 text-xs">
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

                                    {/* Key */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-gray-400 font-semibold w-12 flex-shrink-0">
                                            Key:
                                        </span>
                                        <span className="font-mono text-gray-700 dark:text-zinc-300 truncate flex-1 select-all">
                                            {isRevealed
                                                ? project.supabase_key
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
                                                    handleCopy(project.supabase_key, `key-${project.id}`)
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
                                </div>

                                {/* Footer: Test Results & Test Button */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                                    <div className="flex items-center gap-2 text-xs">
                                        {test?.status === "testing" ? (
                                            <span className="flex items-center gap-1.5 text-violet-500 font-medium">
                                                <FaSync className="animate-spin text-xs" />
                                                Sağlık kontrolü yapılıyor...
                                            </span>
                                        ) : test?.status === "ok" ? (
                                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                                <FaCheckCircle />
                                                Çalışıyor ({test.duration}ms)
                                            </span>
                                        ) : test?.status === "timeout" ? (
                                            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg">
                                                <FaClock />
                                                Zaman Aşımı (10s)
                                            </span>
                                        ) : test?.status === "error" ? (
                                            <span
                                                className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold bg-red-500/10 px-2.5 py-1 rounded-lg truncate max-w-[200px]"
                                                title={test.error}
                                            >
                                                <FaTimesCircle />
                                                {test.error || "Hata"}
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
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
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
                    <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-white/20 shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center text-lg">
                                    {editingProject ? <FaEdit /> : <FaPlus />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {editingProject ? "Projeyi Düzenle" : "Yeni Proje Ekle"}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Supabase veritabanı izleme parametreleri
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
                            {/* Proje Adı */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Proje Adı *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Örn: Proje-1 veya Kerem Website"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-medium transition-all"
                                />
                            </div>

                            {/* Supabase URL */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Supabase URL *
                                </label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://xxxxxxxx.supabase.co"
                                    value={formData.supabase_url}
                                    onChange={(e) =>
                                        setFormData({ ...formData, supabase_url: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono transition-all"
                                />
                            </div>

                            {/* Supabase Key */}
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

                            {/* Enabled Switch */}
                            <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                                        İzleme Durumu
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Aktif projeler 24 saatte bir otomatik cron ile kontrol edilir
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
                            <div className="flex items-center justify-between gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleModalTest}
                                    disabled={
                                        modalTestResult.status === "testing" ||
                                        !formData.supabase_url ||
                                        !formData.supabase_key
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
                                        <FaCheckCircle /> Başarılı ({modalTestResult.duration}ms)
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
                                        <FaClock /> Zaman aşımı
                                    </span>
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
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
                                Projeyi Silmek İstiyor musunuz?
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    "{deletingProject.name}"
                                </span>{" "}
                                tablodan kalıcı olarak silinecek ve artık sağlık kontrolü
                                yapılmayacaktır.
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
