export type MeetingType = 'online' | 'offline' | 'hybrid';

export interface Meeting {
  id: string;
  meetingNumber: string;
  date: string;
  type: MeetingType;
  venue?: string;
  theme: string;
  wordOfDay: string;
  wordMeaning?: string;
  wordExample?: string;
  idiom: string;
  idiomMeaning?: string;
  idiomExample?: string;
  createdAt: number;
  updatedAt: number;
}

export type TagRoleType = 'timer' | 'ahCounter' | 'grammarian' | 'triviaMaster';

export interface RoleAssignment {
  id: string;
  meetingId: string;
  role: TagRoleType;
  personName: string;
}

export type SpeakerStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface Speaker {
  id: string;
  meetingId: string;
  name: string;
  role: string;
  session?: string;
  allocatedMin: number; // in seconds or decimal minutes, we store seconds internally
  allocatedMax: number; // in seconds
  warningTime?: number; // optional yellow threshold (defaults to allocatedMax - 60s or midpoint)
  target?: string;
  order: number;
  status: SpeakerStatus;
}

export type TimingStatus = 'under_time' | 'on_time' | 'over_time' | 'not_completed';
export type TimingSignal = 'none' | 'green' | 'yellow' | 'red' | 'over';

export interface TimerRecord {
  id: string;
  meetingId: string;
  speakerId: string;
  startTime?: number;
  endTime?: number;
  duration: number; // in seconds
  status: TimingStatus;
  notes?: string;
}

export interface AhActionLog {
  id: string;
  word: string;
  label: string;
  timestamp: number;
}

export interface AhCounterRecord {
  id: string;
  meetingId: string;
  speakerId: string;
  ah: number;
  um: number;
  uh: number;
  er: number;
  hmm: number;
  youKnow: number;
  like: number;
  actually: number;
  basically: number;
  so: number;
  iMean: number;
  repetition: number;
  incomplete: number;
  other: number;
  customCounts: Record<string, number>;
  notes: string;
  actionHistory: AhActionLog[];
}

export type GrammarianRecordType =
  | 'wod'
  | 'idiom'
  | 'uniqueWord'
  | 'goodExpression'
  | 'grammar'
  | 'pronunciation'
  | 'observation';

export interface GrammarianRecord {
  id: string;
  meetingId: string;
  speakerId?: string; // optional: could be specific speaker or general meeting
  speakerName?: string;
  type: GrammarianRecordType;
  value: string; // the word, phrase, or note
  meaning?: string;
  notes?: string; // context or quote
  timestamp: number;
}

export type TriviaOptionKey = 'A' | 'B' | 'C' | 'D';

export interface TriviaQuestion {
  id: string;
  meetingId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: TriviaOptionKey;
  points: number;
  order: number;
  notes?: string;
}

export interface TriviaParticipant {
  id: string;
  meetingId: string;
  name: string;
  score: number;
}

export interface TriviaAnswer {
  id: string;
  meetingId: string;
  questionId: string;
  participantId: string;
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface MeetingTemplate {
  id: string;
  name: string;
  description: string;
  type: MeetingType;
  defaultRoles: {
    timer?: string;
    ahCounter?: string;
    grammarian?: string;
    triviaMaster?: string;
  };
  defaultSpeakers: {
    name: string;
    role: string;
    session: string;
    allocatedMin: number;
    allocatedMax: number;
  }[];
}

export type ReportTemplateStyle = 'toastmasters' | 'professional' | 'minimal';

export interface ReportCustomContent {
  generalNotes?: string;
  timerNotes?: string;
  ahCounterNotes?: string;
  grammarianHighlights?: string[];
  grammarianImprovements?: string[];
  triviaNotes?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  timerSound: boolean;
  timerVibration: boolean;
  timerScreenFlash: boolean;
  customFillerWords: string[];
  ahCounterLayout: 'standard' | 'minimal';
  defaultReportStyle: ReportTemplateStyle;
  geminiApiKey?: string;
}

// ─── Fetch / Brochure Extraction Types ────────────────────────────────────────

export interface FetchedAgendaItem {
  startTime?: string;
  duration?: string;            // raw e.g. "5–6–7"
  minimumTime?: number;         // parsed in seconds
  targetTime?: number;          // parsed in seconds
  maximumTime?: number;         // parsed in seconds
  role: string;
  person?: string;
  session?: string;
  confidence: 'high' | 'review';
}

export interface FetchedRoleAssignment {
  role: string;
  tagTeamRole?: TagRoleType;    // mapped if applicable
  person: string;
  confidence: 'high' | 'review';
}

export interface FetchedMeetingData {
  meetingNumber?: string;
  date?: string;                // ISO: YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  meetingType?: MeetingType;
  theme?: string;
  wordOfDay?: string;
  wordMeaning?: string;
  idiom?: string;
  idiomMeaning?: string;
  venue?: string;
  clubName?: string;
  roles: FetchedRoleAssignment[];
  agenda: FetchedAgendaItem[];
  footerContacts?: string[];
  overallConfidence: 'high' | 'partial' | 'low';
  reviewFlags: string[];
}
