"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getJob, getProfile, getResume, getSavedJobs, saveJob, unsaveJob, applyToJob, getStudentApplications, type Job } from "@/lib/api";
import { displayName, normalize } from "@/lib/skills";
import { MatchPanel } from "./match-panel";
import { calculateCompleteness } from "@/lib/profile-utils";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [completeness, setCompleteness] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getJob(id),
      getSavedJobs(),
      getStudentApplications("demo-user-id"), // The mock user ID doesn't matter much as api handles current user
      getProfile(),
      getResume()
    ]).then(([loadedJob, saved, apps, profile, resume]) => {
      if (cancelled) return;
      setJob(loadedJob);
      setIsSaved(saved.some(j => j.id === id));
      setHasApplied(apps.some(a => a.job?.id === id));
      setCompleteness(calculateCompleteness(profile, !!resume));
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowConfirm(false);
    };
    if (showConfirm) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showConfirm]);

  const toggleSave = async () => {
    const currentlySaved = isSaved;
    setIsSaved(!currentlySaved);
    try {
      if (currentlySaved) {
        await unsaveJob(id);
      } else {
        await saveJob(id);
      }
    } catch {
      setIsSaved(currentlySaved);
    }
  };

  const handleApplyClick = () => {
    if (completeness < 50) {
      setShowConfirm(true);
    } else {
      submitApplication();
    }
  };

  const submitApplication = async () => {
    setShowConfirm(false);
    setIsApplying(true);
    try {
      await applyToJob(id);
      setHasApplied(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to apply");
    } finally {
      setIsApplying(false);
    }
  };

  if (!loaded) {
    return <p className="text-[15px] text-muted">Loading…</p>;
  }

  if (!job) {
    return (
      <section>
        <Link
          href="/jobs"
          className="text-sm text-accent underline-offset-2 transition-colors duration-150 hover:underline"
        >
          Back to jobs
        </Link>
        <p className="mt-4 text-[15px] text-muted">Job not found.</p>
      </section>
    );
  }

  const requiredSkills = normalize(job.requiredSkills)
    .map(displayName)
    .join(", ");

  return (
    <section>
      <Link
        href="/jobs"
        className="text-sm text-accent underline-offset-2 transition-colors duration-150 hover:underline"
      >
        Back to jobs
      </Link>
      
      <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {job.title}
          </h1>
          <p className="mt-1 text-[15px] text-muted">
            {job.company} · {job.location}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSave}
            className={`text-[14px] font-medium transition-colors ${
              isSaved ? "text-accent" : "text-muted hover:text-ink"
            }`}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
          <button
            disabled={hasApplied || isApplying}
            onClick={handleApplyClick}
            className="h-10 rounded-[8px] bg-ink px-4 text-[14px] font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {hasApplied ? "Applied" : isApplying ? "Applying..." : "Apply now"}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-6">
        <h2 className="text-base font-semibold">About this job</h2>
        <div className="mt-3 space-y-2 text-[15px] text-ink">
          <p>
            <span className="text-muted">Role: </span>
            {job.role}
          </p>
          <p>
            <span className="text-muted">Experience: </span>
            {job.minExperienceYears === 0
              ? "No experience required"
              : `${job.minExperienceYears}+ ${
                  job.minExperienceYears === 1 ? "year" : "years"
                } of experience`}
          </p>
          <p>
            <span className="text-muted">Skills required: </span>
            {requiredSkills || "None listed"}
          </p>
        </div>
        <p className="mt-4 text-[15px] text-ink">{job.summary}</p>
      </div>

      <MatchPanel job={job} />

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080]" onClick={() => setShowConfirm(false)}>
          <div className="w-full max-w-sm rounded-[12px] border border-line bg-surface p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-ink">Incomplete Profile</h3>
            <p className="mt-2 text-[15px] text-muted">
              Your profile is only {completeness}% complete. A complete profile improves your match score and chances.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/resume"
                className="flex h-10 w-full items-center justify-center rounded-[8px] bg-ink text-[14px] font-medium text-surface transition-opacity hover:opacity-90"
              >
                Complete profile
              </Link>
              <button
                onClick={submitApplication}
                className="flex h-10 w-full items-center justify-center rounded-[8px] border border-line bg-surface text-[14px] font-medium text-ink transition-colors hover:bg-line/20"
              >
                Apply anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
