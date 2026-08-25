import type {
  Meeting,
  RoleAssignment,
  Speaker,
  TimerRecord,
  AhCounterRecord,
  GrammarianRecord,
  TriviaQuestion,
  TriviaParticipant,
  ReportTemplateStyle,
} from '../types';
import { formatTime, formatDurationRange, formatDateString } from './formatting';

interface FullReportData {
  meeting: Meeting;
  roles: RoleAssignment[];
  speakers: Speaker[];
  timerRecords: TimerRecord[];
  ahRecords: AhCounterRecord[];
  grammarianRecords: GrammarianRecord[];
  triviaQuestions: TriviaQuestion[];
  triviaParticipants: TriviaParticipant[];
  customGeneralNotes?: string;
  customTimerNotes?: string;
  customAhNotes?: string;
  customGrammarNotes?: string;
  customTriviaNotes?: string;
}

export function generateReportMarkdown(
  data: FullReportData,
  style: ReportTemplateStyle = 'toastmasters'
): string {
  const {
    meeting,
    roles,
    speakers,
    timerRecords,
    ahRecords,
    grammarianRecords,
    triviaQuestions,
    triviaParticipants,
  } = data;

  const timerRole = roles.find((r) => r.role === 'timer')?.personName || 'Unassigned';
  const ahRole = roles.find((r) => r.role === 'ahCounter')?.personName || 'Unassigned';
  const grammarianRole = roles.find((r) => r.role === 'grammarian')?.personName || 'Unassigned';
  const triviaRole = roles.find((r) => r.role === 'triviaMaster')?.personName || 'Unassigned';

  // Timer Statistics
  const speakersTracked = timerRecords.filter((r) => r.duration > 0).length;
  const onTimeCount = timerRecords.filter((r) => r.status === 'on_time').length;
  const underTimeCount = timerRecords.filter((r) => r.status === 'under_time').length;
  const overTimeCount = timerRecords.filter((r) => r.status === 'over_time').length;
  const durations = timerRecords.filter((r) => r.duration > 0).map((r) => r.duration);
  const longestSpeech = durations.length > 0 ? Math.max(...durations) : 0;
  const shortestSpeech = durations.length > 0 ? Math.min(...durations) : 0;

  // Ah-Counter Statistics
  let totalFillers = 0;
  const fillerWordTotals: Record<string, number> = {};
  let totalRepetitions = 0;

  ahRecords.forEach((rec) => {
    const fillerKeys = ['ah', 'um', 'uh', 'er', 'hmm', 'youKnow', 'like', 'actually', 'basically', 'so', 'iMean', 'incomplete', 'other'] as const;
    fillerKeys.forEach((k) => {
      const val = (rec[k] as number) || 0;
      if (val > 0) {
        totalFillers += val;
        fillerWordTotals[k] = (fillerWordTotals[k] || 0) + val;
      }
    });
    if (rec.customCounts) {
      Object.entries(rec.customCounts).forEach(([word, cnt]) => {
        if (cnt > 0) {
          totalFillers += cnt;
          fillerWordTotals[word] = (fillerWordTotals[word] || 0) + cnt;
        }
      });
    }
    totalRepetitions += rec.repetition || 0;
  });

  const activeAhSpeakers = ahRecords.filter((r) => {
    return (
      r.ah + r.um + r.uh + r.er + r.hmm + r.youKnow + r.like + r.actually +
      r.basically + r.so + r.iMean + r.other + r.repetition > 0
    );
  }).length;

  const avgFillers = activeAhSpeakers > 0 ? (totalFillers / activeAhSpeakers).toFixed(1) : '0';

  let topFillerName = 'None';
  let topFillerCount = 0;
  Object.entries(fillerWordTotals).forEach(([word, count]) => {
    if (count > topFillerCount) {
      topFillerCount = count;
      topFillerName = word.toUpperCase();
    }
  });

  // Grammarian Statistics
  const wodRecords = grammarianRecords.filter((r) => r.type === 'wod');
  const idiomRecords = grammarianRecords.filter((r) => r.type === 'idiom');
  const uniqueWordRecords = grammarianRecords.filter((r) => r.type === 'uniqueWord');
  const goodExpRecords = grammarianRecords.filter((r) => r.type === 'goodExpression');
  const grammarNotes = grammarianRecords.filter((r) => r.type === 'grammar' || r.type === 'pronunciation');

  // Trivia Statistics
  const sortedParticipants = [...triviaParticipants].sort((a, b) => b.score - a.score);
  const winner = sortedParticipants[0];
  const runnerUp = sortedParticipants[1];

  if (style === 'minimal') {
    return `# TAG TEAM REPORT — ${meeting.meetingNumber}
Date: ${formatDateString(meeting.date)}
Theme: ${meeting.theme}
Word of the Day: ${meeting.wordOfDay} (${wodRecords.length} uses)
Idiom: ${meeting.idiom} (${idiomRecords.length} uses)

[TIMER REPORT] (${timerRole})
Tracked: ${speakersTracked} | On Time: ${onTimeCount} | Under: ${underTimeCount} | Over: ${overTimeCount}
Longest: ${formatTime(longestSpeech)} | Shortest: ${formatTime(shortestSpeech)}
${speakers.map((spk) => {
  const tr = timerRecords.find((r) => r.speakerId === spk.id);
  return `- ${spk.name} (${spk.role}): ${tr && tr.duration > 0 ? formatTime(tr.duration) : 'N/A'} [${tr?.status?.replace('_', ' ').toUpperCase() || 'NOT RECORDED'}]`;
}).join('\n')}

[AH-COUNTER REPORT] (${ahRole})
Total Fillers: ${totalFillers} | Most Common: ${topFillerName} (${topFillerCount}) | Avg: ${avgFillers}/speaker | Repetitions: ${totalRepetitions}

[GRAMMARIAN REPORT] (${grammarianRole})
WOD Uses: ${wodRecords.map((r) => r.speakerName || 'Speaker').join(', ') || 'None'}
Idiom Uses: ${idiomRecords.map((r) => r.speakerName || 'Speaker').join(', ') || 'None'}
Unique Words: ${uniqueWordRecords.map((r) => `${r.value}${r.meaning ? ` (${r.meaning})` : ''}`).join(', ') || 'None'}

[TRIVIA REPORT] (${triviaRole})
Questions: ${triviaQuestions.length} | Winner: ${winner ? `${winner.name} (${winner.score} pts)` : 'None'}
`;
  }

  // Standard Toastmasters / Professional format
  return `# TAG TEAM MEETING REPORT

**${meeting.meetingNumber}** — ${formatDateString(meeting.date)}  
**Type:** ${meeting.type.toUpperCase()}${meeting.venue ? ` | **Venue:** ${meeting.venue}` : ''}  
**Theme of the Day:** *${meeting.theme}*  
**Word of the Day:** **${meeting.wordOfDay}** — *${meeting.wordMeaning || ''}*  
**Idiom of the Day:** **${meeting.idiom}** — *${meeting.idiomMeaning || ''}*  

---

## 👥 TAG TEAM ROLE PLAYERS

* ⏱️ **Timer:** ${timerRole}
* 👂 **Ah-Counter:** ${ahRole}
* 📖 **Grammarian:** ${grammarianRole}
* 💡 **Trivia Master:** ${triviaRole}

---

## ⏱️ 1. TIMER REPORT

> **Speakers Tracked:** ${speakersTracked} | **On Time:** ${onTimeCount} | **Under Time:** ${underTimeCount} | **Over Time:** ${overTimeCount}  
> **Longest Speech:** ${formatTime(longestSpeech)} | **Shortest Speech:** ${formatTime(shortestSpeech)}

| Speaker | Role / Session | Allocated | Actual Time | Status |
| :--- | :--- | :--- | :--- | :--- |
${speakers.map((spk) => {
  const tr = timerRecords.find((r) => r.speakerId === spk.id);
  const durStr = tr && tr.duration > 0 ? formatTime(tr.duration) : '—';
  const allocStr = formatDurationRange(spk.allocatedMin, spk.allocatedMax);
  const statusStr = tr ? tr.status.replace('_', ' ').toUpperCase() : 'PENDING';
  return `| **${spk.name}** | ${spk.role} | ${allocStr} | ${durStr} | \`${statusStr}\` |`;
}).join('\n')}

${data.customTimerNotes ? `\n**Timer Remarks:**\n${data.customTimerNotes}\n` : ''}

---

## 👂 2. AH-COUNTER REPORT

> **Total Fillers Recorded:** ${totalFillers}  
> **Most Common Crutch Word:** **${topFillerName}** (${topFillerCount} times)  
> **Average Fillers per Speaker:** **${avgFillers}**  
> **Total Repetitions:** **${totalRepetitions}**

### Speaker Breakdown:
${speakers.map((spk) => {
  const rec = ahRecords.find((r) => r.speakerId === spk.id);
  if (!rec) return null;
  const items: string[] = [];
  if (rec.ah) items.push(`Ah: ${rec.ah}`);
  if (rec.um) items.push(`Um: ${rec.um}`);
  if (rec.uh) items.push(`Uh: ${rec.uh}`);
  if (rec.er) items.push(`Er: ${rec.er}`);
  if (rec.hmm) items.push(`Hmm: ${rec.hmm}`);
  if (rec.youKnow) items.push(`You Know: ${rec.youKnow}`);
  if (rec.like) items.push(`Like: ${rec.like}`);
  if (rec.actually) items.push(`Actually: ${rec.actually}`);
  if (rec.basically) items.push(`Basically: ${rec.basically}`);
  if (rec.so) items.push(`So: ${rec.so}`);
  if (rec.iMean) items.push(`I Mean: ${rec.iMean}`);
  if (rec.repetition) items.push(`Repetitions: ${rec.repetition}`);
  if (rec.incomplete) items.push(`Incomplete: ${rec.incomplete}`);
  if (rec.other) items.push(`Other: ${rec.other}`);
  if (rec.customCounts) {
    Object.entries(rec.customCounts).forEach(([w, c]) => items.push(`${w}: ${c}`));
  }

  const breakdownStr = items.length > 0 ? items.join(', ') : 'Zero fillers recorded! 🌟';
  return `* **${spk.name}** (${spk.role}): ${breakdownStr}${rec.notes ? `\n  *Observation: "${rec.notes}"*` : ''}`;
}).filter(Boolean).join('\n\n')}

> *💡 Note: The goal is not to eliminate every filler word, but to become aware of them and gradually replace unnecessary fillers with intentional pauses.*

${data.customAhNotes ? `\n**Ah-Counter Remarks:**\n${data.customAhNotes}\n` : ''}

---

## 📖 3. GRAMMARIAN REPORT

### Word of the Day Usage: **${meeting.wordOfDay}**
${wodRecords.length > 0 ? wodRecords.map((r) => `* **${r.speakerName || 'Speaker'}** ${r.notes ? `— *"${r.notes}"*` : ''}`).join('\n') : '* *Not used during the session.*'}

### Idiom of the Day Usage: **${meeting.idiom}**
${idiomRecords.length > 0 ? idiomRecords.map((r) => `* **${r.speakerName || 'Speaker'}** ${r.notes ? `— *"${r.notes}"*` : ''}`).join('\n') : '* *Not used during the session.*'}

### 💎 Unique Vocabulary & Good Expressions
${uniqueWordRecords.length > 0 || goodExpRecords.length > 0 ? [
  ...uniqueWordRecords.map((r) => `* **${r.value}** (${r.speakerName || 'General'})${r.meaning ? `: ${r.meaning}` : ''}${r.notes ? ` — *"${r.notes}"*` : ''}`),
  ...goodExpRecords.map((r) => `* **"${r.value}"** (${r.speakerName || 'General'})${r.notes ? ` — ${r.notes}` : ''}`),
].join('\n') : '* *None logged.*'}

### 🔍 Language Observations & Suggestions
${grammarNotes.length > 0 ? grammarNotes.map((r) => `* ${r.speakerName ? `**${r.speakerName}:** ` : ''}${r.value}`).join('\n') : '* *Great overall grammar and fluency across all sessions.*'}

${data.customGrammarNotes ? `\n**Grammarian Remarks:**\n${data.customGrammarNotes}\n` : ''}

---

## 💡 4. TRIVIA MASTER REPORT

> **Questions Conducted:** ${triviaQuestions.length} | **Total Participants:** ${triviaParticipants.length}

${winner ? `🏆 **Trivia Champion:** **${winner.name}** (${winner.score} Points)` : ''}  
${runnerUp ? `🥈 **Runner-Up:** **${runnerUp.name}** (${runnerUp.score} Points)` : ''}

### Leaderboard:
${sortedParticipants.map((p, idx) => `${idx + 1}. **${p.name}** — ${p.score} pts`).join('\n')}

${data.customTriviaNotes ? `\n**Trivia Remarks:**\n${data.customTriviaNotes}\n` : ''}

---

## ✨ MEETING HIGHLIGHTS & SUMMARY
✓ **Active speaker engagement and spirited participation.**  
✓ **${onTimeCount} of ${speakersTracked} speakers on target timing.**  
✓ **Word of the Day utilized ${wodRecords.length} time(s).**  
✓ **Trivia session engaged ${triviaParticipants.length} members with high enthusiasm.**  

${data.customGeneralNotes ? `\n**General Notes:**\n${data.customGeneralNotes}\n` : ''}

*Report generated with TAG TEAM — Track. Analyze. Grow.*
`;
}
