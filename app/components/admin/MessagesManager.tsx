"use client";
import React, { useState, useEffect } from "react";
import { FaTrash, FaEnvelope, FaClock, FaUser } from "react-icons/fa";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    ip: string;
    timestamp: number;
}

export default function MessagesManager({ authToken }: { authToken: string }) {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const fetchMessages = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/messages", {
                headers: { "x-auth-token": authToken }
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            } else {
                setError("Mesajlar alınamadı.");
            }
        } catch (err) {
            setError("Bağlantı hatası.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleString('tr-TR', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gelen Mesajlar</h2>
                <button
                    onClick={fetchMessages}
                    className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                >
                    Yenile
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-xl">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {/* List Column */}
                <div className="md:col-span-1 space-y-3 max-h-[700px] overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
                            ))}
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                            Henüz mesaj yok.
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div
                                key={msg.id}
                                onClick={() => setSelectedMessage(msg)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedMessage?.id === msg.id
                                    ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800'
                                    : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:border-violet-300'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold truncate pr-3" title={msg.name}>{msg.name}</h3>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(msg.timestamp).split(' ')[0]}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{msg.subject}</p>
                                <p className="text-xs text-gray-500 truncate mt-1">{msg.message}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Detail Column */}
                <div className="md:col-span-2">
                    {selectedMessage ? (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                            <div className="flex justify-between items-start border-b border-gray-100 dark:border-zinc-800 pb-4 mb-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{selectedMessage.subject}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5"><FaUser className="text-xs" /> {selectedMessage.name}</span>
                                        <a href={`mailto:${selectedMessage.email}`} className="flex items-center gap-1.5 text-violet-600 hover:underline">
                                            <FaEnvelope className="text-xs" /> {selectedMessage.email}
                                        </a>
                                    </div>
                                </div>
                                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                                    <FaClock className="text-xs" /> {formatDate(selectedMessage.timestamp)}
                                </span>
                            </div>

                            <div className="prose dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {selectedMessage.message}
                                </p>
                            </div>

                            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-400">
                                <p>IP: {selectedMessage.ip}</p>
                                <p>ID: {selectedMessage.id}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-12 text-gray-400 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                            Detayları görmek için bir mesaj seçin.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
