"use client";
import React from "react";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";
import ProjectsSection from "@/app/components/projects/ProjectCard";
import { Language } from "@/app/data/translations";

interface ProjectsPageClientProps {
  lang?: Language;
}

const ProjectsPageClient: React.FC<ProjectsPageClientProps> = ({ lang = "en" }) => {
  return (
    <main className="min-h-screen overflow-x-hidden relative">
      <Navbar />

      {/* Hyperspeed background */}
      <div className="relative min-h-screen">
        <div className="relative z-10 w-full min-h-screen bg-transparent">
          <ProjectsSection lang={lang} />
        </div>
        {/* Smooth fade to footer */}
        <div
          className="absolute bottom-0 left-0 w-full h-48 z-20 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--background))",
          }}
        />
      </div>

      <div className="relative z-20 bg-[var(--background)] flex flex-col">
        <FooterComponent />
      </div>
    </main>
  );
};

export default ProjectsPageClient;
