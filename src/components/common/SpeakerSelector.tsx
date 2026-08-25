import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, CheckCircle2, Clock } from 'lucide-react';
import type { Speaker } from '../../types';
import { formatDurationRange } from '../../utils/formatting';
import { Modal } from './Modal';
import { Button } from './Button';

interface SpeakerSelectorProps {
  speakers: Speaker[];
  activeSpeakerId: string | null;
  onSelectSpeaker: (speakerId: string) => void;
  onNextSpeaker?: () => void;
  onPrevSpeaker?: () => void;
  onAddSpeakerClick?: () => void;
}

export const SpeakerSelector: React.FC<SpeakerSelectorProps> = ({
  speakers,
  activeSpeakerId,
  onSelectSpeaker,
  onNextSpeaker,
  onPrevSpeaker,
  onAddSpeakerClick,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const activeSpeaker = speakers.find((s) => s.id === activeSpeakerId) || speakers[0];
  const currentIndex = speakers.findIndex((s) => s.id === activeSpeakerId);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < speakers.length - 1;

  if (speakers.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-4 text-center">
        <p className="text-sm text-slate-500 mb-2">No speakers added to this meeting yet.</p>
        {onAddSpeakerClick && (
          <Button size="sm" variant="outline" onClick={onAddSpeakerClick}>
            + Add First Speaker
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-subtle flex items-center justify-between gap-3">
        {/* Previous button */}
        <button
          onClick={onPrevSpeaker}
          disabled={!hasPrev}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0"
          title="Previous Speaker"
          aria-label="Previous Speaker"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Center Active Speaker Card */}
        <button
          onClick={() => setIsPickerOpen(true)}
          className="flex-1 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 py-1.5 px-3 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Current Speaker ({currentIndex >= 0 ? `${currentIndex + 1}/${speakers.length}` : ''})
            </span>
            <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
          </div>

          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
            {activeSpeaker ? activeSpeaker.name : 'Select Speaker'}
          </div>

          {activeSpeaker && (
            <div className="flex items-center justify-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {activeSpeaker.role}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                {formatDurationRange(activeSpeaker.allocatedMin, activeSpeaker.allocatedMax)}
              </span>
            </div>
          )}
        </button>

        {/* Next button */}
        <button
          onClick={onNextSpeaker}
          disabled={!hasNext}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0"
          title="Next Speaker"
          aria-label="Next Speaker"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Speaker Picker Modal */}
      <Modal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        title="Select Meeting Speaker"
        description="Choose a speaker to switch active tracking role focus"
      >
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {speakers.map((spk, idx) => {
            const isSelected = spk.id === activeSpeakerId;
            return (
              <button
                key={spk.id}
                onClick={() => {
                  onSelectSpeaker(spk.id);
                  setIsPickerOpen(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 shadow-subtle'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-sm leading-tight">{spk.name}</div>
                    <div
                      className={`text-xs mt-0.5 ${
                        isSelected
                          ? 'text-white/80 dark:text-slate-900/80'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {spk.role} • {formatDurationRange(spk.allocatedMin, spk.allocatedMax)}
                    </div>
                  </div>
                </div>

                {spk.status === 'completed' && (
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isSelected ? 'text-white' : 'text-emerald-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {onAddSpeakerClick && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              fullWidth
              size="sm"
              onClick={() => {
                setIsPickerOpen(false);
                onAddSpeakerClick();
              }}
            >
              + Add New Speaker
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};
