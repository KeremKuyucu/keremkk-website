"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function isLikelyBot(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return true;

  if (navigator.webdriver) return true;

  const botRegex =
    /bot|crawl|spider|slurp|mediapartners|lighthouse|pagespeed|headless|phantom|selenium|puppeteer|playwright|wget|curl|python|axios|fetch|http|whatsapp|telegram|discord|twitterbot|facebookexternalhit|linkedinbot|embedly|quora|pinterest|slackbot|vkshare|w3c_validator|ahrefs|semrush|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|applebot/i;

  if (botRegex.test(navigator.userAgent)) return true;

  if (window.outerWidth === 0 && window.outerHeight === 0) return true;
  if (!navigator.languages || navigator.languages.length === 0) return true;

  return false;
}

function getOrCreateVisitorId(): string {
  const STORAGE_KEY = "keremkk_visitor_id";
  try {
    let visitorId = localStorage.getItem(STORAGE_KEY);
    if (!visitorId) {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        visitorId = `web_${crypto.randomUUID()}`;
      } else {
        visitorId = `web_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      }
      localStorage.setItem(STORAGE_KEY, visitorId);
    }
    return visitorId;
  } catch {
    return `web_anon_${Date.now()}`;
  }
}

export default function WebsiteVisitorTracker() {
  const pathname = usePathname();
  const lastLoggedPath = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    // Admin ve API sayfalarını loglama
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    // Bot tespit edildiyse loglama
    if (isLikelyBot()) {
      return;
    }

    // Aynı route'u arka arkaya tekrar loglama
    if (lastLoggedPath.current === pathname) {
      return;
    }

    let isTriggered = false;

    const trackVisit = async () => {
      if (isTriggered) return;
      isTriggered = true;
      lastLoggedPath.current = pathname;
      removeListeners();

      try {

        const uid = getOrCreateVisitorId();

        const payload = {
          uid,
          timestamp: new Date().toISOString(),
          event: "page_view",
          platform: "web",
          app: "website",
          metadata: {
            path: pathname,
            referrer: document.referrer || "direct",
            title: document.title || "",
            screen: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language || "",
          },
        };

        await fetch("/api/logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      } catch {
        // Sessizce başarısız ol
      }
    };

    const interactionEvents: (keyof WindowEventMap)[] = [
      "pointermove",
      "pointerdown",
      "scroll",
      "keydown",
      "touchstart",
    ];

    const removeListeners = () => {
      interactionEvents.forEach((ev) => window.removeEventListener(ev, trackVisit));
    };

    interactionEvents.forEach((ev) =>
      window.addEventListener(ev, trackVisit, { once: true, passive: true })
    );

    return removeListeners;
  }, [pathname]);

  return null;
}