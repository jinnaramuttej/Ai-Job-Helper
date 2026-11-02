import type { Job, MockData, RoleCat, Screen } from '../mock';

export interface AiCard {
  id: string; kind: 'job' | 'edit' | 'task'; title: string; meta: string; action: string; target: Screen;
  score?: number; jobId?: string; before?: string; after?: string;
}
export interface AiAnswer { text: string; cards: AiCard[]; sources: string[] }

/** Mocked assistant: routes a free-text command to a canned but data-aware answer. */
export function answer(q: string, data: MockData): AiAnswer {
  const s = q.toLowerCase();
  const company = data.jobs.find((j) => s.includes(j.company.toLowerCase()));

  if (/(tailor|resume|cv|ats|bullet)/.test(s)) {
    const job = company ?? data.jobs[0];
    const miss = job.skills.filter((k) => !k.have).sort((a, b) => b.marks - a.marks)[0];
    return {
      text: `Three edits would lift your ATS score for ${job.company} from ${data.stats.ats} to ${data.stats.ats + 7} without claiming anything new. ${miss ? `${miss.name} is the biggest gap (+${miss.marks} marks), so it goes only where you have actually used it.` : ''}`,
      cards: job.tailor.map((t, i) => ({ id: `e${i}`, kind: 'edit', title: `${t.section} · ${t.keyword}`, meta: `+${[3, 2, 2][i]} ATS`, before: t.before, after: t.after, action: 'Open in Resume Studio', target: 'resume' })),
      sources: [`${job.company} job post`, 'Resume v5', `Match breakdown · ${job.company} ${job.score}`],
    };
  }
  if (/(interview|prep|practi[cs]e|mock)/.test(s)) {
    const it = data.interview;
    return {
      text: `${it.company}, tomorrow at 11:00: ${it.round.toLowerCase()} with ${it.interviewer.split(',')[0]}. Expect React state, async JavaScript and one SQL query. Start with the topic you rated lowest.`,
      cards: [
        { id: 'p1', kind: 'task', title: 'React state, effects and closures', meta: '20 min · 5 flash questions', action: 'Practise', target: 'interview' },
        { id: 'p2', kind: 'task', title: 'One SQL query out loud', meta: '10 min · second-highest salary', action: 'Practise', target: 'interview' },
        { id: 'p3', kind: 'task', title: 'STAR: college fest website', meta: '15 min · your strongest story', action: 'Open notes', target: 'interview' },
      ],
      sources: [`${it.company} job post`, 'Question bank · Frontend', 'Your STAR notes'],
    };
  }
  if (/(learn|skill|gap|next|improve)/.test(s)) {
    return {
      text: `Learn TypeScript next. It appears in ${data.backlog[0].jobs} of ${data.stats.jobsIndexed} jobs, adds up to +${data.backlog[0].marks} marks each, and would turn ${data.backlog[0].strongGain} more jobs into strong matches (3 → ${3 + data.backlog[0].strongGain}).`,
      cards: data.backlog.slice(0, 3).map((b) => ({ id: b.skill, kind: 'task', title: b.skill, meta: `+${b.marks} marks · ${b.jobs} jobs · +${b.strongGain} strong`, action: 'Add to plan', target: 'skills' })),
      sources: ['Skill demand · 128 jobs', 'Your skill levels', 'Match breakdowns'],
    };
  }
  if (/(follow|email|draft|reply|nudge)/.test(s)) {
    return {
      text: 'Here is a short follow-up for Zentro Labs. It is day 7, which is the usual point to nudge. It keeps to three sentences and references the fest website your referrer mentioned.',
      cards: [
        { id: 'f1', kind: 'edit', title: 'Draft · Zentro Labs', meta: 'To Maya Fernandes', before: 'Subject: UI Developer Intern application', after: 'Hi Maya, I applied for the UI Developer Intern role on Oct 17 and wanted to check in. I recently shipped the college fest site in React (4,200 visitors in 3 days) and would love to bring that to Zentro. Happy to share more. Thanks, Ananya', action: 'Open application', target: 'applications' },
        { id: 'f2', kind: 'task', title: 'Set a reminder for Oct 31', meta: 'If no reply in 7 more days', action: 'Open calendar', target: 'calendar' },
      ],
      sources: ['Application · Zentro Labs', 'Your notes', 'Follow-up timing guide'],
    };
  }

  const minMatch = s.match(/(?:above|over|>=?|min(?:imum)?|at least)\s*(\d{2})/);
  const min = minMatch ? parseInt(minMatch[1], 10) : s.includes('strong') ? 70 : 0;
  const remote = s.includes('remote');
  const role: RoleCat | null = s.includes('data') ? 'Data' : s.includes('full') ? 'Full-stack' : s.includes('backend') ? 'Backend' : /(front|react|ui|web)/.test(s) ? 'Frontend' : null;
  const closing = /(clos|deadline|this week)/.test(s);
  const match = (j: Job, strict = true) => (!strict || j.score >= min) && (!remote || j.mode === 'Remote') && (!role || j.role === role) && (!closing || (j.deadlineDays !== null && j.deadlineDays <= 7));
  let list = data.jobs.filter((j) => match(j));
  list.sort(closing ? (a, b) => (a.deadlineDays ?? 99) - (b.deadlineDays ?? 99) : (a, b) => b.score - a.score);
  const label = `${remote ? 'remote ' : ''}${role ? role.toLowerCase() + ' ' : ''}jobs${min ? ` scoring ${min}+` : ''}${closing ? ' closing within 7 days' : ''}`;
  let text: string;
  if (list.length) {
    const top = list[0];
    text = `I found ${list.length} ${label}. ${top.company} leads at ${top.score}${top.deadlineDays !== null && top.deadlineDays <= 3 ? ` and closes in ${top.deadlineDays} days, so start there` : ''}.`;
  } else {
    list = data.jobs.filter((j) => match(j, false)).sort((a, b) => b.score - a.score);
    const top = list[0];
    text = top
      ? `No ${label} yet. The closest is ${top.company} at ${top.score}; adding ${top.skills.filter((k) => !k.have).sort((a, b) => b.marks - a.marks)[0]?.name ?? 'one skill'} would push it higher.`
      : 'Nothing matches that yet. Try widening the role or location.';
  }
  return {
    text,
    cards: list.slice(0, 3).map((j) => ({ id: j.id, kind: 'job', title: j.title, meta: `${j.company} · ${j.city === 'Remote' ? 'Remote' : `${j.city} · ${j.mode}`}`, score: j.score, jobId: j.id, action: 'View match', target: 'jobs' })),
    sources: [`Match breakdown · ${data.stats.jobsIndexed} jobs`, 'Resume v5 · skills', `Job posts · ${data.source.name} ${data.source.synced}`],
  };
}
