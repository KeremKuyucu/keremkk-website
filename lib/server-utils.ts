import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export interface SessionData {
    createdAt: number;
    ip: string;
    ua: string;
}

export async function validateSession(token: string | null): Promise<boolean> {
    if (!token) return false;

    // Auth check
    const session = await redis.get<SessionData>(`session:${token}`);
    if (!session) return false;

    return true;
}
