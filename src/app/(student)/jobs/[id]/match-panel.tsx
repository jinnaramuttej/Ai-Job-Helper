"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getProfile, type Job, type Profile } from "@/lib/api";
import { matchScore } from "@/lib/match";
import { displayName, normalize } from "@/lib/skills";

function formatSkills(skills: string[]): string {
  return skills.map(displayName).join(", ");
}

export function MatchPanel({ job }: { job: Job }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProfile().then((loadedProfile) => {
      if (cancelled) return;
      setProfile(loadedProfile);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const match = useMemo(
    () => (profile ? matchScore(profile, job) : null),
    [profile, job],
  );

  return (
    <div className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-6">
      <h2 className="text-base font-semibold">How you match</h2>

      {!loaded ? (
        <p className="mt-3 text-[15px] text-muted">Loading…</p>
      ) : !match || normalize(profile?.skills ?? []).length === 0 ? (
        <p className="mt-3 text-[15px] text-muted">
          You have not added any skills yet.{" "}
          <Link
            href="/profile"
            className="text-accent underline-offset-2 transition-colors duration-150 hover:underline"
          >
            Add skills on your profile
          </Link>{" "}
          to see how you match this job.
        </p>
      ) : (
        <>
          <p className="mt-3 text-[15px] font-medium tabular-nums text-ink">
            {match.score}% match
          </p>

          <h3 className="mt-4 text-sm font-medium text-ink">Matched skills</h3>
          <p className="mt-1 text-[15px] text-ink">
            {match.matchedSkills.length > 0
              ? formatSkills(match.matchedSkills)
              : "None yet"}
          </p>

          <h3 className="mt-4 text-sm font-medium text-ink">Missing skills</h3>
          <p className="mt-1 text-[15px] text-ink">
            {match.missingSkills.length > 0
              ? formatSkills(match.missingSkills)
              : "None — you have everything this job asks for"}
          </p>
        </>
      )}
    </div>
  );
}
