'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getResume, getJobs, getProfile, saveProfile, saveParsedResume } from '@/lib/api';
import type { Resume, Job as BackendJob, Profile } from '@/lib/api';
import type { UIData } from '@/lib/view-models';
import { toUIJob, createEmptyUIData } from '@/lib/view-models';
import { ResumeStudioScreen } from '@/components/screens/ResumeStudio';

export function ResumeClient() {
  const searchParams = useSearchParams();
  const focusJobId = searchParams.get('jobId') || null;

  const [resume, setResume] = useState<Resume | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [state, setState] = useState<'ready' | 'loading' | 'empty' | 'error'>('loading');

  const loadData = useCallback(async () => {
    try {
      const [fetchedResume, fetchedJobs, fetchedProfile] = await Promise.all([
        getResume(),
        getJobs(),
        getProfile(),
      ]);
      setResume(fetchedResume);
      setJobs(fetchedJobs);
      setProfile(fetchedProfile);
      setState(fetchedResume ? 'ready' : 'empty');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getResume(),
      getJobs(),
      getProfile(),
    ])
      .then(([fetchedResume, fetchedJobs, fetchedProfile]) => {
        if (cancelled) return;
        setResume(fetchedResume);
        setJobs(fetchedJobs);
        setProfile(fetchedProfile);
        setState(fetchedResume ? 'ready' : 'empty');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveSkills = async (newSkills: string[]) => {
    try {
      const prof = await getProfile();
      const updatedSkills = Array.from(new Set([...prof.skills, ...newSkills]));
      await saveProfile({
        ...prof,
        skills: updatedSkills,
      });
      await saveParsedResume({
        name: resume?.parsed.name || prof.name || 'Ananya Sharma',
        degree: resume?.parsed.degree || 'B.Tech in Computer Science',
        college: resume?.parsed.college || 'National Institute of Technology, Trichy',
        graduationYear: resume?.parsed.graduationYear || prof.year || '2026',
        skills: updatedSkills,
      });
      setProfile((prev) => (prev ? { ...prev, skills: updatedSkills } : null));
    } catch {
      // non-blocking
    }
  };

  const uiData: UIData = useMemo(() => {
    const base = createEmptyUIData();
    const skillsList = resume?.parsed.skills?.length
      ? resume.parsed.skills
      : profile?.skills?.length
        ? profile.skills
        : ['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'Git', 'Tailwind CSS'];
    const uiJobs = jobs.map((j) => toUIJob(j, skillsList));

    return {
      ...base,
      jobs: uiJobs,
      stats: {
        ...base.stats,
        jobsIndexed: jobs.length,
        ats: 72,
      },
      parsedResume: {
        name: resume?.parsed.name || profile?.name || 'Ananya Sharma',
        email: profile?.email || 'ananya.sharma@example.com',
        phone: '+91 98765 43210',
        cgpa: '8.6',
        college: resume?.parsed.college || 'National Institute of Technology, Trichy',
        degree: resume?.parsed.degree || 'B.Tech Computer Science',
        years: resume?.parsed.graduationYear || profile?.year || '2026',
        skills: skillsList,
        hints: [
          { field: 'phone', text: 'Add country code (+91)' },
          { field: 'years', text: 'Graduation year confirmed' },
          { field: 'skills', text: 'Missing Docker, GraphQL from job listings' },
        ],
      },
    };
  }, [resume, jobs, profile]);

  return (
    <ResumeStudioScreen
      data={uiData}
      state={state}
      focusJobId={focusJobId}
      onRetry={loadData}
      onSaveSkills={handleSaveSkills}
    />
  );
}
