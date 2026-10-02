"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getJob, type Job } from "@/lib/api";
import { displayName, normalize } from "@/lib/skills";
import { MatchPanel } from "./match-panel";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getJob(id).then((loadedJob) => {
      if (cancelled) return;
      setJob(loadedJob);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

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
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {job.title}
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        {job.company} · {job.location}
      </p>

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
    </section>
  );
}
