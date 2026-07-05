import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'adressa.cz game mode prototype (contact: sebinnew100@gmail.com)' },
  });
  return res.json();
}

async function main() {
  const providers = await prisma.provider.findMany({
    where: { cityId: 'ceske-budejovice', serviceId: 'restaurace', active: true },
    select: { id: true, fullName: true, address: true, latitude: true, longitude: true },
  });

  console.log(`Reverse-checking ${providers.length} restaurants...\n`);
  const flagged = [];

  for (const p of providers) {
    if (!p.latitude || !p.longitude) {
      console.log(`${p.fullName}: NO COORDINATES`);
      flagged.push(p.fullName);
      continue;
    }

    const result = await reverseGeocode(p.latitude, p.longitude);
    await sleep(1100);

    const addr = result.address || {};
    const foundStreet = addr.road || '';
    const expectedStreet = (p.address || '').split(',')[0].replace(/\d+\/?\d*$/, '').trim();

    const match = foundStreet && expectedStreet && normalize(foundStreet).includes(normalize(expectedStreet).slice(0, 6));

    const status = match ? 'OK   ' : 'CHECK';
    console.log(`[${status}] ${p.fullName}`);
    console.log(`         stored address: "${p.address}"`);
    console.log(`         reverse lookup: "${result.display_name}"`);
    if (!match) flagged.push(p.fullName);
    console.log('');
  }

  console.log('---');
  console.log(flagged.length === 0 ? 'All coordinates match their stored street.' : `Flagged for manual review: ${flagged.join(', ')}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
