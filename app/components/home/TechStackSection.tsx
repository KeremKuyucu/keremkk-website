"use client";
import React from "react";
import { skills } from "@/app/data/skills";
import { translations, Language } from "@/app/data/translations";

interface TechStackSectionProps {
    lang?: Language;
}

const TechStackSection: React.FC<TechStackSectionProps> = ({ lang = "en" }) => {
    const t = translations[lang].home;

    return (
        <section className="py-20 px-6 scroll-reveal">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                        {t.techStackTitle}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t.techStackSubtitle}
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {skills.map((tech, index) => (
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
    );
};

export default TechStackSection;
