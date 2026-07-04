import { cache } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

const getArticle = cache(async (slug: string) => {
  return prisma.article.findUnique({ where: { slug } });
});

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article || !article.published) return { title: 'Článek nenalezen | adressa.cz' };

  const title = `${article.title} | adressa.cz`;
  const desc = (article.excerpt ?? article.content).slice(0, 155);

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: article.coverImagePath ? [{ url: article.coverImagePath }] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  if (!article || !article.published) notFound();

  const paragraphs = article.content.split(/\n\s*\n/).filter(p => p.trim());

  const relatedService = article.relatedServiceId ? SERVICES.find(s => s.id === article.relatedServiceId) : null;
  const relatedCity = article.relatedCityId ? CITIES.find(c => c.id === article.relatedCityId) : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    ...(article.excerpt && { description: article.excerpt }),
    ...(article.coverImagePath && { image: article.coverImagePath }),
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    url: `https://www.adressa.cz/clanky/${article.slug}`,
    publisher: { '@type': 'Organization', name: 'adressa.cz' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {article.coverImagePath && (
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-8">
            <Image
              src={article.coverImagePath}
              alt={article.title}
              width={800}
              height={450}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-3">{article.title}</h1>
        <p className="text-gray-400 text-sm mb-8">
          {article.createdAt.toLocaleDateString('cs-CZ')}
        </p>
        <div className="prose max-w-none">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-ink leading-relaxed mb-5">{p}</p>
          ))}
        </div>

        {(relatedService || relatedCity) && (
          <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-ink font-medium mb-4">
              Hledáte {relatedService ? relatedService.nameCz.toLowerCase() : 'odborníka'}
              {relatedCity ? ` v ${relatedCity.nameCz}` : ''}?
            </p>
            <Link
              href={
                relatedService && relatedCity
                  ? `/${relatedService.id}/${relatedCity.id}`
                  : relatedService
                  ? `/providers?service=${relatedService.id}`
                  : `/providers?city=${relatedCity!.id}`
              }
              className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-bold px-6 py-3 rounded-lg transition-colors"
            >
              Najít {relatedService ? relatedService.nameCz.toLowerCase() : 'odborníky'}
              {relatedCity ? ` v ${relatedCity.nameCz}` : ''} →
            </Link>
          </div>
        )}
      </article>
    </>
  );
}
