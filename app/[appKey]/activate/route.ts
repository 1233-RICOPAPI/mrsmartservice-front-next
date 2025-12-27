import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ appKey: string }> }
) {
  const { appKey } = await params;

  if (!appKey) {
    return NextResponse.json({ error: "appKey requerido" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    appKey,
  });
}
