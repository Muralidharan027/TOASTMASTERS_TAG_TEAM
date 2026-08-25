import React from 'react';
import {
  Maximize2,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Layers,
  ChevronDown,
} from 'lucide-react';
import type { Meeting } from '../../types';
import { useSettingsStore } from '../../store/useSettingsStore';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  activeMeeting: Meeting | null;
  onOpenMeetingPicker: () => void;
  onToggleLiveMode: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  activeMeeting,
  onOpenMeetingPicker,
  onToggleLiveMode,
  onOpenSettings,
}) => {
  const { settings, setTheme } = useSettingsStore();

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'meeting', label: 'Meeting Setup' },
    { id: 'timer', label: 'Timer' },
    { id: 'ahCounter', label: 'Ah-Counter' },
    { id: 'grammarian', label: 'Grammarian' },
    { id: 'triviaMaster', label: 'Trivia Master' },
    { id: 'report', label: 'Meeting Report' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              {/* TAG TEAM 4-quadrant minimal emblem */}
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white p-1 flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform">
                <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                  <div className="bg-emerald-500 rounded-[2px] flex items-center justify-center text-[9px] font-black text-slate-950">T</div>
                  <div className="bg-amber-500 rounded-[2px] flex items-center justify-center text-[9px] font-black text-slate-950">A</div>
                  <div className="bg-purple-500 rounded-[2px] flex items-center justify-center text-[9px] font-black text-slate-950">G</div>
                  <div className="bg-sky-500 rounded-[2px] flex items-center justify-center text-[9px] font-black text-slate-950">T</div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                    TAG TEAM
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    TOASTMASTERS
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-none mt-0.5 hidden sm:block">
                  Track. Analyze. Grow.
                </div>
              </div>
            </button>

            {/* Active Meeting Pill */}
            {activeMeeting && (
              <button
                onClick={onOpenMeetingPicker}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors ml-2"
                title="Switch Meeting"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="max-w-[140px] truncate">{activeMeeting.meetingNumber}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Live Mode button */}
            <button
              onClick={onToggleLiveMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 dark:border-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Enter Focused Live Meeting Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LIVE MODE</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Settings"
              title="Settings & Shortcuts"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
