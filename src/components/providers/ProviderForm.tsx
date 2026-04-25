'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { CITIES } from '@/data/cities';
import { SERVICES } from '@/data/services';

export function ProviderForm() {
  const { language, t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white';
  const labelClass = 'block text-sm font-semibold text-ink mb-1.5';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/providers', {
        method: 'POST',
        body: new FormData(e.currentTarget),
      });

      if (res.status === 409) {
        setError(t.register.errorEmail);
        return;
      }
      if (!res.ok) throw new Error();

      const provider = await res.json();

      // Redirect to Stripe checkout
      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: provider.id }),
      });

      if (checkoutRes.status === 503) {
        setSuccess(true);
        setSubmitting(false);
        return;
      }
      if (!checkoutRes.ok) throw new Error();
      const { url } = await checkoutRes.json();
      window.location.href = url;
    } catch {
      setError(t.register.error);
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-12 text-center">
        <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-ink mb-2">{t.register.success}</h2>
        <p className="text-ink-light mb-6">{t.register.successSub}</p>

        {/* Boost visibility — only shown to the person who just registered */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            {language === 'cs' ? '⭐ Zvyšte viditelnost svého profilu' : '⭐ Increase your profile visibility'}
          </p>
          <p className="text-xs text-amber-700 mb-3">
            {language === 'cs'
              ? 'Chcete být vidět jako první? Kontaktujte nás pro zvýraznění vašeho profilu.'
              : 'Want to be seen first? Contact us to highlight your profile.'}
          </p>
          <div className="flex flex-col gap-1.5">
            <a href="mailto:customerserviceentfin@gmail.com" className="text-xs text-amber-900 font-medium hover:underline">
              ✉️ customerserviceentfin@gmail.com
            </a>
            <a href="tel:+420728415630" className="text-xs text-amber-900 font-medium hover:underline">
              📞 +420 728 415 630
            </a>
          </div>
        </div>

        <Link
          href="/providers"
          className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          {t.register.successBrowse}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-card p-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Profile photo */}
      <div>
        <label className={labelClass}>{t.register.picture}</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
            {preview ? (
              <Image src={preview} alt="preview" width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              {preview ? t.register.pictureChange : t.register.pictureSelect}
            </button>
            <p className="text-xs text-ink-lighter mt-0.5">{t.register.pictureHint}</p>
            <input
              ref={fileRef}
              type="file"
              name="picture"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>{t.register.fullName} *</label>
          <input
            type="text"
            name="fullName"
            required
            placeholder={t.register.placeholders.fullName}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t.register.email} *</label>
          <input
            type="email"
            name="email"
            required
            placeholder={t.register.placeholders.email}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            {t.register.phone}
            <span className="text-gray-400 font-normal text-xs ml-1">
              {language === 'cs' ? '(nepovinné)' : '(optional)'}
            </span>
          </label>
          <input
            type="tel"
            name="phone"
            placeholder={t.register.placeholders.phone}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t.register.service} *</label>
          <select name="serviceId" required className={inputClass}>
            <option value="">—</option>
            {SERVICES.map(s => (
              <option key={s.id} value={s.id}>
                {s.icon} {language === 'cs' ? s.nameCz : s.nameEn}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>
            {language === 'cs' ? 'Adresa ordinace / provozovny' : 'Business Address'}
            <span className="text-gray-400 font-normal text-xs ml-1">
              {language === 'cs' ? '(nepovinné)' : '(optional)'}
            </span>
          </label>
          <input
            type="text"
            name="address"
            placeholder={language === 'cs' ? 'Václavské nám. 1, Praha 1' : '123 Main St, Prague 1'}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>{t.register.city} *</label>
          <select name="cityId" required className={inputClass}>
            <option value="">—</option>
            {CITIES.map(c => (
              <option key={c.id} value={c.id}>
                {language === 'cs' ? c.nameCz : c.nameEn}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>{t.register.description}</label>
          <textarea
            name="description"
            rows={4}
            placeholder={t.register.descriptionHint}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition-colors text-base"
      >
        {submitting ? t.register.submitting : t.register.submit}
      </button>
    </form>
  );
}
