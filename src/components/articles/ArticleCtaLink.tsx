'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export function ArticleCtaLink({
  slug,
  href,
  className,
  children,
}: {
  slug: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const track = () => {
    fetch('/api/articles/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <Link href={href} className={className} onClick={track}>
      {children}
    </Link>
  );
}
