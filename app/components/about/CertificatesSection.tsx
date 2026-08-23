"use client";
import React from "react";
import { FaCertificate } from "react-icons/fa";
import { translations, Language } from "@/app/data/translations";

interface CertificatesSectionProps {
    lang?: Language;
}

const CertificatesSection: React.FC<CertificatesSectionProps> = ({ lang = "en" }) => {
    const t = translations[lang].about;
    const certificates = t.certificatesList;

    return (
        <div className="lg:col-span-8">
            <h3 className="flex items-center gap-2 text-2xl font-bold mb-8 scroll-reveal text-gray-900 dark:text-white">
                <FaCertificate className="text-orange-500" /> {t.certificatesTitle}
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
                {certificates.map((cert, index) => (
                    <a
                        key={index}
                        href={cert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 scroll-reveal"
                        style={{ transitionDelay: `${index * 0.05}s` }}
                    >
                        <div className="p-10 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-900 transition-colors">
                            <div className="relative w-48 h-32 transform group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
                                <img
                                    src={cert.image}
                                    alt={cert.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col border-t border-gray-100 dark:border-gray-700">
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-orange-600 transition-colors">{cert.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{cert.issuedBy}</p>

                            <div className="mt-auto flex items-center text-sm font-semibold text-orange-500 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                {t.verifyCertificate} <span className="ml-1">→</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default CertificatesSection;
