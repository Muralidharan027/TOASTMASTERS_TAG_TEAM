import React from 'react';
import { Minimize2 } from 'lucide-react';
import type { TimingSignal } from '../../types';
import { formatTime } from '../../utils/formatting';

interface FullscreenSignalProps {
  isOpen: boolean;
  onClose: () => void;
  signalState: TimingSignal;
  elapsedSeconds: number;
  speakerName: string;
  speechType: string;
}

export const FullscreenSignal: React.FC<FullscreenSignalProps> = ({
  isOpen,
  onClose,
  signalState,
  elapsedSeconds,
  speakerName,
  speechType,
}) => {
  if (!isOpen) return null;

  const getBackgroundColor = () => {
    switch (signalState) {
      case 'green':
        return 'bg-emerald-600 text-white';
      case 'yellow':
        return 'bg-amber-500 text-slate-950';
      case 'red':
        return 'bg-rose-600 text-white';
      case 'over':
        return 'bg-rose-700 text-white animate-pulse';
      default:
        return 'bg-slate-950 text-white';
    }
  };

  const getSignalLabel = () => {
    switch (signalState) {
      case 'green':
        return '🟢 MINIMUM TIME REACHED';
      case 'yellow':
        return '🟡 MIDPOINT WARNING';
      case 'red':
        return '🔴 MAXIMUM TIME REACHED';
      case 'over':
        return '⚠️ OVER TIME (+30s GRACE EXCEEDED)';
      default:
        return '⏱️ SPEAKING IN PROGRESS';
    }
  };

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 transition-colors duration-300 cursor-pointer ${getBackgroundColor()}`}
    >
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black">{speakerName}</h2>
          <p className="text-sm opacity-80 font-medium">{speechType}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-3 rounded-2xl bg-black/20 hover:bg-black/30 backdrop-blur-xs transition-colors"
          title="Exit Fullscreen"
        >
          <Minimize2 className="w-6 h-6" />
        </button>
      </div>

      {/* Center Giant Time */}
      <div className="text-center space-y-4">
        <div className="text-6xl sm:text-9xl font-black font-mono tracking-tight drop-shadow-md">
          {formatTime(elapsedSeconds)}
        </div>
        <div className="text-lg sm:text-2xl font-extrabold uppercase tracking-widest px-6 py-2 rounded-full bg-black/20 backdrop-blur-xs inline-block">
          {getSignalLabel()}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="text-xs sm:text-sm opacity-70 font-medium tracking-wide">
        Tap anywhere to minimize • Live Meeting Mode
      </div>
    </div>
  );
};
