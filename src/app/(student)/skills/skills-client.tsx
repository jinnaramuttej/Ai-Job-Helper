'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getJobs, getProfile, getCurrentUser, getStudentApplications } from '@/lib/api';
import type { Job as BackendJob, Profile, StudentApplicationRow } from '@/lib/api';
import type { UIData, LearningItem } from '@/lib/view-models';
import { toUIJob, toUIApplication, createEmptyUIData } from '@/lib/view-models';
import { matchScore } from '@/lib/match';
import { buildDashboard } from '@/lib/insights';
import { SkillsScreen } from '@/components/screens/Skills';

export function SkillsClient() {
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

    const learning: LearningItem[] = dashboard.skillBacklog.slice(0, 3).map((item, idx) => ({
      id: `lp-${idx}`,
      skill: item.skill,
      title: `${item.skill} Fundamentals & Projects`,
      resource: 'Official documentation and practical exercises',
      hours: 12 + idx * 4,
      progress: idx === 0 ? 40 : 0,
    }));

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
        strong: dashboard.kpis.strong,
        avgMatch: dashboard.kpis.avgMatch,
      },
      jobs: uiJobs,
      applications: studentApps,
      skills: dashboard.skillsVsMarket,
      backlog: dashboard.skillBacklog,
      whatIf: {
        base: dashboard.kpis.strong,
        baseAvg: dashboard.kpis.avgMatch,
        defaultOn: dashboard.skillBacklog.slice(0, 2).map((b) => b.skill),
      },
      learning,
    };
  }, [profile, jobs, apps]);

  return <SkillsScreen data={uiData} state={state} onRetry={loadData} />;
}
