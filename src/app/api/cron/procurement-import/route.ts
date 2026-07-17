import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { Agent } from 'undici';
import AdmZip from 'adm-zip';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { prisma } from '@/lib/db';
import { serviceIdForCpvCode } from '@/lib/cpvMapping';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;
// The Czech government server appears to reject/throttle connections from
// Vercel's default US region — run this specific function from Europe
// instead (much closer, and likely not caught by any geo/ASN restriction).
export const preferredRegion = 'fra1';

const BASE_URL = 'https://isvz.nipez.cz/sites/default/files/content/opendata-rvz';
// The government server can be slow to accept connections for this large a
// file — default undici connect timeout (10s) isn't always enough.
const longTimeoutAgent = new Agent({ connectTimeout: 30_000, headersTimeout: 60_000 });

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, { dispatcher: longTimeoutAgent } as RequestInit);
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, 3000 * (i + 1)));
    }
  }
  throw lastErr;
}
// Only import notices whose CPV code maps to a category real users would
// actually search adressa.cz for — most government contracts (office
// supplies, defense equipment, etc.) are irrelevant to our audience.
const MAX_IMPORTED_PER_RUN = 200;

function requireAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

interface RawRecord {
  verejna_zakazka?: {
    identifikator_NIPEZ?: string;
    nazev_verejne_zakazky?: string;
    predmet?: { popis_predmetu?: string; hlavni_kod_CPV?: string; mista_plneni?: { nuts?: string }[] };
    casti_verejne_zakazky?: {
      zadavaci_postup_pro_cast?: { stav?: string; datum_zahajeni_zadavaciho_postupu?: string };
    }[];
  };
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // A given month's data isn't published until after that month ends, so
  // always request the previous month's file, not the current one.
  const now = new Date();
  const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const year = previousMonth.getUTCFullYear();
  const month = String(previousMonth.getUTCMonth() + 1).padStart(2, '0');
  const fileName = `VZ-${month}-${year}.zip`;
  const url = `${BASE_URL}/${fileName}`;

  let res: Response;
  try {
    res = await fetchWithRetry(url);
  } catch (err) {
    const result = { imported: 0, scanned: 0, fileName, reason: `Could not connect to ${url} after retries: ${String(err)}` };
    await sendReport(result);
    return NextResponse.json(result);
  }
  if (!res.ok || !res.body) {
    const result = { imported: 0, scanned: 0, fileName, reason: `Could not download ${url} (status ${res.status})` };
    await sendReport(result);
    return NextResponse.json(result);
  }

  let scanned = 0;
  let imported = 0;
  const importedTitles: { title: string; cpvCode: string | null }[] = [];

  try {
    // Buffer the compressed zip fully (~30MB — fine in memory), extract the
    // single JSON entry as a buffer, then stream-*parse* that buffer so we
    // never build a full in-memory JS object graph for the ~230MB of JSON —
    // only the buffer itself plus one record at a time during parsing.
    const zipStream = Readable.fromWeb(res.body as unknown as import('stream/web').ReadableStream);
    const zipBuffer = await streamToBuffer(zipStream);
    const zip = new AdmZip(zipBuffer);
    const entry = zip.getEntries().find(e => e.entryName.endsWith('.json'));
    if (!entry) throw new Error('No .json file found inside zip');

    const jsonBuffer = entry.getData();
    const jsonStream = Readable.from(jsonBuffer);
    const pipelineSteps = jsonStream.pipe(parser()).pipe(pick({ filter: 'data' })).pipe(streamArray());

    for await (const { value } of pipelineSteps as AsyncIterable<{ value: RawRecord }>) {
      scanned++;
      const vz = value.verejna_zakazka;
      if (!vz) continue;

      const cpvCode = vz.predmet?.hlavni_kod_CPV ?? null;
      const relatedServiceId = serviceIdForCpvCode(cpvCode);
      if (!relatedServiceId) continue; // not relevant to our audience — skip

      const externalId = vz.identifikator_NIPEZ;
      if (!externalId || imported >= MAX_IMPORTED_PER_RUN) continue;

      const existing = await prisma.procurementNotice.findUnique({ where: { externalId } });
      if (existing) continue;

      const postup = vz.casti_verejne_zakazky?.[0]?.zadavaci_postup_pro_cast;
      await prisma.procurementNotice.create({
        data: {
          externalId,
          title: vz.nazev_verejne_zakazky ?? 'Bez názvu',
          description: vz.predmet?.popis_predmetu?.slice(0, 1000) ?? null,
          cpvCode,
          regionCode: vz.predmet?.mista_plneni?.[0]?.nuts ?? null,
          relatedServiceId,
          status: postup?.stav ?? null,
          procedureStartAt: postup?.datum_zahajeni_zadavaciho_postupu
            ? new Date(postup.datum_zahajeni_zadavaciho_postupu)
            : null,
          sourceUrl: `https://nen.nipez.cz/verejne-zakazky/detail-zakazky/${externalId}`,
        },
      });
      imported++;
      importedTitles.push({ title: vz.nazev_verejne_zakazky ?? 'Bez názvu', cpvCode });
    }
  } catch (err) {
    console.error('Procurement import failed:', err);
    const result = { imported, scanned, fileName, reason: `Error during import: ${String(err)}` };
    await sendReport(result);
    return NextResponse.json(result);
  }

  const result = { imported, scanned, fileName, importedTitles };
  await sendReport(result);
  return NextResponse.json(result);
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  await pipeline(stream, async function* (source) {
    for await (const chunk of source) chunks.push(chunk as Buffer);
  });
  return Buffer.concat(chunks);
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
  const { sendProcurementImportReportEmail } = await import('@/lib/email');
  try {
    await sendProcurementImportReportEmail(to, result);
  } catch (err) {
    console.error('Procurement import report email failed:', err);
  }
}
