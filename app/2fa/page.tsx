"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { FaShieldAlt, FaCopy, FaCheck, FaClock, FaKey } from "react-icons/fa";

export default function TwoFAPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [storedPassword, setStoredPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // TOTP State
    const [totpCode, setTotpCode] = useState("");
    const [remaining, setRemaining] = useState(30);
    const [period, setPeriod] = useState(30);
    const [copied, setCopied] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // --- Login ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setIsLoading(true);
        setErrorMessage("");

        try {
            const res = await fetch("/api/2fa", {
                method: "POST",
                headers: { "x-2fa-password": password }
            });

            if (res.ok) {
                const data = await res.json();
                setTotpCode(data.code);
                setRemaining(data.remaining);
                setPeriod(data.period);
                setStoredPassword(password);
                setIsAuthenticated(true);
                setPassword("");
            } else {
                setErrorMessage("Giriş başarısız: Şifre hatalı");
            }
        } catch {
            setErrorMessage("Bağlantı hatası");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Refresh TOTP ---
    const refreshTotp = useCallback(async () => {
        if (!storedPassword) return;

        try {
            const res = await fetch("/api/2fa", {
                method: "GET",
                headers: { "x-2fa-password": storedPassword }
            });

            if (res.ok) {
                const data = await res.json();
                setTotpCode(data.code);
                setRemaining(data.remaining);
                setPeriod(data.period);
            }
        } catch (err) {
            console.error("TOTP refresh error:", err);
        }
    }, [storedPassword]);

    // --- Countdown Timer ---
    useEffect(() => {
        if (!isAuthenticated) return;

        // Countdown every second
        countdownRef.current = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) {
                    // Time to refresh
                    refreshTotp();
                    return period;
                }
                return prev - 1;
            });
        }, 1000);

        // Also refresh code near expiry boundary in case of drift
        intervalRef.current = setInterval(() => {
            refreshTotp();
        }, period * 1000);

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isAuthenticated, period, refreshTotp]);

    // --- Copy to Clipboard ---
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(totpCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
            const textarea = document.createElement("textarea");
            textarea.value = totpCode;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // --- Progress for countdown ring ---
    const progress = (remaining / period) * 100;
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // --- Login Screen ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafafa] dark:bg-black relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[100px]" />
                <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[80px]" />

                <form
                    onSubmit={handleLogin}
                    className="w-full max-w-md bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center gap-6 relative z-10"
                >
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-2">
                        <FaShieldAlt className="text-3xl" />
                    </div>

                    {/* Title */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            2FA Authenticator
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            TOTP kodlarına erişmek için şifre girin.
                        </p>
                    </div>

                    {/* Input */}
                    <div className="w-full space-y-3">
                        <div className="relative">
                            <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="2fa-password-input"
                                type="password"
                                className="w-full pl-11 pr-5 py-4 rounded-xl bg-white dark:bg-black/50 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 font-medium transition-all"
                                placeholder="Şifre"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button
                            id="2fa-login-btn"
                            disabled={isLoading || !password}
                            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                        >
                            {isLoading ? "Doğrulanıyor..." : "Giriş Yap"}
                        </button>
                    </div>

                    {/* Error */}
                    {errorMessage && (
                        <div className="w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl text-center animate-pulse">
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>
        );
    }

    // --- TOTP Display ---
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafafa] dark:bg-black relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />

            <div className="w-full max-w-md bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center gap-8 relative z-10">

                {/* Countdown Ring */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 120 120">
                        {/* Background circle */}
                        <circle
                            cx="60" cy="60" r="52"
                            fill="none"
                            stroke="currentColor"
                            className="text-gray-200 dark:text-zinc-800"
                            strokeWidth="6"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="60" cy="60" r="52"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#0891b2" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Timer text */}
                    <div className="flex flex-col items-center">
                        <FaClock className={`text-lg mb-1 ${remaining <= 5 ? "text-red-500 animate-pulse" : "text-emerald-500"}`} />
                        <span className={`text-3xl font-bold tabular-nums ${remaining <= 5 ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
                            {remaining}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">saniye</span>
                    </div>
                </div>

                {/* Label */}
                <div className="text-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        TOTP Kodu
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Kod her {period} saniyede yenilenir
                    </p>
                </div>

                {/* TOTP Code Display */}
                <button
                    id="2fa-copy-btn"
                    onClick={handleCopy}
                    className="group relative w-full"
                >
                    <div className={`
                        flex items-center justify-center gap-3 py-5 px-6 rounded-2xl
                        bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20
                        border-2 ${remaining <= 5 ? "border-red-300 dark:border-red-800" : "border-emerald-200 dark:border-emerald-800"}
                        hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer
                        hover:scale-[1.02] active:scale-[0.98]
                    `}>
                        {/* Code digits */}
                        <div className="flex items-center gap-2">
                            {totpCode.split("").map((digit, i) => (
                                <span
                                    key={i}
                                    className={`
                                        text-4xl font-bold tabular-nums
                                        ${remaining <= 5 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}
                                    `}
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    {digit}
                                </span>
                            ))}
                        </div>

                        {/* Copy icon */}
                        <div className={`
                            ml-2 p-2 rounded-lg transition-all
                            ${copied
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-200/50 dark:bg-zinc-700/50 text-gray-500 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600"
                            }
                        `}>
                            {copied ? <FaCheck /> : <FaCopy />}
                        </div>
                    </div>

                    {/* Copy tooltip */}
                    <span className={`
                        absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium
                        transition-all duration-200
                        ${copied ? "text-emerald-500 opacity-100" : "text-gray-400 opacity-0 group-hover:opacity-100"}
                    `}>
                        {copied ? "Kopyalandı!" : "Kopyalamak için tıkla"}
                    </span>
                </button>

                {/* Security badge */}
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-2">
                    <FaShieldAlt className="text-emerald-500" />
                    <span>Şifreli bağlantı üzerinden güvenli</span>
                </div>
            </div>
        </div>
    );
}
