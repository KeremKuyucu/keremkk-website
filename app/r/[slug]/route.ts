import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const slug = (await params).slug;

        const data = await redis.get<string | { destination: string; createdAt: number; lastClickedAt: number }>(`redirect:${slug}`);

        if (!data) {
            return NextResponse.redirect(new URL('/not-found', request.url));
        }

        // Increment stats asynchronously (optional, fire and forget)
        redis.incr(`redirect:stats:${slug}`).catch(console.error);

        let destination = "";

        if (typeof data === 'string') {
            destination = data;
        } else if (typeof data === 'object') {
            destination = data.destination;

            // Update lastClickedAt without awaiting
            const updatedData = { ...data, lastClickedAt: Date.now() };
            redis.set(`redirect:${slug}`, updatedData).catch(console.error);
        }

        if (destination) {
            return NextResponse.redirect(destination);
        }

        return NextResponse.redirect(new URL('/not-found', request.url));
    } catch (error) {
        console.error("Redirect error:", error);
        return NextResponse.redirect(new URL('/not-found', request.url));
    }
}
