import type { Metadata } from "next";
import { RecommendedBlock } from "@/components/recommended";

export const metadata: Metadata = {
  title: "Jobs",
};

export default function JobsPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
      <RecommendedBlock />
      <h2 className="mt-8 text-base font-semibold">All jobs</h2>
      <p className="mt-2 text-[15px] text-muted">
        The full job list with search and filters arrives in the next phase.
      </p>
    </section>
  );
}
