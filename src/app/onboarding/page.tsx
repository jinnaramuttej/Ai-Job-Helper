'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProfile, saveProfile, getJobs } from '@/lib/api';
import type { Job as BackendJob } from '@/lib/api';
import { toUIJob } from '@/lib/view-models';
import type { Job } from '@/lib/view-models';
import { OnboardingScreen } from '@/components/screens/Auth';

function OnboardingContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');

  const [uiJobs, setUiJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getJobs()
      .then((jobs: BackendJob[]) => {
        if (cancelled) return;
        const converted = jobs.map((j) => toUIJob(j, ['React', 'JavaScript', 'TypeScript']));
        setUiJobs(converted);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (answers: {
    college: string;
    degree: string;
    year: string;
    roles: string[];
    skills: string[];
    locations: string[];
    mode: 'remote' | 'hybrid' | 'any';
    stipend: number;
  }) => {
    setLoading(true);
    try {
      const current = await getProfile().catch(() => null);
      await saveProfile({
        name: current?.name || 'Student',
        email: current?.email || '',
        branch: answers.degree || 'Computer Science',
        year: answers.year || '2nd year',
        preferredLocation: answers.locations[0] || 'Remote',
        skills: answers.skills,
        preferredRoles: answers.roles,
      });

      if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') && !nextParam.startsWith('/\\')) {
        router.push(nextParam);
      } else {
        router.push('/jobs');
      }
      router.refresh();
    } catch {
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingScreen
      jobs={uiJobs}
      totalJobs={uiJobs.length || 128}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted">Loading...</div>}>
      <OnboardingContainer />
    </Suspense>
  );
}
