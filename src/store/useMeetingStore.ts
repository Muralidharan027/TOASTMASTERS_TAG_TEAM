import { create } from 'zustand';
import type { Meeting, RoleAssignment, Speaker, TagRoleType } from '../types';
import { storage } from '../db/storage';
import { seedInitialDataIfNeeded } from '../db/seedData';

interface MeetingState {
  meetings: Meeting[];
  activeMeeting: Meeting | null;
  roles: RoleAssignment[];
  speakers: Speaker[];
  activeSpeakerId: string | null;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  loadMeeting: (id: string) => Promise<void>;
  refreshMeetingsList: () => Promise<void>;
  createMeeting: (
    meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>,
    roleData: { timer?: string; ahCounter?: string; grammarian?: string; triviaMaster?: string },
    initialSpeakers?: Omit<Speaker, 'id' | 'meetingId' | 'order' | 'status'>[]
  ) => Promise<string>;
  updateMeeting: (updates: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  setRoleAssignment: (role: TagRoleType, personName: string) => Promise<void>;
  addSpeaker: (speakerData: Omit<Speaker, 'id' | 'meetingId' | 'order' | 'status'>) => Promise<Speaker>;
  updateSpeaker: (id: string, updates: Partial<Speaker>) => Promise<void>;
  deleteSpeaker: (id: string) => Promise<void>;
  reorderSpeakers: (newOrder: Speaker[]) => Promise<void>;
  setActiveSpeakerId: (id: string | null) => void;
  nextSpeaker: () => void;
  prevSpeaker: () => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  activeMeeting: null,
  roles: [],
  speakers: [],
  activeSpeakerId: null,
  isLoading: true,

  initialize: async () => {
    try {
      set({ isLoading: true });
      await seedInitialDataIfNeeded();
      const allMeetings = await storage.getAllMeetings();
      set({ meetings: allMeetings });

      // Automatically select the most recent or demo meeting if none active
      const currentActive = get().activeMeeting;
      if (!currentActive && allMeetings.length > 0) {
        await get().loadMeeting(allMeetings[0].id);
      }
    } catch (err) {
      console.error('Failed to initialize meeting store:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshMeetingsList: async () => {
    const allMeetings = await storage.getAllMeetings();
    set({ meetings: allMeetings });
  },

  loadMeeting: async (id: string) => {
    try {
      set({ isLoading: true });
      const meeting = await storage.getMeeting(id);
      if (!meeting) return;

      const roles = await storage.getRoles(id);
      const speakers = await storage.getSpeakers(id);

      const activeSpeaker = speakers.find((s) => s.status !== 'completed') || speakers[0] || null;

      set({
        activeMeeting: meeting,
        roles,
        speakers,
        activeSpeakerId: activeSpeaker ? activeSpeaker.id : null,
      });
    } catch (err) {
      console.error('Failed to load meeting:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  createMeeting: async (meetingData, roleData, initialSpeakers = []) => {
    const id = `mtg-${Date.now()}`;
    const now = Date.now();

    const newMeeting: Meeting = {
      ...meetingData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await storage.saveMeeting(newMeeting);

    // Save roles
    const roles: RoleAssignment[] = [
      { id: `role-${id}-timer`, meetingId: id, role: 'timer', personName: roleData.timer || '' },
      { id: `role-${id}-ah`, meetingId: id, role: 'ahCounter', personName: roleData.ahCounter || '' },
      { id: `role-${id}-gram`, meetingId: id, role: 'grammarian', personName: roleData.grammarian || '' },
      { id: `role-${id}-triv`, meetingId: id, role: 'triviaMaster', personName: roleData.triviaMaster || '' },
    ];

    for (const r of roles) {
      await storage.saveRole(r);
    }

    // Save speakers
    const speakersToSave: Speaker[] = initialSpeakers.map((spk, idx) => ({
      ...spk,
      id: `spk-${id}-${idx + 1}`,
      meetingId: id,
      order: idx + 1,
      status: 'pending',
    }));

    if (speakersToSave.length > 0) {
      await storage.saveSpeakers(speakersToSave);
    }

    await get().refreshMeetingsList();
    await get().loadMeeting(id);
    return id;
  },

  updateMeeting: async (updates) => {
    const current = get().activeMeeting;
    if (!current) return;

    const updated: Meeting = {
      ...current,
      ...updates,
      updatedAt: Date.now(),
    };

    await storage.saveMeeting(updated);
    set({ activeMeeting: updated });
    await get().refreshMeetingsList();
  },

  deleteMeeting: async (id: string) => {
    await storage.deleteMeeting(id);
    const all = await storage.getAllMeetings();
    set({ meetings: all });

    if (get().activeMeeting?.id === id) {
      if (all.length > 0) {
        await get().loadMeeting(all[0].id);
      } else {
        set({ activeMeeting: null, roles: [], speakers: [], activeSpeakerId: null });
      }
    }
  },

  setRoleAssignment: async (role: TagRoleType, personName: string) => {
    const meeting = get().activeMeeting;
    if (!meeting) return;

    const existingRole = get().roles.find((r) => r.role === role);
    const updatedRole: RoleAssignment = {
      id: existingRole ? existingRole.id : `role-${meeting.id}-${role}`,
      meetingId: meeting.id,
      role,
      personName,
    };

    await storage.saveRole(updatedRole);
    const roles = await storage.getRoles(meeting.id);
    set({ roles });
  },

  addSpeaker: async (speakerData) => {
    const meeting = get().activeMeeting;
    if (!meeting) throw new Error('No active meeting');

    const currentSpeakers = get().speakers;
    const newSpeaker: Speaker = {
      ...speakerData,
      id: `spk-${Date.now()}`,
      meetingId: meeting.id,
      order: currentSpeakers.length + 1,
      status: 'pending',
    };

    await storage.saveSpeaker(newSpeaker);
    const speakers = await storage.getSpeakers(meeting.id);
    set({
      speakers,
      activeSpeakerId: get().activeSpeakerId || newSpeaker.id,
    });
    return newSpeaker;
  },

  updateSpeaker: async (id: string, updates: Partial<Speaker>) => {
    const meeting = get().activeMeeting;
    if (!meeting) return;

    const speaker = get().speakers.find((s) => s.id === id);
    if (!speaker) return;

    const updatedSpeaker: Speaker = {
      ...speaker,
      ...updates,
    };

    await storage.saveSpeaker(updatedSpeaker);
    const speakers = await storage.getSpeakers(meeting.id);
    set({ speakers });
  },

  deleteSpeaker: async (id: string) => {
    const meeting = get().activeMeeting;
    if (!meeting) return;

    await storage.deleteSpeaker(id);
    const speakers = await storage.getSpeakers(meeting.id);
    const currentActiveId = get().activeSpeakerId;
    const newActiveId = currentActiveId === id ? (speakers[0]?.id || null) : currentActiveId;

    set({ speakers, activeSpeakerId: newActiveId });
  },

  reorderSpeakers: async (newOrder: Speaker[]) => {
    const meeting = get().activeMeeting;
    if (!meeting) return;

    const updated = newOrder.map((spk, idx) => ({ ...spk, order: idx + 1 }));
    await storage.saveSpeakers(updated);
    set({ speakers: updated });
  },

  setActiveSpeakerId: (id: string | null) => {
    set({ activeSpeakerId: id });
  },

  nextSpeaker: () => {
    const { speakers, activeSpeakerId } = get();
    if (speakers.length === 0) return;
    const currentIndex = speakers.findIndex((s) => s.id === activeSpeakerId);
    if (currentIndex >= 0 && currentIndex < speakers.length - 1) {
      set({ activeSpeakerId: speakers[currentIndex + 1].id });
    }
  },

  prevSpeaker: () => {
    const { speakers, activeSpeakerId } = get();
    if (speakers.length === 0) return;
    const currentIndex = speakers.findIndex((s) => s.id === activeSpeakerId);
    if (currentIndex > 0) {
      set({ activeSpeakerId: speakers[currentIndex - 1].id });
    }
  },
}));
