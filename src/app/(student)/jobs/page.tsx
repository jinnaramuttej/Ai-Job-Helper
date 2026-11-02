import type { Metadata } from 'next';
import { Suspense } from 'react';
import { JobsClient } from './jobs-client';

export const metadata: Metadata = {
  title: 'Jobs',
};

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Loading jobs...</div>}>
      <JobsClient />
    </Suspense>
  );
}
