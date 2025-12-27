import { NextRequest, NextResponse } from 'next/server';

function redirectToIndex(req: NextRequest) {
  const url = new URL('/index.html', req.url);
  return NextResponse.redirect(url, 303);
}

type Params = { appKey: string };
type Ctx = { params: Promise<Params> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { appKey } = await params;

  const res = redirectToIndex(req);
  res.cookies.set('mr_app', appKey, {
    path: '/',
    sameSite: 'lax',
  });

  return res;
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { appKey } = await params;

  const res = redirectToIndex(req);
  res.cookies.set('mr_app', appKey, {
    path: '/',
    sameSite: 'lax',
  });

  return res;
}
