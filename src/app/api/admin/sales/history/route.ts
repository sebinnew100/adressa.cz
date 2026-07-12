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
    const contacts = await prisma.salesContact.findMany({
      orderBy: { sentAt: 'desc' },
      take: 2000,
      include: {
        provider: {
          select: {
            fullName: true, email: true, serviceId: true, cityId: true,
            active: true, stripeSubscriptionId: true, removalDeadline: true,
          },
        },
      },
    });

    const history = contacts.map(c => {
      let status: 'subscribed' | 'removed' | 'pending';
      if (c.provider.stripeSubscriptionId) status = 'subscribed';
      else if (!c.provider.active) status = 'removed';
      else status = 'pending';

      return {
        id: c.id,
        sentAt: c.sentAt,
        type: c.type,
        providerId: c.providerId,
        fullName: c.provider.fullName,
        email: c.provider.email,
        serviceId: c.provider.serviceId,
        cityId: c.provider.cityId,
        status,
      };
    });

    return NextResponse.json({ history, truncated: contacts.length >= 2000 });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
