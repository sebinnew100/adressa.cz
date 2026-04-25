'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import type { Provider } from '@/types';

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

function Initials({ name }: { name: string }) {
  const p = name.trim().split(' ');
  return <>{p.length >= 2 ? p[0][0] + p[p.length - 1][0] : p[0].slice(0, 2)}</>;
}

function Stars({ rating, interactive = false, onSelect }: { rating: number; interactive?: boolean; onSelect?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type={interactive ? 'button' : undefined}
          onClick={() => interactive && onSelect?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer text-xl leading-none' : 'cursor-default text-base leading-none'}
        >
          <span className={(hovered || rating) >= n ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
}

const AD_SECONDS = 8;

function AdUnlockModal({ onUnlocked, language }: { onUnlocked: () => void; language: string }) {
  const [seconds, setSeconds] = useState(AD_SECONDS);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Fire the Monetag ad when the modal opens
    const script = document.createElement('script');
    script.src = 'https://quge5.com/88/tag.min.js';
    script.setAttribute('data-zone', '232297');
    script.setAttribute('data-cfasync', 'false');
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (seconds <= 0) { setDone(true); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {language === 'cs' ? 'Reklama' : 'Advertisement'}
          </span>
          {!done && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-mono">
              {seconds}s
            </span>
          )}
        </div>

        {/* Ad placeholder — replace this div with a real ad unit */}
        <div className="h-52 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center gap-3 px-6">
          <span className="text-4xl">🚀</span>
          <p className="text-white font-bold text-lg text-center">adressa.cz</p>
          <p className="text-white/80 text-sm text-center">
            {language === 'cs'
              ? 'Zvyšte viditelnost svého profilu — kontaktujte nás!'
              : 'Boost your profile visibility — contact us!'}
          </p>
          <p className="text-white/70 text-xs text-center">customerserviceentfin@gmail.com · +420 728 415 630</p>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-500 text-center mb-4">
            {done
              ? (language === 'cs' ? 'Reklama dokončena. Odemkněte kontakt.' : 'Ad finished. Unlock contact details.')
              : (language === 'cs' ? `Počkejte ${seconds} sekund…` : `Please wait ${seconds} seconds…`)}
          </p>
          <button
            disabled={!done}
            onClick={onUnlocked}
            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
          >
            {language === 'cs' ? '🔓 Zobrazit kontakt' : '🔓 Show contact info'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showAd, setShowAd] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const reviewFormRef = useRef<HTMLFormElement>(null);

  const [apptName, setApptName] = useState('');
  const [apptEmail, setApptEmail] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptAddress, setApptAddress] = useState('');
  const [apptMessage, setApptMessage] = useState('');
  const [apptSubmitting, setApptSubmitting] = useState(false);
  const [apptSuccess, setApptSuccess] = useState(false);
  const [apptError, setApptError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/providers/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => data && setProvider(data))
      .finally(() => setLoading(false));

    fetch(`/api/providers/${id}/reviews`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setReviews(data))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const handleUnlocked = () => {
    setUnlocked(true);
    setShowAd(false);
  };

  const handleApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApptSubmitting(true);
    setApptError('');
    const res = await fetch(`/api/providers/${id}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: apptName,
        customerEmail: apptEmail,
        customerPhone: apptPhone,
        customerAddress: apptAddress,
        message: apptMessage,
      }),
    });
    if (res.ok) {
      setApptSuccess(true);
      setApptName(''); setApptEmail(''); setApptPhone(''); setApptAddress(''); setApptMessage('');
    } else {
      setApptError(language === 'cs' ? 'Chyba při odesílání. Zkuste to znovu.' : 'Error sending. Please try again.');
    }
    setApptSubmitting(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) { setReviewError(language === 'cs' ? 'Vyberte hodnocení.' : 'Please select a rating.'); return; }
    setReviewSubmitting(true);
    setReviewError('');
    const res = await fetch(`/api/providers/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: reviewName, rating: reviewRating, comment: reviewComment }),
    });
    if (res.ok) {
      const newReview = await res.json();
      setReviews(prev => [newReview, ...prev]);
      setReviewName('');
      setReviewRating(0);
      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } else {
      setReviewError(language === 'cs' ? 'Chyba při odesílání. Zkuste to znovu.' : 'Error submitting. Try again.');
    }
    setReviewSubmitting(false);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const service = provider ? SERVICES.find(s => s.id === provider.serviceId) : null;
  const city = provider ? CITIES.find(c => c.id === provider.cityId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      {showAd && <AdUnlockModal onUnlocked={handleUnlocked} language={language} />}

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-ink-light hover:text-brand transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.provider.back}
        </button>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 h-96 animate-pulse" />
        ) : notFound || !provider ? (
          <div className="text-center py-24">
            <p className="text-xl font-semibold text-ink">{t.provider.notFound}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
              {/* Banner */}
              <div className="h-32 bg-gradient-to-r from-[#1e3a2f] to-brand" />

              <div className="px-8 pb-8">
                {/* Avatar */}
                <div className="relative -mt-14 mb-4 flex items-end justify-between">
                  <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-violet-500 flex items-center justify-center">
                    {provider.picturePath ? (
                      <Image src={provider.picturePath} alt={provider.fullName} width={112} height={112} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-white font-bold text-3xl uppercase">
                        <Initials name={provider.fullName} />
                      </span>
                    )}
                  </div>
                  {avgRating && (
                    <div className="mb-1 flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="font-bold text-sm text-yellow-700">{avgRating}</span>
                      <span className="text-xs text-yellow-600">({reviews.length})</span>
                    </div>
                  )}
                </div>

                {/* Name & badges */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-ink">{provider.fullName}</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {service && (
                      <span className="inline-flex items-center gap-1.5 bg-brand-light text-brand text-sm font-semibold px-3 py-1 rounded-full">
                        {service.icon} {language === 'cs' ? service.nameCz : service.nameEn}
                      </span>
                    )}
                    {city && (
                      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-ink-light text-sm font-medium px-3 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {language === 'cs' ? city.nameCz : city.nameEn}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {provider.description && (
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-ink uppercase tracking-wide mb-3">{t.provider.description}</h2>
                    <p className="text-ink-light text-sm leading-relaxed whitespace-pre-line">{provider.description}</p>
                  </div>
                )}

                {/* Contact — locked or unlocked */}
                <div>
                  <h2 className="text-sm font-bold text-ink uppercase tracking-wide mb-4">{t.provider.contact}</h2>

                  {unlocked ? (
                    <>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-ink-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <a href={`mailto:${provider.email}`} className="text-brand hover:underline truncate">{provider.email}</a>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-ink-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <a href={`tel:${provider.phone}`} className="text-brand hover:underline">{provider.phone}</a>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a href={`mailto:${provider.email}`} className="flex-1 bg-brand hover:bg-brand-hover text-white font-semibold text-center py-3 rounded-lg transition-colors">
                          {t.provider.sendEmail}
                        </a>
                        <a href={`tel:${provider.phone}`} className="flex-1 border-2 border-brand text-brand hover:bg-brand-light font-semibold text-center py-3 rounded-lg transition-colors">
                          {t.provider.callNow}
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center gap-3 text-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl">🔒</div>
                      <div>
                        <p className="font-semibold text-ink text-sm">
                          {language === 'cs' ? 'Kontaktní údaje jsou skryté' : 'Contact details are hidden'}
                        </p>
                        <p className="text-xs text-ink-lighter mt-1">
                          {language === 'cs'
                            ? 'Zhlédněte krátkou reklamu a odemkněte telefon a e-mail zdarma.'
                            : 'Watch a short ad to unlock phone & email for free.'}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAd(true)}
                        className="mt-1 bg-brand hover:bg-brand-hover text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
                      >
                        {language === 'cs' ? '▶ Zhlédnout reklamu a odemknout' : '▶ Watch ad & unlock'}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Appointment request section */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-card p-6 sm:p-8">
              <h2 className="text-lg font-bold text-ink mb-1">
                {language === 'cs' ? '📅 Poptávka schůzky' : '📅 Request Appointment'}
              </h2>
              <p className="text-sm text-ink-light mb-6">
                {language === 'cs'
                  ? 'Vyplňte své kontaktní údaje a odešlete zprávu přímo profesionálovi.'
                  : 'Fill in your details and send a message directly to the professional.'}
              </p>

              {apptSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4 text-sm font-medium">
                  {language === 'cs'
                    ? '✅ Vaše poptávka byla odeslána! Profesionál se vám brzy ozve.'
                    : '✅ Your request was sent! The professional will get back to you soon.'}
                </div>
              ) : (
                <form onSubmit={handleApptSubmit} className="space-y-4">
                  {apptError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">{apptError}</div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-ink-light mb-1.5">
                        {language === 'cs' ? 'Vaše jméno *' : 'Your name *'}
                      </label>
                      <input type="text" required value={apptName} onChange={e => setApptName(e.target.value)}
                        placeholder={language === 'cs' ? 'Jan Novák' : 'John Doe'}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand text-ink placeholder-gray-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-light mb-1.5">
                        {language === 'cs' ? 'Váš e-mail *' : 'Your email *'}
                      </label>
                      <input type="email" required value={apptEmail} onChange={e => setApptEmail(e.target.value)}
                        placeholder="jan@email.cz"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand text-ink placeholder-gray-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-light mb-1.5">
                        {language === 'cs' ? 'Telefon *' : 'Phone *'}
                      </label>
                      <input type="tel" required value={apptPhone} onChange={e => setApptPhone(e.target.value)}
                        placeholder="+420 777 123 456"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand text-ink placeholder-gray-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-light mb-1.5">
                        {language === 'cs' ? 'Adresa' : 'Address'}
                        <span className="text-gray-400 ml-1">{language === 'cs' ? '(nepovinné)' : '(optional)'}</span>
                      </label>
                      <input type="text" value={apptAddress} onChange={e => setApptAddress(e.target.value)}
                        placeholder={language === 'cs' ? 'Václavské nám. 1, Praha' : '123 Main St, Prague'}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand text-ink placeholder-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-light mb-1.5">
                      {language === 'cs' ? 'Zpráva' : 'Message'}
                      <span className="text-gray-400 ml-1">{language === 'cs' ? '(nepovinné)' : '(optional)'}</span>
                    </label>
                    <textarea rows={3} value={apptMessage} onChange={e => setApptMessage(e.target.value)}
                      placeholder={language === 'cs' ? 'Popište, co potřebujete…' : 'Describe what you need…'}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none text-ink placeholder-gray-400" />
                  </div>
                  <button type="submit" disabled={apptSubmitting}
                    className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm">
                    {apptSubmitting
                      ? (language === 'cs' ? 'Odesílám…' : 'Sending…')
                      : (language === 'cs' ? '📤 Odeslat poptávku' : '📤 Send Request')}
                  </button>
                </form>
              )}
            </div>

            {/* Reviews section */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-card p-6 sm:p-8">
              <h2 className="text-lg font-bold text-ink mb-6">
                {language === 'cs' ? '⭐ Hodnocení' : '⭐ Reviews'}
                {reviews.length > 0 && <span className="text-gray-400 font-normal text-base ml-2">({reviews.length})</span>}
              </h2>

              {/* Review form */}
              <form ref={reviewFormRef} onSubmit={handleReviewSubmit} className="mb-8 pb-8 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-ink mb-4">
                  {language === 'cs' ? 'Napsat hodnocení' : 'Write a review'}
                </h3>

                {reviewSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
                    {language === 'cs' ? '✅ Hodnocení bylo odesláno. Děkujeme!' : '✅ Review submitted. Thank you!'}
                  </div>
                )}
                {reviewError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">{reviewError}</div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-light mb-1.5">
                      {language === 'cs' ? 'Vaše jméno *' : 'Your name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={e => setReviewName(e.target.value)}
                      maxLength={80}
                      placeholder={language === 'cs' ? 'Jan Novák' : 'John Doe'}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand text-ink placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-light mb-2">
                      {language === 'cs' ? 'Hodnocení *' : 'Rating *'}
                    </label>
                    <Stars rating={reviewRating} interactive onSelect={setReviewRating} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-light mb-1.5">
                      {language === 'cs' ? 'Komentář (nepovinné)' : 'Comment (optional)'}
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      maxLength={500}
                      placeholder={language === 'cs' ? 'Sdělte svůj zážitek…' : 'Share your experience…'}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none text-ink placeholder-gray-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm"
                  >
                    {reviewSubmitting
                      ? (language === 'cs' ? 'Odesílám…' : 'Submitting…')
                      : (language === 'cs' ? 'Odeslat hodnocení' : 'Submit review')}
                  </button>
                </div>
              </form>

              {/* Reviews list */}
              {reviewsLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {language === 'cs' ? 'Načítám hodnocení…' : 'Loading reviews…'}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {language === 'cs' ? 'Zatím žádná hodnocení. Buďte první!' : 'No reviews yet. Be the first!'}
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map(review => (
                    <div key={review.id} className="flex gap-4">
                      <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0 text-brand font-bold text-sm uppercase">
                        {review.authorName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-ink">{review.authorName}</span>
                          <Stars rating={review.rating} />
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-GB')}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-ink-light mt-1 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
