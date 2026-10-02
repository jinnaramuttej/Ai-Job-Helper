"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getStudent,
  getStudentApplications,
  type Student,
  type StudentApplicationRow,
} from "@/lib/api";
import { displayName, normalize } from "@/lib/skills";
import { formatDateShort } from "@/lib/format";
import { TableShell, tdClasses, thClasses, trClasses } from "@/components/table";

export default function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [applications, setApplications] = useState<StudentApplicationRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getStudent(id), getStudentApplications(id)]).then(
      ([loadedStudent, loadedApplications]) => {
        if (cancelled) return;
        setStudent(loadedStudent);
        setApplications(loadedApplications);
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

  if (!student) {
    return (
      <section>
        <Link
          href="/admin/students"
          className="text-sm text-accent underline-offset-2 transition-colors duration-150 hover:underline"
        >
          Back to students
        </Link>
        <p className="mt-4 text-[15px] text-muted">Student not found.</p>
      </section>
    );
  }

  const skills = normalize(student.skills).map(displayName).join(", ");

  return (
    <section>
      <Link
        href="/admin/students"
        className="text-sm text-accent underline-offset-2 transition-colors duration-150 hover:underline"
      >
        Back to students
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {student.name}
      </h1>
      <p className="mt-2 text-[15px] text-muted">{student.email}</p>

      <div className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-6">
        <h2 className="text-base font-semibold">Profile</h2>
        <div className="mt-3 space-y-2 text-[15px] text-ink">
          <p>
            <span className="text-muted">Branch: </span>
            {student.branch}
          </p>
          <p>
            <span className="text-muted">Year: </span>
            {student.year}
          </p>
          <p>
            <span className="text-muted">Preferred location: </span>
            {student.preferredLocation || "Not set"}
          </p>
          <p>
            <span className="text-muted">Skills: </span>
            {skills || "None added"}
          </p>
          <p>
            <span className="text-muted">Preferred roles: </span>
            {student.preferredRoles.length > 0
              ? student.preferredRoles.join(", ")
              : "None selected"}
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-base font-semibold">Applications</h2>
      <div className="mt-4">
        {applications.length === 0 ? (
          <p className="text-[15px] text-muted">No applications yet.</p>
        ) : (
          <TableShell>
            <thead>
              <tr>
                <th scope="col" className={thClasses}>
                  Job
                </th>
                <th scope="col" className={thClasses}>
                  Company
                </th>
                <th scope="col" className={thClasses}>
                  Applied
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map(({ application, job }) => (
                <tr key={application.id} className={trClasses}>
                  <td className={tdClasses}>
                    {job ? (
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="font-medium text-accent underline-offset-2 transition-colors duration-150 hover:underline"
                      >
                        {job.title}
                      </Link>
                    ) : (
                      "Job removed"
                    )}
                  </td>
                  <td className={tdClasses}>{job?.company ?? "—"}</td>
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
