import Dexie, { type Table } from 'dexie';
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

export class TagTeamDatabase extends Dexie {
  meetings!: Table<Meeting, string>;
  roleAssignments!: Table<RoleAssignment, string>;
  speakers!: Table<Speaker, string>;
  timerRecords!: Table<TimerRecord, string>;
  ahCounterRecords!: Table<AhCounterRecord, string>;
  grammarianRecords!: Table<GrammarianRecord, string>;
  triviaQuestions!: Table<TriviaQuestion, string>;
  triviaParticipants!: Table<TriviaParticipant, string>;
  meetingTemplates!: Table<MeetingTemplate, string>;

  constructor() {
    super('TagTeamDB');
    this.version(1).stores({
      meetings: 'id, meetingNumber, date, createdAt, updatedAt',
      roleAssignments: 'id, meetingId, role',
      speakers: 'id, meetingId, order, status',
      timerRecords: 'id, meetingId, speakerId, status',
      ahCounterRecords: 'id, meetingId, speakerId',
      grammarianRecords: 'id, meetingId, speakerId, type, timestamp',
      triviaQuestions: 'id, meetingId, order',
      triviaParticipants: 'id, meetingId, score',
      meetingTemplates: 'id, name',
    });
  }
}

export const db = new TagTeamDatabase();
