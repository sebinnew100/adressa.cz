import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import { fetchArticleCoverImage } from '../src/lib/unsplash';

const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({ where: { coverImagePath: null } });
  console.log(`Found ${articles.length} articles without a cover image.`);

  for (const article of articles) {
    const fetched = await fetchArticleCoverImage(article.relatedServiceId, (filename, bytes) =>
      put(filename, bytes, { access: 'public' })
    );

    if (!fetched) {
      console.log(`  ✗ ${article.title.slice(0, 60)} — no photo found`);
      continue;
    }

    await prisma.article.update({
      where: { id: article.id },
      data: {
        coverImagePath: fetched.coverImagePath,
        coverImageCredit: fetched.coverImageCredit,
        coverImageCreditUrl: fetched.coverImageCreditUrl,
      },
    });
    console.log(`  ✓ ${article.title.slice(0, 60)} — photo by ${fetched.coverImageCredit}`);

    // Unsplash demo rate limit is 50 req/hour; small delay keeps us well under it
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
