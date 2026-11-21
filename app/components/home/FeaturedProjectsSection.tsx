"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { getCategoryInfo, getProjectsByCategory } from "@/app/data/projects";
import { Language } from "@/app/data/translations";

interface FeaturedProjectsSectionProps {
  lang?: Language;
}

const FEATURED_KEYS = ["OkeyDefteri", "CopilotButton", "GeoGame"] as const;
const FALLBACK_IMAGE = "/imgs/errorimage.webp";

const copy = {
  en: {
    badge: "FEATURED WORK",
    titlePrefix: "Selected",
    titleHighlight: "Projects",
    subtitle:
      "A quick look at recent mobile, desktop, and full-stack projects I have built.",
    details: "All Details",
    viewAll: "View All Projects",
    newBadge: "New",
    github: "GitHub",
    preview: "Preview",
  },
  tr: {
    badge: "ÖNE ÇIKAN ÇALIŞMALAR",
    titlePrefix: "Seçili",
    titleHighlight: "Projeler",
    subtitle:
      "Son dönemde geliştirdiğim mobil, masaüstü ve full-stack projelerden öne çıkanlar.",
    details: "Tüm Detaylar",
    viewAll: "Tüm Projeleri Gör",
    newBadge: "Yeni",
    github: "GitHub",
    preview: "Önizleme",
  },
};

const FeaturedProjectsSection: React.FC<FeaturedProjectsSectionProps> = ({
  lang = "en",
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const t = copy[lang];
  const basePath = lang === "tr" ? "/tr" : "";

  const featured = useMemo(() => {
    const byCategory = getProjectsByCategory(lang);
    const catInfo = getCategoryInfo(lang);
    return FEATURED_KEYS.map((key) => {
      const project = byCategory[key]?.[0];
      const info = catInfo[key];
      if (!project || !info) return null;
      return { key, project, info };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [lang]);

  return (
    <section className="py-20 px-6 scroll-reveal">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-2">
              {t.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {t.titlePrefix}{" "}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                {t.titleHighlight}
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xl">
              {t.subtitle}
            </p>
          </div>

          <Link
            href={`${basePath}/projects`}
            className="group inline-flex items-center gap-2 self-start md:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/25 text-violet-700 dark:text-violet-300 font-semibold text-sm hover:border-violet-500/50 hover:from-violet-500/15 hover:to-fuchsia-500/15 transition-all duration-300"
          >
            <span>{t.viewAll}</span>
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3-Column Equal-Height Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {featured.map(({ key, project, info }) => {
            const detailHref = `${basePath}/projects/${info.slug}`;
            return (
              <article
                key={key}
                className="group relative flex flex-col h-full rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800/80 hover:border-violet-500/45 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-violet-500/10"
              >
                {/* Framed Showcase Image Area */}
                <Link
                  href={detailHref}
                  className="relative aspect-[16/10] p-3.5 overflow-hidden block shrink-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200/70 dark:from-[#0f1320] dark:via-[#121626] dark:to-[#0a0d16] border-b border-gray-200/60 dark:border-white/[0.06]"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-[0.09] dark:opacity-[0.14]`}
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(139,92,246,0.14), transparent 72%)",
                    }}
                  />

                  <div className="relative w-full h-full rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg shadow-black/15 dark:shadow-black/50 bg-gray-900">
                    <img
                      src={imageErrors[key] ? FALLBACK_IMAGE : project.imageUrl}
                      alt={project.altText}
                      className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      onError={() =>
                        setImageErrors((prev) => ({ ...prev, [key]: true }))
                      }
                    />
                  </div>

                  {project.isNew && (
                    <span className="absolute top-2.5 right-2.5 z-10 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-900/30 backdrop-blur-md">
                      {t.newBadge}
                    </span>
                  )}
                </Link>

                {/* Equal-Height Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <Link href={detailHref} className="block mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {project.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Compact Tech Tags */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100/90 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/70 dark:border-gray-700/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Unified Bottom Action Row */}
                  <div className="mt-auto pt-4 border-t border-gray-200/70 dark:border-gray-800/80 flex items-center justify-between gap-2">
                    <Link
                      href={detailHref}
                      className="group/cta inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
                    >
                      <span>{t.details}</span>
                      <FaArrowRight className="text-[11px] group-hover/cta:translate-x-0.5 transition-transform" />
                    </Link>

                    <div className="flex items-center gap-1.5">
                      {project.githubLink && !project.isPrivate && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t.github}
                          aria-label={`${project.title} ${t.github}`}
                          className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 dark:text-gray-300 bg-gray-100/90 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/70 hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
                        >
                          <FaGithub className="text-sm" />
                        </a>
                      )}
                      {project.viewLink && (
                        <a
                          href={project.viewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t.preview}
                          aria-label={`${project.title} ${t.preview}`}
                          className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 dark:text-gray-300 bg-gray-100/90 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/70 hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
                        >
                          <FaExternalLinkAlt className="text-xs" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjectsSection;
