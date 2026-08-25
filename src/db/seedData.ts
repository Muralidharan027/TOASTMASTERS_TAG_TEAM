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

export const DEMO_MEETING_ID = 'demo-meeting-16';
export const DEMO_MEETING_2_ID = 'demo-meeting-73';

export async function seedInitialDataIfNeeded(): Promise<void> {
  const count = await db.meetings.count();
  if (count > 0) {
    return; // Already initialized
  }

  const now = Date.now();

  // 1. Primary Demo Meeting
  const demoMeeting: Meeting = {
    id: DEMO_MEETING_ID,
    meetingNumber: 'Online Meeting #16',
    date: '2026-08-25',
    type: 'online',
    venue: 'Zoom Room Alpha',
    theme: 'Better, or Just More You?',
    wordOfDay: 'Venerable',
    wordMeaning: 'Worthy of respect because of age, wisdom, character, or experience.',
    wordExample: 'The venerable mentor shared timeless advice that transformed our club.',
    idiom: "In the autumn of one's years",
    idiomMeaning: "In the late period or mature stage of a person's life.",
    idiomExample: 'He embraced public speaking in the autumn of his years.',
    createdAt: now - 3600 * 1000 * 2,
    updatedAt: now,
  };

  // 2. Secondary Demo Meeting for history
  const demoMeeting2: Meeting = {
    id: DEMO_MEETING_2_ID,
    meetingNumber: 'Meeting #73',
    date: '2026-08-05',
    type: 'hybrid',
    venue: 'Community Hall & Teams',
    theme: 'The Butterfly Effect',
    wordOfDay: 'Resilience',
    wordMeaning: 'The capacity to recover quickly from difficulties; toughness.',
    wordExample: 'Her speech displayed remarkable resilience in the face of adversity.',
    idiom: 'A ripple in the pond',
    idiomMeaning: 'A small action that has a widespread and expanding influence.',
    idiomExample: 'One small speech can create a ripple in the pond.',
    createdAt: now - 3600 * 1000 * 24 * 20,
    updatedAt: now - 3600 * 1000 * 24 * 20,
  };

  await db.meetings.bulkAdd([demoMeeting, demoMeeting2]);

  // Roles for Meeting #16
  const roles: RoleAssignment[] = [
    { id: 'r1', meetingId: DEMO_MEETING_ID, role: 'timer', personName: 'TM Kanitha B' },
    { id: 'r2', meetingId: DEMO_MEETING_ID, role: 'ahCounter', personName: 'TM Muralidharan S' },
    { id: 'r3', meetingId: DEMO_MEETING_ID, role: 'grammarian', personName: 'TM Siva Shankar Bernadsha' },
    { id: 'r4', meetingId: DEMO_MEETING_ID, role: 'triviaMaster', personName: 'TM Nithya Soundarya' },
  ];
  await db.roleAssignments.bulkAdd(roles);

  // Speakers for Meeting #16
  const speakers: Speaker[] = [
    {
      id: 'spk-1',
      meetingId: DEMO_MEETING_ID,
      name: 'TM Kanniya D',
      role: 'Sergeant at Arms',
      session: 'Opening',
      allocatedMin: 60,
      allocatedMax: 120,
      order: 1,
      status: 'completed',
    },
    {
      id: 'spk-2',
      meetingId: DEMO_MEETING_ID,
      name: 'TM Kavitha C',
      role: 'Presiding Officer',
      session: 'Presidential Address',
      allocatedMin: 180,
      allocatedMax: 300,
      order: 2,
      status: 'completed',
    },
    {
      id: 'spk-3',
      meetingId: DEMO_MEETING_ID,
      name: 'TM Shweta Priyadarshini',
      role: 'Toastmaster of the Day',
      session: 'Theme Introduction',
      allocatedMin: 180,
      allocatedMax: 300,
      order: 3,
      status: 'completed',
    },
    {
      id: 'spk-4',
      meetingId: DEMO_MEETING_ID,
      name: 'TM Amanda',
      role: 'Prepared Speaker 1',
      session: 'Prepared Speeches',
      allocatedMin: 300,
      allocatedMax: 420,
      order: 4,
      status: 'completed',
    },
    {
      id: 'spk-5',
      meetingId: DEMO_MEETING_ID,
      name: 'TM Balaji',
      role: 'Prepared Speaker 2',
      session: 'Prepared Speeches',
      allocatedMin: 300,
      allocatedMax: 420,
      order: 5,
      status: 'completed',
    },
    {
      id: 'spk-6',
      meetingId: DEMO_MEETING_ID,
      name: 'TM Anu',
      role: 'Table Topics Speaker',
      session: 'Table Topics',
      allocatedMin: 60,
      allocatedMax: 120,
      order: 6,
      status: 'completed',
    },
    {
      id: 'spk-7',
      meetingId: DEMO_MEETING_ID,
      name: 'TM Shanmugapriya',
      role: 'Evaluator',
      session: 'Evaluation',
      allocatedMin: 120,
      allocatedMax: 180,
      order: 7,
      status: 'completed',
    },
    {
      id: 'spk-8',
      meetingId: DEMO_MEETING_ID,
      name: 'TM Venkatesh',
      role: 'Table Topics Speaker',
      session: 'Table Topics',
      allocatedMin: 60,
      allocatedMax: 120,
      order: 8,
      status: 'completed',
    },
    {
      id: 'spk-9',
      meetingId: DEMO_MEETING_ID,
      name: 'TM Divya K',
      role: 'General Evaluator',
      session: 'General Evaluation',
      allocatedMin: 180,
      allocatedMax: 300,
      order: 9,
      status: 'pending',
    },
  ];
  await db.speakers.bulkAdd(speakers);

  // Timer Records for Meeting #16
  const timerRecords: TimerRecord[] = [
    { id: 'tr-1', meetingId: DEMO_MEETING_ID, speakerId: 'spk-1', duration: 104, status: 'on_time' },
    { id: 'tr-2', meetingId: DEMO_MEETING_ID, speakerId: 'spk-2', duration: 285, status: 'on_time' },
    { id: 'tr-3', meetingId: DEMO_MEETING_ID, speakerId: 'spk-3', duration: 290, status: 'on_time' },
    { id: 'tr-4', meetingId: DEMO_MEETING_ID, speakerId: 'spk-4', duration: 392, status: 'on_time' }, // 6:32
    { id: 'tr-5', meetingId: DEMO_MEETING_ID, speakerId: 'spk-5', duration: 408, status: 'on_time' }, // 6:48
    { id: 'tr-6', meetingId: DEMO_MEETING_ID, speakerId: 'spk-6', duration: 94, status: 'on_time' },  // 1:34
    { id: 'tr-7', meetingId: DEMO_MEETING_ID, speakerId: 'spk-7', duration: 168, status: 'on_time' }, // 2:48
    { id: 'tr-8', meetingId: DEMO_MEETING_ID, speakerId: 'spk-8', duration: 52, status: 'under_time' }, // 0:52
  ];
  await db.timerRecords.bulkAdd(timerRecords);

  // Ah-Counter Records
  const emptyCounts = {
    ah: 0, um: 0, uh: 0, er: 0, hmm: 0,
    youKnow: 0, like: 0, actually: 0, basically: 0, so: 0, iMean: 0,
    repetition: 0, incomplete: 0, other: 0,
    customCounts: {},
    actionHistory: [],
  };

  const ahRecords: AhCounterRecord[] = [
    {
      ...emptyCounts,
      id: 'ah-4',
      meetingId: DEMO_MEETING_ID,
      speakerId: 'spk-4',
      ah: 3,
      um: 2,
      like: 1,
      notes: 'Good confidence, clear vocal variety, replaced a few pauses with intentional silence.',
    },
    {
      ...emptyCounts,
      id: 'ah-5',
      meetingId: DEMO_MEETING_ID,
      speakerId: 'spk-5',
      uh: 4,
      youKnow: 2,
      repetition: 1,
      notes: 'Strong storytelling; can pause before key transitions rather than using "you know".',
    },
    {
      ...emptyCounts,
      id: 'ah-6',
      meetingId: DEMO_MEETING_ID,
      speakerId: 'spk-6',
      so: 1,
      like: 2,
      notes: 'Spontaneous and energetic table topic delivery.',
    },
    {
      ...emptyCounts,
      id: 'ah-7',
      meetingId: DEMO_MEETING_ID,
      speakerId: 'spk-7',
      um: 1,
      notes: 'Crisp evaluation structure and commendations.',
    },
  ];
  await db.ahCounterRecords.bulkAdd(ahRecords);

  // Grammarian Records
  const grammarianRecords: GrammarianRecord[] = [
    {
      id: 'gr-1',
      meetingId: DEMO_MEETING_ID,
      speakerId: 'spk-4',
      speakerName: 'TM Amanda',
      type: 'wod',
      value: 'Venerable',
      notes: 'Used while discussing personal growth and mentorship.',
      timestamp: now - 3000 * 1000,
    },
    {
      id: 'gr-2',
      meetingId: DEMO_MEETING_ID,
      speakerId: 'spk-5',
      speakerName: 'TM Balaji',
      type: 'wod',
      value: 'Venerable',
      notes: 'Referenced the venerable traditions of Toastmasters.',
      timestamp: now - 2500 * 1000,
    },
    {
      id: 'gr-3',
      meetingId: DEMO_MEETING_ID,
      speakerId: 'spk-3',
      speakerName: 'TM Shweta Priyadarshini',
      type: 'idiom',
      value: "In the autumn of one's years",
      notes: 'Introduced the theme using this idiom gracefully.',
      timestamp: now - 3500 * 1000,
    },
    {
      id: 'gr-4',
      meetingId: DEMO_MEETING_ID,
      speakerId: 'spk-4',
      speakerName: 'TM Amanda',
      type: 'uniqueWord',
      value: 'Resilience',
      meaning: 'Ability to recover quickly from difficulties.',
      notes: 'Excellent context during her speech conclusion.',
      timestamp: now - 2800 * 1000,
    },
    {
      id: 'gr-5',
      meetingId: DEMO_MEETING_ID,
      speakerId: 'spk-5',
      speakerName: 'TM Balaji',
      type: 'goodExpression',
      value: 'Echoes of authenticity',
      notes: 'Poetic phrase in second paragraph.',
      timestamp: now - 2200 * 1000,
    },
    {
      id: 'gr-6',
      meetingId: DEMO_MEETING_ID,
      speakerId: 'spk-6',
      speakerName: 'TM Anu',
      type: 'grammar',
      value: 'Subject-verb agreement note: "each of the members were" -> "each of the members was"',
      timestamp: now - 1800 * 1000,
    },
  ];
  await db.grammarianRecords.bulkAdd(grammarianRecords);

  // Trivia Questions
  const triviaQuestions: TriviaQuestion[] = [
    {
      id: 'tq-1',
      meetingId: DEMO_MEETING_ID,
      question: 'Who founded Toastmasters International in October 1924?',
      optionA: 'Ralph C. Smedley',
      optionB: 'Dale Carnegie',
      optionC: 'Warren Buffett',
      optionD: 'Simon Sinek',
      correctAnswer: 'A',
      points: 1,
      order: 1,
      notes: 'Founded at the YMCA in Santa Ana, California.',
    },
    {
      id: 'tq-2',
      meetingId: DEMO_MEETING_ID,
      question: 'In TM Amanda’s speech, what was the first mentor’s piece of advice?',
      optionA: 'Speak faster',
      optionB: 'Listen before responding',
      optionC: 'Memorize every paragraph',
      optionD: 'Avoid eye contact',
      correctAnswer: 'B',
      points: 1,
      order: 2,
    },
    {
      id: 'tq-3',
      meetingId: DEMO_MEETING_ID,
      question: 'What was today’s Word of the Day chosen by our Grammarian?',
      optionA: 'Resilience',
      optionB: 'Venerable',
      optionC: 'Magnanimous',
      optionD: 'Perspicacious',
      correctAnswer: 'B',
      points: 1,
      order: 3,
    },
    {
      id: 'tq-4',
      meetingId: DEMO_MEETING_ID,
      question: 'What is the standard time allocation for an Icebreaker speech in Toastmasters Pathways?',
      optionA: '1 to 2 minutes',
      optionB: '2 to 3 minutes',
      optionC: '4 to 6 minutes',
      optionD: '5 to 7 minutes',
      correctAnswer: 'C',
      points: 1,
      order: 4,
    },
  ];
  await db.triviaQuestions.bulkAdd(triviaQuestions);

  // Trivia Participants & Scores
  const participants: TriviaParticipant[] = [
    { id: 'tp-1', meetingId: DEMO_MEETING_ID, name: 'TM Amanda', score: 5 },
    { id: 'tp-2', meetingId: DEMO_MEETING_ID, name: 'TM Balaji', score: 4 },
    { id: 'tp-3', meetingId: DEMO_MEETING_ID, name: 'TM Anu', score: 3 },
    { id: 'tp-4', meetingId: DEMO_MEETING_ID, name: 'TM Venkatesh', score: 2 },
    { id: 'tp-5', meetingId: DEMO_MEETING_ID, name: 'TM Shanmugapriya', score: 2 },
    { id: 'tp-6', meetingId: DEMO_MEETING_ID, name: 'TM Divya K', score: 1 },
    { id: 'tp-7', meetingId: DEMO_MEETING_ID, name: 'TM Kavitha C', score: 1 },
    { id: 'tp-8', meetingId: DEMO_MEETING_ID, name: 'TM Kanniya D', score: 0 },
  ];
  await db.triviaParticipants.bulkAdd(participants);

  // Meeting Templates
  const templates: MeetingTemplate[] = [
    {
      id: 'tmpl-tm-standard',
      name: 'Standard Club Meeting',
      description: 'Classic format: 2 Prepared Speeches, Table Topics, Evaluations.',
      type: 'hybrid',
      defaultRoles: {
        timer: 'Timer',
        ahCounter: 'Ah-Counter',
        grammarian: 'Grammarian',
        triviaMaster: 'Trivia Master',
      },
      defaultSpeakers: [
        { name: 'SAA', role: 'Sergeant at Arms', session: 'Opening', allocatedMin: 60, allocatedMax: 120 },
        { name: 'President', role: 'Presiding Officer', session: 'Presidential Address', allocatedMin: 180, allocatedMax: 300 },
        { name: 'TMOD', role: 'Toastmaster of the Day', session: 'Theme Introduction', allocatedMin: 180, allocatedMax: 300 },
        { name: 'Speaker 1', role: 'Prepared Speaker 1', session: 'Prepared Speeches', allocatedMin: 300, allocatedMax: 420 },
        { name: 'Speaker 2', role: 'Prepared Speaker 2', session: 'Prepared Speeches', allocatedMin: 300, allocatedMax: 420 },
        { name: 'Table Topics Master', role: 'Table Topics Master', session: 'Table Topics', allocatedMin: 120, allocatedMax: 180 },
        { name: 'General Evaluator', role: 'General Evaluator', session: 'Evaluation', allocatedMin: 180, allocatedMax: 300 },
        { name: 'Evaluator 1', role: 'Speech Evaluator 1', session: 'Evaluation', allocatedMin: 120, allocatedMax: 180 },
        { name: 'Evaluator 2', role: 'Speech Evaluator 2', session: 'Evaluation', allocatedMin: 120, allocatedMax: 180 },
      ],
    },
    {
      id: 'tmpl-tm-chennai',
      name: 'Chennai Tamil Toastmasters',
      description: 'Dedicated club meeting setup with Trivia session and Table Topics.',
      type: 'online',
      defaultRoles: {
        timer: 'TM Kanitha B',
        ahCounter: 'TM Muralidharan S',
        grammarian: 'TM Siva Shankar Bernadsha',
        triviaMaster: 'TM Nithya Soundarya',
      },
      defaultSpeakers: [
        { name: 'TM Kanniya D', role: 'Sergeant at Arms', session: 'Opening', allocatedMin: 60, allocatedMax: 120 },
        { name: 'TM Kavitha C', role: 'Presiding Officer', session: 'Presidential Address', allocatedMin: 180, allocatedMax: 300 },
        { name: 'TM Shweta Priyadarshini', role: 'Toastmaster of the Day', session: 'Theme Intro', allocatedMin: 180, allocatedMax: 300 },
        { name: 'TM Amanda', role: 'Prepared Speaker 1', session: 'Prepared Speeches', allocatedMin: 300, allocatedMax: 420 },
        { name: 'TM Balaji', role: 'Prepared Speaker 2', session: 'Prepared Speeches', allocatedMin: 300, allocatedMax: 420 },
      ],
    },
  ];
  await db.meetingTemplates.bulkAdd(templates);
}
