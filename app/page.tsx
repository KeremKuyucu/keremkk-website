"use client";
import { useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import FooterComponent from "@/app/components/Footer";
import HeroSection from "@/app/components/HeroSection";
import TechStackSection from "@/app/components/TechStackSection";
import FeaturedProjects from "@/app/components/FeaturedProjects";
import ProjelerSection from "@/app/components/ProjectCard";
import Hyperspeed from "@/app/components/Hyperspeed";

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
      <Hyperspeed />

      <Navbar />
      <HeroSection />
      <TechStackSection />
      <FeaturedProjects />
      <ProjelerSection />
      <FooterComponent />
    </main>
  );
}