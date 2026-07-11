import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Business types eligible to host a Game Mode mission.
const GAME_ELIGIBLE_SERVICES = ['restaurace', 'kavarna', 'supermarket'];

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city') || 'ceske-budejovice';

  try {
    const missions = await prisma.gameMission.findMany({
      where: {
        active: true,
        expiresAt: { gt: new Date() },
        provider: { cityId: city, serviceId: { in: GAME_ELIGIBLE_SERVICES } },
      },
      include: {
        provider: {
          select: { id: true, fullName: true, serviceId: true, cityId: true, picturePath: true, address: true, latitude: true, longitude: true },
        },
      },
      orderBy: { expiresAt: 'asc' },
    });
    return NextResponse.json(missions);
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
