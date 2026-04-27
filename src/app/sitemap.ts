import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

export const dynamic = 'force-dynamic';

const BASE = 'https://www.adressa.cz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const providers = await prisma.provider.findMany({
    where: { active: true },
    select: { id: true, updatedAt: true, serviceId: true, cityId: true },
  });

  const serviceIds = new Set(SERVICES.map(s => s.id));
  const cityIds = new Set(CITIES.map(c => c.id));

  // Unique service+city combos that have at least one provider
  const combos = new Map<string, { service: string; city: string }>();
  for (const p of providers) {
    if (serviceIds.has(p.serviceId) && cityIds.has(p.cityId)) {
      combos.set(`${p.serviceId}/${p.cityId}`, { service: p.serviceId, city: p.cityId });
    }
  }

  return [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/providers`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/register`, changeFrequency: 'monthly', priority: 0.6 },

    // Landing pages per service+city
    ...Array.from(combos.values()).map(({ service, city }) => ({
      url: `${BASE}/${service}/${city}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    // Individual provider profiles
    ...providers.map(p => ({
      url: `${BASE}/providers/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
