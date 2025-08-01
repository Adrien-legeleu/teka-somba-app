'use client';

import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { title: 'Informations', subtitle: 'Titre et description' },
  { title: 'Détails', subtitle: 'Prix et spécificités' },
  { title: 'Photos', subtitle: "Images de l'annonce" },
  { title: 'Contact', subtitle: 'Vos coordonnées' },
  { title: 'Aperçu', subtitle: 'Validation finale' },
];

export default function StepProgressBar({ step }: { step: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeStepRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      window.innerWidth < 768 &&
      containerRef.current &&
      activeStepRef.current
    ) {
      const container = containerRef.current;
      const active = activeStepRef.current;
      const offsetLeft =
        active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
      container.scrollTo({ left: offsetLeft, behavior: 'smooth' });
    }
  }, [step]);

  return (
    <div className="flex flex-col items-center px-4 pt-4 pb-8">
      <h2 className="text-lg md:text-xl font-semibold text-gray-700 text-center">
        Vendez facilement vos objets en quelques étapes
      </h2>

      <div
        ref={containerRef}
        className="mt-6 flex w-full max-w-5xl overflow-x-auto no-scrollbar md:overflow-visible"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex w-full min-w-[600px] md:min-w-0 justify-between px-2">
          {steps.map((s, i) => {
            const index = i + 1;
            const isCompleted = index < step;
            const isCurrent = index === step;

            return (
              <div
                key={i}
                ref={isCurrent ? activeStepRef : null}
                className="flex flex-col items-center flex-1 min-w-[100px] relative"
              >
                {/* Ligne gauche */}
                {i > 0 && (
                  <div
                    className={cn(
                      'absolute left-0 top-5 h-1 w-1/2',
                      index <= step ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
                {/* Ligne droite */}
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute right-0 top-5 h-1 w-1/2',
                      index < step ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
                {/* Pastille */}
                <div
                  className={cn(
                    'z-10 flex items-center justify-center h-10 w-10 rounded-full font-bold shadow',
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted ? <Check size={18} /> : index}
                </div>

                {/* Titres */}
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-800">
                    {s.title}
                  </div>
                  <div className="text-xs text-gray-500">{s.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
