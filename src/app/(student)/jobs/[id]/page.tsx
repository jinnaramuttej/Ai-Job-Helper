import type { Metadata } from "next";
import { JobDetail } from "./job-detail";

export const metadata: Metadata = {
  title: "Job",
};

export default function JobDetailPage() {
  return <JobDetail />;
}
