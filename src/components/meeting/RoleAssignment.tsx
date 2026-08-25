import React from 'react';
import { Timer, MessageSquareOff, BookOpen, Trophy, ArrowRight, UserCheck } from 'lucide-react';
import type { RoleAssignment, TagRoleType } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface RoleAssignmentProps {
  roles: RoleAssignment[];
  onUpdateRole: (role: TagRoleType, name: string) => void;
  onOpenRole: (role: TagRoleType) => void;
}

export const RoleAssignmentSection: React.FC<RoleAssignmentProps> = ({
  roles,
  onUpdateRole,
  onOpenRole,
}) => {
  const roleConfigs: {
    id: TagRoleType;
    letter: string;
    title: string;
    desc: string;
    icon: React.ElementType;
    color: string;
    bgBadge: string;
  }[] = [
    {
      id: 'timer',
      letter: 'T',
      title: 'Timer',
      desc: 'Track speaking durations and signal green/yellow/red milestones.',
      icon: Timer,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgBadge: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'ahCounter',
      letter: 'A',
      title: 'Ah-Counter',
      desc: 'Count filler words, sounds, crutch phrases, and repetitions.',
      icon: MessageSquareOff,
      color: 'text-amber-600 dark:text-amber-400',
      bgBadge: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'grammarian',
      letter: 'G',
      title: 'Grammarian',
      desc: 'Note Word of the Day usage, idioms, creative vocab, and grammar tips.',
      icon: BookOpen,
      color: 'text-purple-600 dark:text-purple-400',
      bgBadge: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'triviaMaster',
      letter: 'T',
      title: 'Trivia Master',
      desc: 'Lead the meeting quiz, track scores, and award the winner.',
      icon: Trophy,
      color: 'text-sky-600 dark:text-sky-400',
      bgBadge: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-slate-500" />
            TAG TEAM Roles
          </h3>
          <p className="text-xs text-slate-500">
            Assign the four role players. Each role card allows immediate launch into that role's workspace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {roleConfigs.map((cfg) => {
          const assignment = roles.find((r) => r.role === cfg.id);
          const currentName = assignment?.personName || '';
          const Icon = cfg.icon;

          return (
            <Card key={cfg.id} padding="md" className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 rounded-xl border flex items-center justify-center font-mono font-black text-sm ${cfg.bgBadge}`}>
                    {cfg.letter}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight flex items-center gap-1.5">
                      {cfg.title}
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{cfg.desc}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Role Player Name
                </label>
                <input
                  type="text"
                  placeholder={`e.g. TM ${cfg.title} Name`}
                  value={currentName}
                  onChange={(e) => onUpdateRole(cfg.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
                />
              </div>

              <div className="pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => onOpenRole(cfg.id)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold"
                >
                  Open {cfg.title} Workspace
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
