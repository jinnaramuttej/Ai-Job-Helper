/**
 * Job–student matching. Pure functions, no backend needed.
 *
 * matchScore(student, job) -> 0..100, built from:
 *  - 70% required skills overlap, after normalization through the
 *    skills alias table
 *  - 15% preferred role match ("frontend developer" also matches a
 *    "frontend developer intern" posting)
 *  - 10% location match — "Remote" jobs match everyone, and an empty
 *    preference counts as open to anywhere
 *  - 5% experience fit, approximated from the student's year of study
 *
 * Also returns the matched and missing skills (canonical names).
 */

import { normalize } from "./skills";

export const MATCH_WEIGHTS = {
  skills: 70,
  role: 15,
  location: 10,
  experience: 5,
} as const;

export type StudentMatchInput = {
  /** Raw skills (comma-separated text or a list). Normalized internally. */
  skills: string | string[];
  preferredRoles?: string[];
  preferredLocation?: string;
  /** e.g. "3rd year" — used as a proxy for experience. */
  year?: string;
};

export type JobMatchInput = {
  requiredSkills: string | string[];
  role?: string;
  location?: string;
  minExperienceYears?: number;
};

export type MatchResult = {
  /** Total score, 0–100. */
  score: number;
  /** Points per component (unrounded, for transparency/tests). */
  skillsPoints: number;
  rolePoints: number;
  locationPoints: number;
  experiencePoints: number;
  /** Required skills the student has (canonical names). */
  matchedSkills: string[];
  /** Required skills the student lacks (canonical names). */
  missingSkills: string[];
};

function cleanText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** "3rd year" -> 3. Unparseable input -> 0. */
function parseYearNumber(year: string): number {
  const digits = year.match(/\d+/);
  return digits ? Number.parseInt(digits[0], 10) : 0;
}

/** Equal, or one string contains the other (both non-empty). */
function textMatches(a: string, b: string): boolean {
  return a.length > 0 && b.length > 0 && (a === b || a.includes(b) || b.includes(a));
}

export function matchScore(
  student: StudentMatchInput,
  job: JobMatchInput,
): MatchResult {
  const studentSkills = new Set(normalize(student.skills));
  const requiredSkills = normalize(job.requiredSkills);

  const matchedSkills = requiredSkills.filter((skill) => studentSkills.has(skill));
  const missingSkills = requiredSkills.filter((skill) => !studentSkills.has(skill));

  // 70% — required skills overlap. Nothing required means perfect fit.
  const skillsPoints =
    requiredSkills.length === 0
      ? MATCH_WEIGHTS.skills
      : (matchedSkills.length / requiredSkills.length) * MATCH_WEIGHTS.skills;

  // 15% — preferred role match.
  const jobRole = cleanText(job.role ?? "");
  const rolePoints = (student.preferredRoles ?? []).some((role) =>
    textMatches(cleanText(role), jobRole),
  )
    ? MATCH_WEIGHTS.role
    : 0;

  // 10% — location match. Remote matches everyone; empty preference is
  // treated as open to anywhere.
  const studentLocation = cleanText(student.preferredLocation ?? "");
  const jobLocation = cleanText(job.location ?? "");
  const locationPoints =
    jobLocation === "remote" ||
    studentLocation === "" ||
    textMatches(studentLocation, jobLocation)
      ? MATCH_WEIGHTS.location
      : 0;

  // 5% — experience fit, approximated as (year of study - 1).
  const yearNumber = parseYearNumber(student.year ?? "");
  const studentExperience = Math.max(0, yearNumber - 1);
  const experiencePoints =
    studentExperience >= (job.minExperienceYears ?? 0)
      ? MATCH_WEIGHTS.experience
      : 0;

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(skillsPoints + rolePoints + locationPoints + experiencePoints),
    ),
  );

  return {
    score,
    skillsPoints,
    rolePoints,
    locationPoints,
    experiencePoints,
    matchedSkills,
    missingSkills,
  };
}
