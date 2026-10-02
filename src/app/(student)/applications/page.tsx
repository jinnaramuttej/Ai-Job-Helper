import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications",
};

export default function ApplicationsPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
      <p className="mt-2 text-[15px] text-muted">
        Your submitted applications will appear here in a later phase.
      </p>
    </section>
  );
}
