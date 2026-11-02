import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResumeClient } from './resume-client';

export const metadata: Metadata = {
  title: 'Resume Studio',
};

export default function ResumePage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Loading Resume Studio...</div>}>
      <ResumeClient />
    </Suspense>
  );
}
