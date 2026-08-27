import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function getCorsHeaders(origin: string | null) {
  let allowedOrigin = 'https://keremkk.com.tr'; // Default origin
  if (origin) {
    try {
      const hostname = new URL(origin).hostname;
      // Allow keremkk.com.tr, its subdomains
      if (
        hostname === 'keremkk.com.tr' ||
        hostname.endsWith('.keremkk.com.tr')
      ) {
        allowedOrigin = origin;
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  try {
    const body = await request.json();
    const { uid, timestamp, event, platform, app } = body;

    // Validate required fields
    if (!uid || !timestamp || !event || !platform || !app) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    // Extract IP address and User-Agent if available
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('app_logs')
      .insert([
        {
          uid,
          timestamp,
          event,
          platform,
          app_name: app,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to insert log' },
        { status: 500, headers: getCorsHeaders(origin) }
      );
    }

    return NextResponse.json({ success: true }, { status: 201, headers: getCorsHeaders(origin) });
  } catch (e) {
    console.error('API Log error:', e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// Optionally, handle OPTIONS request for CORS if the flutter app makes preflight requests
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

/*
================================================================================
 📖 TELEMETRY & APP LOGS API DOKÜMANTASYONU (AGENT & DEVELOPER REHBERİ)
================================================================================

Bu endpoint, mobil/web uygulamalarından veya arka plan servislerinden gelen
analitik, telemetri ve olay (event) loglarını toplar.

📍 ENDPOINT BİLGİSİ:
  - URL: https://keremkk.com.tr/api/logs
  - Metot     : POST
  - Başlıklar : Content-Type: application/json
  - CORS      : keremkk.com.tr, alt alan adları ve localhost desteklenir.

--------------------------------------------------------------------------------
📥 REQUEST BODY (JSON ŞEMASI):
--------------------------------------------------------------------------------
Aşağıdaki 5 alanın TÜMÜ zorunludur:

{
  "uid": "string",        // [ZORUNLU] Cihaz veya kullanıcıya özel benzersiz ID (UUID / Device ID / User ID)
  "timestamp": "string",  // [ZORUNLU] ISO-8601 zaman damgası (Örn: "2026-08-27T20:30:00.000Z")
  "event": "string",      // [ZORUNLU] Olay adı (Örn: "app_opened_daily", "login", "level_completed", "error")
  "platform": "string",   // [ZORUNLU] Çalıştığı platform ("android", "ios", "web", "windows", "macos", "linux")
  "app": "string"         // [ZORUNLU] Uygulama adı veya tanımlayıcısı (Örn: "geogame", "portfolio")
}

* Not: IP Adresi (ip_address) ve Tarayıcı/Cihaz bilgisi (user_agent) istek başlıklarından (headers)
  sunucu tarafından otomatik olarak ayrıştırılıp veritabanına eklenir.

--------------------------------------------------------------------------------
📤 YANIT (RESPONSE) FORMATLARI:
--------------------------------------------------------------------------------
- 201 Created:
    { "success": true }

- 400 Bad Request (Eksik parametre):
    { "error": "Missing required fields" }

- 500 Internal Server Error (Sunucu veya veritabanı hatası):
    { "error": "Internal Server Error" }

*/
