import type { Job } from "./mock";
import { normalize } from "./skills";
import { matchScore, type MatchResult } from "./match";
import type { Profile } from "./mock";

export type SortOption = "best_match" | "newest" | "company_az";

function matchesSearch(job: Job, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().replace(/[^\w\s]/g, "");
  
  // Basic text match on title or company
  if (
    job.title.toLowerCase().replace(/[^\w\s]/g, "").includes(q) ||
    job.company.toLowerCase().replace(/[^\w\s]/g, "").includes(q)
  ) {
    return true;
  }
  
  // Alias match: Check if query matches any alias, if so check if job requires that canonical skill
  const canonicalQuerySkills = normalize(query);
  for (const querySkill of canonicalQuerySkills) {
    for (const reqSkill of job.requiredSkills) {
      if (normalize(reqSkill).includes(querySkill)) {
        return true;
      }
    }
  }

  return false;
}

export function searchJobs(
  jobs: Job[],
  profile: Profile | null,
  query: string,
  sortBy: SortOption,
  page: number,
  perPage: number = 10
): { items: (Job & { match?: MatchResult })[]; total: number; totalPages: number } {
  // 1. Filter
  let filtered = jobs.filter(job => matchesSearch(job, query));
  
  // 2. Compute match scores if profile exists
  let scored = filtered.map(job => ({
    ...job,
    match: profile ? matchScore(profile, job) : undefined,
  }));

  // Default sort handling
  let activeSort = sortBy;
  if (!sortBy) {
    activeSort = profile && profile.skills.length > 0 ? "best_match" : "newest";
  }

  // 3. Sort
  scored.sort((a, b) => {
    if (activeSort === "best_match") {
      const scoreA = a.match?.score ?? 0;
      const scoreB = b.match?.score ?? 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return a.id.localeCompare(b.id); // fallback for deterministic
    }
    if (activeSort === "company_az") {
      return a.company.localeCompare(b.company);
    }
    if (activeSort === "newest") {
      // In our mock, ID has no strict time, but we can just use ID fallback
      // Since mock jobs don't have created_at, let's just reverse ID for "newest" or keep stable
      return b.id.localeCompare(a.id);
    }
    return 0;
  });

  // 4. Paginate
  const total = scored.length;
  const totalPages = Math.ceil(total / perPage);
  const items = scored.slice((page - 1) * perPage, page * perPage);

  return { items, total, totalPages };
}
