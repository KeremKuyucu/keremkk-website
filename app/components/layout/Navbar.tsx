"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUser, FaCode, FaEnvelope } from "react-icons/fa";
import { translations, Language } from "@/app/data/translations";

const Navbar: React.FC = () => {
  const pathname = usePathname() || "/";
  const isTr = pathname === "/tr" || pathname.startsWith("/tr/");
  const lang: Language = isTr ? "tr" : "en";
  const t = translations[lang].nav;

  const basePath = isTr ? "/tr" : "";

  const navLinks = [
    { href: isTr ? "/tr" : "/", label: t.home, icon: FaHome },
    { href: `${basePath}/about`, label: t.about, icon: FaUser },
    { href: `${basePath}/projects`, label: t.projects, icon: FaCode },
    { href: `${basePath}/contact`, label: t.contact, icon: FaEnvelope },
  ];

  // Calculate target links for language switcher
  const getLanguageHref = (targetLang: "en" | "tr") => {
    if (targetLang === "tr") {
      if (pathname.startsWith("/tr")) return pathname;
      if (pathname.startsWith("/en/")) return `/tr/${pathname.slice(4)}`;
      if (pathname === "/en") return "/tr";
      return pathname === "/" ? "/tr" : `/tr${pathname}`;
    } else {
      if (!pathname.startsWith("/tr")) return pathname;
      const stripped = pathname.replace(/^\/tr(\/|$)/, "/");
      return stripped || "/";
    }
  };

  const enHref = getLanguageHref("en");
  const trHref = getLanguageHref("tr");

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          href={isTr ? "/tr" : "/"}
          className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          KK
        </Link>

        {/* Navigation Links & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isRootActive =
                (link.href === "/" && pathname === "/") ||
                (link.href === "/tr" && pathname === "/tr");
              const isSubActive =
                link.href !== "/" &&
                link.href !== "/tr" &&
                pathname.startsWith(link.href.split("#")[0]);
              const isActive = isRootActive || isSubActive;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <link.icon className="text-sm" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Language Switcher */}
          <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold">
            <Link
              href={enHref}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                !isTr
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              EN
            </Link>
            <Link
              href={trHref}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                isTr
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              TR
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
