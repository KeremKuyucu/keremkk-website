import { NextResponse } from "next/server";
import { validateSession } from "@/lib/server-utils";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: Notları getir
export async function GET(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = createAdminClient();
        const { data: notes, error } = await supabase
            .from('notes')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Map updated_at to updatedAt for front-end compatibility
        const mappedNotes = (notes || []).map(note => ({
            ...note,
            updatedAt: note.updated_at ? new Date(note.updated_at).getTime() : Date.now()
        }));

        return NextResponse.json({ notes: mappedNotes });
    } catch (error) {
        console.error("Notes GET error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// POST: Yeni not ekle
export async function POST(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { encryptedContent } = await request.json();

        if (!encryptedContent) {
            return NextResponse.json({ error: "Content required" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data: newNote, error } = await supabase
            .from('notes')
            .insert({
                content: encryptedContent,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Map updated_at to updatedAt for front-end compatibility
        const mappedNote = {
            ...newNote,
            updatedAt: newNote.updated_at ? new Date(newNote.updated_at).getTime() : Date.now()
        };

        return NextResponse.json({ success: true, note: mappedNote });
    } catch (error) {
        console.error("Notes POST error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// PUT: Not güncelle
export async function PUT(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, encryptedContent } = await request.json();

        if (!id || !encryptedContent) {
            return NextResponse.json({ error: "ID and content required" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data: updatedNote, error } = await supabase
            .from('notes')
            .update({
                content: encryptedContent,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: "Note not found" }, { status: 404 });
            }
            throw error;
        }

        // Map updated_at to updatedAt for front-end compatibility
        const mappedNote = {
            ...updatedNote,
            updatedAt: updatedNote.updated_at ? new Date(updatedNote.updated_at).getTime() : Date.now()
        };

        return NextResponse.json({ success: true, note: mappedNote });
    } catch (error) {
        console.error("Notes PUT error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// DELETE: Not sil
export async function DELETE(request: Request) {
    const token = request.headers.get("x-auth-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Notes DELETE error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
