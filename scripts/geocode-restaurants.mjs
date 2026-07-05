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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'adressa.cz game mode prototype (contact: sebinnew100@gmail.com)' },
  });
  const data = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

async function main() {
  const providers = await prisma.provider.findMany({
    where: { cityId: 'ceske-budejovice', serviceId: 'restaurace', active: true },
    select: { id: true, fullName: true, address: true, latitude: true, longitude: true },
  });

  console.log(`Geocoding ${providers.length} restaurants...`);

  for (const provider of providers) {
    if (provider.latitude && provider.longitude) {
      console.log(`  - ${provider.fullName}: already has coordinates, skipping`);
      continue;
    }

    let coords = await geocode(provider.address);
    if (!coords) {
      // fallback: try without house number, just street name + city
      coords = await geocode(`${provider.fullName}, České Budějovice, Czechia`);
    }

    if (coords) {
      await prisma.provider.update({
        where: { id: provider.id },
        data: { latitude: coords.lat, longitude: coords.lon },
      });
      console.log(`  ✓ ${provider.fullName}: ${coords.lat}, ${coords.lon}`);
    } else {
      console.log(`  ✗ ${provider.fullName}: could not geocode "${provider.address}"`);
    }

    await sleep(1100); // Nominatim usage policy: max 1 request/second
  }

  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
