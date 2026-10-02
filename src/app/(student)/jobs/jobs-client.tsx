"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getJobs, getProfile, getSavedJobs, saveJob, unsaveJob } from "@/lib/api";
import { searchJobs, parseSearchParams, serializeSearchParams } from "@/lib/search";
import type { Job, Profile } from "@/lib/mock";
import type { MatchResult } from "@/lib/match";
import Link from "next/link";
import { Briefcase, MapPin, Clock, Search, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

type SearchResult = Job & { match?: MatchResult };

export function JobsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = parseSearchParams(searchParams);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Local state for debounced search input
  const [queryInput, setQueryInput] = useState(state.q);

  const updateURL = (updates: Partial<typeof state>, replace = false) => {
    const newState = { ...state, ...updates };
    const newParams = serializeSearchParams(newState);
    startTransition(() => {
      if (replace) {
        router.replace(`/jobs?${newParams.toString()}`);
      } else {
        router.push(`/jobs?${newParams.toString()}`);
      }
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQueryInput(state.q);
  }, [state.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (queryInput !== state.q) {
        updateURL({ q: queryInput, page: 1 }, true);
      }
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput, state.q]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [fetchedJobs, fetchedProfile, fetchedSaved] = await Promise.all([
          getJobs(),
          getProfile(),
          getSavedJobs()
        ]);
        setJobs(fetchedJobs);
        setProfile(fetchedProfile);
        setSavedIds(new Set(fetchedSaved.map(j => j.id)));
      } catch (err) {
        setError("Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleSave = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isSaved = savedIds.has(jobId);
    try {
      if (isSaved) {
        setSavedIds(prev => { const n = new Set(prev); n.delete(jobId); return n; });
        await unsaveJob(jobId);
      } else {
        setSavedIds(prev => { const n = new Set(prev); n.add(jobId); return n; });
        await saveJob(jobId);
      }
    } catch (err) {
      // revert on error
      if (isSaved) {
        setSavedIds(prev => { const n = new Set(prev); n.add(jobId); return n; });
      } else {
        setSavedIds(prev => { const n = new Set(prev); n.delete(jobId); return n; });
      }
    }
  };

  if (error) {
    return (
      <div className="mt-8 rounded-lg border border-line bg-surface p-8 text-center text-red-500">
        <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-accent hover:underline">Retry</button>
      </div>
    );
  }

  const { items, total, totalPages } = searchJobs(jobs, profile, state, 10);
  const isSearching = isPending || loading;

  return (
    <div className="mt-8">
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Search jobs, skills, or companies..."
              className="h-10 w-full rounded-[8px] border border-line bg-surface pl-10 pr-3 text-[14px] text-ink focus:border-accent focus:outline-none"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="h-10 rounded-[8px] border border-line bg-surface px-3 text-[14px] text-ink focus:border-accent focus:outline-none"
              value={state.role}
              onChange={(e) => updateURL({ role: e.target.value, page: 1 })}
            >
              <option value="">All Roles</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="fullstack">Full Stack</option>
              <option value="data">Data</option>
            </select>
            <select
              className="h-10 rounded-[8px] border border-line bg-surface px-3 text-[14px] text-ink focus:border-accent focus:outline-none"
              value={state.location}
              onChange={(e) => updateURL({ location: e.target.value, page: 1 })}
            >
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="bengaluru">Bengaluru</option>
              <option value="delhi">Delhi</option>
              <option value="mumbai">Mumbai</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t border-line pt-4">
          <div className="text-[14px] text-muted">
            {total} {total === 1 ? "job" : "jobs"} found
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-muted">Sort by:</span>
            <select
              className="h-9 rounded-[8px] border border-line bg-surface px-2 py-1 text-[13px] text-ink focus:border-accent focus:outline-none"
              value={state.sort || ""}
              onChange={(e) => updateURL({ sort: e.target.value as any, page: 1 })}
            >
              {profile?.skills.length ? (
                <option value="best_match">Best Match</option>
              ) : null}
              <option value="newest">Newest</option>
              <option value="company_az">Company A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={`space-y-4 transition-opacity ${isSearching ? "opacity-50" : "opacity-100"}`}>
        {items.length === 0 && !loading && (
          <div className="rounded-[10px] border border-line bg-surface p-12 text-center text-muted">
            No jobs found matching your criteria.
          </div>
        )}

        {items.map((job) => {
          const isSaved = savedIds.has(job.id);
          return (
            <div
              key={job.id}
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="cursor-pointer block rounded-[10px] border border-line bg-surface p-5 transition-all duration-150 hover:border-accent hover:shadow-[0_1px_2px_rgba(31,35,40,0.06)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[16px] font-medium text-ink">{job.title}</h3>
                  <div className="mt-1 text-[15px] text-muted">{job.company}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleSave(e, job.id)}
                    className={`text-[13px] font-medium transition-colors ${
                      isSaved ? "text-accent" : "text-muted hover:text-ink"
                    }`}
                  >
                    {isSaved ? "Saved" : "Save"}
                  </button>
                  {job.match && (
                    <div className="flex items-center gap-1 rounded-[6px] bg-accent-soft px-2 py-1">
                      <span className="text-[13px] font-medium text-accent">
                        {job.match.score}% Match
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] text-muted">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} strokeWidth={1.75} className="text-muted" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase size={16} strokeWidth={1.75} className="text-muted" />
                  {job.minExperienceYears === 0 ? "Fresher" : `${job.minExperienceYears}+ years`}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={16} strokeWidth={1.75} className="text-muted" />
                  {job.role}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
          <button
            disabled={state.page <= 1}
            onClick={() => updateURL({ page: state.page - 1 })}
            className="flex h-9 items-center gap-1 rounded-[8px] border border-line bg-surface px-3 text-[14px] font-medium text-ink transition-colors hover:bg-accent-soft/50 disabled:opacity-50 disabled:hover:bg-surface"
          >
            <ChevronLeft size={16} strokeWidth={1.75} className="text-muted" />
            Previous
          </button>
          <div className="text-[14px] text-muted">
            Page {state.page} of {totalPages}
          </div>
          <button
            disabled={state.page >= totalPages}
            onClick={() => updateURL({ page: state.page + 1 })}
            className="flex h-9 items-center gap-1 rounded-[8px] border border-line bg-surface px-3 text-[14px] font-medium text-ink transition-colors hover:bg-accent-soft/50 disabled:opacity-50 disabled:hover:bg-surface"
          >
            Next
            <ChevronRight size={16} strokeWidth={1.75} className="text-muted" />
          </button>
        </div>
      )}
    </div>
  );
}
