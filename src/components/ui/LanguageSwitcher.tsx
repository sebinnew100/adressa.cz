'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-full border border-gray-200 overflow-hidden text-sm font-medium">
      <button
        onClick={() => setLanguage('cs')}
        className={`px-3 py-1.5 transition-colors ${
          language === 'cs'
            ? 'bg-brand text-white'
            : 'bg-white text-ink-light hover:bg-gray-50'
        }`}
      >
        CS
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 transition-colors ${
          language === 'en'
            ? 'bg-brand text-white'
            : 'bg-white text-ink-light hover:bg-gray-50'
        }`}
      >
        EN
      </button>
    </div>
  );
}
