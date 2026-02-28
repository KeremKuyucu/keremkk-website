import { NextRequest, NextResponse } from "next/server";
import { redis, validateSession } from "@/lib/server-utils";

export async function GET(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);

        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const messageIds = await redis.lrange("contact:messages", 0, -1);

        if (!messageIds || messageIds.length === 0) {
            return NextResponse.json({ messages: [] });
        }

        const messages: any[] = [];
        for (const id of messageIds) {
            const msgObj = await redis.get(id);
            if (msgObj) {
                // Determine if it was already parsed or needs parsing
                const parsedMsg = typeof msgObj === 'string' ? JSON.parse(msgObj) : msgObj;
                messages.push({ ...parsedMsg, id });
            }
        }

        // Sort by timestamp descending
        messages.sort((a, b) => b.timestamp - a.timestamp);

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}
