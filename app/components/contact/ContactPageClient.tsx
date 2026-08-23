"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";
import { FaPaperPlane, FaEnvelope, FaUser, FaTag, FaComment, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { socialLinks } from "@/app/components/layout/Footer";
import { translations, Language } from "@/app/data/translations";

interface ContactPageClientProps {
    lang?: Language;
}

const ContactPageClient: React.FC<ContactPageClientProps> = ({ lang = "en" }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const t = translations[lang].contact;

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        // Client-side validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
            setStatus("error");
            setErrorMessage(t.fillAllFields);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setStatus("error");
            setErrorMessage(t.invalidEmail);
            return;
        }

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    userAgent: navigator.userAgent,
                }),
            });

            if (res.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                const data = await res.json();
                setStatus("error");
                setErrorMessage(data.error || t.sendError);
            }
        } catch {
            setStatus("error");
            setErrorMessage(t.connectionError);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (status === "error") setStatus("idle");
    };

    return (
        <main className="min-h-screen bg-transparent overflow-x-hidden relative">
            {/* Page-wide background orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[5%] left-[-5%] w-[600px] h-[600px] bg-violet-500/15 rounded-full blur-[150px]" />
                <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[130px]" />
                <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[120px]" />
            </div>
            <Navbar />

            {/* Hero */}
            <section className="relative pt-32 pb-16 px-6 overflow-hidden">
                <div className="container mx-auto max-w-4xl relative z-10 text-center scroll-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 backdrop-blur-sm mb-6">
                        <FaEnvelope className="text-violet-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t.badge}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
                        {t.titlePrefix}{" "}
                        <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                            {t.titleHighlight}
                        </span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t.subtitle}
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-5 gap-12">
                        {/* Contact Form */}
                        <div className="lg:col-span-3 scroll-reveal">
                            <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-8 shadow-xl">
                                {/* Decorative gradient */}
                                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" />

                                {status === "success" ? (
                                    <div className="text-center py-12 animate-fadeIn">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
                                            <FaCheckCircle className="text-4xl text-emerald-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {t.successTitle}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            {t.successSubtitle}
                                        </p>
                                        <button
                                            onClick={() => setStatus("idle")}
                                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:scale-[1.02] transition-all duration-300"
                                        >
                                            {t.sendNewMessage}
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {t.formTitle}
                                        </h2>

                                        {/* Name */}
                                        <div className="relative">
                                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder={t.namePlaceholder}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                                                required
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder={t.emailPlaceholder}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                                                required
                                            />
                                        </div>

                                        {/* Subject */}
                                        <div className="relative">
                                            <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder={t.subjectPlaceholder}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                                                required
                                            />
                                        </div>

                                        {/* Message */}
                                        <div className="relative">
                                            <FaComment className="absolute left-4 top-5 text-gray-400" />
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder={t.messagePlaceholder}
                                                rows={5}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 resize-none"
                                                required
                                            />
                                        </div>

                                        {/* Error Message */}
                                        {status === "error" && (
                                            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium animate-fadeIn">
                                                <FaExclamationTriangle />
                                                {errorMessage}
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={status === "loading"}
                                            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30"
                                        >
                                            {status === "loading" ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    {t.submittingButton}
                                                </>
                                            ) : (
                                                <>
                                                    <FaPaperPlane />
                                                    {t.submitButton}
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-2 scroll-reveal" style={{ transitionDelay: "0.2s" }}>
                            <div className="space-y-6">
                                {/* Quick Contact Card */}
                                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-8">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        {t.otherChannels}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                                        {t.otherChannelsSubtitle}
                                    </p>

                                    <div className="space-y-3">
                                        {socialLinks.map((link) => (
                                            <a
                                                key={link.label}
                                                href={link.href}
                                                target={link.isMailto ? undefined : "_blank"}
                                                rel={link.isMailto ? undefined : "noopener noreferrer"}
                                                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                                            >
                                                <div
                                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-white text-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}
                                                >
                                                    {link.icon}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {link.label}
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <FooterComponent />
        </main>
    );
};

export default ContactPageClient;
