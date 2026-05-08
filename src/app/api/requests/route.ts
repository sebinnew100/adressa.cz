import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const requests = await prisma.serviceRequest.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  // Strip contact details — only revealed after access code verification
  const safe = requests.map(({ contactPhone, contactEmail, ...rest }) => ({
    ...rest,
    contactPhone: null,
    contactEmail: null,
  }));
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  // 3 submissions per hour per IP to prevent spam
  const ip = getIp(req);
  if (!checkRateLimit(`post-request:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many submissions. Try again later.' },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { title, description, serviceId, cityId, contactName, contactEmail, contactPhone, budget } = body;

  if (!title?.trim() || !contactName?.trim()) {
    return NextResponse.json({ error: 'Title and contact name are required.' }, { status: 400 });
  }

  // Enforce max lengths to prevent database abuse
  if (title.trim().length > 200 || contactName.trim().length > 100) {
    return NextResponse.json({ error: 'Input too long.' }, { status: 400 });
  }
  if (description && description.length > 2000) {
    return NextResponse.json({ error: 'Description too long.' }, { status: 400 });
  }

  const request = await prisma.serviceRequest.create({
    data: {
      title: title.trim().slice(0, 200),
      description: description?.trim().slice(0, 2000) || null,
      serviceId: serviceId || null,
      cityId: cityId || null,
      contactName: contactName.trim().slice(0, 100),
      contactEmail: contactEmail?.trim().slice(0, 200) || null,
      contactPhone: contactPhone?.trim().slice(0, 20) || null,
      budget: budget?.trim().slice(0, 100) || null,
    },
  });

  return NextResponse.json(request, { status: 201 });
}
