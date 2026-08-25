import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { Speaker } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { formatDurationRange } from '../../utils/formatting';

interface AgendaManagerProps {
  speakers: Speaker[];
  onAddSpeaker: (data: Omit<Speaker, 'id' | 'meetingId' | 'order' | 'status'>) => Promise<Speaker>;
  onUpdateSpeaker: (id: string, data: Partial<Speaker>) => void;
  onDeleteSpeaker: (id: string) => void;
  onReorderSpeakers: (newOrder: Speaker[]) => void;
}

const PRESET_ROLES = [
  { label: 'Prepared Speech (5–7 mins)', role: 'Prepared Speaker', session: 'Prepared Speeches', min: 300, max: 420 },
  { label: 'Table Topics (1–2 mins)', role: 'Table Topics Speaker', session: 'Table Topics', min: 60, max: 120 },
  { label: 'Speech Evaluation (2–3 mins)', role: 'Speech Evaluator', session: 'Evaluation', min: 120, max: 180 },
  { label: 'Icebreaker Speech (4–6 mins)', role: 'Icebreaker Speaker', session: 'Prepared Speeches', min: 240, max: 360 },
  { label: 'Presiding Officer (3–5 mins)', role: 'Presiding Officer', session: 'Opening', min: 180, max: 300 },
  { label: 'Toastmaster of Day (3–5 mins)', role: 'Toastmaster of the Day', session: 'Main Session', min: 180, max: 300 },
  { label: 'General Evaluator (3–5 mins)', role: 'General Evaluator', session: 'General Evaluation', min: 180, max: 300 },
];

export const AgendaManager: React.FC<AgendaManagerProps> = ({
  speakers,
  onAddSpeaker,
  onUpdateSpeaker,
  onDeleteSpeaker,
  onReorderSpeakers,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('Prepared Speaker');
  const [session, setSession] = useState('Prepared Speeches');
  const [minMinutes, setMinMinutes] = useState(5);
  const [maxMinutes, setMaxMinutes] = useState(7);

  const resetForm = () => {
    setName('');
    setRole('Prepared Speaker');
    setSession('Prepared Speeches');
    setMinMinutes(5);
    setMaxMinutes(7);
    setEditingSpeakerId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (speaker: Speaker) => {
    setEditingSpeakerId(speaker.id);
    setName(speaker.name);
    setRole(speaker.role);
    setSession(speaker.session || '');
    setMinMinutes(Math.floor(speaker.allocatedMin / 60));
    setMaxMinutes(Math.floor(speaker.allocatedMax / 60));
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof PRESET_ROLES[0]) => {
    setRole(preset.role);
    setSession(preset.session);
    setMinMinutes(Math.floor(preset.min / 60));
    setMaxMinutes(Math.floor(preset.max / 60));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const allocatedMin = Math.max(1, minMinutes) * 60;
    const allocatedMax = Math.max(minMinutes, maxMinutes) * 60;

    if (editingSpeakerId) {
      onUpdateSpeaker(editingSpeakerId, {
        name: name.trim(),
        role: role.trim(),
        session: session.trim(),
        allocatedMin,
        allocatedMax,
      });
    } else {
      await onAddSpeaker({
        name: name.trim(),
        role: role.trim(),
        session: session.trim(),
        allocatedMin,
        allocatedMax,
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...speakers];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    onReorderSpeakers(copy);
  };

  const moveDown = (index: number) => {
    if (index >= speakers.length - 1) return;
    const copy = [...speakers];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    onReorderSpeakers(copy);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500" />
            Shared Speaker List & Agenda
          </h3>
          <p className="text-xs text-slate-500">
            Speakers added here automatically appear across Timer, Ah-Counter, Grammarian, and Trivia.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Add Speaker
        </Button>
      </div>

      {speakers.length === 0 ? (
        <Card variant="subtle" className="text-center py-8">
          <p className="text-sm text-slate-500 mb-3">No speakers added to the agenda yet.</p>
          <Button size="sm" variant="outline" onClick={handleOpenAdd}>
            + Add First Speaker
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {speakers.map((spk, idx) => (
            <div
              key={spk.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-subtle flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              {/* Left info */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {spk.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {spk.role}
                    </span>
                    {spk.session && <span>• {spk.session}</span>}
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-slate-600 dark:text-slate-300">
                      <Clock className="w-3 h-3" />
                      {formatDurationRange(spk.allocatedMin, spk.allocatedMax)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors cursor-pointer"
                  title="Move Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === speakers.length - 1}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors cursor-pointer"
                  title="Move Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(spk)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Edit Speaker"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteSpeaker(spk.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete Speaker"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Speaker Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSpeakerId ? 'Edit Speaker' : 'Add Agenda Speaker'}
        description="Configure speaker name, speech type, and timing thresholds"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Timing Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ROLES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Speaker Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TM Amanda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
          </div>

          {/* Role & Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Role / Speech Type *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Prepared Speaker"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Session (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Prepared Speeches"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
          </div>

          {/* Timing Allocation */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                Min Time (Green Signal)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={minMinutes}
                  onChange={(e) => setMinMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
                <span className="text-xs font-semibold text-slate-500">mins</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-1">
                Max Time (Red Signal)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={maxMinutes}
                  onChange={(e) => setMaxMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
                <span className="text-xs font-semibold text-slate-500">mins</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingSpeakerId ? 'Save Changes' : 'Add Speaker'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
