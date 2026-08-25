import { db } from './index';
import type {
  Meeting,
  RoleAssignment,
  Speaker,
  TimerRecord,
  AhCounterRecord,
  GrammarianRecord,
  TriviaQuestion,
  TriviaParticipant,
  MeetingTemplate,
} from '../types';

export const storage = {
  // Meetings
  async getAllMeetings(): Promise<Meeting[]> {
    return db.meetings.orderBy('date').reverse().toArray();
  },

  async getMeeting(id: string): Promise<Meeting | undefined> {
    return db.meetings.get(id);
  },

  async saveMeeting(meeting: Meeting): Promise<void> {
    await db.meetings.put(meeting);
  },

  async deleteMeeting(id: string): Promise<void> {
    await db.transaction('rw', [
      db.meetings,
      db.roleAssignments,
      db.speakers,
      db.timerRecords,
      db.ahCounterRecords,
      db.grammarianRecords,
      db.triviaQuestions,
      db.triviaParticipants,
    ], async () => {
      await db.meetings.delete(id);
      await db.roleAssignments.where('meetingId').equals(id).delete();
      await db.speakers.where('meetingId').equals(id).delete();
      await db.timerRecords.where('meetingId').equals(id).delete();
      await db.ahCounterRecords.where('meetingId').equals(id).delete();
      await db.grammarianRecords.where('meetingId').equals(id).delete();
      await db.triviaQuestions.where('meetingId').equals(id).delete();
      await db.triviaParticipants.where('meetingId').equals(id).delete();
    });
  },

  // Roles
  async getRoles(meetingId: string): Promise<RoleAssignment[]> {
    return db.roleAssignments.where('meetingId').equals(meetingId).toArray();
  },

  async saveRole(role: RoleAssignment): Promise<void> {
    await db.roleAssignments.put(role);
  },

  // Speakers
  async getSpeakers(meetingId: string): Promise<Speaker[]> {
    return db.speakers.where('meetingId').equals(meetingId).sortBy('order');
  },

  async saveSpeaker(speaker: Speaker): Promise<void> {
    await db.speakers.put(speaker);
  },

  async saveSpeakers(speakers: Speaker[]): Promise<void> {
    await db.speakers.bulkPut(speakers);
  },

  async deleteSpeaker(speakerId: string): Promise<void> {
    await db.transaction('rw', [db.speakers, db.timerRecords, db.ahCounterRecords], async () => {
      await db.speakers.delete(speakerId);
      await db.timerRecords.where('speakerId').equals(speakerId).delete();
      await db.ahCounterRecords.where('speakerId').equals(speakerId).delete();
    });
  },

  // Timer Records
  async getTimerRecord(meetingId: string, speakerId: string): Promise<TimerRecord | undefined> {
    return db.timerRecords.where({ meetingId, speakerId }).first();
  },

  async getAllTimerRecords(meetingId: string): Promise<TimerRecord[]> {
    return db.timerRecords.where('meetingId').equals(meetingId).toArray();
  },

  async saveTimerRecord(record: TimerRecord): Promise<void> {
    await db.timerRecords.put(record);
  },

  // Ah Counter Records
  async getAhCounterRecord(meetingId: string, speakerId: string): Promise<AhCounterRecord | undefined> {
    return db.ahCounterRecords.where({ meetingId, speakerId }).first();
  },

  async getAllAhCounterRecords(meetingId: string): Promise<AhCounterRecord[]> {
    return db.ahCounterRecords.where('meetingId').equals(meetingId).toArray();
  },

  async saveAhCounterRecord(record: AhCounterRecord): Promise<void> {
    await db.ahCounterRecords.put(record);
  },

  // Grammarian Records
  async getGrammarianRecords(meetingId: string): Promise<GrammarianRecord[]> {
    return db.grammarianRecords.where('meetingId').equals(meetingId).sortBy('timestamp');
  },

  async saveGrammarianRecord(record: GrammarianRecord): Promise<void> {
    await db.grammarianRecords.put(record);
  },

  async deleteGrammarianRecord(id: string): Promise<void> {
    await db.grammarianRecords.delete(id);
  },

  // Trivia
  async getTriviaQuestions(meetingId: string): Promise<TriviaQuestion[]> {
    return db.triviaQuestions.where('meetingId').equals(meetingId).sortBy('order');
  },

  async saveTriviaQuestion(question: TriviaQuestion): Promise<void> {
    await db.triviaQuestions.put(question);
  },

  async deleteTriviaQuestion(id: string): Promise<void> {
    await db.triviaQuestions.delete(id);
  },

  async getTriviaParticipants(meetingId: string): Promise<TriviaParticipant[]> {
    return db.triviaParticipants.where('meetingId').equals(meetingId).sortBy('score');
  },

  async saveTriviaParticipant(participant: TriviaParticipant): Promise<void> {
    await db.triviaParticipants.put(participant);
  },

  async deleteTriviaParticipant(id: string): Promise<void> {
    await db.triviaParticipants.delete(id);
  },

  // Templates
  async getTemplates(): Promise<MeetingTemplate[]> {
    return db.meetingTemplates.toArray();
  },

  async saveTemplate(template: MeetingTemplate): Promise<void> {
    await db.meetingTemplates.put(template);
  },

  // Full Export & Import
  async exportDatabase(): Promise<string> {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      meetings: await db.meetings.toArray(),
      roleAssignments: await db.roleAssignments.toArray(),
      speakers: await db.speakers.toArray(),
      timerRecords: await db.timerRecords.toArray(),
      ahCounterRecords: await db.ahCounterRecords.toArray(),
      grammarianRecords: await db.grammarianRecords.toArray(),
      triviaQuestions: await db.triviaQuestions.toArray(),
      triviaParticipants: await db.triviaParticipants.toArray(),
      meetingTemplates: await db.meetingTemplates.toArray(),
    };
    return JSON.stringify(data, null, 2);
  },

  async importDatabase(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    await db.transaction('rw', [
      db.meetings,
      db.roleAssignments,
      db.speakers,
      db.timerRecords,
      db.ahCounterRecords,
      db.grammarianRecords,
      db.triviaQuestions,
      db.triviaParticipants,
      db.meetingTemplates,
    ], async () => {
      if (data.meetings) await db.meetings.bulkPut(data.meetings);
      if (data.roleAssignments) await db.roleAssignments.bulkPut(data.roleAssignments);
      if (data.speakers) await db.speakers.bulkPut(data.speakers);
      if (data.timerRecords) await db.timerRecords.bulkPut(data.timerRecords);
      if (data.ahCounterRecords) await db.ahCounterRecords.bulkPut(data.ahCounterRecords);
      if (data.grammarianRecords) await db.grammarianRecords.bulkPut(data.grammarianRecords);
      if (data.triviaQuestions) await db.triviaQuestions.bulkPut(data.triviaQuestions);
      if (data.triviaParticipants) await db.triviaParticipants.bulkPut(data.triviaParticipants);
      if (data.meetingTemplates) await db.meetingTemplates.bulkPut(data.meetingTemplates);
    });
  },

  async clearAllData(): Promise<void> {
    await db.transaction('rw', [
      db.meetings,
      db.roleAssignments,
      db.speakers,
      db.timerRecords,
      db.ahCounterRecords,
      db.grammarianRecords,
      db.triviaQuestions,
      db.triviaParticipants,
    ], async () => {
      await db.meetings.clear();
      await db.roleAssignments.clear();
      await db.speakers.clear();
      await db.timerRecords.clear();
      await db.ahCounterRecords.clear();
      await db.grammarianRecords.clear();
      await db.triviaQuestions.clear();
      await db.triviaParticipants.clear();
    });
  },
};
