'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { RequestForm } from './RequestForm';

export function RequestFormWrapper() {
  const { language } = useLanguage();
  const isCz = language === 'cs';

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">
          {isCz ? 'Přidat poptávku' : 'Post a Request'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isCz
            ? 'Popište, co hledáte, a profesionálové vás sami kontaktují.'
            : 'Describe what you need and professionals will contact you.'}
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <RequestForm />
      </div>
    </main>
  );
}
