"use client";

import React, { useEffect, useState } from "react";
import type { Language } from "@/app/data/translations";
import type { DiscordPresenceStatus } from "@/app/api/discord-status/route";

interface DiscordStatusBadgeProps {
  lang?: Language;
  variant?: "avatar" | "hero";
  className?: string;
}

const STATUS_META: Record<
  DiscordPresenceStatus,
  {
    tr: string;
    en: string;
    dotClass: string;
    pingClass?: string;
  }
> = {
  online: {
    tr: "Müsait",
    en: "Available",
    dotClass: "bg-emerald-500",
    pingClass: "bg-emerald-400",
  },
  idle: {
    tr: "Uzakta",
    en: "Away",
    dotClass: "bg-amber-500",
  },
  dnd: {
    tr: "Rahatsız Etmeyin",
    en: "Do Not Disturb",
    dotClass: "bg-rose-500",
  },
  offline: {
    tr: "Dinleniyor",
    en: "Resting",
    dotClass: "bg-slate-400 dark:bg-slate-500",
  },
};

export default function DiscordStatusBadge({
  lang = "en",
  variant = "avatar",
  className = "",
}: DiscordStatusBadgeProps) {
  const [status, setStatus] = useState<DiscordPresenceStatus>("offline");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/discord-status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { status?: DiscordPresenceStatus };
        if (active && data?.status && data.status in STATUS_META) {
          setStatus(data.status);
        }
      } catch {
        // Keep graceful fallback state
      } finally {
        if (active) setLoaded(true);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const meta = STATUS_META[status];
  const label = lang === "tr" ? meta.tr : meta.en;

  const isHero = variant === "hero";
  const containerClasses = isHero
    ? "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 backdrop-blur-sm"
    : "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 shadow-lg";

  const dotSize = isHero ? "h-2 w-2" : "h-2.5 w-2.5";
  const textClasses = isHero
    ? "text-sm font-medium text-gray-600 dark:text-gray-300"
    : "text-xs font-semibold text-gray-800 dark:text-gray-100";

  return (
    <div
      className={`${containerClasses} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-80"} ${className}`}
      title={lang === "tr" ? `Anlık durum: ${label}` : `Live status: ${label}`}
    >
      <span className={`relative flex ${dotSize}`}>
        {meta.pingClass && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${meta.pingClass} opacity-75`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${dotSize} ${meta.dotClass}`} />
      </span>
      <span className={textClasses}>{label}</span>
    </div>
  );
}
