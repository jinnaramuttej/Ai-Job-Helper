/**
 * Data layer — the ONLY module pages are allowed to call.
 *
 * Phase 5: backed by Supabase (Auth + Postgres + Storage). Reads and
 * writes go through the browser client, so row-level security decides
 * what each user can see. Resume parsing runs server-side in
 * /api/resume/parse because it needs pdf-parse and mammoth.
 *
 * If NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not
 * set, every function transparently falls back to the local demo
 * implementation in ./api-local so the app still runs. Page components
 * are unaffected either way.
 */

import * as local from "./api-local";
import { ADMIN_CREDENTIALS, ROLE_OPTIONS, YEAR_OPTIONS } from "./mock";
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
import { getAccessToken, getSupabaseClient } from "./supabase/client";
import { isSupabaseConfigured, RESUME_BUCKET } from "./supabase/config";
import type {
  ApplicationRow,
  JobRow,
  ParsedResumeRow,
  ProfileRow,
  ResumeRow,
} from "./supabase/types";

/* Public surface (unchanged for pages) ----------------------------------- */

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

export type CurrentUser = { id: string; name: string; email: string };
export type JobMatch = { job: Job; match: MatchResult };
export type ApplicantRow = { application: Application; student: Student };
export type StudentApplicationRow = { application: Application; job: Job | null };
export type AdminCounts = {
  jobs: number;
  students: number;
  applications: number;
};

const RECOMMENDATIONS_LIMIT = 10;

const BLANK_PROFILE: Profile = {
  name: "",
  email: "",
  branch: "",
  year: "",
  preferredLocation: "",
  skills: [],
  preferredRoles: [],
};

/* Row mapping ------------------------------------------------------------ */

function toProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    email: row.email,
    branch: row.branch,
    year: row.year,
    preferredLocation: row.preferred_location,
    skills: row.skills ?? [],
    preferredRoles: row.preferred_roles ?? [],
  };
}

function toStudent(row: ProfileRow): Student {
  return { id: row.id, ...toProfile(row) };
}

function toJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    role: row.role,
    requiredSkills: row.required_skills ?? [],
    minExperienceYears: row.min_experience_years,
    summary: row.summary,
  };
}

function toApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    jobId: row.job_id,
    studentId: row.student_id,
    appliedAt: row.applied_at,
  };
}

function jobToRow(input: JobInput) {
  return {
    title: input.title,
    company: input.company,
    location: input.location,
    role: input.role,
    required_skills: input.requiredSkills,
    min_experience_years: input.minExperienceYears,
    summary: input.summary,
  };
}

function toResume(
  resume: ResumeRow,
  parsed: ParsedResumeRow | null | undefined,
): Resume {
  return {
    file: { fileName: resume.file_name, uploadedAt: resume.uploaded_at },
    parsed: {
      name: parsed?.name ?? "",
      degree: parsed?.degree ?? "",
      college: parsed?.college ?? "",
      graduationYear: parsed?.graduation_year ?? "",
      skills: parsed?.skills ?? [],
    },
    text: parsed?.raw_text ?? "",
  };
}

/* Session helpers -------------------------------------------------------- */

async function getSessionUserId(): Promise<string | null> {
  const { data } = await getSupabaseClient().auth.getUser();
  return data.user?.id ?? null;
}

async function getProfileRow(id: string): Promise<ProfileRow | null> {
  const { data } = await getSupabaseClient()
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}

/* Student auth (ready for a student login page) -------------------------- */

export async function studentSignUp(
  email: string,
  password: string,
  name: string,
): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return local.getCurrentUser();
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password,
    options: { data: { name, role: "student" } },
  });
  if (error || !data.user) return null;
  return { id: data.user.id, name, email };
}

export async function studentSignIn(
  email: string,
  password: string,
): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return local.getCurrentUser();
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) return null;
  const profile = await getProfileRow(data.user.id);
  return {
    id: data.user.id,
    name: profile?.name ?? "",
    email: profile?.email ?? data.user.email ?? "",
  };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await getSupabaseClient().auth.signOut();
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return local.getCurrentUser();
  const userId = await getSessionUserId();
  if (!userId) return null;
  const profile = await getProfileRow(userId);
  if (!profile) return null;
  return { id: userId, name: profile.name, email: profile.email };
}

/* Profile ---------------------------------------------------------------- */

export async function getProfile(): Promise<Profile> {
  if (!isSupabaseConfigured()) return local.getProfile();
  const userId = await getSessionUserId();
  if (!userId) return BLANK_PROFILE;
  const row = await getProfileRow(userId);
  return row ? toProfile(row) : BLANK_PROFILE;
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  if (!isSupabaseConfigured()) return local.saveProfile(profile);
  const userId = await getSessionUserId();
  if (!userId) return profile;
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .update({
      name: profile.name,
      branch: profile.branch,
      year: profile.year,
      preferred_location: profile.preferredLocation,
      skills: profile.skills,
      preferred_roles: profile.preferredRoles,
    })
    .eq("id", userId)
    .select()
    .single();
  if (error || !data) return profile;
  return toProfile(data);
}

/* Jobs ------------------------------------------------------------------- */

export async function getJobs(): Promise<Job[]> {
  if (!isSupabaseConfigured()) return local.getJobs();
  const { data, error } = await getSupabaseClient()
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(toJob);
}

export async function getJob(id: string): Promise<Job | null> {
  if (!isSupabaseConfigured()) return local.getJob(id);
  const { data } = await getSupabaseClient()
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? toJob(data) : null;
}

export async function getRecommendedJobs(
  limit: number = RECOMMENDATIONS_LIMIT,
): Promise<JobMatch[]> {
  if (!isSupabaseConfigured()) return local.getRecommendedJobs(limit);
  const [profile, jobs] = await Promise.all([getProfile(), getJobs()]);
  return jobs
    .map((job) => ({ job, match: matchScore(profile, job) }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, limit);
}

/* Saved Jobs ------------------------------------------------------------- */

export async function getSavedJobs(): Promise<Job[]> {
  if (!isSupabaseConfigured()) return local.getSavedJobs();
  // Real implementation for Supabase goes here in future phases.
  return []; 
}

export async function saveJob(jobId: string): Promise<void> {
  if (!isSupabaseConfigured()) return local.saveJob(jobId);
}

export async function unsaveJob(jobId: string): Promise<void> {
  if (!isSupabaseConfigured()) return local.unsaveJob(jobId);
}

/* Applications ----------------------------------------------------------- */

export async function getApplications(): Promise<Application[]> {
  if (!isSupabaseConfigured()) return local.getApplications();
  const { data, error } = await getSupabaseClient()
    .from("applications")
    .select("*")
    .order("applied_at", { ascending: false });
  if (error || !data) return [];
  return data.map(toApplication);
}

/** Creates an application for the signed-in student (unique per job). */
export async function applyToJob(jobId: string): Promise<Application | null> {
  if (!isSupabaseConfigured()) return null;
  const userId = await getSessionUserId();
  if (!userId) return null;
  const { data, error } = await getSupabaseClient()
    .from("applications")
    .insert({ job_id: jobId, student_id: userId })
    .select()
    .single();
  if (error || !data) return null;
  return toApplication(data);
}

export async function withdrawApplication(jobId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const userId = await getSessionUserId();
  if (!userId) return;
  await getSupabaseClient()
    .from("applications")
    .delete()
    .eq("job_id", jobId)
    .eq("student_id", userId);
}

export async function getJobApplicants(jobId: string): Promise<ApplicantRow[]> {
  if (!isSupabaseConfigured()) return local.getJobApplicants(jobId);
  const { data, error } = await getSupabaseClient()
    .from("applications")
    .select("*, profiles:student_id (*)")
    .eq("job_id", jobId)
    .order("applied_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as Array<ApplicationRow & { profiles: ProfileRow | null }>)
    .filter((row) => row.profiles !== null)
    .map((row) => ({
      application: toApplication(row),
      student: toStudent(row.profiles as ProfileRow),
    }));
}

export async function getStudentApplications(
  studentId: string,
): Promise<StudentApplicationRow[]> {
  if (!isSupabaseConfigured()) return local.getStudentApplications(studentId);
  const { data, error } = await getSupabaseClient()
    .from("applications")
    .select("*, jobs:job_id (*)")
    .eq("student_id", studentId)
    .order("applied_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as Array<ApplicationRow & { jobs: JobRow | null }>).map(
    (row) => ({
      application: toApplication(row),
      job: row.jobs ? toJob(row.jobs) : null,
    }),
  );
}

/* Students (admin) ------------------------------------------------------- */

export async function getStudents(): Promise<Student[]> {
  if (!isSupabaseConfigured()) return local.getStudents();
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data.map(toStudent);
}

export async function getStudent(id: string): Promise<Student | null> {
  if (!isSupabaseConfigured()) return local.getStudent(id);
  const row = await getProfileRow(id);
  return row ? toStudent(row) : null;
}

/* Admin auth ------------------------------------------------------------- */

export async function adminLogin(
  email: string,
  password: string,
): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) return local.adminLogin(email, password);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.user) return null;

  const profile = await getProfileRow(data.user.id);
  if (!profile || profile.role !== "admin") {
    // Not an admin account — do not leave a session behind.
    await supabase.auth.signOut();
    return null;
  }
  return { name: profile.name || "Admin", email: profile.email };
}

export async function getAdminUser(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) return local.getAdminUser();
  const userId = await getSessionUserId();
  if (!userId) return null;
  const profile = await getProfileRow(userId);
  if (!profile || profile.role !== "admin") return null;
  return { name: profile.name || "Admin", email: profile.email };
}

export async function adminLogout(): Promise<void> {
  if (!isSupabaseConfigured()) return local.adminLogout();
  await getSupabaseClient().auth.signOut();
}

/* Admin dashboard and job CRUD ------------------------------------------- */

export async function getAdminCounts(): Promise<AdminCounts> {
  if (!isSupabaseConfigured()) return local.getAdminCounts();
  const supabase = getSupabaseClient();
  const [jobs, students, applications] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student"),
    supabase.from("applications").select("id", { count: "exact", head: true }),
  ]);
  return {
    jobs: jobs.count ?? 0,
    students: students.count ?? 0,
    applications: applications.count ?? 0,
  };
}

export async function adminCreateJob(input: JobInput): Promise<Job> {
  if (!isSupabaseConfigured()) return local.adminCreateJob(input);
  const userId = await getSessionUserId();
  const { data, error } = await getSupabaseClient()
    .from("jobs")
    .insert({ ...jobToRow(input), created_by: userId })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not add job.");
  return toJob(data);
}

export async function adminUpdateJob(
  id: string,
  input: JobInput,
): Promise<Job | null> {
  if (!isSupabaseConfigured()) return local.adminUpdateJob(id, input);
  const { data, error } = await getSupabaseClient()
    .from("jobs")
    .update(jobToRow(input))
    .eq("id", id)
    .select()
    .single();
  if (error || !data) return null;
  return toJob(data);
}

export async function adminDeleteJob(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return local.adminDeleteJob(id);
  // applications cascade via the foreign key.
  await getSupabaseClient().from("jobs").delete().eq("id", id);
}

/* Resume ----------------------------------------------------------------- */

export async function getResume(): Promise<Resume | null> {
  if (!isSupabaseConfigured()) return local.getResume();
  const userId = await getSessionUserId();
  if (!userId) return null;
  const { data } = await getSupabaseClient()
    .from("resumes")
    .select("*, parsed_resumes (*)")
    .eq("student_id", userId)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as ResumeRow & {
    parsed_resumes: ParsedResumeRow[] | null;
  };
  return toResume(row, row.parsed_resumes?.[0] ?? null);
}

/**
 * Uploads and parses a resume. Pass the File from the upload control; the
 * legacy string form (file name only) is still accepted and resolves
 * through the local demo implementation.
 */
export async function parseResume(file: File | string): Promise<Resume> {
  if (!isSupabaseConfigured() || typeof file === "string") {
    return local.parseResume(typeof file === "string" ? file : file.name);
  }

  const token = await getAccessToken();
  if (!token) throw new Error("Sign in to upload a resume.");

  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/resume/parse", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error ?? "Could not parse the resume.");
  }
  return payload as Resume;
}

export async function saveParsedResume(
  parsed: ParsedResume,
): Promise<ParsedResume> {
  if (!isSupabaseConfigured()) return local.saveParsedResume(parsed);
  const userId = await getSessionUserId();
  if (!userId) return parsed;
  await getSupabaseClient()
    .from("parsed_resumes")
    .update({
      name: parsed.name,
      degree: parsed.degree,
      college: parsed.college,
      graduation_year: parsed.graduationYear,
      skills: parsed.skills,
    })
    .eq("student_id", userId);

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
  if (!isSupabaseConfigured()) return local.removeResume();
  const userId = await getSessionUserId();
  if (!userId) return;
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("resumes")
    .select("storage_path")
    .eq("student_id", userId)
    .maybeSingle();
  if (data?.storage_path) {
    await supabase.storage.from(RESUME_BUCKET).remove([data.storage_path]);
  }
  // parsed_resumes cascades from resumes.
  await supabase.from("resumes").delete().eq("student_id", userId);
}
