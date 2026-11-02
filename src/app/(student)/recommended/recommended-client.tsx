'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getJobs, getProfile, getSavedJobs, saveJob, unsaveJob } from '@/lib/api';
import { matchScore } from '@/lib/match';
import type { Job as BackendJob, Profile } from '@/lib/api';
import type { UIData } from '@/lib/view-models';
import { toJobDetail, toUIUser, createEmptyUIData } from '@/lib/view-models';
import { JobsScreen } from '@/components/screens/Jobs';

export function RecommendedClient() {
  const searchParams = useSearchParams();
  const focusJobId = searchParams.get('job') || searchParams.get('jobId') || null;

  const [backendJobs, setBackendJobs] = useState<BackendJob[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [state, setState] = useState<'ready' | 'loading' | 'empty' | 'error'>('loading');

  const loadData = useCallback(async () => {
    try {
      const [fetchedJobs, fetchedProfile, fetchedSaved] = await Promise.all([
        getJobs(),
        getProfile(),
        getSavedJobs(),
      ]);
      setBackendJobs(fetchedJobs);
      setProfile(fetchedProfile);
      setSavedIds(new Set(fetchedSaved.map((j) => j.id)));
      setState(fetchedJobs.length === 0 ? 'empty' : 'ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getJobs(),
      getProfile(),
      getSavedJobs(),
    ])
      .then(([fetchedJobs, fetchedProfile, fetchedSaved]) => {
        if (cancelled) return;
        setBackendJobs(fetchedJobs);
        setProfile(fetchedProfile);
        setSavedIds(new Set(fetchedSaved.map((j) => j.id)));
        setState(fetchedJobs.length === 0 ? 'empty' : 'ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleSave = async (jobId: string) => {
    const isSaved = savedIds.has(jobId);
    try {
      if (isSaved) {
        setSavedIds((prev) => {
          const n = new Set(prev);
          n.delete(jobId);
          return n;
        });
        await unsaveJob(jobId);
      } else {
        setSavedIds((prev) => {
          const n = new Set(prev);
          n.add(jobId);
          return n;
        });
        await saveJob(jobId);
      }
    } catch {
      // Revert on failure
      if (isSaved) {
        setSavedIds((prev) => new Set(prev).add(jobId));
      } else {
        setSavedIds((prev) => {
          const n = new Set(prev);
          n.delete(jobId);
          return n;
        });
      }
    }
  };

  const uiData: UIData = useMemo(() => {
    const base = createEmptyUIData();
    const uiJobs = backendJobs.map((j) => {
      const match = profile ? matchScore(profile, j) : null;
      return toJobDetail(j, match, profile);
    });
    const uiUser = profile ? toUIUser(profile) : base.user;

    return {
      ...base,
      user: uiUser,
      jobs: uiJobs,
      savedNotes: {},
      stats: {
        ...base.stats,
        jobsIndexed: uiJobs.length,
        strong: uiJobs.filter((j) => j.score >= 70).length,
      },
    };
  }, [backendJobs, profile]);

  return (
    <JobsScreen
      data={uiData}
      state={state}
      mode="matches"
      savedIds={savedIds}
      onToggleSave={handleToggleSave}
      focusJobId={focusJobId}
      onRetry={loadData}
    />
  );
}
