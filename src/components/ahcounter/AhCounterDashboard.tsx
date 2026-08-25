import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  Undo2,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { useAhCounterStore } from '../../store/useAhCounterStore';
import { useMeetingStore } from '../../store/useMeetingStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SpeakerSelector } from '../common/SpeakerSelector';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';

const PRESET_OBSERVATIONS = [
  'Good confidence',
  'Strong vocal variety',
  'Excellent fluency',
  'Intentional pauses',
  'Clear delivery',
  'Natural pacing',
  'Good confidence but frequent fillers',
  'Strong structure',
];

export const AhCounterDashboard: React.FC = () => {
  const {
    activeMeeting,
    speakers,
    activeSpeakerId,
    setActiveSpeakerId,
    nextSpeaker,
    prevSpeaker,
  } = useMeetingStore();

  const {
    lastAction,
    loadRecords,
    getRecordForSpeaker,
    incrementWord,
    undoLastAction,
    updateNotes,
    resetCounts,
  } = useAhCounterStore();

  const { settings, addCustomFillerWord } = useSettingsStore();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newCustomWord, setNewCustomWord] = useState('');
  const [isCustomWordModalOpen, setIsCustomWordModalOpen] = useState(false);

  const activeSpeaker = speakers.find((s) => s.id === activeSpeakerId) || speakers[0];

  useEffect(() => {
    if (activeMeeting) {
      loadRecords(activeMeeting.id);
    }
  }, [activeMeeting, loadRecords]);

  const activeRec = activeSpeaker ? getRecordForSpeaker(activeSpeaker.id) : null;

  // Compute speaker total fillers
  const totalCount = activeRec
    ? activeRec.ah +
      activeRec.um +
      activeRec.uh +
      activeRec.er +
      activeRec.hmm +
      activeRec.youKnow +
      activeRec.like +
      activeRec.actually +
      activeRec.basically +
      activeRec.so +
      activeRec.iMean +
      activeRec.incomplete +
      activeRec.other +
      (activeRec.customCounts
        ? Object.values(activeRec.customCounts).reduce((a, b) => a + b, 0)
        : 0)
    : 0;

  // Keyboard Shortcuts (A=Ah, U=Um, H=Uh, R=Repetition, O=Other, Ctrl+Z=Undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!activeMeeting || !activeSpeaker) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoLastAction(activeMeeting.id, activeSpeaker.id);
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'a') {
        incrementWord(activeMeeting.id, activeSpeaker.id, 'ah', 'AH');
      } else if (key === 'u') {
        incrementWord(activeMeeting.id, activeSpeaker.id, 'um', 'UM');
      } else if (key === 'h') {
        incrementWord(activeMeeting.id, activeSpeaker.id, 'uh', 'UH');
      } else if (key === 'r') {
        incrementWord(activeMeeting.id, activeSpeaker.id, 'repetition', 'REPETITION');
      } else if (key === 'o') {
        incrementWord(activeMeeting.id, activeSpeaker.id, 'other', 'OTHER');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMeeting, activeSpeaker, incrementWord, undoLastAction]);

  const handleTap = (wordKey: string, label: string, isCustom = false) => {
    if (!activeMeeting || !activeSpeaker) return;
    incrementWord(activeMeeting.id, activeSpeaker.id, wordKey, label, isCustom);
  };

  const handleUndo = () => {
    if (!activeMeeting || !activeSpeaker) return;
    undoLastAction(activeMeeting.id, activeSpeaker.id);
  };

  const handleAddChipObservation = (chip: string) => {
    if (!activeMeeting || !activeSpeaker || !activeRec) return;
    const current = activeRec.notes ? `${activeRec.notes}; ${chip}` : chip;
    updateNotes(activeMeeting.id, activeSpeaker.id, current);
  };

  const handleSaveCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomWord.trim()) return;
    addCustomFillerWord(newCustomWord.trim());
    setNewCustomWord('');
    setIsCustomWordModalOpen(false);
  };

  const standardFillers = [
    { key: 'ah', label: 'AH', count: activeRec?.ah || 0 },
    { key: 'um', label: 'UM', count: activeRec?.um || 0 },
    { key: 'uh', label: 'UH', count: activeRec?.uh || 0 },
    { key: 'er', label: 'ER', count: activeRec?.er || 0 },
    { key: 'hmm', label: 'HMM', count: activeRec?.hmm || 0 },
  ];

  const crutchWords = [
    { key: 'youKnow', label: 'YOU KNOW', count: activeRec?.youKnow || 0 },
    { key: 'like', label: 'LIKE', count: activeRec?.like || 0 },
    { key: 'actually', label: 'ACTUALLY', count: activeRec?.actually || 0 },
    { key: 'basically', label: 'BASICALLY', count: activeRec?.basically || 0 },
    { key: 'so', label: 'SO', count: activeRec?.so || 0 },
    { key: 'iMean', label: 'I MEAN', count: activeRec?.iMean || 0 },
  ];

  const habits = [
    { key: 'repetition', label: 'REPETITION', count: activeRec?.repetition || 0 },
    { key: 'incomplete', label: 'INCOMPLETE', count: activeRec?.incomplete || 0 },
    { key: 'other', label: 'OTHER', count: activeRec?.other || 0 },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-5">
      {/* 1. Speaker Selector */}
      <SpeakerSelector
        speakers={speakers}
        activeSpeakerId={activeSpeakerId}
        onSelectSpeaker={setActiveSpeakerId}
        onNextSpeaker={nextSpeaker}
        onPrevSpeaker={prevSpeaker}
      />

      {/* 2. Total Count & Undo Header Bar */}
      <Card padding="md" className="flex items-center justify-between gap-4 bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
            TOTAL FILLERS FOR {activeSpeaker?.name || 'SPEAKER'}
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {totalCount}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo Action Button */}
          <button
            onClick={handleUndo}
            disabled={!activeRec || !activeRec.actionHistory || activeRec.actionHistory.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs text-xs font-bold btn-tactile cursor-pointer"
            title="Undo Last Action (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4 text-amber-600" />
            <span>Undo {lastAction?.speakerId === activeSpeaker?.id ? lastAction.label : ''}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset counts for this speaker"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* 3. Primary Tactile Tapping Grid */}
      <div className="space-y-4">
        {/* Standard Fillers Row */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Sound Fillers (Single Tap)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {standardFillers.map((item) => (
              <button
                key={item.key}
                onClick={() => handleTap(item.key, item.label)}
                className="h-20 sm:h-24 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 active:bg-amber-500 active:text-white p-3 flex flex-col justify-between items-center text-center transition-all shadow-subtle cursor-pointer btn-tactile group"
              >
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors">
                  {item.label}
                </span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                    item.count > 0
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Crutch Words Row */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Crutch Words & Phrases
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {crutchWords.map((item) => (
              <button
                key={item.key}
                onClick={() => handleTap(item.key, item.label)}
                className="h-16 sm:h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 active:bg-amber-500 active:text-white px-4 py-2 flex items-center justify-between transition-all shadow-subtle cursor-pointer btn-tactile group"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600">
                  {item.label}
                </span>
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                    item.count > 0
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Speaking Habits & Custom Words */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Habits & Custom Words
            </span>
            <button
              onClick={() => setIsCustomWordModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Custom Word
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {habits.map((item) => (
              <button
                key={item.key}
                onClick={() => handleTap(item.key, item.label)}
                className="h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 px-3.5 flex items-center justify-between transition-all shadow-subtle cursor-pointer btn-tactile"
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                    item.count > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            ))}

            {/* Custom Words */}
            {settings.customFillerWords.map((word) => {
              const count = activeRec?.customCounts?.[word] || 0;
              return (
                <button
                  key={word}
                  onClick={() => handleTap(word, word.toUpperCase(), true)}
                  className="h-14 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 hover:border-amber-400 px-3.5 flex items-center justify-between transition-all shadow-subtle cursor-pointer btn-tactile"
                >
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate pr-1">
                    {word}
                  </span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      count > 0 ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Speaker Observation & Constructive Notes */}
      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            Speaker Observations & Fluency Notes
          </label>
        </div>

        {/* Quick Observation Chips */}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_OBSERVATIONS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleAddChipObservation(chip)}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              + {chip}
            </button>
          ))}
        </div>

        <textarea
          rows={2}
          value={activeRec?.notes || ''}
          onChange={(e) => {
            if (activeMeeting && activeSpeaker) {
              updateNotes(activeMeeting.id, activeSpeaker.id, e.target.value);
            }
          }}
          placeholder="Write constructive observations for this speaker..."
          className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </Card>

      {/* Keyboard Shortcuts Reference */}
      <div className="hidden sm:flex items-center justify-center gap-3 text-xs text-slate-400 font-medium">
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">A</kbd> Ah</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">U</kbd> Um</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">H</kbd> Uh</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">R</kbd> Repetition</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">Ctrl+Z</kbd> Undo</span>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Ah-Counter for this Speaker?"
        description={`This will reset all counted filler words for ${activeSpeaker?.name || 'this speaker'} to zero.`}
      >
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => setIsResetModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (activeMeeting && activeSpeaker) {
                await resetCounts(activeMeeting.id, activeSpeaker.id);
              }
              setIsResetModalOpen(false);
            }}
          >
            Reset Counts
          </Button>
        </div>
      </Modal>

      {/* Add Custom Word Modal */}
      <Modal
        isOpen={isCustomWordModalOpen}
        onClose={() => setIsCustomWordModalOpen(false)}
        title="Add Custom Filler / Crutch Word"
        description="Add a specific repeated word or phrase you want to track for all speakers."
      >
        <form onSubmit={handleSaveCustomWord} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Word or Phrase
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Actually, Right, In fact..."
              value={newCustomWord}
              onChange={(e) => setNewCustomWord(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsCustomWordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="ah">
              Add Word
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
