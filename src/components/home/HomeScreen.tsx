import React, { useState } from 'react';
import { Plus, Sparkles, Layers, AlertCircle } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { useTimerStore } from '../../store/useTimerStore';
import { useAhCounterStore } from '../../store/useAhCounterStore';
import { useGrammarianStore } from '../../store/useGrammarianStore';
import { useTriviaStore } from '../../store/useTriviaStore';
import { MeetingCard } from './MeetingCard';
import { TemplateModal } from './TemplateModal';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { storage } from '../../db/storage';
import type { MeetingTemplate } from '../../types';

interface HomeScreenProps {
  onNewMeetingClick: () => void;
  onOpenMeeting: (meetingId: string) => void;
  onViewReport: (meetingId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNewMeetingClick,
  onOpenMeeting,
  onViewReport,
}) => {
  const { meetings, speakers, deleteMeeting, loadMeeting, createMeeting } = useMeetingStore();
  const { timerRecords } = useTimerStore();
  const { records: ahRecordsMap } = useAhCounterStore();
  const { records: grammarianRecords } = useGrammarianStore();
  const { questions: triviaQuestions } = useTriviaStore();

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState<MeetingTemplate[]>([]);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);

  const ahRecords = Object.values(ahRecordsMap);

  const handleOpenTemplates = async () => {
    const tmpls = await storage.getTemplates();
    setTemplates(tmpls);
    setIsTemplateModalOpen(true);
  };

  const handleSelectTemplate = async (template: MeetingTemplate) => {
    const today = new Date().toISOString().split('T')[0];
    const meetingId = await createMeeting(
      {
        meetingNumber: `Meeting #${Math.floor(Math.random() * 90) + 10}`,
        date: today,
        type: template.type,
        theme: 'Leadership & Growth',
        wordOfDay: 'Magnanimous',
        wordMeaning: 'Generous or forgiving, especially toward a rival or less powerful person.',
        idiom: 'Raise the bar',
        idiomMeaning: 'To set higher standards or expectations.',
      },
      template.defaultRoles,
      template.defaultSpeakers
    );
    onOpenMeeting(meetingId);
  };

  const confirmDelete = async () => {
    if (meetingToDelete) {
      await deleteMeeting(meetingToDelete);
      setMeetingToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold tracking-wide shadow-subtle mb-2">
          <span>T</span>•<span>A</span>•<span>G</span>•<span>T</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          TAG TEAM
        </h1>

        <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-300">
          Track. Analyze. Grow.
        </p>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          A dedicated Toastmasters meeting companion for Timer, Ah-Counter, Grammarian, and Trivia Master.
        </p>

        {/* Call to action buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={onNewMeetingClick}
            leftIcon={<Plus className="w-5 h-5" />}
            className="w-full sm:w-auto shadow-card"
          >
            + New Meeting
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleOpenTemplates}
            leftIcon={<Sparkles className="w-5 h-5 text-amber-500" />}
            className="w-full sm:w-auto"
          >
            Use Template
          </Button>
        </div>
      </div>

      {/* Role preview badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 text-center">
          <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-lg block">T</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">Timer</span>
          <span className="text-[11px] text-slate-500 block">Milestone signals</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/60 text-center">
          <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-lg block">A</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">Ah-Counter</span>
          <span className="text-[11px] text-slate-500 block">One-tap tracking</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/60 text-center">
          <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-lg block">G</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">Grammarian</span>
          <span className="text-[11px] text-slate-500 block">WOD & Vocab highlights</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/60 text-center">
          <span className="font-mono font-black text-sky-600 dark:text-sky-400 text-lg block">T</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">Trivia Master</span>
          <span className="text-[11px] text-slate-500 block">Live quiz & leaderboard</span>
        </div>
      </div>

      {/* Recent Meetings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            Recent Meetings
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {meetings.length} Total
          </span>
        </div>

        {meetings.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl space-y-3">
            <p className="text-slate-500 text-sm">No meetings recorded yet.</p>
            <Button size="md" variant="primary" onClick={onNewMeetingClick}>
              + Create Your First Meeting
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                speakers={speakers}
                timerRecords={timerRecords}
                ahRecords={ahRecords}
                grammarianRecords={grammarianRecords}
                triviaQuestions={triviaQuestions}
                onOpen={(id) => {
                  loadMeeting(id);
                  onOpenMeeting(id);
                }}
                onViewReport={(id) => {
                  loadMeeting(id);
                  onViewReport(id);
                }}
                onDelete={(id) => setMeetingToDelete(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
        onStartBlank={onNewMeetingClick}
      />

      {/* Meeting Delete Confirmation Modal */}
      <Modal
        isOpen={meetingToDelete !== null}
        onClose={() => setMeetingToDelete(null)}
        title={
          <div className="flex items-center gap-2 text-rose-600 font-bold">
            <AlertCircle className="w-5 h-5" /> Delete Meeting?
          </div>
        }
        description="This will permanently delete this meeting along with all recorded Timer, Ah-Counter, Grammarian, and Trivia data."
      >
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => setMeetingToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Meeting
          </Button>
        </div>
      </Modal>
    </div>
  );
};
