import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Anonim kullanıcılar için sabit UUID (Supabase auth olmadan form gönderimi için)
const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function POST(request: NextRequest) {
    try {
        const { name, email, subject, message } = await request.json();

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
        }

        // Supabase'e feedback kaydet
        // Tablo yapısı: sebep (konu), message, isim (ad), user_id
        // Not: email alanı tabloda yok, mesajın içine eklenecek
        const fullMessage = `[E-posta: ${email}]\n\n${message}`;

        const { data, error } = await supabaseAdmin
            .from('feedbacks')
            .insert({
                sebep: subject,
                message: fullMessage,
                isim: name,
                user_id: ANONYMOUS_USER_ID,
                Status: false,
                App: 'keremkk.com.tr'
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ error: 'Mesaj kaydedilemedi' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Mesajınız gönderildi!' });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
    }
}
