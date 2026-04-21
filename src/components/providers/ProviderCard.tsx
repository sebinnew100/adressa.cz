'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import type { Provider } from '@/types';

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return (
    <span className="text-white font-bold text-lg uppercase">{initials}</span>
  );
}

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
];

function avatarColor(id: string) {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ProviderCard({ provider }: { provider: Provider }) {
  const { language, t } = useLanguage();
  const service = SERVICES.find(s => s.id === provider.serviceId);
  const city = CITIES.find(c => c.id === provider.cityId);

  return (
    <Link href={`/providers/${provider.id}`} className="group block">
      <div className={`bg-white rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden hover:-translate-y-0.5 ${
        provider.featured ? 'border-yellow-400 ring-1 ring-yellow-400/30' : 'border-gray-200'
      }`}>
        {/* Featured banner */}
        {provider.featured && (
          <div className="bg-gradient-to-r from-yellow-400 to-amber-400 px-3 py-1 flex items-center gap-1.5">
            <span className="text-xs">⭐</span>
            <span className="text-xs font-bold text-yellow-900 uppercase tracking-wide">
              {language === 'cs' ? 'Zvýrazněný profil' : 'Featured'}
            </span>
          </div>
        )}
        {/* Avatar area */}
        <div className="bg-gray-50 p-6 flex justify-center border-b border-gray-100">
          <div className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-md">
            {provider.picturePath ? (
              <Image
                src={provider.picturePath}
                alt={provider.fullName}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${avatarColor(provider.id)}`}>
                <Initials name={provider.fullName} />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-ink text-base truncate group-hover:text-brand transition-colors">
            {provider.fullName}
          </h3>

          {service && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-base">{service.icon}</span>
              <span className="text-xs font-medium text-ink-light truncate">
                {language === 'cs' ? service.nameCz : service.nameEn}
              </span>
            </div>
          )}

          {city && (
            <div className="flex items-center gap-1 mt-1 text-ink-lighter text-xs">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{language === 'cs' ? city.nameCz : city.nameEn}</span>
            </div>
          )}

          {provider.description && (
            <p className="text-xs text-ink-lighter mt-2 line-clamp-2 leading-relaxed">
              {provider.description}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs font-semibold text-brand group-hover:underline">
              {t.providers.viewProfile} →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
