import type { Job as ApiJob, Profile as ApiProfile, Application as ApiApplication, CurrentUser as ApiCurrentUser } from './api';
import type { MatchResult } from './match';
import { matchScore } from './match';
import { marksIfAdded } from './insights';

/* =====================================================================
   UI Types for Ported Components
   ===================================================================== */

export type Screen =
  | 'landing' | 'login' | 'signup' | 'onboarding'
  | 'overview' | 'command' | 'jobs' | 'matches' | 'saved'
  | 'skills' | 'resume' | 'interview' | 'insights'
  | 'applications' | 'calendar' | 'activity' | 'settings';

export type DataState = 'ready' | 'loading' | 'empty' | 'error';
export type Tone = 'green' | 'amber' | 'blue' | 'violet' | 'terra' | 'ink' | 'faint';
export type Category = 'MATCH' | 'APPLICATION' | 'RESUME' | 'INTERVIEW' | 'DEADLINE';
export type RoleCat = 'Frontend' | 'Full-stack' | 'Backend' | 'Data' | 'QA / DevOps' | 'Mobile';
export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type AppStatus = 'applied' | 'review' | 'interview' | 'offer' | 'rejected';
export type Posted = 'any' | '24h' | '3d' | '7d';
export type SortKey = 'best' | 'newest' | 'gain';

export interface User {
  name: string;
  first: string;
  initials: string;
  email: string;
  phone: string;
  program: string;
  college: string;
  degree: string;
  years: string;
  cgpa: string;
  city: string;
  skills: string[];
  targetRoles: string[];
  locations: string[];
  stipendMin: number;
}

export interface JobSkill {
  name: string;
  marks: number;
  have: boolean;
}

export interface Marks {
  skills: number;
  role: number;
  location: number;
  experience: number;
}

export interface TailorTip {
  section: string;
  before: string;
  after: string;
  keyword: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  role: RoleCat;
  city: string;
  mode: WorkMode;
  level: string;
  postedHours: number;
  stipend: string;
  deadlineDays: number | null;
  skills: JobSkill[];
  marks: Marks;
  score: number;
  why: {
    skills: string;
    role: string;
    location: string;
    experience: string;
  };
  about: string;
  tailor: TailorTip[];
}

export interface JobFilters {
  role: RoleCat | null;
  location: string | null;
  level: string | null;
  min: number;
  remote: boolean;
  posted: Posted;
  sort: SortKey;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Partial<JobFilters>;
}

export interface TimelineEntry {
  date: string;
  label: string;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  date: string;
  status: AppStatus;
  score: number;
  nextStep: string;
  responseDays: number | null;
  contact: { name: string; title: string; email: string };
  notes: string;
  resume: string;
  timeline: TimelineEntry[];
}

export interface AttentionItem {
  id: string;
  category: Category;
  time: string;
  title: string;
  body: string;
  action: string;
  target: Screen;
  jobId?: string;
}

export interface PulseEvent {
  time: string;
  label: string;
  detail: string;
  category: Category;
}

export interface NotificationItem {
  id: string;
  category: Category;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  target: Screen;
}

export interface SkillStat {
  name: string;
  demand: number;
  level: number;
  jobs: number;
}

export interface BacklogItem {
  skill: string;
  marks: number;
  jobs: number;
  strongGain: number;
  avgGain: number;
}

export interface AtsCats {
  keywords: number;
  sections: number;
  contact: number;
  length: number;
  impact: number;
}

export interface ResumeVersion {
  id: string;
  label: string;
  date: string;
  score: number;
  cats: AtsCats;
  note: string;
  variant?: boolean;
}

export interface AtsTip {
  id: string;
  text: string;
  points: number;
  done: boolean;
  cat: keyof AtsCats;
}

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  years: string;
  cgpa: string;
  skills: string[];
  hints: { field: string; text: string }[];
}

export interface ResumeSection {
  id: string;
  title: string;
  lines: string[];
}

export interface CalEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  type: 'interview' | 'deadline' | 'followup' | 'other';
  company?: string;
  note?: string;
}

export interface ActivityEvent {
  id: string;
  date: string;
  time: string;
  category: Category;
  title: string;
  detail: string;
}

export interface Question {
  id: string;
  role: 'Frontend' | 'Full-stack' | 'Data' | 'Behavioural';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
  hint: string;
}

export interface StarNote {
  id: string;
  title: string;
  tags: string[];
  s: string;
  t: string;
  a: string;
  r: string;
}

export interface UpcomingInterview {
  company: string;
  role: string;
  date: string;
  time: string;
  round: string;
  mode: string;
  interviewer: string;
  hoursUntil: number;
  checklist: { id: string; text: string; done: boolean }[];
}

export interface LearningItem {
  id: string;
  skill: string;
  title: string;
  resource: string;
  hours: number;
  progress: number;
}

export interface JobAlert {
  id: string;
  name: string;
  rule: string;
  frequency: 'Instant' | 'Daily' | 'Weekly';
  on: boolean;
  matches: number;
}

export interface ChatTurn {
  id: string;
  role: 'user' | 'ai';
  time: string;
  text: string;
  kind?: 'jobs' | 'diff' | 'plan';
  jobFilter?: { mode?: WorkMode; role?: RoleCat; min?: number };
  diff?: { section: string; before: string; after: string }[];
  plan?: { title: string; minutes: number }[];
  sources?: string[];
}

export interface NextBestAction {
  title: string;
  description: string;
  action: string;
  target: Screen | string;
}

export interface UIData {
  today: { iso: string; label: string; weekday: string };
  user: User;
  nextBestAction?: NextBestAction;
  stats: {
    applications: number;
    weekly: number[];
    weekLabels: string[];
    weeklyGoal: number;
    thisWeek: number;
    streak: number;
    jobsIndexed: number;
    newToday: number;
    strong: number;
    avgMatch: number;
    avgMatchDelta: number;
    saved: number;
    ats: number;
    atsPrev: number;
    matchTrend: number[];
    matchTrendLabels: string[];
    strongSpark: number[];
    savedSpark: number[];
    activeWeek: boolean[];
  };
  funnel: { label: string; value: number }[];
  stageDays: { label: string; value: number }[];
  skills: SkillStat[];
  backlog: BacklogItem[];
  whatIf: { base: number; baseAvg: number; defaultOn: string[] };
  jobs: Job[];
  savedIds: string[];
  savedNotes: Record<string, string>;
  savedSearches: SavedSearch[];
  applications: Application[];
  attention: AttentionItem[];
  pulse: PulseEvent[];
  notifications: NotificationItem[];
  heatmap: number[][];
  resumeVersions: ResumeVersion[];
  atsTips: AtsTip[];
  parsedResume: ParsedResume;
  resumeText: ResumeSection[];
  calendar: CalEvent[];
  activity: ActivityEvent[];
  questions: Question[];
  starNotes: StarNote[];
  interview: UpcomingInterview;
  learning: LearningItem[];
  alerts: JobAlert[];
  notificationSettings: { id: string; label: string; desc: string; on: boolean }[];
  profile: { strength: number; missing: { label: string; gain: number }[] };
  commandHistory: { group: string; items: { text: string; time: string }[] }[];
  conversation: ChatTurn[];
  suggestions: string[];
  quickActions: string[];
  faq: { q: string; a: string }[];
  source: { name: string; synced: string; jobs: number };
}

export function createEmptyUIData(overrides?: Partial<UIData>): UIData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    today: { iso: today, label: 'Today', weekday: 'Mon' },
    user: {
      name: 'Student',
      first: 'Student',
      initials: 'ST',
      email: '',
      phone: '',
      program: 'Computer Science',
      college: '',
      degree: '',
      years: '2026',
      cgpa: '',
      city: 'Remote',
      skills: [],
      targetRoles: [],
      locations: [],
      stipendMin: 0,
    },
    stats: {
      applications: 0,
      weekly: Array(12).fill(0),
      weekLabels: Array(12).fill(''),
      weeklyGoal: 5,
      thisWeek: 0,
      streak: 0,
      jobsIndexed: 0,
      newToday: 0,
      strong: 0,
      avgMatch: 0,
      avgMatchDelta: 0,
      saved: 0,
      ats: 0,
      atsPrev: 0,
      matchTrend: [],
      matchTrendLabels: [],
      strongSpark: [],
      savedSpark: [],
      activeWeek: Array(7).fill(false),
    },
    funnel: [],
    stageDays: [],
    skills: [],
    backlog: [],
    whatIf: { base: 0, baseAvg: 0, defaultOn: [] },
    jobs: [],
    savedIds: [],
    savedNotes: {},
    savedSearches: [],
    applications: [],
    attention: [],
    pulse: [],
    notifications: [],
    heatmap: Array(12).fill(Array(7).fill(0)),
    resumeVersions: [],
    atsTips: [],
    parsedResume: {
      name: '',
      email: '',
      phone: '',
      college: '',
      degree: '',
      years: '',
      cgpa: '',
      skills: [],
      hints: [],
    },
    resumeText: [],
    calendar: [],
    activity: [],
    questions: [],
    starNotes: [],
    interview: {
      company: '',
      role: '',
      date: today,
      time: '',
      round: 'Technical',
      mode: 'Video',
      interviewer: '',
      hoursUntil: 0,
      checklist: [],
    },
    learning: [],
    alerts: [],
    notificationSettings: [],
    profile: { strength: 0, missing: [] },
    commandHistory: [],
    conversation: [],
    suggestions: [],
    quickActions: [
      'Find remote React jobs',
      'Boost resume ATS score',
      'Check deadline status',
    ],
    faq: [],
    source: { name: 'Jaggle Index', synced: 'just now', jobs: 0 },
    ...overrides,
  };
}

/* =====================================================================
   Constants and Helpers
   ===================================================================== */

export const STATUS_ORDER: AppStatus[] = ['applied', 'review', 'interview', 'offer', 'rejected'];

export const STATUS_META: Record<AppStatus, { label: string; tone: Tone }> = {
  applied: { label: 'Applied', tone: 'blue' },
  review: { label: 'In review', tone: 'amber' },
  interview: { label: 'Interview', tone: 'green' },
  offer: { label: 'Offer', tone: 'violet' },
  rejected: { label: 'Rejected', tone: 'faint' },
};

export const CAT_TONE: Record<Category, Tone> = {
  MATCH: 'blue',
  APPLICATION: 'amber',
  RESUME: 'violet',
  INTERVIEW: 'green',
  DEADLINE: 'terra',
};

export type TierWord = 'Strong' | 'Good' | 'Partial' | 'Low';

export function tierOf(score: number): { word: TierWord; tone: Tone } {
  if (score >= 70) return { word: 'Strong', tone: 'green' };
  if (score >= 50) return { word: 'Good', tone: 'blue' };
  if (score >= 30) return { word: 'Partial', tone: 'amber' };
  return { word: 'Low', tone: 'faint' };
}

const d = (iso: string) => new Date(iso + 'T12:00:00Z');

export function fmtDate(iso: string, withDay = false): string {
  return d(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
    ...(withDay ? { weekday: 'short' } : {}),
  });
}

export function addDays(iso: string, n: number): string {
  const t = d(iso);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((d(b).getTime() - d(a).getTime()) / 86400000);
}

/** Monday = 0 … Sunday = 6 */
export function weekdayIdx(iso: string): number {
  return (d(iso).getUTCDay() + 6) % 7;
}

/** Relative day from today (or custom today) without TODAY constant */
export function relDay(iso: string, todayIso?: string): string {
  const ref = todayIso ?? new Date().toISOString().slice(0, 10);
  const n = daysBetween(iso, ref);
  if (n === 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n === -1) return 'Tomorrow';
  return fmtDate(iso, true);
}

export function fmtPosted(hours: number): string {
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? '1d ago' : `${days}d ago`;
}

export function gainOf(job: Job): { marks: number; skill: string } {
  const miss = job.skills.filter((s) => !s.have).sort((a, b) => b.marks - a.marks)[0];
  return miss ? { marks: miss.marks, skill: miss.name } : { marks: 0, skill: '' };
}

export function kanban(apps: Application[]): Record<AppStatus, number> {
  const out: Record<AppStatus, number> = {
    applied: 0,
    review: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  };
  apps.forEach((a) => {
    if (out[a.status] !== undefined) {
      out[a.status]++;
    }
  });
  return out;
}

export function initialsOf(name: string): string {
  const parts = name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || name.slice(0, 2).toUpperCase() || 'U';
}

/* =====================================================================
   Adapters: Convert real API models to UI View Models
   ===================================================================== */

export function mapRoleToCategory(roleOrTitle: string): RoleCat {
  const rLower = (roleOrTitle || '').toLowerCase();
  if (rLower.includes('front') || rLower.includes('react') || rLower.includes('ui') || rLower.includes('web')) return 'Frontend';
  if (rLower.includes('back') || rLower.includes('node') || rLower.includes('go') || rLower.includes('python') || rLower.includes('java')) return 'Backend';
  if (rLower.includes('data') || rLower.includes('analyst') || rLower.includes('ml') || rLower.includes('ai')) return 'Data';
  if (rLower.includes('devops') || rLower.includes('qa') || rLower.includes('cloud') || rLower.includes('test') || rLower.includes('infra')) return 'QA / DevOps';
  if (rLower.includes('mobile') || rLower.includes('ios') || rLower.includes('android')) return 'Mobile';
  return 'Full-stack';
}

export function mapWorkMode(location: string): WorkMode {
  const locLower = (location || '').toLowerCase();
  if (locLower.includes('remote')) return 'Remote';
  if (locLower.includes('on-site') || locLower.includes('onsite')) return 'On-site';
  return 'Hybrid';
}

export function mapExperienceLevel(minYears: number = 0): string {
  return minYears === 0 ? 'Intern' : `Entry (${minYears}y)`;
}

export function toJobRow(
  job: ApiJob,
  matchResult?: MatchResult | null,
): Job {
  const score = matchResult?.score ?? 0;
  const marks: Marks = {
    skills: matchResult?.skillsPoints ?? 0,
    role: matchResult?.rolePoints ?? 0,
    location: matchResult?.locationPoints ?? 0,
    experience: matchResult?.experiencePoints ?? 0,
  };

  const matchedSet = new Set((matchResult?.matchedSkills ?? []).map((s) => s.toLowerCase()));
  const reqSkills = job.requiredSkills || [];
  const defaultSkillMarks = Math.max(1, Math.round(70 / Math.max(1, reqSkills.length)));

  const skills: JobSkill[] = reqSkills.map((skillName) => ({
    name: skillName,
    marks: defaultSkillMarks,
    have: matchedSet.has(skillName.toLowerCase()),
  }));

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    role: mapRoleToCategory(job.role || job.title),
    city: job.location || 'Bengaluru',
    mode: mapWorkMode(job.location || ''),
    level: mapExperienceLevel(job.minExperienceYears),
    postedHours: 4,
    stipend: '₹25,000 / mo',
    deadlineDays: 7,
    skills,
    marks,
    score,
    why: {
      skills: `${marks.skills}/70 marks from matched skills`,
      role: `${marks.role}/15 marks for role alignment`,
      location: `${marks.location}/10 marks for preferred location`,
      experience: `${marks.experience}/5 marks for experience`,
    },
    about: job.summary || `${job.title} at ${job.company}.`,
    tailor: [],
  };
}

export function toJobDetail(
  job: ApiJob,
  matchResult?: MatchResult | null,
  profile?: ApiProfile | null,
): Job {
  const match = matchResult ?? (profile ? matchScore(profile, job) : null);
  const score = match?.score ?? 0;
  const marks: Marks = {
    skills: match?.skillsPoints ?? 0,
    role: match?.rolePoints ?? 0,
    location: match?.locationPoints ?? 0,
    experience: match?.experiencePoints ?? 0,
  };

  const matchedSet = new Set((match?.matchedSkills ?? []).map((s) => s.toLowerCase()));
  const userSkillSet = new Set((profile?.skills ?? []).map((s) => s.toLowerCase()));
  const reqSkills = job.requiredSkills || [];
  const defaultSkillMarks = Math.max(1, Math.round(70 / Math.max(1, reqSkills.length)));

  const skills: JobSkill[] = reqSkills.map((skillName) => {
    const have = matchedSet.size > 0
      ? matchedSet.has(skillName.toLowerCase())
      : userSkillSet.has(skillName.toLowerCase());

    let skillMarks: number;
    if (!have && profile) {
      const gain = marksIfAdded(job, profile, skillName);
      skillMarks = gain > 0 ? gain : defaultSkillMarks;
    } else {
      skillMarks = defaultSkillMarks;
    }

    return {
      name: skillName,
      marks: skillMarks,
      have,
    };
  });

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    role: mapRoleToCategory(job.role || job.title),
    city: job.location || 'Bengaluru',
    mode: mapWorkMode(job.location || ''),
    level: mapExperienceLevel(job.minExperienceYears),
    postedHours: 4,
    stipend: '₹25,000 / mo',
    deadlineDays: 7,
    skills,
    marks,
    score,
    why: {
      skills: `${marks.skills}/70 marks from matched skills`,
      role: `${marks.role}/15 marks for role alignment`,
      location: `${marks.location}/10 marks for preferred location`,
      experience: `${marks.experience}/5 marks for experience`,
    },
    about: job.summary || `${job.title} at ${job.company}.`,
    tailor: [
      {
        section: 'Summary',
        before: 'Seeking software engineering roles.',
        after: `Targeting ${job.role || job.title} roles with hands-on experience in ${reqSkills.slice(0, 2).join(', ') || 'modern development'}.`,
        keyword: reqSkills[0] || 'Technical',
      },
    ],
  };
}

export function toUIJob(
  apiJob: ApiJob,
  profileOrSkills?: ApiProfile | string[] | null,
  matchResult?: MatchResult | null,
): Job {
  const profile: ApiProfile | null = Array.isArray(profileOrSkills)
    ? {
        name: 'Student',
        email: 'student@example.com',
        branch: 'Computer Science',
        year: '3rd year',
        preferredLocation: 'Remote',
        skills: profileOrSkills,
        preferredRoles: [],
      }
    : (profileOrSkills ?? null);

  return toJobDetail(apiJob, matchResult, profile);
}

export function toUIApplication(
  apiApp: ApiApplication,
  job?: ApiJob | null,
): Application {
  const dateIso = apiApp.appliedAt ? apiApp.appliedAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    id: apiApp.id,
    company: job?.company || 'Company',
    role: job?.title || 'Software Engineer',
    date: dateIso,
    status: 'applied',
    score: 65,
    nextStep: 'Awaiting employer review',
    responseDays: null,
    contact: {
      name: 'Talent Team',
      title: 'Recruiting',
      email: 'recruiting@company.com',
    },
    notes: '',
    resume: 'resume_v1.pdf',
    timeline: [
      {
        date: dateIso,
        label: 'Application submitted',
      },
    ],
  };
}

export function toUIUser(
  profile?: ApiProfile | null,
  currentUser?: ApiCurrentUser | null,
): User {
  const name = profile?.name || currentUser?.name || 'Student';
  const email = profile?.email || currentUser?.email || '';
  const first = name.split(' ')[0] || name;

  return {
    name,
    first,
    initials: initialsOf(name),
    email,
    phone: '',
    program: profile?.branch ? `${profile.branch}, ${profile.year || 'Student'}` : 'B.Tech CSE',
    college: 'Engineering Institute',
    degree: profile?.branch || 'B.Tech',
    years: profile?.year || '2024 - 2028',
    cgpa: '8.0',
    city: profile?.preferredLocation || 'Bengaluru',
    skills: profile?.skills || [],
    targetRoles: profile?.preferredRoles || [],
    locations: profile?.preferredLocation ? [profile.preferredLocation] : ['Remote', 'Bengaluru'],
    stipendMin: 20000,
  };
}

