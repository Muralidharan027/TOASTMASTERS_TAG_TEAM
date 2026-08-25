import { useEffect, useState } from 'react';
import { useMeetingStore } from './store/useMeetingStore';
import { useTimerStore } from './store/useTimerStore';
import { useAhCounterStore } from './store/useAhCounterStore';
import { useGrammarianStore } from './store/useGrammarianStore';
import { useTriviaStore } from './store/useTriviaStore';
import { useSettingsStore } from './store/useSettingsStore';

// Components
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { RoleTabs } from './components/common/RoleTabs';
import { Modal } from './components/common/Modal';
import { HomeScreen } from './components/home/HomeScreen';
import { MeetingSetup } from './components/meeting/MeetingSetup';
import { TimerDashboard } from './components/timer/TimerDashboard';
import { AhCounterDashboard } from './components/ahcounter/AhCounterDashboard';
import { GrammarianDashboard } from './components/grammarian/GrammarianDashboard';
import { TriviaDashboard } from './components/trivia/TriviaDashboard';
import { LiveMeetingMode } from './components/live/LiveMeetingMode';
import { MeetingReportView } from './components/report/MeetingReportView';
import { SettingsModal } from './components/settings/SettingsModal';
import { formatDateString } from './utils/formatting';
import type { TagRoleType } from './types';

export function App() {
  const {
    meetings,
    activeMeeting,
    isLoading,
    initialize,
    loadMeeting,
    createMeeting,
  } = useMeetingStore();

  const { timerRecords, loadRecords: loadTimerRecords } = useTimerStore();
  const { records: ahRecordsMap, loadRecords: loadAhRecords } = useAhCounterStore();
  const { records: grammarianRecords, loadRecords: loadGrammarianRecords } = useGrammarianStore();
  const { questions: triviaQuestions, loadTrivia } = useTriviaStore();
  const { loadSettings } = useSettingsStore();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isMeetingPickerOpen, setIsMeetingPickerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize DB and settings on startup
  useEffect(() => {
    loadSettings();
    initialize();
  }, [loadSettings, initialize]);

  // Reload child stores whenever active meeting changes
  useEffect(() => {
    if (activeMeeting) {
      loadTimerRecords(activeMeeting.id);
      loadAhRecords(activeMeeting.id);
      loadGrammarianRecords(activeMeeting.id);
      loadTrivia(activeMeeting.id);
    }
  }, [activeMeeting, loadTimerRecords, loadAhRecords, loadGrammarianRecords, loadTrivia]);

  const handleNewMeeting = async () => {
    const today = new Date().toISOString().split('T')[0];
    await createMeeting(
      {
        meetingNumber: `Meeting #${meetings.length + 1}`,
        date: today,
        type: 'online',
        theme: '',
        wordOfDay: '',
        idiom: '',
      },
      {
        timer: '',
        ahCounter: '',
        grammarian: '',
        triviaMaster: '',
      },
      [
        { name: 'Speaker 1', role: 'Prepared Speaker', session: 'Prepared Speeches', allocatedMin: 300, allocatedMax: 420 },
        { name: 'Table Topics Speaker', role: 'Table Topics Speaker', session: 'Table Topics', allocatedMin: 60, allocatedMax: 120 },
        { name: 'Evaluator 1', role: 'Speech Evaluator', session: 'Evaluation', allocatedMin: 120, allocatedMax: 180 },
      ]
    );
    setActiveTab('meeting');
  };

  const handleOpenRole = (role: TagRoleType) => {
    setActiveTab(role);
  };

  // Compute live counts for badges
  const activeMeetingTimerCount = timerRecords.filter((r) => r.duration > 0).length;
  const activeMeetingAhCount = Object.values(ahRecordsMap).reduce((acc, r) => {
    return acc + r.ah + r.um + r.uh + r.er + r.hmm + r.youKnow + r.like + r.actually + r.basically + r.so + r.iMean + r.other;
  }, 0);
  const activeMeetingGrammarCount = grammarianRecords.filter((r) => r.type === 'wod').length;
  const activeMeetingTriviaCount = triviaQuestions.length;

  const roleStats = {
    timerCount: activeMeetingTimerCount,
    ahCount: activeMeetingAhCount,
    grammarianCount: activeMeetingGrammarCount,
    triviaCount: activeMeetingTriviaCount,
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-canvas-light dark:bg-slate-950 text-slate-900 dark:text-slate-100 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white p-1.5 flex items-center justify-center animate-pulse shadow-card">
          <div className="grid grid-cols-2 gap-1 w-full h-full">
            <div className="bg-emerald-500 rounded-xs" />
            <div className="bg-amber-500 rounded-xs" />
            <div className="bg-purple-500 rounded-xs" />
            <div className="bg-sky-500 rounded-xs" />
          </div>
        </div>
        <div className="font-extrabold text-sm tracking-widest text-slate-500">
          LOADING TAG TEAM...
        </div>
      </div>
    );
  }

  // If in Focused Live Mode
  if (isLiveMode && activeMeeting) {
    const validRole: TagRoleType = ['timer', 'ahCounter', 'grammarian', 'triviaMaster'].includes(activeTab)
      ? (activeTab as TagRoleType)
      : 'timer';

    return (
      <LiveMeetingMode
        activeRole={validRole}
        onSelectRole={(r) => setActiveTab(r)}
        activeMeeting={activeMeeting}
        onExitLiveMode={() => setIsLiveMode(false)}
        stats={roleStats}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-slate-200">
      {/* 1. Desktop & Mobile Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        activeMeeting={activeMeeting}
        onOpenMeetingPicker={() => setIsMeetingPickerOpen(true)}
        onToggleLiveMode={() => setIsLiveMode(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Quick Role Navigation Tabs (when in track roles or meeting active) */}
      {activeMeeting && activeTab !== 'home' && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-4">
          <RoleTabs
            activeRole={
              (['timer', 'ahCounter', 'grammarian', 'triviaMaster'].includes(activeTab)
                ? activeTab
                : 'timer') as TagRoleType
            }
            onSelectRole={(role) => setActiveTab(role)}
            stats={roleStats}
          />
        </div>
      )}

      {/* 3. Main Body Content */}
      <main className="flex-1 pb-24 xl:pb-12">
        {activeTab === 'home' && (
          <HomeScreen
            onNewMeetingClick={handleNewMeeting}
            onOpenMeeting={(id) => {
              loadMeeting(id);
              setActiveTab('meeting');
            }}
            onViewReport={(id) => {
              loadMeeting(id);
              setActiveTab('report');
            }}
          />
        )}

        {activeTab === 'meeting' && (
          <MeetingSetup onOpenRole={handleOpenRole} />
        )}

        {activeTab === 'timer' && <TimerDashboard />}
        {activeTab === 'ahCounter' && <AhCounterDashboard />}
        {activeTab === 'grammarian' && <GrammarianDashboard />}
        {activeTab === 'triviaMaster' && <TriviaDashboard />}
        {activeTab === 'report' && <MeetingReportView />}
      </main>

      {/* 4. Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* 5. Meeting Switcher Modal */}
      <Modal
        isOpen={isMeetingPickerOpen}
        onClose={() => setIsMeetingPickerOpen(false)}
        title="Switch Active Meeting"
        description="Choose a meeting to open and track"
      >
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {meetings.map((m) => {
            const isSelected = m.id === activeMeeting?.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  loadMeeting(m.id);
                  setIsMeetingPickerOpen(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-sm leading-tight">{m.meetingNumber}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      isSelected ? 'text-white/80 dark:text-slate-900/80' : 'text-slate-500'
                    }`}
                  >
                    {formatDateString(m.date)} • {m.type.toUpperCase()}{m.theme ? ` • "${m.theme}"` : ''}
                  </div>
                </div>
                {isSelected && <span className="text-xs font-black">ACTIVE</span>}
              </button>
            );
          })}
        </div>
      </Modal>

      {/* 6. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
