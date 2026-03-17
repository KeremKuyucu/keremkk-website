import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);

        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createAdminClient();
        
        const { data: messages, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) {
            console.error("Supabase fetch error:", error);
            throw error;
        }

        return NextResponse.json({ messages: messages || [] });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}
