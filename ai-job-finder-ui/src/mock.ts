/* =====================================================================
   AI Job Finder: TYPES first, then the single MOCK object.
   Every screen reads from MOCK (passed down as props). Helper builders
   at the bottom are hoisted function declarations used inside MOCK.
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
  name: string; first: string; initials: string; email: string; phone: string;
  program: string; college: string; degree: string; years: string; cgpa: string; city: string;
  skills: string[]; targetRoles: string[]; locations: string[]; stipendMin: number;
}
export interface JobSkill { name: string; marks: number; have: boolean }
export interface Marks { skills: number; role: number; location: number; experience: number }
export interface TailorTip { section: string; before: string; after: string; keyword: string }
export interface Job {
  id: string; title: string; company: string; role: RoleCat; city: string; mode: WorkMode; level: string;
  postedHours: number; stipend: string; deadlineDays: number | null;
  skills: JobSkill[]; marks: Marks; score: number;
  why: { skills: string; role: string; location: string; experience: string };
  about: string; tailor: TailorTip[];
}
export interface JobFilters {
  role: RoleCat | null; location: string | null; level: string | null;
  min: number; remote: boolean; posted: Posted; sort: SortKey;
}
export interface SavedSearch { id: string; name: string; filters: Partial<JobFilters> }
export interface TimelineEntry { date: string; label: string }
export interface Application {
  id: string; company: string; role: string; date: string; status: AppStatus; score: number;
  nextStep: string; responseDays: number | null;
  contact: { name: string; title: string; email: string };
  notes: string; resume: string; timeline: TimelineEntry[];
}
export interface AttentionItem {
  id: string; category: Category; time: string; title: string; body: string;
  action: string; target: Screen; jobId?: string;
}
export interface PulseEvent { time: string; label: string; detail: string; category: Category }
export interface NotificationItem { id: string; category: Category; title: string; body: string; time: string; unread: boolean; target: Screen }
export interface SkillStat { name: string; demand: number; level: number; jobs: number }
export interface BacklogItem { skill: string; marks: number; jobs: number; strongGain: number; avgGain: number }
export interface AtsCats { keywords: number; sections: number; contact: number; length: number; impact: number }
export interface ResumeVersion { id: string; label: string; date: string; score: number; cats: AtsCats; note: string; variant?: boolean }
export interface AtsTip { id: string; text: string; points: number; done: boolean; cat: keyof AtsCats }
export interface ParsedResume {
  name: string; email: string; phone: string; college: string; degree: string; years: string; cgpa: string;
  skills: string[]; hints: { field: string; text: string }[];
}
export interface ResumeSection { id: string; title: string; lines: string[] }
export interface CalEvent { id: string; date: string; time?: string; title: string; type: 'interview' | 'deadline' | 'followup' | 'other'; company?: string; note?: string }
export interface ActivityEvent { id: string; date: string; time: string; category: Category; title: string; detail: string }
export interface Question { id: string; role: 'Frontend' | 'Full-stack' | 'Data' | 'Behavioural'; difficulty: 'Easy' | 'Medium' | 'Hard'; text: string; hint: string }
export interface StarNote { id: string; title: string; tags: string[]; s: string; t: string; a: string; r: string }
export interface UpcomingInterview {
  company: string; role: string; date: string; time: string; round: string; mode: string;
  interviewer: string; hoursUntil: number; checklist: { id: string; text: string; done: boolean }[];
}
export interface LearningItem { id: string; skill: string; title: string; resource: string; hours: number; progress: number }
export interface JobAlert { id: string; name: string; rule: string; frequency: 'Instant' | 'Daily' | 'Weekly'; on: boolean; matches: number }
export interface ChatTurn {
  id: string; role: 'user' | 'ai'; time: string; text: string;
  kind?: 'jobs' | 'diff' | 'plan';
  jobFilter?: { mode?: WorkMode; role?: RoleCat; min?: number };
  diff?: { section: string; before: string; after: string }[];
  plan?: { title: string; minutes: number }[];
  sources?: string[];
}
export interface MockData {
  today: { iso: string; label: string; weekday: string };
  user: User;
  stats: {
    applications: number; weekly: number[]; weekLabels: string[]; weeklyGoal: number; thisWeek: number;
    streak: number; jobsIndexed: number; newToday: number; strong: number; avgMatch: number; avgMatchDelta: number;
    saved: number; ats: number; atsPrev: number; matchTrend: number[]; matchTrendLabels: string[];
    strongSpark: number[]; savedSpark: number[]; activeWeek: boolean[];
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

/* =====================================================================
   MOCK: the seeded story (Ananya Sharma, Friday Oct 24)
   ===================================================================== */
export const MOCK: MockData = {
  today: { iso: '2025-10-24', label: 'Friday, October 24', weekday: 'Friday' },

  user: {
    name: 'Ananya Sharma', first: 'Ananya', initials: 'AS',
    email: 'ananya.sharma@sahyadri.edu.in', phone: '98450 12345',
    program: 'B.Tech CSE, 2nd year', college: 'Sahyadri Institute of Technology, Pune',
    degree: 'B.Tech, Computer Science & Engineering', years: '2024 – 2028', cgpa: '8.4', city: 'Pune',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git', 'Python', 'SQL'],
    targetRoles: ['Frontend Developer', 'Full-stack Developer', 'Data Analyst'],
    locations: ['Bengaluru', 'Remote', 'Hyderabad', 'Pune'],
    stipendMin: 25000,
  },

  stats: {
    applications: 24,
    weekly: [0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 2, 3],
    weekLabels: ['Aug 4', 'Aug 11', 'Aug 18', 'Aug 25', 'Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29', 'Oct 6', 'Oct 13', 'Oct 20'],
    weeklyGoal: 5, thisWeek: 3, streak: 4,
    jobsIndexed: 128, newToday: 9, strong: 3,
    avgMatch: 41, avgMatchDelta: 5, saved: 9, ats: 72, atsPrev: 64,
    matchTrend: [29, 31, 33, 34, 33, 35, 36, 41],
    matchTrendLabels: ['Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29', 'Oct 6', 'Oct 13', 'Oct 20'],
    strongSpark: [0, 0, 1, 1, 1, 2, 1, 2, 2, 1, 1, 3],
    savedSpark: [2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 8, 9],
    activeWeek: [false, true, true, true, true, false, false],
  },

  funnel: [
    { label: 'Applied', value: 24 },
    { label: 'Reviewed', value: 18 },
    { label: 'Interview', value: 6 },
    { label: 'Offer', value: 2 },
  ],
  stageDays: [
    { label: 'Applied', value: 6 },
    { label: 'In review', value: 5 },
    { label: 'Interview', value: 8 },
    { label: 'Offer', value: 3 },
  ],

  skills: [
    { name: 'React', demand: 61, level: 85, jobs: 78 },
    { name: 'TypeScript', demand: 48, level: 40, jobs: 62 },
    { name: 'Node.js', demand: 44, level: 35, jobs: 56 },
    { name: 'SQL', demand: 39, level: 50, jobs: 50 },
    { name: 'Python', demand: 36, level: 60, jobs: 46 },
    { name: 'Testing', demand: 27, level: 20, jobs: 35 },
    { name: 'System design', demand: 19, level: 10, jobs: 24 },
    { name: 'Docker', demand: 18, level: 15, jobs: 23 },
  ],
  backlog: [
    { skill: 'TypeScript', marks: 9, jobs: 62, strongGain: 9, avgGain: 3 },
    { skill: 'Node.js', marks: 7, jobs: 56, strongGain: 2, avgGain: 2 },
    { skill: 'SQL', marks: 5, jobs: 50, strongGain: 1, avgGain: 1 },
    { skill: 'Testing', marks: 4, jobs: 35, strongGain: 1, avgGain: 1 },
    { skill: 'Docker', marks: 3, jobs: 23, strongGain: 0, avgGain: 0 },
  ],
  whatIf: { base: 3, baseAvg: 41, defaultOn: ['TypeScript', 'Node.js'] },

  jobs: withGenerated([
    F('j-novapay', 'Frontend Engineer Intern', 'NovaPay', 'Frontend', 'Bengaluru', 'Hybrid', 'Intern', 2, '₹40,000/mo', 14,
      'React:10+,JavaScript:10+,HTML:8+,CSS:8+,Git:6+,SQL:6+,Python:6+,TypeScript:9,Testing:4,Figma:3', 15, 8, 5),
    F('j-pixelworks', 'React Developer Intern', 'PixelWorks', 'Frontend', 'Remote', 'Remote', 'Intern', 72, '₹30,000/mo', 2,
      'React:12+,JavaScript:10+,HTML:8+,CSS:8+,Git:6+,TypeScript:9,Redux:6,Testing:4,Tailwind:4,REST APIs:3', 15, 10, 5),
    F('j-cloudsprint', 'Web Platform Intern', 'CloudSprint', 'Frontend', 'Pune', 'On-site', 'Intern', 5, '₹35,000/mo', 5,
      'JavaScript:10+,React:9+,HTML:7+,CSS:7+,Git:6+,Python:6+,TypeScript:9,Node.js:7,CI/CD:6,Docker:3', 15, 6, 5),
    F('j-brightlane', 'Full-stack Intern (React + Node)', 'Brightlane', 'Full-stack', 'Hyderabad', 'Hybrid', 'Entry · 1–2 yrs', 26, '₹32,000/mo', 12,
      'React:9+,JavaScript:9+,HTML:6+,CSS:6+,Git:6+,SQL:6+,Node.js:7,TypeScript:9,Express:6,Testing:6', 15, 8, 0),
    F('j-quantive', 'Product Engineer Intern', 'Quantive', 'Frontend', 'Remote', 'Remote', 'Intern', 9, '₹28,000/mo', null,
      'React:8+,JavaScript:8+,HTML:7+,CSS:6+,Git:5+,TypeScript:9,Next.js:8,Testing:7,GraphQL:6,Node.js:6', 12, 10, 5),
    F('j-datanest', 'Data Analyst Intern', 'Datanest', 'Data', 'Gurugram', 'Hybrid', 'Intern', 50, '₹25,000/mo', 9,
      'Python:11+,SQL:11+,JavaScript:6+,Git:6+,React:3+,Pandas:9,Statistics:8,Tableau:6,Excel:5,Power BI:5', 12, 4, 5),
    F('j-orbital', 'Frontend Intern (Vue)', 'Orbital Health', 'Frontend', 'Chennai', 'On-site', 'Intern', 98, '₹22,000/mo', null,
      'JavaScript:10+,HTML:8+,CSS:8+,Git:5+,Vue:10,TypeScript:8,Testing:6,Vuex:5,Accessibility:5,REST APIs:5', 15, 3, 5),
    F('j-kitebyte', 'QA Automation Intern', 'Kitebyte', 'QA / DevOps', 'Remote', 'Remote', 'Intern', 146, '₹20,000/mo', null,
      'Python:9+,JavaScript:7+,Git:6+,SQL:5+,Selenium:9,Testing:9,CI/CD:7,Linux:7,API testing:7,Jira:4', 7, 10, 5),
    F('j-lumora', 'Backend Developer Intern (Node)', 'Lumora', 'Backend', 'Bengaluru', 'On-site', 'Intern', 49, '₹30,000/mo', null,
      'SQL:9+,JavaScript:9+,Git:7+,Node.js:10,Express:8,MongoDB:6,REST APIs:6,Docker:5,TypeScript:5,Redis:5', 8, 7, 5),
    F('j-ferrum', 'Software Engineer Trainee (C++)', 'Ferrum Robotics', 'Backend', 'Pune', 'On-site', 'Intern', 121, '₹26,000/mo', null,
      'Python:10+,Git:6+,SQL:5+,C++:10,Linux:8,Data structures:8,ROS:7,Algorithms:7,Docker:5,Testing:4', 6, 6, 5),
  ]),

  savedIds: ['j-novapay', 'j-pixelworks', 'j-cloudsprint', 'j-brightlane', 'j-quantive', 'j-datanest', 'g-9', 'g-5', 'g-2'],
  savedNotes: {
    'j-novapay': 'Fintech, good mentorship reviews. Ask about PPO conversion.',
    'j-pixelworks': 'Closes Sunday. Apply tonight with resume v5.',
    'j-brightlane': 'Needs Node.js. Revisit after the Express mini-project.',
    'j-datanest': 'Backup option if data roles open up.',
  },
  savedSearches: [
    { id: 's1', name: 'Frontend · Remote · 60+', filters: { role: 'Frontend', remote: true, min: 60 } },
    { id: 's2', name: 'Strong matches only', filters: { min: 70 } },
    { id: 's3', name: 'Posted this week', filters: { posted: '7d', sort: 'newest' } },
    { id: 's4', name: 'Full-stack in Hyderabad', filters: { role: 'Full-stack', location: 'Hyderabad' } },
  ],

  applications: [
    A('a01', 'Arcadia Systems', 'Frontend Intern', '2025-08-13', 'offer', 66, 'Respond to offer by Oct 31', 2, 'Meera Iyer', 'Campus Recruiter'),
    A('a02', 'Mosaic Cloud', 'Software Intern', '2025-08-20', 'rejected', 41, 'Ask for feedback', 7, 'Arjun Rao', 'Talent Partner'),
    A('a03', 'Lumen AI', 'Web Intern', '2025-08-26', 'rejected', 38, 'Archived', 12, 'Sara Thomas', 'HR Associate'),
    A('a04', 'Northwind Apps', 'React Intern', '2025-08-29', 'offer', 62, 'Compare with Arcadia offer', 4, 'Kabir Shah', 'Engineering Manager'),
    A('a05', 'Helio Mobility', 'UI Engineer Intern', '2025-09-02', 'rejected', 35, 'Archived', 5, 'Nisha Verma', 'Recruiter'),
    A('a06', 'Verdant', 'Frontend Intern', '2025-09-05', 'interview', 64, 'Round 2 on Oct 30, 14:00', 3, 'Dev Malhotra', 'Frontend Lead'),
    A('a07', 'Stackforge', 'Platform Intern', '2025-09-09', 'rejected', 44, 'Archived', 9, 'Priya Nair', 'Recruiter'),
    A('a08', 'Bluepeak', 'Product Engineering Intern', '2025-09-12', 'review', 52, 'Expect a reply this week', 8, 'Omar Siddiqui', 'Recruiter'),
    A('a09', 'Corvid Security', 'Frontend Intern', '2025-09-16', 'interview', 59, 'Round 2 on Nov 4', 6, 'Leah D’Souza', 'Hiring Manager'),
    A('a10', 'Quillstack', 'Web Developer Intern', '2025-09-19', 'rejected', 47, 'Ask for feedback', 14, 'Ishaan Gupta', 'Talent Team'),
    A('a11', 'Finlytics', 'Software Engineer Intern (Frontend)', '2025-09-23', 'interview', 68, 'Interview tomorrow, 11:00', 1, 'Rohan Mehta', 'Senior Frontend Engineer'),
    A('a12', 'Ember Labs', 'UI Intern', '2025-09-25', 'review', 55, 'Portfolio review in progress', 5, 'Tara Kapoor', 'Design Lead'),
    A('a13', 'Orchid Retail', 'Frontend Developer Intern', '2025-09-27', 'review', 49, 'Follow up on Oct 28', 10, 'Vikram Joshi', 'Recruiter'),
    A('a14', 'Kestrel Analytics', 'Data Viz Intern', '2025-09-30', 'interview', 57, 'Case round on Oct 28, 15:00', 4, 'Ananth Krishnan', 'Analytics Lead'),
    A('a15', 'Riverstone', 'Junior Web Developer', '2025-10-02', 'review', 46, 'Waiting on take-home review', 7, 'Fatima Khan', 'Recruiter'),
    A('a16', 'Tidepool', 'Frontend Intern', '2025-10-04', 'review', 53, 'Recruiter screen on Oct 27', 2, 'Neel Banerjee', 'Recruiter'),
    A('a17', 'Monarch Ed', 'React Intern', '2025-10-07', 'review', 60, 'Hiring manager reviewing', 4, 'Riya Sen', 'Engineering Manager'),
    A('a18', 'Sable Fintech', 'UI Developer Intern', '2025-10-09', 'review', 51, 'Expect a reply by Oct 27', 6, 'Aditya Pillai', 'Talent Partner'),
    A('a19', 'Gridline', 'Frontend Intern', '2025-10-11', 'applied', 44, 'Followed up Oct 20', null, 'Karan Bedi', 'Recruiter'),
    A('a20', 'Halcyon Travel', 'Web Intern', '2025-10-14', 'applied', 48, 'Follow up on Oct 29', null, 'Sneha Rao', 'HR Executive'),
    A('a21', 'Zentro Labs', 'UI Developer Intern', '2025-10-17', 'applied', 63, 'Follow up today (7 days)', null, 'Maya Fernandes', 'Recruiter'),
    A('a22', 'Saffron Health', 'Frontend Intern', '2025-10-21', 'applied', 56, 'Wait until Oct 28', null, 'Rahul Menon', 'Talent Team'),
    A('a23', 'Juniper Works', 'React Developer Intern', '2025-10-22', 'applied', 50, 'Wait until Oct 29', null, 'Pooja Hegde', 'Recruiter'),
    A('a24', 'Waypoint', 'Frontend Engineering Intern', '2025-10-23', 'applied', 45, 'Wait until Oct 30', null, 'Siddharth Jain', 'Recruiter'),
  ],

  attention: [
    { id: 't1', category: 'MATCH', time: '2h ago', title: 'New 82% match: Frontend Engineer Intern at NovaPay',
      body: 'Your React and JavaScript work covers 7 of 10 required skills. Two bullet rewrites would add the TypeScript and testing keywords the posting repeats.',
      action: 'Tailor resume', target: 'resume', jobId: 'j-novapay' },
    { id: 't2', category: 'APPLICATION', time: '7d', title: 'No reply from Zentro Labs for 7 days',
      body: 'You applied for UI Developer Intern on Oct 17. A short, specific follow-up around day 7 is the norm, and a draft is ready.',
      action: 'Follow up', target: 'applications' },
    { id: 't3', category: 'RESUME', time: 'Yesterday', title: 'ATS score dropped on your “Data” variant',
      body: 'Variant v5-data scores 66 against 72 for your main resume. The Projects trim removed SQL and Python keywords, and your Datanest match fell from 64 to 58.',
      action: 'View match', target: 'jobs', jobId: 'j-datanest' },
    { id: 't4', category: 'INTERVIEW', time: 'Tomorrow', title: 'Interview tomorrow at 11:00 with Finlytics',
      body: 'Round 1, frontend technical with Rohan Mehta. Your prep checklist is 2 of 6 done; React state and one SQL query are the likely topics.',
      action: 'Prepare', target: 'interview' },
    { id: 't5', category: 'DEADLINE', time: '2 days', title: 'PixelWorks closes in 2 days',
      body: 'React Developer Intern (remote) is a strong 74 match and still unapplied. Applications close Sunday, Oct 26 at 23:59.',
      action: 'Apply', target: 'jobs', jobId: 'j-pixelworks' },
  ],

  pulse: [
    { time: '09:41', label: 'Resume parsed', detail: 'resume_v5.pdf · 7 skills, 4 sections', category: 'RESUME' },
    { time: '09:44', label: '3 skills added', detail: 'To your learning plan: TypeScript, Node.js, Testing', category: 'MATCH' },
    { time: 'Thu 18:20', label: 'Applied', detail: 'Frontend Engineering Intern · Waypoint', category: 'APPLICATION' },
    { time: 'Thu 16:05', label: 'Saved', detail: 'React Developer Intern · PixelWorks', category: 'MATCH' },
    { time: 'Wed 11:30', label: 'Status changed', detail: 'Finlytics moved to Interview', category: 'INTERVIEW' },
    { time: 'Wed 10:12', label: 'Applied', detail: 'React Developer Intern · Juniper Works', category: 'APPLICATION' },
  ],

  notifications: [
    { id: 'n1', category: 'MATCH', title: 'New strong match: NovaPay · 82', body: 'Frontend Engineer Intern, Bengaluru (hybrid)', time: '2h', unread: true, target: 'jobs' },
    { id: 'n2', category: 'INTERVIEW', title: 'Finlytics interview tomorrow, 11:00', body: 'Prep checklist 2 of 6 done', time: '3h', unread: true, target: 'interview' },
    { id: 'n3', category: 'DEADLINE', title: 'PixelWorks closes in 2 days', body: 'React Developer Intern · 74 match', time: '5h', unread: true, target: 'jobs' },
    { id: 'n4', category: 'APPLICATION', title: 'Zentro Labs: 7 days without reply', body: 'A follow-up draft is ready', time: '1d', unread: false, target: 'applications' },
    { id: 'n5', category: 'RESUME', title: 'ATS score up to 72', body: 'v5 is +8 on last week (64)', time: '1d', unread: false, target: 'resume' },
  ],

  heatmap: (() => {
    const g: number[][] = [];
    for (let w = 0; w < 12; w++) {
      const col: number[] = [];
      for (let d = 0; d < 7; d++) {
        if (w === 11) { col.push(d <= 4 ? [0, 2, 1, 3, 2][d] : -1); continue; }
        const r = Math.floor((((Math.sin((w * 7 + d + 1) * 12.9898) * 43758.5453) % 1) + 1) % 1 * 10);
        const weekend = d >= 5;
        let v = r < (weekend ? 6 : 3) ? 0 : r < 6 ? 1 : r < 8 ? 2 : r < 9 ? 3 : 4;
        if (w === 0) v = Math.min(v, 1);
        col.push(v);
      }
      g.push(col);
    }
    return g;
  })(),

  resumeVersions: [
    { id: 'v5', label: 'v5 · main', date: 'Oct 23', score: 72, cats: { keywords: 24, sections: 20, contact: 15, length: 8, impact: 5 }, note: 'Added Projects metrics, merged skills' },
    { id: 'v5-data', label: 'v5-data · variant', date: 'Oct 23', score: 66, cats: { keywords: 19, sections: 19, contact: 15, length: 8, impact: 5 }, note: 'Trimmed Projects for data roles', variant: true },
    { id: 'v4', label: 'v4', date: 'Oct 20', score: 68, cats: { keywords: 22, sections: 18, contact: 15, length: 8, impact: 5 }, note: 'Added phone and city to header' },
    { id: 'v3', label: 'v3', date: 'Sep 22', score: 64, cats: { keywords: 20, sections: 18, contact: 13, length: 8, impact: 5 }, note: 'Renamed sections to standard titles' },
    { id: 'v2', label: 'v2', date: 'Sep 1', score: 61, cats: { keywords: 19, sections: 17, contact: 12, length: 8, impact: 5 }, note: 'Cut to one page' },
    { id: 'v1', label: 'v1', date: 'Aug 11', score: 58, cats: { keywords: 18, sections: 15, contact: 12, length: 8, impact: 5 }, note: 'First upload' },
  ],
  atsTips: [
    { id: 'k1', text: 'Add “TypeScript” to a project you built with it; it appears in 48% of postings', points: 6, done: false, cat: 'keywords' },
    { id: 'k2', text: 'Quantify three project bullets (users, % faster, hours saved)', points: 3, done: false, cat: 'impact' },
    { id: 'k3', text: 'Add a links line with GitHub and portfolio under your name', points: 3, done: false, cat: 'sections' },
    { id: 'k4', text: 'Mirror the posting’s wording: “unit testing”, “REST APIs”', points: 4, done: false, cat: 'keywords' },
    { id: 'k5', text: 'Contact block complete: email, phone, city', points: 0, done: true, cat: 'contact' },
    { id: 'k6', text: 'One page, 540 words, no tables or text boxes', points: 0, done: true, cat: 'length' },
  ],
  parsedResume: {
    name: 'Ananya Sharma', email: 'ananya.sharma@sahyadri.edu.in', phone: '98450 12345',
    college: 'Sahyadri Institute of Technology, Pune', degree: 'B.Tech, Computer Science & Engineering',
    years: '2024 – 2028', cgpa: '8.4',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git', 'Python', 'SQL'],
    hints: [
      { field: 'phone', text: 'No country code. Add +91 so international recruiters can reach you.' },
      { field: 'years', text: 'End year inferred from “2nd year”. Confirm 2028.' },
      { field: 'skills', text: '“MySQL basics” was mapped to SQL (basic). Check the level.' },
    ],
  },
  resumeText: [
    { id: 'summary', title: 'Summary', lines: ['Second-year CSE student who builds React interfaces and small Python tools. Looking for a frontend internship.'] },
    { id: 'projects', title: 'Projects', lines: ['Built a weather dashboard in React.', 'Made a to-do app with React.', 'Analysed cricket match data in Python.'] },
    { id: 'experience', title: 'Experience', lines: ['Helped with the college fest website.', 'Designed posters and pages for the coding club.'] },
    { id: 'skills', title: 'Skills', lines: ['React, JavaScript, HTML, CSS, Git, Python, SQL (basic)'] },
  ],

  calendar: [
    { id: 'c1', date: '2025-10-03', title: 'Monarch Ed application', type: 'deadline', company: 'Monarch Ed' },
    { id: 'c2', date: '2025-10-08', time: '15:00', title: 'Verdant · Round 1', type: 'interview', company: 'Verdant' },
    { id: 'c3', date: '2025-10-14', time: '11:30', title: 'Corvid Security · Round 1', type: 'interview', company: 'Corvid Security' },
    { id: 'c4', date: '2025-10-20', title: 'Follow up: Gridline', type: 'followup', company: 'Gridline', note: 'Sent' },
    { id: 'c5', date: '2025-10-22', time: '11:30', title: 'Finlytics invite received', type: 'other', company: 'Finlytics' },
    { id: 'c6', date: '2025-10-24', time: '10:00', title: 'Follow up: Zentro Labs', type: 'followup', company: 'Zentro Labs', note: '7 days since applying' },
    { id: 'c7', date: '2025-10-24', time: '18:00', title: 'Mock interview practice', type: 'other', note: 'Frontend question set' },
    { id: 'c8', date: '2025-10-25', time: '11:00', title: 'Finlytics · Round 1', type: 'interview', company: 'Finlytics', note: 'Frontend technical, video call' },
    { id: 'c9', date: '2025-10-26', time: '23:59', title: 'PixelWorks closes', type: 'deadline', company: 'PixelWorks' },
    { id: 'c10', date: '2025-10-27', time: '19:00', title: 'TypeScript study block', type: 'other', note: 'Learning plan · 2h' },
    { id: 'c11', date: '2025-10-27', time: '16:00', title: 'Tidepool recruiter screen', type: 'interview', company: 'Tidepool' },
    { id: 'c12', date: '2025-10-28', time: '15:00', title: 'Kestrel Analytics · Case round', type: 'interview', company: 'Kestrel Analytics' },
    { id: 'c13', date: '2025-10-28', title: 'Follow up: Orchid Retail', type: 'followup', company: 'Orchid Retail' },
    { id: 'c14', date: '2025-10-29', title: 'CloudSprint closes', type: 'deadline', company: 'CloudSprint' },
    { id: 'c15', date: '2025-10-29', title: 'Follow up: Halcyon Travel', type: 'followup', company: 'Halcyon Travel' },
    { id: 'c16', date: '2025-10-30', time: '14:00', title: 'Verdant · Round 2', type: 'interview', company: 'Verdant' },
    { id: 'c17', date: '2025-10-31', title: 'Arcadia offer: respond by', type: 'deadline', company: 'Arcadia Systems' },
    { id: 'c18', date: '2025-11-02', title: 'Datanest closes', type: 'deadline', company: 'Datanest' },
    { id: 'c19', date: '2025-11-04', time: '12:00', title: 'Corvid Security · Round 2', type: 'interview', company: 'Corvid Security' },
    { id: 'c20', date: '2025-11-07', title: 'NovaPay closes', type: 'deadline', company: 'NovaPay' },
  ],

  activity: [
    { id: 'e1', date: '2025-10-24', time: '09:44', category: 'MATCH', title: '3 skills added to learning plan', detail: 'TypeScript, Node.js, Testing' },
    { id: 'e2', date: '2025-10-24', time: '09:41', category: 'RESUME', title: 'Resume parsed', detail: 'resume_v5.pdf · 7 skills found' },
    { id: 'e3', date: '2025-10-24', time: '07:30', category: 'MATCH', title: 'New strong match: NovaPay · 82', detail: 'Frontend Engineer Intern, Bengaluru' },
    { id: 'e4', date: '2025-10-24', time: '07:30', category: 'MATCH', title: '9 new jobs indexed', detail: '128 jobs in your index' },
    { id: 'e5', date: '2025-10-23', time: '18:20', category: 'APPLICATION', title: 'Applied to Waypoint', detail: 'Frontend Engineering Intern · match 45' },
    { id: 'e6', date: '2025-10-23', time: '16:05', category: 'MATCH', title: 'Saved PixelWorks', detail: 'React Developer Intern · match 74' },
    { id: 'e7', date: '2025-10-23', time: '12:10', category: 'RESUME', title: 'Resume v5 created · ATS 72', detail: '+4 on v4; Projects metrics added' },
    { id: 'e8', date: '2025-10-23', time: '12:02', category: 'RESUME', title: 'Variant v5-data created · ATS 66', detail: 'Projects trimmed for data roles' },
    { id: 'e9', date: '2025-10-22', time: '11:30', category: 'INTERVIEW', title: 'Finlytics moved to Interview', detail: 'Round 1 booked for Sat, Oct 25, 11:00' },
    { id: 'e10', date: '2025-10-22', time: '10:12', category: 'APPLICATION', title: 'Applied to Juniper Works', detail: 'React Developer Intern · match 50' },
    { id: 'e11', date: '2025-10-21', time: '17:45', category: 'APPLICATION', title: 'Applied to Saffron Health', detail: 'Frontend Intern · match 56' },
    { id: 'e12', date: '2025-10-21', time: '09:00', category: 'DEADLINE', title: 'Deadline added: PixelWorks', detail: 'Closes Sun, Oct 26' },
    { id: 'e13', date: '2025-10-20', time: '19:15', category: 'RESUME', title: 'Resume v4 created · ATS 68', detail: 'Phone and city added to header' },
    { id: 'e14', date: '2025-10-20', time: '10:05', category: 'APPLICATION', title: 'Followed up with Gridline', detail: 'Email sent to Karan Bedi' },
    { id: 'e15', date: '2025-10-17', time: '15:30', category: 'APPLICATION', title: 'Applied to Zentro Labs', detail: 'UI Developer Intern · match 63' },
    { id: 'e16', date: '2025-10-15', time: '14:00', category: 'APPLICATION', title: 'Monarch Ed moved to In review', detail: 'Hiring manager reviewing' },
    { id: 'e17', date: '2025-10-14', time: '11:30', category: 'INTERVIEW', title: 'Corvid Security · Round 1 done', detail: 'Round 2 on Nov 4' },
  ],

  questions: [
    { id: 'q1', role: 'Frontend', difficulty: 'Easy', text: 'What does the dependency array in useEffect control, and what happens if you leave it out?', hint: 'Mention re-runs, stale closures and cleanup.' },
    { id: 'q2', role: 'Frontend', difficulty: 'Medium', text: 'Explain how React decides what to re-render. How would you stop a large list from re-rendering on every keystroke?', hint: 'Reconciliation, keys, memo, state colocation.' },
    { id: 'q3', role: 'Frontend', difficulty: 'Medium', text: 'Implement a debounce function and explain where you would use it in a search box.', hint: 'Closures and timers; talk through edge cases.' },
    { id: 'q4', role: 'Frontend', difficulty: 'Hard', text: 'A page takes 6 seconds to become interactive on mobile. Walk me through how you would find and fix the cause.', hint: 'Measure first: bundle size, long tasks, images, waterfalls.' },
    { id: 'q5', role: 'Frontend', difficulty: 'Easy', text: 'How does CSS specificity work? Why might your style not apply?', hint: 'Inline > id > class > element; order; !important.' },
    { id: 'q6', role: 'Full-stack', difficulty: 'Medium', text: 'Design a REST API for a to-do app with sharing. Which endpoints and status codes would you use?', hint: 'Resources, verbs, 201/204/404, auth.' },
    { id: 'q7', role: 'Full-stack', difficulty: 'Hard', text: 'How would you design a URL shortener that handles 1,000 writes per second?', hint: 'ID generation, storage, caching, redirects.' },
    { id: 'q8', role: 'Data', difficulty: 'Medium', text: 'Write a SQL query to find the second-highest salary in each department.', hint: 'Window functions: DENSE_RANK() OVER (PARTITION BY …).' },
    { id: 'q9', role: 'Data', difficulty: 'Easy', text: 'What is the difference between INNER JOIN and LEFT JOIN? Give an example.', hint: 'Unmatched rows and NULLs.' },
    { id: 'q10', role: 'Behavioural', difficulty: 'Easy', text: 'Tell me about a project you are proud of. What was your part?', hint: 'Use STAR; keep the result measurable.' },
    { id: 'q11', role: 'Behavioural', difficulty: 'Medium', text: 'Describe a time you disagreed with a teammate. How did you resolve it?', hint: 'Show listening and the outcome.' },
  ],
  starNotes: [
    { id: 'st1', title: 'College fest website under deadline', tags: ['Ownership', 'Frontend'],
      s: 'Fest site had to launch in 10 days after the old vendor dropped out.', t: 'I owned the ticketing pages and the schedule view.',
      a: 'Built React pages with a shared grid, cut scope to 3 must-have flows, and tested on 4 phones.', r: '4,200 visitors in 3 days and zero failed ticket submissions.' },
    { id: 'st2', title: 'Hackathon team disagreement', tags: ['Teamwork', 'Conflict'],
      s: '24-hour hackathon; the team split on building a mobile app or a web app.', t: 'Get us to one plan within the first hour.',
      a: 'Listed judging criteria, timeboxed a 20-minute spike for each, and we voted with data.', r: 'Shipped a web app and placed 2nd of 38 teams.' },
    { id: 'st3', title: 'Fixing a slow dashboard', tags: ['Performance', 'Problem solving'],
      s: 'Coding-club dashboard took 5 s to load on campus Wi-Fi.', t: 'Make it usable on slow networks.',
      a: 'Profiled the bundle, lazy-loaded charts, and compressed images.', r: 'Load time fell to 1.8 s and weekly users doubled.' },
  ],
  interview: {
    company: 'Finlytics', role: 'Software Engineer Intern (Frontend)', date: 'Sat, Oct 25', time: '11:00 – 11:45',
    round: 'Round 1 · Technical', mode: 'Video call', interviewer: 'Rohan Mehta, Senior Frontend Engineer', hoursUntil: 25,
    checklist: [
      { id: 'p1', text: 'Read the job post and note 5 keywords', done: true },
      { id: 'p2', text: 'Research Finlytics: product, users, recent launch', done: true },
      { id: 'p3', text: 'Revise React state, effects and closures', done: false },
      { id: 'p4', text: 'Practise one SQL query out loud', done: false },
      { id: 'p5', text: 'Rehearse 2 STAR stories (fest site, slow dashboard)', done: false },
      { id: 'p6', text: 'Test camera, mic and screen share', done: false },
    ],
  },
  learning: [
    { id: 'l1', skill: 'TypeScript', title: 'TypeScript for React developers', resource: 'Official handbook + 6 typed-component exercises', hours: 12, progress: 35 },
    { id: 'l2', skill: 'Node.js', title: 'Build a REST API with Node and Express', resource: 'Project: notes API with auth and tests', hours: 10, progress: 10 },
    { id: 'l3', skill: 'Testing', title: 'Testing React with Jest and Testing Library', resource: 'Write 20 tests for your to-do app', hours: 6, progress: 0 },
    { id: 'l4', skill: 'SQL', title: 'SQL joins and window functions', resource: '30 practice queries, 3 timed sets', hours: 5, progress: 60 },
  ],
  alerts: [
    { id: 'al1', name: 'Frontend · Remote · 60+', rule: 'Role: Frontend · Remote · Min match 60', frequency: 'Daily', on: true, matches: 4 },
    { id: 'al2', name: 'Strong matches', rule: 'Any role · Min match 70', frequency: 'Instant', on: true, matches: 3 },
    { id: 'al3', name: 'Data roles in Bengaluru', rule: 'Role: Data · Bengaluru · Min match 40', frequency: 'Weekly', on: false, matches: 6 },
  ],
  notificationSettings: [
    { id: 'ns1', label: 'New strong matches', desc: 'When a job scores 70 or more', on: true },
    { id: 'ns2', label: 'Deadline reminders', desc: '3 days and 1 day before a saved job closes', on: true },
    { id: 'ns3', label: 'Interview reminders', desc: 'The evening before and 1 hour before', on: true },
    { id: 'ns4', label: 'Follow-up nudges', desc: 'When an application has had no reply for 7 days', on: true },
    { id: 'ns5', label: 'Weekly report', desc: 'Every Monday: pace, pipeline and skill gaps', on: false },
  ],
  profile: {
    strength: 78,
    missing: [
      { label: 'Portfolio or GitHub link', gain: 8 },
      { label: 'One more project with numbers', gain: 6 },
      { label: 'Phone with country code', gain: 4 },
      { label: 'Expected graduation month', gain: 4 },
    ],
  },
  commandHistory: [
    { group: 'Today', items: [
      { text: 'Prep me for tomorrow’s interview', time: '10:02' },
      { text: 'Tailor my resume for NovaPay', time: '09:58' },
      { text: 'Find remote frontend jobs above 60', time: '09:52' },
    ] },
    { group: 'Yesterday', items: [
      { text: 'Draft a follow-up for Gridline', time: '17:40' },
      { text: 'Which skill should I learn next?', time: '11:15' },
    ] },
    { group: 'This week', items: [
      { text: 'Compare CloudSprint and PixelWorks', time: 'Wed' },
      { text: 'Show jobs closing this week', time: 'Tue' },
      { text: 'Summarise my pipeline', time: 'Mon' },
    ] },
  ],
  conversation: [
    { id: 'm1', role: 'user', time: '09:52', text: 'Find remote frontend jobs above 60' },
    { id: 'm2', role: 'ai', time: '09:52', kind: 'jobs', jobFilter: { mode: 'Remote', role: 'Frontend', min: 60 },
      text: 'Here are the strongest remote frontend roles scoring 60 or more. PixelWorks leads at 74 and closes in 2 days, so I would apply there first.',
      sources: ['Match breakdown · 128 jobs', 'Resume v5 · skills', 'Job posts · synced 09:40'] },
    { id: 'm3', role: 'user', time: '09:58', text: 'Tailor my resume for NovaPay' },
    { id: 'm4', role: 'ai', time: '09:58', kind: 'diff',
      text: 'Three edits would lift your ATS score for NovaPay from 72 to 79 without claiming anything new. TypeScript appears 4 times in the post, so it goes where you have actually used it.',
      diff: [
        { section: 'Projects', before: 'Built a weather dashboard in React.', after: 'Built a weather dashboard in React and TypeScript with typed API hooks; cut load time 18% with code-splitting.' },
        { section: 'Projects', before: 'Made a to-do app with React.', after: 'Wrote 24 Jest tests for a React to-do app, catching 3 regressions before release.' },
        { section: 'Skills', before: 'React, JavaScript, HTML, CSS, Git, Python, SQL (basic)', after: 'React, JavaScript (ES2022), HTML5, CSS3, Git, Python, SQL · Learning: TypeScript, Jest' },
      ],
      sources: ['NovaPay job post', 'Resume v5 · Projects', 'Match breakdown · NovaPay 82'] },
    { id: 'm5', role: 'user', time: '10:02', text: 'Prep me for tomorrow’s interview' },
    { id: 'm6', role: 'ai', time: '10:02', kind: 'plan',
      text: 'Finlytics, tomorrow at 11:00: Round 1, frontend technical with Rohan Mehta. Based on the post, expect React state, async JavaScript and one SQL query. Here is a 60-minute plan for tonight:',
      plan: [
        { title: 'React state, effects and closures: 5 flash questions', minutes: 20 },
        { title: 'One SQL query out loud: second-highest salary', minutes: 10 },
        { title: 'Rehearse STAR: college fest website', minutes: 15 },
        { title: 'Prepare 3 questions about their dashboard product', minutes: 15 },
      ],
      sources: ['Finlytics job post', 'Question bank · Frontend', 'Your STAR notes'] },
  ],
  suggestions: ['Which skill should I learn next?', 'Draft a follow-up to Zentro Labs', 'Compare PixelWorks and NovaPay', 'Show jobs closing this week'],
  quickActions: ['Find remote frontend jobs above 60', 'Tailor my resume for NovaPay', 'Prep me for tomorrow’s interview'],
  faq: [
    { q: 'How is a match score calculated?', a: 'Every job is scored out of 100: skills 70, role 15, location 10, experience 5. Each mark links back to a line in your resume or a preference you set, so you can see exactly why a job scored what it did.' },
    { q: 'Where do the jobs come from?', a: 'We sync public job listings several times a day and de-duplicate them. Each job shows when it was posted and when we last checked it.' },
    { q: 'Will it write things on my resume that aren’t true?', a: 'No. Tailoring only rewords what you already have or suggests a “Learning” line. You approve every edit.' },
    { q: 'Is it free for students?', a: 'Yes. The student plan includes scoring, Resume Studio and the application board.' },
    { q: 'Can I delete my data?', a: 'Any time, from Settings. Deleting your account removes your resume, scores and notes within 24 hours.' },
  ],
  source: { name: 'Serper', synced: '2m ago', jobs: 128 },
};

/* =====================================================================
   Hoisted builders used above (pure, deterministic)
   ===================================================================== */
function parseSkills(spec: string): JobSkill[] {
  return spec.split(',').map((s) => {
    const [name, m] = s.split(':');
    return { name: name.trim(), marks: parseInt(m, 10), have: m.trim().endsWith('+') };
  });
}

function whyFor(skills: JobSkill[], m: Marks, city: string, mode: WorkMode): Job['why'] {
  const have = skills.filter((s) => s.have).length;
  return {
    skills: `${have} of ${skills.length} required skills found on your resume.`,
    role: m.role >= 15 ? 'Exact match for a target role you set.' : m.role >= 10 ? 'Close to one of your target roles.' : m.role >= 5 ? 'Adjacent to your targets.' : 'Outside your target roles.',
    location: m.location >= 10 ? 'Fully remote, your first preference.' : m.location >= 7 ? `${mode} in ${city}, a city on your list.` : m.location >= 4 ? `${mode} in ${city}; not on your list.` : `${mode} in ${city}; relocation needed.`,
    experience: m.experience >= 4 ? 'Internship: no prior experience asked.' : m.experience >= 2 ? 'Prefers 0–1 years; projects count.' : 'Asks for 1+ year of work experience.',
  };
}

function aboutFor(role: RoleCat, company: string, title: string): string {
  const body: Record<RoleCat, string> = {
    'Frontend': 'You will build customer-facing screens with the design team, ship React components behind feature flags, and review pull requests with a senior mentor.',
    'Full-stack': 'You will build features end to end, from React views to API endpoints and database queries, pairing with an engineer on each release.',
    'Backend': 'You will build and test services and APIs, write SQL, and learn how the team deploys and monitors production systems.',
    'Data': 'You will clean data, write SQL and Python analyses, and present weekly dashboards to product and operations leads.',
    'QA / DevOps': 'You will automate tests, improve CI pipelines, and help the team release safely several times a week.',
    'Mobile': 'You will build app screens, fix device-specific bugs, and ship to the store with the mobile squad.',
  };
  return `${company} is hiring a ${title}. ${body[role]} The internship runs 6 months with a stipend, weekly demos, and a pre-placement offer review at the end.`;
}

function tipLib(): Record<string, Omit<TailorTip, 'keyword'>> { return {
  'TypeScript': { section: 'Projects', before: 'Built a weather dashboard in React.', after: 'Built a weather dashboard in React and TypeScript with typed API hooks; cut load time 18% with code-splitting.' },
  'Testing': { section: 'Projects', before: 'Made a to-do app with React.', after: 'Wrote 24 Jest tests for a React to-do app, catching 3 regressions before release.' },
  'Node.js': { section: 'Experience', before: 'Helped with the college fest website.', after: 'Built the Node.js ticket endpoint for the college fest site, serving 4,200 visitors over 3 days.' },
  'Figma': { section: 'Experience', before: 'Designed posters and pages for the coding club.', after: 'Turned Figma mockups into 12 responsive React pages for the coding club site.' },
  'Redux': { section: 'Projects', before: 'Made a to-do app with React.', after: 'Managed to-do app state with Redux Toolkit, including optimistic updates and undo.' },
  'Next.js': { section: 'Projects', before: 'Built a weather dashboard in React.', after: 'Rebuilt the weather dashboard with Next.js static generation; mobile performance score 96.' },
  'Pandas': { section: 'Projects', before: 'Analysed cricket match data in Python.', after: 'Cleaned 12k rows of cricket match data with Pandas and charted 6 win factors.' },
  'Statistics': { section: 'Projects', before: 'Analysed cricket match data in Python.', after: 'Tested 3 hypotheses on cricket match data with t-tests; presented findings to the analytics club.' },
}; }
function tailorFor(skills: JobSkill[]): TailorTip[] {
  const TIP_LIB = tipLib();
  const missing = skills.filter((s) => !s.have).sort((a, b) => b.marks - a.marks);
  const tips: TailorTip[] = [];
  const usedBefore = new Set<string>();
  for (const s of missing) {
    const lib = TIP_LIB[s.name];
    if (lib && !usedBefore.has(lib.before)) { tips.push({ ...lib, keyword: s.name }); usedBefore.add(lib.before); }
    if (tips.length === 2) break;
  }
  const learn = missing.slice(0, 2).map((s) => s.name).join(', ');
  tips.push({ section: 'Skills', before: 'React, JavaScript, HTML, CSS, Git, Python, SQL (basic)', after: `React, JavaScript (ES2022), HTML5, CSS3, Git, Python, SQL · Learning: ${learn}`, keyword: missing[0]?.name ?? 'Skills' });
  while (tips.length < 3) tips.unshift({ section: 'Summary', before: 'Looking for a frontend internship.', after: 'Looking for a frontend internship where I can ship accessible, tested React features.', keyword: 'Accessibility' });
  return tips.slice(0, 3);
}

function F(id: string, title: string, company: string, role: RoleCat, city: string, mode: WorkMode, level: string,
  postedHours: number, stipend: string, deadlineDays: number | null, spec: string, r: number, l: number, e: number): Job {
  const skills = parseSkills(spec);
  const marks: Marks = { skills: skills.filter((s) => s.have).reduce((a, s) => a + s.marks, 0), role: r, location: l, experience: e };
  return {
    id, title, company, role, city, mode, level, postedHours, stipend, deadlineDays, skills, marks,
    score: marks.skills + marks.role + marks.location + marks.experience,
    why: whyFor(skills, marks, city, mode), about: aboutFor(role, company, title), tailor: tailorFor(skills),
  };
}

function withGenerated(featured: Job[]): Job[] {
  const T: Record<string, { role: RoleCat; rolePref: number; titles: string[]; spec: string }> = {
    FE2: { role: 'Frontend', rolePref: 15, titles: ['Frontend Developer Intern', 'React Developer Intern', 'UI Engineer Intern', 'Web Developer Intern'], spec: 'React:10+,JavaScript:9+,HTML:7+,CSS:7+,SQL:6+,Git:5+,TypeScript:9,Next.js:8,Tailwind:5,Testing:4' },
    FE: { role: 'Frontend', rolePref: 15, titles: ['Frontend Intern', 'Junior Frontend Developer', 'UI Developer Intern', 'Web Engineering Intern'], spec: 'React:10+,JavaScript:9+,HTML:7+,CSS:7+,Git:5+,TypeScript:9,Testing:6,Redux:6,REST APIs:6,Figma:5' },
    FS: { role: 'Full-stack', rolePref: 12, titles: ['Full-stack Developer Intern', 'Software Engineer Intern', 'MERN Stack Intern', 'Product Engineer Intern'], spec: 'React:8+,JavaScript:8+,SQL:7+,Git:6+,Node.js:9,TypeScript:8,REST APIs:7,Express:6,Testing:6,Docker:5' },
    DATA: { role: 'Data', rolePref: 9, titles: ['Data Analyst Intern', 'Business Analyst Intern', 'Analytics Intern', 'Data Science Intern'], spec: 'Python:9+,SQL:9+,Git:5+,Pandas:8,Statistics:8,Machine learning:7,Excel:6,Tableau:6,Power BI:6,Communication:6' },
    BE: { role: 'Backend', rolePref: 6, titles: ['Backend Developer Intern', 'Java Developer Intern', 'Software Developer Trainee', 'API Engineer Intern'], spec: 'SQL:8+,Git:6+,Java:9,Spring Boot:8,Node.js:7,Docker:7,REST APIs:7,System design:7,AWS:6,Linux:5' },
    QA: { role: 'QA / DevOps', rolePref: 5, titles: ['DevOps Intern', 'QA Engineer Intern', 'Cloud Support Intern', 'SRE Intern'], spec: 'Git:6+,Python:5+,Docker:9,Kubernetes:8,Linux:8,CI/CD:8,AWS:7,Testing:7,Selenium:6,Bash:6' },
    MOB: { role: 'Mobile', rolePref: 3, titles: ['Android Developer Intern', 'Mobile App Intern', 'Flutter Developer Intern', 'iOS Developer Intern'], spec: 'Kotlin:9,Android:9,Java:8,Swift:8,Flutter:7,Dart:7,Firebase:6,UI design:6,Testing:5,CI/CD:5' },
  };
  const bins: [number, number, string[]][] = [
    [60, 10, ['FE2']], [50, 20, ['FE', 'FS']], [40, 29, ['FE', 'FS', 'DATA']], [30, 29, ['FS', 'DATA', 'BE']],
    [20, 18, ['BE', 'QA']], [10, 9, ['MOB', 'QA']], [0, 3, ['MOB']],
  ];
  const companies = ['Arcwell', 'Bytecraft', 'Cobalt Grid', 'Driftwood', 'Elevate HR', 'Fernlabs', 'Granite Pay', 'Hivemind', 'Inkwell', 'Juno Logistics',
    'Krypton Health', 'Lattice', 'Meridian', 'Nimbus Retail', 'Oakridge', 'Prism Analytics', 'Quarry', 'Redwood Cloud', 'Solace', 'Trellis',
    'Umbra Games', 'Vantage', 'Wavelength', 'Xylo', 'Yonder Travel', 'Zephyr', 'Atlas Freight', 'Beacon Learning', 'Cinder', 'Delta Grid',
    'Everfield', 'Fable', 'Glint', 'Harborline', 'Indigo Bank', 'Jetstream', 'Kairo', 'Loomwork', 'Mintleaf', 'Northstar'];
  const locPrefs = [10, 8, 6, 10, 4, 8, 7, 6, 2, 9];
  const expPrefs = [5, 5, 3, 5, 0, 5, 2];
  const pref = ['Bengaluru', 'Hyderabad', 'Bengaluru', 'Pune', 'Bengaluru', 'Pune'];
  const other = ['Gurugram', 'Mumbai', 'Chennai', 'Gurugram', 'Mumbai', 'Noida'];
  const out: Job[] = [];
  let i = 0;
  let todayLeft = 6;
  for (const [lo, n, keys] of bins) {
    for (let k = 0; k < n; k++, i++) {
      const span = lo === 60 ? 5 : 10;
      const score = lo + Math.floor(((k + 0.5) * span) / n);
      let t = T[keys[k % keys.length]];
      let skills = parseSkills(t.spec);
      let have = skills.filter((s) => s.have).reduce((a, s) => a + s.marks, 0);
      if (score - have < 0 || score - have > 30) {
        for (const key of ['FE2', 'FE', 'FS', 'DATA', 'BE', 'QA', 'MOB']) {
          const ss = parseSkills(T[key].spec);
          const hh = ss.filter((s) => s.have).reduce((a, s) => a + s.marks, 0);
          if (score - hh >= 0 && score - hh <= 30) { t = T[key]; skills = ss; have = hh; break; }
        }
      }
      let rest = score - have;
      let location = Math.min(locPrefs[i % locPrefs.length], rest); rest -= location;
      let role = Math.min(t.rolePref, rest); rest -= role;
      let experience = Math.min(expPrefs[i % expPrefs.length], rest); rest -= experience;
      const addR = Math.min(15 - role, rest); role += addR; rest -= addR;
      const addL = Math.min(10 - location, rest); location += addL; rest -= addL;
      const addE = Math.min(5 - experience, rest); experience += addE; rest -= addE;
      const mode: WorkMode = location >= 10 ? 'Remote' : location >= 8 ? 'Hybrid' : location >= 6 ? 'On-site' : location >= 4 ? 'Hybrid' : 'On-site';
      const city = location >= 10 ? 'Remote' : location >= 6 ? pref[i % pref.length] : other[i % other.length];
      const level = experience >= 4 ? 'Intern' : experience >= 2 ? 'Entry · 0–1 yr' : 'Entry · 1–2 yrs';
      const postedHours = score >= 50 ? (8 + (i % 13)) * 24 : (i % 13 === 5 && todayLeft-- > 0) ? 1 + (i % 11) : (1 + (i % 19)) * 24 + (i % 7);
      const marks: Marks = { skills: have, role, location, experience };
      const title = t.titles[i % t.titles.length];
      const company = companies[(i * 7) % companies.length];
      const stipendK = 12 + ((score + i) % 7) * 4 + (t.role === 'Frontend' || t.role === 'Full-stack' ? 6 : 0);
      out.push({
        id: `g-${i}`, title, company, role: t.role, city, mode, level, postedHours,
        stipend: `₹${stipendK},000/mo`, deadlineDays: i % 5 === 0 ? 3 + (i % 20) : null,
        skills, marks, score: have + role + location + experience,
        why: whyFor(skills, marks, city, mode), about: aboutFor(t.role, company, title), tailor: tailorFor(skills),
      });
    }
  }
  return [...featured, ...out];
}

function A(id: string, company: string, role: string, date: string, status: AppStatus, score: number, nextStep: string,
  responseDays: number | null, contactName: string, contactTitle: string): Application {
  const add = (iso: string, d: number) => {
    const t = new Date(iso + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + d);
    return t.toISOString().slice(0, 10);
  };
  const resume = date < '2025-09-01' ? 'resume_v1.pdf' : date < '2025-09-22' ? 'resume_v2.pdf' : date < '2025-10-20' ? 'resume_v3.pdf' : date < '2025-10-23' ? 'resume_v4.pdf' : 'resume_v5.pdf';
  const timeline: TimelineEntry[] = [{ date, label: `Applied with ${resume}` }];
  if (responseDays !== null) {
    const r = add(date, responseDays);
    timeline.push({ date: r, label: 'Resume screened by recruiter' });
    if (status === 'interview' || status === 'offer') timeline.push({ date: add(r, 6), label: 'Interview round 1' });
    if (status === 'offer') timeline.push({ date: add(r, 14), label: 'Offer received' });
    if (status === 'rejected') timeline.push({ date: add(r, 5), label: 'Not moving forward' });
  }
  const slug = company.toLowerCase().replace(/[^a-z]+/g, '');
  return {
    id, company, role, date, status, score, nextStep, responseDays, resume, timeline,
    contact: { name: contactName, title: contactTitle, email: `${contactName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}@${slug}.com` },
    notes: company === 'Finlytics'
      ? 'Panel: Rohan (frontend) and one engineer. Brush up on React state and closures. Last year they asked one SQL question.'
      : company === 'Zentro Labs' ? 'Referred by a senior from the coding club. Mention the fest website.' : '',
  };
}
