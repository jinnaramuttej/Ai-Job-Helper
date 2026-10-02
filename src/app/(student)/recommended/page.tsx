import type { Metadata } from "next";
import { RecommendedJobsCard } from "@/components/recommended";
import { AiSuggestionCard } from "@/components/ui/AiSuggestionCard";

export const metadata: Metadata = {
  title: "Recommended",
};

export default function RecommendedPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Recommended</h1>
      <p className="mt-2 text-[15px] text-muted">
        Jobs ranked by how well they match your profile.
      </p>
      
      <AiSuggestionCard />
      
      <RecommendedJobsCard />
    </section>
  );
}
