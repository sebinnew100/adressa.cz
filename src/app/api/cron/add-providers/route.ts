import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendProviderImportReportEmail } from '@/lib/email';
import { searchGooglePlaces } from '@/lib/googlePlaces';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

export const dynamic = 'force-dynamic';

const PROVIDERS_PER_RUN = 20;
// Fixed reference point so the rotation index is stable across deploys —
// doesn't need to be "the actual start date", just a fixed anchor.
const ROTATION_EPOCH = new Date('2026-01-01T00:00:00Z').getTime();
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function requireAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

async function sendReport(result: {
  added: { fullName: string; serviceNameCz: string; cityNameCz: string }[];
  query: string;
  skippedDuplicates: number;
  reason?: string;
}) {
  const to = process.env.AUTOPILOT_REPORT_EMAIL;
  if (!to) return;
  try {
    await sendProviderImportReportEmail(to, result);
  } catch (err) {
    console.error('Provider import report email failed:', err);
  }
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return await runAddProviders();
  } catch (err) {
    console.error('[add-providers] unhandled failure:', err);
    const result = { added: [], query: '', skippedDuplicates: 0, reason: `⚠️ Unhandled error: ${String(err)}` };
    await sendReport(result);
    return NextResponse.json(result, { status: 500 });
  }
}

async function runAddProviders() {
  // Deterministic daily rotation through every service+city combination —
  // no extra state/table needed, just advances by one combo per day.
  const combos = SERVICES.flatMap(s => CITIES.map(c => ({ service: s, city: c })));
  const daysSinceEpoch = Math.floor((Date.now() - ROTATION_EPOCH) / MS_PER_DAY);
  const combo = combos[((daysSinceEpoch % combos.length) + combos.length) % combos.length];

  const query = `${combo.service.nameCz} ${combo.city.nameCz}`;
  const results = await searchGooglePlaces(query, 20);

  if (results.length === 0) {
    const result = { added: [], query, skippedDuplicates: 0, reason: 'Google Places nevrátilo žádné výsledky (nebo chybí API klíč).' };
    await sendReport(result);
    return NextResponse.json(result);
  }

  const placeIds = results.map(r => r.placeId);
  const existing = await prisma.provider.findMany({
    where: { placeId: { in: placeIds } },
    select: { placeId: true },
  });
  const existingIds = new Set(existing.map(p => p.placeId));

  const notDuplicate = results.filter(r => !existingIds.has(r.placeId));
  const skippedDuplicates = results.length - notDuplicate.length;
  const fresh = notDuplicate.slice(0, PROVIDERS_PER_RUN);

  const added: { fullName: string; serviceNameCz: string; cityNameCz: string }[] = [];
  for (const place of fresh) {
    try {
      await prisma.provider.create({
        data: {
          fullName: place.name,
          phone: place.phone,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          serviceId: combo.service.id,
          cityId: combo.city.id,
          placeId: place.placeId,
          active: true,
          // Real businesses pulled in without their consent/knowledge —
          // exempt from the sales-pitch cron; only pitch if they reach out
          // and ask to be listed/upgraded themselves.
          salesExempt: true,
        },
      });
      added.push({ fullName: place.name, serviceNameCz: combo.service.nameCz, cityNameCz: combo.city.nameCz });
    } catch (err) {
      console.error('Provider import: failed to create', place.placeId, err);
    }
  }

  const result = { added, query, skippedDuplicates };
  await sendReport(result);
  return NextResponse.json(result);
}
