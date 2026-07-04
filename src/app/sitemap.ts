import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

export const dynamic = 'force-dynamic';

const BASE = 'https://www.adressa.cz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [providers, serviceRequests, articles] = await Promise.all([
    prisma.provider.findMany({
      where: { active: true },
      select: { id: true, updatedAt: true },
    }),
    prisma.serviceRequest.findMany({
      where: { active: true },
      select: { id: true, createdAt: true },
    }),
    prisma.article.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  // All 700 service×city landing pages
  const landingPages = SERVICES.flatMap(s =>
    CITIES.map(c => ({
      url: `${BASE}/${s.id}/${c.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );

  return [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/providers`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/poptavky`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/clanky`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/register`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/faq`, changeFrequency: 'monthly', priority: 0.5 },

    ...landingPages,

    // Individual provider profiles
    ...providers.map(p => ({
      url: `${BASE}/providers/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // Individual service request pages
    ...serviceRequests.map(r => ({
      url: `${BASE}/poptavky/${r.id}`,
      lastModified: r.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),

    // Individual articles
    ...articles.map(a => ({
      url: `${BASE}/clanky/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
