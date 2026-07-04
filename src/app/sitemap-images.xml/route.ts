import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const BASE = 'https://www.adressa.cz';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const [providers, articles] = await Promise.all([
    prisma.provider.findMany({
      where: { active: true, picturePath: { not: null } },
      select: { id: true, fullName: true, picturePath: true },
    }),
    prisma.article.findMany({
      where: { published: true, coverImagePath: { not: null } },
      select: { slug: true, title: true, coverImagePath: true },
    }),
  ]);

  const entries = [
    ...providers.map(p => ({
      url: `${BASE}/providers/${p.id}`,
      imageUrl: p.picturePath!,
      title: p.fullName,
    })),
    ...articles.map(a => ({
      url: `${BASE}/clanky/${a.slug}`,
      imageUrl: a.coverImagePath!,
      title: a.title,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(e => `  <url>
    <loc>${escapeXml(e.url)}</loc>
    <image:image>
      <image:loc>${escapeXml(e.imageUrl)}</image:loc>
      <image:title>${escapeXml(e.title)}</image:title>
    </image:image>
  </url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
