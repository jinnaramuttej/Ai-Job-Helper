import type { Metadata } from "next";
import { ResumeManager } from "./resume-manager";

export const metadata: Metadata = {
  title: "Resume",
};

export default function ResumePage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
      <p className="mt-2 text-[15px] text-muted">
        Upload your resume to see how it scores with ATS checkers.
      </p>
      <ResumeManager />
    </section>
  );
}
