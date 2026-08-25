import React, { useState } from 'react';
import {
  Volume2,
  Smartphone,
  Download,
  Upload,
  Trash2,
  Plus,
  Command,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useMeetingStore } from '../../store/useMeetingStore';
import { storage } from '../../db/storage';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, addCustomFillerWord, removeCustomFillerWord, setTheme } = useSettingsStore();
  const { refreshMeetingsList, initialize } = useMeetingStore();

  const [newFillerWord, setNewFillerWord] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleAddFiller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFillerWord.trim()) return;
    addCustomFillerWord(newFillerWord.trim());
    setNewFillerWord('');
  };

  const handleExportBackup = async () => {
    const jsonString = await storage.exportDatabase();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TAG_TEAM_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        await storage.importDatabase(text);
        await refreshMeetingsList();
        setImportStatus('Backup successfully imported! ✓');
        setTimeout(() => setImportStatus(null), 3000);
      } catch {
        setImportStatus('Failed to import backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to clear all data and restore demo meetings?')) {
      await storage.clearAllData();
      await initialize();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="TAG TEAM Settings"
      description="Configure preferences, audio signals, custom words, and data backups"
      maxWidth="lg"
    >
      <div className="space-y-6 text-sm">
        {/* 1. Theme & Appearance */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Appearance Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                  settings.theme === mode
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 shadow-subtle'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Timer Feedback Settings */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Timer Signals & Notifications
          </label>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <span className="flex items-center gap-2 font-medium">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                Sound Chimes at Milestones (Green / Yellow / Red)
              </span>
              <input
                type="checkbox"
                checked={settings.timerSound}
                onChange={(e) => updateSettings({ timerSound: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <span className="flex items-center gap-2 font-medium">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                Haptic Vibration on Mobile
              </span>
              <input
                type="checkbox"
                checked={settings.timerVibration}
                onChange={(e) => updateSettings({ timerVibration: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* 3. Custom Filler Words Management */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Ah-Counter Custom Words
          </label>
          <form onSubmit={handleAddFiller} className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom filler word (e.g. Okay, Right)..."
              value={newFillerWord}
              onChange={(e) => setNewFillerWord(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <Button type="submit" size="sm" variant="ah" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add
            </Button>
          </form>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {settings.customFillerWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 font-medium"
              >
                {word}
                <button
                  type="button"
                  onClick={() => removeCustomFillerWord(word)}
                  className="hover:text-rose-600 cursor-pointer ml-1 text-slate-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 4. Keyboard Shortcuts Reference */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5" /> Desktop Keyboard Shortcuts
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div><strong>Space</strong>: Timer Start / Pause</div>
            <div><strong>R</strong>: Timer Reset</div>
            <div><strong>A / U / H</strong>: Count Ah / Um / Uh</div>
            <div><strong>R / O</strong>: Count Repetition / Other</div>
            <div><strong>Ctrl+Z</strong>: Undo Last Ah-Count</div>
            <div><strong>Esc</strong>: Close Modals</div>
          </div>
        </div>

        {/* 5. Data Export & Backup */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Data Storage & Backup (Offline-First)
          </label>

          {importStatus && (
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-bold">
              {importStatus}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportBackup}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export JSON Backup
            </Button>

            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center font-medium rounded-xl text-xs gap-1.5 h-9 px-3 min-h-[36px] bg-transparent text-slate-800 border border-slate-300 hover:bg-slate-50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800">
                <Upload className="w-4 h-4" /> Import Backup
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            <Button
              size="sm"
              variant="danger"
              onClick={handleResetData}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Reset to Demo Data
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
