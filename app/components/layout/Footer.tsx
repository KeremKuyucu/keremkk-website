"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaEnvelope,
  FaGithub,
  FaDiscord,
  FaLinkedin,
  FaArrowUp,
  FaCode,
  FaHeart,
  FaRocket,
  FaHome,
  FaUser,
  FaProjectDiagram,
  FaPaperPlane,
} from "react-icons/fa";
import { FaSignalMessenger } from "react-icons/fa6";
import { translations, Language } from "@/app/data/translations";

export const socialLinks = [
  {
    href: "mailto:contact@keremkk.com.tr",
    label: "Email",
    icon: <FaEnvelope />,
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
    isMailto: true,
  },
  {
    href: "/github",
    label: "GitHub",
    icon: <FaGithub />,
    color: "from-gray-700 to-black dark:from-gray-600 dark:to-gray-900",
    shadow: "shadow-gray-500/20",
  },
  {
    href: "/discord",
    label: "Discord",
    icon: <FaDiscord />,
    color: "from-indigo-500 to-violet-500",
    shadow: "shadow-indigo-500/20",
  },
  {
    href: "/linkedin",
    label: "LinkedIn",
    icon: <FaLinkedin />,
    color: "from-blue-600 to-indigo-600",
    shadow: "shadow-blue-600/20",
  },
  {
    href: "/signal",
    label: "Signal",
    icon: <FaSignalMessenger />,
    color: "from-sky-500 to-blue-500",
    shadow: "shadow-sky-500/20",
  },
];

const SocialButton = ({
  href,
  label,
  icon,
  color,
  shadow,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  shadow?: string;
  isMailto?: boolean;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`group relative flex items-center justify-center w-11 h-11 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${shadow ? `hover:${shadow}` : ""}`}
    aria-label={label}
  >
    <div
      className={`absolute inset-0 rounded-xl bg-gradient-to-tr ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
    />
    <div
      className={`absolute -inset-0.5 bg-gradient-to-tr ${color} rounded-xl opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300`}
    />
    <div className="relative z-10 text-lg text-gray-500 dark:text-gray-400 transition-all duration-300 group-hover:text-white group-hover:scale-110">
      {icon}
    </div>
    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-black text-[11px] font-bold rounded-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
      {label}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/90 dark:border-t-white/90" />
    </span>
  </a>
);

const FooterComponent: React.FC = () => {
  const pathname = usePathname() || "/";
  const isTr = pathname === "/tr" || pathname.startsWith("/tr/");
  const lang: Language = isTr ? "tr" : "en";
  const t = translations[lang];
  const basePath = isTr ? "/tr" : "";

  const navLinks = [
    { href: isTr ? "/tr" : "/", label: t.nav.home, icon: FaHome },
    { href: `${basePath}/about`, label: t.nav.about, icon: FaUser },
    { href: `${basePath}/projects`, label: t.nav.projects, icon: FaProjectDiagram },
    { href: `${basePath}/contact`, label: t.nav.contact, icon: FaPaperPlane },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-50/80 via-white/40 to-transparent dark:from-gray-950/80 dark:via-black/40 dark:to-transparent" />

      {/* Subtle gradient orbs */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-gray-700/50 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link
              href={isTr ? "/tr" : "/"}
              className="inline-block text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4 hover:opacity-80 transition-opacity"
            >
              KK
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              {t.footer.brandBio}
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 dark:text-gray-500">
              <FaRocket className="text-violet-500" />
              <span>{t.footer.status}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              {t.footer.quickLinks}
            </h3>
            <nav className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
                >
                  <link.icon className="text-xs opacity-50 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social & Contact */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              {t.footer.connections}
            </h3>
            <div className="flex flex-wrap gap-2.5 mb-6">
              {socialLinks.map((link) => (
                <SocialButton key={link.label} {...link} />
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              {t.footer.contactNote}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <span>© {currentYear}</span>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span className="font-medium text-gray-600 dark:text-gray-400">Kerem Kuyucu</span>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span className="inline-flex items-center gap-1">
              {t.footer.madeWith} <FaHeart className="text-red-500 text-[10px] animate-pulse" />
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/source-code"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              <FaCode className="group-hover:rotate-12 transition-transform duration-300" />
              <span>{t.footer.sourceCode}</span>
            </a>

            <button
              onClick={scrollToTop}
              className="group p-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-300"
              aria-label={t.footer.scrollToTop}
            >
              <FaArrowUp className="text-xs group-hover:-translate-y-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
