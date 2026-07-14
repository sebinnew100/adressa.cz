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
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { title: true, slug: true, excerpt: true, content: true, createdAt: true, coverImagePath: true },
  });

  const items = articles.map(a => {
    const url = `${BASE}/clanky/${a.slug}`;
    const description = (a.excerpt ?? a.content).slice(0, 300);
    const enclosure = a.coverImagePath
      ? `\n    <enclosure url="${escapeXml(a.coverImagePath)}" type="image/jpeg" />`
      : '';
    return `  <item>
    <title>${escapeXml(a.title)}</title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="true">${escapeXml(url)}</guid>
    <description>${escapeXml(description)}</description>
    <pubDate>${a.createdAt.toUTCString()}</pubDate>${enclosure}
  </item>`;
  }).join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>adressa.cz — Články</title>
  <link>${BASE}/clanky</link>
  <description>Nejnovější články z adressa.cz — online katalogu lokálních služeb v České republice.</description>
  <language>cs</language>
${items}
</channel>
</rss>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml' },
  });
}
