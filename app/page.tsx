"use client";
import { useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import FooterComponent from "@/app/components/Footer";
import HeroSection from "@/app/components/HeroSection";
import TechStackSection from "@/app/components/TechStackSection";
import FeaturedProjects from "@/app/components/FeaturedProjects";
import ContactSection from "@/app/components/ContactSection";
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
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <TechStackSection />
      <FeaturedProjects />
      <ProjelerSection />
      <ContactSection />
      <FooterComponent />
    </main>
  );
}