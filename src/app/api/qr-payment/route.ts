import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Chooses the QR bank-transfer payment method for a provider. Deliberately
// does NOT set active/paidUntil here — unlike Stripe's card-verified trial,
// picking this method is a zero-cost, zero-verification click, so access is
// only granted once an admin manually confirms the bank transfer arrived
// (see /api/admin/providers/[id]'s confirmQrPayment branch).
export async function POST(request: NextRequest) {
  try {
    const { providerId } = await request.json();
    if (!providerId) return NextResponse.json({ error: 'Missing providerId' }, { status: 400 });

    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

    const updated = await prisma.provider.update({
      where: { id: providerId },
      data: { paymentMethod: 'qr_bank_transfer' },
    });

    return NextResponse.json({ success: true, providerId: updated.id });
  } catch (err) {
    console.error('QR payment method selection error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
