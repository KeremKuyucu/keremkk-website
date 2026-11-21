import { NextResponse } from "next/server";

export type DiscordPresenceStatus = "online" | "idle" | "dnd" | "offline";

const DISCORD_USER_ID = "483678328646270996";
const LANYARD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;

const VALID_STATUSES = new Set<DiscordPresenceStatus>([
  "online",
  "idle",
  "dnd",
  "offline",
]);

interface LanyardResponse {
  success?: boolean;
  data?: {
    discord_status?: string;
  };
}

export async function GET() {
  try {
    const response = await fetch(LANYARD_API_URL, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(4000),
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: "offline" as DiscordPresenceStatus, source: "fallback", configured: false },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        }
      );
    }

    const payload = (await response.json()) as LanyardResponse;
    const rawStatus = payload?.data?.discord_status;

    if (
      payload?.success &&
      typeof rawStatus === "string" &&
      VALID_STATUSES.has(rawStatus as DiscordPresenceStatus)
    ) {
      return NextResponse.json(
        {
          status: rawStatus as DiscordPresenceStatus,
          source: "lanyard",
          configured: true,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        }
      );
    }

    return NextResponse.json(
      { status: "offline" as DiscordPresenceStatus, source: "fallback", configured: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { status: "offline" as DiscordPresenceStatus, source: "fallback", configured: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  }
}
