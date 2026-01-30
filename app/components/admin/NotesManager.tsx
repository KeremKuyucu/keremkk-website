"use client";
import { useState, useEffect } from "react";
import { FaStickyNote, FaPlus, FaTrash, FaSave, FaTimes, FaSync } from "react-icons/fa";

interface Note {
    id: string;
    content: string;
    updatedAt: number;
    isDecrypted?: boolean;
}

export default function NotesManager({ authToken }: { authToken: string }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState("");

    // --- Fetch Notes ---
    const fetchNotes = async () => {
        try {
            const res = await fetch("/api/notes", { headers: { "x-sync-token": authToken } });
            if (res.ok) {
                const data = await res.json();
                const rawNotes = data.notes || [];
                const decryptedNotes = rawNotes.map((n: any) => ({
                    ...n,
                    content: n.content || "",
                    isDecrypted: true
                }));
                setNotes(decryptedNotes);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authToken]);

    // --- Handlers ---
    const handleSaveNote = async () => {
        if (!activeNote) return;

        setIsLoading(true);
        try {
            const content = activeNote.content;
            const isNew = !activeNote.id || activeNote.id === "new";

            const method = isNew ? "POST" : "PUT";
            const body = isNew
                ? JSON.stringify({ encryptedContent: content })
                : JSON.stringify({ id: activeNote.id, encryptedContent: content });

            const res = await fetch("/api/notes", {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "x-sync-token": authToken
                },
                body
            });

            if (res.ok) {
                await fetchNotes();
                setIsEditing(false);
                setActiveNote(null);
            } else {
                setStatus("Kaydedilemedi");
            }
        } catch (e) {
            setStatus("Hata");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Bu not silinsin mi?")) return;

        const res = await fetch("/api/notes", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "x-sync-token": authToken
            },
            body: JSON.stringify({ id })
        });

        if (res.ok) {
            setNotes(prev => prev.filter(n => n.id !== id));
            if (activeNote?.id === id) {
                setActiveNote(null);
                setIsEditing(false);
            }
        }
    };

    const createNew = () => {
        const newNote = {
            id: "new",
            content: "",
            updatedAt: Date.now(),
            isDecrypted: true
        };
        setActiveNote(newNote);
        setIsEditing(true);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[600px]">
            {/* Sidebar / List */}
            <div className={`w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4 ${isEditing ? "hidden md:flex" : "flex"}`}>
                <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs shadow-md">
                            <FaStickyNote />
                        </div>
                        <span className="font-bold">Notlar</span>
                    </div>
                    <button onClick={createNew} className="p-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:scale-105 transition-transform">
                        <FaPlus />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar p-1">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => { setActiveNote(note); setIsEditing(true); }}
                            className={`group p-4 rounded-2xl border transition-all cursor-pointer relative ${activeNote?.id === note.id ? "bg-white dark:bg-zinc-800 border-orange-500/50 shadow-md ring-1 ring-orange-500/20" : "bg-white/40 dark:bg-zinc-900/40 border-transparent hover:bg-white/60 dark:hover:bg-zinc-800/60"}`}
                        >
                            <div className="font-medium line-clamp-1 mb-1">
                                {note.content.split('\n')[0] || "İsimsiz Not"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                                <span>{new Date(note.updatedAt).toLocaleDateString("tr-TR")}</span>
                            </div>
                            <button
                                onClick={(e) => handleDelete(note.id, e)}
                                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))}

                    {notes.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            Henüz not eklemedin.
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className={`flex-1 flex flex-col bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden ${!isEditing ? "hidden md:flex justify-center items-center text-gray-400" : ""}`}>
                {activeNote ? (
                    <>
                        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <button onClick={() => setIsEditing(false)} className="md:hidden p-2 text-gray-500">
                                <FaTimes />
                            </button>
                            <span className="text-xs font-mono text-gray-400">
                                {activeNote.id === "new" ? "YENİ NOT" : "DÜZENLENİYOR"}
                            </span>
                            <button
                                onClick={handleSaveNote}
                                disabled={isLoading}
                                className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
                            >
                                {isLoading ? <FaSync className="animate-spin" /> : <><FaSave /> Kaydet</>}
                            </button>
                        </div>
                        <textarea
                            value={activeNote.content}
                            onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
                            className="flex-1 w-full bg-transparent p-6 resize-none outline-none text-lg leading-relaxed font-mono text-gray-800 dark:text-gray-200"
                            placeholder="Buraya yaz..."
                            autoFocus
                        />
                    </>
                ) : (
                    <div className="hidden md:flex flex-col items-center gap-4 opacity-50">
                        <FaStickyNote className="text-6xl text-gray-300 dark:text-zinc-700" />
                        <p>Düzenlemek için bir not seç veya yeni oluştur.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
