import type { Job } from "./mock";
import { normalize } from "./skills";
import { matchScore, type MatchResult } from "./match";
import type { Profile } from "./mock";

export type SortOption = "best_match" | "newest" | "company_az";

export type SearchParamsState = {
  q: string;
  role: string;
  location: string;
  experience: string;
  sort: SortOption | "";
  page: number;
};

export function parseSearchParams(params: URLSearchParams): SearchParamsState {
  const sortRaw = params.get("sort");
  const sort: SortOption | "" = ["best_match", "newest", "company_az"].includes(sortRaw as string) 
    ? (sortRaw as SortOption) 
    : "";
  
  const pageRaw = parseInt(params.get("page") || "1", 10);
  const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

  return {
    q: params.get("q") || "",
    role: params.get("role") || "",
    location: params.get("location") || "",
    experience: params.get("experience") || "",
    sort,
    page
  };
}

export function serializeSearchParams(state: SearchParamsState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.role) params.set("role", state.role);
  if (state.location) params.set("location", state.location);
  if (state.experience) params.set("experience", state.experience);
  if (state.sort) params.set("sort", state.sort);
  if (state.page > 1) params.set("page", state.page.toString());
  return params;
}

function matchesSearch(job: Job, state: SearchParamsState): boolean {
  if (state.role && !job.role.toLowerCase().includes(state.role.toLowerCase())) return false;
  if (state.location && !job.location.toLowerCase().includes(state.location.toLowerCase())) return false;
  if (state.experience) {
    const exp = parseInt(state.experience, 10);
    if (!isNaN(exp) && job.minExperienceYears > exp) return false;
  }

  if (!state.q) return true;
  const q = state.q.toLowerCase().replace(/[^\w\s]/g, "");
  
  if (
    job.title.toLowerCase().replace(/[^\w\s]/g, "").includes(q) ||
    job.company.toLowerCase().replace(/[^\w\s]/g, "").includes(q)
  ) {
    return true;
  }
  
  const canonicalQuerySkills = normalize(state.q);
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
  state: SearchParamsState,
  perPage: number = 10
): { items: (Job & { match?: MatchResult })[]; total: number; totalPages: number } {
  // 1. Filter
  let filtered = jobs.filter(job => matchesSearch(job, state));
  
  // 2. Compute match scores if profile exists
  let scored = filtered.map(job => ({
    ...job,
    match: profile ? matchScore(profile, job) : undefined,
  }));

  // Default sort handling
  let activeSort = state.sort;
  if (!activeSort) {
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
  const page = state.page;
  const items = scored.slice((page - 1) * perPage, page * perPage);

  return { items, total, totalPages };
}
