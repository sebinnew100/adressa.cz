import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendAppointmentEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const provider = await prisma.provider.findUnique({ where: { id: params.id } });
  if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { customerName, customerEmail, customerPhone, customerAddress, message } =
    await request.json();

  if (!customerName?.trim() || !customerEmail?.trim() || !customerPhone?.trim()) {
    return NextResponse.json({ error: 'Name, email and phone are required' }, { status: 400 });
  }

  const appt = await prisma.appointmentRequest.create({
    data: {
      providerId: params.id,
      customerName: customerName.trim(),
      customerEmail: customerEmail?.trim() || null,
      customerPhone: customerPhone?.trim() || null,
      customerAddress: customerAddress?.trim() || null,
      message: message?.trim() || null,
    },
  });

  if (provider.email) {
    await sendAppointmentEmail(provider.email, provider.fullName, appt);
  }

  return NextResponse.json(appt, { status: 201 });
}
