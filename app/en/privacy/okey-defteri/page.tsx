import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "Okey Defteri - Privacy Policy",
  description: "Privacy policy for the Okey Defteri mobile application",
};

export default function OkeyDefteriPrivacyPolicyEN() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Okey Defteri - Privacy Policy
            </h1>
            <div className="inline-flex self-start sm:self-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
              <Link
                href="/en/privacy/okey-defteri"
                className="px-3 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                EN
              </Link>
              <Link
                href="/tr/privacy/okey-defteri"
                className="px-3 py-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                TR
              </Link>
            </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Last Updated: July 16, 2026
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Kerem Kuyucu built the Okey Defteri app as an Ad-Supported Free app. This SERVICE is provided by Kerem Kuyucu at no cost and is intended for use as is.
            </p>
            <p>
              This page is used to inform visitors regarding my policies with the collection, use, and disclosure of Personal Information if anyone decided to use my SERVICE.
            </p>
            <p>
              If you choose to use my SERVICE, then you agree to the collection and use of information in relation to this policy.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Information Collection and Use</h2>
              <p>
                To provide a better experience, our application may collect certain non-personal data. The collected data may include unique identifiers (UUIDs) generated on your device for statistical purposes. It is strictly not possible to identify your personal identity (such as your name, email address, etc.) from this data.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Third-Party Service Providers</h2>
              <p className="mb-3">
                Our application uses third-party services to deliver features and display advertisements. These services may access your device&apos;s Advertising ID or technical data (such as crash logs).
              </p>
              <p className="mb-2">You can access the privacy policies of the third-party service providers used by the application via the links below:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Google Play Services
                  </a>
                </li>
                <li>
                  <a href="https://support.google.com/admob/answer/6128543" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    AdMob
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Log Data</h2>
              <p>
                In the event of an error or crash while using the application, Log Data may be collected on your device (via third-party services). This Log Data may include information such as your device&apos;s Internet Protocol (&quot;IP&quot;) address, device name, operating system version, the configuration of the app when utilizing our service, the time and date of your use of the service, and other statistics.
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
