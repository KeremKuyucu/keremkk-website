"use client";
import { Icon } from "@iconify/react";
import { FaGraduationCap, FaCode } from "react-icons/fa";
import { skills } from "@/app/data/skills";

const education = [
    {
        school: "Bilecik Şeyh Edebali Üniversitesi",
        period: "2026-Günümüz",
        current: true,
        department: "Elektrik-Elektronik Mühendisliği",
        city: "Bilecik",
        country: "Türkiye",
        description: "Lisans eğitimime Elektrik-Elektronik Mühendisliği bölümünde devam ediyorum.",
    },
    {
        school: "Ertuğrulgazi Lisesi",
        period: "2022-2026",
        current: false,
        department: "Sayısal",
        city: "Bilecik",
        country: "Türkiye",
        description: "Lise eğitimimi sayısal alanda başarıyla tamamladım.",
    },
    {
        school: "Deneyap Teknoloji Atölyeleri",
        period: "2022-2025",
        current: false,
        city: "Bilecik",
        country: "Türkiye",
        description: "Robotik kodlama, elektronik programlama ve yapay zeka vb alanlarında 3 yıl süren kapsamlı eğitim.",
    },
];

const EducationSkills: React.FC = () => {
    return (
        <div className="lg:col-span-4 space-y-12">
            {/* Education Timeline */}
            <div className="scroll-reveal">
                <h3 className="flex items-center gap-2 text-2xl font-bold mb-8 text-gray-900 dark:text-white">
                    <FaGraduationCap className="text-blue-600" /> Eğitim
                </h3>
                <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 space-y-8 pl-8">
                    {education.map((edu, index) => (
                        <div key={index} className="relative">
                            <span className={`absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-gray-900 ${edu.current ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mb-2 inline-block">
                                    {edu.period}
                                </span>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{edu.school}</h4>
                                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">{edu.department || "Öğrenci"}</p>
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
                    <FaCode className="text-violet-600" /> Kullandığım Teknolojiler
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

                {/* CV Download */}
                <a
                    href="/cv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-6 flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-violet-500 dark:hover:border-violet-500 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
                >
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">Özgeçmişim</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF olarak indir</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </a>
            </div>
        </div>
    );
};

export default EducationSkills;
