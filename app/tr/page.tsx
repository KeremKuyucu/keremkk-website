"use client";
import React, { useEffect } from "react";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";
import HeroSection from "@/app/components/home/HeroSection";
import TechStackSection from "@/app/components/home/TechStackSection";

export default function TurkishHome() {
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
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 overflow-x-hidden">
      <Navbar />
      <HeroSection lang="tr" />
      <TechStackSection lang="tr" />
      <FooterComponent />
    </main>
  );
}
