"use client";
import React from "react";
import { Icon } from "@iconify/react";
import { FaGraduationCap, FaCode } from "react-icons/fa";
import { skills } from "@/app/data/skills";
import { translations, Language } from "@/app/data/translations";

interface EducationSkillsProps {
    lang?: Language;
}

const EducationSkills: React.FC<EducationSkillsProps> = ({ lang = "en" }) => {
    const t = translations[lang].about;
    const education = t.educationList;

    return (
        <div className="lg:col-span-4 space-y-12">
            {/* Education Timeline */}
            <div className="scroll-reveal">
                <h3 className="flex items-center gap-2 text-2xl font-bold mb-8 text-gray-900 dark:text-white">
                    <FaGraduationCap className="text-violet-600 dark:text-fuchsia-400" /> {t.educationTitle}
                </h3>
                <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 space-y-8 pl-8">
                    {education.map((edu, index) => (
                        <div key={index} className="relative">
                            <span className={`absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-gray-900 ${edu.current ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mb-2 inline-block">
                                    {edu.period}
                                </span>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{edu.school}</h4>
                                <p className="text-violet-600 dark:text-fuchsia-400 text-sm font-medium mb-2">{edu.department || t.currentStudent}</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {edu.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div className="scroll-reveal delay-200">
                <h3 className="flex items-center gap-2 text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    <FaCode className="text-violet-600 dark:text-violet-400" /> {t.skillsTitle}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {skills.map((skill) => (
                        <div
                            key={skill.name}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors shadow-sm group"
                        >
                            <div className="shrink-0 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-violet-50 dark:group-hover:bg-violet-900/30 transition-colors">
                                <Icon icon={skill.iconifyIcon} width={24} height={24} />
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{skill.name}</h4>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EducationSkills;
