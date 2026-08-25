import React from 'react';
import { Layers, BookOpen, Quote } from 'lucide-react';
import type { TagRoleType } from '../../types';
import { useMeetingStore } from '../../store/useMeetingStore';
import { RoleAssignmentSection } from './RoleAssignment';
import { AgendaManager } from './AgendaManager';
import { Card } from '../common/Card';

interface MeetingSetupProps {
  onOpenRole: (role: TagRoleType) => void;
}

export const MeetingSetup: React.FC<MeetingSetupProps> = ({ onOpenRole }) => {
  const {
    activeMeeting,
    roles,
    speakers,
    updateMeeting,
    setRoleAssignment,
    addSpeaker,
    updateSpeaker,
    deleteSpeaker,
    reorderSpeakers,
  } = useMeetingStore();

  if (!activeMeeting) {
    return (
      <div className="p-8 text-center text-slate-500">
        No active meeting selected. Please choose or create a meeting from Home.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Meeting Setup & Configuration
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {activeMeeting.meetingNumber}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            ✓ Autosaved locally
          </span>
        </div>
      </div>

      {/* 1. Meeting Details */}
      <Card padding="lg" className="space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-slate-500" />
          Meeting Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Meeting Number *
            </label>
            <input
              type="text"
              value={activeMeeting.meetingNumber}
              onChange={(e) => updateMeeting({ meetingNumber: e.target.value })}
              placeholder="e.g. Online Meeting #16"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Date
            </label>
            <input
              type="date"
              value={activeMeeting.date}
              onChange={(e) => updateMeeting({ date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Meeting Type
            </label>
            <select
              value={activeMeeting.type}
              onChange={(e) => updateMeeting({ type: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Theme of the Day
            </label>
            <input
              type="text"
              value={activeMeeting.theme}
              onChange={(e) => updateMeeting({ theme: e.target.value })}
              placeholder="e.g. Better, or Just More You?"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Venue (Optional)
            </label>
            <input
              type="text"
              value={activeMeeting.venue || ''}
              onChange={(e) => updateMeeting({ venue: e.target.value })}
              placeholder="e.g. Zoom / Hall 3"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </Card>

      {/* 2. Word & Idiom of the Day */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Word of the Day Card */}
        <Card padding="md" className="space-y-3 bg-purple-50/40 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" /> Word of the Day (WOD)
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Word
            </label>
            <input
              type="text"
              value={activeMeeting.wordOfDay}
              onChange={(e) => updateMeeting({ wordOfDay: e.target.value })}
              placeholder="e.g. Venerable"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Meaning
            </label>
            <textarea
              rows={2}
              value={activeMeeting.wordMeaning || ''}
              onChange={(e) => updateMeeting({ wordMeaning: e.target.value })}
              placeholder="e.g. Worthy of respect because of age, wisdom, or character."
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-700 dark:text-slate-300"
            />
          </div>
        </Card>

        {/* Idiom of the Day Card */}
        <Card padding="md" className="space-y-3 bg-sky-50/40 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-sm">
            <Quote className="w-4 h-4" /> Idiom of the Day
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Idiom
            </label>
            <input
              type="text"
              value={activeMeeting.idiom}
              onChange={(e) => updateMeeting({ idiom: e.target.value })}
              placeholder="e.g. In the autumn of one's years"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Meaning
            </label>
            <textarea
              rows={2}
              value={activeMeeting.idiomMeaning || ''}
              onChange={(e) => updateMeeting({ idiomMeaning: e.target.value })}
              placeholder="e.g. In the late period or mature stage of life."
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-slate-700 dark:text-slate-300"
            />
          </div>
        </Card>
      </div>

      {/* 3. TAG Roles */}
      <RoleAssignmentSection
        roles={roles}
        onUpdateRole={setRoleAssignment}
        onOpenRole={onOpenRole}
      />

      {/* 4. Agenda & Speaker List */}
      <AgendaManager
        speakers={speakers}
        onAddSpeaker={addSpeaker}
        onUpdateSpeaker={updateSpeaker}
        onDeleteSpeaker={deleteSpeaker}
        onReorderSpeakers={reorderSpeakers}
      />
    </div>
  );
};
