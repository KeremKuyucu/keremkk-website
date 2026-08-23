import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "GeoGame - Terms of Service",
  description: "Terms of service for the GeoGame mobile application",
};

export default function GeoGameTermsOfServiceEN() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar />

      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              GeoGame - Terms of Service
            </h1>
            <div className="inline-flex self-start sm:self-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
              <Link
                href="/en/tos/geogame"
                className="px-3 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                EN
              </Link>
              <Link
                href="/tr/tos/geogame"
                className="px-3 py-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                TR
              </Link>
            </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Last Updated: August 23, 2026
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              These Terms of Service govern your use of the GeoGame application (&quot;Application&quot;) developed by Kerem Kuyucu. By downloading, installing, or using the Application, you agree to be bound by these terms. If you do not agree with these terms, please do not use the Application.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1. Description of Service</h2>
              <p>
                GeoGame is a free, educational application that allows users to test and enhance their geography knowledge through interactive game modes (capitals, flags, distance estimation, and continent-based levels). The Application is available on Android and Windows (Desktop) platforms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2. Account Creation and Security</h2>
              <p className="mb-3">
                You may need to create an account to access certain features of the Application. When creating an account:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You agree to provide accurate, current, and complete information.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials (especially your password).</li>
                <li>You are responsible for all activities that occur under your account.</li>
                <li>If you discover any unauthorized access to your account, you must immediately notify us at <a href="mailto:help@keremkk.com.tr" className="text-blue-600 dark:text-blue-400 hover:underline">help@keremkk.com.tr</a>.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">3. Acceptable Use</h2>
              <p className="mb-3">
                By using the Application, you agree to comply with the following rules:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You will use the Application only for lawful purposes and in accordance with these Terms.</li>
                <li>You will not use cheats, bots, automation software, or similar methods to manipulate leaderboards or gain an unfair advantage.</li>
                <li>You will not attempt unauthorized access to the Application&apos;s server infrastructure, databases, or APIs.</li>
                <li>You will not engage in any activity that disrupts or interferes with other users&apos; use of the Application.</li>
                <li>You will not use abusive, hateful, obscene, or misleading language in your username or profile information.</li>
                <li>You will not attempt to reverse engineer, decompile, or disassemble the Application (except where permitted by applicable open-source licenses).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">4. Intellectual Property</h2>
              <p>
                The Application is distributed under the GNU General Public License v3.0 (GPLv3). The source code may be used, modified, and distributed in accordance with the terms of that license. However, the GeoGame name, logo, and branding are the property of Kerem Kuyucu and may not be used for commercial purposes without prior written permission.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">5. User Content</h2>
              <p>
                Content created within the Application, such as usernames and profile details, may be displayed on leaderboards and other social features. You are responsible for ensuring that your content does not violate third-party rights and adheres to community standards. Kerem Kuyucu reserves the right to remove any user content that violates these terms without prior notice.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">6. Limitation of Liability</h2>
              <p className="mb-3">
                The Application is provided &quot;as is&quot; and &quot;as available&quot;. Kerem Kuyucu:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Does not guarantee that the Application will operate uninterrupted, error-free, or completely secure.</li>
                <li>Shall not be held liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the Application.</li>
                <li>Is not responsible for any loss of in-game data (scores, statistics, progress, etc.).</li>
                <li>Shall not be held liable for disruptions, downtime, or errors caused by third-party service providers (Supabase, Google Play Services, etc.).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">7. Account Suspension and Termination</h2>
              <p className="mb-3">
                Kerem Kuyucu reserves the right to suspend or permanently terminate your account without prior notice in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Breach of these Terms of Service.</li>
                <li>Detection of cheating, fraud, or abusive behavior.</li>
                <li>Harassing, threatening, or harmful conduct towards other users.</li>
                <li>Actions that compromise the security or integrity of the Application.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">8. Account Deletion</h2>
              <p>
                If you wish to permanently delete your account and all associated data, you can submit a request to <a href="mailto:help@keremkk.com.tr" className="text-blue-600 dark:text-blue-400 hover:underline">help@keremkk.com.tr</a> or visit our{" "}
                <a href="/en/delete-account" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Account &amp; Data Deletion
                </a>{" "}
                page. Account deletion requests will be processed within 30 days. Deleted accounts and data cannot be recovered.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">9. Service Modifications</h2>
              <p>
                Kerem Kuyucu reserves the right to update, modify, or temporarily/permanently discontinue the Application at any time. No liability will be accepted for any loss or damages resulting from service modifications or discontinuation.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">10. Age Restriction</h2>
              <p>
                You must be at least 13 years old to use the Application. Users under 13 may only use the Application under the direct supervision of a parent or legal guardian.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">11. Privacy</h2>
              <p>
                For detailed information on how personal data is collected and processed, please review our{" "}
                <a href="/en/privacy/geogame" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy
                </a>
                . The Privacy Policy forms an integral part of these Terms of Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">12. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Turkey. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of the Republic of Turkey.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">13. Changes to Terms</h2>
              <p>
                We may update these Terms of Service from time to time. Changes take effect immediately once published on this page. In the event of significant changes, reasonable efforts will be made to provide notification within the Application. Your continued use of the Application signifies your acceptance of the updated terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">14. Contact Us</h2>
              <p>
                If you have any questions or suggestions regarding these Terms of Service, do not hesitate to contact me at <a href="mailto:help@keremkk.com.tr" className="text-blue-600 dark:text-blue-400 hover:underline">help@keremkk.com.tr</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}
