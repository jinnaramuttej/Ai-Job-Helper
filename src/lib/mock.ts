/**
 * Mock data for the UI-first phase.
 *
 * Must never be imported by pages directly — access goes through
 * "@/lib/api" only. Later phases will replace these values with real
 * backend data.
 */

export type Profile = {
  name: string;
  email: string;
  branch: string;
  year: string;
  preferredLocation: string;
  skills: string[];
  preferredRoles: string[];
};

export type ResumeFile = {
  fileName: string;
  uploadedAt: string; // ISO date string
};

export type ParsedResume = {
  name: string;
  degree: string;
  college: string;
  graduationYear: string;
  skills: string[];
};

export type Resume = {
  file: ResumeFile;
  parsed: ParsedResume;
  /** Raw resume text that the ATS scoring runs on. */
  text: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  /** Role name, comparable with the profile's preferred roles. */
  role: string;
  requiredSkills: string[];
  /** Minimum years of experience expected (0 = open to anyone). */
  minExperienceYears: number;
  summary: string;
};

/** Fields required to create or edit a job. */
export type JobInput = Omit<Job, "id">;

export type Student = {
  id: string;
  name: string;
  email: string;
  branch: string;
  year: string;
  preferredLocation: string;
  skills: string[];
  preferredRoles: string[];
};

export type Application = {
  id: string;
  jobId: string;
  studentId: string;
  appliedAt: string; // ISO date string
};

export type AdminUser = {
  name: string;
  email: string;
};

/** Mock admin credentials — replaced by real auth in a later phase. */
export const ADMIN_CREDENTIALS = {
  email: "admin@aijobfinder.com",
  password: "admin123",
};

export const YEAR_OPTIONS = ["1st year", "2nd year", "3rd year", "4th year"];

export const ROLE_OPTIONS = [
  "Frontend developer",
  "Backend developer",
  "Full-stack developer",
  "Mobile developer",
  "Data analyst",
  "Machine learning intern",
  "UI designer",
  "DevOps intern",
];

export const DEFAULT_PROFILE: Profile = {
  name: "Ananya Sharma",
  email: "ananya.sharma@college.edu",
  branch: "Computer science",
  year: "3rd year",
  preferredLocation: "Bengaluru",
  skills: ["JavaScript", "React", "SQL"],
  preferredRoles: ["Frontend developer"],
};

/**
 * The mock "uploaded" resume, as plain text. Deliberately covers a
 * moderate set of keywords and is missing a Projects section so the ATS
 * feedback has something useful to say.
 */
export const MOCK_RESUME_TEXT = `ANANYA SHARMA
ananya.sharma@college.edu | +91 98765 43210

Education
B.Tech in Computer Science — National Institute of Technology, Trichy
Expected graduation: May 2027 | CGPA: 8.4 / 10

Skills
JavaScript, Python, React, HTML, CSS, SQL, data structures, algorithms

Experience
Web development intern, BrightLabs (May 2025 – Jul 2025)
• Built responsive landing pages with React and Tailwind
• Fixed accessibility issues and wrote unit tests
• Worked with designers in Figma to ship a new pricing page

Coursework
Databases, operating systems, computer networks, software engineering
`;

export const MOCK_PARSED_RESUME: ParsedResume = {
  name: "Ananya Sharma",
  degree: "B.Tech in Computer Science",
  college: "National Institute of Technology, Trichy",
  graduationYear: "2027",
  skills: ["JavaScript", "Python", "React", "HTML", "CSS", "SQL"],
};

export const MOCK_JOBS: Job[] = [
  {
    id: "frontend-developer-intern-pixelworks",
    title: "Frontend developer intern",
    company: "PixelWorks",
    location: "Remote",
    role: "Frontend developer",
    requiredSkills: ["JavaScript", "React", "HTML", "CSS"],
    minExperienceYears: 0,
    summary:
      "Build and polish marketing pages and small product features with the frontend team.",
  },
  {
    id: "backend-developer-intern-databridge",
    title: "Backend developer intern",
    company: "DataBridge",
    location: "Bengaluru",
    role: "Backend developer",
    requiredSkills: ["Node.js", "Express", "PostgreSQL", "Git"],
    minExperienceYears: 0,
    summary:
      "Help design and ship REST APIs that move data between colleges and recruiters.",
  },
  {
    id: "fullstack-developer-novalabs",
    title: "Full-stack developer",
    company: "Nova Labs",
    location: "Bengaluru",
    role: "Full-stack developer",
    requiredSkills: ["JavaScript", "Node.js", "React", "MongoDB", "Docker"],
    minExperienceYears: 1,
    summary:
      "Own features end to end, from the database schema to the UI, on a small product team.",
  },
  {
    id: "data-analyst-intern-insightgrid",
    title: "Data analyst intern",
    company: "InsightGrid",
    location: "Remote",
    role: "Data analyst",
    requiredSkills: ["SQL", "Excel", "Python", "Tableau"],
    minExperienceYears: 0,
    summary:
      "Turn raw usage data into dashboards and weekly reports for the growth team.",
  },
  {
    id: "ml-intern-neuraledge",
    title: "Machine learning intern",
    company: "NeuralEdge",
    location: "Hyderabad",
    role: "Machine learning intern",
    requiredSkills: ["Python", "PyTorch", "pandas", "NumPy"],
    minExperienceYears: 0,
    summary:
      "Train and evaluate models for document understanding with the applied research group.",
  },
  {
    id: "ui-designer-intern-craftly",
    title: "UI designer intern",
    company: "Craftly",
    location: "Remote",
    role: "UI designer",
    requiredSkills: ["Figma", "UI design", "Responsive design"],
    minExperienceYears: 0,
    summary:
      "Design clean, accessible screens and hand them off with clear specs to developers.",
  },
  {
    id: "devops-intern-cloudsprint",
    title: "DevOps intern",
    company: "CloudSprint",
    location: "Remote",
    role: "DevOps intern",
    requiredSkills: ["Linux", "Docker", "Git", "CI/CD", "Bash"],
    minExperienceYears: 0,
    summary:
      "Keep builds green and automate the boring parts of shipping software.",
  },
  {
    id: "mobile-developer-intern-appverse",
    title: "Mobile developer intern",
    company: "AppVerse",
    location: "Mumbai",
    role: "Mobile developer",
    requiredSkills: ["React Native", "JavaScript", "TypeScript"],
    minExperienceYears: 0,
    summary:
      "Ship small screens and fix papercuts in a cross-platform app used by students.",
  },
  {
    id: "backend-developer-finedge",
    title: "Backend developer",
    company: "FinEdge",
    location: "Bengaluru",
    role: "Backend developer",
    requiredSkills: ["Java", "Spring Boot", "MySQL", "AWS"],
    minExperienceYears: 1,
    summary:
      "Work on payment services where correctness and clean logs matter more than speed.",
  },
  {
    id: "data-analyst-clearmetrics",
    title: "Data analyst",
    company: "ClearMetrics",
    location: "Pune",
    role: "Data analyst",
    requiredSkills: ["SQL", "Power BI", "Excel", "Python"],
    minExperienceYears: 1,
    summary:
      "Maintain reporting pipelines and help teams answer questions with data.",
  },
  {
    id: "frontend-developer-webnest",
    title: "Frontend developer",
    company: "WebNest",
    location: "Chennai",
    role: "Frontend developer",
    requiredSkills: ["Vue", "JavaScript", "Tailwind", "Git"],
    minExperienceYears: 1,
    summary:
      "Rebuild legacy pages in Vue with a strong focus on performance budgets.",
  },
  {
    id: "ml-intern-visionai",
    title: "Machine learning intern",
    company: "VisionAI",
    location: "Remote",
    role: "Machine learning intern",
    requiredSkills: ["Python", "TensorFlow", "OpenCV"],
    minExperienceYears: 0,
    summary:
      "Prototype image-classification features and measure them honestly.",
  },
  {
    id: "fullstack-intern-campuskart",
    title: "Full-stack developer intern",
    company: "CampusKart",
    location: "Remote",
    role: "Full-stack developer intern",
    requiredSkills: ["React", "Node.js", "Firebase", "Git"],
    minExperienceYears: 0,
    summary:
      "Work across the stack on a campus marketplace built by recent graduates.",
  },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: "ananya-sharma",
    name: "Ananya Sharma",
    email: "ananya.sharma@college.edu",
    branch: "Computer science",
    year: "3rd year",
    preferredLocation: "Bengaluru",
    skills: ["JavaScript", "React", "SQL"],
    preferredRoles: ["Frontend developer"],
  },
  {
    id: "rahul-verma",
    name: "Rahul Verma",
    email: "rahul.verma@college.edu",
    branch: "Computer science",
    year: "4th year",
    preferredLocation: "Hyderabad",
    skills: ["Python", "Django", "PostgreSQL"],
    preferredRoles: ["Backend developer"],
  },
  {
    id: "sara-iqbal",
    name: "Sara Iqbal",
    email: "sara.iqbal@college.edu",
    branch: "Information technology",
    year: "2nd year",
    preferredLocation: "Remote",
    skills: ["Figma", "UI design", "HTML", "CSS"],
    preferredRoles: ["UI designer"],
  },
  {
    id: "arjun-nair",
    name: "Arjun Nair",
    email: "arjun.nair@college.edu",
    branch: "Electronics",
    year: "3rd year",
    preferredLocation: "Kochi",
    skills: ["Python", "TensorFlow", "OpenCV"],
    preferredRoles: ["Machine learning intern"],
  },
  {
    id: "meera-krishnan",
    name: "Meera Krishnan",
    email: "meera.k@college.edu",
    branch: "Computer science",
    year: "4th year",
    preferredLocation: "Chennai",
    skills: ["SQL", "Power BI", "Excel", "Python"],
    preferredRoles: ["Data analyst"],
  },
  {
    id: "dev-patel",
    name: "Dev Patel",
    email: "dev.patel@college.edu",
    branch: "Computer science",
    year: "2nd year",
    preferredLocation: "Mumbai",
    skills: ["React Native", "JavaScript", "TypeScript"],
    preferredRoles: ["Mobile developer"],
  },
  {
    id: "kavitha-reddy",
    name: "Kavitha Reddy",
    email: "kavitha.reddy@college.edu",
    branch: "Information technology",
    year: "4th year",
    preferredLocation: "Bengaluru",
    skills: ["Java", "Spring Boot", "MySQL", "AWS"],
    preferredRoles: ["Backend developer"],
  },
  {
    id: "ilyas-khan",
    name: "Ilyas Khan",
    email: "ilyas.khan@college.edu",
    branch: "Computer science",
    year: "1st year",
    preferredLocation: "Delhi",
    skills: ["C++", "Data structures", "Algorithms"],
    preferredRoles: ["Backend developer"],
  },
];

export const MOCK_APPLICATIONS: Application[] = [
  { id: "app-1", jobId: "frontend-developer-intern-pixelworks", studentId: "ananya-sharma", appliedAt: "2026-03-02T09:15:00.000Z" },
  { id: "app-2", jobId: "frontend-developer-intern-pixelworks", studentId: "sara-iqbal", appliedAt: "2026-03-03T14:40:00.000Z" },
  { id: "app-3", jobId: "frontend-developer-intern-pixelworks", studentId: "dev-patel", appliedAt: "2026-03-05T11:05:00.000Z" },
  { id: "app-4", jobId: "backend-developer-intern-databridge", studentId: "rahul-verma", appliedAt: "2026-03-01T16:20:00.000Z" },
  { id: "app-5", jobId: "backend-developer-intern-databridge", studentId: "kavitha-reddy", appliedAt: "2026-03-04T10:30:00.000Z" },
  { id: "app-6", jobId: "data-analyst-intern-insightgrid", studentId: "meera-krishnan", appliedAt: "2026-03-02T13:45:00.000Z" },
  { id: "app-7", jobId: "data-analyst-intern-insightgrid", studentId: "ananya-sharma", appliedAt: "2026-03-06T09:10:00.000Z" },
  { id: "app-8", jobId: "ml-intern-neuraledge", studentId: "arjun-nair", appliedAt: "2026-03-03T18:25:00.000Z" },
  { id: "app-9", jobId: "devops-intern-cloudsprint", studentId: "ilyas-khan", appliedAt: "2026-03-07T08:55:00.000Z" },
  { id: "app-10", jobId: "fullstack-developer-novalabs", studentId: "kavitha-reddy", appliedAt: "2026-03-05T15:35:00.000Z" },
  { id: "app-11", jobId: "mobile-developer-intern-appverse", studentId: "dev-patel", appliedAt: "2026-03-04T12:15:00.000Z" },
  { id: "app-12", jobId: "backend-developer-finedge", studentId: "kavitha-reddy", appliedAt: "2026-03-06T17:05:00.000Z" },
  { id: "app-13", jobId: "backend-developer-finedge", studentId: "rahul-verma", appliedAt: "2026-03-08T10:50:00.000Z" },
  { id: "app-14", jobId: "data-analyst-clearmetrics", studentId: "meera-krishnan", appliedAt: "2026-03-05T09:30:00.000Z" },
  { id: "app-15", jobId: "ui-designer-intern-craftly", studentId: "sara-iqbal", appliedAt: "2026-03-06T14:20:00.000Z" },
  { id: "app-16", jobId: "ml-intern-visionai", studentId: "arjun-nair", appliedAt: "2026-03-07T19:40:00.000Z" },
];
