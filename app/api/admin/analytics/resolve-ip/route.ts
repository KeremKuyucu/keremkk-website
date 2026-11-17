import { NextRequest, NextResponse } from "next/server";
import { validateSession, extractAuthToken } from "@/lib/server-utils";

// In-memory cache to prevent redundant lookups
const ipCache = new Map<string, { country: string; countryCode: string; city: string }>();

export async function GET(request: NextRequest) {
    const token = extractAuthToken(request);
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = request.nextUrl.searchParams.get("ip");
    if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
        return NextResponse.json({ error: "Local or invalid IP" }, { status: 400 });
    }

    const cleanIp = ip.split(",")[0].trim();

    if (ipCache.has(cleanIp)) {
        return NextResponse.json(ipCache.get(cleanIp));
    }

    try {
        const res = await fetch(`https://freeipapi.com/api/json/${cleanIp}`, {
            signal: AbortSignal.timeout(3500)
        });

        if (res.ok) {
            const data = await res.json();
            if (data && data.countryCode) {
                const result = {
                    country: data.countryName || data.countryCode,
                    countryCode: data.countryCode,
                    city: data.cityName || ""
                };
                ipCache.set(cleanIp, result);
                return NextResponse.json(result);
            }
        }
    } catch {
        // Fallback silently if third party service is unreachable
    }

    return NextResponse.json({ error: "Could not resolve IP" }, { status: 404 });
}
