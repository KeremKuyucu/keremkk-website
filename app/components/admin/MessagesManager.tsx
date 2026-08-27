"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FaEnvelope,
    FaClock,
    FaUser,
    FaTrash,
    FaSearch,
    FaSync,
    FaCopy,
    FaCheck,
    FaReply,
    FaTimes,
    FaFileCsv,
    FaFileCode,
    FaCalendarAlt,
    FaChevronLeft,
    FaLaptop,
    FaInbox
} from "react-icons/fa";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    user_agent?: string;
    timestamp: number;
}

interface MessagesManagerProps {
    authToken: string;
}

export default function MessagesManager({ authToken }: MessagesManagerProps) {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchMessages = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        setIsRefreshing(true);
        setError("");
        try {
            const res = await fetch("/api/admin/messages", {
                headers: { "x-auth-token": authToken }
            });

            if (res.ok) {
                const data = await res.json();
                const list = data.messages || [];
                setMessages(list);
                if (list.length > 0 && !selectedMessage) {
                    setSelectedMessage(list[0]);
                }
            } else {
                setError("Mesajlar alınamadı.");
            }
        } catch (err) {
            setError("Bağlantı hatası.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [authToken, selectedMessage]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Handle single message delete
    const handleDeleteMessage = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Bu mesajı kalıcı olarak silmek istediğinizden emin misiniz?")) return;

        setDeletingId(id);
        try {
            const res = await fetch("/api/admin/messages", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken
                },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setMessages(prev => prev.filter(m => m.id !== id));
                if (selectedMessage?.id === id) {
                    const remaining = messages.filter(m => m.id !== id);
                    setSelectedMessage(remaining.length > 0 ? remaining[0] : null);
                }
            } else {
                alert("Mesaj silinemedi.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Bağlantı hatası oluştu.");
        } finally {
            setDeletingId(null);
        }
    };

    // Copy helper
    const handleCopy = (text: string, fieldKey: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Relative & formatted time
    const formatTimeInfo = (ts: number) => {
        const date = new Date(ts);
        if (isNaN(date.getTime())) return { formatted: "", relative: "", isToday: false };

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);

        const isToday = now.toDateString() === date.toDateString();

        let relative = "";
        if (diffSec < 60) relative = "Az önce";
        else if (diffMin < 60) relative = `${diffMin} dk önce`;
        else if (diffHours < 24) relative = `${diffHours} sa önce`;
        else if (diffDays === 1) relative = "Dün";
        else if (diffDays < 7) relative = `${diffDays} gün önce`;
        else relative = `${Math.floor(diffDays / 7)} hf önce`;

        const formatted = date.toLocaleString("tr-TR", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        return { formatted, relative, isToday };
    };

    // Get Avatar Initials
    const getInitials = (name: string) => {
        if (!name) return "?";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Filter messages by search query
    const filteredMessages = useMemo(() => {
        if (!searchQuery.trim()) return messages;
        const q = searchQuery.toLowerCase().trim();
        return messages.filter(m =>
            m.name?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q) ||
            m.subject?.toLowerCase().includes(q) ||
            m.message?.toLowerCase().includes(q)
        );
    }, [messages, searchQuery]);

    // Metrics
    const todayCount = useMemo(() => {
        const todayStr = new Date().toDateString();
        return messages.filter(m => new Date(m.timestamp).toDateString() === todayStr).length;
    }, [messages]);

    // Export CSV
    const exportCSV = () => {
        if (filteredMessages.length === 0) return;
        const headers = ["ID", "Tarih", "Gonderen", "E-posta", "Konu", "Mesaj", "User Agent"];
        const rows = filteredMessages.map(m => [
            `"${m.id || ""}"`,
            `"${new Date(m.timestamp).toISOString()}"`,
            `"${(m.name || "").replace(/"/g, '""')}"`,
            `"${(m.email || "").replace(/"/g, '""')}"`,
            `"${(m.subject || "").replace(/"/g, '""')}"`,
            `"${(m.message || "").replace(/"/g, '""')}"`,
            `"${(m.user_agent || "").replace(/"/g, '""')}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `messages_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export JSON
    const exportJSON = () => {
        if (filteredMessages.length === 0) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredMessages, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `messages_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-6 animate-fadeIn pb-12 w-full max-w-full min-w-0">
            {/* Header Control Card */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-5 md:p-6 rounded-3xl border border-white/20 dark:border-white/10 shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-violet-600 text-white flex items-center justify-center text-xl shadow-lg shadow-violet-500/25 shrink-0">
                        <FaEnvelope />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">Gelen İletişim Mesajları</h2>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                {messages.length} Mesaj
                            </span>
                            {todayCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    Bugün: +{todayCount}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            Web sitenizin iletişim formundan gelen tüm ziyaretçi mesajları
                        </p>
                    </div>
                </div>

                {/* Actions & Export */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    {/* Manual Refresh */}
                    <button
                        onClick={() => fetchMessages()}
                        disabled={isLoading || isRefreshing}
                        className="px-4 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FaSync className={isRefreshing ? "animate-spin" : ""} />
                        <span>{isRefreshing ? "Yenileniyor..." : "Yenile"}</span>
                    </button>

                    {/* Export Buttons */}
                    <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
                        <button
                            onClick={exportCSV}
                            disabled={filteredMessages.length === 0}
                            className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
                            title="CSV olarak indir"
                        >
                            <FaFileCsv className="text-sm" />
                            <span className="hidden sm:inline">CSV</span>
                        </button>
                        <button
                            onClick={exportJSON}
                            disabled={filteredMessages.length === 0}
                            className="px-3 py-2 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
                            title="JSON olarak indir"
                        >
                            <FaFileCode className="text-sm" />
                            <span className="hidden sm:inline">JSON</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-semibold flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => fetchMessages()} className="underline font-bold">Tekrar Dene</button>
                </div>
            )}

            {/* Main Content Layout (Master - Detail) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[620px]">
                {/* Left: Message List Column */}
                <div className={`md:col-span-5 lg:col-span-4 flex flex-col gap-3.5 ${selectedMessage ? "hidden md:flex" : "flex"}`}>
                    {/* Search Input Card */}
                    <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm relative">
                        <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="İsim, e-posta, konu veya içerik ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-8 py-2 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    {/* Messages Scroll List */}
                    <div className="flex-1 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-sm p-2 overflow-y-auto max-h-[600px] space-y-2 custom-scrollbar">
                        {isLoading && messages.length === 0 ? (
                            <div className="space-y-2.5 p-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="p-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse h-20" />
                                ))}
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-2 text-gray-400">
                                <FaInbox className="text-3xl text-gray-300 dark:text-zinc-700" />
                                <p className="text-xs font-medium">
                                    {searchQuery ? "Aramanıza uygun mesaj bulunamadı." : "Henüz gelen mesaj bulunmuyor."}
                                </p>
                            </div>
                        ) : (
                            filteredMessages.map((msg) => {
                                const isSelected = selectedMessage?.id === msg.id;
                                const timeInfo = formatTimeInfo(msg.timestamp);

                                return (
                                    <div
                                        key={msg.id}
                                        onClick={() => setSelectedMessage(msg)}
                                        className={`p-3.5 rounded-2xl cursor-pointer border transition-all relative group flex flex-col gap-1.5 ${
                                            isSelected
                                                ? "bg-violet-500/10 border-violet-500/50 shadow-md ring-1 ring-violet-500/30"
                                                : "bg-white/50 dark:bg-zinc-800/40 border-transparent hover:bg-white/80 dark:hover:bg-zinc-800/80 hover:border-gray-200 dark:hover:border-zinc-700"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                                                    {getInitials(msg.name)}
                                                </div>
                                                <span className="font-bold text-xs text-gray-900 dark:text-white truncate" title={msg.name}>
                                                    {msg.name}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {timeInfo.isToday && (
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Bugün gelen mesaj" />
                                                )}
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {timeInfo.relative}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                            {msg.subject}
                                        </p>

                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                            {msg.message}
                                        </p>

                                        {/* Quick Delete Button */}
                                        <button
                                            onClick={(e) => handleDeleteMessage(msg.id, e)}
                                            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Mesajı Sil"
                                        >
                                            <FaTrash size={11} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Message Detail Column */}
                <div className={`md:col-span-7 lg:col-span-8 flex flex-col ${!selectedMessage ? "hidden md:flex" : "flex"}`}>
                    {selectedMessage ? (
                        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden flex flex-col h-full min-h-[550px]">
                            {/* Detail Header */}
                            <div className="p-5 md:p-6 border-b border-gray-100 dark:border-white/5 flex flex-col gap-4 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5">
                                {/* Mobile Back Button & Actions */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="md:hidden px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-xs font-bold flex items-center gap-1.5"
                                    >
                                        <FaChevronLeft className="text-xs" /> Mesajlara Dön
                                    </button>

                                    <div className="flex items-center gap-2 ml-auto">
                                        <a
                                            href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                                            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                                        >
                                            <FaReply className="text-xs" /> Yanıtla
                                        </a>

                                        <button
                                            onClick={() => handleDeleteMessage(selectedMessage.id)}
                                            disabled={deletingId === selectedMessage.id}
                                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                                            title="Mesajı Sil"
                                        >
                                            {deletingId === selectedMessage.id ? (
                                                <FaSync className="animate-spin text-xs text-rose-500" />
                                            ) : (
                                                <FaTrash size={13} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Subject & Sender Overview */}
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-snug">
                                        {selectedMessage.subject}
                                    </h3>

                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                                                {getInitials(selectedMessage.name)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <FaUser className="text-gray-400 text-[10px]" />
                                                    {selectedMessage.name}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-0.5 font-mono text-[11px]">
                                                    <a
                                                        href={`mailto:${selectedMessage.email}`}
                                                        className="text-violet-600 dark:text-violet-400 hover:underline"
                                                    >
                                                        {selectedMessage.email}
                                                    </a>
                                                    <button
                                                        onClick={() => handleCopy(selectedMessage.email, "msg-email")}
                                                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 transition"
                                                        title="E-posta Kopyala"
                                                    >
                                                        {copiedField === "msg-email" ? <FaCheck className="text-emerald-500 text-[10px]" /> : <FaCopy className="text-[10px]" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:items-end text-gray-400 text-[11px]">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <FaClock className="text-[10px]" />
                                                {formatTimeInfo(selectedMessage.timestamp).formatted}
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                ({formatTimeInfo(selectedMessage.timestamp).relative})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message Body */}
                            <div className="p-5 md:p-8 flex-1 overflow-y-auto">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mesaj İçeriği</span>
                                    <button
                                        onClick={() => handleCopy(selectedMessage.message, "msg-body")}
                                        className="text-xs text-violet-600 dark:text-violet-400 font-bold hover:underline flex items-center gap-1.5"
                                    >
                                        {copiedField === "msg-body" ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                                        <span>{copiedField === "msg-body" ? "Kopyalandı" : "Metni Kopyala"}</span>
                                    </button>
                                </div>

                                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-violet-500/20">
                                    {selectedMessage.message}
                                </div>
                            </div>

                            {/* Detail Footer Info */}
                            <div className="p-4 md:p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-800/30 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                                <span className="font-mono truncate">ID: {selectedMessage.id}</span>
                                {selectedMessage.user_agent && (
                                    <span className="flex items-center gap-1 truncate max-w-xs" title={selectedMessage.user_agent}>
                                        <FaLaptop className="text-[10px]" /> {selectedMessage.user_agent}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-gray-400 bg-white/40 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">
                            <FaEnvelope className="text-4xl text-gray-300 dark:text-zinc-700 mb-3" />
                            <p className="font-semibold text-sm">Görüntülemek için soldan bir mesaj seçin.</p>
                            <p className="text-xs text-gray-500 mt-1">Mesaj detayları, yanıt seçenekleri ve iletişim bilgileri burada görünecektir.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
