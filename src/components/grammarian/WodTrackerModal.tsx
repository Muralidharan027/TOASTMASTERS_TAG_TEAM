import React, { useState } from 'react';
import { BookOpen, Quote, Check } from 'lucide-react';
import type { Speaker } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface WodTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'wod' | 'idiom';
  targetWord: string;
  speakers: Speaker[];
  onRecordUsage: (speakerId: string, speakerName: string, contextQuote?: string) => void;
}

export const WodTrackerModal: React.FC<WodTrackerModalProps> = ({
  isOpen,
  onClose,
  mode,
  targetWord,
  speakers,
  onRecordUsage,
}) => {
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('');
  const [quote, setQuote] = useState('');

  const title = mode === 'wod' ? `Word of the Day Used: "${targetWord}"` : `Idiom Used: "${targetWord}"`;
  const Icon = mode === 'wod' ? BookOpen : Quote;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpeakerId) return;

    const speaker = speakers.find((s) => s.id === selectedSpeakerId);
    if (!speaker) return;

    onRecordUsage(speaker.id, speaker.name, quote.trim() || undefined);
    setSelectedSpeakerId('');
    setQuote('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold">
          <Icon className="w-5 h-5" /> {title}
        </div>
      }
      description="Select the speaker who used the word/idiom and optionally add context."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Speaker Picker List */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Who used it? *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {speakers.map((spk) => {
              const isSelected = selectedSpeakerId === spk.id;
              return (
                <button
                  key={spk.id}
                  type="button"
                  onClick={() => setSelectedSpeakerId(spk.id)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/50 dark:border-purple-500 dark:text-purple-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-sm font-bold truncate">{spk.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{spk.role}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Quote / Context */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Context / Sentence Quote (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Used while discussing personal growth..."
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="grammar"
            disabled={!selectedSpeakerId}
          >
            Record Usage
          </Button>
        </div>
      </form>
    </Modal>
  );
};
