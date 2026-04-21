'use client';

import { useLanguage } from '@/contexts/LanguageContext';

const steps = [
  {
    number: '1',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: '2',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    number: '3',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  const { t } = useLanguage();

  const stepData = [
    { title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc },
    { title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc },
    { title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-ink mb-12">{t.howItWorks.title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-brand/20" />

          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16 bg-brand-light rounded-full flex items-center justify-center text-brand z-10">
                {step.icon}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-ink text-lg mb-1">{stepData[i].title}</h3>
                <p className="text-ink-lighter text-sm">{stepData[i].desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
