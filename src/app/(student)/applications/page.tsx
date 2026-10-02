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
    <section className="max-w-4xl px-8 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-white mb-8">Your Applications</h1>
      
      {applications.length === 0 ? (
        <div className="rounded-xl border border-[#222] bg-[#0d0d0d] p-8 text-center text-[#888]">
          <p>You haven&apos;t applied to any jobs yet.</p>
          <Link href="/jobs" className="mt-4 inline-block text-white hover:underline">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map(({ application, job }) => (
            <div key={application.id} className="rounded-xl border border-[#222] bg-[#0d0d0d] p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-white">{job?.title || "Unknown Job"}</h2>
                <p className="text-sm text-[#888]">{job?.company} • {job?.location}</p>
                <p className="mt-2 text-xs text-[#555]">
                  Applied on {new Date(application.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
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
