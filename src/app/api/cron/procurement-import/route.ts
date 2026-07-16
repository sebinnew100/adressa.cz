import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import unzipper from 'unzipper';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { prisma } from '@/lib/db';
import { serviceIdForCpvCode } from '@/lib/cpvMapping';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const BASE_URL = 'https://isvz.nipez.cz/sites/default/files/content/opendata-rvz';
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

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const fileName = `VZ-${month}-${year}.zip`;
  const url = `${BASE_URL}/${fileName}`;

  const res = await fetch(url);
  if (!res.ok || !res.body) {
    const result = { imported: 0, scanned: 0, fileName, reason: `Could not download ${url} (status ${res.status})` };
    await sendReport(result);
    return NextResponse.json(result);
  }

  let scanned = 0;
  let imported = 0;
  const importedTitles: { title: string; cpvCode: string | null }[] = [];

  try {
    // unzipper needs random access for the zip central directory, so buffer
    // the compressed file fully first (~30MB compressed — fine in memory;
    // it's the uncompressed JSON we avoid ever fully materializing below).
    const zipStream = Readable.fromWeb(res.body as unknown as import('stream/web').ReadableStream);
    const zipBuffer = await streamToBuffer(zipStream);
    const directory = await unzipper.Open.buffer(zipBuffer);

    const entry = directory.files.find(f => f.path.endsWith('.json'));
    if (!entry) throw new Error('No .json file found inside zip');

    const jsonStream = entry.stream();
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
