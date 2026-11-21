"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { FaGithub, FaCode, FaRocket, FaTerminal } from "react-icons/fa";
import { skills } from "@/app/data/skills";
import { getTotalProjectCount, getYearsOfExperience } from "@/app/data/projects";
import CircuitSignalBackground from "@/app/components/home/CircuitSignalBackground";
import { translations, Language } from "@/app/data/translations";
import DiscordStatusBadge from "@/app/components/DiscordStatusBadge";

interface HeroSectionProps {
    lang?: Language;
}

const HeroSection: React.FC<HeroSectionProps> = ({ lang = "en" }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentRole, setCurrentRole] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const t = translations[lang].home;
    const roles = t.roles;

    // Dynamic stats calculated from actual data
    const stats = useMemo(
        () => [
            { number: `${getTotalProjectCount()}+`, label: t.stats.projects, icon: FaCode },
            { number: `${skills.length}+`, label: t.stats.technologies, icon: FaRocket },
            { number: `${getYearsOfExperience()}+`, label: t.stats.yearsExperience, icon: FaTerminal },
        ],
        [t.stats]
    );

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Typing animation
    useEffect(() => {
        const currentText = roles[currentRole % roles.length];
        let pauseTimer: ReturnType<typeof setTimeout> | undefined;
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (displayText.length < currentText.length) {
                    setDisplayText(currentText.slice(0, displayText.length + 1));
                } else {
                    pauseTimer = setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                if (displayText.length > 0) {
                    setDisplayText(displayText.slice(0, -1));
                } else {
                    setIsDeleting(false);
                    setCurrentRole((prev) => (prev + 1) % roles.length);
                }
            }
        }, isDeleting ? 50 : 100);

        return () => {
            clearTimeout(timeout);
            if (pauseTimer) clearTimeout(pauseTimer);
        };
    }, [displayText, isDeleting, currentRole, roles]);

    const projectsHref = lang === "tr" ? "/tr/projects" : "/projects";

    return (
        <header className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-300">
            {/* Circuit & Signal Interactive Background */}
            <CircuitSignalBackground />

            {/* Main Hero Content */}
            <div
                className={`relative z-20 text-center px-6 max-w-5xl mx-auto transition-all duration-1000 ${
                    isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
            >
                {/* Live Discord Availability Badge */}
                <DiscordStatusBadge lang={lang} variant="hero" className="mb-8" />

                {/* Main Title */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                    <span className="block text-gray-900 dark:text-white">{t.greeting}</span>
                    <span className="block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
                        {t.name}
                    </span>
                </h1>

                {/* Subtitle with Typing Animation */}
                <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                    <span className="font-medium text-gray-900 dark:text-white">
                        {displayText}
                        <span className="animate-pulse text-fuchsia-500">|</span>
                    </span>
                    <br />
                    <span className="text-lg">{t.bioLine}</span>
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                    <Link
                        href={projectsHref}
                        className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/25"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <FaRocket className="group-hover:rotate-12 transition-transform" />
                            {t.viewProjects}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                    <a
                        href="https://github.com/KeremKuyucu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group px-8 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-semibold text-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <FaGithub className="text-xl group-hover:rotate-12 transition-transform" />
                        {t.githubProfile}
                    </a>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="text-center group cursor-default"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <stat.icon className="text-2xl text-violet-500 group-hover:scale-110 transition-transform" />
                                <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                    {stat.number}
                                </span>
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t.scrollDown}</span>
                <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center pt-2">
                    <div className="w-1.5 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-scroll-indicator" />
                </div>
            </div>
        </header>
    );
};

export default HeroSection;
