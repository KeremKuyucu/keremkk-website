"use client";
import React from "react";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";
import ProjectsSection from "@/app/components/projects/ProjectCard";
import Hyperspeed from "@/app/components/home/Hyperspeed";

const ProjectsPageClient: React.FC = () => {
    return (
        <main className="min-h-screen overflow-x-hidden relative">
            <Navbar />

            {/* Hyperspeed background */}
            <div className="relative min-h-screen">
                <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black">
                    <Hyperspeed />
                </div>
                <div className="relative z-10 w-full min-h-screen bg-transparent">
                    <ProjectsSection />
                </div>
                {/* Smooth fade to footer */}
                <div className="absolute bottom-0 left-0 w-full h-48 z-20 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, transparent, var(--background))' }}
                />
            </div>

            <FooterComponent />
        </main>
    );
};

export default ProjectsPageClient;
