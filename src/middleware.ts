import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_session';

async function expectedToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  const msg = new TextEncoder().encode(password + 'adresar_admin_salt');
  const buf = await crypto.subtle.digest('SHA-256', msg);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const expected = await expectedToken();
  if (token !== expected) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/providers/:path*'],
};
