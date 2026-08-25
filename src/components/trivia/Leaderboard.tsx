import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import type { TriviaParticipant } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface LeaderboardProps {
  participants: TriviaParticipant[];
  onCelebrateWinner?: () => void;
  onAwardPoints?: (participantId: string, delta: number) => void;
  showQuickScoring?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  participants,
  onCelebrateWinner,
  onAwardPoints,
  showQuickScoring = false,
}) => {
  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="space-y-4">
      {/* Top Winner Spotlight */}
      {winner && winner.score > 0 && (
        <div className="p-5 rounded-3xl bg-linear-to-b from-amber-500/20 via-sky-500/10 to-transparent border-2 border-amber-400 dark:border-amber-500/50 text-center space-y-2 shadow-card animate-in zoom-in-95 duration-200">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500 text-white shadow-glow-yellow mb-1">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="text-xs uppercase font-extrabold tracking-widest text-amber-700 dark:text-amber-400">
            🏆 Current Trivia Leader
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {winner.name}
          </div>
          <div className="text-sm font-extrabold font-mono text-amber-600 dark:text-amber-400">
            {winner.score} Points
          </div>

          {onCelebrateWinner && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={onCelebrateWinner}
                leftIcon={<Sparkles className="w-4 h-4 text-amber-400" />}
              >
                Celebrate Winner 🎉
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table / Cards */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-sky-600" />
            Live Trivia Leaderboard
          </h4>
          <span className="text-xs font-semibold text-slate-400">
            {participants.length} Participants
          </span>
        </div>

        {participants.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">
            No participants added yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.map((p, idx) => {
              const isFirst = idx === 0 && p.score > 0;
              const isSecond = idx === 1 && p.score > 0;
              const isThird = idx === 2 && p.score > 0;

              return (
                <div
                  key={p.id}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 ${
                    isFirst ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isFirst
                          ? 'bg-amber-500 text-white font-black shadow-xs'
                          : isSecond
                          ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                          : isThird
                          ? 'bg-amber-700/60 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {p.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Quick Scoring Buttons */}
                    {showQuickScoring && onAwardPoints && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onAwardPoints(p.id, 1)}
                          className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs hover:bg-sky-100 transition-colors cursor-pointer"
                          title="Award 1 Point"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => onAwardPoints(p.id, 2)}
                          className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs hover:bg-sky-100 transition-colors cursor-pointer"
                          title="Award 2 Points"
                        >
                          +2
                        </button>
                        <button
                          onClick={() => onAwardPoints(p.id, -1)}
                          disabled={p.score <= 0}
                          className="px-1.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold text-xs hover:bg-slate-200 disabled:opacity-30 transition-colors"
                          title="Deduct 1 Point"
                        >
                          -1
                        </button>
                      </div>
                    )}

                    <div className="w-16 text-right font-mono font-black text-base text-slate-900 dark:text-slate-100">
                      {p.score} <span className="text-xs font-normal text-slate-400">pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
