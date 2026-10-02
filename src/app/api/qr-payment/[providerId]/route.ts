import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/db';
import { generatePaymentQrDataUrl, formatIbanForDisplay, LIFETIME_PRICE_CZK } from '@/lib/qrPayment';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  try {
    const provider = await withRetry(() => prisma.provider.findUnique({ where: { id: params.providerId } }));
    if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const iban = process.env.BANK_IBAN;
    if (!iban) return NextResponse.json({ error: 'qr_not_configured' }, { status: 503 });

    const qrDataUrl = await generatePaymentQrDataUrl({
      amountCzk: LIFETIME_PRICE_CZK,
      variableSymbol: provider.paymentVariableSymbol,
      message: `adressa.cz ${provider.fullName}`,
    });

    return NextResponse.json({
      qrDataUrl,
      ibanFormatted: formatIbanForDisplay(iban),
      variableSymbol: provider.paymentVariableSymbol,
      amountCzk: LIFETIME_PRICE_CZK,
      dueDate: provider.paidUntil,
    });
  } catch (err) {
    console.error('[qr-payment] failed:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
