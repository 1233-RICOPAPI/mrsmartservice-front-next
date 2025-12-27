import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: { appKey: string };
  }
) {
  const { appKey } = params;

  if (!appKey) {
    return NextResponse.json(
      { error: 'appKey requerido' },
      { status: 400 }
    );
  }

  // aquí puedes llamar a tu backend si quieres
  // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activate/${appKey}`)

  return NextResponse.json({
    success: true,
    appKey,
  });
}
