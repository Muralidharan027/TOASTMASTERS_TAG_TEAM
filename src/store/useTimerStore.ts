import { create } from 'zustand';
import type { TimerRecord, TimingSignal } from '../types';
import { storage } from '../db/storage';
import { calculateTimingStatus, getTimingSignal } from '../utils/formatting';
import { playSignalSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { useSettingsStore } from './useSettingsStore';

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  activeSpeakerId: string | null;
  activeMeetingId: string | null;
  signalState: TimingSignal;
  lastPlayedSignal: TimingSignal;
  isFullscreenSignal: boolean;
  timerRecords: TimerRecord[];

  // Actions
  loadRecords: (meetingId: string) => Promise<void>;
  setActiveSpeaker: (speakerId: string | null, meetingId: string | null) => Promise<void>;
  start: (allocatedMin: number, allocatedMax: number, warningTime?: number) => void;
  pause: () => void;
  resume: () => void;
  stopAndSave: (allocatedMin: number, allocatedMax: number) => Promise<TimerRecord | null>;
  reset: () => void;
  tick: (allocatedMin: number, allocatedMax: number, warningTime?: number) => void;
  setFullscreenSignal: (open: boolean) => void;
  updateRecordNotes: (recordId: string, notes: string) => Promise<void>;
}

let tickerInterval: number | null = null;

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  isPaused: false,
  elapsedSeconds: 0,
  activeSpeakerId: null,
  activeMeetingId: null,
  signalState: 'none',
  lastPlayedSignal: 'none',
  isFullscreenSignal: false,
  timerRecords: [],

  loadRecords: async (meetingId: string) => {
    const records = await storage.getAllTimerRecords(meetingId);
    set({ timerRecords: records, activeMeetingId: meetingId });
  },

  setActiveSpeaker: async (speakerId, meetingId) => {
    // If running, do not abruptly wipe out without warning, but reset clock
    if (get().isRunning) {
      if (tickerInterval) clearInterval(tickerInterval);
      set({ isRunning: false, isPaused: false });
    }

    set({
      activeSpeakerId: speakerId,
      activeMeetingId: meetingId,
      elapsedSeconds: 0,
      signalState: 'none',
      lastPlayedSignal: 'none',
    });

    if (speakerId && meetingId) {
      const existing = await storage.getTimerRecord(meetingId, speakerId);
      if (existing && existing.duration > 0) {
        set({ elapsedSeconds: existing.duration });
      }
    }
  },

  start: (allocatedMin, allocatedMax, warningTime) => {
    if (tickerInterval) clearInterval(tickerInterval);

    set({ isRunning: true, isPaused: false, lastPlayedSignal: 'none' });

    tickerInterval = window.setInterval(() => {
      get().tick(allocatedMin, allocatedMax, warningTime);
    }, 1000);
  },

  pause: () => {
    if (tickerInterval) clearInterval(tickerInterval);
    set({ isPaused: true });
  },

  resume: () => {
    set({ isPaused: false });
  },

  tick: (allocatedMin, allocatedMax, warningTime) => {
    if (get().isPaused) return;

    const newElapsed = get().elapsedSeconds + 1;
    const newSignal = getTimingSignal(newElapsed, allocatedMin, allocatedMax, warningTime);
    const lastSignal = get().lastPlayedSignal;

    // Check if signal reached a new milestone
    if (newSignal !== 'none' && newSignal !== lastSignal) {
      const settings = useSettingsStore.getState().settings;

      if (settings.timerSound) {
        playSignalSound(newSignal);
      }

      if (settings.timerVibration) {
        triggerHaptic(newSignal === 'over' ? 'warning' : 'signal');
      }

      set({ lastPlayedSignal: newSignal });
    }

    set({ elapsedSeconds: newElapsed, signalState: newSignal });
  },

  stopAndSave: async (allocatedMin, allocatedMax) => {
    if (tickerInterval) {
      clearInterval(tickerInterval);
      tickerInterval = null;
    }

    const { elapsedSeconds, activeSpeakerId, activeMeetingId } = get();
    if (!activeSpeakerId || !activeMeetingId) {
      set({ isRunning: false, isPaused: false });
      return null;
    }

    const status = calculateTimingStatus(elapsedSeconds, allocatedMin, allocatedMax);

    const record: TimerRecord = {
      id: `tr-${activeMeetingId}-${activeSpeakerId}`,
      meetingId: activeMeetingId,
      speakerId: activeSpeakerId,
      duration: elapsedSeconds,
      status,
    };

    await storage.saveTimerRecord(record);
    const allRecords = await storage.getAllTimerRecords(activeMeetingId);

    set({
      isRunning: false,
      isPaused: false,
      timerRecords: allRecords,
    });

    return record;
  },

  reset: () => {
    if (tickerInterval) {
      clearInterval(tickerInterval);
      tickerInterval = null;
    }
    set({
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      signalState: 'none',
      lastPlayedSignal: 'none',
    });
  },

  setFullscreenSignal: (open: boolean) => {
    set({ isFullscreenSignal: open });
  },

  updateRecordNotes: async (recordId: string, notes: string) => {
    const records = get().timerRecords;
    const target = records.find((r) => r.id === recordId);
    if (!target) return;

    const updated = { ...target, notes };
    await storage.saveTimerRecord(updated);
    if (target.meetingId) {
      const all = await storage.getAllTimerRecords(target.meetingId);
      set({ timerRecords: all });
    }
  },
}));
