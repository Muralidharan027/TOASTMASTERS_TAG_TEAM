import React, { useEffect } from 'react';
import { Minimize2 } from 'lucide-react';
import { RoleTabs } from '../common/RoleTabs';
import { TimerDashboard } from '../timer/TimerDashboard';
import { AhCounterDashboard } from '../ahcounter/AhCounterDashboard';
import { GrammarianDashboard } from '../grammarian/GrammarianDashboard';
import { TriviaDashboard } from '../trivia/TriviaDashboard';
import type { TagRoleType, Meeting } from '../../types';

interface LiveMeetingModeProps {
  activeRole: TagRoleType;
  onSelectRole: (role: TagRoleType) => void;
  activeMeeting: Meeting;
  onExitLiveMode: () => void;
  stats?: {
    timerCount?: number;
    ahCount?: number;
    grammarianCount?: number;
    triviaCount?: number;
  };
}

export const LiveMeetingMode: React.FC<LiveMeetingModeProps> = ({
  activeRole,
  onSelectRole,
  activeMeeting,
  onExitLiveMode,
  stats,
}) => {
  // Prevent accidental page reload or back navigation during live meeting
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-slate-950 flex flex-col">
      {/* Focused Live Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-2.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              LIVE MEETING
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">• {activeMeeting.meetingNumber}</span>
          </div>

          <button
            onClick={onExitLiveMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            title="Exit Focused Live Mode"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Live Mode</span>
          </button>
        </div>

        {/* Quick Role Switcher */}
        <div className="max-w-4xl mx-auto mt-2">
          <RoleTabs
            activeRole={activeRole}
            onSelectRole={onSelectRole}
            stats={stats}
          />
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 pb-12 pt-2">
        {activeRole === 'timer' && <TimerDashboard />}
        {activeRole === 'ahCounter' && <AhCounterDashboard />}
        {activeRole === 'grammarian' && <GrammarianDashboard />}
        {activeRole === 'triviaMaster' && <TriviaDashboard />}
      </main>
    </div>
  );
};
