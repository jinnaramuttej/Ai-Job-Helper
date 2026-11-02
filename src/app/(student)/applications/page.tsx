import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ApplicationsClient } from './applications-client';

export const metadata: Metadata = {
  title: 'Applications',
};

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Loading applications...</div>}>
      <ApplicationsClient />
    </Suspense>
  );
}
