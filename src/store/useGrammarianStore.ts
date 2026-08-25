import { create } from 'zustand';
import type { GrammarianRecord, GrammarianRecordType } from '../types';
import { storage } from '../db/storage';
import { triggerHaptic } from '../utils/haptics';

interface GrammarianState {
  records: GrammarianRecord[];
  activeMeetingId: string | null;

  // Actions
  loadRecords: (meetingId: string) => Promise<void>;
  addRecord: (
    meetingId: string,
    type: GrammarianRecordType,
    value: string,
    speakerId?: string,
    speakerName?: string,
    meaning?: string,
    notes?: string
  ) => Promise<GrammarianRecord>;
  deleteRecord: (id: string) => Promise<void>;
  updateRecord: (id: string, updates: Partial<GrammarianRecord>) => Promise<void>;
}

export const useGrammarianStore = create<GrammarianState>((set, get) => ({
  records: [],
  activeMeetingId: null,

  loadRecords: async (meetingId: string) => {
    const list = await storage.getGrammarianRecords(meetingId);
    set({ records: list, activeMeetingId: meetingId });
  },

  addRecord: async (meetingId, type, value, speakerId, speakerName, meaning, notes) => {
    triggerHaptic('tap');

    const newRecord: GrammarianRecord = {
      id: `gr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      meetingId,
      speakerId,
      speakerName,
      type,
      value,
      meaning,
      notes,
      timestamp: Date.now(),
    };

    await storage.saveGrammarianRecord(newRecord);
    const updated = await storage.getGrammarianRecords(meetingId);
    set({ records: updated });
    return newRecord;
  },

  deleteRecord: async (id: string) => {
    await storage.deleteGrammarianRecord(id);
    const current = get().records.filter((r) => r.id !== id);
    set({ records: current });
  },

  updateRecord: async (id: string, updates: Partial<GrammarianRecord>) => {
    const target = get().records.find((r) => r.id === id);
    if (!target) return;

    const updated = { ...target, ...updates };
    await storage.saveGrammarianRecord(updated);
    if (target.meetingId) {
      const all = await storage.getGrammarianRecords(target.meetingId);
      set({ records: all });
    }
  },
}));
