'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getJobs, getProfile, getCurrentUser, getStudentApplications } from '@/lib/api';
import type { Job as BackendJob, Profile, StudentApplicationRow } from '@/lib/api';
import type { UIData } from '@/lib/view-models';
import { toUIJob, toUIApplication, createEmptyUIData } from '@/lib/view-models';
import { matchScore } from '@/lib/match';
import { buildDashboard } from '@/lib/insights';
import { InsightsScreen } from '@/components/screens/Insights';

export function InsightsClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [apps, setApps] = useState<StudentApplicationRow[]>([]);
  const [state, setState] = useState<'ready' | 'loading' | 'empty' | 'error'>('loading');

  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const [p, j, a] = await Promise.all([
        getProfile(),
        getJobs(),
        user ? getStudentApplications(user.id) : Promise.resolve([]),
      ]);
      setProfile(p);
      setJobs(j);
      setApps(a);
      setState(j.length === 0 ? 'empty' : 'ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        return Promise.all([
          getProfile(),
          getJobs(),
          user ? getStudentApplications(user.id) : Promise.resolve([]),
        ]);
      })
      .then(([p, j, a]) => {
        if (cancelled) return;
        setProfile(p);
        setJobs(j);
        setApps(a);
        setState(j.length === 0 ? 'empty' : 'ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const uiData: UIData = useMemo(() => {
    const base = createEmptyUIData();
    const studentApps = apps.map(({ application, job }) => toUIApplication(application, job));
    const userSkills = profile?.skills || [];
    const uiJobs = jobs.map((j) => toUIJob(j, userSkills));
    const matches = profile ? jobs.map((j) => matchScore(profile, j)) : [];
    const dashboard = buildDashboard(studentApps, matches, profile);

    return {
      ...base,
      user: {
        ...base.user,
        name: profile?.name || 'Student',
        skills: userSkills,
      },
      stats: {
        ...base.stats,
        jobsIndexed: jobs.length,
        applications: studentApps.length,
        strong: dashboard.kpis.strong,
        avgMatch: dashboard.kpis.avgMatch,
        matchTrend: [52, 55, 58, 62, 60, 65, 68, dashboard.kpis.avgMatch],
        matchTrendLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
      },
      jobs: uiJobs,
      applications: studentApps,
      skills: dashboard.skillsVsMarket,
      backlog: dashboard.skillBacklog,
    };
  }, [profile, jobs, apps]);

  return <InsightsScreen data={uiData} state={state} onRetry={loadData} />;
}
