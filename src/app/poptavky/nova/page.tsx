import { RequestFormWrapper } from '@/components/requests/RequestFormWrapper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Přidat poptávku | Post a Request | adressa.cz',
  description: 'Přidejte poptávku a nechte kvalifikované profesionály, aby vás sami kontaktovali. Post a request and let qualified professionals contact you.',
};

export default function NovaPoptavkaPage() {
  return <RequestFormWrapper />;
}
