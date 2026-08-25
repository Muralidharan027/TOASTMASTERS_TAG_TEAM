import React from 'react';
import { Timer } from 'lucide-react';
import type { Speaker, TimerRecord } from '../../types';
import { Card } from '../common/Card';
import { formatTime, formatDurationRange, getStatusBadge } from '../../utils/formatting';

interface TimerReportViewProps {
  speakers: Speaker[];
  timerRecords: TimerRecord[];
  onSelectSpeaker?: (speakerId: string) => void;
}

export const TimerReportView: React.FC<TimerReportViewProps> = ({
  speakers,
  timerRecords,
  onSelectSpeaker,
}) => {
  const trackedRecords = timerRecords.filter((r) => r.duration > 0);
  const totalTracked = trackedRecords.length;
  const onTimeCount = timerRecords.filter((r) => r.status === 'on_time').length;
  const underTimeCount = timerRecords.filter((r) => r.status === 'under_time').length;
  const overTimeCount = timerRecords.filter((r) => r.status === 'over_time').length;

  const durations = trackedRecords.map((r) => r.duration);
  const longestSpeech = durations.length > 0 ? Math.max(...durations) : 0;
  const shortestSpeech = durations.length > 0 ? Math.min(...durations) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="sm" className="text-center bg-slate-50 dark:bg-slate-900/60">
          <span className="text-xs uppercase font-extrabold text-slate-400">Tracked</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {totalTracked}/{speakers.length}
          </div>
        </Card>

        <Card padding="sm" className="text-center bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900">
          <span className="text-xs uppercase font-extrabold text-emerald-700 dark:text-emerald-400">On Time</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {onTimeCount}
          </div>
        </Card>

        <Card padding="sm" className="text-center bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900">
          <span className="text-xs uppercase font-extrabold text-amber-700 dark:text-amber-400">Under Time</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            {underTimeCount}
          </div>
        </Card>

        <Card padding="sm" className="text-center bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900">
          <span className="text-xs uppercase font-extrabold text-rose-700 dark:text-rose-400">Over Time</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
            {overTimeCount}
          </div>
        </Card>
      </div>

      {/* Highlights summary */}
      {durations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Longest Speech</span>
            <span className="font-mono font-black text-base text-slate-900 dark:text-slate-100">
              {formatTime(longestSpeech)}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Shortest Speech</span>
            <span className="font-mono font-black text-base text-slate-900 dark:text-slate-100">
              {formatTime(shortestSpeech)}
            </span>
          </div>
        </div>
      )}

      {/* 2. Speaker Times Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Timer className="w-4 h-4 text-emerald-600" />
            Speaker Duration Breakdown
          </h4>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {speakers.map((spk) => {
            const tr = timerRecords.find((r) => r.speakerId === spk.id);
            const badge = tr ? getStatusBadge(tr.status) : getStatusBadge('not_completed');
            const hasRecorded = tr && tr.duration > 0;

            return (
              <div
                key={spk.id}
                onClick={() => onSelectSpeaker && onSelectSpeaker(spk.id)}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  onSelectSpeaker ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer' : ''
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {spk.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {spk.role} • Alloc: {formatDurationRange(spk.allocatedMin, spk.allocatedMax)}
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    {hasRecorded ? formatTime(tr.duration) : '—'}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
