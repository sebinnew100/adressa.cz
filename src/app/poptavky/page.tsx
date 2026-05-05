import { prisma } from '@/lib/db';
import { RequestsBoard } from '@/components/requests/RequestsBoard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Poptávky služeb | Service Requests | adressa.cz',
  description: 'Hledáte konkrétní službu? Přidejte poptávku a nechte profesionály kontaktovat vás. Looking for a service? Post a request and let professionals contact you.',
};

export default async function PoptavkyPage() {
  const raw = await prisma.serviceRequest.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Strip contact details from server render — only revealed after code verification
  const requests = raw.map(r => ({ ...r, contactPhone: null, contactEmail: null }));

  return <RequestsBoard requests={requests} />;
}
