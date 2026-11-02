import type { Metadata } from 'next';
import { getJobs } from '@/lib/api';
import { createEmptyUIData, toUIJob } from '@/lib/view-models';
import { LandingScreen } from '@/components/screens/Landing';

export const metadata: Metadata = {
  title: 'Jaggle · Know why a job fits you, before you apply',
  description: 'Jaggle reads your resume, scores every listing out of 100, and shows its working.',
};

export default async function HomePage() {
  const jobs = await getJobs().catch(() => []);
  const base = createEmptyUIData();
  const defaultSkills = ['React', 'JavaScript', 'TypeScript', 'Node.js'];
  const uiJobs = jobs.map((j) => toUIJob(j, defaultSkills));

  const data = {
    ...base,
    jobs: uiJobs,
    stats: {
      ...base.stats,
      jobsIndexed: jobs.length,
      newToday: Math.min(jobs.length, 3),
    },
  };

  return <LandingScreen data={data} state={jobs.length ? 'ready' : 'empty'} />;
}
