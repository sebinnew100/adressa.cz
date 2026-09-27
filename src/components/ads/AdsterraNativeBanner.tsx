'use client';

import { useEffect } from 'react';

const CONTAINER_ID = 'container-a4abcae5c5068b5f8da01ef0c6f5b7de';

export function AdsterraNativeBanner() {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl31543562.profitableratecpmnetwork.com/a4abcae5c5068b5f8da01ef0c6f5b7de/invoke.js';
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return <div id={CONTAINER_ID} className="col-span-full" />;
}
