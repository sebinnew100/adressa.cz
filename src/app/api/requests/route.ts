import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const requests = await prisma.serviceRequest.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, serviceId, cityId, contactName, contactEmail, contactPhone, budget } = body;

  if (!title?.trim() || !contactName?.trim()) {
    return NextResponse.json({ error: 'Title and contact name are required.' }, { status: 400 });
  }

  const request = await prisma.serviceRequest.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      serviceId: serviceId || null,
      cityId: cityId || null,
      contactName: contactName.trim(),
      contactEmail: contactEmail?.trim() || null,
      contactPhone: contactPhone?.trim() || null,
      budget: budget?.trim() || null,
    },
  });

  return NextResponse.json(request, { status: 201 });
}
