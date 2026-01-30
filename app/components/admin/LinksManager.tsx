"use client";
import { useState, useEffect, useCallback } from "react";
import { FaExternalLinkAlt, FaTrash, FaCopy, FaPlus, FaGlobe, FaChartBar, FaEdit, FaTimes } from "react-icons/fa";

interface Redirect {
    slug: string;
    destination: string;
    clicks: number;
    createdAt?: number;
    lastClickedAt?: number;
}

const REDIRECT_PREFIX = "/r/"; // ✅ burada değiştir

export default function LinksManager({ authToken }: { authToken: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [redirects, setRedirects] = useState<Redirect[]>([]);

    // Form
    const [newSlug, setNewSlug] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [editingSlug, setEditingSlug] = useState<string | null>(null);

    const showStatus = useCallback((msg: string, duration = 3000) => {
        setStatus(msg);
        setTimeout(() => setStatus(""), duration);
    }, []);

    const fetchRedirects = useCallback(async () => {
        try {
            const res = await fetch("/api/redirects", {
                headers: { "x-sync-token": authToken }
            });
            if (res.ok) {
                const data = await res.json();
                setRedirects(data.redirects || []);
            }
        } catch (error) {
            console.error(error);
        }
    }, [authToken]);

    useEffect(() => {
        fetchRedirects();
    }, [fetchRedirects]);

    const normalizeSlug = (s: string) => {
        // Kullanıcı yanlışlıkla "/r/foo" ya da "/foo" yazarsa temizle
        let v = (s || "").trim();
        v = v.replace(/^https?:\/\/[^/]+/i, ""); // domain yazarsa sil
        v = v.replace(/^\/+/, "");               // baştaki slash'ları sil
        if (v.startsWith("r/")) v = v.slice(2);  // "r/" prefix'i varsa sil
        return v.replace(/\s+/g, "-");           // boşluk -> tire (isteğe bağlı)
    };

    const getPublicLink = (slug: string) => {
        const s = normalizeSlug(slug);
        return `${window.location.origin}${REDIRECT_PREFIX}${s}`;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const slug = normalizeSlug(newSlug);
        const url = newUrl.trim();
        if (!slug || !url) return;

        setIsLoading(true);
        try {
            const method = editingSlug ? "PATCH" : "POST";
            const res = await fetch("/api/redirects", {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "x-sync-token": authToken
                },
                body: JSON.stringify({ slug, destination: url })
            });

            if (res.ok) {
                showStatus(editingSlug ? "✓ Link güncellendi" : "✓ Link oluşturuldu");
                setNewSlug("");
                setNewUrl("");
                setEditingSlug(null);
                fetchRedirects();
            } else {
                showStatus("❌ İşlem başarısız");
            }
        } catch (error) {
            showStatus("⚠️ Hata");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (r: Redirect) => {
        setNewSlug(r.slug);           // slug yine çıplak tutuluyor
        setNewUrl(r.destination);
        setEditingSlug(r.slug);
    };

    const cancelEdit = () => {
        setNewSlug("");
        setNewUrl("");
        setEditingSlug(null);
    };

    const handleDelete = async (slug: string) => {
        if (!confirm(`${slug} silinsin mi?`)) return;
        try {
            const res = await fetch("/api/redirects", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-sync-token": authToken
                },
                body: JSON.stringify({ slug })
            });

            if (res.ok) {
                setRedirects(prev => prev.filter(r => r.slug !== slug));
                showStatus("🗑️ Silindi");
            }
        } catch (error) {
            showStatus("Hata");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showStatus("📋 Kopyalandı");
    };

    const formatDate = (ts?: number) => {
        if (!ts) return "-";
        return new Date(ts).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="space-y-8">
            {/* Add/Edit Form */}
            <form
                onSubmit={handleSave}
                className={`p-6 rounded-3xl shadow-lg border flex flex-col md:flex-row gap-4 items-end transition-colors ${editingSlug ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700/30" : "bg-white dark:bg-neutral-900 border-gray-100 dark:border-gray-800"}`}
            >
                <div className="flex-1 w-full space-y-1">
                    <label className="text-xs font-semibold uppercase text-gray-400 ml-1">
                        {editingSlug ? "Kısa Link (Değiştirilemez)" : "Kısa Link (Slug)"}
                    </label>
                    <div className="relative">
                        {/* ✅ prefix göster */}
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-blue-600 dark:text-blue-400 tracking-wide select-none">
                            {REDIRECT_PREFIX}
                        </span>

                        <input
                            type="text"
                            value={newSlug}
                            onChange={e => setNewSlug(e.target.value)}
                            placeholder="ornek"
                            disabled={!!editingSlug}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-mono ${editingSlug ? "bg-gray-100 dark:bg-white/10 text-gray-500" : "bg-gray-50 dark:bg-white/5"}`}
                        />
                    </div>
                </div>

                <div className="flex-[2] w-full space-y-1">
                    <label className="text-xs font-semibold uppercase text-gray-400 ml-1">Hedef URL</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                            <FaGlobe />
                        </span>
                        <input
                            type="url"
                            value={newUrl}
                            onChange={e => setNewUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    {editingSlug && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="h-12 px-4 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            <FaTimes />
                        </button>
                    )}
                    <button
                        disabled={isLoading || !newSlug || !newUrl}
                        className={`flex-1 md:flex-none h-12 px-6 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${editingSlug ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        {editingSlug ? <><FaEdit /> Güncelle</> : <><FaPlus /> Ekle</>}
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="grid gap-3">
                {redirects.map((r) => {
                    const publicLink = typeof window !== "undefined"
                        ? getPublicLink(r.slug)
                        : `${REDIRECT_PREFIX}${r.slug}`;

                    return (
                        <div
                            key={r.slug}
                            className="group bg-white/80 dark:bg-neutral-900/80 p-4 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {/* ✅ listede /r/ ile göster */}
                                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-lg">
                                        {REDIRECT_PREFIX}{r.slug}
                                    </span>

                                    <button
                                        onClick={() => copyToClipboard(publicLink)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Kısa linki kopyala"
                                    >
                                        <FaCopy size={12} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                                    <FaExternalLinkAlt size={10} />
                                    <a
                                        href={r.destination}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline truncate max-w-[300px]"
                                    >
                                        {r.destination}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Son Tıklanma</div>
                                    <div className="text-xs font-mono text-gray-600 dark:text-gray-300">{formatDate(r.lastClickedAt)}</div>
                                </div>

                                <div className="flex items-center gap-2 text-gray-400 text-sm w-16 justify-end" title="Toplam Tıklanma">
                                    <FaChartBar />
                                    <span className="font-bold text-gray-600 dark:text-gray-300">{r.clicks}</span>
                                </div>

                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(r)}
                                        className="p-3 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
                                        title="Düzenle"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(r.slug)}
                                        className="p-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                        title="Sil"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {redirects.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        Listeniz boş.
                    </div>
                )}
            </div>

            {status && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium animate-bounce-in z-50">
                    {status}
                </div>
            )}
        </div>
    );
}
