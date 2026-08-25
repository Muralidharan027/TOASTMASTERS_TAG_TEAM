import type { FetchedMeetingData, FetchedAgendaItem, FetchedRoleAssignment, TagRoleType, MeetingType } from '../types';

// Map common Toastmasters role strings → TagRoleType
const TAG_TEAM_ROLE_MAP: Record<string, TagRoleType> = {
  'timer': 'timer',
  'ah counter': 'ahCounter',
  'ah-counter': 'ahCounter',
  'ahcounter': 'ahCounter',
  'grammarian': 'grammarian',
  'trivia master': 'triviaMaster',
  'triviamaster': 'triviaMaster',
  'quizmaster': 'triviaMaster',
  'quiz master': 'triviaMaster',
};

function mapTagTeamRole(roleStr: string): TagRoleType | undefined {
  const lower = roleStr.toLowerCase().trim();
  for (const [key, value] of Object.entries(TAG_TEAM_ROLE_MAP)) {
    if (lower.includes(key)) return value;
  }
  return undefined;
}

/**
 * Parse Toastmasters timing strings like "5-6-7", "1-1.30-2", "3 - 4 - 5"
 * Returns { min, target, max } in seconds, or undefined if unparseable.
 */
function parseTiming(raw?: string): { min: number; target: number; max: number } | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, '');
  const parts = cleaned.split('-').map((p) => parseFloat(p));
  if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
    return {
      min: Math.round(parts[0] * 60),
      target: Math.round(parts[1] * 60),
      max: Math.round(parts[2] * 60),
    };
  }
  if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
    return {
      min: Math.round(parts[0] * 60),
      target: Math.round(((parts[0] + parts[1]) / 2) * 60),
      max: Math.round(parts[1] * 60),
    };
  }
  return undefined;
}

/**
 * Try to normalize various date formats into ISO YYYY-MM-DD.
 */
function normalizeDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return raw;
}

const EXTRACTION_PROMPT = `You are a Toastmasters meeting brochure data extractor. Your ONLY job is to extract structured meeting information from the uploaded image and return it as valid JSON.

CRITICAL RULES:
1. NEVER invent, guess, or infer missing information
2. If a field is not clearly visible, return null for that field
3. Preserve exact names, capitalization, and wording from the brochure
4. Do NOT correct spelling automatically
5. Preserve Toastmasters timing formats exactly (e.g. "5-6-7", "1-1.30-2")

EXTRACT the following and return ONLY valid JSON (no markdown, no explanation):

{
  "meetingNumber": "<string or null>",
  "date": "<DD-MM-YYYY or null>",
  "startTime": "<e.g. 10:00 AM or null>",
  "endTime": "<e.g. 12:00 PM or null>",
  "meetingType": "<online|offline|hybrid or null>",
  "theme": "<theme text only, no prefix like Theme dash, or null>",
  "wordOfDay": "<word only or null>",
  "wordMeaning": "<meaning if present or null>",
  "idiom": "<idiom phrase or null>",
  "idiomMeaning": "<meaning if present or null>",
  "venue": "<venue or null>",
  "clubName": "<club name or null>",
  "roles": [
    {
      "role": "<exact role name from brochure>",
      "person": "<exact person name>",
      "confidence": "<high or review>"
    }
  ],
  "agenda": [
    {
      "startTime": "<HH:MM or null>",
      "duration": "<e.g. 5-6-7 or null, preserve exact format>",
      "role": "<role/activity name>",
      "person": "<person name or null>",
      "session": "<session heading this row belongs to, or null>",
      "confidence": "<high or review>"
    }
  ],
  "footerContacts": ["<name and number if present>"]
}

For agenda section headings (like Prepared Speech Session 10 Minutes), create a single agenda entry with role equal to the section heading text, person equal to null, session equal to the section heading text, and duration equal to the session duration if stated.

If a table column is empty or unclear, use null. Return ONLY the JSON object.`;

export interface ExtractionResult {
  data: FetchedMeetingData;
  rawJson: string;
}

export async function extractFromBrochure(
  imageFile: File,
  apiKey: string,
  onProgress?: (step: number) => void,
): Promise<ExtractionResult> {
  if (!apiKey) throw new Error('NO_API_KEY');

  onProgress?.(1);
  const base64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp';

  onProgress?.(2);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: EXTRACTION_PROMPT },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
    }),
  });

  if (!response.ok) {
    if (response.status === 400 || response.status === 403) throw new Error('INVALID_API_KEY');
    throw new Error(`API_ERROR:${response.status}`);
  }

  onProgress?.(3);
  const responseJson = await response.json();
  const rawText: string = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('NO_JSON_IN_RESPONSE');
  const rawJson = jsonMatch[0];

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('INVALID_JSON_RESPONSE');
  }

  onProgress?.(4);
  const data = transformExtracted(parsed);

  onProgress?.(5);
  buildReviewFlags(data);

  return { data, rawJson };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function transformExtracted(raw: Record<string, unknown>): FetchedMeetingData {
  const rawRoles = (raw.roles as Array<Record<string, unknown>> | undefined) || [];
  const roles: FetchedRoleAssignment[] = rawRoles
    .filter((r) => r.role && r.person)
    .map((r) => ({
      role: String(r.role),
      person: String(r.person),
      tagTeamRole: mapTagTeamRole(String(r.role)),
      confidence: (r.confidence as 'high' | 'review') || 'high',
    }));

  const rawAgenda = (raw.agenda as Array<Record<string, unknown>> | undefined) || [];
  const agenda: FetchedAgendaItem[] = rawAgenda
    .filter((a) => a.role)
    .map((a) => {
      const durationRaw = a.duration ? String(a.duration) : undefined;
      const timing = parseTiming(durationRaw);
      return {
        startTime: a.startTime ? String(a.startTime) : undefined,
        duration: durationRaw,
        minimumTime: timing?.min,
        targetTime: timing?.target,
        maximumTime: timing?.max,
        role: String(a.role),
        person: a.person ? String(a.person) : undefined,
        session: a.session ? String(a.session) : undefined,
        confidence: (a.confidence as 'high' | 'review') || 'high',
      };
    });

  const reviewCount = [...roles, ...agenda].filter((x) => x.confidence === 'review').length;
  const total = roles.length + agenda.length;
  const overallConfidence: 'high' | 'partial' | 'low' =
    reviewCount === 0 ? 'high' : reviewCount / total < 0.3 ? 'partial' : 'low';

  return {
    meetingNumber: raw.meetingNumber ? String(raw.meetingNumber) : undefined,
    date: normalizeDate(raw.date ? String(raw.date) : undefined),
    startTime: raw.startTime ? String(raw.startTime) : undefined,
    endTime: raw.endTime ? String(raw.endTime) : undefined,
    meetingType: raw.meetingType ? (String(raw.meetingType) as MeetingType) : undefined,
    theme: raw.theme ? String(raw.theme) : undefined,
    wordOfDay: raw.wordOfDay ? String(raw.wordOfDay) : undefined,
    wordMeaning: raw.wordMeaning ? String(raw.wordMeaning) : undefined,
    idiom: raw.idiom ? String(raw.idiom) : undefined,
    idiomMeaning: raw.idiomMeaning ? String(raw.idiomMeaning) : undefined,
    venue: raw.venue ? String(raw.venue) : undefined,
    clubName: raw.clubName ? String(raw.clubName) : undefined,
    roles,
    agenda,
    footerContacts: Array.isArray(raw.footerContacts)
      ? (raw.footerContacts as unknown[]).map(String)
      : [],
    overallConfidence,
    reviewFlags: [],
  };
}

function buildReviewFlags(data: FetchedMeetingData): void {
  const flags: string[] = [];
  if (!data.meetingNumber) flags.push('Meeting number not detected');
  if (!data.date) flags.push('Date not detected');
  if (!data.theme) flags.push('Theme not detected');
  if (!data.wordOfDay) flags.push('Word of the Day not detected');
  if (!data.idiom) flags.push('Idiom of the Day not detected');
  const reviewRoles = data.roles.filter((r) => r.confidence === 'review');
  if (reviewRoles.length > 0)
    flags.push(`${reviewRoles.length} role assignment${reviewRoles.length > 1 ? 's' : ''} need review`);
  const reviewAgenda = data.agenda.filter((a) => a.confidence === 'review');
  if (reviewAgenda.length > 0)
    flags.push(`${reviewAgenda.length} agenda row${reviewAgenda.length > 1 ? 's' : ''} need review`);
  data.reviewFlags = flags;
}
