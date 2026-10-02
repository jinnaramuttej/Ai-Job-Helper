"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminCounts, type AdminCounts } from "@/lib/api";

const adminSections = [
  {
    href: "/admin/jobs",
    label: "Manage jobs",
    description: "Add, edit, and remove job postings.",
  },
  {
    href: "/admin/students",
    label: "Browse students",
    description: "Search students and see their profiles and applications.",
  },
];

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<AdminCounts | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminCounts().then((loaded) => {
      if (!cancelled) setCounts(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!counts) {
    return <p className="text-[15px] text-muted">Loading…</p>;
  }

  const stats = [
    { label: "Jobs", value: counts.jobs },
    { label: "Students", value: counts.students },
    { label: "Applications", value: counts.applications },
  ];

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
        <ul className="divide-y divide-line">
          {adminSections.map((section) => (
            <li key={section.href}>
              <Link
                href={section.href}
                className="block px-4 py-3 transition-colors duration-150 hover:bg-accent-soft sm:px-6"
              >
                <span className="text-[15px] font-medium text-accent underline-offset-2 hover:underline">
                  {section.label}
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {section.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
