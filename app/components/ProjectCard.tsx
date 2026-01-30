"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaGithub, FaExternalLinkAlt, FaCode, FaCheckCircle, FaLock, FaStar, FaCodeBranch, FaEye } from "react-icons/fa";
import { SiFlutter, SiNextdotjs, SiCplusplus, SiDart, SiSupabase, SiFirebase, SiTypescript, SiTailwindcss, SiResend } from "react-icons/si";
import { projectsByCategory, categoryInfo } from "@/app/data/projects";
import { Project } from "@/app/types";


const fallbackImage = "/imgs/errorimage.jpg";

const getTechIcon = (tech: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    "Flutter": <SiFlutter className="text-[#02569B]" />,
    "Next.js": <SiNextdotjs className="dark:text-white" />,
    "C++": <SiCplusplus className="text-[#00599C]" />,
    "Dart": <SiDart className="text-[#0175C2]" />,
    "Supabase": <SiSupabase className="text-[#3ECF8E]" />,
    "Firebase": <SiFirebase className="text-[#FFCA28]" />,
    "TypeScript": <SiTypescript className="text-[#3178C6]" />,
    "Tailwind CSS": <SiTailwindcss className="text-[#06B6D4]" />,
    "Resend": <SiResend className="text-white" />,
  };
  return iconMap[tech] || <FaCode className="text-gray-500" />;
};

type ProjectCardProps = Project & {
  index: number;
  categoryGradient: string;
  isArchived?: boolean;
  isPrivate?: boolean;
  lastCommit?: string;
  stars?: number;
  forks?: number;
  language?: string | null;
  watchers?: number;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  imageUrl,
  altText,
  isNew,
  isDeveloping,
  isArchived,
  isPrivate,
  lastCommit,
  stars,
  forks,
  language,
  watchers,
  title,
  description,
  features,
  techStack,
  viewLink,
  githubLink,
  index,
  categoryGradient,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={imageError ? fallbackImage : imageUrl}
          alt={altText}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImageError(true)}
        />

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[calc(100%-2rem)]">
          {isPrivate && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg flex items-center gap-1.5">
              <FaLock className="text-[10px]" />
              Private
            </span>
          )}
          {isNew && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg animate-pulse">
              ✨ Yeni
            </span>
          )}
          {isDeveloping && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg">
              🚧 Geliştiriliyor
            </span>
          )}
          {isArchived && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg">
              📦 Arşivlendi
            </span>
          )}
        </div>

        {/* Quick Actions on Hover */}
        <div className={`absolute bottom-4 right-4 flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {viewLink && (
            <a
              href={viewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-800 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
              title="Projeyi Görüntüle"
            >
              <FaExternalLinkAlt className="text-sm" />
            </a>
          )}
          {githubLink && !isPrivate && (
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-900/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-gray-900 hover:scale-110 transition-all duration-300 shadow-lg"
              title="GitHub"
            >
              <FaGithub className="text-lg" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className={`text-xl font-bold mb-2 bg-gradient-to-r ${categoryGradient} bg-clip-text text-transparent`}>
          {title}
        </h3>

        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {description}
          </p>
        )}

        {/* Tech Stack with Icons */}
        {techStack && techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {techStack.map((tech, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50"
              >
                {getTechIcon(tech)}
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* GitHub Stats */}
        {(stars !== undefined || forks !== undefined || language) && (
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            {stars !== undefined && stars > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                <FaStar className="text-xs" />
                <span className="font-medium">{stars}</span>
              </div>
            )}
            {forks !== undefined && forks > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                <FaCodeBranch className="text-xs" />
                <span className="font-medium">{forks}</span>
              </div>
            )}
            {watchers !== undefined && watchers > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                <FaEye className="text-xs" />
                <span className="font-medium">{watchers}</span>
              </div>
            )}
            {language && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                <FaCode className="text-xs" />
                <span className="font-medium">{language}</span>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {features.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <FaCheckCircle className="text-emerald-500 text-[10px]" />
              {feature}
            </span>
          ))}
        </div>

        {/* Last Commit */}
        {lastCommit && (
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Son commit: {lastCommit}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
          {viewLink && (
            <a
              href={viewLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${categoryGradient} hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
            >
              <FaExternalLinkAlt className="text-xs" />
              Görüntüle
            </a>
          )}
          {githubLink && !isPrivate && (
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-[1.02]"
            >
              <FaGithub />
              GitHub
            </a>
          )}
          {isPrivate && (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60">
              <FaLock className="text-xs" />
              Private Repo
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProjelerSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [githubData, setGithubData] = useState<{ [key: string]: { lastCommit: string; isArchived: boolean; stars: number; forks: number; language: string | null; isPrivate: boolean; watchers: number; } }>({});
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Extract repo names from GitHub links
  const extractRepoName = (githubLink: string): string | null => {
    const match = githubLink.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : null;
  };

  // Fetch GitHub data when component mounts
  useEffect(() => {
    const fetchGithubData = async () => {
      setIsLoadingGithub(true);
      const allProjects = Object.values(projectsByCategory).flat();
      const repoNames = allProjects
        .map((p) => p.githubLink ? extractRepoName(p.githubLink) : null)
        .filter((name): name is string => name !== null);

      if (repoNames.length === 0) {
        setIsLoadingGithub(false);
        return;
      }

      try {
        const response = await fetch(`/api/github?repos=${repoNames.join(',')}`);
        if (response.ok) {
          const data = await response.json();
          setGithubData(data);
        }
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
      } finally {
        setIsLoadingGithub(false);
      }
    };

    fetchGithubData();
  }, []);

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

  // Helper to get GitHub data for a project
  const getGithubDataForProject = (githubLink?: string) => {
    if (!githubLink) return { lastCommit: undefined, isArchived: undefined, stars: undefined, forks: undefined, language: undefined, isPrivate: undefined, watchers: undefined };
    const repoName = extractRepoName(githubLink);

    if (repoName && githubData[repoName]) {
      return githubData[repoName];
    }

    return { lastCommit: undefined, isArchived: undefined, stars: undefined, forks: undefined, language: undefined, isPrivate: undefined, watchers: undefined };
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Tüm Projelerim
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Geliştirdiğim projeler kategorilere ayrılmış şekilde.
            Detayları görüntülemek için bir kategori seçin.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 scroll-reveal">
          {categories.map((category) => {
            const info = categoryInfo[category] || { gradient: "from-gray-500 to-gray-600" };
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(isActive ? null : category)}
                className={`group relative px-6 py-3 rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 overflow-hidden ${isActive
                  ? `bg-gradient-to-r ${info.gradient} text-white shadow-lg shadow-violet-500/25 scale-105`
                  : "bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
                  }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {info.icon}
                  {category}
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20 dark:bg-black/20">
                    {projectsByCategory[category].length}
                  </span>
                </span>

                {/* Hover Effect */}
                {!isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${info.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Category Description */}
        {activeCategory && categoryInfo[activeCategory] && (
          <div className="text-center mb-12 animate-fadeIn">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${categoryInfo[activeCategory].gradient} text-white shadow-lg`}>
              {categoryInfo[activeCategory].icon}
              <span className="font-medium">{categoryInfo[activeCategory].description}</span>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {activeCategory && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {projectsByCategory[activeCategory].map((project, index) => {
              const ghData = getGithubDataForProject(project.githubLink);
              return (
                <div
                  key={`${activeCategory}-${project.title}`}
                  className="scroll-reveal"
                  style={{ transitionDelay: `${index * 0.1}s` }}
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
                    categoryGradient={categoryInfo[activeCategory]?.gradient || "from-gray-500 to-gray-600"}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!activeCategory && (
          <div className="text-center py-16 scroll-reveal">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 mb-6">
              <FaCode className="text-4xl text-violet-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bir Kategori Seçin
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Yukarıdaki kategorilerden birine tıklayarak projelerimi keşfedebilirsiniz.
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                  {Object.values(projectsByCategory).flat().length}
                </p>
                <p className="text-sm text-gray-500">Toplam Proje</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  {categories.length}
                </p>
                <p className="text-sm text-gray-500">Kategori</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjelerSection;