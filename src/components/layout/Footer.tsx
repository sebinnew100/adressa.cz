'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERVICES } from '@/data/services';

export function Footer() {
  const { language, t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#404145] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <span className="text-xl font-bold">
                <span className="text-brand">adresar</span>
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
            <ul className="space-y-2 text-sm text-gray-400">
              <li>info@adresar.cz</li>
              <li>+420 800 000 000</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-10 pt-6 text-center text-xs text-gray-500">
          © {year} adresar.cz — {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
