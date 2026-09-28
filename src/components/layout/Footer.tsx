'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERVICES } from '@/data/services';

export function Footer() {
  const { language, t } = useLanguage();
  const year = new Date().getFullYear();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterState, setNewsletterState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterState('submitting');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, consent: newsletterConsent, source: 'footer' }),
      });
      if (!res.ok) { setNewsletterState('error'); return; }
      setNewsletterState('success');
    } catch {
      setNewsletterState('error');
    }
  };

  return (
    <footer className="bg-[#404145] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <span className="text-xl font-bold">
                <span className="text-brand">adressa</span>
                <span className="text-white">.cz</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">{t.footer.tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-brand transition-colors">{t.footer.links.home}</Link></li>
              <li><Link href="/providers" className="hover:text-brand transition-colors">{t.footer.links.browse}</Link></li>
              <li><Link href="/register" className="hover:text-brand transition-colors">{t.footer.links.register}</Link></li>
              <li><Link href="/poptavky" className="hover:text-brand transition-colors">{t.footer.links.requests}</Link></li>
              <li><Link href="/faq" className="hover:text-brand transition-colors">{t.footer.links.faq}</Link></li>
              <li><Link href="/o-nas" className="hover:text-brand transition-colors">{language === 'cs' ? 'O nás' : 'About Us'}</Link></li>
              <li><Link href="/kontakt" className="hover:text-brand transition-colors">{language === 'cs' ? 'Kontakt' : 'Contact Us'}</Link></li>
            </ul>
          </div>

          {/* Popular Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t.footer.popularServices}
            </h4>
            <ul className="space-y-2 text-sm">
              {SERVICES.slice(0, 6).map(s => (
                <li key={s.id}>
                  <Link
                    href={`/providers?service=${s.id}`}
                    className="hover:text-brand transition-colors"
                  >
                    {language === 'cs' ? s.nameCz : s.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t.footer.contact}
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <p className="text-gray-500 text-xs mb-1">
                  {language === 'cs' ? 'Zákaznická podpora' : 'Customer support'}
                </p>
                <a href="mailto:customerserviceentfin@gmail.com" className="hover:text-brand transition-colors break-all">
                  customerserviceentfin@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+420728415630" className="hover:text-brand transition-colors">
                  +420 728 415 630
                </a>
              </li>
              <li className="pt-1 text-xs text-gray-500 leading-relaxed">
                {language === 'cs'
                  ? 'Chcete zvýšit viditelnost vašeho profilu? Kontaktujte nás.'
                  : 'Want to boost your listing visibility? Contact us.'}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-10 pt-8 max-w-md mx-auto text-center">
          <h4 className="text-white font-semibold mb-2 text-sm">
            {language === 'cs' ? 'Odebírejte novinky' : 'Subscribe to updates'}
          </h4>
          {newsletterState === 'success' ? (
            <p className="text-sm text-brand">
              {language === 'cs' ? 'Děkujeme za přihlášení!' : 'Thanks for subscribing!'}
            </p>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder={language === 'cs' ? 'Váš e-mail' : 'Your email'}
                  className="flex-1 rounded-lg px-3 py-2 text-sm text-ink bg-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                  type="submit"
                  disabled={newsletterState === 'submitting' || !newsletterConsent}
                  className="bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  {newsletterState === 'submitting'
                    ? (language === 'cs' ? 'Odesílám…' : 'Submitting…')
                    : (language === 'cs' ? 'Přihlásit se' : 'Subscribe')}
                </button>
              </div>
              <label className="flex items-start gap-2 text-xs text-gray-400 text-left">
                <input
                  type="checkbox"
                  required
                  checked={newsletterConsent}
                  onChange={e => setNewsletterConsent(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  {language === 'cs'
                    ? 'Souhlasím se zasíláním e-mailových novinek od adressa.cz. Odběr mohu kdykoliv zrušit.'
                    : 'I agree to receive marketing emails from adressa.cz. I can unsubscribe at any time.'}
                  {' '}
                  <Link href="/ochrana-osobnich-udaju" className="underline hover:text-brand">
                    {language === 'cs' ? 'Ochrana osobních údajů' : 'Privacy Policy'}
                  </Link>
                </span>
              </label>
              {newsletterState === 'error' && (
                <p className="text-xs text-red-400">
                  {language === 'cs' ? 'Něco se pokazilo, zkuste to prosím znovu.' : 'Something went wrong, please try again.'}
                </p>
              )}
            </form>
          )}
        </div>

        <div className="border-t border-gray-600 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center text-xs text-gray-500">
          <span>© {year} adressa.cz — {t.footer.rights}</span>
          <Link href="/o-nas" className="hover:text-brand transition-colors">
            {language === 'cs' ? 'O nás' : 'About Us'}
          </Link>
          <Link href="/kontakt" className="hover:text-brand transition-colors">
            {language === 'cs' ? 'Kontakt' : 'Contact Us'}
          </Link>
          <Link href="/obchodni-podminky" className="hover:text-brand transition-colors">
            {language === 'cs' ? 'Obchodní podmínky' : 'Terms & Conditions'}
          </Link>
          <Link href="/ochrana-osobnich-udaju" className="hover:text-brand transition-colors">
            {language === 'cs' ? 'Ochrana osobních údajů' : 'Privacy Policy'}
          </Link>
        </div>
      </div>
    </footer>
  );
}
