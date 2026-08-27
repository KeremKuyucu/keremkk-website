"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "unknown_web";

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
  } catch (e) {
    return `web_anon_${Date.now()}`;
  }
}

export default function WebsiteVisitorTracker() {
  const pathname = usePathname();
  const lastLoggedPath = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    // Do not log admin pages or API routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    // Avoid duplicate logging of the same route in the same render
    if (lastLoggedPath.current === pathname) {
      return;
    }
    lastLoggedPath.current = pathname;

    const trackVisit = async () => {
      try {
        const uid = getOrCreateVisitorId();
        const todayStr = new Date().toISOString().split("T")[0];
        const lastDailyLogKey = "keremkk_last_daily_visit";
        const lastDailyDate = localStorage.getItem(lastDailyLogKey);

        const isFirstVisitToday = lastDailyDate !== todayStr;

        // If first visit today, send app_opened_daily (for daily unique active metrics)
        // Otherwise send page_view
        const eventName = isFirstVisitToday ? "app_opened_daily" : "page_view";

        if (isFirstVisitToday) {
          localStorage.setItem(lastDailyLogKey, todayStr);
        }

        const payload = {
          uid,
          timestamp: new Date().toISOString(),
          event: eventName,
          platform: "web",
          app: "website",
        };

        // Send telemetry (non-blocking)
        await fetch("/api/logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      } catch (err) {
        // Fail silently so user browsing is never interrupted
      }
    };

    // Small delay to ensure browser is idle
    const timeout = setTimeout(trackVisit, 600);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
