import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendQrSelfReportedEmail } from '@/lib/email';
import { checkRateLimit, getIp } from '@/lib/rateLimit';

// Lets a provider flag "I already paid" — does not confirm anything by
// itself, just prioritizes the admin's manual bank-statement check.
export async function POST(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  const ip = getIp(request);
  if (!checkRateLimit(`qr-self-report:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const provider = await prisma.provider.findUnique({ where: { id: params.providerId } });
  if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.salesContact.create({
    data: { providerId: provider.id, type: 'qr_self_reported' },
  });

  const to = process.env.AUTOPILOT_REPORT_EMAIL;
  if (to) {
    await sendQrSelfReportedEmail(to, provider.fullName, provider.paymentVariableSymbol);
  }

  return NextResponse.json({ success: true });
}
