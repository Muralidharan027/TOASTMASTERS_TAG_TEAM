import { create } from 'zustand';
import type { AhCounterRecord, AhActionLog } from '../types';
import { storage } from '../db/storage';
import { triggerHaptic } from '../utils/haptics';

interface AhCounterState {
  records: Record<string, AhCounterRecord>; // keyed by speakerId
  activeMeetingId: string | null;
  lastAction: { speakerId: string; label: string; word: string } | null;

  // Actions
  loadRecords: (meetingId: string) => Promise<void>;
  getRecordForSpeaker: (speakerId: string) => AhCounterRecord;
  incrementWord: (meetingId: string, speakerId: string, wordKey: string, label: string, isCustom?: boolean) => Promise<void>;
  undoLastAction: (meetingId: string, speakerId: string) => Promise<void>;
  updateNotes: (meetingId: string, speakerId: string, notes: string) => Promise<void>;
  resetCounts: (meetingId: string, speakerId: string) => Promise<void>;
}

const createEmptyRecord = (meetingId: string, speakerId: string): AhCounterRecord => ({
  id: `ah-${meetingId}-${speakerId}`,
  meetingId,
  speakerId,
  ah: 0,
  um: 0,
  uh: 0,
  er: 0,
  hmm: 0,
  youKnow: 0,
  like: 0,
  actually: 0,
  basically: 0,
  so: 0,
  iMean: 0,
  repetition: 0,
  incomplete: 0,
  other: 0,
  customCounts: {},
  notes: '',
  actionHistory: [],
});

export const useAhCounterStore = create<AhCounterState>((set, get) => ({
  records: {},
  activeMeetingId: null,
  lastAction: null,

  loadRecords: async (meetingId: string) => {
    const list = await storage.getAllAhCounterRecords(meetingId);
    const map: Record<string, AhCounterRecord> = {};
    list.forEach((rec) => {
      map[rec.speakerId] = rec;
    });
    set({ records: map, activeMeetingId: meetingId, lastAction: null });
  },

  getRecordForSpeaker: (speakerId: string) => {
    const meetingId = get().activeMeetingId || 'default';
    return get().records[speakerId] || createEmptyRecord(meetingId, speakerId);
  },

  incrementWord: async (meetingId, speakerId, wordKey, label, isCustom = false) => {
    triggerHaptic('tap');

    const currentMap = { ...get().records };
    const currentRec = currentMap[speakerId] || createEmptyRecord(meetingId, speakerId);

    const actionItem: AhActionLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      word: wordKey,
      label,
      timestamp: Date.now(),
    };

    let updatedRec: AhCounterRecord;

    if (isCustom) {
      const customCounts = { ...(currentRec.customCounts || {}) };
      customCounts[wordKey] = (customCounts[wordKey] || 0) + 1;
      updatedRec = {
        ...currentRec,
        customCounts,
        actionHistory: [actionItem, ...(currentRec.actionHistory || [])].slice(0, 50),
      };
    } else {
      const standardKeys = [
        'ah', 'um', 'uh', 'er', 'hmm', 'youKnow', 'like',
        'actually', 'basically', 'so', 'iMean', 'repetition', 'incomplete', 'other'
      ] as const;

      const key = wordKey as typeof standardKeys[number];
      const prevVal = currentRec[key] || 0;

      updatedRec = {
        ...currentRec,
        [key]: prevVal + 1,
        actionHistory: [actionItem, ...(currentRec.actionHistory || [])].slice(0, 50),
      };
    }

    currentMap[speakerId] = updatedRec;
    set({
      records: currentMap,
      lastAction: { speakerId, label, word: wordKey },
    });

    await storage.saveAhCounterRecord(updatedRec);
  },

  undoLastAction: async (_meetingId, speakerId) => {
    const currentMap = { ...get().records };
    const currentRec = currentMap[speakerId];
    if (!currentRec || !currentRec.actionHistory || currentRec.actionHistory.length === 0) {
      return;
    }

    triggerHaptic('tap');

    const [lastAction, ...remainingHistory] = currentRec.actionHistory;
    const wordKey = lastAction.word;

    let updatedRec: AhCounterRecord;

    if (currentRec.customCounts && currentRec.customCounts[wordKey] !== undefined) {
      const customCounts = { ...currentRec.customCounts };
      const currentVal = customCounts[wordKey] || 0;
      if (currentVal <= 1) {
        delete customCounts[wordKey];
      } else {
        customCounts[wordKey] = currentVal - 1;
      }
      updatedRec = {
        ...currentRec,
        customCounts,
        actionHistory: remainingHistory,
      };
    } else {
      const standardKeys = [
        'ah', 'um', 'uh', 'er', 'hmm', 'youKnow', 'like',
        'actually', 'basically', 'so', 'iMean', 'repetition', 'incomplete', 'other'
      ] as const;

      const key = wordKey as typeof standardKeys[number];
      const currentVal = currentRec[key] || 0;

      updatedRec = {
        ...currentRec,
        [key]: Math.max(0, currentVal - 1),
        actionHistory: remainingHistory,
      };
    }

    currentMap[speakerId] = updatedRec;
    set({
      records: currentMap,
      lastAction: remainingHistory.length > 0 ? {
        speakerId,
        label: remainingHistory[0].label,
        word: remainingHistory[0].word,
      } : null,
    });

    await storage.saveAhCounterRecord(updatedRec);
  },

  updateNotes: async (meetingId, speakerId, notes) => {
    const currentMap = { ...get().records };
    const currentRec = currentMap[speakerId] || createEmptyRecord(meetingId, speakerId);

    const updatedRec: AhCounterRecord = {
      ...currentRec,
      notes,
    };

    currentMap[speakerId] = updatedRec;
    set({ records: currentMap });
    await storage.saveAhCounterRecord(updatedRec);
  },

  resetCounts: async (meetingId, speakerId) => {
    const currentMap = { ...get().records };
    const emptyRec = createEmptyRecord(meetingId, speakerId);

    currentMap[speakerId] = emptyRec;
    set({
      records: currentMap,
      lastAction: null,
    });

    await storage.saveAhCounterRecord(emptyRec);
  },
}));
