import React from 'react';
import type { TimingSignal } from '../../types';
import { formatTime } from '../../utils/formatting';

interface TimerSignalsProps {
  signalState: TimingSignal;
  allocatedMin: number;
  allocatedMax: number;
  warningTime?: number;
}

export const TimerSignals: React.FC<TimerSignalsProps> = ({
  signalState,
  allocatedMin,
  allocatedMax,
  warningTime,
}) => {
  const yellowTime = warningTime ?? Math.floor((allocatedMin + allocatedMax) / 2);

  const signals = [
    {
      id: 'green',
      label: 'Green',
      time: formatTime(allocatedMin),
      desc: 'Min Time',
      isActive: signalState === 'green' || signalState === 'yellow' || signalState === 'red' || signalState === 'over',
      isCurrent: signalState === 'green',
      activeBg: 'bg-emerald-500 text-white shadow-glow-green ring-2 ring-emerald-400',
      idleBg: 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200 dark:border-slate-700',
      dotColor: 'bg-emerald-500',
    },
    {
      id: 'yellow',
      label: 'Yellow',
      time: formatTime(yellowTime),
      desc: 'Warning',
      isActive: signalState === 'yellow' || signalState === 'red' || signalState === 'over',
      isCurrent: signalState === 'yellow',
      activeBg: 'bg-amber-500 text-slate-950 shadow-glow-yellow ring-2 ring-amber-400',
      idleBg: 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200 dark:border-slate-700',
      dotColor: 'bg-amber-500',
    },
    {
      id: 'red',
      label: 'Red',
      time: formatTime(allocatedMax),
      desc: 'Max Time',
      isActive: signalState === 'red' || signalState === 'over',
      isCurrent: signalState === 'red' || signalState === 'over',
      activeBg: signalState === 'over'
        ? 'bg-rose-600 text-white shadow-glow-red ring-2 ring-rose-400 animate-pulse'
        : 'bg-rose-500 text-white shadow-glow-red ring-2 ring-rose-400',
      idleBg: 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200 dark:border-slate-700',
      dotColor: 'bg-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
      {signals.map((sig) => (
        <div
          key={sig.id}
          className={`p-3 rounded-2xl transition-all duration-200 text-center flex flex-col items-center justify-center ${
            sig.isActive ? sig.activeBg : sig.idleBg
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                sig.isActive ? 'bg-current' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
            <span className="text-xs font-black uppercase tracking-wider">
              {sig.label}
            </span>
          </div>

          <div className="font-mono font-bold text-sm sm:text-base leading-none">
            {sig.time}
          </div>

          <div className="text-[10px] font-medium opacity-80 mt-1">
            {sig.desc}
          </div>
        </div>
      ))}
    </div>
  );
};
