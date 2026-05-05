import { prisma } from '@/lib/db';
import { RequestsBoard } from '@/components/requests/RequestsBoard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Poptávky služeb | Service Requests | adressa.cz',
  description: 'Hledáte konkrétní službu? Přidejte poptávku a nechte profesionály kontaktovat vás. Looking for a service? Post a request and let professionals contact you.',
};

export default async function PoptavkyPage() {
  const requests = await prisma.serviceRequest.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return <RequestsBoard requests={requests} />;
}
