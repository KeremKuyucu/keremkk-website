"use client";

import React, { useEffect } from "react";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";
import AboutHero from "@/app/components/about/AboutHero";
import EducationSkills from "@/app/components/about/EducationSkills";
import CertificatesSection from "@/app/components/about/CertificatesSection";
import { Language } from "@/app/data/translations";

interface AboutPageClientProps {
  lang?: Language;
}

export default function AboutPageClient({ lang = "en" }: AboutPageClientProps) {
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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 overflow-x-hidden">
      <Navbar />
      <AboutHero lang={lang} />

      {/* Main Content Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12">
          <EducationSkills lang={lang} />
          <CertificatesSection lang={lang} />
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}
