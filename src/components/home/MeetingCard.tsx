import React from 'react';
import { Calendar, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import type { Meeting, Speaker, TimerRecord, AhCounterRecord, GrammarianRecord, TriviaQuestion } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { formatDateString } from '../../utils/formatting';

interface MeetingCardProps {
  meeting: Meeting;
  speakers: Speaker[];
  timerRecords: TimerRecord[];
  ahRecords: AhCounterRecord[];
  grammarianRecords: GrammarianRecord[];
  triviaQuestions: TriviaQuestion[];
  onOpen: (meetingId: string) => void;
  onViewReport: (meetingId: string) => void;
  onDelete: (meetingId: string) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  speakers,
  timerRecords,
  ahRecords,
  grammarianRecords,
  triviaQuestions,
  onOpen,
  onViewReport,
  onDelete,
}) => {
  const meetingSpeakers = speakers.filter((s) => s.meetingId === meeting.id);
  const trackedSpeakers = timerRecords.filter((r) => r.meetingId === meeting.id && r.duration > 0).length;
  const totalSpeakers = meetingSpeakers.length;

  const totalFillers = ahRecords
    .filter((r) => r.meetingId === meeting.id)
    .reduce((acc, r) => {
      const standard = r.ah + r.um + r.uh + r.er + r.hmm + r.youKnow + r.like + r.actually + r.basically + r.so + r.iMean + r.other;
      const custom = r.customCounts ? Object.values(r.customCounts).reduce((a, b) => a + b, 0) : 0;
      return acc + standard + custom;
    }, 0);

  const wodCount = grammarianRecords.filter((r) => r.meetingId === meeting.id && r.type === 'wod').length;
  const triviaCount = triviaQuestions.filter((q) => q.meetingId === meeting.id).length;

  const isCompleted = totalSpeakers > 0 && trackedSpeakers >= totalSpeakers;

  return (
    <Card variant="interactive" padding="none" className="overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {meeting.type}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {formatDateString(meeting.date)}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
              {meeting.meetingNumber}
            </h3>

            {meeting.theme && (
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400 italic">
                "{meeting.theme}"
              </p>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(meeting.id);
            }}
            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Delete Meeting"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Meeting metadata pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {meeting.wordOfDay && (
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900 font-medium">
              WOD: <strong>{meeting.wordOfDay}</strong> ({wodCount})
            </span>
          )}
          {totalFillers > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900 font-medium">
              {totalFillers} fillers
            </span>
          )}
          {triviaCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900 font-medium">
              {triviaCount} trivia Qs
            </span>
          )}
        </div>

        {/* Progress summary bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {isCompleted ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> All {totalSpeakers} speakers completed
              </span>
            ) : (
              <span>
                {trackedSpeakers}/{totalSpeakers} speakers tracked
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewReport(meeting.id);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Report
            </button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onOpen(meeting.id)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
