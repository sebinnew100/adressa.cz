import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/db';
import { serviceIdForPoptavejCategory } from '@/lib/poptavejCategoryMapping';
import { sendProcurementImportReportEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE_URL = 'https://poptavej.cz';
// How many listing pages to scan per run — the site sorts newest-first, so
// this many pages is comfortably more than a day's worth of new listings;
// dedup (by externalId) means re-scanning already-seen pages is harmless.
const PAGES_TO_SCAN = 5;
const MAX_IMPORTED_PER_RUN = 150;

function requireAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

interface ScrapedListing {
  externalId: string;
  title: string;
  detailUrl: string;
  value: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  regionName: string | null;
  deadlineText: string | null;
  publishedAt: Date | null;
}

// Parses poptavej.cz's date column text into a real Date: "Dnes 15:32",
// "Včera 09:10", or an absolute "16.7.2026" / "16.7.2026 09:10".
function parsePublishedDate(text: string): Date | null {
  const trimmed = text.trim();
  const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})/);
  const hours = timeMatch ? Number(timeMatch[1]) : 0;
  const minutes = timeMatch ? Number(timeMatch[2]) : 0;

  if (/^Dnes/i.test(trimmed)) {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  }
  if (/^Včera/i.test(trimmed)) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }
  const absoluteMatch = trimmed.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (absoluteMatch) {
    const [, day, month, year] = absoluteMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), hours, minutes);
  }
  return null;
}

function parseListingsFromHtml(html: string): ScrapedListing[] {
  const $ = cheerio.load(html);
  const listings: ScrapedListing[] = [];

  $('.procurement-list .row.procurement').each((_, el) => {
    const row = $(el);
    const link = row.find('.col.nazev a').first();
    const href = link.attr('href') ?? '';
    const idMatch = href.match(/\/verejna-zakazka\/(VZ\d+)\//);
    if (!idMatch) return;

    const categoryLink = row.find('a.col.category').first();
    const categoryHref = categoryLink.attr('href') ?? '';
    const categorySlugMatch = categoryHref.match(/\/verejne-zakazky\/([a-z0-9-]+)$/);

    const valueText = row.find('.col.cena').first().text().trim();
    const dateText = row.find('.col.date').first().text().trim();

    listings.push({
      externalId: idMatch[1],
      title: link.text().trim(),
      detailUrl: `${BASE_URL}${href}`,
      value: valueText && valueText !== 'neurčeno' ? valueText : null,
      categorySlug: categorySlugMatch ? categorySlugMatch[1] : null,
      categoryName: categoryLink.text().trim() || null,
      regionName: row.find('a.col.location').first().text().trim() || null,
      deadlineText: row.find('.col.ukonceni').first().text().trim() || null,
      publishedAt: dateText ? parsePublishedDate(dateText) : null,
    });
  });

  return listings;
}

function parseValueToNumber(value: string | null): number | null {
  if (!value) return null;
  const digits = value.replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let scanned = 0;
  let imported = 0;
  const importedTitles: { title: string; cpvCode: string | null }[] = [];

  try {
    for (let page = 1; page <= PAGES_TO_SCAN; page++) {
      const url = page === 1 ? `${BASE_URL}/verejne-zakazky` : `${BASE_URL}/verejne-zakazky?page=${page}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; adressa.cz)' } });
      if (!res.ok) {
        console.warn(`[procurement-import] page ${page} fetch failed: ${res.status}`);
        continue;
      }
      const html = await res.text();
      const listings = parseListingsFromHtml(html);
      scanned += listings.length;

      for (const listing of listings) {
        if (imported >= MAX_IMPORTED_PER_RUN) break;

        const existing = await prisma.procurementNotice.findUnique({ where: { externalId: listing.externalId } });
        if (existing) continue;

        const relatedServiceId = serviceIdForPoptavejCategory(listing.categorySlug);

        await prisma.procurementNotice.create({
          data: {
            externalId: listing.externalId,
            title: listing.title,
            description: null,
            cpvCode: listing.categoryName,
            regionCode: listing.regionName,
            relatedServiceId,
            status: listing.deadlineText,
            estimatedValue: parseValueToNumber(listing.value),
            publishedAt: listing.publishedAt,
            sourceUrl: listing.detailUrl,
          },
        });
        imported++;
        importedTitles.push({ title: listing.title, cpvCode: listing.categoryName });
      }

      if (imported >= MAX_IMPORTED_PER_RUN) break;
      // Brief pause between page fetches — polite to the source site.
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (err) {
    console.error('[procurement-import] scrape failed:', err);
    const result = { imported, scanned, fileName: 'poptavej.cz scrape', reason: `Error during scrape: ${String(err)}` };
    await sendReport(result);
    return NextResponse.json(result);
  }

  const result = { imported, scanned, fileName: 'poptavej.cz scrape', importedTitles };
  await sendReport(result);
  return NextResponse.json(result);
}

async function sendReport(result: {
  imported: number;
  scanned: number;
  fileName: string;
  reason?: string;
  importedTitles?: { title: string; cpvCode: string | null }[];
}) {
  const to = process.env.AUTOPILOT_REPORT_EMAIL;
  if (!to) return;
  try {
    await sendProcurementImportReportEmail(to, result);
  } catch (err) {
    console.error('Procurement import report email failed:', err);
  }
}
