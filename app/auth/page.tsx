import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";
import AuthAppCards from "@/app/components/auth/AuthAppCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerem Kuyucu – Apps & Authentication",
  description:
    "Kerem Kuyucu tarafından geliştirilen uygulamalar ve ortak kimlik doğrulama hizmeti hakkında bilgi edinin.",
};

export default function AuthHomePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar showLangSwitcher={false} />

      {/* Hero */}
      <section className="pt-36 pb-16 px-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Shared Authentication Service
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          KeremKK
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Auth
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-4">
          All applications built by Kerem Kuyucu share a single, secure authentication system.
          One account gives you seamless access across all apps.
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          By signing in, you agree to our shared{" "}
          <Link href="/auth/en/tos" className="text-blue-600 dark:text-blue-400 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/auth/en/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      {/* Apps */}
      <section className="pb-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Applications using this auth service
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click any application to launch on Android or open the web version.
          </p>
        </div>
        <AuthAppCards />
      </section>

      {/* Legal Links */}
      <section className="pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Legal & Policies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                English
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/en/privacy"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Privacy Policy →
                </Link>
                <Link
                  href="/auth/en/tos"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Terms of Service →
                </Link>
                <Link
                  href="/auth/en/delete-account"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Delete Account →
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Türkçe
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/tr/privacy"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Gizlilik Politikası →
                </Link>
                <Link
                  href="/auth/tr/tos"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Kullanım Koşulları →
                </Link>
                <Link
                  href="/auth/tr/delete-account"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Hesabı Sil →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Questions? Contact us at{" "}
              <a
                href="mailto:help@keremkk.com.tr"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                help@keremkk.com.tr
              </a>
            </p>
          </div>
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}
