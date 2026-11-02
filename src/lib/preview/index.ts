import type {
  UIData,
  AttentionItem,
  PulseEvent,
  NotificationItem,
  SkillStat,
  BacklogItem,
  ResumeVersion,
  AtsTip,
  ParsedResume,
  ResumeSection,
  CalEvent,
  ActivityEvent,
  Question,
  StarNote,
  UpcomingInterview,
  LearningItem,
  JobAlert,
  ChatTurn,
  Job,
  Application,
} from '../view-models';

export const previewJobs: Job[] = [
  {
    id: 'j-brightlane',
    title: 'Frontend Developer Intern',
    company: 'Brightlane Technologies',
    role: 'Frontend',
    city: 'Bengaluru',
    mode: 'Hybrid',
    level: 'Intern',
    postedHours: 4,
    stipend: '₹35,000 / mo',
    deadlineDays: 4,
    skills: [
      { name: 'React', marks: 25, have: true },
      { name: 'JavaScript', marks: 20, have: true },
      { name: 'HTML & CSS', marks: 15, have: true },
      { name: 'TypeScript', marks: 10, have: false },
    ],
    marks: { skills: 60, role: 15, location: 8, experience: 5 },
    score: 88,
    why: {
      skills: 'Matches React, JavaScript, HTML & CSS. TypeScript is missing.',
      role: 'Direct match for your target Frontend Developer role.',
      location: 'Bengaluru is one of your preferred locations.',
      experience: 'Internship role open to 2nd & 3rd year students.',
    },
    about: 'Brightlane builds real-time logistics software for modern fleets. You will work on the driver dispatcher console.',
    tailor: [
      { section: 'Projects', keyword: 'TypeScript', before: 'Built task dashboard in React', after: 'Built task dashboard with TypeScript & React component state' },
      { section: 'Summary', keyword: 'Real-time UI', before: 'Interested in frontend development', after: 'Frontend developer focused on high-performance interactive web dashboards' },
    ],
  },
  {
    id: 'j-pixelworks',
    title: 'Junior React Developer',
    company: 'PixelWorks Interactive',
    role: 'Frontend',
    city: 'Pune',
    mode: 'Remote',
    level: 'Entry (0-1y)',
    postedHours: 18,
    stipend: '₹40,000 / mo',
    deadlineDays: 2,
    skills: [
      { name: 'React', marks: 30, have: true },
      { name: 'Git', marks: 15, have: true },
      { name: 'CSS', marks: 15, have: true },
      { name: 'Tailwind CSS', marks: 10, have: false },
    ],
    marks: { skills: 60, role: 15, location: 10, experience: 0 },
    score: 85,
    why: {
      skills: 'Matches core React & Git workflow.',
      role: 'Strong fit for Frontend track.',
      location: 'Remote friendly and Pune based.',
      experience: 'Welcomes recent graduates and final year interns.',
    },
    about: 'PixelWorks crafts high-end digital agency web experiences for global brands.',
    tailor: [
      { section: 'Skills', keyword: 'Tailwind CSS', before: 'CSS, HTML', after: 'Tailwind CSS, CSS3, Modern Responsive Layouts' },
    ],
  },
  {
    id: 'j-zentro',
    title: 'UI Developer Intern',
    company: 'Zentro Labs',
    role: 'Frontend',
    city: 'Hyderabad',
    mode: 'Hybrid',
    level: 'Intern',
    postedHours: 42,
    stipend: '₹28,000 / mo',
    deadlineDays: 6,
    skills: [
      { name: 'React', marks: 25, have: true },
      { name: 'JavaScript', marks: 20, have: true },
      { name: 'REST APIs', marks: 15, have: false },
      { name: 'SQL', marks: 10, have: true },
    ],
    marks: { skills: 55, role: 14, location: 8, experience: 5 },
    score: 82,
    why: {
      skills: 'Solid JavaScript and React base.',
      role: 'Matches target internship.',
      location: 'Hyderabad location.',
      experience: 'Student friendly.',
    },
    about: 'Zentro builds clinical workflow management applications.',
    tailor: [],
  },
];

export const previewApplications: Application[] = [
  {
    id: 'app-1',
    company: 'Zentro Labs',
    role: 'UI Developer Intern',
    date: '2025-10-17',
    status: 'review',
    score: 82,
    nextStep: 'Awaiting round 1 interview schedule',
    responseDays: 7,
    contact: { name: 'Maya Fernandes', title: 'Talent Lead', email: 'maya@zentro.io' },
    notes: 'Referred by alumni Rahul. Shipped college fest website mentioned in cover note.',
    resume: 'resume_v5.pdf',
    timeline: [
      { date: '2025-10-17', label: 'Application submitted' },
      { date: '2025-10-21', label: 'Profile screened & approved' },
    ],
  },
  {
    id: 'app-2',
    company: 'Brightlane Technologies',
    role: 'Frontend Developer Intern',
    date: '2025-10-22',
    status: 'interview',
    score: 88,
    nextStep: 'Technical round tomorrow at 11:00 AM',
    responseDays: 2,
    contact: { name: 'Vikram Sethi', title: 'Engineering Manager', email: 'vikram@brightlane.com' },
    notes: 'Live coding session focusing on React hooks and component composition.',
    resume: 'resume_v5.pdf',
    timeline: [
      { date: '2025-10-22', label: 'Applied on company portal' },
      { date: '2025-10-23', label: 'Invited to Technical Round' },
    ],
  },
  {
    id: 'app-3',
    company: 'PixelWorks Interactive',
    role: 'Junior React Developer',
    date: '2025-10-20',
    status: 'applied',
    score: 85,
    nextStep: 'Recruiter review in progress',
    responseDays: null,
    contact: { name: 'Hiring Team', title: 'Campus Recruitment', email: 'careers@pixelworks.design' },
    notes: 'Tailored summary section before submitting.',
    resume: 'resume_v5.pdf',
    timeline: [
      { date: '2025-10-20', label: 'Applied' },
    ],
  },
];

export const previewSkills: SkillStat[] = [
  { name: 'React', demand: 61, level: 75, jobs: 78 },
  { name: 'JavaScript', demand: 58, level: 80, jobs: 74 },
  { name: 'TypeScript', demand: 48, level: 30, jobs: 62 },
  { name: 'HTML & CSS', demand: 52, level: 85, jobs: 66 },
  { name: 'Node.js', demand: 44, level: 35, jobs: 56 },
  { name: 'SQL', demand: 40, level: 60, jobs: 51 },
  { name: 'Git', demand: 55, level: 70, jobs: 70 },
  { name: 'Tailwind CSS', demand: 38, level: 45, jobs: 49 },
];

export const previewBacklog: BacklogItem[] = [
  { skill: 'TypeScript', marks: 15, jobs: 62, strongGain: 5, avgGain: 8 },
  { skill: 'Tailwind CSS', marks: 10, jobs: 49, strongGain: 3, avgGain: 5 },
  { skill: 'Node.js', marks: 12, jobs: 56, strongGain: 4, avgGain: 6 },
];

export const previewInterview: UpcomingInterview = {
  company: 'Brightlane Technologies',
  role: 'Frontend Developer Intern',
  date: 'Tomorrow',
  time: '11:00 AM',
  round: 'Technical Interview (Round 1)',
  mode: 'Google Meet',
  interviewer: 'Vikram Sethi, Engineering Lead',
  hoursUntil: 22,
  checklist: [
    { id: 'c1', text: 'Review React useEffect dependency rules and closures', done: true },
    { id: 'c2', text: 'Practise 2 live coding questions on arrays & promises', done: false },
    { id: 'c3', text: 'Prepare 2-minute walkthrough of College Fest project', done: true },
    { id: 'c4', text: 'Draft 3 questions to ask the interviewer', done: false },
  ],
};

export const previewQuestions: Question[] = [
  {
    id: 'q1',
    role: 'Frontend',
    difficulty: 'Medium',
    text: 'How does React’s reconciliation algorithm determine which elements need to be updated?',
    hint: 'Explain keys, virtual DOM diffing, and component identity.',
  },
  {
    id: 'q2',
    role: 'Frontend',
    difficulty: 'Hard',
    text: 'Explain how closures in JavaScript can lead to stale state inside useEffect callbacks.',
    hint: 'Discuss function re-creation, state snapshots, and ref alternatives.',
  },
  {
    id: 'q3',
    role: 'Full-stack',
    difficulty: 'Medium',
    text: 'Design an API endpoint with rate limiting to prevent brute-force login attempts.',
    hint: 'Discuss sliding windows, Redis, client identifiers, and 429 status codes.',
  },
  {
    id: 'q4',
    role: 'Behavioural',
    difficulty: 'Easy',
    text: 'Describe a situation where a technical project did not go as planned and how you resolved it.',
    hint: 'Structure using Situation, Task, Action, Result (STAR).',
  },
];

export const previewStarNotes: StarNote[] = [
  {
    id: 's1',
    title: 'College Fest Website Performance Optimization',
    tags: ['React', 'Performance', 'Teamwork'],
    s: 'The college fest website received sudden traffic spikes from 4,000+ attendees causing slow load times.',
    t: 'Needed to reduce load times under 1.5 seconds without rewriting backend services.',
    a: 'Implemented image lazy loading, code-splitting routes, and edge caching for static assets.',
    r: 'Page load improved from 4.2s to 1.1s, successfully handling 15,000 page views over festival weekend.',
  },
];

export const previewCalendar: CalEvent[] = [
  { id: 'cal-1', date: '2025-10-24', time: '11:00 AM', title: 'Brightlane Tech Interview', type: 'interview', company: 'Brightlane Technologies' },
  { id: 'cal-2', date: '2025-10-26', time: '11:59 PM', title: 'PixelWorks Application Deadline', type: 'deadline', company: 'PixelWorks Interactive' },
  { id: 'cal-3', date: '2025-10-28', time: '02:00 PM', title: 'Follow-up with Zentro Labs', type: 'followup', company: 'Zentro Labs' },
];

export const previewActivity: ActivityEvent[] = [
  { id: 'act-1', date: '2025-10-24', time: '09:15', category: 'MATCH', title: '3 new strong matches found', detail: 'Scored 70+ against your updated resume.' },
  { id: 'act-2', date: '2025-10-23', time: '16:30', category: 'INTERVIEW', title: 'Brightlane Tech Interview Scheduled', detail: 'Round 1 technical discussion scheduled for Oct 24 at 11:00 AM.' },
  { id: 'act-3', date: '2025-10-22', time: '11:20', category: 'APPLICATION', title: 'Applied to Brightlane Technologies', detail: 'Frontend Developer Intern role via applicant tracking system.' },
  { id: 'act-4', date: '2025-10-20', time: '14:05', category: 'RESUME', title: 'Resume v5 parsed and scored', detail: 'ATS score increased to 72 (+8 points).' },
];

export const previewConversation: ChatTurn[] = [
  {
    id: 'c1',
    role: 'user',
    time: '09:30',
    text: 'What are my top frontend matches closing this week?',
  },
  {
    id: 'c2',
    role: 'ai',
    time: '09:30',
    text: 'PixelWorks Interactive leads at 85 match and closes in 2 days. Brightlane Technologies follows at 88 and closes in 4 days.',
  },
];

export const previewNotifications: NotificationItem[] = [
  { id: 'n1', category: 'INTERVIEW', title: 'Brightlane Interview Confirmed', body: 'Tomorrow at 11:00 AM with Vikram Sethi', time: '2h ago', unread: true, target: 'interview' },
  { id: 'n2', category: 'MATCH', title: 'New 88% Match', body: 'Brightlane Technologies matches your React skills', time: '4h ago', unread: true, target: 'jobs' },
];

export const previewUIData: UIData = {
  today: { iso: '2025-10-24', label: 'Friday, October 24', weekday: 'Friday' },
  user: {
    name: 'Ananya Sharma',
    first: 'Ananya',
    initials: 'AS',
    email: 'ananya.sharma@sahyadri.edu.in',
    phone: '98450 12345',
    program: 'B.Tech CSE, 2nd year',
    college: 'Sahyadri Institute of Technology, Pune',
    degree: 'B.Tech, Computer Science & Engineering',
    years: '2024 – 2028',
    cgpa: '8.4',
    city: 'Pune',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git', 'Python', 'SQL'],
    targetRoles: ['Frontend Developer', 'Full-stack Developer', 'Data Analyst'],
    locations: ['Bengaluru', 'Remote', 'Hyderabad', 'Pune'],
    stipendMin: 25000,
  },
  stats: {
    applications: 24,
    weekly: [0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 2, 3],
    weekLabels: ['Aug 4', 'Aug 11', 'Aug 18', 'Aug 25', 'Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29', 'Oct 6', 'Oct 13', 'Oct 20'],
    weeklyGoal: 5,
    thisWeek: 3,
    streak: 4,
    jobsIndexed: 128,
    newToday: 9,
    strong: 3,
    avgMatch: 41,
    avgMatchDelta: 5,
    saved: 3,
    ats: 72,
    atsPrev: 64,
    matchTrend: [29, 31, 33, 34, 33, 35, 36, 41],
    matchTrendLabels: ['Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29', 'Oct 6', 'Oct 13', 'Oct 20'],
    strongSpark: [0, 0, 1, 1, 1, 2, 1, 2, 2, 1, 1, 3],
    savedSpark: [2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 8, 9],
    activeWeek: [false, true, true, true, true, false, false],
  },
  funnel: [
    { label: 'Applied', value: 24 },
    { label: 'Reviewed', value: 18 },
    { label: 'Interview', value: 5 },
    { label: 'Offer', value: 1 },
  ],
  stageDays: [
    { label: 'Screening', value: 3 },
    { label: 'Interview', value: 5 },
  ],
  skills: previewSkills,
  backlog: previewBacklog,
  whatIf: { base: 3, baseAvg: 41, defaultOn: ['TypeScript'] },
  jobs: previewJobs,
  savedIds: ['j-brightlane', 'j-pixelworks'],
  savedNotes: {
    'j-brightlane': 'Applied on Oct 22. Prep for technical round.',
    'j-pixelworks': 'Closes soon. High score match.',
  },
  savedSearches: [
    { id: 's1', name: 'Frontend Remote 60+', filters: { role: 'Frontend', remote: true, min: 60 } },
  ],
  applications: previewApplications,
  attention: [
    {
      id: 'att-1',
      category: 'INTERVIEW',
      time: 'Tomorrow, 11:00 AM',
      title: 'Interview with Brightlane Technologies',
      body: 'Round 1 technical discussion with Vikram Sethi. Focus on React closures & hooks.',
      action: 'Practise questions',
      target: 'interview',
    },
    {
      id: 'att-2',
      category: 'DEADLINE',
      time: 'In 2 days',
      title: 'PixelWorks application closes',
      body: 'Your match score is 85/100. Submit before Oct 26.',
      action: 'View job',
      target: 'jobs',
      jobId: 'j-pixelworks',
    },
  ],
  pulse: [
    { time: '09:15', label: 'Match update', detail: '3 new strong matches found today', category: 'MATCH' },
    { time: '11:30', label: 'Interview', detail: 'Brightlane confirmed tomorrow 11:00 AM', category: 'INTERVIEW' },
  ],
  notifications: [
    { id: 'n1', category: 'INTERVIEW', title: 'Brightlane Interview Confirmed', body: 'Tomorrow at 11:00 AM with Vikram Sethi', time: '2h ago', unread: true, target: 'interview' },
    { id: 'n2', category: 'MATCH', title: 'New 88% Match', body: 'Brightlane Technologies matches your React skills', time: '4h ago', unread: true, target: 'jobs' },
  ],
  heatmap: [
    [1, 2, 0, 3, 1, 0, 0],
    [0, 1, 2, 2, 3, 1, 0],
    [1, 0, 3, 4, 2, 0, 0],
  ],
  resumeVersions: [
    { id: 'v5', label: 'resume_v5.pdf', date: 'Oct 23', score: 72, cats: { keywords: 28, sections: 20, contact: 14, length: 10, impact: 0 }, note: 'Added fest website metrics' },
  ],
  atsTips: [
    { id: 't1', text: 'Add measurable impact metrics to project bullets (e.g. % improvement or user counts)', points: 10, done: false, cat: 'impact' },
    { id: 't2', text: 'Include TypeScript keyword in relevant project descriptions', points: 6, done: false, cat: 'keywords' },
  ],
  parsedResume: {
    name: 'Ananya Sharma',
    email: 'ananya.sharma@sahyadri.edu.in',
    phone: '98450 12345',
    college: 'Sahyadri Institute of Technology, Pune',
    degree: 'B.Tech, Computer Science & Engineering',
    years: '2024 – 2028',
    cgpa: '8.4',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git', 'Python', 'SQL'],
    hints: [{ field: 'years', text: 'Graduation year is 2028 (2nd year)' }],
  },
  resumeText: [
    { id: 's1', title: 'Summary', lines: ['Frontend developer passionate about building high-performance web applications with React.'] },
    { id: 's2', title: 'Technical Skills', lines: ['Languages: JavaScript, Python, SQL, HTML5, CSS3', 'Frameworks & Tools: React, Git, Tailwind CSS'] },
  ],
  calendar: previewCalendar,
  activity: previewActivity,
  questions: previewQuestions,
  starNotes: previewStarNotes,
  interview: previewInterview,
  learning: [
    { id: 'l1', skill: 'TypeScript', title: 'TypeScript for React Developers', resource: 'Official Docs & Exercises', hours: 8, progress: 25 },
    { id: 'l2', skill: 'Tailwind CSS', title: 'Modern UI Design with Tailwind', resource: 'Tailwind Labs', hours: 4, progress: 60 },
  ],
  alerts: [
    { id: 'a1', name: 'Frontend Remote Internships', rule: 'Role: Frontend · Mode: Remote · Score: 60+', frequency: 'Daily', on: true, matches: 8 },
  ],
  notificationSettings: [
    { id: 'ns1', label: 'Interview reminders', desc: 'Alerts 2 hours before scheduled rounds', on: true },
    { id: 'ns2', label: 'Application status changes', desc: 'When employers update your status', on: true },
  ],
  profile: {
    strength: 85,
    missing: [
      { label: 'Add portfolio link', gain: 10 },
      { label: 'Verify phone number', gain: 5 },
    ],
  },
  commandHistory: [
    {
      group: 'Recent searches',
      items: [
        { text: 'Frontend jobs with 70+ match', time: '10m ago' },
        { text: 'Tailor resume for Brightlane', time: '1h ago' },
      ],
    },
  ],
  conversation: previewConversation,
  suggestions: [
    'What should I learn next to unlock more jobs?',
    'Tailor my resume for Brightlane Technologies',
    'Prepare for tomorrow’s technical interview',
    'Draft a follow-up email for Zentro Labs',
  ],
  quickActions: ['Find jobs', 'Tailor resume', 'Practise interview'],
  faq: [
    { q: 'How is match score calculated?', a: 'Match scores evaluate required skills, role alignment, work mode/location, and experience.' },
  ],
  source: { name: 'Direct Employer Index', synced: '2m ago', jobs: 128 },
};

