"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSavedJobs, unsaveJob } from "@/lib/api";
import type { Job } from "@/lib/mock";
import { Briefcase, MapPin, Clock, BookmarkPlus } from "lucide-react";

export function SavedClient() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSavedJobs().then(saved => {
      if (cancelled) return;
      setJobs(saved);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleUnsave = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setJobs(prev => prev.filter(j => j.id !== jobId));
      await unsaveJob(jobId);
    } catch (err) {
      // ignore in prototype, in real app show toast
    }
  };

  if (loading) {
    return <p className="text-[15px] text-muted">Loading saved jobs...</p>;
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-line bg-surface p-12 text-center">
        <BookmarkPlus size={32} className="text-muted/50 mb-4" strokeWidth={1.5} />
        <h3 className="text-[16px] font-medium text-ink">No saved jobs</h3>
        <p className="mt-1 text-[14px] text-muted max-w-sm">
          Jobs you save will appear here. Start exploring jobs to find your next opportunity.
        </p>
        <button
          onClick={() => router.push("/jobs")}
          className="mt-6 rounded-[8px] bg-ink px-4 py-2 text-[14px] font-medium text-surface transition-opacity hover:opacity-90"
        >
          Explore jobs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
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
            <button
              onClick={(e) => handleUnsave(e, job.id)}
              className="text-[13px] font-medium text-accent transition-colors"
            >
              Saved
            </button>
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
      ))}
    </div>
  );
}
