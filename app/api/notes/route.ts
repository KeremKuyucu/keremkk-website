import { NextResponse } from "next/server";
import { validateSession, redis } from "@/app/lib/server-utils";

// GET: Notları getir
export async function GET(request: Request) {
    const token = request.headers.get("x-sync-token");
    // Notes uses lax validation (no IP check)
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Notları bir liste olarak tutuyoruz
        // Key: user:notes
        const notes = await redis.get<any[]>("user:notes") || [];
        return NextResponse.json({ notes });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// POST: Yeni not ekle
export async function POST(request: Request) {
    const token = request.headers.get("x-sync-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { encryptedContent } = await request.json();

        if (!encryptedContent) {
            return NextResponse.json({ error: "Content required" }, { status: 400 });
        }

        const noteIdentifier = crypto.randomUUID();
        const newNote = {
            id: noteIdentifier,
            content: encryptedContent, // Şifreli blob
            updatedAt: Date.now()
        };

        // Mevcut notları al, yenisini başa ekle
        const notes = await redis.get<any[]>("user:notes") || [];
        // Max 50 not saklayalım (basit tutmak için)
        const updatedNotes = [newNote, ...notes].slice(0, 50);

        await redis.set("user:notes", updatedNotes);

        return NextResponse.json({ success: true, note: newNote });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// PUT: Not güncelle
export async function PUT(request: Request) {
    const token = request.headers.get("x-sync-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, encryptedContent } = await request.json();

        const notes = await redis.get<any[]>("user:notes") || [];
        const index = notes.findIndex((n: any) => n.id === id);

        if (index === -1) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        notes[index] = {
            ...notes[index],
            content: encryptedContent,
            updatedAt: Date.now()
        };

        // Güncelleneni en başa taşı
        const updatedNote = notes.splice(index, 1)[0];
        notes.unshift(updatedNote);

        await redis.set("user:notes", notes);

        return NextResponse.json({ success: true, note: updatedNote });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// DELETE: Not sil
export async function DELETE(request: Request) {
    const token = request.headers.get("x-sync-token");
    if (!(await validateSession(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await request.json();

        const notes = await redis.get<any[]>("user:notes") || [];
        const filteredNotes = notes.filter((n: any) => n.id !== id);

        await redis.set("user:notes", filteredNotes);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
