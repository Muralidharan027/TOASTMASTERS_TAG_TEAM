import React from 'react';
import { Timer, MessageSquareOff, BookOpen, Trophy } from 'lucide-react';
import type { TagRoleType } from '../../types';

interface RoleTabsProps {
  activeRole: TagRoleType;
  onSelectRole: (role: TagRoleType) => void;
  stats?: {
    timerCount?: number;
    ahCount?: number;
    grammarianCount?: number;
    triviaCount?: number;
  };
}

export const RoleTabs: React.FC<RoleTabsProps> = ({
  activeRole,
  onSelectRole,
  stats,
}) => {
  const roles: {
    id: TagRoleType;
    letter: string;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    color: string;
    activeClasses: string;
    badgeCount?: number;
  }[] = [
    {
      id: 'timer',
      letter: 'T',
      label: 'Timer',
      sublabel: 'Time it',
      icon: Timer,
      color: 'text-emerald-600 dark:text-emerald-400',
      activeClasses: 'bg-emerald-600 text-white shadow-card',
      badgeCount: stats?.timerCount,
    },
    {
      id: 'ahCounter',
      letter: 'A',
      label: 'Ah-Counter',
      sublabel: 'Analyze it',
      icon: MessageSquareOff,
      color: 'text-amber-600 dark:text-amber-400',
      activeClasses: 'bg-amber-600 text-white shadow-card',
      badgeCount: stats?.ahCount,
    },
    {
      id: 'grammarian',
      letter: 'G',
      label: 'Grammarian',
      sublabel: 'Grow with words',
      icon: BookOpen,
      color: 'text-purple-600 dark:text-purple-400',
      activeClasses: 'bg-purple-600 text-white shadow-card',
      badgeCount: stats?.grammarianCount,
    },
    {
      id: 'triviaMaster',
      letter: 'T',
      label: 'Trivia Master',
      sublabel: 'Test knowledge',
      icon: Trophy,
      color: 'text-sky-600 dark:text-sky-400',
      activeClasses: 'bg-sky-600 text-white shadow-card',
      badgeCount: stats?.triviaCount,
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1.5 shadow-subtle">
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        {roles.map((r) => {
          const isActive = activeRole === r.id;
          const Icon = r.icon;

          return (
            <button
              key={r.id}
              onClick={() => onSelectRole(r.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 py-2.5 px-2 rounded-xl transition-all duration-150 relative cursor-pointer ${
                isActive
                  ? r.activeClasses
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-black text-sm sm:text-base font-mono px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {r.letter}
                </span>
                <Icon className="w-4 h-4 hidden md:inline-block" />
              </div>

              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm font-bold leading-none truncate">
                  {r.label}
                </div>
                <div
                  className={`text-[10px] hidden lg:block mt-0.5 font-medium leading-none ${
                    isActive ? 'text-white/80' : 'text-slate-400'
                  }`}
                >
                  {r.sublabel}
                </div>
              </div>

              {/* Counter badge if any */}
              {r.badgeCount !== undefined && r.badgeCount > 0 && (
                <span
                  className={`hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {r.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
