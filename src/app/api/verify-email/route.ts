import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://adressa.cz';

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/verify-email?error=invalid`);
  }

  const provider = await prisma.provider.findUnique({ where: { emailToken: token } });

  if (!provider) {
    return NextResponse.redirect(`${baseUrl}/verify-email?error=invalid`);
  }

  await prisma.provider.update({
    where: { id: provider.id },
    data: { emailVerified: true, active: true, emailToken: null },
  });

  return NextResponse.redirect(`${baseUrl}/verify-email?success=1`);
}
