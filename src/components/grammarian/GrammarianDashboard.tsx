import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Quote,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { useGrammarianStore } from '../../store/useGrammarianStore';
import { useMeetingStore } from '../../store/useMeetingStore';
import { WodTrackerModal } from './WodTrackerModal';
import { VocabObservationModal } from './VocabObservationModal';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import type { GrammarianRecordType } from '../../types';

export const GrammarianDashboard: React.FC = () => {
  const { activeMeeting, speakers } = useMeetingStore();
  const { records, loadRecords, addRecord, deleteRecord } = useGrammarianStore();

  const [wodModalState, setWodModalState] = useState<{ isOpen: boolean; mode: 'wod' | 'idiom' }>({
    isOpen: false,
    mode: 'wod',
  });

  const [vocabModalState, setVocabModalState] = useState<{
    isOpen: boolean;
    type: GrammarianRecordType;
  }>({
    isOpen: false,
    type: 'uniqueWord',
  });

  useEffect(() => {
    if (activeMeeting) {
      loadRecords(activeMeeting.id);
    }
  }, [activeMeeting?.id]);

  const wodRecords = records.filter((r) => r.type === 'wod');
  const idiomRecords = records.filter((r) => r.type === 'idiom');

  const wod = activeMeeting?.wordOfDay || 'Venerable';
  const idiom = activeMeeting?.idiom || "In the autumn of one's years";

  const handleRecordUsage = (speakerId: string, speakerName: string, quote?: string) => {
    if (!activeMeeting) return;
    addRecord(
      activeMeeting.id,
      wodModalState.mode,
      wodModalState.mode === 'wod' ? wod : idiom,
      speakerId,
      speakerName,
      undefined,
      quote
    );
  };

  const handleSaveObservation = (
    type: GrammarianRecordType,
    value: string,
    speakerId?: string,
    speakerName?: string,
    meaning?: string,
    notes?: string
  ) => {
    if (!activeMeeting) return;
    addRecord(activeMeeting.id, type, value, speakerId, speakerName, meaning, notes);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* 1. Word & Idiom Reference Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Word of the Day Card */}
        <Card padding="md" className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Word of the Day
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-mono font-bold text-xs">
              {wodRecords.length} uses
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-black text-purple-950 dark:text-purple-100 tracking-tight">
            {wod}
          </div>

          {activeMeeting?.wordMeaning && (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
              {activeMeeting.wordMeaning}
            </p>
          )}

          {activeMeeting?.wordExample && (
            <p className="text-[11px] text-purple-700/80 dark:text-purple-400 italic">
              e.g. "{activeMeeting.wordExample}"
            </p>
          )}
        </Card>

        {/* Idiom of the Day Card */}
        <Card padding="md" className="bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5" /> Idiom of the Day
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 font-mono font-bold text-xs">
              {idiomRecords.length} uses
            </span>
          </div>

          <div className="text-lg sm:text-xl font-black text-sky-950 dark:text-sky-100 tracking-tight">
            {idiom}
          </div>

          {activeMeeting?.idiomMeaning && (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
              {activeMeeting.idiomMeaning}
            </p>
          )}

          {activeMeeting?.idiomExample && (
            <p className="text-[11px] text-sky-700/80 dark:text-sky-400 italic">
              e.g. "{activeMeeting.idiomExample}"
            </p>
          )}
        </Card>
      </div>

      {/* 2. Large Action Buttons */}
      <div className="space-y-3">
        {/* Primary Largest Button: + WOD USED */}
        <Button
          size="xl"
          variant="grammar"
          fullWidth
          onClick={() => setWodModalState({ isOpen: true, mode: 'wod' })}
          leftIcon={<BookOpen className="w-6 h-6" />}
          className="text-lg sm:text-xl font-black shadow-card h-16 sm:h-20"
        >
          + WORD OF THE DAY USED ({wod.toUpperCase()})
        </Button>

        {/* Secondary Grid Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Button
            size="lg"
            variant="outline"
            onClick={() => setWodModalState({ isOpen: true, mode: 'idiom' })}
            leftIcon={<Quote className="w-5 h-5 text-sky-600" />}
            className="text-sm font-bold justify-start px-4 h-14 bg-white dark:bg-slate-900"
          >
            + Idiom of the Day Used
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setVocabModalState({ isOpen: true, type: 'uniqueWord' })}
            leftIcon={<Sparkles className="w-5 h-5 text-amber-500" />}
            className="text-sm font-bold justify-start px-4 h-14 bg-white dark:bg-slate-900"
          >
            + Unique Vocabulary Word
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setVocabModalState({ isOpen: true, type: 'goodExpression' })}
            leftIcon={<MessageSquare className="w-5 h-5 text-emerald-500" />}
            className="text-sm font-bold justify-start px-4 h-14 bg-white dark:bg-slate-900"
          >
            + Good Expression / Metaphor
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setVocabModalState({ isOpen: true, type: 'grammar' })}
            leftIcon={<AlertTriangle className="w-5 h-5 text-purple-500" />}
            className="text-sm font-bold justify-start px-4 h-14 bg-white dark:bg-slate-900"
          >
            + Grammar / Pronunciation Note
          </Button>
        </div>
      </div>

      {/* 3. Live Stream of Recorded Grammarian Logs */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Recorded Observations ({records.length})
          </h3>
        </div>

        {records.length === 0 ? (
          <Card variant="subtle" className="text-center py-8">
            <p className="text-sm text-slate-500">
              No language observations logged yet. Tap the buttons above during speeches!
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {records.map((rec) => {
              const isWod = rec.type === 'wod';
              const isIdiom = rec.type === 'idiom';
              const isGood = rec.type === 'goodExpression' || rec.type === 'uniqueWord';

              return (
                <div
                  key={rec.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-subtle flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isWod
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : isIdiom
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            : isGood
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {rec.type === 'wod'
                          ? 'WOD USED'
                          : rec.type === 'idiom'
                          ? 'IDIOM USED'
                          : rec.type === 'uniqueWord'
                          ? 'UNIQUE WORD'
                          : rec.type === 'goodExpression'
                          ? 'GOOD EXPRESSION'
                          : 'GRAMMAR'}
                      </span>

                      {rec.speakerName && (
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {rec.speakerName}
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      "{rec.value}"
                    </div>

                    {rec.meaning && (
                      <div className="text-xs text-slate-500">
                        Meaning: <em>{rec.meaning}</em>
                      </div>
                    )}

                    {rec.notes && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 italic">
                        Context: "{rec.notes}"
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteRecord(rec.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="Delete Observation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <WodTrackerModal
        isOpen={wodModalState.isOpen}
        onClose={() => setWodModalState({ ...wodModalState, isOpen: false })}
        mode={wodModalState.mode}
        targetWord={wodModalState.mode === 'wod' ? wod : idiom}
        speakers={speakers}
        onRecordUsage={handleRecordUsage}
      />

      <VocabObservationModal
        isOpen={vocabModalState.isOpen}
        onClose={() => setVocabModalState({ ...vocabModalState, isOpen: false })}
        type={vocabModalState.type}
        speakers={speakers}
        onSave={handleSaveObservation}
      />
    </div>
  );
};
