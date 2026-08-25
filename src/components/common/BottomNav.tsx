import React from 'react';
import { Home, Layers, FileText, Radio } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const isTrackRole = ['timer', 'ahCounter', 'grammarian', 'triviaMaster'].includes(activeTab);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: isTrackRole ? activeTab : 'timer', label: 'Track', icon: Radio, highlight: isTrackRole },
    { id: 'meeting', label: 'Agenda', icon: Layers },
    { id: 'report', label: 'Report', icon: FileText },
  ];

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-2 py-1 safe-bottom shadow-lg">
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.label === 'Track' && isTrackRole);

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-slate-900 dark:text-slate-100 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-slate-900 dark:text-slate-100' : ''
                  }`}
                />
                {tab.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
