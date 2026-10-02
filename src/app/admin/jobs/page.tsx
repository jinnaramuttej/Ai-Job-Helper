"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminDeleteJob, getJobs, type Job } from "@/lib/api";
import { buttonClassName } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TableShell, tdClasses, thClasses, trClasses } from "@/components/table";

function experienceLabel(minYears: number): string {
  if (minYears === 0) return "None";
  return `${minYears}+ ${minYears === 1 ? "year" : "years"}`;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState("");

  const loadJobs = useCallback(async () => {
    setJobs(await getJobs());
  }, []);

  useEffect(() => {
    let cancelled = false;
    getJobs().then((loaded) => {
      if (!cancelled) setJobs(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    await adminDeleteJob(pendingDelete.id);
    await loadJobs();
    setDeleting(false);
    setPendingDelete(null);
    setNotice(`Deleted "${pendingDelete.title}".`);
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
          <p className="mt-2 text-[15px] text-muted">
            Add, edit, and remove job postings.
          </p>
        </div>
        <Link href="/admin/jobs/new" className={buttonClassName("primary")}>
          Add job
        </Link>
      </div>

      <p aria-live="polite" className="mt-3 text-sm text-muted">
        {notice}
      </p>

      <div className="mt-4">
        {jobs === null ? (
          <p className="text-[15px] text-muted">Loading…</p>
        ) : (
          <TableShell>
            <thead>
              <tr>
                <th scope="col" className={thClasses}>
                  Title
                </th>
                <th scope="col" className={thClasses}>
                  Company
                </th>
                <th scope="col" className={thClasses}>
                  Location
                </th>
                <th scope="col" className={thClasses}>
                  Experience
                </th>
                <th scope="col" className={`${thClasses} text-right`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className={trClasses}>
                  <td className={tdClasses}>
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="font-medium text-accent underline-offset-2 transition-colors duration-150 hover:underline"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className={tdClasses}>{job.company}</td>
                  <td className={tdClasses}>{job.location}</td>
                  <td className={tdClasses}>
                    {experienceLabel(job.minExperienceYears)}
                  </td>
                  <td className={`${tdClasses} text-right whitespace-nowrap`}>
                    <Link
                      href={`/admin/jobs/${job.id}/edit`}
                      className="text-accent underline-offset-2 transition-colors duration-150 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setNotice("");
                        setPendingDelete(job);
                      }}
                      className="ml-4 text-danger underline-offset-2 transition-colors duration-150 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this job?"
        body={
          pendingDelete
            ? `"${pendingDelete.title}" at ${pendingDelete.company} will be removed, along with its applications. This can't be undone.`
            : ""
        }
        confirmLabel="Delete job"
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
