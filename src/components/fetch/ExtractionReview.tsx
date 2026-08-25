import React, { useState } from 'react';
import {
  Check,
  AlertTriangle,
  Edit2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Sparkles,
  Users,
  BookOpen,
  Quote,
  Timer,
  MessageSquareOff,
  Trophy,
} from 'lucide-react';
import type { FetchedMeetingData, FetchedAgendaItem, TagRoleType } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface ExtractionReviewProps {
  data: FetchedMeetingData;
  sourceImageUrl: string;
  onConfirm: (reviewed: FetchedMeetingData) => void;
  onBack: () => void;
}

const TAG_TEAM_ROLES: { id: TagRoleType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'timer', label: 'Timer', icon: Timer, color: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'ahCounter', label: 'Ah-Counter', icon: MessageSquareOff, color: 'text-amber-600 dark:text-amber-400' },
  { id: 'grammarian', label: 'Grammarian', icon: BookOpen, color: 'text-purple-600 dark:text-purple-400' },
  { id: 'triviaMaster', label: 'Trivia Master', icon: Trophy, color: 'text-sky-600 dark:text-sky-400' },
];

function ConfidenceBadge({ confidence }: { confidence: 'high' | 'review' }) {
  if (confidence === 'high') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
        <Check className="w-3 h-3" /> Detected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
      <AlertTriangle className="w-3 h-3" /> Review
    </span>
  );
}

function EditableField({
  label,
  value,
  onChange,
  confidence,
  placeholder,
  type = 'text',
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  confidence?: 'high' | 'review';
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  const base =
    'w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 transition-colors';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </label>
        {confidence && <ConfidenceBadge confidence={confidence} />}
      </div>
      {textarea ? (
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base + ' resize-none'}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

export const ExtractionReview: React.FC<ExtractionReviewProps> = ({
  data,
  sourceImageUrl,
  onConfirm,
  onBack,
}) => {
  const [draft, setDraft] = useState<FetchedMeetingData>({ ...data });
  const [showImage, setShowImage] = useState(false);
  const [editingAgendaIdx, setEditingAgendaIdx] = useState<number | null>(null);

  const update = (patch: Partial<FetchedMeetingData>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  // ── TAG TEAM role helpers ─────────────────────────────────────────────────
  const getTagTeamRolePerson = (tagRole: TagRoleType): string => {
    return draft.roles.find((r) => r.tagTeamRole === tagRole)?.person || '';
  };

  const setTagTeamRolePerson = (tagRole: TagRoleType, person: string) => {
    setDraft((prev) => {
      const roles = prev.roles.map((r) =>
        r.tagTeamRole === tagRole ? { ...r, person } : r,
      );
      // If no existing role has this tagTeamRole, add one
      if (!roles.find((r) => r.tagTeamRole === tagRole)) {
        roles.push({
          role: tagRole === 'ahCounter' ? 'Ah-Counter' : tagRole.charAt(0).toUpperCase() + tagRole.slice(1),
          tagTeamRole: tagRole,
          person,
          confidence: 'high',
        });
      }
      return { ...prev, roles };
    });
  };

  // ── Agenda helpers ────────────────────────────────────────────────────────
  const updateAgendaRow = (idx: number, patch: Partial<FetchedAgendaItem>) => {
    setDraft((prev) => {
      const agenda = prev.agenda.map((a, i) => (i === idx ? { ...a, ...patch } : a));
      return { ...prev, agenda };
    });
  };

  const deleteAgendaRow = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== idx),
    }));
  };

  const addAgendaRow = () => {
    const newRow: FetchedAgendaItem = { role: '', confidence: 'high' };
    setDraft((prev) => ({ ...prev, agenda: [...prev.agenda, newRow] }));
    setEditingAgendaIdx(draft.agenda.length);
  };

  // ── Summary counts ────────────────────────────────────────────────────────
  const tagTeamCount = TAG_TEAM_ROLES.filter((r) => getTagTeamRolePerson(r.id)).length;
  const agendaCount = draft.agenda.filter((a) => a.person || a.role).length;
  const reviewCount = draft.reviewFlags.length;

  return (
    <div className="space-y-6">
      {/* Review flags summary */}
      {reviewCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            A few details need your review
          </p>
          <ul className="space-y-0.5">
            {draft.reviewFlags.map((f, i) => (
              <li key={i} className="text-xs text-amber-700 dark:text-amber-400">
                · {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Overall confidence */}
      {draft.overallConfidence === 'high' && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            High confidence extraction — all key fields detected
          </p>
        </div>
      )}

      {/* Desktop: two-column; mobile: single */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left — Source image panel */}
        <div className="order-2 lg:order-1">
          <button
            type="button"
            onClick={() => setShowImage((v) => !v)}
            className="lg:hidden w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> View Original Brochure
            </span>
            {showImage ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className={`${showImage ? 'block' : 'hidden'} lg:block sticky top-4`}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 hidden lg:block">
              Source Brochure
            </p>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <img
                src={sourceImageUrl}
                alt="Original brochure"
                className="w-full object-contain max-h-[600px]"
              />
            </div>
          </div>
        </div>

        {/* Right — Extracted details */}
        <div className="order-1 lg:order-2 space-y-5">
          {/* Club name (read-only display) */}
          {draft.clubName && (
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
              {draft.clubName}
            </p>
          )}

          {/* Meeting Details */}
          <Card padding="md" className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Meeting Details</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EditableField
                label="Meeting Number"
                value={draft.meetingNumber || ''}
                onChange={(v) => update({ meetingNumber: v })}
                placeholder="e.g. Online Meeting #16"
                confidence={draft.meetingNumber ? 'high' : 'review'}
              />
              <EditableField
                label="Date"
                value={draft.date || ''}
                onChange={(v) => update({ date: v })}
                type="date"
                confidence={draft.date ? 'high' : 'review'}
              />
              <EditableField
                label="Start Time"
                value={draft.startTime || ''}
                onChange={(v) => update({ startTime: v })}
                placeholder="e.g. 10:00 AM"
                confidence={draft.startTime ? 'high' : 'review'}
              />
              <EditableField
                label="End Time"
                value={draft.endTime || ''}
                onChange={(v) => update({ endTime: v })}
                placeholder="e.g. 12:00 PM"
                confidence={draft.endTime ? 'high' : 'review'}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Meeting Type
              </label>
              <select
                value={draft.meetingType || 'online'}
                onChange={(e) => update({ meetingType: e.target.value as 'online' | 'offline' | 'hybrid' })}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="online">Online</option>
                <option value="offline">Offline / In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <EditableField
              label="Theme of the Day"
              value={draft.theme || ''}
              onChange={(v) => update({ theme: v })}
              placeholder="e.g. Better, or Just More You?"
              confidence={draft.theme ? 'high' : 'review'}
            />
          </Card>

          {/* Word & Idiom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card padding="md" className="space-y-3 bg-purple-50/40 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs">
                <BookOpen className="w-3.5 h-3.5" /> Word of the Day
              </div>
              <EditableField
                label="Word"
                value={draft.wordOfDay || ''}
                onChange={(v) => update({ wordOfDay: v })}
                placeholder="e.g. Venerable"
                confidence={draft.wordOfDay ? 'high' : 'review'}
              />
              <EditableField
                label="Meaning"
                value={draft.wordMeaning || ''}
                onChange={(v) => update({ wordMeaning: v })}
                placeholder="Optional meaning"
                textarea
              />
            </Card>

            <Card padding="md" className="space-y-3 bg-sky-50/40 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-xs">
                <Quote className="w-3.5 h-3.5" /> Idiom of the Day
              </div>
              <EditableField
                label="Idiom"
                value={draft.idiom || ''}
                onChange={(v) => update({ idiom: v })}
                placeholder="e.g. In the autumn of one's years"
                confidence={draft.idiom ? 'high' : 'review'}
              />
              <EditableField
                label="Meaning"
                value={draft.idiomMeaning || ''}
                onChange={(v) => update({ idiomMeaning: v })}
                placeholder="Optional meaning"
                textarea
              />
            </Card>
          </div>

          {/* TAG TEAM Roles */}
          <Card padding="md" className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              TAG TEAM Roles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TAG_TEAM_ROLES.map((cfg) => {
                const Icon = cfg.icon;
                const person = getTagTeamRolePerson(cfg.id);
                const matchedRole = draft.roles.find((r) => r.tagTeamRole === cfg.id);
                return (
                  <div key={cfg.id}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {cfg.label}
                      </label>
                      {matchedRole && <ConfidenceBadge confidence={matchedRole.confidence} />}
                    </div>
                    <input
                      type="text"
                      value={person}
                      onChange={(e) => setTagTeamRolePerson(cfg.id, e.target.value)}
                      placeholder={`e.g. TM ${cfg.label} Name`}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Agenda Table */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                Agenda ({draft.agenda.length} items)
              </h4>
              <Button size="sm" variant="outline" onClick={addAgendaRow} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add Row
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {draft.agenda.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-colors ${
                    item.confidence === 'review'
                      ? 'border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
                  }`}
                >
                  {editingAgendaIdx === idx ? (
                    // Inline editing
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.startTime || ''}
                          onChange={(e) => updateAgendaRow(idx, { startTime: e.target.value })}
                          placeholder="Time (e.g. 10:26)"
                          className="px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                        <input
                          type="text"
                          value={item.duration || ''}
                          onChange={(e) => updateAgendaRow(idx, { duration: e.target.value })}
                          placeholder="Duration (e.g. 5–6–7)"
                          className="px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                      <input
                        type="text"
                        value={item.role}
                        onChange={(e) => updateAgendaRow(idx, { role: e.target.value })}
                        placeholder="Role / Activity"
                        className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <input
                        type="text"
                        value={item.person || ''}
                        onChange={(e) => updateAgendaRow(idx, { person: e.target.value })}
                        placeholder="Person name"
                        className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <div className="flex justify-end">
                        <Button size="sm" variant="primary" onClick={() => setEditingAgendaIdx(null)}>
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.startTime && (
                            <span className="font-mono text-xs text-slate-500 shrink-0">{item.startTime}</span>
                          )}
                          {item.duration && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                              {item.duration}
                            </span>
                          )}
                          {item.confidence === 'review' && (
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                          {item.role}
                        </p>
                        {item.person && (
                          <p className="text-xs text-slate-500 truncate">{item.person}</p>
                        )}
                        {item.session && item.session !== item.role && (
                          <p className="text-[10px] text-slate-400 italic truncate">{item.session}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingAgendaIdx(idx)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAgendaRow(idx)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Summary + Create */}
          <Card padding="md" className="bg-slate-900 dark:bg-white border-slate-900 dark:border-white space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
              Ready to create?
            </p>
            <div className="space-y-1.5">
              {draft.meetingNumber && (
                <p className="font-black text-lg text-white dark:text-slate-900 leading-tight">
                  {draft.meetingNumber}
                </p>
              )}
              {draft.date && (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {new Date(draft.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                  {draft.startTime && ` · ${draft.startTime}`}
                  {draft.endTime && ` – ${draft.endTime}`}
                </p>
              )}
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-300 dark:text-slate-500">
                {agendaCount > 0 && <span>📋 {agendaCount} agenda items</span>}
                {tagTeamCount > 0 && <span>👥 {tagTeamCount} TAG TEAM roles</span>}
                {draft.theme && <span>✦ Theme detected</span>}
                {draft.wordOfDay && <span>📖 WOD detected</span>}
                {draft.idiom && <span>💬 Idiom detected</span>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button variant="outline" size="md" onClick={onBack} className="border-slate-700 dark:border-slate-300 text-slate-300 dark:text-slate-700 hover:bg-slate-800 dark:hover:bg-slate-100">
                ← Back
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 bg-violet-600 hover:bg-violet-700 border-violet-600"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() => onConfirm(draft)}
              >
                Create Meeting
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
