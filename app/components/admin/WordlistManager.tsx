"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FaKey,
    FaCopy,
    FaCheck,
    FaSync,
    FaShieldAlt,
    FaSlidersH,
    FaTerminal,
    FaExternalLinkAlt,
    FaTrash,
    FaHistory,
    FaBolt,
    FaMinus,
    FaPlus,
    FaExclamationTriangle
} from "react-icons/fa";

interface WordlistManagerProps {
    authToken: string;
    onNavigate?: (module: string) => void;
}

interface PasswordResult {
    password: string;
    words: string[];
    wordCount: number;
    totalLength: number;
    strength: "Zayıf" | "Orta" | "Güçlü" | "Çok Güçlü";
    strengthScore: number;
    separator: string;
    wordLengths: number[];
    passwords?: string[];
    isRateLimitBypassed?: boolean;
}

interface HistoryItem {
    id: string;
    password: string;
    strength: string;
    timestamp: number;
}

const AVAILABLE_LENGTHS = [
    { len: 3, count: 509 },
    { len: 4, count: 1399 },
    { len: 5, count: 3339 },
    { len: 6, count: 3311 },
    { len: 7, count: 3500 },
    { len: 8, count: 3553 },
    { len: 9, count: 2670 },
    { len: 10, count: 2063 }
];

const SEPARATOR_PRESETS = [
    { label: "Tire (-)", value: "-" },
    { label: "Alt Tire (_)", value: "_" },
    { label: "Nokta (.)", value: "." },
    { label: "Et (@)", value: "@" },
    { label: "Ünlem (!)", value: "!" },
    { label: "Boşluk", value: " " },
    { label: "Bitişik", value: "" },
];

export default function WordlistManager({ authToken }: WordlistManagerProps) {
    // Form controls
    const [wordCount, setWordCount] = useState<number>(3);
    const [selectedLengths, setSelectedLengths] = useState<number[]>([5, 6, 7]);
    const [separator, setSeparator] = useState<string>("-");
    const [customSeparator, setCustomSeparator] = useState<string>("");
    const [casing, setCasing] = useState<"none" | "first" | "all" | "random">("none");
    const [includeNumber, setIncludeNumber] = useState<boolean>(false);
    const [bulkCount, setBulkCount] = useState<number>(1);

    // Generation state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentResult, setCurrentResult] = useState<PasswordResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Feedback
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // API panel state
    const [originUrl, setOriginUrl] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOriginUrl(window.location.origin);
        }
    }, []);

    // Toggle word length selection
    const toggleLength = (len: number) => {
        if (selectedLengths.includes(len)) {
            if (selectedLengths.length > 1) {
                setSelectedLengths(selectedLengths.filter(l => l !== len));
            }
        } else {
            setSelectedLengths([...selectedLengths, len].sort((a, b) => a - b));
        }
    };

    // Quick presets for lengths
    const applyLengthPreset = (preset: "standard" | "short" | "long" | "all") => {
        if (preset === "standard") setSelectedLengths([5, 6, 7]);
        if (preset === "short") setSelectedLengths([3, 4, 5]);
        if (preset === "long") setSelectedLengths([7, 8, 9, 10]);
        if (preset === "all") setSelectedLengths([3, 4, 5, 6, 7, 8, 9, 10]);
    };

    // Active separator value
    const effectiveSeparator = customSeparator !== "" ? customSeparator : separator;

    // Generate password
    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (authToken) {
                headers["Authorization"] = `Bearer ${authToken}`;
            }

            const res = await fetch("/api/generate-password", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    wordCount,
                    wordLengths: selectedLengths,
                    separator: effectiveSeparator,
                    capitalize: casing,
                    includeNumber,
                    count: bulkCount
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Şifre üretilemedi.");
            }

            setCurrentResult(data);

            // Add to session history
            const newHistoryItem: HistoryItem = {
                id: Math.random().toString(36).substring(2, 9),
                password: data.password,
                strength: data.strength,
                timestamp: Date.now()
            };
            setHistory(prev => [newHistoryItem, ...prev.slice(0, 19)]);
        } catch (err: any) {
            setErrorMessage(err.message || "Bir hata meydana geldi.");
        } finally {
            setIsLoading(false);
        }
    }, [authToken, wordCount, selectedLengths, effectiveSeparator, casing, includeNumber, bulkCount]);

    // Initial generate on mount if empty
    useEffect(() => {
        if (!currentResult) {
            handleGenerate();
        }
    }, [handleGenerate, currentResult]);

    // Copy to clipboard helper
    const handleCopy = (text: string, identifier?: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(identifier || text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    // Strength styling
    const getStrengthBadge = (strength: string) => {
        switch (strength) {
            case "Çok Güçlü":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
            case "Güçlü":
                return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
            case "Orta":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
            default:
                return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
        }
    };

    const getStrengthBarColor = (score: number) => {
        if (score >= 85) return "bg-emerald-500";
        if (score >= 65) return "bg-blue-500";
        if (score >= 40) return "bg-amber-500";
        return "bg-rose-500";
    };

    // Total words in selected lengths
    const totalWordsInSelection = useMemo(() => {
        return AVAILABLE_LENGTHS
            .filter(item => selectedLengths.includes(item.len))
            .reduce((acc, curr) => acc + curr.count, 0);
    }, [selectedLengths]);

    // Curl snippet for API display
    const curlSnippet = useMemo(() => {
        const url = `${originUrl || "https://keremkuyucu.com.tr"}/api/generate-password`;
        return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${authToken ? authToken.substring(0, 20) + "..." : "<JWT_TOKEN>"}" \\
  -d '{"wordCount": ${wordCount}, "wordLengths": [${selectedLengths.join(",")}], "separator": "${effectiveSeparator}"}'`;
    }, [originUrl, authToken, wordCount, selectedLengths, effectiveSeparator]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center text-lg shadow-md shadow-violet-500/20">
                        <FaKey />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Türkçe Şifre Oluşturucu</h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                20.344 Kelime
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Türkçe sözlük kelimelerinden akılda kalıcı, yüksek güvenlikli şifreler üretin.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                        <FaBolt className="text-[11px]" />
                        <span>JWT Aktif: Limitsiz</span>
                    </span>
                    <a
                        href="/api/generate-password"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                        title="Genel API'yi Aç"
                    >
                        <FaExternalLinkAlt className="text-xs" />
                        <span className="hidden md:inline">API</span>
                    </a>
                </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaExclamationTriangle />
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={handleGenerate} className="underline text-xs">Tekrar Dene</button>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Controls (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                    <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FaSlidersH className="text-violet-500" />
                                <span>Şifre Ayarları</span>
                            </h3>
                            <span className="text-xs text-gray-400">
                                Havuz: <strong className="text-violet-600 dark:text-violet-400">{totalWordsInSelection.toLocaleString("tr-TR")}</strong> kelime
                            </span>
                        </div>

                        {/* 1. Kelime Sayısı - CLEAN STEPPER + PRESET PILLS (No broken sliders!) */}
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                                Kelime Sayısı
                            </label>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Stepper [-] Value [+] */}
                                <div className="inline-flex items-center bg-gray-100 dark:bg-zinc-800 rounded-xl p-1 border border-gray-200 dark:border-zinc-700">
                                    <button
                                        type="button"
                                        onClick={() => setWordCount(prev => Math.max(1, prev - 1))}
                                        disabled={wordCount <= 1}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                                        title="Azalt"
                                    >
                                        <FaMinus className="text-xs" />
                                    </button>
                                    <span className="w-12 text-center font-bold text-base font-mono text-gray-900 dark:text-white">
                                        {wordCount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setWordCount(prev => Math.min(10, prev + 1))}
                                        disabled={wordCount >= 10}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                                        title="Artır"
                                    >
                                        <FaPlus className="text-xs" />
                                    </button>
                                </div>

                                {/* Quick Selector Pills */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {[2, 3, 4, 5, 6].map(count => {
                                        const isSelected = wordCount === count;
                                        return (
                                            <button
                                                key={count}
                                                type="button"
                                                onClick={() => setWordCount(count)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                    isSelected
                                                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                                                        : "bg-gray-100 dark:bg-zinc-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                                                }`}
                                            >
                                                {count} {count === 3 && "(Önerilen)"}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 2. Kelime Uzunlukları */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Kelime Uzunlukları
                                </label>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <button
                                        type="button"
                                        onClick={() => applyLengthPreset("standard")}
                                        className="text-violet-600 dark:text-violet-400 hover:underline font-semibold"
                                    >
                                        Standart (5-6-7)
                                    </button>
                                    <span className="text-gray-300 dark:text-zinc-700">|</span>
                                    <button
                                        type="button"
                                        onClick={() => applyLengthPreset("all")}
                                        className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        Tümü
                                    </button>
                                    <span className="text-gray-300 dark:text-zinc-700">|</span>
                                    <button
                                        type="button"
                                        onClick={() => applyLengthPreset("short")}
                                        className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        Kısa
                                    </button>
                                    <span className="text-gray-300 dark:text-zinc-700">|</span>
                                    <button
                                        type="button"
                                        onClick={() => applyLengthPreset("long")}
                                        className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        Uzun
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                                {AVAILABLE_LENGTHS.map(({ len, count }) => {
                                    const isSelected = selectedLengths.includes(len);
                                    return (
                                        <button
                                            key={len}
                                            type="button"
                                            onClick={() => toggleLength(len)}
                                            className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                                                isSelected
                                                    ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20"
                                                    : "bg-gray-50 dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 hover:border-violet-400/50"
                                            }`}
                                        >
                                            <div className="font-extrabold text-sm font-mono">{len}</div>
                                            <div className="text-[9px] opacity-75 mt-0.5">harf</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. Ayırıcı Karakter */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                                Ayırıcı Karakter
                            </label>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {SEPARATOR_PRESETS.map(preset => {
                                    const isActive = customSeparator === "" && separator === preset.value;
                                    return (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => {
                                                setSeparator(preset.value);
                                                setCustomSeparator("");
                                            }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                                isActive
                                                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                                                    : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-violet-300"
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    );
                                })}
                                <div className="flex items-center gap-1 ml-auto">
                                    <span className="text-[11px] text-gray-400">Özel:</span>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="-"
                                        value={customSeparator}
                                        onChange={e => setCustomSeparator(e.target.value)}
                                        className="w-16 px-2 py-1 text-center font-mono text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. Ek Ayarlar (Casing, Sayı, Adet) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                            {/* Harf Düzeni */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Harf Formatı
                                </label>
                                <select
                                    value={casing}
                                    onChange={e => setCasing(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                >
                                    <option value="none">küçük harf (elma)</option>
                                    <option value="first">İlk Harf Büyük (Elma)</option>
                                    <option value="all">TÜMÜ BÜYÜK (ELMA)</option>
                                    <option value="random">Rastgele (Elma/elma)</option>
                                </select>
                            </div>

                            {/* Sayı Ekleme */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Rakam Ekle
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIncludeNumber(!includeNumber)}
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${
                                        includeNumber
                                            ? "bg-violet-600/10 border-violet-500/50 text-violet-700 dark:text-violet-300 font-bold"
                                            : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500"
                                    }`}
                                >
                                    <span>Sona Rakam (10-99)</span>
                                    <span>{includeNumber ? "✓" : "✗"}</span>
                                </button>
                            </div>

                            {/* Adet */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Üretim Adedi
                                </label>
                                <div className="grid grid-cols-3 gap-1">
                                    {[1, 5, 10].map(cnt => (
                                        <button
                                            key={cnt}
                                            type="button"
                                            onClick={() => setBulkCount(cnt)}
                                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                                bulkCount === cnt
                                                    ? "bg-violet-600 text-white border-violet-600"
                                                    : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300"
                                            }`}
                                        >
                                            {cnt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-black text-base shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                        >
                            <FaSync className={`text-lg ${isLoading ? "animate-spin" : ""}`} />
                            <span>{isLoading ? "Şifre Oluşturuluyor..." : "Yeni Şifre Oluştur"}</span>
                        </button>
                    </div>
                </div>

                {/* Right: Output (5 cols) */}
                <div className="lg:col-span-5 space-y-5">
                    {/* Primary Password Display Card */}
                    <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FaShieldAlt className="text-violet-500" />
                                <span>Oluşturulan Şifre</span>
                            </h3>
                            {currentResult && (
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStrengthBadge(currentResult.strength)}`}>
                                    {currentResult.strength}
                                </span>
                            )}
                        </div>

                        {currentResult ? (
                            <div className="space-y-4">
                                {/* Password Field Box */}
                                <div className="relative group">
                                    <div className="p-4 bg-gray-50/90 dark:bg-zinc-950/90 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 font-mono text-lg font-bold text-gray-900 dark:text-white break-all select-all shadow-inner tracking-wide">
                                        {currentResult.password}
                                    </div>
                                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(currentResult.password, "primary")}
                                            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                                                copiedText === "primary"
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-violet-600 hover:text-white"
                                            }`}
                                            title="Panoya Kopyala"
                                        >
                                            {copiedText === "primary" ? <FaCheck /> : <FaCopy />}
                                            <span>{copiedText === "primary" ? "Kopyalandı!" : "Kopyala"}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleGenerate}
                                            disabled={isLoading}
                                            className="p-2 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-violet-600 hover:text-white rounded-xl text-xs transition-colors shadow-sm"
                                            title="Yeniden Üret"
                                        >
                                            <FaSync className={isLoading ? "animate-spin" : ""} />
                                        </button>
                                    </div>
                                </div>

                                {/* Strength Progress Bar */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 font-semibold">Güvenlik Seviyesi</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            %{currentResult.strengthScore} ({currentResult.strength})
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 rounded-full ${getStrengthBarColor(currentResult.strengthScore)}`}
                                            style={{ width: `${currentResult.strengthScore}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Stats Badges */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Uzunluk</div>
                                        <div className="text-base font-extrabold text-gray-900 dark:text-white">
                                            {currentResult.totalLength}
                                        </div>
                                    </div>
                                    <div className="p-2.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Kelime</div>
                                        <div className="text-base font-extrabold text-gray-900 dark:text-white">
                                            {currentResult.wordCount}
                                        </div>
                                    </div>
                                    <div className="p-2.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Benzersiz</div>
                                        <div className="text-base font-extrabold text-gray-900 dark:text-white">
                                            {new Set(currentResult.password.toLowerCase()).size}
                                        </div>
                                    </div>
                                </div>

                                {/* Words Breakdown */}
                                <div className="space-y-1.5 pt-1">
                                    <div className="text-xs text-gray-500 font-semibold">Kullanılan Kelimeler:</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {currentResult.words.map((w, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleCopy(w, `word_${idx}`)}
                                                className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-mono font-medium border border-violet-200 dark:border-violet-800/40 hover:bg-violet-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                                                title="Kelimeyi kopyala"
                                            >
                                                <span>{w}</span>
                                                <span className="text-[10px] opacity-60">({w.length})</span>
                                                {copiedText === `word_${idx}` && <FaCheck className="text-[10px] text-emerald-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bulk List */}
                                {currentResult.passwords && currentResult.passwords.length > 1 && (
                                    <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                Toplu Şifreler ({currentResult.passwords.length})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(currentResult.passwords!.join("\n"), "all_bulk")}
                                                className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-bold"
                                            >
                                                {copiedText === "all_bulk" ? "Tümü Kopyalandı!" : "Tümünü Kopyala"}
                                            </button>
                                        </div>
                                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                            {currentResult.passwords.map((pwd, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800/60 rounded-xl text-xs font-mono"
                                                >
                                                    <span className="truncate mr-2 text-gray-800 dark:text-gray-200">{pwd}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(pwd, `bulk_${i}`)}
                                                        className="text-gray-400 hover:text-violet-600 shrink-0 p-1"
                                                        title="Kopyala"
                                                    >
                                                        {copiedText === `bulk_${i}` ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-400">
                                <FaKey className="text-3xl mx-auto mb-2 opacity-40" />
                                <p className="text-xs">Şifre oluşturmak için butona tıklayın.</p>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    {history.length > 0 && (
                        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                    <FaHistory className="text-violet-500" />
                                    <span>Geçmiş ({history.length})</span>
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setHistory([])}
                                    className="text-gray-400 hover:text-red-500 text-xs transition-colors"
                                    title="Temizle"
                                >
                                    <FaTrash className="text-[10px]" />
                                </button>
                            </div>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {history.map(item => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-2 bg-gray-50/80 dark:bg-zinc-800/40 rounded-xl text-xs font-mono"
                                    >
                                        <span className="truncate mr-2 text-gray-800 dark:text-gray-300">{item.password}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(item.password, item.id)}
                                            className="text-gray-400 hover:text-violet-600 shrink-0 p-1 transition-colors"
                                            title="Kopyala"
                                        >
                                            {copiedText === item.id ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* API Docs & cURL */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2">
                        <FaTerminal className="text-violet-500" />
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                            Genel API &amp; JWT cURL
                        </h3>
                    </div>
                    <span className="text-xs font-mono text-gray-400">POST /api/generate-password</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 p-3.5 bg-gray-50 dark:bg-zinc-950/50 rounded-xl border border-gray-200/60 dark:border-zinc-800/60 text-gray-600 dark:text-gray-400">
                        <p>• <strong>Genel:</strong> Dakikada 60 istek limiti (IP bazlı).</p>
                        <p>• <strong>JWT Token:</strong> Başlığa <code className="px-1 py-0.5 rounded bg-gray-200 dark:bg-zinc-800 font-mono">Authorization: Bearer &lt;token&gt;</code> eklendiğinde limitsizdir.</p>
                    </div>

                    <div className="relative group">
                        <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                            {curlSnippet}
                        </pre>
                        <button
                            type="button"
                            onClick={() => handleCopy(curlSnippet, "curl")}
                            className="absolute top-2 right-2 p-1.5 bg-zinc-800 text-zinc-300 hover:text-white rounded-md text-[10px] transition-colors"
                            title="Kopyala"
                        >
                            {copiedText === "curl" ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
