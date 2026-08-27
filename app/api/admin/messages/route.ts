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

export async function DELETE(request: NextRequest) {
    try {
        const authToken = request.headers.get("x-auth-token");
        const isValid = await validateSession(authToken);

        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, ids } = body;

        const supabase = createAdminClient();

        if (id) {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return NextResponse.json({ success: true, deleted: [id] });
        }

        if (Array.isArray(ids) && ids.length > 0) {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .in('id', ids);

            if (error) throw error;
            return NextResponse.json({ success: true, deleted: ids });
        }

        return NextResponse.json({ error: "Missing message ID" }, { status: 400 });
    } catch (error) {
        console.error("Error deleting message:", error);
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }
}
