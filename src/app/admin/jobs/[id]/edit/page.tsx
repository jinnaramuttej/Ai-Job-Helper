"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getJob, type Job } from "@/lib/api";
import { JobForm } from "../../job-form";

export default function AdminEditJobPage() {
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
          href="/admin/jobs"
          className="text-sm text-accent underline-offset-2 transition-colors duration-150 hover:underline"
        >
          Back to jobs
        </Link>
        <p className="mt-4 text-[15px] text-muted">Job not found.</p>
      </section>
    );
  }

  return (
    <section>
      <Link
        href={`/admin/jobs/${job.id}`}
        className="text-sm text-accent underline-offset-2 transition-colors duration-150 hover:underline"
      >
        Back to job
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit job</h1>
      <JobForm initialJob={job} />
    </section>
  );
}
