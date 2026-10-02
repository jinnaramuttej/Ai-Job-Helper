/**
 * Data layer — the ONLY module pages are allowed to call.
 *
 * Phase 4: jobs and applications are seeded from "./mock" into
 * localStorage on first read so admin edits are visible across the app.
 * Later phases will swap the insides for real backend calls without
 * changing any page.
 */

import {
  ADMIN_CREDENTIALS,
  DEFAULT_PROFILE,
  MOCK_APPLICATIONS,
  MOCK_JOBS,
  MOCK_PARSED_RESUME,
  MOCK_RESUME_TEXT,
  MOCK_STUDENTS,
  ROLE_OPTIONS,
  YEAR_OPTIONS,
} from "./mock";
import type {
  AdminUser,
  Application,
  Job,
  JobInput,
  ParsedResume,
  Profile,
  Resume,
  Student,
} from "./mock";
import { matchScore, type MatchResult } from "./match";

export type {
  AdminUser,
  Application,
  Job,
  JobInput,
  ParsedResume,
  Profile,
  Resume,
  ResumeFile,
  Student,
} from "./mock";
export type { MatchResult } from "./match";
export { ADMIN_CREDENTIALS, ROLE_OPTIONS, YEAR_OPTIONS };

const PROFILE_KEY = "ai-job-finder:profile";
const RESUME_KEY = "ai-job-finder:resume";
const JOBS_KEY = "ai-job-finder:jobs";
const APPLICATIONS_KEY = "ai-job-finder:applications";
const SAVED_JOBS_KEY = "ai-job-finder:saved-jobs";
const ADMIN_SESSION_KEY = "ai-job-finder:admin-session";

const RESUME_PARSE_DELAY_MS = 600;
const RECOMMENDATIONS_LIMIT = 10;

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Reads a localStorage-backed collection, seeding it from mock data on
 * first access so admin edits persist across the app.
 */
function readCollection<T>(key: string, seed: T[]): T[] {
  const stored = readJson<T[]>(key);
  if (stored) return stored;
  writeJson(key, seed);
  return seed.map((item) => ({ ...item }));
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "item"
  );
}

/* Student session -------------------------------------------------------- */

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * Mock session: a stored (or default) profile counts as logged in.
 * Later this becomes a real auth check against the backend.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      return res.json();
    }
  } catch {}
  const profile = await getProfile();
  return profile ? { id: "demo-user", name: profile.name, email: profile.email } : null;
}

/* Profile ---------------------------------------------------------------- */

export async function getProfile(): Promise<Profile> {
  return readJson<Profile>(PROFILE_KEY) ?? DEFAULT_PROFILE;
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  writeJson(PROFILE_KEY, profile);
  return profile;
}

/* Jobs ------------------------------------------------------------------- */

export async function getJobs(): Promise<Job[]> {
  return readCollection(JOBS_KEY, MOCK_JOBS);
}

export async function getJob(id: string): Promise<Job | null> {
  const jobs = await getJobs();
  return jobs.find((job) => job.id === id) ?? null;
}

export type JobMatch = {
  job: Job;
  match: MatchResult;
};

/** Top jobs for the current student, best score first. */
export async function getRecommendedJobs(
  limit: number = RECOMMENDATIONS_LIMIT,
): Promise<JobMatch[]> {
  const [profile, jobs] = await Promise.all([getProfile(), getJobs()]);
  return jobs
    .map((job) => ({ job, match: matchScore(profile, job) }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, limit);
}

/* Saved Jobs ------------------------------------------------------------- */

export async function getSavedJobs(): Promise<Job[]> {
  const savedIds = readCollection<string>(SAVED_JOBS_KEY, []);
  const jobs = await getJobs();
  return jobs.filter(job => savedIds.includes(job.id));
}

export async function saveJob(jobId: string): Promise<void> {
  const savedIds = readCollection<string>(SAVED_JOBS_KEY, []);
  if (!savedIds.includes(jobId)) {
    writeJson(SAVED_JOBS_KEY, [...savedIds, jobId]);
  }
}

export async function unsaveJob(jobId: string): Promise<void> {
  const savedIds = readCollection<string>(SAVED_JOBS_KEY, []);
  writeJson(SAVED_JOBS_KEY, savedIds.filter(id => id !== jobId));
}

/* Applications (admin reads; the student apply flow arrives next phase) --- */

export async function getApplications(): Promise<Application[]> {
  return readCollection(APPLICATIONS_KEY, MOCK_APPLICATIONS);
}

export async function applyToJob(jobId: string, userId?: string): Promise<Application | null> {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) return null;
  
  const applications = await getApplications();
  const existing = applications.find(a => a.jobId === jobId && a.studentId === user.id);
  if (existing) {
    throw new Error("You have already applied for this job.");
  }
  
  const profile = await getProfile();
  const jobs = await getJobs();
  const job = jobs.find(j => j.id === jobId);
  if (!job) throw new Error("Job not found.");
  
  const matchResult = matchScore(profile, job);
  
  const newApp: Application = {
    id: `app-${Date.now()}`,
    jobId,
    studentId: user.id,
    appliedAt: new Date().toISOString(),
    snapshot: {
      profile,
      matchScore: matchResult.score
    }
  };
  
  writeJson(APPLICATIONS_KEY, [...applications, newApp]);
  return newApp;
}

export type ApplicantRow = {
  application: Application;
  student: Student;
};

/** Applicants for one job, newest first, joined with student info. */
export async function getJobApplicants(jobId: string): Promise<ApplicantRow[]> {
  const [applications, students] = await Promise.all([
    getApplications(),
    getStudents(),
  ]);
  const byId = new Map(students.map((student) => [student.id, student]));
  return applications
    .filter((application) => application.jobId === jobId)
    .map((application) => ({
      application,
      student: byId.get(application.studentId),
    }))
    .filter((row): row is ApplicantRow => Boolean(row.student))
    .sort((a, b) => b.application.appliedAt.localeCompare(a.application.appliedAt));
}

/* Students (admin) ------------------------------------------------------- */

export async function getStudents(): Promise<Student[]> {
  return MOCK_STUDENTS.map((student) => ({
    ...student,
    skills: [...student.skills],
    preferredRoles: [...student.preferredRoles],
  }));
}

export async function getStudent(id: string): Promise<Student | null> {
  const students = await getStudents();
  return students.find((student) => student.id === id) ?? null;
}

export type StudentApplicationRow = {
  application: Application;
  job: Job | null;
};

/** Applications by one student, newest first, joined with job info. */
export async function getStudentApplications(
  studentId: string,
): Promise<StudentApplicationRow[]> {
  const [applications, jobs] = await Promise.all([
    getApplications(),
    getJobs(),
  ]);
  const byId = new Map(jobs.map((job) => [job.id, job]));
  return applications
    .filter((application) => application.studentId === studentId)
    .map((application) => ({
      application,
      job: byId.get(application.jobId) ?? null,
    }))
    .sort((a, b) => b.application.appliedAt.localeCompare(a.application.appliedAt));
}

/* Admin auth ------------------------------------------------------------- */

/**
 * Mock admin login. Checks against mock credentials and stores a small
 * session object locally. Later: real credentials against the backend.
 */
export async function adminLogin(
  email: string,
  password: string,
): Promise<AdminUser | null> {
  const ok =
    email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() &&
    password === ADMIN_CREDENTIALS.password;
  if (!ok) return null;
  const user: AdminUser = { name: "Admin", email: ADMIN_CREDENTIALS.email };
  writeJson(ADMIN_SESSION_KEY, user);
  return user;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  return readJson<AdminUser>(ADMIN_SESSION_KEY);
}

export async function adminLogout(): Promise<void> {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}

/* Admin dashboard -------------------------------------------------------- */

export type AdminCounts = {
  jobs: number;
  students: number;
  applications: number;
};

export async function getAdminCounts(): Promise<AdminCounts> {
  const [jobs, students, applications] = await Promise.all([
    getJobs(),
    getStudents(),
    getApplications(),
  ]);
  return {
    jobs: jobs.length,
    students: students.length,
    applications: applications.length,
  };
}

/* Admin job CRUD --------------------------------------------------------- */

export async function adminCreateJob(input: JobInput): Promise<Job> {
  const jobs = await getJobs();
  const job: Job = {
    ...input,
    requiredSkills: [...input.requiredSkills],
    id: `${slugify(`${input.title}-${input.company}`)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,
  };
  writeJson(JOBS_KEY, [...jobs, job]);
  return job;
}

export async function adminUpdateJob(
  id: string,
  input: JobInput,
): Promise<Job | null> {
  const jobs = await getJobs();
  const index = jobs.findIndex((job) => job.id === id);
  if (index === -1) return null;
  const updated: Job = {
    ...input,
    requiredSkills: [...input.requiredSkills],
    id,
  };
  const next = [...jobs];
  next[index] = updated;
  writeJson(JOBS_KEY, next);
  return updated;
}

/** Deletes a job and its applications. */
export async function adminDeleteJob(id: string): Promise<void> {
  const [jobs, applications] = await Promise.all([
    getJobs(),
    getApplications(),
  ]);
  writeJson(
    JOBS_KEY,
    jobs.filter((job) => job.id !== id),
  );
  writeJson(
    APPLICATIONS_KEY,
    applications.filter((application) => application.jobId !== id),
  );
}

/* Resume ----------------------------------------------------------------- */

export async function getResume(): Promise<Resume | null> {
  return readJson<Resume>(RESUME_KEY);
}

/**
 * Mock "AI" resume parsing. Resolves after 600 ms with a fixed result,
 * and stores the resume (file info, parsed fields, raw text) locally.
 * Later this becomes a real upload + parse call to the backend.
 */
export async function parseResume(fileName: string): Promise<Resume> {
  await new Promise((resolve) => setTimeout(resolve, RESUME_PARSE_DELAY_MS));
  const resume: Resume = {
    file: { fileName, uploadedAt: new Date().toISOString() },
    parsed: { ...MOCK_PARSED_RESUME, skills: [...MOCK_PARSED_RESUME.skills] },
    text: MOCK_RESUME_TEXT,
  };
  writeJson(RESUME_KEY, resume);
  return resume;
}

export async function saveParsedResume(
  parsed: ParsedResume,
): Promise<ParsedResume> {
  const resume = readJson<Resume>(RESUME_KEY);
  if (resume) {
    writeJson(RESUME_KEY, { ...resume, parsed });
  }

  // Update profile skills
  const profile = await getProfile();
  const currentSkills = new Set(profile.skills.map(s => s.toLowerCase()));
  const newSkills = parsed.skills.filter(s => !currentSkills.has(s.toLowerCase()));
  
  if (newSkills.length > 0) {
    await saveProfile({
      ...profile,
      skills: [...profile.skills, ...newSkills]
    });
  }

  return parsed;
}

export async function removeResume(): Promise<void> {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RESUME_KEY);
}
