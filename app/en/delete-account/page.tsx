import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "Account & Data Deletion - Kerem Kuyucu",
  description:
    "Request deletion of your account and associated data from our applications.",
};

export default function DeleteAccountPageEN() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar />

      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Account &amp; Data Deletion
            </h1>
            <div className="inline-flex self-start sm:self-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
              <Link
                href="/en/delete-account"
                className="px-3 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                EN
              </Link>
              <Link
                href="/tr/delete-account"
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
              We respect your right to control your personal data. If you would
              like to permanently delete your account and all associated data
              from any of our applications, you can submit a deletion request by
              following the instructions below.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                How to Request Account &amp; Data Deletion
              </h2>
              <p className="mb-4">
                To request the deletion of your account and all data associated
                with it, please send an e-mail to the address below. Make sure
                to include the e-mail address or username you used to register
                so that we can locate your account.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Send your request to
                </p>
                <a
                  href="mailto:help@keremkk.com.tr?subject=Account%20and%20Data%20Deletion%20Request"
                  className="text-lg md:text-xl font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  help@keremkk.com.tr
                </a>
              </div>
              <div className="mt-4 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <span className="text-amber-500 text-xl leading-none mt-0.5">⚠️</span>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>Important:</strong> Please send your deletion request from the e-mail address associated with your account. This helps us verify your identity and process your request faster.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                What Data Will Be Deleted?
              </h2>
              <p className="mb-3">
                Upon processing your request, the following data will be
                permanently removed from our systems:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your account credentials (e-mail address, username, encrypted password)</li>
                <li>Profile information and preferences</li>
                <li>Game statistics, scores, and activity history</li>
                <li>Any other personally identifiable data linked to your account</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Processing Time
              </h2>
              <p>
                Deletion requests are processed within{" "}
                <strong>30 days</strong> of receipt. You will receive a
                confirmation e-mail once your account and data have been
                permanently deleted. Please note that this action is
                irreversible — all your data will be permanently erased and
                cannot be recovered.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Contact Us
              </h2>
              <p>
                If you have any questions or concerns regarding the deletion
                process, feel free to reach out to us at{" "}
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
