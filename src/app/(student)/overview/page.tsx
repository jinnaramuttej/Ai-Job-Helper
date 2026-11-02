import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OverviewClient } from './overview-client';

export const metadata: Metadata = {
  title: 'Overview',
};

export default function OverviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Loading overview...</div>}>
      <OverviewClient />
    </Suspense>
  );
}
