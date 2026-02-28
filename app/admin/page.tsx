"use client";
import { useState } from "react";
import { FaLock, FaStickyNote, FaSignOutAlt } from "react-icons/fa";
import NotesManager from "@/app/components/admin/NotesManager";
import MessagesManager from "@/app/components/admin/MessagesManager";
import { FaEnvelope } from "react-icons/fa";

// --- Admin Modules Configuration ---
interface AdminModule {
    id: string;
    label: string;
    icon: React.ElementType;
    component: React.ElementType<{ authToken: string }>;
}

const MODULES: AdminModule[] = [
    {
        id: "notes",
        label: "Notlar",
        icon: FaStickyNote,
        component: NotesManager
    },
    {
        id: "messages",
        label: "Mesajlar",
        icon: FaEnvelope,
        component: MessagesManager
    }
];

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Varsayılan olarak ilk modülü seç
    const [activeTab, setActiveTab] = useState<string>(MODULES[0].id);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setIsLoading(true);
        setErrorMessage("");

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "x-sync-password": password }
            });

            if (res.ok) {
                const { token } = await res.json();
                setAuthToken(token);
                setIsAuthenticated(true);
                setPassword("");
            } else {
                setErrorMessage("Giriş başarısız: Şifre hatalı");
            }
        } catch (error) {
            setErrorMessage("Bağlantı hatası");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setAuthToken(null);
        setIsAuthenticated(false);
        setActiveTab(MODULES[0].id);
    };

    // --- Render Login ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafafa] dark:bg-black relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-[100px]" />

                <form onSubmit={handleLogin} className="w-full max-w-md bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center gap-6 relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 mb-2">
                        <FaLock className="text-3xl" />
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Yönetim Paneli</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Devam etmek için şifre girin.</p>
                    </div>

                    <div className="w-full space-y-3">
                        <input
                            type="password"
                            className="w-full px-5 py-4 rounded-xl bg-white dark:bg-black/50 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-400 font-medium transition-all"
                            placeholder="Şifre"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoFocus
                        />
                        <button
                            disabled={isLoading || !password}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg"
                        >
                            {isLoading ? "Denetleniyor..." : "Giriş Yap"}
                        </button>
                    </div>

                    {errorMessage && (
                        <div className="w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl text-center animate-pulse">
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>
        );
    }

    const ActiveComponent = MODULES.find(m => m.id === activeTab)?.component || MODULES[0].component;

    // --- Render Dashboard ---
    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-black font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <div className="max-w-7xl mx-auto w-full p-4 md:p-8 flex-1 flex flex-col gap-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md">
                            <FaLock />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Yönetim Paneli</h1>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>Oturum Açık</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-xl p-1 overflow-x-auto max-w-full">
                        {MODULES.map((module) => (
                            <button
                                key={module.id}
                                onClick={() => setActiveTab(module.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === module.id
                                    ? "bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                                    }`}
                            >
                                <module.icon /> {module.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        <FaSignOutAlt /> Çıkış
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <ActiveComponent authToken={authToken!} />
                </div>
            </div>
        </div>
    );
}
