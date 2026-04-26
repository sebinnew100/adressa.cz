import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import { ProviderDetailClient } from '@/components/providers/ProviderDetailClient';

const getProvider = cache(async (id: string) => {
  return prisma.provider.findUnique({ where: { id } });
});

const getReviews = cache(async (id: string) => {
  return prisma.review.findMany({
    where: { providerId: id },
    orderBy: { createdAt: 'desc' },
  });
});

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const provider = await getProvider(params.id);
  if (!provider) return { title: 'Profil nenalezen | adressa.cz' };

  const service = SERVICES.find(s => s.id === provider.serviceId);
  const city = CITIES.find(c => c.id === provider.cityId);
  const serviceName = service?.nameCz ?? provider.serviceId;
  const cityName = city?.nameCz ?? provider.cityId;

  const title = `${provider.fullName} — ${serviceName} ${cityName} | adressa.cz`;
  const desc = `${provider.fullName} nabízí ${serviceName.toLowerCase()} v ${cityName}. ${provider.description ?? ''} Kontaktujte přes adressa.cz.`.slice(0, 155);

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: provider.picturePath ? [{ url: provider.picturePath }] : [],
    },
  };
}

export default async function ProviderPage({ params }: { params: { id: string } }) {
  const provider = await getProvider(params.id);
  if (!provider || !provider.active) notFound();

  const reviews = await getReviews(params.id);

  const service = SERVICES.find(s => s.id === provider.serviceId);
  const city = CITIES.find(c => c.id === provider.cityId);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: provider.fullName,
    ...(provider.description && { description: provider.description }),
    ...(provider.phone && { telephone: provider.phone }),
    ...(provider.email && { email: provider.email }),
    ...(provider.picturePath && { image: provider.picturePath }),
    url: `https://www.adressa.cz/providers/${provider.id}`,
    address: {
      '@type': 'PostalAddress',
      ...(provider.address && { streetAddress: provider.address }),
      addressLocality: city?.nameCz ?? provider.cityId,
      addressCountry: 'CZ',
    },
    ...(service && { knowsAbout: service.nameCz }),
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviews.slice(0, 5).map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.authorName },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        ...(r.comment && { reviewBody: r.comment }),
        datePublished: r.createdAt.toISOString().slice(0, 10),
      })),
    }),
  };

  const serializedProvider = {
    ...provider,
    paidUntil: provider.paidUntil?.toISOString() ?? null,
    createdAt: provider.createdAt.toISOString(),
    updatedAt: provider.updatedAt.toISOString(),
  };

  const serializedReviews = reviews.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProviderDetailClient provider={serializedProvider} initialReviews={serializedReviews} />
    </>
  );
}
