import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function getCorsHeaders(origin: string | null) {
  let allowedOrigin = 'https://keremkk.com.tr'; // Default origin
  if (origin) {
    try {
      const hostname = new URL(origin).hostname;
      // Allow keremkk.com.tr, its subdomains, and localhost for dev/web builds
      if (
        hostname === 'keremkk.com.tr' ||
        hostname.endsWith('.keremkk.com.tr')
      ) {
        allowedOrigin = origin;
      }
    } catch {
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
  const corsHeaders = getCorsHeaders(origin);

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400, headers: corsHeaders }
      );
    }

    const {
      uid,
      event,
      platform,
      app,
      app_name,
      app_version,
      is_debug,
      metadata,
      ...additionalData
    } = body || {};

    const targetApp = app || app_name;

    // Validate required fields
    if (!uid || !event || !platform || !targetApp) {
      return NextResponse.json(
        { error: 'Missing required fields (uid, event, platform, app)' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Extract IP address and User-Agent if available
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Collect extra metadata (app_version, is_debug, additionalData, metadata)
    const extraMetadata: Record<string, any> = {};

    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
      Object.assign(extraMetadata, metadata);
    }

    if (app_version !== undefined && app_version !== null) {
      extraMetadata.app_version = String(app_version).slice(0, 50);
    }

    if (is_debug !== undefined && is_debug !== null) {
      extraMetadata.is_debug = Boolean(is_debug);
    }

    // Spread additionalData from Flutter TelemetryService
    for (const [key, value] of Object.entries(additionalData)) {
      if (value !== undefined && value !== null) {
        extraMetadata[key] = value;
      }
    }

    const hasExtraMetadata = Object.keys(extraMetadata).length > 0;

    const insertPayload = {
      uid: String(uid).slice(0, 200),
      event: String(event).slice(0, 150),
      platform: String(platform).slice(0, 50),
      app_name: String(targetApp).slice(0, 100),
      ip_address: String(ipAddress).slice(0, 150),
      user_agent: String(userAgent).slice(0, 500),
      metadata: hasExtraMetadata ? extraMetadata : null,
    };

    const supabase = createAdminClient();

    let { error: dbError } = await supabase
      .from('app_logs')
      .insert([insertPayload]);

    if (dbError) {
      // Schema cache yenilenene kadar olası metadata eksikliği durumunda fallback
      const isMetadataColumnMissing =
        dbError.code === 'PGRST204' ||
        dbError.code === '42703' ||
        (dbError.message && dbError.message.toLowerCase().includes('metadata'));

      if (isMetadataColumnMissing) {
        console.warn(
          'app_logs tablosunda metadata sütun hatası, fallback devrede:',
          dbError.message
        );
        const { metadata: _, ...baseRecord } = insertPayload;
        const { error: fallbackError } = await supabase
          .from('app_logs')
          .insert([baseRecord]);
        dbError = fallbackError;
      }
    }

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return NextResponse.json(
        { error: 'Failed to insert log' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 201, headers: corsHeaders }
    );
  } catch (e) {
    console.error('API Log error:', e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
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

Bu endpoint, mobil/web uygulamalarından (Flutter TelemetryService vb.) veya arka plan servislerinden gelen
analitik, telemetri ve olay (event) loglarını toplar.

📍 ENDPOINT BİLGİSİ:
  - URL: https://keremkk.com.tr/api/logs
  - Metot     : POST
  - Başlıklar : Content-Type: application/json
  - CORS      : keremkk.com.tr ve alt alan adları desteklenir.

--------------------------------------------------------------------------------
📥 REQUEST BODY (JSON ŞEMASI):
--------------------------------------------------------------------------------
Aşağıdaki 4 alan zorunludur:

{
  "uid": "string",          // [ZORUNLU] Cihaz veya kullanıcıya özel benzersiz ID (UUID / User ID)
  "event": "string",        // [ZORUNLU] Olay adı (Örn: "app_opened", "level_completed", "score_updated")
  "platform": "string",     // [ZORUNLU] Çalıştığı platform ("android", "ios", "web", "windows", "macos", "linux")
  "app": "string",          // [ZORUNLU] Uygulama adı veya tanımlayıcısı (Örn: "geogame", "portfolio") ("app_name" de kabul edilir)
  "app_version": "string",  // [OPSİYONEL] Uygulama sürümü (Örn: "1.6.17+23") -> metadata'ya eklenir
  "is_debug": boolean,      // [OPSİYONEL] Debug modu (true/false) -> metadata'ya eklenir
  ...additionalData         // [OPSİYONEL] Diğer dinamik event alanları (metadata objesine toplanır)
}

* Not: IP Adresi (ip_address) ve Tarayıcı/Cihaz bilgisi (user_agent) istek başlıklarından (headers)
  sunucu tarafından otomatik olarak ayrıştırılıp veritabanına eklenir.

--------------------------------------------------------------------------------
📤 YANIT (RESPONSE) FORMATLARI:
--------------------------------------------------------------------------------
- 201 Created:
    { "success": true }

- 400 Bad Request (Eksik parametre):
    { "error": "Missing required fields (uid, event, platform, app)" }

- 500 Internal Server Error (Sunucu veya veritabanı hatası):
    { "error": "Internal Server Error" }
*/
