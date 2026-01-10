"use client";
import { useEffect, useState, useRef } from "react";
import ProjelerSection from "./components/ProjectCard";
import Navbar from "@/app/components/Navbar";
import FooterComponent from "@/app/components/Footer";
import { FaGithub, FaCode, FaRocket, FaMobile, FaGlobe, FaDatabase, FaCloud, FaTerminal } from "react-icons/fa";
import { SiFlutter, SiNextdotjs, SiTypescript, SiCplusplus, SiDart, SiSupabase, SiFirebase, SiVercel } from "react-icons/si";

const techStack = [
  { icon: SiFlutter, name: "Flutter", color: "#02569B" },
  { icon: SiNextdotjs, name: "Next.js", color: "#000000" },
  { icon: SiTypescript, name: "TypeScript", color: "#3178C6" },
  { icon: SiCplusplus, name: "C++", color: "#00599C" },
  { icon: SiDart, name: "Dart", color: "#0175C2" },
  { icon: SiSupabase, name: "Supabase", color: "#3ECF8E" },
  { icon: SiFirebase, name: "Firebase", color: "#FFCA28" },
  { icon: SiVercel, name: "Vercel", color: "#000000" },
];

const stats = [
  { number: "10+", label: "Proje", icon: FaCode },
  { number: "6+", label: "Teknoloji", icon: FaRocket },
  { number: "3+", label: "Yıl Deneyim", icon: FaTerminal },
];

const featuredProjects = [
  {
    title: "GeoGame",
    description: "Coğrafya öğrenmeyi eğlenceli hale getiren çoklu platform oyunu",
    tags: ["Flutter", "C++", "Next.js"],
    gradient: "from-emerald-500 to-teal-600",
    link: "https://geogame.keremkk.com.tr",
  },
  {
    title: "PikaMed",
    description: "Yapay zeka destekli sağlık takip sistemi",
    tags: ["Flutter", "Next.js", "AI"],
    gradient: "from-rose-500 to-pink-600",
    link: "https://pikamed.keremkk.com.tr",
  },
  {
    title: "DiscordStorage",
    description: "Discord üzerinden dosya depolama çözümü",
    tags: ["C++", "Flutter", "Dart"],
    gradient: "from-violet-500 to-purple-600",
    link: "https://github.com/KeremKuyucu/DiscordStorage",
  },
];

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 30,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 30,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
  }, []);

  return (
    <main className="overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header
        ref={heroRef}
        className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      >
        {/* Animated Background Gradient Orbs */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[100px] transition-transform duration-1000 ease-out"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
            left: "10%",
            top: "20%",
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-25 blur-[80px] transition-transform duration-1000 ease-out"
          style={{
            background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #3b82f6 100%)",
            right: "10%",
            bottom: "30%",
            transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-20 blur-[60px] transition-transform duration-1000 ease-out"
          style={{
            background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
            right: "30%",
            top: "10%",
            transform: `translate(${mousePosition.x * 0.2}px, ${-mousePosition.y * 0.4}px)`,
          }}
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-40 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Main Hero Content */}
        <div className={`relative z-10 text-center px-6 max-w-5xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            <span className="font-medium text-gray-900 dark:text-white">Full-Stack Developer</span> &
            <span className="font-medium text-gray-900 dark:text-white"> Mobile App Developer</span>
            <br />
            <span className="text-lg">Hobi projeleri üreterek kendimi geliştiriyorum</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="#projeler"
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

      {/* Tech Stack Section */}
      <section className="py-20 px-6 scroll-reveal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Kullandığım Teknolojiler
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Projelerimde kullandığım modern teknolojiler ve araçlar
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-violet-500/10"
              >
                <tech.icon
                  className="text-4xl sm:text-5xl mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ color: tech.color }}
                />
                <p className="text-center font-medium text-gray-700 dark:text-gray-300">
                  {tech.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="py-20 px-6 scroll-reveal" id="projeler">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Öne Çıkan Projeler
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              En son üzerinde çalıştığım ve en çok ilgi gören projelerim
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {featuredProjects.map((project, index) => (
              <a
                key={index}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, var(--background) 0%, var(--background) 100%)`,
                }}
              >
                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                {/* Border Gradient */}
                <div
                  className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-br ${project.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                  style={{
                    WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor" as any,
                    maskComposite: "exclude",
                  }}
                />

                <div className="relative z-10">
                  <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${project.gradient} bg-clip-text text-transparent`}>
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-fuchsia-500 transition-all duration-300">
                  <FaGlobe className="text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* All Projects Section */}
      <ProjelerSection />

      <FooterComponent />
    </main>
  );
}