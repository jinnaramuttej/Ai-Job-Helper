import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RecommendedClient } from './recommended-client';

export const metadata: Metadata = {
  title: 'Recommended Matches',
};

export default function RecommendedPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Loading matches...</div>}>
      <RecommendedClient />
    </Suspense>
  );
}
