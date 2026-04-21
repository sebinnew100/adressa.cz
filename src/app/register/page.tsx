'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProviderForm } from '@/components/providers/ProviderForm';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink">{t.register.title}</h1>
          <p className="text-ink-light mt-2">{t.register.subtitle}</p>
        </div>

        <ProviderForm />
      </main>
      <Footer />
    </div>
  );
}
