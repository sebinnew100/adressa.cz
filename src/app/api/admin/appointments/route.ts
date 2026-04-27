import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appointments = await prisma.appointmentRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { provider: { select: { fullName: true, serviceId: true } } },
  });
  return NextResponse.json(appointments);
}
