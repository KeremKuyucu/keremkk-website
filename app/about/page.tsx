"use client";
import { useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import FooterComponent from "@/app/components/Footer";
import AboutHero from "@/app/components/about/AboutHero";
import EducationSkills from "@/app/components/about/EducationSkills";
import CertificatesSection from "@/app/components/about/CertificatesSection";

export default function Hakkimda() {
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
      <AboutHero />

      {/* Main Content Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12">
          <EducationSkills />
          <CertificatesSection />
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}