'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import { useLanguage } from '@/contexts/LanguageContext';

export function RequestForm() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const data = {
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      serviceId: (form.elements.namedItem('serviceId') as HTMLSelectElement).value,
      cityId: (form.elements.namedItem('cityId') as HTMLSelectElement).value,
      contactName: (form.elements.namedItem('contactName') as HTMLInputElement).value,
      contactEmail: (form.elements.namedItem('contactEmail') as HTMLInputElement).value,
      contactPhone: (form.elements.namedItem('contactPhone') as HTMLInputElement).value,
      budget: (form.elements.namedItem('budget') as HTMLInputElement).value,
    };

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || (language === 'cs' ? 'Nastala chyba.' : 'Something went wrong.'));
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/poptavky'), 2000);
      }
    } catch {
      setError(language === 'cs' ? 'Nastala chyba.' : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-ink mb-2">
          {language === 'cs' ? 'Poptávka byla zveřejněna!' : 'Request published!'}
        </h2>
        <p className="text-gray-500">
          {language === 'cs' ? 'Přesměrováváme vás na seznam poptávek…' : 'Redirecting to the board…'}
        </p>
      </div>
    );
  }

  const label = 'block text-sm font-medium text-ink mb-1';
  const input = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className={label}>
          {language === 'cs' ? 'Co hledáte? *' : 'What do you need? *'}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder={language === 'cs' ? 'např. Učitel angličtiny pro děti' : 'e.g. English teacher for kids'}
          className={input}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="serviceId" className={label}>
            {language === 'cs' ? 'Kategorie' : 'Category'}
          </label>
          <select id="serviceId" name="serviceId" className={input}>
            <option value="">{language === 'cs' ? '— Vyberte kategorii —' : '— Select category —'}</option>
            {SERVICES.map(s => (
              <option key={s.id} value={s.id}>
                {language === 'cs' ? s.nameCz : s.nameEn}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cityId" className={label}>
            {language === 'cs' ? 'Město' : 'City'}
          </label>
          <select id="cityId" name="cityId" className={input}>
            <option value="">{language === 'cs' ? '— Vyberte město —' : '— Select city —'}</option>
            {CITIES.map(c => (
              <option key={c.id} value={c.id}>
                {language === 'cs' ? c.nameCz : c.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={label}>
          {language === 'cs' ? 'Popis poptávky' : 'Description'}
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder={language === 'cs'
            ? 'Přidejte podrobnosti — kdy, jak často, jaké máte požadavky...'
            : 'Add details — when, how often, what are your requirements...'}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="budget" className={label}>
          {language === 'cs' ? 'Přibližný rozpočet' : 'Approximate budget'}
        </label>
        <input
          id="budget"
          name="budget"
          type="text"
          placeholder={language === 'cs' ? 'např. 500 Kč/hod nebo dohodou' : 'e.g. 500 CZK/hr or negotiable'}
          className={input}
        />
      </div>

      <hr className="border-gray-200" />

      <div>
        <label htmlFor="contactName" className={label}>
          {language === 'cs' ? 'Vaše jméno *' : 'Your name *'}
        </label>
        <input
          id="contactName"
          name="contactName"
          type="text"
          required
          placeholder={language === 'cs' ? 'Jan Novák' : 'Jane Smith'}
          className={input}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contactEmail" className={label}>
            {language === 'cs' ? 'E-mail' : 'Email'}
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="jan@email.cz"
            className={input}
          />
        </div>
        <div>
          <label htmlFor="contactPhone" className={label}>
            {language === 'cs' ? 'Telefon' : 'Phone'}
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            placeholder="+420 777 123 456"
            className={input}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-md transition-colors disabled:opacity-60"
      >
        {loading
          ? (language === 'cs' ? 'Ukládám…' : 'Saving…')
          : (language === 'cs' ? 'Zveřejnit poptávku' : 'Post Request')}
      </button>
    </form>
  );
}
