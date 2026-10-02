"use client";

import { useEffect, useState } from "react";
import { getStudentApplications, getCurrentUser } from "@/lib/api";
import type { StudentApplicationRow, CurrentUser } from "@/lib/api";
import Link from "next/link";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplicationRow[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const apps = await getStudentApplications(currentUser.id);
        setApplications(apps);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-[#888]">Loading applications...</div>;
  }

  if (!user) {
    return <div className="p-8">Please log in to view applications.</div>;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Your Applications</h1>
      
      {applications.length === 0 ? (
        <div className="mt-8 rounded-[10px] border border-line bg-surface p-8 text-center text-muted">
          <p>You haven&apos;t applied to any jobs yet.</p>
          <Link href="/jobs" className="mt-4 inline-block font-medium text-ink hover:underline">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {applications.map(({ application, job }) => (
            <div key={application.id} className="rounded-[10px] border border-line bg-surface p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">{job?.title || "Unknown Job"}</h2>
                <p className="text-[14px] text-muted">{job?.company} • {job?.location}</p>
                <p className="mt-2 text-[12px] text-muted">
                  Applied on {new Date(application.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Applied
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
