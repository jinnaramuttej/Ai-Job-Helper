"use client";

import Link from "next/link";
import { JobForm } from "../job-form";

export default function AdminNewJobPage() {
  return (
    <section>
      <Link
        href="/admin/jobs"
        className="text-sm text-accent underline-offset-2 transition-colors duration-150 hover:underline"
      >
        Back to jobs
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Add job</h1>
      <JobForm />
    </section>
  );
}
