"use client";
import { useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import FooterComponent from "@/app/components/Footer";
import HeroSection from "@/app/components/HeroSection";
import TechStackSection from "@/app/components/TechStackSection";
import FeaturedProjects from "@/app/components/FeaturedProjects";
import ProjelerSection from "./components/ProjectCard";

export default function Home() {
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
    <main className="relative overflow-x-hidden min-h-screen">
      {/* Global Ambient Background Lights */}
      <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
        {/* Top Right - Violet Glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/10 dark:bg-violet-900/20 blur-[120px] mix-blend-screen" />

        {/* Bottom Left - Cyan/Blue Glow */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 dark:bg-blue-900/20 blur-[130px] mix-blend-screen" />

        {/* Center - Gentle Warmth */}
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-fuchsia-500/5 dark:bg-fuchsia-900/10 blur-[100px] mix-blend-screen opacity-50" />
      </div>

      <Navbar />
      <HeroSection />
      <TechStackSection />
      <FeaturedProjects />
      <ProjelerSection />
      <FooterComponent />
    </main>
  );
}