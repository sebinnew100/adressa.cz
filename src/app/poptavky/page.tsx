import { prisma } from '@/lib/db';
import { RequestsBoard } from '@/components/requests/RequestsBoard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Poptávky služeb | Service Requests | adressa.cz',
  description: 'Hledáte konkrétní službu? Přidejte poptávku a nechte profesionály kontaktovat vás. Looking for a service? Post a request and let professionals contact you.',
};

export default async function PoptavkyPage() {
  let raw;
  try {
    raw = await prisma.serviceRequest.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  } catch {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-medium">Poptávky se nepodařilo načíst.</p>
        <p className="text-gray-500 mt-2">Zkuste stránku prosím znovu načíst za chvíli.</p>
      </div>
    );
  }

  // Strip contact details from server render — only revealed after code verification
  const requests = raw.map(r => ({ ...r, contactPhone: null, contactEmail: null }));

  return <RequestsBoard requests={requests} />;
}
