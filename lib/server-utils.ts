import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export interface SessionData {
    createdAt: number;
    ip: string;
    ua: string;
}

export function getClientIP(request: Request): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    return forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
}

export async function validateSession(token: string | null, reqIp?: string): Promise<boolean> {
    if (!token) return false;

    // Auth check
    const session = await redis.get<SessionData>(`session:${token}`);
    if (!session) return false;

    // Strict IP check if reqIp is provided
    if (reqIp && session.ip !== reqIp) {
        return false;
    }

    return true;
}
