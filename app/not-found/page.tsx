"use client";

import Link from "next/link";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-gray-950">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/10 dark:bg-violet-900/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 dark:bg-blue-900/20 blur-[130px]" />

            <div className="relative z-10 text-center px-6">
                {/* glasmorphism card */}
                <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 p-12 rounded-3xl shadow-2xl max-w-lg w-full mx-auto transform hover:scale-[1.02] transition-transform duration-500">

                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 text-red-500 mb-8 animate-pulse">
                        <FaExclamationTriangle className="text-5xl" />
                    </div>

                    <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-4">
                        404
                    </h1>

                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                        Üzgünüz, Aradığınız link bulunamadı
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        Erişmeye çalıştığınız link geçerliliğini yitirmiş olabilir veya hiç var olmamış olabilir. Lütfen URL'i kontrol edin.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 hover:-translate-y-1"
                    >
                        <FaHome />
                        Anasayfaya Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
