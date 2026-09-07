import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy – Kerem Kuyucu Auth",
  description:
    "Privacy policy for all applications using the Kerem Kuyucu shared authentication service.",
};

export default function AuthPrivacyPolicyEN() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar showLangSwitcher={false} />

      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
            <div className="inline-flex self-start sm:self-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
              <Link
                href="/auth/en/privacy"
                className="px-3 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                EN
              </Link>
              <Link
                href="/auth/tr/privacy"
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
              This Privacy Policy describes how Kerem Kuyucu (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
              collects, uses, and protects your personal information when you sign in through our
              shared authentication service used across all our applications.
            </p>
            <p>
              By signing in, you agree to the collection and use of information in accordance with
              this policy.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                1. Information We Collect
              </h2>
              <p className="mb-3">
                When you sign in with Google, we receive the following information from your Google
                account:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Email address:</strong> Used for account identification and
                  authentication.
                </li>
                <li>
                  <strong>Display name / Username:</strong> Used to identify you within the
                  applications you use (e.g., leaderboards, profiles).
                </li>
                <li>
                  <strong>Profile picture (optional):</strong> If provided by your Google account,
                  used solely for display purposes.
                </li>
              </ul>
              <p className="mt-3">
                We do not collect or store passwords. Authentication is handled entirely through
                Google Sign-In (OAuth 2.0).
              </p>
              <p className="mt-3">
                Additionally, we may collect unique device identifiers and basic usage statistics
                (e.g., login timestamps) for security and service improvement purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your account across our applications.</li>
                <li>To authenticate your identity when you sign in via Google.</li>
                <li>To enable features such as leaderboards and cross-app profiles.</li>
                <li>To detect and prevent fraudulent or unauthorized access.</li>
                <li>To comply with applicable legal obligations.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                3. Data Storage and Security
              </h2>
              <p>
                All data is stored securely on the Supabase infrastructure. We apply
                industry-standard security measures including HTTPS encryption for all data in
                transit. Your data is retained only as long as necessary to provide and maintain
                the service or as required by law.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                4. Third-Party Service Providers
              </h2>
              <p className="mb-3">
                We use the following third-party services to operate our authentication system.
                These providers may have access to your personal information only to perform
                tasks on our behalf and are obligated not to disclose or use it for any other
                purpose.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Supabase
                  </a>{" "}
                  – Authentication and database infrastructure.
                </li>
                <li>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Google (Sign in with Google)
                  </a>{" "}
                  – OAuth 2.0 sign-in provider. By signing in with Google, you are also subject
                  to{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  .
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                5. Data Sharing
              </h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. Your
                data may only be shared in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>With service providers listed above, solely to operate the authentication service.</li>
                <li>If required by law, regulation, or a valid legal process.</li>
                <li>To protect the rights, property, or safety of Kerem Kuyucu or our users.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                6. Log Data
              </h2>
              <p>
                In the event of an error or security event, our servers may automatically collect
                Log Data such as your IP address, browser type, the time and date of your request,
                and the pages visited. This information is used solely for security monitoring and
                debugging purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                7. Children&apos;s Privacy and Parental Controls
              </h2>
              <p className="mb-3">
                Our applications are rated PEGI 3 and are designed to be suitable for all ages.
                Sign-in is handled exclusively through Google Sign-In, which means users must
                have a valid Google account to access the service. Google&apos;s own policies apply
                regarding account eligibility for minors.
              </p>
              <p className="mb-3">
                We do not knowingly collect any personal information beyond what is provided
                through the Google Sign-In flow. If you are a parent or guardian and have
                concerns about your child&apos;s use of our applications, please contact us at{" "}
                <a
                  href="mailto:help@keremkk.com.tr"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  help@keremkk.com.tr
                </a>
                .
              </p>
              <p className="mb-3 font-medium text-gray-900 dark:text-white">Parental Controls</p>
              <p className="mb-3">
                Our applications include built-in parental control features accessible from the
                in-app settings:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Parental PIN:</strong> A parent or guardian can set a PIN code in the
                  app settings to restrict access to certain settings or features, preventing
                  children from making unauthorized changes.
                </li>
                <li>
                  <strong>Hide Other Users&apos; Names:</strong> A parent or guardian can enable
                  this option to hide the usernames of other players (e.g., in leaderboards),
                  helping to protect children from exposure to inappropriate usernames.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                8. Your Rights
              </h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>
                  Request deletion of your account and all associated data. You can submit this
                  request via email or visit our{" "}
                  <a href="/auth/en/delete-account" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Account &amp; Data Deletion
                  </a>{" "}
                  page. Requests are processed within 30 days.
                </li>
                <li>Object to or restrict certain uses of your data.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                9. Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Changes are effective
                immediately upon being posted on this page. We encourage you to review this page
                periodically. Your continued use of our services after any changes constitutes your
                acceptance of the new policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                10. Contact Us
              </h2>
              <p>
                If you have any questions or concerns about this Privacy Policy, please contact
                us at{" "}
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
