import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://adressa.cz';
  return NextResponse.redirect(`${baseUrl}/`);
}
