"use client";
import { useEffect, useState, useMemo } from "react";
import { FaGithub, FaCode, FaRocket, FaTerminal } from "react-icons/fa";
import { roles, skills } from "@/app/data/skills";
import { getTotalProjectCount, getYearsOfExperience } from "@/app/data/projects";
import Lightning from "@/app/components/home/Lightning";

const particles = [
    { left: 5, top: 10, delay: 0, duration: 6 },
    { left: 15, top: 80, delay: 1.2, duration: 7 },
    { left: 25, top: 30, delay: 2.5, duration: 8 },
    { left: 35, top: 60, delay: 0.8, duration: 5.5 },
    { left: 45, top: 20, delay: 3.1, duration: 9 },
    { left: 55, top: 90, delay: 1.8, duration: 6.5 },
    { left: 65, top: 45, delay: 4.2, duration: 7.5 },
    { left: 75, top: 15, delay: 2.1, duration: 8.5 },
    { left: 85, top: 70, delay: 0.5, duration: 5 },
    { left: 95, top: 40, delay: 3.8, duration: 9.5 },
    { left: 10, top: 55, delay: 1.5, duration: 6.2 },
    { left: 20, top: 25, delay: 4.5, duration: 7.8 },
    { left: 30, top: 85, delay: 2.8, duration: 5.8 },
    { left: 40, top: 5, delay: 0.3, duration: 8.2 },
    { left: 50, top: 75, delay: 3.5, duration: 6.8 },
    { left: 60, top: 35, delay: 1.1, duration: 9.2 },
    { left: 70, top: 95, delay: 4.8, duration: 5.2 },
    { left: 80, top: 50, delay: 2.3, duration: 7.2 },
    { left: 90, top: 65, delay: 0.9, duration: 8.8 },
    { left: 12, top: 42, delay: 3.2, duration: 6.4 },
];

const HeroSection: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentRole, setCurrentRole] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Dynamic stats calculated from actual data
    const stats = useMemo(() => [
        { number: `${getTotalProjectCount()}+`, label: "Proje", icon: FaCode },
        { number: `${skills.length}+`, label: "Teknoloji", icon: FaRocket },
        { number: `${getYearsOfExperience()}+`, label: "Yıl Deneyim", icon: FaTerminal },
    ], []);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Typing animation
    useEffect(() => {
        const currentText = roles[currentRole];
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (displayText.length < currentText.length) {
                    setDisplayText(currentText.slice(0, displayText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), 2000);
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

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, currentRole]);

    return (
        <header
            className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-black/80 via-black/50 to-transparent"
        >
            {/* Lightning Background */}
            <div className="absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
                <Lightning hue={270} speed={0.5} intensity={1.5} />
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
                {particles.map((particle, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-40 animate-float"
                        style={{
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                            animationDelay: `${particle.delay}s`,
                            animationDuration: `${particle.duration}s`,
                        }}
                    />
                ))}
            </div>

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] z-10"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                    backgroundSize: "50px 50px",
                }}
            />

            {/* Main Hero Content */}
            <div className={`relative z-20 text-center px-6 max-w-5xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Greeting Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 backdrop-blur-sm mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Yeni projeler geliştiriyorum</span>
                </div>

                {/* Main Title */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                    <span className="block text-gray-900 dark:text-white">Merhaba, ben</span>
                    <span className="block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
                        Kerem Kuyucu
                    </span>
                </h1>

                {/* Subtitle with Typing Animation */}
                <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                    <span className="font-medium text-gray-900 dark:text-white">
                        {displayText}
                        <span className="animate-pulse">|</span>
                    </span>
                    <br />
                    <span className="text-lg">Hobi projeleri üreterek kendimi geliştiriyorum</span>
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                    <a
                        href="/projects"
                        className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/25"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <FaRocket className="group-hover:rotate-12 transition-transform" />
                            Projelerimi Gör
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </a>
                    <a
                        href="https://github.com/KeremKuyucu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group px-8 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-semibold text-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <FaGithub className="text-xl group-hover:rotate-12 transition-transform" />
                        GitHub Profilim
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
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-sm text-gray-500 dark:text-gray-400">Aşağı Kaydır</span>
                <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center pt-2">
                    <div className="w-1.5 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-scroll-indicator" />
                </div>
            </div>
        </header>
    );
};

export default HeroSection;
