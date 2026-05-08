import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const req = await prisma.serviceRequest.findUnique({
    where: { id: params.id, active: true },
  });
  if (!req) return { title: 'adressa.cz' };

  const service = SERVICES.find(s => s.id === req.serviceId);
  const city = CITIES.find(c => c.id === req.cityId);
  const location = city ? ` — ${city.nameCz}` : '';
  const category = service ? ` [${service.nameCz}]` : '';

  const title = `${req.title}${category}${location} | adressa.cz`;
  const description = req.description
    ? req.description.slice(0, 160)
    : `Poptávka na adressa.cz${category}${location}. Reagujte na tuto nabídku přímo přes náš portál.`;

  return {
    title,
    description,
    openGraph: {
      title: req.title,
      description,
      url: `https://www.adressa.cz/poptavky/${req.id}`,
      siteName: 'adressa.cz',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: req.title,
      description,
    },
  };
}

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const req = await prisma.serviceRequest.findUnique({
    where: { id: params.id, active: true },
  });
  if (!req) notFound();

  const service = SERVICES.find(s => s.id === req.serviceId);
  const city = CITIES.find(c => c.id === req.cityId);
  const date = new Date(req.createdAt).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-brand">adressa.cz</Link>
          <span className="mx-2">/</span>
          <Link href="/poptavky" className="hover:text-brand">Poptávky</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600 truncate">{req.title}</span>
        </nav>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{req.title}</h1>

          {req.description && (
            <p className="text-gray-600 leading-relaxed mb-5">{req.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-5">
            {service && (
              <span className="inline-flex items-center text-xs bg-brand/10 text-brand font-medium px-3 py-1 rounded-full">
                {service.icon} {service.nameCz}
              </span>
            )}
            {city && (
              <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 font-medium px-3 py-1 rounded-full">
                📍 {city.nameCz}
              </span>
            )}
            {req.budget && (
              <span className="inline-flex items-center text-xs bg-green-50 text-green-700 font-medium px-3 py-1 rounded-full">
                💰 {req.budget}
              </span>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-sm text-gray-500">
            <span className="font-medium text-gray-800">{req.contactName}</span>
            <span>{date}</span>
          </div>

          {/* CTA */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">📩 Chcete reagovat na tuto poptávku?</p>
            <p className="text-xs mb-3 text-amber-700">
              Kontaktní údaje jsou dostupné registrovaným uživatelům s přístupovým kódem.
            </p>
            <Link
              href="/poptavky"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Zobrazit všechny poptávky →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
