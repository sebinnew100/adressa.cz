import { RequestForm } from '@/components/requests/RequestForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nová poptávka | adressa.cz',
  description: 'Přidejte poptávku a nechte kvalifikované profesionály, aby vás sami kontaktovali.',
};

export default function NovaPoptavkaPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Přidat poptávku</h1>
        <p className="text-gray-500 mt-1">
          Popište, co hledáte, a profesionálové vás sami kontaktují.
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <RequestForm />
      </div>
    </main>
  );
}
