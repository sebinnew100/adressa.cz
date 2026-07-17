import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SERVICES } from '@/data/services';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Veřejné zakázky | adressa.cz',
  description: 'Aktuální veřejné zakázky v České republice pro živnostníky a firmy — stavebnictví, IT, zahradní služby a další kategorie.',
};

export default async function VerejneZakazkyPage() {
  let notices;
  try {
    notices = await prisma.procurementNotice.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  } catch {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-medium">Veřejné zakázky se nepodařilo načíst.</p>
        <p className="text-gray-500 mt-2">Zkuste stránku prosím znovu načíst za chvíli.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Veřejné zakázky</h1>
      <p className="text-gray-500 mb-8">
        Aktuální veřejné zakázky v České republice — příležitosti pro živnostníky a firmy v oborech stavebnictví, IT, zahradní služby a další.
      </p>

      {notices.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Momentálně nejsou k dispozici žádné zakázky.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 pr-4">Datum</th>
                <th className="py-3 pr-4">Zakázka</th>
                <th className="py-3 pr-4">Kategorie</th>
                <th className="py-3 pr-4">Kraj</th>
                <th className="py-3 pr-4">Hodnota</th>
                <th className="py-3 pr-4">Termín</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notices.map(n => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                    {(n.publishedAt ?? n.createdAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 pr-4">
                    <Link href={`/verejne-zakazky/${n.externalId}`} className="text-brand hover:underline font-medium">
                      {n.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {n.relatedServiceId
                      ? SERVICES.find(s => s.id === n.relatedServiceId)?.nameCz ?? n.cpvCode
                      : n.cpvCode ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{n.regionCode ?? '—'}</td>
                  <td className="py-3 pr-4 text-gray-600">
                    {n.estimatedValue ? `${n.estimatedValue.toLocaleString('cs-CZ')} Kč` : 'neurčeno'}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{n.status ?? '—'}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <Link
                      href="/register"
                      className="inline-flex items-center bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                    >
                      Kontaktovat klienta
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
