import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MONTHLY_PRICE_CZK } from '@/lib/stripe';
import { generatePaymentQrDataUrl, formatIbanForDisplay } from '@/lib/qrPayment';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  const provider = await prisma.provider.findUnique({ where: { id: params.providerId } });
  if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const iban = process.env.BANK_IBAN;
  if (!iban) return NextResponse.json({ error: 'qr_not_configured' }, { status: 503 });

  const qrDataUrl = await generatePaymentQrDataUrl({
    amountCzk: MONTHLY_PRICE_CZK,
    variableSymbol: provider.paymentVariableSymbol,
    message: `adressa.cz ${provider.fullName}`,
  });

  return NextResponse.json({
    qrDataUrl,
    ibanFormatted: formatIbanForDisplay(iban),
    variableSymbol: provider.paymentVariableSymbol,
    amountCzk: MONTHLY_PRICE_CZK,
    dueDate: provider.paidUntil,
  });
}
