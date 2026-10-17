import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";
import { FaHome, FaRocket, FaEnvelope } from "react-icons/fa";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Kerem Kuyucu",
  description: "The page you are looking for does not exist or has been moved.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <section className="relative px-6 py-24 md:py-32 flex-1 flex items-center justify-center">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-violet-500/15 via-fuchsia-500/10 to-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
            Error 404
          </div>

          {/* Big Gradient Number */}
          <h1 className="text-7xl sm:text-9xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 bg-clip-text text-transparent tracking-tight mb-4">
            404
          </h1>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found / Sayfa Bulunamadı
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-10">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-medium text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <FaHome className="text-sm" />
              <span>Back to Home / Ana Sayfa</span>
            </Link>

            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium text-sm border border-gray-200 dark:border-gray-800 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
            >
              <FaRocket className="text-sm text-violet-500" />
              <span>Explore Projects / Projeler</span>
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-transparent hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400 font-medium text-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <FaEnvelope className="text-xs" />
              <span>Contact</span>
            </Link>
          </div>
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}
