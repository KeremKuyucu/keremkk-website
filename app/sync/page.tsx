"use client";
import { useState, useEffect } from "react";
import { FaLock, FaSync, FaClock, FaPaperPlane, FaTrash, FaCopy, FaCheck, FaKey } from "react-icons/fa";

interface Message {
    id: string;
    text: string;
    ttl: number;
}

export default function SyncPage() {
    // 3-Stage State: 
    // 1. !isAuthenticated -> Show Server Auth
    // 2. isAuthenticated && !isDecrypted -> Show Encryption Password
    // 3. isDecrypted -> Show UI

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isDecrypted, setIsDecrypted] = useState(false);

    const [serverPassword, setServerPassword] = useState("");
    const [encryptionPassword, setEncryptionPassword] = useState("");

    const [authToken, setAuthToken] = useState<string | null>(null);
    const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);

    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [ttlMinutes, setTtlMinutes] = useState(600);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // --- 1. SERVER AUTH HELPER ---
    const hashPassword = async (pwd: string) => {
        const enc = new TextEncoder();
        const hash = await window.crypto.subtle.digest("SHA-256", enc.encode(pwd));
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    };

    // --- 2. CLIENT ENCRYPTION HELPERS ---
    const deriveKey = async (password: string) => {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );
        // Salt is fixed for simplicity in this implementation
        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: enc.encode("client-e2ee-salt-v1"),
                iterations: 100000,
                hash: "SHA-256",
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    };

    const encryptText = async (text: string, key: CryptoKey) => {
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(text);
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encoded
        );

        // Format: [IV(12)][Ciphertext]
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        return btoa(String.fromCharCode(...Array.from(combined)));
    };

    const decryptText = async (cipherText: string, key: CryptoKey) => {
        try {
            // Basic heuristic check for plain text
            if (cipherText.includes(" ") || cipherText.length < 20) return cipherText + " (Plain)";

            const combined = new Uint8Array(
                atob(cipherText).split('').map(c => c.charCodeAt(0))
            );

            if (combined.length < 12) return "[Veri Hatası - Kısa]";

            const iv = combined.slice(0, 12);
            const data = combined.slice(12);

            const decrypted = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                key,
                data
            );
            return new TextDecoder().decode(decrypted);
        } catch (e) {
            // console.error(e);
            return "[Şifreli Veri - Anahtar Uymadı]";
        }
    };

    // --- HANDLERS ---

    const handleServerAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus("");

        try {
            const authHash = await hashPassword(serverPassword);

            // 1. Get Session Token
            const resAuth = await fetch(`/api/sync/auth`, {
                method: "POST",
                headers: { 'x-sync-password': authHash }
            });

            if (resAuth.ok) {
                const { token } = await resAuth.json();

                // 2. Fetch Messages with Token
                const resData = await fetch(`/api/sync`, {
                    headers: { 'x-sync-token': token }
                });

                if (resData.ok) {
                    const data = await resData.json();
                    setIsAuthenticated(true);
                    setAuthToken(token); // Store Session Token, not Password Hash
                    setMessages(data.messages || []);
                    setServerPassword("");
                } else {
                    setStatus("Veri alınamadı.");
                }
            } else {
                setStatus("Sunucu girişi başarısız.");
            }
        } catch (error) {
            setStatus("Bağlantı hatası.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecryption = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!encryptionPassword.trim()) return;

        setIsLoading(true);
        try {
            const key = await deriveKey(encryptionPassword);
            setEncryptionKey(key);

            // Try to decrypt existing messages
            const decryptedMessages = await Promise.all(
                messages.map(async (msg) => ({
                    ...msg,
                    text: await decryptText(msg.text, key)
                }))
            );

            setMessages(decryptedMessages);
            setIsDecrypted(true);
            setEncryptionPassword(""); // Clear
        } catch (err) {
            setStatus("Anahtar türetme hatası.");
        } finally {
            setIsLoading(false);
        }
    };

    const refreshMessages = async () => {
        if (!authToken || !encryptionKey) return;
        try {
            const res = await fetch(`/api/sync`, {
                headers: { 'x-sync-token': authToken }
            });
            if (res.ok) {
                const data = await res.json();
                const decryptedMessages = await Promise.all(
                    (data.messages || []).map(async (msg: Message) => ({
                        ...msg,
                        text: await decryptText(msg.text, encryptionKey)
                    }))
                );
                setMessages(decryptedMessages);
            }
        } catch (e) { console.error(e); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !authToken || !encryptionKey) return;

        setIsLoading(true);
        try {
            const encrypted = await encryptText(newMessage, encryptionKey);

            const res = await fetch("/api/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-sync-token": authToken
                },
                body: JSON.stringify({
                    text: encrypted,
                    ttl: ttlMinutes
                }),
            });

            if (res.ok) {
                setNewMessage("");
                setStatus("Şifrelendi ve Gönderildi!");
                await refreshMessages();
                setTimeout(() => setStatus(""), 2000);
            } else {
                setStatus("Kaydetme başarısız.");
            }
        } catch (error) {
            setStatus("Hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!authToken) return;
        if (!confirm("Silmek istiyor musunuz?")) return;

        try {
            const res = await fetch("/api/sync", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-sync-token": authToken
                },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                setMessages(prev => prev.filter(msg => msg.id !== id));
            }
        } catch (error) { alert("Hata"); }
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // UI HELPER: Hash Display for Setup
    const [setupHash, setSetupHash] = useState("");
    useEffect(() => {
        if (serverPassword && !isAuthenticated) hashPassword(serverPassword).then(setSetupHash);
    }, [serverPassword, isAuthenticated]);


    const ttlOptions = [
        { label: "1 Dakika", value: 60 },
        { label: "5 Dakika", value: 300 },
        { label: "10 Dakika", value: 600 },
        { label: "30 Dakika", value: 1800 },
        { label: "1 Saat", value: 3600 },
        { label: "1 Gün", value: 86400 },
        { label: "Kalıcı", value: -1 },
    ];

    const formatTime = (seconds: number) => {
        if (seconds === -1) return "Kalıcı";
        if (seconds <= 0) return "Süresi doldu";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}s ${m}dk ${s}sn`;
        return `${m}dk ${s}sn`;
    };

    // Live timer
    useEffect(() => {
        if (!isDecrypted || messages.length === 0) return;
        const interval = setInterval(() => {
            setMessages(currentMsgs =>
                currentMsgs.map(msg => ({
                    ...msg,
                    ttl: msg.ttl === -1 ? -1 : (msg.ttl > 0 ? msg.ttl - 1 : 0)
                })).filter(msg => msg.ttl === -1 || msg.ttl > 0)
            );
        }, 1000);
        return () => clearInterval(interval);
    }, [isDecrypted]);

    // RENDER: STEP 1 - Server Auth
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
                <form onSubmit={handleServerAuth} className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                            <FaLock className="text-3xl" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Sunucu Girişi</h2>
                    <div className="space-y-4">
                        <input
                            type="password"
                            value={serverPassword}
                            onChange={(e) => setServerPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white placeholder-gray-500"
                            placeholder="Erişim Şifresi..."
                            autoFocus
                        />
                        {/* {serverPassword && (
                            <p className="text-[10px] text-gray-400 font-mono break-all text-center">Setup Key: {setupHash}</p>
                        )} */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50"
                        >
                            {isLoading ? "Bağlanılıyor..." : "Giriş Yap"}
                        </button>
                        {status && <p className="text-center text-red-500 text-sm mt-2">{status}</p>}
                    </div>
                </form>
            </div>
        );
    }

    // RENDER: STEP 2 - Decryption
    if (isAuthenticated && !isDecrypted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4 relative overflow-hidden">
                {/* Visual indicator of secured connection */}
                <div className="absolute inset-0 bg-violet-500/5 pointer-events-none" />

                <form onSubmit={handleDecryption} className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 z-10">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            <FaKey className="text-3xl" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">Şifre Çöz</h2>
                    <p className="text-center text-gray-500 text-sm mb-6">Verileriniz uçtan uca şifreli. Okumak için ikinci şifrenizi girin.</p>
                    <div className="space-y-4">
                        <input
                            type="password"
                            value={encryptionPassword}
                            onChange={(e) => setEncryptionPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white placeholder-gray-500"
                            placeholder="Şifreleme Anahtarı..."
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
                        >
                            {isLoading ? "Çözülüyor..." : "Şifreyi Çöz"}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // RENDER: STEP 3 - Main UI
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8 flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                            <FaSync className="text-xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sync Board <span className="text-emerald-500 text-sm font-normal ml-2">(Secure)</span></h1>
                    </div>
                    <button onClick={refreshMessages} className="text-sm font-semibold text-violet-600 hover:text-violet-500">
                        Yenile
                    </button>
                </div>

                {/* New Message Input */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
                    <form onSubmit={handleSave} className="flex flex-col gap-4">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white resize-none"
                            placeholder="Güvenli not ekle..."
                            rows={3}
                        />
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                    <FaClock className="text-gray-500" />
                                    <span>{ttlOptions.find(o => o.value === ttlMinutes)?.label || "Süre Seç"}</span>
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsDropdownOpen(false)}
                                        />
                                        <div className="absolute top-full left-0 mt-2 w-40 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden py-1">
                                            {ttlOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setTtlMinutes(option.value);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${ttlMinutes === option.value
                                                        ? "text-violet-600 font-medium bg-violet-50 dark:bg-violet-900/20"
                                                        : "text-gray-700 dark:text-gray-300"
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {status && <span className="text-sm text-emerald-500 font-medium">{status}</span>}
                                <button
                                    type="submit"
                                    disabled={isLoading || !newMessage.trim()}
                                    className="flex items-center gap-2 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    <FaPaperPlane />
                                    Şifrele & Gönder
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Message List */}
                <div className="grid gap-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                            Şifreli not bulunamadı.
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className="group relative bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(msg.text);
                                            setCopiedId(msg.id);
                                            setTimeout(() => setCopiedId(null), 2000);
                                        }}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
                                    >
                                        {copiedId === msg.id ? <FaCheck className="text-xs" /> : <FaCopy className="text-xs" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                    <span className={`flex items-center gap-2 text-xs font-mono font-medium px-2 py-1 rounded-full ml-1 ${msg.ttl === -1
                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                        : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                                        }`}>
                                        <FaClock className="text-[10px]" />
                                        {formatTime(msg.ttl)}
                                    </span>
                                </div>
                                <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 pr-32 font-mono text-sm leading-relaxed">
                                    {msg.text}
                                </p>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
