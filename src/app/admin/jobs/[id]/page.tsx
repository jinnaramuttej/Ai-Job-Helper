"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getJob,
  getJobApplicants,
  type ApplicantRow,
  type Job,
} from "@/lib/api";
import { displayName, normalize } from "@/lib/skills";
import { formatDateShort } from "@/lib/format";
import { buttonClassName } from "@/components/button";
import { TableShell, tdClasses, thClasses, trClasses } from "@/components/table";

export default function AdminJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<ApplicantRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getJob(id), getJobApplicants(id)]).then(
      ([loadedJob, loadedApplicants]) => {
        if (cancelled) return;
        setJob(loadedJob);
        setApplicants(loadedApplicants);
        setLoaded(true);
      },
    );
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

  const requiredSkills = normalize(job.requiredSkills)
    .map(displayName)
    .join(", ");

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/jobs"
          className="text-sm text-accent underline-offset-2 transition-colors duration-150 hover:underline"
        >
          Back to jobs
        </Link>
        <Link
          href={`/admin/jobs/${job.id}/edit`}
          className={buttonClassName("secondary")}
        >
          Edit job
        </Link>
      </div>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{job.title}</h1>
      <p className="mt-2 text-[15px] text-muted">
        {job.company} · {job.location}
      </p>

      <div className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-6">
        <h2 className="text-base font-semibold">Job details</h2>
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

      <h2 className="mt-8 text-base font-semibold">Applicants</h2>
      <div className="mt-4">
        {applicants.length === 0 ? (
          <p className="text-[15px] text-muted">No applicants yet.</p>
        ) : (
          <TableShell>
            <thead>
              <tr>
                <th scope="col" className={thClasses}>
                  Name
                </th>
                <th scope="col" className={thClasses}>
                  Email
                </th>
                <th scope="col" className={thClasses}>
                  Branch
                </th>
                <th scope="col" className={thClasses}>
                  Year
                </th>
                <th scope="col" className={thClasses}>
                  Applied
                </th>
              </tr>
            </thead>
            <tbody>
              {applicants.map(({ application, student }) => (
                <tr key={application.id} className={trClasses}>
                  <td className={tdClasses}>
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="font-medium text-accent underline-offset-2 transition-colors duration-150 hover:underline"
                    >
                      {student.name}
                    </Link>
                  </td>
                  <td className={tdClasses}>{student.email}</td>
                  <td className={tdClasses}>{student.branch}</td>
                  <td className={tdClasses}>{student.year}</td>
                  <td className={`${tdClasses} whitespace-nowrap`}>
                    {formatDateShort(application.appliedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </div>
    </section>
  );
}
