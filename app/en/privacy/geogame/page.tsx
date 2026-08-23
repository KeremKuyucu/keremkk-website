import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "GeoGame - Privacy Policy",
  description: "Privacy policy for the GeoGame mobile application",
};

export default function GeoGamePrivacyPolicyEN() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              GeoGame - Privacy Policy
            </h1>
            <div className="inline-flex self-start sm:self-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
              <Link
                href="/en/privacy/geogame"
                className="px-3 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                EN
              </Link>
              <Link
                href="/tr/privacy/geogame"
                className="px-3 py-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                TR
              </Link>
            </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Last Updated: August 11, 2026
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Kerem Kuyucu built the GeoGame app as a Free app. This SERVICE is provided by Kerem Kuyucu at no cost and is intended for use as is.
            </p>
            <p>
              This page is used to inform visitors regarding my policies with the collection, use, and disclosure of Personal Information if anyone decided to use my SERVICE.
            </p>
            <p>
              If you choose to use my SERVICE, then you agree to the collection and use of information in relation to this policy.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Information Collection and Use</h2>
              <p className="mb-3">
                Our application collects the following personal information for account creation and login processes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-3">
                <li><strong>Email address:</strong> Used for account creation, authentication, and account recovery.</li>
                <li><strong>Username (Display Name):</strong> Used to display on in-game leaderboards and your profile.</li>
                <li><strong>Password:</strong> Stored in encrypted form to ensure the security of your account.</li>
              </ul>
              <p>
                In addition, the application may collect unique identifiers (UUIDs) generated on your device and gameplay statistics (scores, playtime, etc.) for statistical and analytical purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Data Storage and Security</h2>
              <p>
                Collected data is stored securely on the Supabase infrastructure. Passwords are protected using one-way cryptographic hashing and are never stored in plain text anywhere. Your data is retained only for as long as necessary to provide and maintain the service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Third-Party Service Providers</h2>
              <p className="mb-3">
                Our application employs third-party infrastructure providers for authentication and database services.
              </p>
              <p className="mb-2">You can access the privacy policies of the third-party service providers used by the application via the links below:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Google Play Services
                  </a>
                </li>
                <li>
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Supabase
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Log Data</h2>
              <p>
                In the event of an error or crash while using the application, Log Data on your device may be collected. This Log Data may include information such as your device&apos;s Internet Protocol (&quot;IP&quot;) address, device name, operating system version, the configuration of the app when utilizing our service, the time and date of your use of the service, and other statistics.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Account Deletion</h2>
              <p>
                If you wish to permanently delete your account and all associated data, you can submit a request via email or visit our{" "}
                <a href="/en/delete-account" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Account &amp; Data Deletion
                </a>{" "}
                page. Deletion requests are processed within 30 days.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Children&apos;s Privacy</h2>
              <p>
                This SERVICE is not directed to anyone under the age of 13. I do not knowingly collect personally identifiable information from children under 13 years of age. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact me so that I will be able to take the necessary actions.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Changes to This Privacy Policy</h2>
              <p>
                I may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. Changes are effective immediately after they are posted on this page.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Contact Us</h2>
              <p>
                If you have any questions or suggestions regarding my Privacy Policy, do not hesitate to contact me at <a href="mailto:help@keremkk.com.tr" className="text-blue-600 dark:text-blue-400 hover:underline">help@keremkk.com.tr</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}
