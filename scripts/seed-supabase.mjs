/**
 * Seeds a Supabase project with a demo admin, demo students, and jobs.
 *
 *   node scripts/seed-supabase.mjs
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.
 * Run supabase/migrations/0001_init.sql first.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Minimal .env loader so the script runs without extra dependencies.
try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // .env is optional when the variables are already exported.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function createUser(email, password, name, role, profile = {}) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });

  let userId = data?.user?.id;
  if (error) {
    if (!/already/i.test(error.message)) throw error;
    const { data: list } = await supabase.auth.admin.listUsers();
    userId = list.users.find((user) => user.email === email)?.id;
  }
  if (!userId) throw new Error(`Could not create or find ${email}`);

  // The handle_new_user trigger creates the row; fill in the details.
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    name,
    role,
    branch: profile.branch ?? "",
    year: profile.year ?? "",
    preferred_location: profile.preferredLocation ?? "",
    skills: profile.skills ?? [],
    preferred_roles: profile.preferredRoles ?? [],
  });
  if (profileError) throw profileError;

  return userId;
}

const adminId = await createUser(
  "admin@aijobfinder.com",
  "admin123",
  "Admin",
  "admin",
);
console.log("Admin ready: admin@aijobfinder.com / admin123");

const students = [
  {
    email: "ananya.sharma@college.edu",
    name: "Ananya Sharma",
    branch: "Computer science",
    year: "3rd year",
    preferredLocation: "Bengaluru",
    skills: ["JavaScript", "React", "SQL"],
    preferredRoles: ["Frontend developer"],
  },
  {
    email: "rahul.verma@college.edu",
    name: "Rahul Verma",
    branch: "Computer science",
    year: "4th year",
    preferredLocation: "Hyderabad",
    skills: ["Python", "Django", "PostgreSQL"],
    preferredRoles: ["Backend developer"],
  },
  {
    email: "sara.iqbal@college.edu",
    name: "Sara Iqbal",
    branch: "Information technology",
    year: "2nd year",
    preferredLocation: "Remote",
    skills: ["Figma", "UI design", "HTML", "CSS"],
    preferredRoles: ["UI designer"],
  },
];

const studentIds = [];
for (const student of students) {
  studentIds.push(
    await createUser(student.email, "student123", student.name, "student", student),
  );
}
console.log(`Seeded ${studentIds.length} students (password: student123)`);

const jobs = [
  {
    title: "Frontend developer intern",
    company: "PixelWorks",
    location: "Remote",
    role: "Frontend developer",
    required_skills: ["JavaScript", "React", "HTML", "CSS"],
    min_experience_years: 0,
    summary:
      "Build and polish marketing pages and small product features with the frontend team.",
    created_by: adminId,
  },
  {
    title: "Backend developer intern",
    company: "DataBridge",
    location: "Bengaluru",
    role: "Backend developer",
    required_skills: ["Node.js", "Express", "PostgreSQL", "Git"],
    min_experience_years: 0,
    summary:
      "Help design and ship REST APIs that move data between colleges and recruiters.",
    created_by: adminId,
  },
  {
    title: "Data analyst intern",
    company: "InsightGrid",
    location: "Remote",
    role: "Data analyst",
    required_skills: ["SQL", "Excel", "Python", "Tableau"],
    min_experience_years: 0,
    summary:
      "Turn raw usage data into dashboards and weekly reports for the growth team.",
    created_by: adminId,
  },
  {
    title: "UI designer intern",
    company: "Craftly",
    location: "Remote",
    role: "UI designer",
    required_skills: ["Figma", "UI design", "HTML"],
    min_experience_years: 0,
    summary:
      "Design clean, accessible screens and hand them off with clear specs to developers.",
    created_by: adminId,
  },
];

const { data: insertedJobs, error: jobsError } = await supabase
  .from("jobs")
  .insert(jobs)
  .select("id");
if (jobsError) throw jobsError;
console.log(`Seeded ${insertedJobs.length} jobs`);

const applications = [
  { job_id: insertedJobs[0].id, student_id: studentIds[0] },
  { job_id: insertedJobs[0].id, student_id: studentIds[2] },
  { job_id: insertedJobs[1].id, student_id: studentIds[1] },
  { job_id: insertedJobs[2].id, student_id: studentIds[0] },
  { job_id: insertedJobs[3].id, student_id: studentIds[2] },
];

const { error: applicationsError } = await supabase
  .from("applications")
  .upsert(applications, { onConflict: "student_id,job_id" });
if (applicationsError) throw applicationsError;
console.log(`Seeded ${applications.length} applications`);

console.log("Done.");
