import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OverviewClient } from '../overview/overview-client';

export const metadata: Metadata = {
  title: 'Overview',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Loading overview...</div>}>
      <OverviewClient />
    </Suspense>
  );
}

