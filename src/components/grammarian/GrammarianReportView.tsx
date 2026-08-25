import React from 'react';
import { BookOpen, Quote, Sparkles, AlertCircle } from 'lucide-react';
import type { Meeting, GrammarianRecord } from '../../types';
import { Card } from '../common/Card';

interface GrammarianReportViewProps {
  meeting: Meeting;
  records: GrammarianRecord[];
}

export const GrammarianReportView: React.FC<GrammarianReportViewProps> = ({
  meeting,
  records,
}) => {
  const wodRecords = records.filter((r) => r.type === 'wod');
  const idiomRecords = records.filter((r) => r.type === 'idiom');
  const uniqueWordRecords = records.filter((r) => r.type === 'uniqueWord');
  const goodExpRecords = records.filter((r) => r.type === 'goodExpression');
  const grammarNotes = records.filter((r) => r.type === 'grammar' || r.type === 'pronunciation');

  return (
    <div className="space-y-6">
      {/* 1. Metrics summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="sm" className="text-center bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
          <span className="text-xs uppercase font-extrabold text-purple-700 dark:text-purple-400">WOD Uses</span>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
            {wodRecords.length}
          </div>
        </Card>

        <Card padding="sm" className="text-center bg-sky-50/50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900">
          <span className="text-xs uppercase font-extrabold text-sky-700 dark:text-sky-400">Idiom Uses</span>
          <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-0.5">
            {idiomRecords.length}
          </div>
        </Card>

        <Card padding="sm" className="text-center bg-slate-50 dark:bg-slate-900/60">
          <span className="text-xs uppercase font-extrabold text-slate-400">Unique Words</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {uniqueWordRecords.length}
          </div>
        </Card>

        <Card padding="sm" className="text-center bg-slate-50 dark:bg-slate-900/60">
          <span className="text-xs uppercase font-extrabold text-slate-400">Expressions</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {goodExpRecords.length}
          </div>
        </Card>
      </div>

      {/* 2. Word of the Day & Idiom Usage Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* WOD Section */}
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              WOD: {meeting.wordOfDay}
            </h4>
            <span className="text-xs font-bold text-purple-600">
              {wodRecords.length} times
            </span>
          </div>

          {wodRecords.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Not used during the session.</p>
          ) : (
            <div className="space-y-2">
              {wodRecords.map((r) => (
                <div key={r.id} className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    • {r.speakerName || 'Speaker'}
                  </div>
                  {r.notes && (
                    <div className="text-slate-500 italic pl-3">
                      "{r.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Idiom Section */}
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Quote className="w-4 h-4 text-sky-600" />
              Idiom: {meeting.idiom}
            </h4>
            <span className="text-xs font-bold text-sky-600">
              {idiomRecords.length} times
            </span>
          </div>

          {idiomRecords.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Not used during the session.</p>
          ) : (
            <div className="space-y-2">
              {idiomRecords.map((r) => (
                <div key={r.id} className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    • {r.speakerName || 'Speaker'}
                  </div>
                  {r.notes && (
                    <div className="text-slate-500 italic pl-3">
                      "{r.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 3. Unique Vocabulary & Good Expressions */}
      <Card padding="md" className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Unique Vocabulary & Language Highlights
        </h4>

        {uniqueWordRecords.length === 0 && goodExpRecords.length === 0 ? (
          <p className="text-xs text-slate-400 italic">None logged.</p>
        ) : (
          <div className="space-y-2.5">
            {uniqueWordRecords.map((r) => (
              <div key={r.id} className="text-xs space-y-0.5">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="text-purple-600">💎 {r.value}</span>
                  {r.speakerName && <span className="text-slate-500 font-normal">({r.speakerName})</span>}
                </div>
                {r.meaning && <div className="text-slate-600 dark:text-slate-400 pl-4">{r.meaning}</div>}
                {r.notes && <div className="text-slate-400 italic pl-4">"{r.notes}"</div>}
              </div>
            ))}

            {goodExpRecords.map((r) => (
              <div key={r.id} className="text-xs space-y-0.5">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="text-emerald-600">🌟 "{r.value}"</span>
                  {r.speakerName && <span className="text-slate-500 font-normal">({r.speakerName})</span>}
                </div>
                {r.notes && <div className="text-slate-500 italic pl-4">{r.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. Grammar & Pronunciation Suggestions */}
      <Card padding="md" className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <AlertCircle className="w-4 h-4 text-purple-600" />
          Linguistic Suggestions & Constructive Feedback
        </h4>

        {grammarNotes.length === 0 ? (
          <p className="text-xs text-emerald-600 font-medium">
            ✓ Excellent overall grammar, clear articulation, and commendable fluency!
          </p>
        ) : (
          <div className="space-y-2">
            {grammarNotes.map((r) => (
              <div key={r.id} className="text-xs flex items-start gap-2">
                <span className="text-purple-500 font-bold">•</span>
                <div>
                  <span className="text-slate-800 dark:text-slate-200">{r.value}</span>
                  {r.speakerName && <span className="text-slate-400 ml-1.5">({r.speakerName})</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
