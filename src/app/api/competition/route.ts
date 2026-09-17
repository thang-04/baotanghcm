import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && new URL(origin).host !== host) {
    return Response.json({ ok: false, error: 'Nguồn yêu cầu không hợp lệ.' }, { status: 403 });
  }
  const body = await request.text();
  if (body.length > 16000) return Response.json({ ok: false, error: 'Yêu cầu quá lớn.' }, { status: 413 });
  try {
    const configuredServer = process.env.COMPETITION_SERVER_URL?.replace(/\/$/, '');
    const serverBase = process.env.VERCEL
      ? `${request.nextUrl.origin}/api/socket-io`
      : configuredServer || 'http://127.0.0.1:3001';
    const upstream = await fetch(`${serverBase}/competition-api`, {
      method: 'POST', cache: 'no-store', body,
      headers: {
        'Content-Type': 'application/json', cookie: request.headers.get('cookie') || '',
        origin: origin || request.nextUrl.origin,
        'X-Forwarded-Host': host || request.nextUrl.host,
        'X-Forwarded-Proto': request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', ''),
      }, signal: AbortSignal.timeout(10000),
    });
    const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    for (const cookie of upstream.headers.getSetCookie()) headers.append('Set-Cookie', cookie);
    return new Response(await upstream.text(), { status: upstream.status, headers });
  } catch {
    return Response.json({ ok: false, error: 'Chưa kết nối được máy chủ cuộc thi. Vui lòng thử lại.' }, { status: 503 });
  }
}
