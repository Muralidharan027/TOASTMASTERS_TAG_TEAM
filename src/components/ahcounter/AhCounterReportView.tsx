import React from 'react';
import { MessageSquareOff, Sparkles } from 'lucide-react';
import type { Speaker, AhCounterRecord } from '../../types';
import { Card } from '../common/Card';

interface AhCounterReportViewProps {
  speakers: Speaker[];
  ahRecords: AhCounterRecord[];
  onSelectSpeaker?: (speakerId: string) => void;
}

export const AhCounterReportView: React.FC<AhCounterReportViewProps> = ({
  speakers,
  ahRecords,
  onSelectSpeaker,
}) => {
  let totalFillers = 0;
  const fillerWordTotals: Record<string, number> = {};
  let totalRepetitions = 0;

  ahRecords.forEach((rec) => {
    const fillerKeys = ['ah', 'um', 'uh', 'er', 'hmm', 'youKnow', 'like', 'actually', 'basically', 'so', 'iMean', 'incomplete', 'other'] as const;
    fillerKeys.forEach((k) => {
      const val = (rec[k] as number) || 0;
      if (val > 0) {
        totalFillers += val;
        fillerWordTotals[k] = (fillerWordTotals[k] || 0) + val;
      }
    });
    if (rec.customCounts) {
      Object.entries(rec.customCounts).forEach(([word, cnt]) => {
        if (cnt > 0) {
          totalFillers += cnt;
          fillerWordTotals[word] = (fillerWordTotals[word] || 0) + cnt;
        }
      });
    }
    totalRepetitions += rec.repetition || 0;
  });

  const activeAhSpeakers = ahRecords.filter((r) => {
    return (
      r.ah + r.um + r.uh + r.er + r.hmm + r.youKnow + r.like + r.actually +
      r.basically + r.so + r.iMean + r.other + r.repetition > 0
    );
  }).length;

  const avgFillers = activeAhSpeakers > 0 ? (totalFillers / activeAhSpeakers).toFixed(1) : '0';

  let topFillerName = 'None';
  let topFillerCount = 0;
  Object.entries(fillerWordTotals).forEach(([word, count]) => {
    if (count > topFillerCount) {
      topFillerCount = count;
      topFillerName = word.toUpperCase();
    }
  });

  return (
    <div className="space-y-6">
      {/* 1. Metrics summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="sm" className="text-center bg-slate-50 dark:bg-slate-900/60">
          <span className="text-xs uppercase font-extrabold text-slate-400">Total Fillers</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {totalFillers}
          </div>
        </Card>

        <Card padding="sm" className="text-center bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900">
          <span className="text-xs uppercase font-extrabold text-amber-700 dark:text-amber-400">Most Common</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 truncate font-mono mt-0.5">
            {topFillerName} {topFillerCount > 0 ? `(${topFillerCount})` : ''}
          </div>
        </Card>

        <Card padding="sm" className="text-center bg-slate-50 dark:bg-slate-900/60">
          <span className="text-xs uppercase font-extrabold text-slate-400">Average / Speaker</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {avgFillers}
          </div>
        </Card>

        <Card padding="sm" className="text-center bg-slate-50 dark:bg-slate-900/60">
          <span className="text-xs uppercase font-extrabold text-slate-400">Repetitions</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {totalRepetitions}
          </div>
        </Card>
      </div>

      {/* Constructive Toastmasters Tip */}
      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Constructive Reminder:</strong> The goal is not to eliminate every filler word, but to become aware of them and gradually replace unnecessary fillers with intentional pauses.
        </div>
      </div>

      {/* 2. Speaker Breakdown List */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquareOff className="w-4 h-4 text-amber-600" />
            Speaker-by-Speaker Filler Breakdown
          </h4>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {speakers.map((spk) => {
            const rec = ahRecords.find((r) => r.speakerId === spk.id);
            const items: { label: string; count: number }[] = [];

            if (rec) {
              if (rec.ah) items.push({ label: 'Ah', count: rec.ah });
              if (rec.um) items.push({ label: 'Um', count: rec.um });
              if (rec.uh) items.push({ label: 'Uh', count: rec.uh });
              if (rec.er) items.push({ label: 'Er', count: rec.er });
              if (rec.hmm) items.push({ label: 'Hmm', count: rec.hmm });
              if (rec.youKnow) items.push({ label: 'You Know', count: rec.youKnow });
              if (rec.like) items.push({ label: 'Like', count: rec.like });
              if (rec.actually) items.push({ label: 'Actually', count: rec.actually });
              if (rec.basically) items.push({ label: 'Basically', count: rec.basically });
              if (rec.so) items.push({ label: 'So', count: rec.so });
              if (rec.iMean) items.push({ label: 'I Mean', count: rec.iMean });
              if (rec.repetition) items.push({ label: 'Repetition', count: rec.repetition });
              if (rec.incomplete) items.push({ label: 'Incomplete', count: rec.incomplete });
              if (rec.other) items.push({ label: 'Other', count: rec.other });
              if (rec.customCounts) {
                Object.entries(rec.customCounts).forEach(([w, c]) => {
                  if (c > 0) items.push({ label: w, count: c });
                });
              }
            }

            const speakerTotal = items.reduce((a, b) => a + b.count, 0);

            return (
              <div
                key={spk.id}
                onClick={() => onSelectSpeaker && onSelectSpeaker(spk.id)}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  onSelectSpeaker ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer' : ''
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {spk.name}
                    <span className="text-xs font-normal text-slate-500">• {spk.role}</span>
                  </div>

                  {/* Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {items.length > 0 ? (
                      items.map((it) => (
                        <span
                          key={it.label}
                          className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-200/60 dark:border-amber-900"
                        >
                          {it.label}: <strong>{it.count}</strong>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No fillers recorded 🌟</span>
                    )}
                  </div>

                  {rec?.notes && (
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg">
                      "{rec.notes}"
                    </div>
                  )}
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="font-mono font-black text-base text-slate-900 dark:text-slate-100">
                    {speakerTotal}
                  </span>
                  <span className="text-xs text-slate-400 block sm:inline sm:ml-1">total</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
