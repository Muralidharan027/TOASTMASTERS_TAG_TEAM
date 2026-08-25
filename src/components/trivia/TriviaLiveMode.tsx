import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import type { TriviaQuestion, TriviaParticipant, TriviaOptionKey } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface TriviaLiveModeProps {
  questions: TriviaQuestion[];
  activeIndex: number;
  isRevealed: boolean;
  participants: TriviaParticipant[];
  onReveal: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAwardPoints: (participantId: string, delta: number) => void;
  onFinishTrivia: () => void;
}

export const TriviaLiveMode: React.FC<TriviaLiveModeProps> = ({
  questions,
  activeIndex,
  isRevealed,
  participants,
  onReveal,
  onNext,
  onPrev,
  onAwardPoints,
  onFinishTrivia,
}) => {
  const currentQ = questions[activeIndex];
  const isLastQuestion = activeIndex >= questions.length - 1;

  if (!currentQ) {
    return (
      <Card variant="subtle" className="text-center py-12">
        <p className="text-slate-500">No trivia questions found for this meeting.</p>
      </Card>
    );
  }

  const options: { key: TriviaOptionKey; text: string }[] = (
    [
      { key: 'A' as const, text: currentQ.optionA },
      { key: 'B' as const, text: currentQ.optionB },
      { key: 'C' as const, text: currentQ.optionC },
      { key: 'D' as const, text: currentQ.optionD },
    ] as { key: TriviaOptionKey; text: string }[]
  ).filter((o) => o.text && o.text.trim() !== '');

  return (
    <div className="space-y-6">
      {/* 1. Header with Question Progress */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onPrev}
          disabled={activeIndex === 0}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
          title="Previous Question"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-sky-600 dark:text-sky-400">
            QUESTION {activeIndex + 1} OF {questions.length}
          </span>
          <div className="text-xs text-slate-400 font-medium">
            Worth {currentQ.points || 1} Point{currentQ.points > 1 ? 's' : ''}
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={isLastQuestion}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
          title="Next Question"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Main Question Card */}
      <Card
        padding="lg"
        className="space-y-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-elevated"
      >
        <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight text-center sm:text-left leading-snug">
          {currentQ.question}
        </div>

        {/* Options List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt) => {
            const isCorrect = isRevealed && opt.key === currentQ.correctAnswer;
            const isOther = isRevealed && opt.key !== currentQ.correctAnswer;

            return (
              <div
                key={opt.key}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-3 ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-100 shadow-glow-green scale-[1.02]'
                    : isOther
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-400 opacity-60'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-subtle'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="text-base font-bold leading-snug">
                    {opt.text}
                  </span>
                </div>

                {isCorrect && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Reveal Answer Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
          {!isRevealed ? (
            <Button
              size="xl"
              variant="trivia"
              fullWidth
              onClick={onReveal}
              leftIcon={<Eye className="w-6 h-6" />}
              className="text-base font-bold shadow-card h-14"
            >
              REVEAL ANSWER
            </Button>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm sm:text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Correct Answer: {currentQ.correctAnswer}
              </div>

              {!isLastQuestion ? (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={onNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Next Question →
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={onFinishTrivia}
                  leftIcon={<Trophy className="w-4 h-4 text-amber-400" />}
                  className="w-full sm:w-auto"
                >
                  Finish Trivia & View Winner 🏆
                </Button>
              )}
            </div>
          )}
        </div>

        {isRevealed && currentQ.notes && (
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-xs text-sky-800 dark:text-sky-200 border border-sky-100 dark:border-sky-900">
            <strong>Note:</strong> {currentQ.notes}
          </div>
        )}
      </Card>

      {/* 3. Quick Award Points Drawer */}
      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Award Points for this Question
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
          {participants.map((p) => (
            <div
              key={p.id}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-2"
            >
              <div className="truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                  {p.name}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  {p.score} pts
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onAwardPoints(p.id, 1)}
                  className="px-2 py-1 rounded-lg bg-sky-600 text-white font-mono font-bold text-xs hover:bg-sky-700 transition-colors btn-tactile cursor-pointer"
                >
                  +1
                </button>
                <button
                  onClick={() => onAwardPoints(p.id, 2)}
                  className="px-2 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs hover:bg-sky-200 transition-colors btn-tactile cursor-pointer"
                >
                  +2
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
