"use client";

import React from "react";
import Link from "next/link";
import {
  FaEnvelope,
  FaGithub,
  FaDiscord,
  FaLinkedin,
  FaArrowUp,
  FaHome,
  FaUser,
  FaCode,
  FaFileAlt
} from "react-icons/fa";
import { FaSignalMessenger } from "react-icons/fa6";

export const socialLinks = [
  {
    href: "mailto:contact@keremkk.com.tr",
    label: "E-posta",
    icon: <FaEnvelope />,
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
    isMailto: true,
  },
  {
    href: "https://github.com/KeremKuyucu",
    label: "GitHub",
    icon: <FaGithub />,
    color: "from-gray-700 to-black dark:from-gray-600 dark:to-gray-900",
    shadow: "shadow-gray-500/20",
  },
  {
    href: "https://discord.com/users/483678328646270996",
    label: "Discord",
    icon: <FaDiscord />,
    color: "from-indigo-500 to-violet-500",
    shadow: "shadow-indigo-500/20",
  },
  {
    href: "https://www.linkedin.com/in/kerem-kuyucu/",
    label: "LinkedIn",
    icon: <FaLinkedin />,
    color: "from-blue-600 to-indigo-600",
    shadow: "shadow-blue-600/20",
  },
  {
    href: "https://signal.me/#eu/ARcpLe2E-_qPXnH6-I26hgbYj_Qco2bpvsoBu7Be67wvl5fAzPxLWIMrJulQBptb",
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
  isMailto,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  shadow?: string;
  isMailto?: boolean;
}) => {
  const Component = isMailto ? 'a' : 'a';
  const props = isMailto ? { href } : { href, target: "_blank", rel: "noopener noreferrer" };

  return (
    <Component
      {...props}
      className={`group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${shadow ? `hover:${shadow}` : ''}`}
      aria-label={label}
    >
      {/* Animated Background Gradient on Hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-tr ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-tr ${color} rounded-2xl opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300`} />

      {/* Icon */}
      <div className={`relative z-10 text-xl text-gray-500 dark:text-gray-400 transition-colors duration-300 group-hover:text-white group-hover:scale-110 transform`}>
        {icon}
      </div>

      {/* Premium Tooltip */}
      <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-black text-xs font-bold rounded-lg opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/90 dark:border-t-white/90" />
      </span>
    </Component>
  );
};

const FooterComponent: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Styles for Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes flow-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-gradient-text {
          background-size: 200% auto;
          animation: flow-gradient 4s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-glow 8s ease-in-out infinite;
        }
      `}</style>

      {/* Background Layer with Glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-gray-50/50 to-white dark:from-black/0 dark:via-gray-900/50 dark:to-black backdrop-blur-sm z-0" />

      {/* Animated Vibrant Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-[120px] pointer-events-none" />

      {/* Decorative Top Border with Moving Shine */}
      <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent animate-gradient-text" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="flex flex-col items-center justify-center text-center space-y-12">

          {/* Main Call to Action - Animated & Vibrant */}
          <div className="space-y-6 max-w-3xl animate-float">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 dark:from-violet-400 dark:via-fuchsia-300 dark:to-indigo-400 animate-gradient-text drop-shadow-sm">
                Vakit ayırdığınız için teşekkürler.
              </span>
            </h2>
          </div>

          {/* Social Links - Enhanced with Glow */}
          <div className="flex flex-wrap items-center justify-center gap-5 pb-8">
            {socialLinks.map((link) => (
              <SocialButton key={link.label} {...link} />
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-3xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <span>© {new Date().getFullYear()} Kerem Kuyucu.</span>
            <span className="hidden md:inline">|</span>
            <span>Tüm hakları saklıdır.</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/KeremKuyucu/kisisel-website"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              <FaCode className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Kaynak Kod</span>
            </a>

            {/* Pulsing Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="relative p-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Yukarı çık"
            >
              <FaArrowUp className="text-sm group-hover:-translate-y-1 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:animate-ping duration-1000" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
