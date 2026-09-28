import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return new NextResponse('Chybí odhlašovací token.', { status: 400 });
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } });
  if (!subscriber) {
    return new NextResponse('Neplatný odkaz pro odhlášení.', { status: 404 });
  }

  if (!subscriber.unsubscribedAt) {
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { unsubscribedAt: new Date() },
    });
  }

  return new NextResponse(
    `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><title>Odhlášeno – adressa.cz</title></head>
    <body style="font-family:sans-serif;max-width:480px;margin:80px auto;text-align:center;color:#333;">
      <h2>Odhlášení proběhlo úspěšně</h2>
      <p>Už vám nebudeme posílat novinky na ${subscriber.email}.</p>
      <a href="https://www.adressa.cz" style="color:#166534;">Zpět na adressa.cz</a>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
