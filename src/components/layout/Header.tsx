'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Header() {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname === href
          ? 'text-brand'
          : 'text-ink hover:text-brand'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-brand">adressa</span>
            <span className="text-ink">.cz</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLink('/', t.nav.home)}
          {navLink('/providers', t.nav.browse)}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
          >
            {t.nav.register}
          </Link>
        </div>
      </div>
    </header>
  );
}
