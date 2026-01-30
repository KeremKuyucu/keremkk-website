import { NextResponse } from "next/server";
import { getClientIP, validateSession, redis } from "@/app/lib/server-utils";

export async function GET(request: Request) {
    const ip = getClientIP(request);
    const token = request.headers.get("x-sync-token");

    if (!(await validateSession(token, ip))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const keys = await redis.keys("redirect:*");
        const redirects = [];

        for (const key of keys) {
            // Filter out stats or other keys if any
            if (key.includes(":stats:")) continue;

            const slug = key.replace("redirect:", "");
            const data = await redis.get<string | { destination: string; createdAt: number; lastClickedAt: number }>(key);

            let destination = "";
            let meta: any = {};

            if (typeof data === 'string') {
                destination = data;
            } else if (data && typeof data === 'object') {
                destination = data.destination;
                meta = data;
            }

            const clicks = await redis.get<string>(`redirect:stats:${slug}`) || "0";

            redirects.push({
                slug,
                destination,
                clicks: parseInt(clicks),
                createdAt: typeof destination === 'string' ? undefined : (destination as any).createdAt,
                lastClickedAt: typeof destination === 'string' ? undefined : (destination as any).lastClickedAt
            });
        }

        // Sort by slug
        redirects.sort((a, b) => a.slug.localeCompare(b.slug));

        return NextResponse.json({ redirects });
    } catch (error) {
        console.error("Redirects GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const ip = getClientIP(request);
    const token = request.headers.get("x-sync-token");

    if (!(await validateSession(token, ip))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { slug, destination } = await request.json();

        if (!slug || !destination) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const key = `redirect:${slug}`;

        // Store as object with metadata
        const data = {
            destination,
            createdAt: Date.now(),
            lastClickedAt: null,
            clicks: 0
        };

        await redis.set(key, data);

        return NextResponse.json({ success: true, slug, destination });
    } catch (error) {
        console.error("Redirects POST error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const ip = getClientIP(request);
    const token = request.headers.get("x-sync-token");

    if (!(await validateSession(token, ip))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { slug } = await request.json();

        if (!slug) {
            return NextResponse.json({ error: "Missing slug" }, { status: 400 });
        }

        await redis.del(`redirect:${slug}`);
        await redis.del(`redirect:stats:${slug}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Redirects DELETE error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const ip = getClientIP(request);
    const token = request.headers.get("x-sync-token");

    if (!(await validateSession(token, ip))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { slug, destination } = await request.json();

        if (!slug || !destination) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const key = `redirect:${slug}`;
        const existingData = await redis.get<any>(key);

        if (!existingData) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }

        let data;
        if (typeof existingData === 'string') {
            // Upgrade legacy string to object if we are touching it
            data = {
                destination,
                createdAt: Date.now(),
                lastClickedAt: null,
                clicks: 0
            };
        } else {
            // Preserve stats, update destination
            data = {
                ...existingData,
                destination
            };
        }

        await redis.set(key, data);

        return NextResponse.json({ success: true, slug, destination });
    } catch (error) {
        console.error("Redirects PATCH error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
