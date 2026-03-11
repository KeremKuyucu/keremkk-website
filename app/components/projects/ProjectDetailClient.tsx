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
} from "react-icons/si";
import { Project, CategoryInfo } from "@/app/types";

const getTechIcon = (tech: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
        Flutter: <SiFlutter className="text-[#02569B]" />,
        "Next.js": <SiNextdotjs className="dark:text-white" />,
        "C++": <SiCplusplus className="text-[#00599C]" />,
        Dart: <SiDart className="text-[#0175C2]" />,
        Supabase: <SiSupabase className="text-[#3ECF8E]" />,
        Firebase: <SiFirebase className="text-[#FFCA28]" />,
        TypeScript: <SiTypescript className="text-[#3178C6]" />,
        "Tailwind CSS": <SiTailwindcss className="text-[#06B6D4]" />,
        Resend: <SiResend className="text-white" />,
    };
    return iconMap[tech] || <FaCode className="text-gray-500" />;
};

const fallbackImage = "/imgs/errorimage.webp";

interface ProjectDetailClientProps {
    categoryKey: string;
    categoryInfo: CategoryInfo;
    projects: Project[];
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

const extractRepoName = (githubLink: string): string | null => {
    const match = githubLink.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : null;
};

const ProjectDetailClient: React.FC<ProjectDetailClientProps> = ({
    categoryKey,
    categoryInfo: info,
    projects,
}) => {
    const [githubData, setGithubData] = useState<GithubData>({});
    const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

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

    useEffect(() => {
        const fetchGithubData = async () => {
            const repoNames = projects
                .map((p) => (p.githubLink ? extractRepoName(p.githubLink) : null))
                .filter((name): name is string => name !== null);
            if (repoNames.length === 0) return;
            try {
                const response = await fetch(`/api/github?repos=${repoNames.join(",")}`);
                if (response.ok) {
                    const data = await response.json();
                    setGithubData(data);
                }
            } catch (error) {
                console.error("Error fetching GitHub data:", error);
            }
        };
        fetchGithubData();
    }, [projects]);

    const getGhData = (githubLink?: string) => {
        if (!githubLink) return null;
        const repo = extractRepoName(githubLink);
        return repo ? githubData[repo] || null : null;
    };

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
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">

                <div className="container mx-auto max-w-6xl relative z-10">
                    {/* Back Button */}
                    <Link
                        href="/#projects"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-violet-500/50 transition-all duration-300 mb-8 group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Tüm Projeler</span>
                    </Link>

                    {/* Category Title */}
                    <div className="scroll-reveal">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div
                                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${info.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}
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
                                <span className="text-sm text-gray-500 dark:text-gray-400">Proje Sayısı</span>
                                <p
                                    className={`text-2xl font-bold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}
                                >
                                    {projects.length}
                                </p>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Teknolojiler</span>
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
            <section className="py-12 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="space-y-12">
                        {projects.map((project, index) => {
                            const ghData = getGhData(project.githubLink);
                            return (
                                <div
                                    key={`${categoryKey}-${project.title}`}
                                    className="scroll-reveal"
                                    style={{ transitionDelay: `${index * 0.15}s` }}
                                >
                                    <div className="group relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/10">
                                        <div className="grid md:grid-cols-2 gap-0">
                                            {/* Image */}
                                            <div className="relative aspect-video md:aspect-auto overflow-hidden">
                                                <img
                                                    src={imageErrors[index] ? fallbackImage : project.imageUrl}
                                                    alt={project.altText}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    onError={() =>
                                                        setImageErrors((prev) => ({ ...prev, [index]: true }))
                                                    }
                                                />
                                                {/* Gradient overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 dark:to-black/20 md:block hidden" />

                                                {/* Badges */}
                                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                    {ghData?.isPrivate && (
                                                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg flex items-center gap-1.5">
                                                            <FaLock className="text-[10px]" />
                                                            Private
                                                        </span>
                                                    )}
                                                    {project.isNew && (
                                                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg animate-pulse">
                                                            ✨ Yeni
                                                        </span>
                                                    )}
                                                    {project.isDeveloping && (
                                                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg">
                                                            🚧 Geliştiriliyor
                                                        </span>
                                                    )}
                                                    {ghData?.isArchived && (
                                                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg">
                                                            📦 Arşivlendi
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-8 flex flex-col justify-center">
                                                <h2
                                                    className={`text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}
                                                >
                                                    {project.title}
                                                </h2>

                                                <p className="text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                                                    {project.description}
                                                </p>

                                                {project.longDescription && (
                                                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-5 leading-relaxed">
                                                        {project.longDescription}
                                                    </p>
                                                )}

                                                {/* Tech Stack */}
                                                {project.techStack && project.techStack.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-5">
                                                        {project.techStack.map((tech, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50"
                                                            >
                                                                {getTechIcon(tech)}
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* GitHub Stats */}
                                                {ghData && (ghData.stars > 0 || ghData.forks > 0 || ghData.language) && (
                                                    <div className="flex flex-wrap items-center gap-3 mb-5 text-sm">
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
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
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
                                                        <span>Son commit: {ghData.lastCommit}</span>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex flex-wrap gap-3">
                                                    {project.viewLink && (
                                                        <a
                                                            href={project.viewLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r ${info.gradient} hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                                                        >
                                                            <FaExternalLinkAlt className="text-xs" />
                                                            Projeyi Görüntüle
                                                        </a>
                                                    )}
                                                    {project.githubLink && !ghData?.isPrivate && (
                                                        <a
                                                            href={project.githubLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-[1.02]"
                                                        >
                                                            <FaGithub />
                                                            GitHub
                                                        </a>
                                                    )}
                                                    {ghData?.isPrivate && (
                                                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60">
                                                            <FaLock className="text-xs" />
                                                            Private Repo
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

            <FooterComponent />
        </main>
    );
};

export default ProjectDetailClient;
