'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, getProfile, getJobs, getStudentApplications, getSavedJobs } from '@/lib/api';
import type { Job as BackendJob, Profile as BackendProfile, StudentApplicationRow, CurrentUser } from '@/lib/api';
import { matchScore } from '@/lib/match';
import { buildDashboard } from '@/lib/insights';
import type { UIData } from '@/lib/view-models';
import { toJobRow, toUIApplication, toUIUser, createEmptyUIData } from '@/lib/view-models';
import { OverviewScreen } from '@/components/screens/Overview';

export function OverviewClient() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<BackendProfile | null>(null);
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [applications, setApplications] = useState<StudentApplicationRow[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [state, setState] = useState<'ready' | 'loading' | 'empty' | 'error'>('loading');

  const loadData = useCallback(async () => {
    try {
      const [u, p, allJobs, saved] = await Promise.all([
        getCurrentUser(),
        getProfile(),
        getJobs(),
        getSavedJobs(),
      ]);

      setUser(u);
      setProfile(p);
      setJobs(allJobs);
      setSavedCount(saved.length);

      let apps: StudentApplicationRow[] = [];
      if (u) {
        apps = await getStudentApplications(u.id);
      }
      setApplications(apps);

      const isNewUser = (!p || !p.skills || p.skills.length === 0) && apps.length === 0;
      setState(isNewUser ? 'empty' : 'ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [u, p, allJobs, saved] = await Promise.all([
          getCurrentUser(),
          getProfile(),
          getJobs(),
          getSavedJobs(),
        ]);
        if (cancelled) return;

        setUser(u);
        setProfile(p);
        setJobs(allJobs);
        setSavedCount(saved.length);

        let apps: StudentApplicationRow[] = [];
        if (u) {
          apps = await getStudentApplications(u.id);
        }
        if (cancelled) return;
        setApplications(apps);

        const isNewUser = (!p || !p.skills || p.skills.length === 0) && apps.length === 0;
        setState(isNewUser ? 'empty' : 'ready');
      } catch {
        if (!cancelled) setState('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const uiData: UIData = useMemo(() => {
    const matches = jobs.map((j) => ({
      job: j,
      match: profile ? matchScore(profile, j) : null,
    }));

    const dashboard = buildDashboard(applications, matches, profile);

    const uiJobs = matches.map(({ job, match }) => toJobRow(job, match));
    const uiApps = applications.map(({ application, job }) => toUIApplication(application, job));

    const base = createEmptyUIData();

    return {
      ...base,
      user: toUIUser(profile, user),
      nextBestAction: dashboard.nextBestAction,
      stats: {
        ...base.stats,
        applications: dashboard.kpis.applications,
        weekly: dashboard.kpis.weekly,
        weekLabels: dashboard.kpis.weekLabels,
        weeklyGoal: dashboard.kpis.weeklyGoal,
        thisWeek: dashboard.kpis.thisWeek,
        streak: dashboard.kpis.streak,
        jobsIndexed: dashboard.kpis.jobsIndexed,
        strong: dashboard.kpis.strong,
        avgMatch: dashboard.kpis.avgMatch,
        saved: savedCount,
        ats: dashboard.kpis.ats,
        atsPrev: dashboard.kpis.atsPrev,
        avgMatchDelta: dashboard.kpis.avgMatchDelta,
        strongSpark: dashboard.kpis.strongSpark,
        matchTrend: dashboard.kpis.matchTrend,
        savedSpark: dashboard.kpis.savedSpark,
        activeWeek: dashboard.kpis.activeWeek,
      },
      backlog: dashboard.skillBacklog,
      skills: dashboard.skillsVsMarket,
      attention: dashboard.attention,
      applications: uiApps,
      jobs: uiJobs,
    };
  }, [applications, jobs, profile, savedCount, user]);

  return (
    <OverviewScreen
      data={uiData}
      state={state}
      savedCount={savedCount}
      onRetry={loadData}
    />
  );
}
