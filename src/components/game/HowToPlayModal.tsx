'use client';

import { useState } from 'react';

interface Step {
  icon: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: '📍',
    title: 'Povolte polohu',
    body: 'Povolte přístup k poloze, abyste na mapě viděli mise a restaurace ve svém okolí. Není to povinné, ale usnadní vám to hledání.',
  },
  {
    icon: '🗺️',
    title: 'Prozkoumejte mapu',
    body: 'Procházejte mapu nebo seznam misí pod ní. Každá mise patří ke skutečné restauraci a má u sebe odměnu v bodech a časový limit.',
  },
  {
    icon: '🧾',
    title: 'Navštivte a vyfoťte',
    body: 'Vyberte misi, jděte do dané restaurace, něco si tam kupte a vyfoťte účtenku nebo produkt jako důkaz nákupu.',
  },
  {
    icon: '✅',
    title: 'Odešlete ke schválení',
    body: 'Nahrajte fotku v aplikaci. Odeslání ručně zkontroluje admin — nepravé nebo upravené fotky vedou k zamítnutí.',
  },
  {
    icon: '💰',
    title: 'Získejte odměnu',
    body: 'Po schválení získáte body podle mise (běžná mise i desítky bodů, Grand Challenge až 500 bodů). 1000 bodů = 200 Kč, vyplaceno ručně.',
  },
];

export function HowToPlayModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[10000]">
      <div className="relative bg-gray-900 border border-purple-700/50 rounded-2xl p-6 max-w-sm w-full game-glow-header">
        <button
          onClick={onClose}
          aria-label="Zavřít"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-lg leading-none transition-colors"
        >
          ✕
        </button>

        <p className="text-center text-purple-400 font-bold text-xs tracking-wide mb-1">
          JAK HRÁT · KROK {step + 1} Z {STEPS.length}
        </p>

        <div className="text-center py-4">
          <div className="text-5xl mb-3">{current.icon}</div>
          <h2 className="text-xl font-bold text-white mb-2">{current.title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{current.body}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 my-4">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-purple-500' : 'w-1.5 bg-gray-700'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-semibold"
            >
              ‹ Zpět
            </button>
          )}
          <button
            onClick={() => (isLast ? onClose() : setStep(s => s + 1))}
            className="flex-1 bg-brand hover:bg-brand-hover text-white font-bold py-2.5 rounded-lg transition-colors"
          >
            {isLast ? 'Pojďme hrát! ▶' : 'Další →'}
          </button>
        </div>
      </div>
    </div>
  );
}
