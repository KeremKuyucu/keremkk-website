"use client";

import { useState, useEffect } from "react";
import {
    FaLock,
    FaStickyNote,
    FaSignOutAlt,
    FaChartBar,
    FaWallet,
    FaEnvelope,
    FaServer,
    FaLink,
    FaCreditCard,
    FaThLarge,
    FaBars,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaExternalLinkAlt,
    FaShieldAlt
} from "react-icons/fa";
import OverviewDashboard from "@/app/components/admin/OverviewDashboard";
import NotesManager from "@/app/components/admin/NotesManager";
import MessagesManager from "@/app/components/admin/MessagesManager";
import AnalyticsManager from "@/app/components/admin/AnalyticsManager";
import ExpenseTracker from "@/app/components/admin/ExpenseTracker";
import SubscriptionManager from "@/app/components/admin/SubscriptionManager";
import LinkManager from "@/app/components/admin/LinkManager";
import MonitorManager from "@/app/components/admin/MonitorManager";

// --- Admin Modules Configuration ---
interface AdminModule {
    id: string;
    label: string;
    icon: React.ElementType;
    component: React.ComponentType<any>;
}

const MODULES: AdminModule[] = [
    {
        id: "overview",
        label: "Genel Bakış",
        icon: FaThLarge,
        component: OverviewDashboard
    },
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
    },
    {
        id: "analytics",
        label: "Analiz",
        icon: FaChartBar,
        component: AnalyticsManager
    },
    {
        id: "expenses",
        label: "Harcamalar",
        icon: FaWallet,
        component: ExpenseTracker
    },
    {
        id: "subscriptions",
        label: "Abonelikler",
        icon: FaCreditCard,
        component: SubscriptionManager
    },
    {
        id: "links",
        label: "Kısa Linkler",
        icon: FaLink,
        component: LinkManager
    },
    {
        id: "monitor",
        label: "Monitör",
        icon: FaServer,
        component: MonitorManager
    }
];

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Active Tab & Navigation
    const [activeTab, setActiveTab] = useState<string>(MODULES[0].id);

    // Sidebar States
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Session Persistence: Auto-restore session from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem("admin_session_token");
        if (savedToken) {
            setAuthToken(savedToken);
            setIsAuthenticated(true);
        }
    }, []);

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
                localStorage.setItem("admin_session_token", token);
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
        localStorage.removeItem("admin_session_token");
    };

    // --- Render Login Screen ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafafa] dark:bg-black relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-[100px]" />

                <form onSubmit={handleLogin} className="w-full max-w-md bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/40 dark:border-zinc-800 shadow-2xl flex flex-col items-center gap-6 relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 mb-2">
                        <FaLock className="text-3xl" />
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Yönetim Paneli</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Devam etmek için yönetici şifresini girin.</p>
                    </div>

                    <div className="w-full space-y-3">
                        <input
                            type="password"
                            className="w-full px-5 py-4 rounded-xl bg-white dark:bg-black/60 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-400 font-medium transition-all"
                            placeholder="Şifre"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoFocus
                        />
                        <button
                            disabled={isLoading || !password}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-base hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 shadow-lg cursor-pointer"
                        >
                            {isLoading ? "Doğrulanıyor..." : "Giriş Yap"}
                        </button>
                    </div>

                    {errorMessage && (
                        <div className="w-full py-3 px-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl text-center">
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>
        );
    }

    const currentModule = MODULES.find(m => m.id === activeTab) || MODULES[0];
    const ActiveComponent = currentModule.component;

    // --- Render Modern Dashboard Layout with Sidebar ---
    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-black font-sans text-gray-900 dark:text-gray-100 flex flex-col md:flex-row antialiased">
            
            {/* Desktop Left Sidebar */}
            <aside
                className={`hidden md:flex flex-col justify-between sticky top-0 h-screen transition-all duration-300 ease-in-out z-30 border-r border-gray-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl ${
                    isSidebarCollapsed ? "w-20" : "w-64"
                }`}
            >
                {/* Sidebar Header */}
                <div>
                    <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-violet-500/20">
                                <FaShieldAlt className="text-lg" />
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="truncate">
                                    <h2 className="text-sm font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                                        Kerem KK
                                    </h2>
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                        <span>Yönetici</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Collapse Toggle Button */}
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors"
                            title={isSidebarCollapsed ? "Genişlet" : "Daralt"}
                        >
                            {isSidebarCollapsed ? <FaChevronRight className="text-xs" /> : <FaChevronLeft className="text-xs" />}
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="p-3 space-y-1">
                        {!isSidebarCollapsed && (
                            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Modüller
                            </div>
                        )}
                        {MODULES.map((module) => {
                            const isActive = activeTab === module.id;
                            const Icon = module.icon;
                            return (
                                <button
                                    key={module.id}
                                    onClick={() => setActiveTab(module.id)}
                                    title={isSidebarCollapsed ? module.label : undefined}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative group cursor-pointer ${
                                        isActive
                                            ? "bg-violet-600/10 text-violet-600 dark:text-violet-400 font-bold"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-zinc-900/60"
                                    } ${isSidebarCollapsed ? "justify-center" : ""}`}
                                >
                                    <Icon className={`text-base shrink-0 transition-transform ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
                                    {!isSidebarCollapsed && <span className="truncate">{module.label}</span>}
                                    {isActive && (
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-violet-600 rounded-l-full" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-gray-100 dark:border-zinc-800/80 space-y-1">
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        title={isSidebarCollapsed ? "Web Sitesine Git" : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-zinc-900/60 transition-all ${
                            isSidebarCollapsed ? "justify-center" : ""
                        }`}
                    >
                        <FaExternalLinkAlt className="text-xs shrink-0" />
                        {!isSidebarCollapsed && <span>Siteyi Aç</span>}
                    </a>

                    <button
                        onClick={handleLogout}
                        title={isSidebarCollapsed ? "Çıkış Yap" : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer ${
                            isSidebarCollapsed ? "justify-center" : ""
                        }`}
                    >
                        <FaSignOutAlt className="text-sm shrink-0" />
                        {!isSidebarCollapsed && <span>Çıkış Yap</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Header Bar */}
            <div className="md:hidden sticky top-0 z-40 flex items-center justify-between p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300"
                    >
                        <FaBars className="text-lg" />
                    </button>
                    <div className="flex items-center gap-2">
                        <currentModule.icon className="text-violet-500" />
                        <span className="font-bold text-sm">{currentModule.label}</span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Çıkış"
                >
                    <FaSignOutAlt />
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    />

                    {/* Drawer Content */}
                    <div className="relative w-72 max-w-[80vw] bg-white dark:bg-zinc-950 h-full p-4 flex flex-col justify-between z-10 shadow-2xl">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold">
                                        <FaShieldAlt />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">Kerem KK</div>
                                        <div className="text-xs text-emerald-500 font-semibold">Oturum Açık</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <nav className="space-y-1">
                                {MODULES.map((module) => {
                                    const isActive = activeTab === module.id;
                                    const Icon = module.icon;
                                    return (
                                        <button
                                            key={module.id}
                                            onClick={() => {
                                                setActiveTab(module.id);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                                isActive
                                                    ? "bg-violet-600/10 text-violet-600 dark:text-violet-400 font-bold"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900"
                                            }`}
                                        >
                                            <Icon className="text-base shrink-0" />
                                            <span>{module.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-1">
                            <a
                                href="/"
                                target="_blank"
                                rel="noreferrer"
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500"
                            >
                                <FaExternalLinkAlt className="text-xs shrink-0" />
                                <span>Siteyi Aç</span>
                            </a>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500"
                            >
                                <FaSignOutAlt className="text-sm shrink-0" />
                                <span>Çıkış Yap</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Desktop Top Navbar Bar */}
                <div className="hidden md:flex justify-between items-center px-8 py-4 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border-b border-gray-200/60 dark:border-zinc-800/60 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/10 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center text-sm font-bold">
                            <currentModule.icon />
                        </div>
                        <div>
                            <span className="text-xs text-gray-400">Yönetim Paneli /</span>{" "}
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{currentModule.label}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Canlı Bağlantı
                        </span>
                    </div>
                </div>

                {/* Module Dynamic Content */}
                <div className="p-4 md:p-8 flex-1">
                    <div className="max-w-7xl mx-auto w-full">
                        <ActiveComponent
                            authToken={authToken!}
                            onNavigate={(moduleId: string) => setActiveTab(moduleId)}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
