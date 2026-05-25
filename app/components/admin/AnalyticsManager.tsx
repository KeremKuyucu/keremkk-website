"use client";
import { useState, useEffect } from "react";
import { FaChartBar, FaUser, FaMobileAlt, FaClock } from "react-icons/fa";

interface AppLog {
    id: string;
    uid: string;
    timestamp: string;
    event: string;
    platform: string;
    app_name?: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

export default function AnalyticsManager({ authToken }: { authToken: string }) {
    const [logs, setLogs] = useState<AppLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<string>("all");

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/analytics", { headers: { "x-auth-token": authToken } });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
            }
        } catch (e) {
            console.error("Error fetching logs", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authToken]);

    // Extract unique app names for the filter
    const uniqueApps = Array.from(new Set(logs.map(log => log.app_name).filter(Boolean))) as string[];

    // Filter logs based on selection
    const filteredLogs = selectedApp === "all" ? logs : logs.filter(log => log.app_name === selectedApp);

    // Simple aggregations based on filtered logs
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = filteredLogs.filter(log => log.timestamp.startsWith(today));
    
    // Unique users today based on uid
    const uniqueUsersToday = new Set(todayLogs.map(log => log.uid)).size;
    const totalAppOpensToday = todayLogs.filter(log => log.event === 'app_opened_daily').length;

    return (
        <div className="flex flex-col gap-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl shadow-inner">
                        <FaUser />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Bugünkü Tekil Kullanıcı</div>
                        <div className="text-3xl font-bold">{uniqueUsersToday}</div>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl shadow-inner">
                        <FaMobileAlt />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Bugünkü Uygulama Açılışı</div>
                        <div className="text-3xl font-bold">{totalAppOpensToday}</div>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-2xl shadow-inner">
                        <FaChartBar />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Toplam Log Sayısı</div>
                        <div className="text-3xl font-bold">{filteredLogs.length}</div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 dark:bg-zinc-800/50">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <FaClock className="text-gray-400" /> Son Loglar
                    </h2>
                    
                    <div className="flex items-center gap-3">
                        <select 
                            value={selectedApp} 
                            onChange={(e) => setSelectedApp(e.target.value)}
                            className="text-sm font-medium px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        >
                            <option value="all">Tüm Uygulamalar</option>
                            {uniqueApps.map(app => (
                                <option key={app} value={app}>{app}</option>
                            ))}
                        </select>
                        <button 
                            onClick={fetchLogs} 
                            className="text-sm font-medium px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded-xl transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? "Yenileniyor..." : "Yenile"}
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto custom-scrollbar">
                    {isLoading && filteredLogs.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">Yükleniyor...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">Bu uygulama için log bulunmuyor.</div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 dark:bg-zinc-800/50 sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Tarih</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Olay (Event)</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Uygulama</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Platform</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Kullanıcı (UID)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {new Date(log.timestamp).toLocaleString("tr-TR")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {log.event}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                                            {log.app_name || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 capitalize">
                                            {log.platform}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate w-32 md:w-48" title={log.uid}>
                                                {log.uid}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
