import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SavedClient } from './saved-client';

export const metadata: Metadata = {
  title: 'Saved Jobs',
};

export default function SavedJobsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Loading saved jobs...</div>}>
      <SavedClient />
    </Suspense>
  );
}
