'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProfile, getSavedJobs, unsaveJob, saveJob } from '@/lib/api';
import type { Job as BackendJob, Profile } from '@/lib/api';
import type { UIData } from '@/lib/view-models';
import { toUIJob, toUIUser, createEmptyUIData } from '@/lib/view-models';
import { SavedScreen } from '@/components/screens/Saved';

export function SavedClient() {
  const [savedJobs, setSavedJobs] = useState<BackendJob[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [state, setState] = useState<'ready' | 'loading' | 'empty' | 'error'>('loading');

  const loadData = useCallback(async () => {
    try {
      const [fetchedSaved, fetchedProfile] = await Promise.all([
        getSavedJobs(),
        getProfile(),
      ]);
      setSavedJobs(fetchedSaved);
      setProfile(fetchedProfile);
      setSavedIds(new Set(fetchedSaved.map((j) => j.id)));
      setState(fetchedSaved.length === 0 ? 'empty' : 'ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getSavedJobs(),
      getProfile(),
    ])
      .then(([fetchedSaved, fetchedProfile]) => {
        if (cancelled) return;
        setSavedJobs(fetchedSaved);
        setProfile(fetchedProfile);
        setSavedIds(new Set(fetchedSaved.map((j) => j.id)));
        setState(fetchedSaved.length === 0 ? 'empty' : 'ready');
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
    const profileSkills = profile?.skills || [];
    const uiJobs = savedJobs.map((j) => toUIJob(j, profileSkills));
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
  }, [savedJobs, profile]);

  return (
    <SavedScreen
      data={uiData}
      state={state}
      savedIds={savedIds}
      onToggleSave={handleToggleSave}
      onRetry={loadData}
    />
  );
}
