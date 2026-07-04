import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Články | adressa.cz',
  description: 'Rady a tipy pro výběr místních řemeslníků a odborníků v České republice.',
};

export default async function ClankyPage() {
  let articles;
  try {
    articles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-medium">Články se nepodařilo načíst.</p>
        <p className="text-gray-500 mt-2">Zkuste stránku prosím znovu načíst za chvíli.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-ink mb-2">Články</h1>
      <p className="text-gray-500 mb-10">Rady a tipy pro výběr místních řemeslníků a odborníků.</p>

      {articles.length === 0 ? (
        <p className="text-gray-500 py-16 text-center">Zatím tu nejsou žádné články.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(a => (
            <Link
              key={a.id}
              href={`/clanky/${a.slug}`}
              className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-100 overflow-hidden">
                {a.coverImagePath && (
                  <Image
                    src={a.coverImagePath}
                    alt={a.title}
                    width={400}
                    height={225}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="p-5">
                <h2 className="font-bold text-lg text-ink group-hover:text-brand transition-colors line-clamp-2">
                  {a.title}
                </h2>
                {a.excerpt && (
                  <p className="text-gray-500 text-sm mt-2 line-clamp-3">{a.excerpt}</p>
                )}
                <p className="text-gray-400 text-xs mt-4">
                  {new Date(a.createdAt).toLocaleDateString('cs-CZ')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
