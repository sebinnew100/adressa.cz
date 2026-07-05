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

function distMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function structuredGeocode(streetAndNumber, city) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&street=${encodeURIComponent(streetAndNumber)}&city=${encodeURIComponent(city)}&country=Czechia`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'adressa.cz game mode prototype (contact: sebinnew100@gmail.com)' },
  });
  const data = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name };
}

async function main() {
  const providers = await prisma.provider.findMany({
    where: { cityId: 'ceske-budejovice', serviceId: 'restaurace', active: true },
    select: { id: true, fullName: true, address: true, latitude: true, longitude: true },
  });

  console.log(`Re-verifying ${providers.length} restaurant coordinates via structured geocoding...\n`);

  for (const p of providers) {
    if (!p.address) {
      console.log(`  - ${p.fullName}: no address on file, skipping`);
      continue;
    }
    const [streetPart, ...rest] = p.address.split(',');
    const cityPart = rest.join(',').replace(/\d{3}\s?\d{2}/, '').trim() || 'České Budějovice';

    const result = await structuredGeocode(streetPart.trim(), cityPart);
    await sleep(1100);

    if (!result) {
      console.log(`  ✗ ${p.fullName}: structured query failed for "${streetPart.trim()}, ${cityPart}"`);
      continue;
    }

    const moved = p.latitude && p.longitude ? distMeters(p.latitude, p.longitude, result.lat, result.lon) : null;
    const movedStr = moved !== null ? `moved ${moved.toFixed(0)}m` : 'no previous coords';
    console.log(`  ${p.fullName}: ${result.lat}, ${result.lon} (${movedStr})`);
    console.log(`     -> ${result.display}`);

    if (moved === null || moved > 30) {
      await prisma.provider.update({
        where: { id: p.id },
        data: { latitude: result.lat, longitude: result.lon },
      });
      console.log(`     updated in DB`);
    }
  }

  console.log('\nDone.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
