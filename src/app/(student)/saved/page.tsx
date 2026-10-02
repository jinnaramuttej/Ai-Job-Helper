import type { Metadata } from "next";
import { SavedClient } from "./saved-client";

export const metadata: Metadata = {
  title: "Saved Jobs",
};

export default function SavedJobsPage() {
  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Saved Jobs</h1>
        <p className="text-[15px] text-muted">
          Jobs you have saved for later.
        </p>
      </div>
      <SavedClient />
    </section>
  );
}
