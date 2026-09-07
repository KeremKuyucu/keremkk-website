import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "Terms of Service – Kerem Kuyucu Auth",
  description:
    "Terms of service for all applications using the Kerem Kuyucu shared authentication service.",
};

export default function AuthTosEN() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar showLangSwitcher={false} />

      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Terms of Service
            </h1>
            <div className="inline-flex self-start sm:self-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
              <Link
                href="/auth/en/tos"
                className="px-3 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                EN
              </Link>
              <Link
                href="/auth/tr/tos"
                className="px-3 py-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                TR
              </Link>
            </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Last Updated: September 7, 2026
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              These Terms of Service govern your use of the shared authentication service provided
              by Kerem Kuyucu (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) and used across all applications
              developed by Kerem Kuyucu. By creating an account or signing in, you agree to be
              bound by these terms.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                1. Description of Service
              </h2>
              <p>
                Applications developed by Kerem Kuyucu (including GeoGame, Okey Defteri, and
                others) share a single unified account system. This service covers account
                creation, authentication, and cross-application profile management.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                2. Account Creation and Security
              </h2>
              <p className="mb-3">
                When creating an account, you agree to the following:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You agree to provide accurate, current, and complete information.</li>
                <li>
                  You are responsible for maintaining the confidentiality of your account
                  credentials, especially your password.
                </li>
                <li>You are responsible for all activities that occur under your account.</li>
                <li>
                  If you discover any unauthorized access to your account, you must immediately
                  notify us at{" "}
                  <a
                    href="mailto:help@keremkk.com.tr"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    help@keremkk.com.tr
                  </a>
                  .
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                3. Acceptable Use
              </h2>
              <p className="mb-3">By using our service, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service only for lawful purposes and in accordance with these Terms.</li>
                <li>Not create fake accounts or impersonate another person.</li>
                <li>
                  Not use abusive, hateful, obscene, or misleading language in your username or
                  profile information.
                </li>
                <li>Not attempt to compromise the security of the system.</li>
                <li>
                  Not attempt unauthorized access to the service&apos;s server infrastructure,
                  databases, or APIs.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                4. Intellectual Property
              </h2>
              <p>
                All rights relating to the authentication service belong to Kerem Kuyucu. The
                Kerem Kuyucu name, logo, and branding may not be used for commercial purposes
                without prior written permission.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                5. Limitation of Liability
              </h2>
              <p className="mb-3">
                The service is provided &quot;as is&quot; and &quot;as available&quot;. Kerem Kuyucu:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Does not guarantee that the service will operate uninterrupted, error-free, or
                  completely secure.
                </li>
                <li>
                  Shall not be held liable for any direct, indirect, incidental, or consequential
                  damages resulting from the use or inability to use the service.
                </li>
                <li>
                  Is not responsible for disruptions or errors caused by third-party service
                  providers (Supabase, Google, etc.).
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                6. Account Suspension and Termination
              </h2>
              <p className="mb-3">
                Kerem Kuyucu reserves the right to suspend or permanently terminate your account
                without prior notice in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Breach of these Terms of Service.</li>
                <li>Detection of fraud, cheating, or abusive behavior.</li>
                <li>Harassing, threatening, or harmful conduct towards other users.</li>
                <li>Actions that compromise the security or integrity of the service.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                7. Account Deletion
              </h2>
              <p>
                If you wish to permanently delete your account and all associated data, you can
                send a request to{" "}
                <a
                  href="mailto:help@keremkk.com.tr"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  help@keremkk.com.tr
                </a>{" "}
                or visit our{" "}
                <a
                  href="/auth/en/delete-account"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Account &amp; Data Deletion
                </a>{" "}
                page. Requests are processed within 30 days. Deleted accounts and data cannot be
                recovered.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                8. Age Restriction
              </h2>
              <p>
                You must be at least 13 years old to use this service. Users under 13 may only
                use the service under the direct supervision of a parent or legal guardian.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                9. Privacy
              </h2>
              <p>
                For detailed information on how personal data is collected and processed, please
                review our{" "}
                <a
                  href="/auth/en/privacy"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Privacy Policy
                </a>
                . The Privacy Policy forms an integral part of these Terms of Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                10. Governing Law
              </h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with the
                laws of the Republic of Turkey. Any disputes arising out of or in connection with
                these terms shall be subject to the exclusive jurisdiction of the courts of the
                Republic of Turkey.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                11. Changes to Terms
              </h2>
              <p>
                We may update these Terms of Service from time to time. Changes take effect
                immediately upon being posted on this page. Your continued use of the service
                after any changes constitutes your acceptance of the updated terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                12. Contact Us
              </h2>
              <p>
                If you have any questions or suggestions regarding these Terms of Service, please
                contact us at{" "}
                <a
                  href="mailto:help@keremkk.com.tr"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  help@keremkk.com.tr
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}
