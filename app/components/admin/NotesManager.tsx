"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FaStickyNote,
    FaPlus,
    FaTrash,
    FaSave,
    FaTimes,
    FaSync,
    FaSearch,
    FaCopy,
    FaCheck,
    FaDownload,
    FaClock,
    FaChevronLeft,
    FaEye,
    FaEdit,
    FaFileAlt
} from "react-icons/fa";

interface Note {
    id: string;
    content: string;
    updatedAt: number;
    isDecrypted?: boolean;
}

interface NotesManagerProps {
    authToken: string;
}

export default function NotesManager({ authToken }: NotesManagerProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const [draftContent, setDraftContent] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "unsaved" | "error">("idle");
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Fetch Notes
    const fetchNotes = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        setIsRefreshing(true);
        try {
            const res = await fetch("/api/admin/notes", { headers: { "x-auth-token": authToken } });
            if (res.ok) {
                const data = await res.json();
                const rawNotes = data.notes || [];
                const decryptedNotes = rawNotes.map((n: any) => ({
                    ...n,
                    content: n.content || "",
                    isDecrypted: true
                }));
                setNotes(decryptedNotes);

                // Keep active note updated if already open
                if (activeNote && activeNote.id !== "new") {
                    const found = decryptedNotes.find((n: Note) => n.id === activeNote.id);
                    if (found) {
                        setActiveNote(found);
                    }
                }
            }
        } catch (e) {
            console.error("Fetch notes error:", e);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [authToken, activeNote]);

    useEffect(() => {
        fetchNotes();
    }, [authToken]);

    // Select note and populate draft
    const handleSelectNote = (note: Note) => {
        setActiveNote(note);
        setDraftContent(note.content || "");
        setIsEditing(true);
        setSaveStatus("idle");
        setViewMode("edit");
    };

    // Create New Note
    const handleCreateNew = () => {
        const newNote: Note = {
            id: "new",
            content: "",
            updatedAt: Date.now(),
            isDecrypted: true
        };
        setActiveNote(newNote);
        setDraftContent("");
        setIsEditing(true);
        setSaveStatus("unsaved");
        setViewMode("edit");
    };

    // Save active note
    const handleSaveNote = async () => {
        if (!activeNote) return;

        setIsSaving(true);
        try {
            const isNew = !activeNote.id || activeNote.id === "new";
            const method = isNew ? "POST" : "PUT";
            const body = isNew
                ? JSON.stringify({ encryptedContent: draftContent })
                : JSON.stringify({ id: activeNote.id, encryptedContent: draftContent });

            const res = await fetch("/api/admin/notes", {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken
                },
                body
            });

            if (res.ok) {
                const data = await res.json();
                const saved = data.note;
                setSaveStatus("saved");
                await fetchNotes(true);
                if (saved) {
                    setActiveNote(saved);
                    setDraftContent(saved.content || "");
                }
                setTimeout(() => setSaveStatus("idle"), 3000);
            } else {
                setSaveStatus("error");
            }
        } catch (e) {
            console.error("Save note error:", e);
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    // Delete note
    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Bu notu kalıcı olarak silmek istediğinizden emin misiniz?")) return;

        setDeletingId(id);
        try {
            const res = await fetch("/api/admin/notes", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": authToken
                },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setNotes(prev => prev.filter(n => n.id !== id));
                if (activeNote?.id === id) {
                    setActiveNote(null);
                    setDraftContent("");
                    setIsEditing(false);
                }
            } else {
                alert("Not silinemedi.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Bağlantı hatası.");
        } finally {
            setDeletingId(null);
        }
    };

    // Keyboard shortcut (Ctrl+S / Cmd+S to save)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                if (isEditing && activeNote) {
                    handleSaveNote();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isEditing, activeNote, draftContent]);

    // Copy helper
    const handleCopy = (text: string, fieldKey: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Download note as markdown / txt
    const handleDownload = () => {
        if (!draftContent) return;
        const title = draftContent.split("\n")[0].replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ -]/g, "").trim() || "not";
        const blob = new Blob([draftContent], { type: "text/markdown;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${title}.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Relative & formatted time
    const formatTime = (ts: number) => {
        const date = new Date(ts);
        if (isNaN(date.getTime())) return "";

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMin < 1) return "Az önce";
        if (diffMin < 60) return `${diffMin} dk önce`;
        if (diffHours < 24) return `${diffHours} sa önce`;
        if (diffDays === 1) return "Dün";
        if (diffDays < 7) return `${diffDays} gün önce`;

        return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    };

    // Filter notes by search query
    const filteredNotes = useMemo(() => {
        if (!searchQuery.trim()) return notes;
        const q = searchQuery.toLowerCase().trim();
        return notes.filter(n => n.content?.toLowerCase().includes(q));
    }, [notes, searchQuery]);

    // Word & Character count
    const stats = useMemo(() => {
        const text = draftContent.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = text.length;
        const lines = draftContent ? draftContent.split("\n").length : 0;
        return { words, chars, lines };
    }, [draftContent]);

    return (
        <div className="flex flex-col gap-6 animate-fadeIn pb-12 w-full max-w-full min-w-0">
            {/* Header Control Card */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-5 md:p-6 rounded-3xl border border-white/20 dark:border-white/10 shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl shadow-lg shadow-orange-500/25 shrink-0">
                        <FaStickyNote />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">Şifreli Notlar</h2>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                                {notes.length} Not
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            Güvenli, şifreli ve anında senkronize olan özel not defteri
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    <button
                        onClick={handleCreateNew}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95 flex items-center gap-2"
                    >
                        <FaPlus className="text-xs" />
                        <span>Yeni Not</span>
                    </button>

                    <button
                        onClick={() => fetchNotes()}
                        disabled={isLoading || isRefreshing}
                        className="px-4 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FaSync className={isRefreshing ? "animate-spin" : ""} />
                        <span>{isRefreshing ? "Yenileniyor..." : "Yenile"}</span>
                    </button>
                </div>
            </div>

            {/* Main Content Layout (Master - Editor) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[640px]">
                {/* Left: Notes List Column */}
                <div className={`md:col-span-4 lg:col-span-4 flex flex-col gap-3.5 ${isEditing ? "hidden md:flex" : "flex"}`}>
                    {/* Search Bar */}
                    <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm relative">
                        <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Notlarda ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-8 py-2 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-gray-400"
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

                    {/* Notes Scroll List */}
                    <div className="flex-1 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-sm p-2 overflow-y-auto max-h-[620px] space-y-2 custom-scrollbar">
                        {isLoading && notes.length === 0 ? (
                            <div className="space-y-2.5 p-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="p-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse h-20" />
                                ))}
                            </div>
                        ) : filteredNotes.length === 0 ? (
                            <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
                                <FaFileAlt className="text-3xl text-gray-300 dark:text-zinc-700" />
                                <p className="text-xs font-medium">
                                    {searchQuery ? "Aramanıza uygun not bulunamadı." : "Henüz bir not eklenmedi."}
                                </p>
                                {!searchQuery && (
                                    <button
                                        onClick={handleCreateNew}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition"
                                    >
                                        İlk Notu Oluştur
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredNotes.map((note) => {
                                const isSelected = activeNote?.id === note.id;
                                const firstLine = note.content?.split("\n")[0]?.replace(/^[#\s]+/, "").trim() || "İsimsiz Not";
                                const secondLine = note.content?.split("\n").slice(1).join(" ").trim() || "";

                                return (
                                    <div
                                        key={note.id}
                                        onClick={() => handleSelectNote(note)}
                                        className={`p-3.5 rounded-2xl cursor-pointer border transition-all relative group flex flex-col gap-1.5 ${isSelected
                                                ? "bg-orange-500/10 border-orange-500/50 shadow-md ring-1 ring-orange-500/30"
                                                : "bg-white/50 dark:bg-zinc-800/40 border-transparent hover:bg-white/80 dark:hover:bg-zinc-800/80 hover:border-gray-200 dark:hover:border-zinc-700"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-xs text-gray-900 dark:text-white truncate" title={firstLine}>
                                                {firstLine}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                                {formatTime(note.updatedAt)}
                                            </span>
                                        </div>

                                        {secondLine ? (
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {secondLine}
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                                                Boş içerik
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                                            <span>{note.content?.length || 0} karakter</span>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDelete(note.id, e)}
                                            disabled={deletingId === note.id}
                                            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Notu Sil"
                                        >
                                            {deletingId === note.id ? (
                                                <FaSync className="animate-spin text-[10px] text-rose-500" />
                                            ) : (
                                                <FaTrash size={11} />
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Editor / Preview Column */}
                <div className={`md:col-span-8 lg:col-span-8 flex flex-col ${!isEditing ? "hidden md:flex" : "flex"}`}>
                    {activeNote ? (
                        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden flex flex-col h-full min-h-[580px]">
                            {/* Editor Toolbar */}
                            <div className="p-4 md:p-5 border-b border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 bg-white/40 dark:bg-zinc-800/40">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="md:hidden px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-xs font-bold flex items-center gap-1.5"
                                    >
                                        <FaChevronLeft className="text-xs" /> Notlar
                                    </button>

                                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                                        {activeNote.id === "new" ? "YENİ NOT" : "DÜZENLENİYOR"}
                                    </span>

                                    {/* View Toggle */}
                                    <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs font-bold">
                                        <button
                                            onClick={() => setViewMode("edit")}
                                            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${viewMode === "edit"
                                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                                    : "text-gray-500 dark:text-gray-400"
                                                }`}
                                        >
                                            <FaEdit className="text-[10px]" /> Yaz
                                        </button>
                                        <button
                                            onClick={() => setViewMode("preview")}
                                            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${viewMode === "preview"
                                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                                    : "text-gray-500 dark:text-gray-400"
                                                }`}
                                        >
                                            <FaEye className="text-[10px]" /> Önizle
                                        </button>
                                    </div>
                                </div>

                                {/* Right Toolbar Actions */}
                                <div className="flex items-center gap-2 ml-auto">
                                    {/* Copy Button */}
                                    <button
                                        onClick={() => handleCopy(draftContent, "editor-copy")}
                                        className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                                        title="Tümünü Kopyala"
                                    >
                                        {copiedField === "editor-copy" ? <FaCheck className="text-emerald-500 text-xs" /> : <FaCopy size={13} />}
                                    </button>

                                    {/* Download Button */}
                                    <button
                                        onClick={handleDownload}
                                        disabled={!draftContent}
                                        className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition disabled:opacity-40"
                                        title="Markdown (.md) Olarak İndir"
                                    >
                                        <FaDownload size={13} />
                                    </button>

                                    {/* Delete Note */}
                                    {activeNote.id !== "new" && (
                                        <button
                                            onClick={() => handleDelete(activeNote.id)}
                                            className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                                            title="Bu Notu Sil"
                                        >
                                            <FaTrash size={13} />
                                        </button>
                                    )}

                                    {/* Save Button */}
                                    <button
                                        onClick={handleSaveNote}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                        title="Ctrl + S ile kaydedebilirsiniz"
                                    >
                                        {isSaving ? (
                                            <FaSync className="animate-spin text-xs" />
                                        ) : saveStatus === "saved" ? (
                                            <FaCheck className="text-xs" />
                                        ) : (
                                            <FaSave className="text-xs" />
                                        )}
                                        <span>{isSaving ? "Kaydediliyor..." : saveStatus === "saved" ? "Kaydedildi!" : "Kaydet"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Editor Textarea or Preview */}
                            <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
                                {viewMode === "edit" ? (
                                    <textarea
                                        value={draftContent}
                                        onChange={(e) => {
                                            setDraftContent(e.target.value);
                                            setSaveStatus("unsaved");
                                        }}
                                        className="flex-1 w-full p-6 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 placeholder-gray-400 selection:bg-orange-500/20 custom-scrollbar"
                                        placeholder="Notunuzu buraya yazın... (Markdown desteklenir, kaydetmek için Ctrl+S)"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="flex-1 p-6 overflow-y-auto font-sans text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap selection:bg-orange-500/20 custom-scrollbar">
                                        {draftContent ? (
                                            draftContent
                                        ) : (
                                            <p className="text-gray-400 italic">Önizlenecek içerik yok.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Editor Bottom Stats Bar */}
                            <div className="p-3 md:p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-800/30 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400">
                                <div className="flex items-center gap-3">
                                    <span>{stats.words} kelime</span>
                                    <span>•</span>
                                    <span>{stats.chars} karakter</span>
                                    <span>•</span>
                                    <span>{stats.lines} satır</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="hidden sm:inline text-gray-400">Kısayol: <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-zinc-700 rounded text-[10px] font-mono">Ctrl+S</kbd></span>
                                    {activeNote.updatedAt && (
                                        <span className="flex items-center gap-1 font-medium">
                                            <FaClock className="text-[10px]" /> Son güncelleme: {new Date(activeNote.updatedAt).toLocaleTimeString("tr-TR")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-gray-400 bg-white/40 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">
                            <FaStickyNote className="text-5xl text-gray-300 dark:text-zinc-700 mb-3" />
                            <p className="font-semibold text-sm">Düzenlemek için soldan bir not seçin veya yeni oluşturun.</p>
                            <button
                                onClick={handleCreateNew}
                                className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <FaPlus className="text-xs" /> Yeni Not Oluştur
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
