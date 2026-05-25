import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function getCorsHeaders(origin: string | null) {
  let allowedOrigin = 'https://keremkk.com.tr'; // Default origin
  if (origin) {
    try {
      const hostname = new URL(origin).hostname;
      // Allow keremkk.com.tr, its subdomains, and localhost for dev
      if (hostname === 'keremkk.com.tr' || hostname.endsWith('.keremkk.com.tr')) {
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
