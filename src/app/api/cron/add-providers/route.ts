import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/db';
import { sendProviderImportReportEmail, sendListingNotificationEmail } from '@/lib/email';
import { searchGooglePlaces } from '@/lib/googlePlaces';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

export const dynamic = 'force-dynamic';

const PROVIDERS_PER_RUN = 45;
// Google Places (New) hard-caps a single text-search request at 20 results,
// so reaching PROVIDERS_PER_RUN requires searching several service+city
// combos per run, not just asking for more from one query. Capped so a run
// can't spiral into dozens of API calls if duplicates dominate a combo.
const MAX_COMBOS_PER_RUN = 8;
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
  queries: string[];
  skippedDuplicates: number;
  reason?: string;
  listingNotified?: number;
}) {
  const to = process.env.AUTOPILOT_REPORT_EMAIL;
  if (!to) return;
  try {
    await sendProviderImportReportEmail(to, result);
  } catch (err) {
    console.error('Provider import report email failed:', err);
  }
}

// One-time, no-pitch "you're listed" notice — separate from the sales-pitch
// flow (salesExempt doesn't apply here), sent once per provider that has an
// email, tracked via listingNotifiedAt so nobody gets it twice. Naturally
// catches both the existing backlog and today's new additions in one pass.
async function sendListingNotifications(): Promise<number> {
  const candidates = await withRetry(() => prisma.provider.findMany({
    where: { active: true, email: { not: null }, listingNotifiedAt: null },
    select: { id: true, fullName: true, email: true },
  }));

  let sent = 0;
  for (const p of candidates) {
    if (!p.email) continue;
    try {
      const ok = await sendListingNotificationEmail(p.email, p.fullName, p.id);
      if (ok) {
        await prisma.provider.update({ where: { id: p.id }, data: { listingNotifiedAt: new Date() } });
        sent++;
      }
    } catch (err) {
      console.error('Listing notification failed for', p.id, err);
    }
  }
  return sent;
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return await runAddProviders();
  } catch (err) {
    console.error('[add-providers] unhandled failure:', err);
    const result = { added: [], queries: [], skippedDuplicates: 0, reason: `⚠️ Unhandled error: ${String(err)}` };
    await sendReport(result);
    return NextResponse.json(result, { status: 500 });
  }
}

async function runAddProviders() {
  // Deterministic rotation through every service+city combination — no extra
  // state/table needed. Each run consumes up to MAX_COMBOS_PER_RUN combos,
  // so the next day's run picks up right where this one left off.
  const combos = SERVICES.flatMap(s => CITIES.map(c => ({ service: s, city: c })));
  const daysSinceEpoch = Math.floor((Date.now() - ROTATION_EPOCH) / MS_PER_DAY);
  const startIndex = ((daysSinceEpoch * MAX_COMBOS_PER_RUN) % combos.length + combos.length) % combos.length;

  const queries: string[] = [];
  const added: { fullName: string; serviceNameCz: string; cityNameCz: string }[] = [];
  let skippedDuplicates = 0;

  for (let i = 0; i < MAX_COMBOS_PER_RUN && added.length < PROVIDERS_PER_RUN; i++) {
    const combo = combos[(startIndex + i) % combos.length];
    const query = `${combo.service.nameCz} ${combo.city.nameCz}`;
    queries.push(query);

    const results = await searchGooglePlaces(query, 20);
    if (results.length === 0) continue;

    const placeIds = results.map(r => r.placeId);
    const existing = await withRetry(() => prisma.provider.findMany({
      where: { placeId: { in: placeIds } },
      select: { placeId: true },
    }));
    const existingIds = new Set(existing.map(p => p.placeId));

    const notDuplicate = results.filter(r => !existingIds.has(r.placeId));
    skippedDuplicates += results.length - notDuplicate.length;
    const remainingSlots = PROVIDERS_PER_RUN - added.length;
    const fresh = notDuplicate.slice(0, remainingSlots);

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
  }

  if (added.length === 0) {
    const listingNotified = await sendListingNotifications();
    const result = { added: [], queries, skippedDuplicates, reason: 'Google Places nevrátilo žádné nové výsledky (nebo chybí API klíč).', listingNotified };
    await sendReport(result);
    return NextResponse.json(result);
  }

  const listingNotified = await sendListingNotifications();
  const result = { added, queries, skippedDuplicates, listingNotified };
  await sendReport(result);
  return NextResponse.json(result);
}
