import { create } from 'zustand';
import confetti from 'canvas-confetti';
import type { TriviaQuestion, TriviaParticipant } from '../types';
import { storage } from '../db/storage';
import { triggerHaptic } from '../utils/haptics';

interface TriviaState {
  questions: TriviaQuestion[];
  participants: TriviaParticipant[];
  activeMeetingId: string | null;
  activeQuestionIndex: number;
  isAnswerRevealed: boolean;
  isLiveMode: boolean;

  // Actions
  loadTrivia: (meetingId: string) => Promise<void>;
  addQuestion: (
    meetingId: string,
    questionData: Omit<TriviaQuestion, 'id' | 'meetingId' | 'order'>
  ) => Promise<TriviaQuestion>;
  updateQuestion: (id: string, updates: Partial<TriviaQuestion>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  reorderQuestions: (newOrder: TriviaQuestion[]) => Promise<void>;

  addParticipant: (meetingId: string, name: string) => Promise<TriviaParticipant>;
  deleteParticipant: (id: string) => Promise<void>;
  awardPoints: (participantId: string, points: number) => Promise<void>;
  setScore: (participantId: string, exactScore: number) => Promise<void>;
  resetAllScores: (meetingId: string) => Promise<void>;

  // Live controls
  setLiveMode: (active: boolean) => void;
  setActiveQuestionIndex: (index: number) => void;
  revealAnswer: () => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  celebrateWinner: () => void;
}

export const useTriviaStore = create<TriviaState>((set, get) => ({
  questions: [],
  participants: [],
  activeMeetingId: null,
  activeQuestionIndex: 0,
  isAnswerRevealed: false,
  isLiveMode: false,

  loadTrivia: async (meetingId: string) => {
    const questions = await storage.getTriviaQuestions(meetingId);
    const participants = await storage.getTriviaParticipants(meetingId);
    set({
      questions,
      participants,
      activeMeetingId: meetingId,
      activeQuestionIndex: 0,
      isAnswerRevealed: false,
    });
  },

  addQuestion: async (meetingId, questionData) => {
    const questions = get().questions;
    const newQuestion: TriviaQuestion = {
      ...questionData,
      id: `tq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      meetingId,
      order: questions.length + 1,
    };

    await storage.saveTriviaQuestion(newQuestion);
    const updated = await storage.getTriviaQuestions(meetingId);
    set({ questions: updated });
    return newQuestion;
  },

  updateQuestion: async (id, updates) => {
    const questions = get().questions;
    const target = questions.find((q) => q.id === id);
    if (!target) return;

    const updated = { ...target, ...updates };
    await storage.saveTriviaQuestion(updated);
    if (target.meetingId) {
      const all = await storage.getTriviaQuestions(target.meetingId);
      set({ questions: all });
    }
  },

  deleteQuestion: async (id) => {
    await storage.deleteTriviaQuestion(id);
    const meetingId = get().activeMeetingId;
    if (meetingId) {
      const all = await storage.getTriviaQuestions(meetingId);
      set({ questions: all });
    }
  },

  reorderQuestions: async (newOrder) => {
    const updated = newOrder.map((q, idx) => ({ ...q, order: idx + 1 }));
    for (const q of updated) {
      await storage.saveTriviaQuestion(q);
    }
    set({ questions: updated });
  },

  addParticipant: async (meetingId, name) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Participant name is required');

    const newParticipant: TriviaParticipant = {
      id: `tp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      meetingId,
      name: trimmed,
      score: 0,
    };

    await storage.saveTriviaParticipant(newParticipant);
    const updated = await storage.getTriviaParticipants(meetingId);
    set({ participants: updated });
    return newParticipant;
  },

  deleteParticipant: async (id) => {
    await storage.deleteTriviaParticipant(id);
    const meetingId = get().activeMeetingId;
    if (meetingId) {
      const all = await storage.getTriviaParticipants(meetingId);
      set({ participants: all });
    }
  },

  awardPoints: async (participantId, deltaPoints) => {
    triggerHaptic('tap');
    const participants = get().participants;
    const target = participants.find((p) => p.id === participantId);
    if (!target) return;

    const newScore = Math.max(0, target.score + deltaPoints);
    const updated = { ...target, score: newScore };
    await storage.saveTriviaParticipant(updated);

    if (target.meetingId) {
      const all = await storage.getTriviaParticipants(target.meetingId);
      set({ participants: all });
    }
  },

  setScore: async (participantId, exactScore) => {
    const participants = get().participants;
    const target = participants.find((p) => p.id === participantId);
    if (!target) return;

    const updated = { ...target, score: Math.max(0, exactScore) };
    await storage.saveTriviaParticipant(updated);

    if (target.meetingId) {
      const all = await storage.getTriviaParticipants(target.meetingId);
      set({ participants: all });
    }
  },

  resetAllScores: async (meetingId) => {
    const participants = get().participants;
    for (const p of participants) {
      await storage.saveTriviaParticipant({ ...p, score: 0 });
    }
    const updated = await storage.getTriviaParticipants(meetingId);
    set({ participants: updated });
  },

  setLiveMode: (active) => {
    set({ isLiveMode: active, isAnswerRevealed: false });
  },

  setActiveQuestionIndex: (index) => {
    set({ activeQuestionIndex: index, isAnswerRevealed: false });
  },

  revealAnswer: () => {
    triggerHaptic('success');
    set({ isAnswerRevealed: true });
  },

  nextQuestion: () => {
    const { questions, activeQuestionIndex } = get();
    if (activeQuestionIndex < questions.length - 1) {
      set({ activeQuestionIndex: activeQuestionIndex + 1, isAnswerRevealed: false });
    }
  },

  prevQuestion: () => {
    const { activeQuestionIndex } = get();
    if (activeQuestionIndex > 0) {
      set({ activeQuestionIndex: activeQuestionIndex - 1, isAnswerRevealed: false });
    }
  },

  celebrateWinner: () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284C7', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
      });
    } catch {
      // Confetti fallback
    }
  },
}));
