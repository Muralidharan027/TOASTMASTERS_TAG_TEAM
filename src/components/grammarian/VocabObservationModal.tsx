import React, { useState } from 'react';
import type { Speaker, GrammarianRecordType } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface VocabObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: GrammarianRecordType;
  speakers: Speaker[];
  onSave: (
    type: GrammarianRecordType,
    value: string,
    speakerId?: string,
    speakerName?: string,
    meaning?: string,
    notes?: string
  ) => void;
}

export const VocabObservationModal: React.FC<VocabObservationModalProps> = ({
  isOpen,
  onClose,
  type,
  speakers,
  onSave,
}) => {
  const [speakerId, setSpeakerId] = useState('');
  const [value, setValue] = useState('');
  const [meaning, setMeaning] = useState('');
  const [notes, setNotes] = useState('');

  const getTitleAndDetails = () => {
    switch (type) {
      case 'uniqueWord':
        return {
          title: 'Record Unique Word',
          valLabel: 'Word *',
          valPlaceholder: 'e.g. Resilience, Ephemeral, Synergy...',
          showMeaning: true,
          notesLabel: 'Usage Context / Quote (Optional)',
        };
      case 'goodExpression':
        return {
          title: 'Record Good Expression / Metaphor',
          valLabel: 'Expression or Phrase *',
          valPlaceholder: 'e.g. Echoes of authenticity, Standing on shoulders of giants...',
          showMeaning: false,
          notesLabel: 'Why it stood out (Optional)',
        };
      case 'grammar':
        return {
          title: 'Record Grammar Observation',
          valLabel: 'Grammar Note / Correction *',
          valPlaceholder: 'e.g. "each of them were" -> "each of them was"',
          showMeaning: false,
          notesLabel: 'Constructive Suggestion (Optional)',
        };
      case 'pronunciation':
        return {
          title: 'Record Pronunciation Note',
          valLabel: 'Mispronounced Word & Correct Pronunciation *',
          valPlaceholder: 'e.g. Epitome (pronounced eh-PIT-uh-mee)',
          showMeaning: false,
          notesLabel: 'Notes (Optional)',
        };
      default:
        return {
          title: 'Record Observation',
          valLabel: 'Observation *',
          valPlaceholder: 'e.g. Excellent vocal variety, strong conclusion...',
          showMeaning: false,
          notesLabel: 'Notes (Optional)',
        };
    }
  };

  const details = getTitleAndDetails();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    const speaker = speakers.find((s) => s.id === speakerId);
    onSave(
      type,
      value.trim(),
      speaker?.id,
      speaker?.name || 'General Meeting',
      meaning.trim() || undefined,
      notes.trim() || undefined
    );

    setValue('');
    setMeaning('');
    setNotes('');
    setSpeakerId('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={details.title}
      description="Capture linguistic observations for the final Grammarian report"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Speaker (Optional / General) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Speaker (Optional)
          </label>
          <select
            value={speakerId}
            onChange={(e) => setSpeakerId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="">General Meeting Observation</option>
            {speakers.map((spk) => (
              <option key={spk.id} value={spk.id}>
                {spk.name} ({spk.role})
              </option>
            ))}
          </select>
        </div>

        {/* Primary Value */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {details.valLabel}
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder={details.valPlaceholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Meaning if uniqueWord */}
        {details.showMeaning && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Meaning (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Capacity to recover quickly from difficulties"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Context / Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {details.notesLabel}
          </label>
          <input
            type="text"
            placeholder="e.g. Excellent metaphor during speech body"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="grammar">
            Save Observation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
