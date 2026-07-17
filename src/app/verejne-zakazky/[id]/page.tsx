import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SERVICES } from '@/data/services';

export const dynamic = 'force-dynamic';

async function getNotice(id: string) {
  return prisma.procurementNotice.findUnique({ where: { externalId: id } });
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const notice = await getNotice(params.id);
  if (!notice) return { title: 'Zakázka nenalezena | adressa.cz' };
  return {
    title: `${notice.title} | Veřejné zakázky | adressa.cz`,
    description: notice.description ?? `Veřejná zakázka: ${notice.title}`,
  };
}

export default async function ProcurementDetailPage({ params }: { params: { id: string } }) {
  const notice = await getNotice(params.id);
  if (!notice) notFound();

  const serviceName = notice.relatedServiceId
    ? SERVICES.find(s => s.id === notice.relatedServiceId)?.nameCz
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-sm text-gray-400 mb-4">
        <Link href="/verejne-zakazky" className="hover:text-brand transition-colors">Veřejné zakázky</Link> / {notice.title}
      </p>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">{notice.title}</h1>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Zveřejněno</p>
          <p className="font-medium">
            {(notice.publishedAt ?? notice.createdAt).toLocaleDateString('cs-CZ', { dateStyle: 'long' })}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Kategorie</p>
          <p className="font-medium">{serviceName ?? notice.cpvCode ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Kraj</p>
          <p className="font-medium">{notice.regionCode ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Předpokládaná hodnota</p>
          <p className="font-medium">
            {notice.estimatedValue ? `${notice.estimatedValue.toLocaleString('cs-CZ')} Kč` : 'neurčeno'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Termín</p>
          <p className="font-medium">{notice.status ?? '—'}</p>
        </div>
      </div>

      {notice.description && (
        <div className="prose prose-sm max-w-none mb-6">
          <p>{notice.description}</p>
        </div>
      )}

      <div className="bg-brand/5 border border-brand/20 rounded-xl p-6 mb-6 text-center">
        <p className="font-semibold text-ink mb-1">Máte zájem o tuto zakázku?</p>
        <p className="text-sm text-gray-600 mb-4">
          Vytvořte si profil na adressa.cz a kontaktujte zadavatele přímo.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
        >
          Kontaktovat klienta
        </Link>
      </div>

      <p className="text-gray-400 text-xs">
        Přidáno na adressa.cz — {notice.createdAt.toLocaleDateString('cs-CZ', { dateStyle: 'long' })}
      </p>
    </div>
  );
}
