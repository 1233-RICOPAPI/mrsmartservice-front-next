import { NextRequest, NextResponse } from 'next/server';

/**
 * Ruta de activación (compatibilidad con enlaces antiguos tipo:
 *   POST/GET /mrsmartrestaurant/activate
 *
 * En dev, Next suele responder 307 en redirects y el navegador repite el método
 * (POST -> POST) hacia /index.html, causando 405.
 *
 * Aquí forzamos 303 (POST -> GET) y redirigimos a /index.html.
 */

function redirectToIndex(req: NextRequest) {
  // 303 = "See Other" (convierte POST a GET en el follow redirect)
  const url = new URL('/index.html', req.url);
  return NextResponse.redirect(url, 303);
}

export async function GET(req: NextRequest, ctx: { params: { appKey: string } }) {
  const res = redirectToIndex(req);
  // Guardamos cuál app/landing activó (por si luego se usa en el front)
  res.cookies.set('mr_app', ctx.params.appKey, {
    path: '/',
    sameSite: 'lax',
  });
  return res;
}

export async function POST(req: NextRequest, ctx: { params: { appKey: string } }) {
  const res = redirectToIndex(req);
  res.cookies.set('mr_app', ctx.params.appKey, {
    path: '/',
    sameSite: 'lax',
  });
  return res;
}
