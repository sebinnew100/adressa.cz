import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Pre-build all 700 service×city combinations at deploy time
export async function generateStaticParams() {
  const params: { service: string; city: string }[] = [];
  for (const s of SERVICES) {
    for (const c of CITIES) {
      params.push({ service: s.id, city: c.id });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: { service: string; city: string } }): Promise<Metadata> {
  const service = SERVICES.find(s => s.id === params.service);
  const city = CITIES.find(c => c.id === params.city);
  if (!service || !city) return { title: 'adressa.cz' };

  const title = `${service.nameCz} ${city.nameCz} — ověření profesionálové | adressa.cz`;
  const desc = `Hledáte ${service.nameCz.toLowerCase()} v ${city.nameCz}? Porovnejte ověřené profesionály, čtěte recenze a pošlete poptávku zdarma na adressa.cz.`;

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, url: `https://www.adressa.cz/${params.service}/${params.city}` },
    alternates: { canonical: `https://www.adressa.cz/${params.service}/${params.city}` },
  };
}

function avatarColor(id: string) {
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

function buildFaq(serviceNameCz: string, cityNameCz: string) {
  const s = serviceNameCz;
  const sLow = s.toLowerCase();
  const c = cityNameCz;
  return [
    {
      q: `Jak najít spolehlivého ${sLow} v ${c}?`,
      a: `Na adressa.cz najdete ověřené ${sLow}e v ${c} s hodnoceními, kontakty a popisem služeb. Stačí vybrat profil a odeslat poptávku přímo ze stránky.`,
    },
    {
      q: `Kolik stojí ${sLow} v ${c}?`,
      a: `Ceny ${sLow}ů v ${c} se liší podle rozsahu prací a zkušeností. Přes adressa.cz můžete porovnat více profesionálů najednou a vybrat nejlepší nabídku.`,
    },
    {
      q: `Jak rychle může ${sLow} v ${c} přijet?`,
      a: `Většina ${sLow}ů registrovaných na adressa.cz v ${c} nabízí termín do 48 hodin. U urgentních zakázek se doporučuje kontaktovat více profesionálů.`,
    },
    {
      q: `Je ${sLow} v ${c} pojištěný?`,
      a: `Profesionálové na adressa.cz uvádějí detaily svých služeb ve svém profilu. Doporučujeme vždy ověřit pojištění a reference přímo s poskytovatelem.`,
    },
  ];
}

export default async function ServiceCityPage({ params }: { params: { service: string; city: string } }) {
  const service = SERVICES.find(s => s.id === params.service);
  const city = CITIES.find(c => c.id === params.city);
  if (!service || !city) notFound();

  const providers = await prisma.provider.findMany({
    where: { active: true, serviceId: params.service, cityId: params.city },
    orderBy: [{ featured: 'desc' }, { fullName: 'asc' }],
  });

  // Related: same service in other top cities
  const otherCities = CITIES.filter(c => c.id !== params.city).slice(0, 6);
  // Related: other services in same city
  const otherServices = SERVICES.filter(s => s.id !== params.service).slice(0, 6);

  const faq = buildFaq(service.nameCz, city.nameCz);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${service.nameCz} ${city.nameCz}`,
    description: `Seznam ${service.nameCz.toLowerCase()} v ${city.nameCz}`,
    numberOfItems: providers.length,
    itemListElement: providers.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LocalBusiness',
        name: p.fullName,
        url: `https://www.adressa.cz/providers/${p.id}`,
        ...(p.description && { description: p.description }),
        ...(p.phone && { telephone: p.phone }),
        address: {
          '@type': 'PostalAddress',
          ...(p.address && { streetAddress: p.address }),
          addressLocality: city.nameCz,
          addressCountry: 'CZ',
        },
      },
    })),
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-ink-lighter mb-6">
          <Link href="/" className="hover:text-brand">adressa.cz</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{service.nameCz} {city.nameCz}</span>
        </nav>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink">
            {service.icon} {service.nameCz} {city.nameCz}
          </h1>
          <p className="text-ink-light mt-2 max-w-2xl">
            Hledáte spolehlivého {service.nameCz.toLowerCase()} v {city.nameCz}? Níže najdete ověřené
            profesionály s kontakty a recenzemi. Pošlete poptávku přímo z profilu — zdarma.
          </p>
        </div>

        {/* Provider grid */}
        {providers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{service.icon}</div>
            <p className="text-xl font-semibold text-ink mb-2">Zatím žádné profily</p>
            <p className="text-ink-lighter text-sm mb-6">
              V této kategorii ještě nejsou registrovaní profesionálové. Buďte první!
            </p>
            <Link
              href="/register"
              className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Přidat svůj profil zdarma
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-lighter mb-6">{providers.length} profesionálů v databázi</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {providers.map(p => {
                const initials = (() => {
                  const parts = p.fullName.trim().split(' ');
                  return parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
                })();
                return (
                  <Link key={p.id} href={`/providers/${p.id}`} className="group block">
                    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden hover:-translate-y-0.5 ${p.featured ? 'border-yellow-400 ring-1 ring-yellow-400/30' : 'border-gray-200'}`}>
                      {p.featured && (
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-400 px-3 py-1 flex items-center gap-1.5">
                          <span className="text-xs">⭐</span>
                          <span className="text-xs font-bold text-yellow-900 uppercase tracking-wide">Zvýrazněný profil</span>
                        </div>
                      )}
                      <div className="bg-gray-50 p-6 flex justify-center border-b border-gray-100">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-md">
                          {p.picturePath ? (
                            <Image src={p.picturePath} alt={p.fullName} fill className="object-cover" sizes="96px" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center ${avatarColor(p.id)}`}>
                              <span className="text-white font-bold text-lg uppercase">{initials.toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h2 className="font-semibold text-ink text-base truncate group-hover:text-brand transition-colors">
                          {p.fullName}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-base">{service.icon}</span>
                          <span className="text-xs font-medium text-ink-light truncate">{service.nameCz}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-ink-lighter text-xs">
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="truncate">{city.nameCz}</span>
                        </div>
                        {p.description && (
                          <p className="text-xs text-ink-lighter mt-2 line-clamp-2 leading-relaxed">{p.description}</p>
                        )}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs font-semibold text-brand group-hover:underline">Zobrazit profil →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="mt-12 bg-brand-light border border-brand/20 rounded-2xl p-6 text-center">
          <p className="font-semibold text-ink mb-1">Jste {service.nameCz.toLowerCase()} v {city.nameCz}?</p>
          <p className="text-sm text-ink-light mb-4">Přidejte svůj profil a získejte nové zákazníky zdarma.</p>
          <Link
            href="/register"
            className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Přidat profil zdarma
          </Link>
        </div>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-ink mb-5">
            Časté otázky — {service.nameCz} {city.nameCz}
          </h2>
          <div className="space-y-4">
            {faq.map(({ q, a }) => (
              <div key={q} className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-ink mb-2">{q}</h3>
                <p className="text-sm text-ink-light leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal links — same service, other cities */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-ink mb-4">
            {service.nameCz} v jiných městech
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCities.map(c => (
              <Link
                key={c.id}
                href={`/${service.id}/${c.id}`}
                className="text-sm px-3 py-1.5 rounded-full bg-white border border-gray-200 text-ink-light hover:border-brand hover:text-brand transition-colors"
              >
                {service.nameCz} {c.nameCz}
              </Link>
            ))}
          </div>
        </section>

        {/* Internal links — other services, same city */}
        <section className="mt-8 mb-4">
          <h2 className="text-lg font-bold text-ink mb-4">
            Další služby v {city.nameCz}
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherServices.map(s => (
              <Link
                key={s.id}
                href={`/${s.id}/${city.id}`}
                className="text-sm px-3 py-1.5 rounded-full bg-white border border-gray-200 text-ink-light hover:border-brand hover:text-brand transition-colors"
              >
                {s.icon} {s.nameCz}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
