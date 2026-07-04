import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const submissions = await prisma.gameSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        mission: {
          include: { provider: { select: { fullName: true, serviceId: true, cityId: true } } },
        },
      },
    });
    return NextResponse.json(submissions);
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
