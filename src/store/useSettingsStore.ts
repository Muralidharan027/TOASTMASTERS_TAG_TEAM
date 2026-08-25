import { create } from 'zustand';
import type { AppSettings } from '../types';

const STORAGE_KEY = 'tagteam_settings_v1';

const defaultSettings: AppSettings = {
  theme: 'light',
  timerSound: true,
  timerVibration: true,
  timerScreenFlash: true,
  customFillerWords: ['Right', 'Okay', 'Kind of', 'Sort of', 'I think'],
  ahCounterLayout: 'standard',
  defaultReportStyle: 'toastmasters',
};

interface SettingsState {
  settings: AppSettings;
  loadSettings: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  addCustomFillerWord: (word: string) => void;
  removeCustomFillerWord: (word: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,

  loadSettings: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ settings: { ...defaultSettings, ...parsed } });
      }
    } catch {
      // Use defaults
    }
  },

  updateSettings: (updates) => {
    const next = { ...get().settings, ...updates };
    set({ settings: next });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage error
    }
  },

  addCustomFillerWord: (word) => {
    const trimmed = word.trim();
    if (!trimmed) return;
    const current = get().settings.customFillerWords;
    if (current.includes(trimmed)) return;

    const next = [...current, trimmed];
    get().updateSettings({ customFillerWords: next });
  },

  removeCustomFillerWord: (word) => {
    const current = get().settings.customFillerWords;
    const next = current.filter((w) => w.toLowerCase() !== word.toLowerCase());
    get().updateSettings({ customFillerWords: next });
  },

  setTheme: (theme) => {
    get().updateSettings({ theme });
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  },
}));
