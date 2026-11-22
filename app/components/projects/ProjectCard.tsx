"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaCode,
  FaLock,
  FaStar,
  FaCodeBranch,
  FaArrowRight,
  FaWindows,
  FaLayerGroup,
} from "react-icons/fa";
import {
  SiFlutter,
  SiNextdotjs,
  SiCplusplus,
  SiDart,
  SiSupabase,
  SiFirebase,
  SiTypescript,
  SiTailwindcss,
  SiResend,
  SiAutohotkey,
} from "react-icons/si";
import { getProjectsByCategory, getCategoryInfo } from "@/app/data/projects";
import { Project } from "@/app/types";
import { translations, Language } from "@/app/data/translations";

const fallbackImage = "/imgs/errorimage.webp";

const getTechIcon = (tech: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    Flutter: <SiFlutter className="text-[#02569B]" />,
    "Next.js": <SiNextdotjs className="text-gray-900 dark:text-white" />,
    "C++": <SiCplusplus className="text-[#00599C]" />,
    Dart: <SiDart className="text-[#0175C2]" />,
    Supabase: <SiSupabase className="text-[#3ECF8E]" />,
    Firebase: <SiFirebase className="text-[#FFCA28]" />,
    TypeScript: <SiTypescript className="text-[#3178C6]" />,
    "Tailwind CSS": <SiTailwindcss className="text-[#06B6D4]" />,
    Resend: <SiResend className="text-gray-900 dark:text-white" />,
    AutoHotkey: <SiAutohotkey className="text-[#339933]" />,
    Windows: <FaWindows className="text-[#0078D4]" />,
  };
  return iconMap[tech] || <FaCode className="text-gray-500" />;
};

type ProjectCardProps = Project & {
  index: number;
  categoryGradient: string;
  categorySlug?: string;
  isArchived?: boolean;
  isPrivate?: boolean;
  lastCommit?: string;
  stars?: number;
  forks?: number;
  language?: string | null;
  watchers?: number;
  lang?: Language;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  imageUrl,
  altText,
  isNew,
  isDeveloping,
  isArchived,
  isPrivate,
  lastCommit,
  stars,
  forks,
  title,
  description,
  techStack,
  viewLink,
  githubLink,
  index,
  categoryGradient,
  categorySlug,
  lang = "en",
}) => {
  const [imageError, setImageError] = useState(false);
  const t = translations[lang].projects;

  const detailHref = categorySlug
    ? lang === "tr"
      ? `/tr/projects/${categorySlug}`
      : `/projects/${categorySlug}`
    : undefined;

  const hasMeta =
    (stars !== undefined && stars > 0) ||
    (forks !== undefined && forks > 0) ||
    Boolean(lastCommit);

  const imageFrame = (
    <div className="relative aspect-[16/10] p-3.5 overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200/70 dark:from-[#0f1320] dark:via-[#121626] dark:to-[#0a0d16] border-b border-gray-200/60 dark:border-white/[0.06]">
      {/* Subtle Category Tint & Radial Studio Glow */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${categoryGradient} opacity-[0.09] dark:opacity-[0.14]`}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(139,92,246,0.14), transparent 72%)",
        }}
      />

      {/* Framed Mockup Viewport */}
      <div className="relative w-full h-full rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg shadow-black/15 dark:shadow-black/50 bg-gray-900">
        <img
          src={imageError ? fallbackImage : imageUrl}
          alt={altText}
          className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Tasteful Top-Right Status Badges */}
      {(isNew || isPrivate || isDeveloping || isArchived) && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {isNew && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-900/30 backdrop-blur-md">
              {t.badges.new}
            </span>
          )}
          {isDeveloping && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-900/80 dark:bg-white/15 text-white border border-white/15 backdrop-blur-md">
              {t.badges.developing}
            </span>
          )}
          {isPrivate && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/90 text-white shadow-sm backdrop-blur-md">
              <FaLock className="text-[9px]" />
              {t.badges.private}
            </span>
          )}
          {isArchived && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-700/85 text-gray-100 backdrop-blur-md">
              {t.badges.archived}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <article
      className="group relative flex flex-col h-full bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-200/70 dark:border-gray-800/80 hover:border-violet-500/45 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-violet-500/10"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Framed Showcase Image */}
      {detailHref ? (
        <Link href={detailHref} className="block shrink-0">
          {imageFrame}
        </Link>
      ) : (
        <div className="shrink-0">{imageFrame}</div>
      )}

      {/* Decluttered Equal-Height Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        {detailHref ? (
          <Link href={detailHref} className="block mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {title}
            </h3>
          </Link>
        ) : (
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-2">
            {title}
          </h3>
        )}

        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>
        )}

        {/* Compact Single-Row Tech Stack Pills */}
        {techStack && techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {techStack.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100/90 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/70 dark:border-gray-700/60"
              >
                {getTechIcon(tech)}
                <span>{tech}</span>
              </span>
            ))}
          </div>
        )}

        {/* Subtle GitHub Metadata Row */}
        {hasMeta && (
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
            {stars !== undefined && stars > 0 && (
              <span className="inline-flex items-center gap-1">
                <FaStar className="text-amber-500 text-[11px]" />
                <span className="font-medium">{stars}</span>
              </span>
            )}
            {forks !== undefined && forks > 0 && (
              <span className="inline-flex items-center gap-1">
                <FaCodeBranch className="text-violet-500 text-[11px]" />
                <span className="font-medium">{forks}</span>
              </span>
            )}
            {lastCommit && (
              <span className="truncate">
                {t.lastCommit} {lastCommit}
              </span>
            )}
          </div>
        )}

        {/* Unified Bottom Action Row */}
        <div className="mt-auto pt-4 border-t border-gray-200/70 dark:border-gray-800/80 flex items-center justify-between gap-2">
          {detailHref ? (
            <Link
              href={detailHref}
              className="group/cta inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
            >
              <span>{t.allDetails}</span>
              <FaArrowRight className="text-[11px] group-hover/cta:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1.5">
            {githubLink && !isPrivate && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                title={t.github}
                aria-label={`${title} ${t.github}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100/90 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/70 hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
              >
                <FaGithub className="text-sm" />
                <span className="hidden sm:inline">{t.github}</span>
              </a>
            )}
            {viewLink && (
              <a
                href={viewLink}
                target="_blank"
                rel="noopener noreferrer"
                title={t.preview}
                aria-label={`${title} ${t.preview}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100/90 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/70 hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
              >
                <FaExternalLinkAlt className="text-[11px]" />
                <span className="hidden sm:inline">{t.preview}</span>
              </a>
            )}
            {isPrivate && (
              <span className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/60 cursor-not-allowed">
                <FaLock className="text-[10px]" />
                <span>{t.privateRepo}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

interface ProjelerSectionProps {
  lang?: Language;
}

const ProjelerSection: React.FC<ProjelerSectionProps> = ({ lang = "en" }) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [githubData, setGithubData] = useState<{
    [key: string]: {
      lastCommit: string;
      isArchived: boolean;
      stars: number;
      forks: number;
      language: string | null;
      isPrivate: boolean;
      watchers: number;
    };
  }>({});
  const [, setIsLoadingGithub] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const t = translations[lang].projects;
  const projectsByCategory = useMemo(() => getProjectsByCategory(lang), [lang]);
  const categoryInfo = useMemo(() => getCategoryInfo(lang), [lang]);

  const extractRepoName = (githubLink: string): string | null => {
    const match = githubLink.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const fetchGithubData = async () => {
      setIsLoadingGithub(true);
      const allProjects = Object.values(projectsByCategory).flat();
      const repoNames = allProjects
        .map((p) => (p.githubLink ? extractRepoName(p.githubLink) : null))
        .filter((name): name is string => name !== null);

      if (repoNames.length === 0) {
        setIsLoadingGithub(false);
        return;
      }

      try {
        const response = await fetch(`/api/github?repos=${repoNames.join(",")}&lang=${lang}`);
        if (response.ok) {
          const data = await response.json();
          setGithubData(data);
        }
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
      } finally {
        setIsLoadingGithub(false);
      }
    };

    fetchGithubData();
  }, [projectsByCategory, lang]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const scrollElements = document.querySelectorAll(".scroll-reveal");
    scrollElements.forEach((el) => observer.observe(el));

    return () => scrollElements.forEach((el) => observer.unobserve(el));
  }, [activeCategory]);

  const categories = Object.keys(projectsByCategory);
  const totalProjectCount = Object.values(projectsByCategory).flat().length;
  const displayedProjects =
    activeCategory === "all"
      ? categories.flatMap((category) =>
          projectsByCategory[category].map((project) => ({ project, category }))
        )
      : (projectsByCategory[activeCategory] || []).map((project) => ({
          project,
          category: activeCategory,
        }));

  const getGithubDataForProject = (githubLink?: string) => {
    if (!githubLink)
      return {
        lastCommit: undefined,
        isArchived: undefined,
        stars: undefined,
        forks: undefined,
        language: undefined,
        isPrivate: undefined,
        watchers: undefined,
      };
    const repoName = extractRepoName(githubLink);

    if (repoName && githubData[repoName]) {
      return githubData[repoName];
    }

    return {
      lastCommit: undefined,
      isArchived: undefined,
      stars: undefined,
      forks: undefined,
      language: undefined,
      isPrivate: undefined,
      watchers: undefined,
    };
  };

  return (
    <section ref={sectionRef} className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <section className="relative pt-32 pb-8 px-6">
          <div className="container mx-auto max-w-6xl relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              {t.titlePrefix}{" "}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                {t.titleHighlight}
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 scroll-reveal">
          <button
            onClick={() => setActiveCategory("all")}
            className={`group relative px-5 py-2.5 rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 overflow-hidden cursor-pointer ${
              activeCategory === "all"
                ? "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-violet-500/25 scale-105"
                : "bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <FaLayerGroup className="text-sm" />
              {lang === "tr" ? "Tümü" : "All"}
              <span
                className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  activeCategory === "all"
                    ? "bg-white/20"
                    : "bg-gray-200/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                {totalProjectCount}
              </span>
            </span>
            {activeCategory !== "all" && (
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            )}
          </button>

          {categories.map((category) => {
            const info = categoryInfo[category] || {
              gradient: "from-violet-600 to-fuchsia-600",
            };
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(isActive ? "all" : category)}
                className={`group relative px-5 py-2.5 rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 overflow-hidden cursor-pointer ${
                  isActive
                    ? `bg-gradient-to-r ${info.gradient} text-white shadow-lg shadow-violet-500/25 scale-105`
                    : "bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {info.icon}
                  {category}
                  <span
                    className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      isActive
                        ? "bg-white/20"
                        : "bg-gray-200/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {projectsByCategory[category].length}
                  </span>
                </span>

                {!isActive && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${info.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Category Description */}
        {activeCategory !== "all" && categoryInfo[activeCategory] && (
          <div className="text-center mb-10 animate-fadeIn">
            <div
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${categoryInfo[activeCategory].gradient} text-white shadow-lg`}
            >
              {categoryInfo[activeCategory].icon}
              <span className="font-medium">
                {categoryInfo[activeCategory].description}
              </span>
            </div>
          </div>
        )}

        {/* Projects Grid (Equal-Height Cards) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn items-stretch">
          {displayedProjects.map(({ project, category }, index) => {
            const ghData = getGithubDataForProject(project.githubLink);
            return (
              <div
                key={`${category}-${project.title}`}
                className="scroll-reveal h-full"
                style={{ transitionDelay: `${index * 0.08}s` }}
              >
                <ProjectCard
                  {...project}
                  lastCommit={ghData.lastCommit}
                  isArchived={ghData.isArchived}
                  isPrivate={ghData.isPrivate ?? project.isPrivate}
                  stars={ghData.stars}
                  forks={ghData.forks}
                  language={ghData.language}
                  watchers={ghData.watchers}
                  index={index}
                  categoryGradient={
                    categoryInfo[category]?.gradient ||
                    "from-violet-600 to-fuchsia-600"
                  }
                  categorySlug={categoryInfo[category]?.slug}
                  lang={lang}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProjelerSection;
