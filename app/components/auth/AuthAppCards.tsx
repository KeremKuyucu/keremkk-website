"use client";

import { useState } from "react";
import { FaAndroid, FaGlobe, FaExternalLinkAlt, FaRocket, FaArrowRight } from "react-icons/fa";

export interface AuthApp {
  name: string;
  description: string;
  icon: string;
  color: string;
  packageId: string;
  webUrl: string;
}

export const apps: AuthApp[] = [
  {
    name: "GeoGame",
    description:
      "An educational geography app where you test your knowledge of capitals, flags, distances, and continents.",
    icon: "🌍",
    color: "from-blue-500 to-cyan-400",
    packageId: "com.keremkuyucu.geogame",
    webUrl: "https://geogame.keremkk.com.tr/",
  },
  {
    name: "Okey Defteri",
    description:
      "A score tracking app for the classic Turkish tile game Okey — keep tallies, track rounds, and settle scores.",
    icon: "🎲",
    color: "from-orange-500 to-rose-400",
    packageId: "com.keremkuyucu.okeydefteri",
    webUrl: "https://okey.keremkk.com.tr/",
  },
];

export default function AuthAppCards() {
  const [launchingApp, setLaunchingApp] = useState<string | null>(null);

  const handleLaunch = (app: AuthApp) => {
    if (typeof window === "undefined") return;

    setLaunchingApp(app.name);
    setTimeout(() => setLaunchingApp(null), 2000);

    const isAndroid = /android/i.test(navigator.userAgent);

    if (isAndroid) {
      // Android Intent scheme to launch installed app, falling back to webUrl
      const intentUrl = `intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${app.packageId};S.browser_fallback_url=${encodeURIComponent(
        app.webUrl
      )};end`;

      const startTime = Date.now();
      window.location.href = intentUrl;

      // Fallback for Android browsers that don't automatically redirect on intent failure
      setTimeout(() => {
        if (!document.hidden && Date.now() - startTime < 3000) {
          window.location.href = app.webUrl;
        }
      }, 1500);
    } else {
      // Desktop / iOS: Open web version in a new tab
      window.open(app.webUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {apps.map((app) => {
        const isLaunching = launchingApp === app.name;
        const displayHost = app.webUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

        return (
          <div
            key={app.name}
            role="button"
            tabIndex={0}
            onClick={() => handleLaunch(app)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleLaunch(app);
              }
            }}
            className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform duration-300`}
                  >
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Mobile & Web
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-colors">
                  <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform duration-200" />
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-5">
                {app.description}
              </p>

              {/* Badges / Package and Web identifiers */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div
                  title={`Android Package: ${app.packageId}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-mono"
                >
                  <FaAndroid className="text-emerald-600 dark:text-emerald-400 text-xs shrink-0" />
                  <span className="truncate max-w-[170px]">{app.packageId}</span>
                </div>

                <div
                  title={`Web URL: ${app.webUrl}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-mono"
                >
                  <FaGlobe className="text-blue-600 dark:text-blue-400 text-xs shrink-0" />
                  <span>{displayHost}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center gap-2">
              <button
                type="button"
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
                  isLaunching
                    ? "bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/20 group-hover:shadow-md group-hover:shadow-blue-500/25"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLaunch(app);
                }}
              >
                <FaRocket className={`text-xs ${isLaunching ? "animate-bounce" : ""}`} />
                <span>{isLaunching ? "Opening..." : "Launch App"}</span>
              </button>

              <a
                href={app.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open directly in browser"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FaExternalLinkAlt className="text-xs" />
                <span className="text-xs">Web</span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
