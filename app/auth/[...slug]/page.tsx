import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";
import AuthLangDropdown from "@/app/components/auth/AuthLangDropdown";
import {
  parseAuthSlug,
  getAllAuthSlugs,
  authContent,
  AuthLang,
  PrivacyContent,
  TosContent,
  DeleteAccountContent,
} from "@/app/data/auth-content";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return getAllAuthSlugs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseAuthSlug(slug);
  if (!parsed) return { title: "Page Not Found" };

  const contentMap = authContent[parsed.pageSlug];
  const doc = contentMap ? contentMap[parsed.lang] : null;
  if (!doc) return { title: "Page Not Found" };

  return {
    title: doc.metadata.title,
    description: doc.metadata.description,
  };
}

export default async function DynamicAuthPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseAuthSlug(slug);

  if (!parsed) {
    notFound();
  }

  const { lang, pageSlug } = parsed;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar showLangSwitcher={false} />

      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {pageSlug === "privacy" && authContent.privacy[lang].title}
              {pageSlug === "tos" && authContent.tos[lang].title}
              {pageSlug === "delete-account" && authContent["delete-account"][lang].title}
            </h1>

            {/* Language Switcher */}
            <AuthLangDropdown currentLang={lang} pageSlug={pageSlug} />
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {pageSlug === "privacy" && authContent.privacy[lang].lastUpdated}
            {pageSlug === "tos" && authContent.tos[lang].lastUpdated}
            {pageSlug === "delete-account" && authContent["delete-account"][lang].lastUpdated}
          </p>

          {/* Document Content */}
          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            {pageSlug === "privacy" && (
              <PrivacyView content={authContent.privacy[lang]} lang={lang} />
            )}
            {pageSlug === "tos" && (
              <TosView content={authContent.tos[lang]} lang={lang} />
            )}
            {pageSlug === "delete-account" && (
              <DeleteAccountView content={authContent["delete-account"][lang]} />
            )}
          </div>
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}

function PrivacyView({
  content,
  lang,
}: {
  content: PrivacyContent;
  lang: AuthLang;
}) {
  const { sections } = content;

  return (
    <>
      {content.intro.map((p, i) => (
        <p key={i}>{p}</p>
      ))}

      {/* Section 1 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section1.title}
        </h2>
        <p className="mb-3">{sections.section1.intro}</p>
        <ul className="list-disc pl-6 space-y-2">
          {sections.section1.googleItems.map((item, i) => (
            <li key={i}>
              <strong>{item.label}</strong> {item.text}
            </li>
          ))}
        </ul>
        <p className="mt-3">{sections.section1.passwordNotice}</p>
        <p className="mt-3">{sections.section1.telemetryNotice}</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          {sections.section1.telemetryItems.map((item, i) => (
            <li key={i}>
              <strong>{item.label}</strong> {item.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Section 2 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section2.title}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          {sections.section2.items.map((item, i) => (
            <li key={i}>
              {item.text}{" "}
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                ({item.legalBasis})
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 3 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section3.title}
        </h2>
        {sections.section3.paragraphs.map((p, i) => (
          <p key={i} className={i < sections.section3.paragraphs.length - 1 ? "mb-3" : ""}>
            {p}
          </p>
        ))}
      </div>

      {/* Section 4 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section4.title}
        </h2>
        <p className="mb-3">{sections.section4.intro}</p>
        <ul className="list-disc pl-6 space-y-2">
          {sections.section4.providers.map((prov, i) => (
            <li key={i}>
              <a
                href={prov.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {prov.name}
              </a>{" "}
              – {prov.description}{" "}
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                ({prov.role})
              </span>
              {prov.extraNotice && (
                <>
                  {" "}
                  {prov.extraNotice.text}
                  <a
                    href={prov.extraNotice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {prov.extraNotice.linkText}
                  </a>
                  {prov.extraNotice.suffix}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Section 5 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section5.title}
        </h2>
        <p>{sections.section5.intro}</p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          {sections.section5.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 6 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section6.title}
        </h2>
        <p>{sections.section6.text}</p>
      </div>

      {/* Section 7 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section7.title}
        </h2>
        {sections.section7.paragraphs.map((p, i) => (
          <p key={i} className="mb-3">
            {p}
          </p>
        ))}
        <p>
          {sections.section7.contact.prefix}
          <a
            href={`mailto:${sections.section7.contact.email}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {sections.section7.contact.email}
          </a>
          {sections.section7.contact.suffix}
        </p>
      </div>

      {/* Section 8 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section8.title}
        </h2>
        <p className="mb-3">{sections.section8.intro}</p>
        <ul className="list-disc pl-6 space-y-2">
          {sections.section8.rights.map((r, i) => (
            <li key={i}>
              {r.text}
              {r.link && (
                <>
                  <Link
                    href={`/auth/${lang}/delete-account`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {r.link.label}
                  </Link>
                  {r.link.suffix}
                </>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3">{sections.section8.notice}</p>
      </div>

      {/* Section 9 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section9.title}
        </h2>
        <p>{sections.section9.text}</p>
      </div>

      {/* Section 10 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section10.title}
        </h2>
        <p>
          {sections.section10.text}
          <a
            href={`mailto:${sections.section10.email}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {sections.section10.email}
          </a>
          .
        </p>
      </div>
    </>
  );
}

function TosView({ content, lang }: { content: TosContent; lang: AuthLang }) {
  const { sections } = content;

  return (
    <>
      <p>{content.intro}</p>

      {/* Section 1 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section1.title}
        </h2>
        <p>{sections.section1.text}</p>
      </div>

      {/* Section 2 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section2.title}
        </h2>
        <p className="mb-3">{sections.section2.intro}</p>
        <ul className="list-disc pl-6 space-y-2">
          {sections.section2.items.map((item, i) => (
            <li key={i}>
              {item.text}
              {item.emailLink && (
                <a
                  href={`mailto:${item.emailLink.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {item.emailLink.email}
                </a>
              )}
              {item.emailLink?.suffix}
            </li>
          ))}
        </ul>
      </div>

      {/* Section 3 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section3.title}
        </h2>
        <p className="mb-3">{sections.section3.intro}</p>
        <ul className="list-disc pl-6 space-y-2">
          {sections.section3.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 4 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section4.title}
        </h2>
        <p>{sections.section4.text}</p>
      </div>

      {/* Section 5 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section5.title}
        </h2>
        <p className="mb-3">{sections.section5.intro}</p>
        <ul className="list-disc pl-6 space-y-2">
          {sections.section5.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 6 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section6.title}
        </h2>
        <p className="mb-3">{sections.section6.intro}</p>
        <ul className="list-disc pl-6 space-y-2">
          {sections.section6.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 7 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section7.title}
        </h2>
        <p>
          {sections.section7.textBeforeEmail}
          <a
            href={`mailto:${sections.section7.email}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {sections.section7.email}
          </a>
          {sections.section7.textBetween}
          <Link
            href={`/auth/${lang}/delete-account`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {sections.section7.deleteLinkText}
          </Link>
          {sections.section7.textAfterDeleteLink}
        </p>
      </div>

      {/* Section 8 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section8.title}
        </h2>
        {sections.section8.paragraphs.map((p, i) => (
          <p
            key={i}
            className={i < sections.section8.paragraphs.length - 1 ? "mb-3" : ""}
          >
            {p}
          </p>
        ))}
      </div>

      {/* Section 9 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section9.title}
        </h2>
        <p className="mb-3">
          {sections.section9.textBeforeLink}
          <Link
            href={`/auth/${lang}/privacy`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {sections.section9.privacyLinkText}
          </Link>
          {sections.section9.textAfterLink}
        </p>
        <p>{sections.section9.paragraph2}</p>
      </div>

      {/* Section 10 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section10.title}
        </h2>
        <p>{sections.section10.text}</p>
      </div>

      {/* Section 11 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section11.title}
        </h2>
        <p>{sections.section11.text}</p>
      </div>

      {/* Section 12 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {sections.section12.title}
        </h2>
        <p>
          {sections.section12.textBeforeEmail}
          <a
            href={`mailto:${sections.section12.email}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {sections.section12.email}
          </a>
          {sections.section12.textAfterEmail}
        </p>
      </div>
    </>
  );
}

function DeleteAccountView({ content }: { content: DeleteAccountContent }) {
  const { howTo, whatDeleted, processingTime, contact } = content;

  return (
    <>
      <p>{content.intro}</p>

      {/* How to request */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {howTo.title}
        </h2>
        <p className="mb-4">{howTo.intro}</p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {howTo.emailBoxTitle}
          </p>
          <a
            href={`mailto:${howTo.email}?subject=${encodeURIComponent(
              howTo.emailSubject
            )}`}
            className="text-lg md:text-xl font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {howTo.email}
          </a>
        </div>
        <div className="mt-4 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <span className="text-amber-500 text-xl leading-none mt-0.5">⚠️</span>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>{howTo.warningTitle}</strong> {howTo.warningText}
          </p>
        </div>
      </div>

      {/* What data deleted */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {whatDeleted.title}
        </h2>
        <p className="mb-3">{whatDeleted.intro}</p>
        <ul className="list-disc pl-6 space-y-2">
          {whatDeleted.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="mt-3">{whatDeleted.notice}</p>
      </div>

      {/* Processing Time */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {processingTime.title}
        </h2>
        <p>{processingTime.text}</p>
      </div>

      {/* Contact */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {contact.title}
        </h2>
        <p>
          {contact.textBeforeEmail}
          <a
            href={`mailto:${contact.email}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {contact.email}
          </a>
          {contact.textAfterEmail}
        </p>
      </div>
    </>
  );
}
