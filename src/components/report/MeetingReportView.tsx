import React, { useState } from 'react';
import {
  Calendar,
  BookOpen,
  Quote,
  Timer,
  MessageSquareOff,
  Trophy,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { useTimerStore } from '../../store/useTimerStore';
import { useAhCounterStore } from '../../store/useAhCounterStore';
import { useGrammarianStore } from '../../store/useGrammarianStore';
import { useTriviaStore } from '../../store/useTriviaStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { TimerReportView } from '../timer/TimerReportView';
import { AhCounterReportView } from '../ahcounter/AhCounterReportView';
import { GrammarianReportView } from '../grammarian/GrammarianReportView';
import { Leaderboard } from '../trivia/Leaderboard';
import { ExportActions } from './ExportActions';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { generateReportMarkdown } from '../../utils/reportGenerator';
import { formatDateString } from '../../utils/formatting';
import type { ReportTemplateStyle } from '../../types';

export const MeetingReportView: React.FC = () => {
  const { activeMeeting, roles, speakers } = useMeetingStore();
  const { timerRecords } = useTimerStore();
  const { records: ahRecordsMap } = useAhCounterStore();
  const { records: grammarianRecords } = useGrammarianStore();
  const { questions: triviaQuestions, participants: triviaParticipants, celebrateWinner } = useTriviaStore();
  const { settings } = useSettingsStore();

  const [reportStyle, setReportStyle] = useState<ReportTemplateStyle>(settings.defaultReportStyle || 'toastmasters');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [customNotes, setCustomNotes] = useState<{
    general?: string;
    timer?: string;
    ah?: string;
    grammar?: string;
    trivia?: string;
  }>({});

  const ahRecords = Object.values(ahRecordsMap);

  if (!activeMeeting) {
    return (
      <div className="p-12 text-center text-slate-500">
        No active meeting selected. Please open a meeting from the Home screen.
      </div>
    );
  }

  const timerRole = roles.find((r) => r.role === 'timer')?.personName || 'Unassigned';
  const ahRole = roles.find((r) => r.role === 'ahCounter')?.personName || 'Unassigned';
  const grammarianRole = roles.find((r) => r.role === 'grammarian')?.personName || 'Unassigned';
  const triviaRole = roles.find((r) => r.role === 'triviaMaster')?.personName || 'Unassigned';

  const reportData = {
    meeting: activeMeeting,
    roles,
    speakers,
    timerRecords,
    ahRecords,
    grammarianRecords,
    triviaQuestions,
    triviaParticipants,
    customGeneralNotes: customNotes.general,
    customTimerNotes: customNotes.timer,
    customAhNotes: customNotes.ah,
    customGrammarNotes: customNotes.grammar,
    customTriviaNotes: customNotes.trivia,
  };

  const reportMarkdown = generateReportMarkdown(reportData, reportStyle);

  const reportElementId = 'tag-team-meeting-report-print';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* 1. Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 no-print">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Combined Final Meeting Summary
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            TAG TEAM Meeting Report
          </h2>
        </div>

        {/* Template Style Switcher & Export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Template style selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {(['toastmasters', 'professional', 'minimal'] as ReportTemplateStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setReportStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  reportStyle === style
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {style === 'toastmasters' ? 'Toastmasters' : style}
              </button>
            ))}
          </div>

          <ExportActions
            reportText={reportMarkdown}
            meetingNumber={activeMeeting.meetingNumber}
            reportElementId={reportElementId}
          />
        </div>
      </div>

      {/* 2. Minimal Plain Text Mode */}
      {reportStyle === 'minimal' ? (
        <Card padding="lg" className="bg-slate-50 dark:bg-slate-900/60 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed border border-slate-200 dark:border-slate-800">
          {reportMarkdown}
        </Card>
      ) : (
        /* 3. Standard Toastmasters / Professional Formatted Report */
        <div
          id={reportElementId}
          className="print-page bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-card space-y-10"
        >
          {/* Document Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {activeMeeting.type.toUpperCase()} MEETING
              </span>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDateString(activeMeeting.date)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {activeMeeting.meetingNumber}
            </h1>

            {activeMeeting.theme && (
              <p className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 italic">
                Theme: "{activeMeeting.theme}"
              </p>
            )}

            {activeMeeting.venue && (
              <p className="text-xs text-slate-500">
                Venue: <strong>{activeMeeting.venue}</strong>
              </p>
            )}
          </div>

          {/* Word & Idiom Spotlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5" /> Word of the Day
              </span>
              <div className="text-lg font-black text-purple-950 dark:text-purple-100">
                {activeMeeting.wordOfDay}
              </div>
              {activeMeeting.wordMeaning && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {activeMeeting.wordMeaning}
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5 mb-1">
                <Quote className="w-3.5 h-3.5" /> Idiom of the Day
              </span>
              <div className="text-lg font-black text-sky-950 dark:text-sky-100">
                {activeMeeting.idiom}
              </div>
              {activeMeeting.idiomMeaning && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {activeMeeting.idiomMeaning}
                </p>
              )}
            </div>
          </div>

          {/* Role Players Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              TAG TEAM Role Players
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Timer</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{timerRole}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Ah-Counter</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{ahRole}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Grammarian</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{grammarianRole}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Trivia Master</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{triviaRole}</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: TIMER REPORT */}
          <section className="space-y-4 page-break-inside-avoid">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Timer className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                1. Timer Report
              </h2>
            </div>
            <TimerReportView
              speakers={speakers}
              timerRecords={timerRecords}
            />
            {customNotes.timer && (
              <div className="text-xs text-slate-600 dark:text-slate-300 italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <strong>Timer Remarks:</strong> {customNotes.timer}
              </div>
            )}
          </section>

          {/* SECTION 2: AH-COUNTER REPORT */}
          <section className="space-y-4 page-break-inside-avoid">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <MessageSquareOff className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                2. Ah-Counter Report
              </h2>
            </div>
            <AhCounterReportView
              speakers={speakers}
              ahRecords={ahRecords}
            />
            {customNotes.ah && (
              <div className="text-xs text-slate-600 dark:text-slate-300 italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <strong>Ah-Counter Remarks:</strong> {customNotes.ah}
              </div>
            )}
          </section>

          {/* SECTION 3: GRAMMARIAN REPORT */}
          <section className="space-y-4 page-break-inside-avoid">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                3. Grammarian Report
              </h2>
            </div>
            <GrammarianReportView
              meeting={activeMeeting}
              records={grammarianRecords}
            />
            {customNotes.grammar && (
              <div className="text-xs text-slate-600 dark:text-slate-300 italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <strong>Grammarian Remarks:</strong> {customNotes.grammar}
              </div>
            )}
          </section>

          {/* SECTION 4: TRIVIA REPORT */}
          <section className="space-y-4 page-break-inside-avoid">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Trophy className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                4. Trivia Master Report
              </h2>
            </div>
            <Leaderboard
              participants={triviaParticipants}
              onCelebrateWinner={celebrateWinner}
            />
            {customNotes.trivia && (
              <div className="text-xs text-slate-600 dark:text-slate-300 italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <strong>Trivia Remarks:</strong> {customNotes.trivia}
              </div>
            )}
          </section>

          {/* SECTION 5: OVERALL MEETING HIGHLIGHTS */}
          <section className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 page-break-inside-avoid">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Overall Meeting Highlights & Insights
            </h3>
            <ul className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
              <li>✓ Strong speaker engagement and punctual adherence to allocated times.</li>
              <li>✓ Active participation in Table Topics and speech evaluations.</li>
              <li>✓ Word of the Day successfully incorporated into meeting discourse.</li>
              <li>✓ Engaging trivia session that reinforced member listening skills.</li>
            </ul>

            {customNotes.general && (
              <div className="text-xs text-slate-600 dark:text-slate-300 italic pt-2">
                <strong>Additional Meeting Observations:</strong> {customNotes.general}
              </div>
            )}
          </section>

          {/* Footer branding */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
            <strong>TAG TEAM</strong> — Track. Analyze. Grow. • Toastmasters Meeting Role Assistant
          </div>
        </div>
      )}

      {/* Editable notes drawer / trigger */}
      <div className="no-print pt-4 flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditingNotes(!isEditingNotes)}
          leftIcon={<Edit3 className="w-4 h-4" />}
        >
          {isEditingNotes ? 'Done Editing Remarks' : 'Edit Report Remarks / Observations'}
        </Button>
      </div>

      {isEditingNotes && (
        <Card padding="md" className="space-y-4 no-print border-2 border-slate-300 dark:border-slate-700">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Customize Report Remarks Before Export
          </h4>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Timer Remarks</label>
              <input
                type="text"
                value={customNotes.timer || ''}
                onChange={(e) => setCustomNotes({ ...customNotes, timer: e.target.value })}
                placeholder="e.g. Most speakers remained well within their green and yellow milestones."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Ah-Counter Remarks</label>
              <input
                type="text"
                value={customNotes.ah || ''}
                onChange={(e) => setCustomNotes({ ...customNotes, ah: e.target.value })}
                placeholder="e.g. Noticeable improvement in pausing rather than using filler sounds."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Grammarian Remarks</label>
              <input
                type="text"
                value={customNotes.grammar || ''}
                onChange={(e) => setCustomNotes({ ...customNotes, grammar: e.target.value })}
                placeholder="e.g. Commendable use of vivid imagery and metaphors throughout speeches."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Trivia Master Remarks</label>
              <input
                type="text"
                value={customNotes.trivia || ''}
                onChange={(e) => setCustomNotes({ ...customNotes, trivia: e.target.value })}
                placeholder="e.g. Enthusiastic competition with high score across all participants."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">General Meeting Notes</label>
              <input
                type="text"
                value={customNotes.general || ''}
                onChange={(e) => setCustomNotes({ ...customNotes, general: e.target.value })}
                placeholder="e.g. Meeting started on time and concluded with high energy."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
