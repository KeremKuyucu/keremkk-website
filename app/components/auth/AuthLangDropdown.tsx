"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AUTH_LANGUAGES, AuthLang, AuthPageSlug } from "@/app/data/auth-content";

interface AuthLangDropdownProps {
  currentLang: AuthLang;
  pageSlug: AuthPageSlug;
}

export default function AuthLangDropdown({
  currentLang,
  pageSlug,
}: AuthLangDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const currentLabel = AUTH_LANGUAGES[currentLang] || "Language";

  return (
    <div className="relative self-start sm:self-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">🌐</span>
        <span>{currentLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700/60 mb-1">
            Language / Dil
          </div>
          {(Object.keys(AUTH_LANGUAGES) as AuthLang[]).map((code) => {
            const isSelected = code === currentLang;
            const label = AUTH_LANGUAGES[code];

            return (
              <Link
                key={code}
                href={`/auth/${code}/${pageSlug}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2 text-sm transition-colors ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span>{label}</span>
                {isSelected && (
                  <span className="text-blue-600 dark:text-blue-400 text-xs">
                    ✓
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
