"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCurrentUser,
  getRecommendedJobs,
  type CurrentUser,
  type JobMatch,
} from "@/lib/api";

type RecommendationsState =
  | { status: "loading" }
  | { status: "ready"; user: CurrentUser | null; items: JobMatch[] };

function useRecommendations(limit: number): RecommendationsState {
  const [state, setState] = useState<RecommendationsState>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await getCurrentUser();
      const items = user ? await getRecommendedJobs(limit) : [];
      if (!cancelled) setState({ status: "ready", user, items });
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return state;
}

function RecommendedRows({ items }: { items: JobMatch[] }) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-3 text-[15px] text-muted sm:px-6">
        No recommendations yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {items.map(({ job, match }) => (
        <li
          key={job.id}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3 sm:px-6"
        >
          <div className="min-w-0">
            <Link
              href={`/jobs/${job.id}`}
              className="text-[15px] font-medium text-accent underline-offset-2 transition-colors duration-150 hover:underline"
            >
              {job.title}
            </Link>
            <p className="mt-0.5 text-sm text-muted">
              {job.company} · {job.location}
            </p>
          </div>
          <p className="shrink-0 text-sm tabular-nums text-ink">
            {match.score}% match
          </p>
        </li>
      ))}
    </ul>
  );
}

/** "Recommended for you" block shown at the top of /jobs. */
export function RecommendedBlock() {
  const state = useRecommendations(10);

  if (state.status === "loading") {
    return <p className="mt-6 text-[15px] text-muted">Loading…</p>;
  }
  if (!state.user) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
      <div className="border-b border-line px-4 py-3 sm:px-6">
        <h2 className="text-base font-semibold">Recommended for you</h2>
      </div>
      <RecommendedRows items={state.items} />
    </div>
  );
}

/** Full recommendations list for the /recommended page. */
export function RecommendedJobsCard() {
  const state = useRecommendations(10);

  if (state.status === "loading") {
    return <p className="mt-6 text-[15px] text-muted">Loading…</p>;
  }
  if (!state.user) {
    return (
      <p className="mt-6 text-[15px] text-muted">
        Log in to see jobs matched to your profile.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
      <RecommendedRows items={state.items} />
    </div>
  );
}
