import React, { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

const STEPS = [
  'Reading meeting details',
  'Reading theme and vocabulary',
  'Reading role assignments',
  'Reading speaker information',
  'Building meeting agenda',
];

interface ExtractionProgressProps {
  currentStep: number; // 1-5, matches onProgress callback values
}

export const ExtractionProgress: React.FC<ExtractionProgressProps> = ({ currentStep }) => {
  const [visibleSteps, setVisibleSteps] = useState(0);

  // Stagger step appearance
  useEffect(() => {
    const t = setTimeout(() => {
      setVisibleSteps((prev) => Math.min(prev + 1, STEPS.length));
    }, 250);
    return () => clearTimeout(t);
  }, [visibleSteps]);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 space-y-8">
      {/* Animated orb */}
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg animate-pulse">
          <Loader2 className="w-9 h-9 text-white animate-spin" />
        </div>
        <div className="absolute -inset-2 rounded-[28px] bg-violet-300/20 dark:bg-violet-700/20 animate-ping" />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Reading your brochure...
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          TAG TEAM is analysing the meeting agenda
        </p>
      </div>

      {/* Steps list */}
      <div className="w-full max-w-xs space-y-3">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const visible = stepNum <= visibleSteps;
          const done = stepNum < currentStep;
          const active = stepNum === currentStep;

          return (
            <div
              key={step}
              className={`
                flex items-center gap-3 transition-all duration-500
                ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              `}
              style={{ transitionDelay: `${idx * 120}ms` }}
            >
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                  ${done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-violet-600 text-white ring-4 ring-violet-200 dark:ring-violet-900'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }
                `}
              >
                {done ? (
                  <Check className="w-3.5 h-3.5" />
                ) : active ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span className="text-[10px] font-bold">{stepNum}</span>
                )}
              </div>

              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  done
                    ? 'text-emerald-600 dark:text-emerald-400 line-through decoration-emerald-500/50'
                    : active
                    ? 'text-violet-700 dark:text-violet-300 font-bold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
