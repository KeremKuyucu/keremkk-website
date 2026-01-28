"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FaLock, FaSync, FaClock, FaPaperPlane, FaTrash, FaCopy, FaCheck, FaKey, FaEye, FaChevronDown, FaShieldAlt, FaFingerprint } from "react-icons/fa";

interface Message {
    id: string;
    text: string;
    ttl: number;
    isDecrypted?: boolean;
    isLocalOnly?: boolean;
    burnOnCopy?: boolean;
    deleteAfterRead?: boolean;
}

export default function SyncPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isDecrypted, setIsDecrypted] = useState(false);

    const [serverPassword, setServerPassword] = useState("");
    const [encryptionPassword, setEncryptionPassword] = useState("");

    const [authToken, setAuthToken] = useState<string | null>(null);

    // DÜZELTME 1: CryptoKey yerine Parolayı RAM'de tutuyoruz.
    // Çünkü her mesajın Salt'ı farklı olduğu için her mesaja özel Key türetilmesi gerekir.
    const sessionPasswordRef = useRef<string | null>(null);

    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);

    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [ttlMinutes, setTtlMinutes] = useState(600);
    const [deleteAfterRead, setDeleteAfterRead] = useState(false);
    const [burnOnCopy, setBurnOnCopy] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const ttlOptions = [
        { label: "10 Saniye", value: 10 },
        { label: "30 Saniye", value: 30 },
        { label: "1 Dakika", value: 60 },
        { label: "5 Dakika", value: 300 },
        { label: "10 Dakika", value: 600 },
        { label: "30 Dakika", value: 1800 },
        { label: "1 Saat", value: 3600 },
        { label: "6 Saat", value: 21600 },
        { label: "12 Saat", value: 43200 },
        { label: "1 Gün", value: 86400 },
        { label: "3 Gün", value: 259200 },
        { label: "1 Hafta", value: 604800 },
        { label: "Kalıcı", value: -1 },
    ];

    // --- UTILS ---
    const safeBase64Encode = useCallback((arr: Uint8Array): string => {
        const chunks: string[] = [];
        const chunkSize = 8192;
        for (let i = 0; i < arr.length; i += chunkSize) {
            chunks.push(String.fromCharCode(...Array.from(arr.subarray(i, i + chunkSize))));
        }
        return btoa(chunks.join(''));
    }, []);

    const safeBase64Decode = useCallback((str: string): Uint8Array => {
        const binary = atob(str);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }, []);

    // --- ENCRYPTION CORE ---

    const deriveKey = useCallback(async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt as BufferSource,
                iterations: 100000,
                hash: "SHA-256",
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }, []);

    // DÜZELTME 2: Encrypt fonksiyonu artık Key değil, Parola alıyor.
    // Kendi Salt'ını üretiyor, Key'i türetiyor ve Salt'ı paketliyor.
    const encryptText = useCallback(async (
        text: string,
        password: string,
        options: { burnOnCopy: boolean; deleteAfterRead: boolean }
    ) => {
        const payload = JSON.stringify({
            c: text,
            o: options
        });

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await deriveKey(password, salt); // Salt'a özel anahtar
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(payload);

        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encoded
        );

        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);

        return safeBase64Encode(combined);
    }, [deriveKey, safeBase64Encode]);

    // DÜZELTME 3: Decrypt fonksiyonu mesajın içindeki Salt'ı okuyup
    // Parola ile DOĞRU anahtarı türetiyor.
    const decryptText = useCallback(async (cipherText: string, password: string) => {
        try {
            const combined = safeBase64Decode(cipherText);

            if (combined.length < 28) {
                return { success: false, text: "[Veri Hatası]", burnOnCopy: false, deleteAfterRead: false };
            }

            // Mesajdan Salt'ı çekiyoruz
            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 28);
            const data = combined.slice(28);

            // Çekilen Salt ve Parola ile anahtarı yeniden oluşturuyoruz
            const key = await deriveKey(password, salt);

            const decrypted = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                key,
                data
            );
            const decryptedStr = new TextDecoder().decode(decrypted);

            try {
                const json = JSON.parse(decryptedStr);
                if (json.c && json.o) {
                    return {
                        success: true,
                        text: json.c,
                        burnOnCopy: json.o.burnOnCopy || false,
                        deleteAfterRead: json.o.deleteAfterRead || false
                    };
                }
            } catch {
                // Legacy support
            }
            return { success: true, text: decryptedStr, burnOnCopy: false, deleteAfterRead: false };
        } catch (e) {
            // Şifre yanlışsa veya veri bozuksa buraya düşer
            return { success: false, text: "[Şifreli Veri]", burnOnCopy: false, deleteAfterRead: false };
        }
    }, [deriveKey, safeBase64Decode]);

    // --- HANDLERS ---

    const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showStatus = useCallback((message: string, duration = 3000) => {
        if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
        }
        setStatus(message);
        statusTimeoutRef.current = setTimeout(() => {
            setStatus("");
            statusTimeoutRef.current = null;
        }, duration);
    }, []);

    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
        setIsDecrypted(false);
        setAuthToken(null);
        sessionPasswordRef.current = null; // Parolayı temizle
        setMessages([]);
        setServerPassword("");
        setEncryptionPassword("");
        showStatus("Oturum kapatıldı.");
    }, [showStatus]);

    const handleServerAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serverPassword.trim()) {
            showStatus("Lütfen şifre girin");
            return;
        }

        setIsLoading(true);
        setStatus("");

        try {
            const resAuth = await fetch(`/api/sync/auth`, {
                method: "POST",
                headers: { 'x-sync-password': serverPassword }
            });

            if (resAuth.ok) {
                const { token } = await resAuth.json();
                const resData = await fetch(`/api/sync`, {
                    headers: { 'x-sync-token': token }
                });

                if (resData.ok) {
                    const data = await resData.json();
                    setIsAuthenticated(true);
                    setAuthToken(token);
                    setMessages(data.messages || []);
                    setServerPassword("");
                    showStatus("✓ Sunucuya bağlanıldı");
                } else {
                    showStatus("Veri alınamadı");
                }
            } else if (resAuth.status === 429) {
                showStatus("⚠️ Çok fazla deneme");
            } else if (resAuth.status === 401) {
                showStatus("❌ Yanlış şifre");
            } else {
                showStatus("Sunucu hatası");
            }
        } catch (error) {
            showStatus("⚠️ Bağlantı hatası");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecryption = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!encryptionPassword.trim()) {
            showStatus("Lütfen şifre girin");
            return;
        }

        setIsLoading(true);

        try {
            // Parolayı geçici olarak sakla (Refresh için lazım)
            sessionPasswordRef.current = encryptionPassword;

            let successCount = 0;

            const decryptedMessages = await Promise.all(
                messages.map(async (msg) => {
                    // Parolayı string olarak gönderiyoruz
                    const res = await decryptText(msg.text, encryptionPassword);

                    if (res.success) {
                        successCount++;
                    }

                    return {
                        ...msg,
                        text: res.success ? res.text : msg.text,
                        isDecrypted: res.success,
                        burnOnCopy: res.burnOnCopy,
                        deleteAfterRead: res.deleteAfterRead,
                        isLocalOnly: msg.isLocalOnly,
                        ttl: msg.ttl
                    };
                })
            );

            setMessages(decryptedMessages);
            setIsDecrypted(true);
            setEncryptionPassword("");

            if (successCount > 0) {
                showStatus(successCount === messages.length ? "✓ Tüm mesajlar çözüldü" : `⚠️ ${successCount} mesaj çözüldü`);
            } else {
                showStatus("⚠️ Şifre yanlış olabilir (Hiçbir mesaj çözülemedi)");
            }

        } catch (err) {
            console.error(err);
            showStatus("Beklenmeyen hata");
        } finally {
            setIsLoading(false);
        }
    };

    const refreshMessages = useCallback(async () => {
        if (!authToken) return;

        try {
            const res = await fetch(`/api/sync`, {
                headers: { 'x-sync-token': authToken }
            });

            if (res.ok) {
                const data = await res.json();
                const serverMessages = data.messages || [];

                const updatedMessages = await Promise.all(
                    serverMessages.map(async (serverMsg: any) => {
                        const existing = messages.find(m => m.id === serverMsg.id);

                        // Eğer zaten çözülmüşse ve içerik aynıysa (TTL update), mevcut hali koru
                        if (existing?.isDecrypted && existing.text !== serverMsg.text) {
                            return { ...existing, ttl: serverMsg.ttl };
                        }

                        // Oturum parolası varsa şifreyi çözmeyi dene
                        if (sessionPasswordRef.current) {
                            const result = await decryptText(serverMsg.text, sessionPasswordRef.current);

                            return {
                                ...serverMsg,
                                text: result.success ? result.text : serverMsg.text,
                                isDecrypted: result.success,
                                burnOnCopy: result.burnOnCopy,
                                deleteAfterRead: result.deleteAfterRead,
                                isLocalOnly: false, // Serverdan geldiği için başta false, okununca true olacak
                                ttl: serverMsg.ttl
                            };
                        }

                        // Parola yoksa şifreli haliyle bırak
                        return { ...serverMsg, isDecrypted: false };
                    })
                );

                const localOnlyMessages = messages.filter(m => m.isLocalOnly);
                // ID eşleşmesi yaparak birleştirme mantığını basit tutuyoruz
                setMessages([...updatedMessages, ...localOnlyMessages]);
            } else if (res.status === 401) {
                handleLogout();
            }
        } catch (e) {
            console.error("Refresh error:", e);
        }
    }, [authToken, messages, decryptText, handleLogout]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        // Parola ref kontrolü
        if (!newMessage.trim() || !authToken || !sessionPasswordRef.current) {
            showStatus("Oturum anahtarı bulunamadı, lütfen sayfayı yenileyip tekrar girin.");
            return;
        }

        setIsLoading(true);

        try {
            // Şifrelerken stored parolayı kullanıyoruz
            const encrypted = await encryptText(
                newMessage,
                sessionPasswordRef.current,
                {
                    burnOnCopy,
                    deleteAfterRead
                }
            );

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
                setBurnOnCopy(false);
                setDeleteAfterRead(false);
                showStatus("✓ Gönderildi!");
                await refreshMessages();
            } else if (res.status === 401) {
                handleLogout();
            } else {
                showStatus("❌ Gönderilemedi");
            }
        } catch (error) {
            console.error("Save error:", error);
            showStatus("⚠️ Hata");
        } finally {
            setIsLoading(false);
        }
    };

    // --- DİĞER FONKSİYONLAR (DEĞİŞİKLİK YOK) ---
    const handleReveal = useCallback(async (id: string) => {
        if (!authToken) return;
        try {
            const res = await fetch("/api/sync", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-sync-token": authToken
                },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setMessages(prev => prev.map(m =>
                    m.id === id ? { ...m, isLocalOnly: true, ttl: -1 } : m
                ));
                showStatus("🔓 Mesaj gösterildi", 2000);
            } else if (res.status === 401) {
                handleLogout();
            }
        } catch (e) {
            showStatus("Hata oluştu");
        }
    }, [authToken, handleLogout, showStatus]);

    const handleDelete = useCallback(async (id: string, skipConfirm = false) => {
        if (!authToken) return;
        if (!skipConfirm && !confirm("Silmek istediğinizden emin misiniz?")) return;
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
                showStatus("🗑️ Silindi", 2000);
            } else if (res.status === 401) {
                handleLogout();
            }
        } catch (error) {
            showStatus("Silinemedi");
        }
    }, [authToken, handleLogout, showStatus]);

    const handleRevealAndBurn = useCallback(async (msg: Message) => {
        if (!authToken) return;

        // Önce local olarak görünür yapalım
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isLocalOnly: true, ttl: -1 } : m));

        try {
            // Sunucudan silme isteği (handleDelete'i kullanmıyoruz çünkü o UI'dan da siliyor)
            await fetch("/api/sync", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-sync-token": authToken
                },
                body: JSON.stringify({ id: msg.id }),
            });

            showStatus("🔓 Mesaj okundu ve sunucudan silindi. Sayfa kapanınca tamamen yok olacak.", 3000);
        } catch (e) {
            showStatus("Hata: Mesaj sunucudan silinemedi");
        }
    }, [authToken, showStatus]);

    const handleCopy = useCallback(async (msg: Message) => {
        try {
            await navigator.clipboard.writeText(msg.text);
            setCopiedId(msg.id);
            setTimeout(() => setCopiedId(null), 3000);

            if (msg.burnOnCopy) {
                showStatus("🔥 Kopyalandı ve Silindi", 2000);
                await handleDelete(msg.id, true);
            } else {
                showStatus("📋 Kopyalandı", 2000);
            }
        } catch (e) {
            showStatus("Kopyalanamadı");
        }
    }, [showStatus, handleDelete]);

    const formatTime = useCallback((seconds: number) => {
        if (seconds === -1) return "Kalıcı";
        if (seconds <= 0) return "Süresi doldu";
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (d > 0) return `${d}g ${h}s`;
        if (h > 0) return `${h}s ${m}dk`;
        if (m > 0) return `${m}dk ${s}sn`;
        return `${s}sn`;
    }, []);

    useEffect(() => {
        if (!isDecrypted || messages.length === 0) return;
        const interval = setInterval(() => {
            setMessages(currentMsgs =>
                currentMsgs.map(msg => {
                    if (msg.isLocalOnly) return msg;
                    return {
                        ...msg,
                        ttl: msg.ttl === -1 ? -1 : Math.max(0, msg.ttl - 1)
                    };
                }).filter(msg => msg.isLocalOnly || msg.ttl === -1 || msg.ttl > 0)
            );
        }, 1000);
        return () => clearInterval(interval);
    }, [isDecrypted, messages.length]);

    useEffect(() => {
        if (!isAuthenticated) return;
        let timeoutId: NodeJS.Timeout;
        const IDLE_LIMIT = 300000;
        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                showStatus("⏱️ Oturum kapatıldı");
                handleLogout();
            }, IDLE_LIMIT);
        };
        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();
        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [isAuthenticated, handleLogout, showStatus]);

    useEffect(() => {
        if (!isDecrypted) return;
        const interval = setInterval(() => refreshMessages(), 30000);
        return () => clearInterval(interval);
    }, [isDecrypted, refreshMessages]);

    const messageStats = useMemo(() => {
        const total = messages.length;
        const decrypted = messages.filter(m => m.isDecrypted).length;
        const failed = total - decrypted;
        return { total, decrypted, failed };
    }, [messages]);

    // --- RENDER BLOCKS ---

    // Common Background Component
    const Background = () => (
        <div className="fixed inset-0 min-h-screen w-full overflow-hidden pointer-events-none -z-10 bg-[#fafafa] dark:bg-black">
            <div className="absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 bg-violet-400 dark:bg-violet-900 animate-float" style={{ animationDuration: '20s' }}></div>
            <div className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 bg-fuchsia-400 dark:bg-fuchsia-900 animate-float" style={{ animationDuration: '25s', animationDelay: '-5s' }}></div>
            <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 bg-emerald-400 dark:bg-emerald-900 animate-float" style={{ animationDuration: '22s', animationDelay: '-10s' }}></div>
        </div>
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative font-sans text-gray-900 dark:text-gray-100">
                <Background />

                <div className="w-full max-w-md relative z-10">
                    <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/5"></div>
                    <form onSubmit={handleServerAuth} className="relative p-8 md:p-12 flex flex-col items-center">
                        <div className="w-20 h-20 mb-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[2px] shadow-lg shadow-violet-500/20">
                            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                                <FaLock className="text-3xl text-transparent bg-clip-text bg-gradient-to-tr from-violet-500 to-fuchsia-500" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-2 tracking-tight">Sync Board</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 text-center">
                            Güvenli, şifreli ve geçici veri paylaşımı.
                        </p>

                        <div className="w-full space-y-4">
                            <div className="group relative">
                                <input
                                    type="password"
                                    value={serverPassword}
                                    onChange={(e) => setServerPassword(e.target.value)}
                                    className="peer w-full px-5 py-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none focus:ring-4 focus:ring-violet-500/10 transition-all placeholder-transparent"
                                    placeholder="Password"
                                    id="serverPass"
                                    autoFocus
                                    disabled={isLoading}
                                />
                                <label htmlFor="serverPass" className="absolute left-5 top-4 text-gray-400 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-violet-500 -translate-y-[1.4rem] bg-transparent backdrop-blur-sm px-1 ml-[-4px]">
                                    Sunucu Parolası
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !serverPassword.trim()}
                                className="group w-full py-4 px-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
                            >
                                {isLoading ? <FaSync className="animate-spin mx-auto" /> : "Giriş Yap"}
                            </button>
                        </div>

                        {status && (
                            <div className="mt-6 py-2 px-4 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium animate-fadeIn">
                                {status}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        );
    }

    if (isAuthenticated && !isDecrypted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative font-sans text-gray-900 dark:text-gray-100">
                <Background />

                <div className="w-full max-w-md relative z-10">
                    <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/5"></div>
                    <form onSubmit={handleDecryption} className="relative p-8 md:p-12 flex flex-col items-center">
                        <div className="w-20 h-20 mb-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 p-[2px] shadow-lg shadow-emerald-500/20">
                            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                                <FaShieldAlt className="text-3xl text-emerald-500" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-2 text-center">Veri Çözme</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center px-4">
                            Uçtan uca şifreleme aktif. İçeriği görüntülemek için anahtarınızı girin.
                        </p>

                        <div className="w-full space-y-4">
                            <div className="group relative">
                                <input
                                    type="password"
                                    value={encryptionPassword}
                                    onChange={(e) => setEncryptionPassword(e.target.value)}
                                    className="peer w-full px-5 py-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder-transparent"
                                    placeholder="Key"
                                    id="encPass"
                                    autoFocus
                                    disabled={isLoading}
                                />
                                <label htmlFor="encPass" className="absolute left-5 top-4 text-gray-400 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-emerald-500 -translate-y-[1.4rem] bg-transparent backdrop-blur-sm px-1 ml-[-4px]">
                                    Şifreleme Anahtarı
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !encryptionPassword.trim()}
                                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isLoading ? <FaSync className="animate-spin mx-auto" /> : "Şifreleri Çöz"}
                            </button>
                        </div>

                        {status && <div className={`mt-6 text-xs font-medium px-4 py-2 rounded-full animate-fadeIn ${status.includes("✓") ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}>{status}</div>}
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-6 px-4 md:px-8 relative font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Background />

            <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/20 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 transform hover:rotate-3 transition-transform">
                            <FaLock className="text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-3">
                                Sync Board
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-full tracking-wider">E2EE</span>
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span className="flex items-center gap-1"><FaCheck className="text-emerald-500" /> {messageStats.decrypted} Çözüldü</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>{messageStats.total} Toplam</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:block h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2"></div>
                        <button onClick={refreshMessages} className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all active:scale-95" title="Yenile">
                            <FaSync />
                        </button>
                        <button onClick={handleLogout} className="px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl text-sm font-semibold transition-all active:scale-95">
                            Çıkış
                        </button>
                    </div>
                </div>

                {/* Status Toast */}
                {status && (
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl animate-fadeIn flex items-center gap-2 font-medium">
                        {status}
                    </div>
                )}

                {/* Input Area */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/20 dark:border-white/5 transition-all focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:shadow-[0_8px_40px_rgb(124,58,237,0.12)]">
                    <form onSubmit={handleSave} className="flex flex-col">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="w-full p-6 bg-transparent border-none text-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none min-h-[100px]"
                            placeholder="Güvenli bir şeyler yaz..."
                            rows={3}
                            disabled={isLoading}
                        />

                        <div className="px-4 pb-4 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800/50 mt-2">
                            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-1">
                                {/* TTL Dropdown */}
                                <div className="relative shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isDropdownOpen ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                    >
                                        <FaClock /> {ttlOptions.find(o => o.value === ttlMinutes)?.label} <FaChevronDown className="text-[10px]" />
                                    </button>

                                    {isDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
                                            <div className="absolute bottom-full left-0 mb-2 w-48 z-30 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden py-1 max-h-60 overflow-y-auto">
                                                {ttlOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => { setTtlMinutes(option.value); setIsDropdownOpen(false); }}
                                                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${ttlMinutes === option.value ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-bold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setBurnOnCopy(!burnOnCopy)}
                                    className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${burnOnCopy ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 shadow-sm" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                                >
                                    <FaCopy /> {burnOnCopy ? "Kopyala-Sil" : "Kopyala"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDeleteAfterRead(!deleteAfterRead)}
                                    className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${deleteAfterRead ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                                >
                                    <FaEye /> {deleteAfterRead ? "1-Seferlik" : "Sonsuz"}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !newMessage.trim()}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-500/20 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isLoading ? <FaSync className="animate-spin" /> : <><FaPaperPlane /> Gönder</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Messages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
                    {messages.length === 0 ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-60">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                <FaFingerprint className="text-4xl text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Henüz mesaj yok</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                Tüm mesajlar PBKDF2 ve AES-GCM ile uçtan uca şifrelenir. Sunucu içeriği asla göremez.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={msg.id}
                                className={`group relative flex flex-col p-6 rounded-[1.5rem] border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 
                                    ${msg.isLocalOnly
                                        ? "bg-blue-50/80 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-500/20"
                                        : "bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border-white/40 dark:border-white/5"
                                    }`}
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                {/* Header / Controls */}
                                <div className="flex justify-between items-start mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full 
                                        ${msg.isLocalOnly
                                            ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
                                            : msg.ttl === -1
                                                ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                                : msg.ttl < 60
                                                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse"
                                                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                                        }`}>
                                        <FaClock /> {msg.isLocalOnly ? "Lokal" : formatTime(msg.ttl)}
                                    </div>

                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all scale-100 sm:translate-x-4 sm:group-hover:translate-x-0">
                                        {msg.isDecrypted && (
                                            <button
                                                onClick={() => handleCopy(msg)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-violet-600 hover:bg-violet-50 transition-colors shadow-sm"
                                                title="Kopyala"
                                            >
                                                {copiedId === msg.id ? <FaCheck /> : <FaCopy />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                                            title="Sil"
                                        >
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-auto custom-scrollbar">
                                    {(msg.isDecrypted && msg.deleteAfterRead && !msg.isLocalOnly) ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
                                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400">
                                                <FaEye className="text-xl" />
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">1-Seferlik Mesaj</p>
                                            <button
                                                onClick={() => handleRevealAndBurn(msg)}
                                                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold rounded-lg shadow-md hover:scale-105 transition-transform"
                                            >
                                                Oku ve Sil
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-700 dark:text-gray-300 break-words">
                                            {msg.text}
                                        </p>
                                    )}
                                </div>

                                {/* Visual Decoration */}
                                {msg.isDecrypted && !msg.isLocalOnly && (
                                    <div className="absolute bottom-4 right-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <FaShieldAlt className="text-4xl" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}