"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";
import {
    FaArrowLeft,
    FaGithub,
    FaExternalLinkAlt,
    FaCheckCircle,
    FaCode,
    FaLock,
    FaStar,
    FaCodeBranch,
    FaEye,
    FaWindows,
    FaSearchPlus,
    FaTimes,
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
import { Project, CategoryInfo } from "@/app/types";
import { translations, Language } from "@/app/data/translations";

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

const fallbackImage = "/imgs/errorimage.webp";

interface ProjectDetailClientProps {
    categoryKey: string;
    categoryInfo: CategoryInfo;
    projects: Project[];
    lang?: Language;
}

interface GithubData {
    [key: string]: {
        lastCommit: string;
        isArchived: boolean;
        stars: number;
        forks: number;
        language: string | null;
        isPrivate: boolean;
        watchers: number;
    };
}

interface LightboxImage {
    src: string;
    alt: string;
    title: string;
}

const extractRepoName = (githubLink: string): string | null => {
    const match = githubLink.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : null;
};

const ProjectDetailClient: React.FC<ProjectDetailClientProps> = ({
    categoryKey,
    categoryInfo: info,
    projects,
    lang = "en",
}) => {
    const [githubData, setGithubData] = useState<GithubData>({});
    const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
    const [lightbox, setLightbox] = useState<LightboxImage | null>(null);
    const t = translations[lang].projects;

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
        document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // Close lightbox on Escape key and lock body scroll while open
    useEffect(() => {
        if (!lightbox) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setLightbox(null);
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [lightbox]);

    useEffect(() => {
        const fetchGithubData = async () => {
            const repoNames = projects
                .map((p) => (p.githubLink ? extractRepoName(p.githubLink) : null))
                .filter((name): name is string => name !== null);
            if (repoNames.length === 0) return;
            try {
                const response = await fetch(`/api/github?repos=${repoNames.join(",")}&lang=${lang}`);
                if (response.ok) {
                    const data = await response.json();
                    setGithubData(data);
                }
            } catch (error) {
                console.error("Error fetching GitHub data:", error);
            }
        };
        fetchGithubData();
    }, [projects, lang]);

    const getGhData = (githubLink?: string) => {
        if (!githubLink) return null;
        const repo = extractRepoName(githubLink);
        return repo ? githubData[repo] || null : null;
    };

    const backHref = lang === "tr" ? "/tr/projects" : "/projects";
    const zoomLabel = lang === "tr" ? "Büyüt" : "Zoom";
    const closeLabel = lang === "tr" ? "Kapat" : "Close";

    return (
        <main className="min-h-screen bg-transparent overflow-x-hidden relative">
            {/* Page-wide background orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div
                    className={`absolute top-[5%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br ${info.gradient} opacity-15 rounded-full blur-[150px]`}
                />
                <div
                    className={`absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br ${info.gradient} opacity-10 rounded-full blur-[130px]`}
                />
                <div
                    className={`absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-gradient-to-br ${info.gradient} opacity-8 rounded-full blur-[120px]`}
                />
            </div>
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-6 overflow-hidden">
                <div className="container mx-auto max-w-6xl relative z-10">
                    {/* Back Button */}
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-violet-500/50 transition-all duration-300 mb-8 group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">{t.backToProjects}</span>
                    </Link>

                    {/* Category Title */}
                    <div className="scroll-reveal">
                        <div className="inline-flex items-center gap-4 mb-6">
                            <div
                                className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${info.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}
                            >
                                {info.icon}
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                                    {info.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">
                                    {info.description}
                                </p>
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="flex flex-wrap gap-4 mt-6">
                            <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{t.projectCount}</span>
                                <p
                                    className={`text-2xl font-bold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}
                                >
                                    {projects.length}
                                </p>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{t.technologiesCount}</span>
                                <p
                                    className={`text-2xl font-bold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}
                                >
                                    {[...new Set(projects.flatMap((p) => p.techStack || []))].length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="py-10 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="space-y-12">
                        {projects.map((project, index) => {
                            const ghData = getGhData(project.githubLink);
                            const isPrivate = ghData?.isPrivate ?? project.isPrivate;
                            const resolvedSrc = imageErrors[index] ? fallbackImage : project.imageUrl;

                            return (
                                <div
                                    key={`${categoryKey}-${project.title}`}
                                    className="scroll-reveal"
                                    style={{ transitionDelay: `${index * 0.12}s` }}
                                >
                                    <div className="group relative bg-white/75 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-200/70 dark:border-gray-800/80 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/10">
                                        <div className="grid md:grid-cols-2 gap-0">
                                            {/* Studio-Framed Uncropped Showcase Image Column */}
                                            <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200/70 dark:from-[#0f1320] dark:via-[#121626] dark:to-[#0a0d16] border-b md:border-b-0 md:border-r border-gray-200/70 dark:border-white/[0.06]">
                                                {/* Subtle Category Tint & Studio Radial Highlight */}
                                                <div
                                                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-[0.09] dark:opacity-[0.14]`}
                                                />
                                                <div
                                                    className="pointer-events-none absolute inset-0"
                                                    style={{
                                                        background:
                                                            "radial-gradient(ellipse 75% 60% at 50% 0%, rgba(139,92,246,0.14), transparent 72%)",
                                                    }}
                                                />

                                                {/* Top Badges */}
                                                {(isPrivate || project.isNew || project.isDeveloping || ghData?.isArchived) && (
                                                    <div className="relative z-10 w-full flex flex-wrap justify-end gap-1.5 mb-3">
                                                        {project.isNew && (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md">
                                                                {t.badges.new}
                                                            </span>
                                                        )}
                                                        {project.isDeveloping && (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-900/80 dark:bg-white/15 text-white border border-white/15 backdrop-blur-md">
                                                                {t.badges.developing}
                                                            </span>
                                                        )}
                                                        {isPrivate && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/90 text-white shadow-sm">
                                                                <FaLock className="text-[9px]" />
                                                                {t.badges.private}
                                                            </span>
                                                        )}
                                                        {ghData?.isArchived && (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-700/85 text-gray-100">
                                                                {t.badges.archived}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Clickable Uncropped Screenshot Frame */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setLightbox({
                                                            src: resolvedSrc,
                                                            alt: project.altText,
                                                            title: project.title,
                                                        })
                                                    }
                                                    aria-label={`${project.title} — ${zoomLabel}`}
                                                    className="group/img relative z-10 w-full cursor-zoom-in rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                                                >
                                                    <img
                                                        src={resolvedSrc}
                                                        alt={project.altText}
                                                        className="w-full h-auto max-h-[420px] object-contain rounded-xl border border-gray-200/80 dark:border-white/10 shadow-2xl shadow-black/15 dark:shadow-black/50 bg-gray-950/90 transition-transform duration-300 ease-out group-hover/img:scale-[1.015]"
                                                        onError={() =>
                                                            setImageErrors((prev) => ({ ...prev, [index]: true }))
                                                        }
                                                    />

                                                    {/* Subtle Zoom Hint Pill */}
                                                    <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 text-white text-xs font-medium backdrop-blur-md border border-white/15 opacity-75 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity duration-200">
                                                        <FaSearchPlus className="text-[11px]" />
                                                        <span>{zoomLabel}</span>
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Content Column */}
                                            <div className="p-6 sm:p-8 flex flex-col justify-center">
                                                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                                                    {project.title}
                                                </h2>

                                                <p className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                                                    {project.description}
                                                </p>

                                                {project.longDescription && (
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 leading-relaxed">
                                                        {project.longDescription}
                                                    </p>
                                                )}

                                                {/* Tech Stack */}
                                                {project.techStack && project.techStack.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-5">
                                                        {project.techStack.map((tech, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl bg-gray-100/90 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/70 dark:border-gray-700/60"
                                                            >
                                                                {getTechIcon(tech)}
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* GitHub Stats */}
                                                {ghData && (ghData.stars > 0 || ghData.forks > 0 || ghData.language) && (
                                                    <div className="flex flex-wrap items-center gap-2.5 mb-5 text-xs sm:text-sm">
                                                        {ghData.stars > 0 && (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                                                <FaStar className="text-xs" />
                                                                <span className="font-medium">{ghData.stars}</span>
                                                            </div>
                                                        )}
                                                        {ghData.forks > 0 && (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                                                <FaCodeBranch className="text-xs" />
                                                                <span className="font-medium">{ghData.forks}</span>
                                                            </div>
                                                        )}
                                                        {ghData.watchers > 0 && (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                                                <FaEye className="text-xs" />
                                                                <span className="font-medium">{ghData.watchers}</span>
                                                            </div>
                                                        )}
                                                        {ghData.language && (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                                                <FaCode className="text-xs" />
                                                                <span className="font-medium">{ghData.language}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Features */}
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {project.features.map((feature, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                        >
                                                            <FaCheckCircle className="text-emerald-500 text-[10px]" />
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Last Commit */}
                                                {ghData?.lastCommit && (
                                                    <div className="flex items-center gap-2 mb-5 text-xs text-gray-500 dark:text-gray-400">
                                                        <svg
                                                            className="w-3.5 h-3.5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                        <span>
                                                            {t.lastCommit} {ghData.lastCommit}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex flex-wrap gap-3">
                                                    {project.viewLink && (
                                                        <a
                                                            href={project.viewLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02] transition-all duration-300"
                                                        >
                                                            <FaExternalLinkAlt className="text-xs" />
                                                            {t.viewProject}
                                                        </a>
                                                    )}
                                                    {project.githubLink && !isPrivate && (
                                                        <a
                                                            href={project.githubLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/70 hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-300 transition-all duration-300 hover:scale-[1.02]"
                                                        >
                                                            <FaGithub />
                                                            {t.github}
                                                        </a>
                                                    )}
                                                    {isPrivate && (
                                                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70">
                                                            <FaLock className="text-xs" />
                                                            {t.privateRepo}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Click-to-Zoom Lightbox Modal */}
            {lightbox && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={lightbox.title}
                    onClick={() => setLightbox(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md animate-fadeIn cursor-zoom-out"
                >
                    <button
                        type="button"
                        onClick={() => setLightbox(null)}
                        aria-label={closeLabel}
                        className="fixed top-5 right-5 z-50 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-colors cursor-pointer"
                    >
                        <FaTimes className="text-base" />
                    </button>

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-6xl w-full flex flex-col items-center cursor-default"
                    >
                        <img
                            src={lightbox.src}
                            alt={lightbox.alt}
                            className="max-h-[82vh] w-auto max-w-full object-contain rounded-2xl border border-white/15 shadow-2xl bg-gray-950"
                        />
                        <div className="mt-4 flex items-center gap-3 text-xs sm:text-sm text-gray-300">
                            <span className="font-semibold text-white">{lightbox.title}</span>
                            <span className="text-white/30">•</span>
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/10 text-gray-300">
                                ESC
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <FooterComponent />
        </main>
    );
};

export default ProjectDetailClient;
