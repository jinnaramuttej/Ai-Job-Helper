import type { Metadata } from 'next';
import { InterviewPrepScreen } from '@/components/screens/InterviewPrep';
import { previewUIData } from '@/lib/preview';

export const metadata: Metadata = {
  title: 'Interview Prep',
};

export default function InterviewPage() {
  return <InterviewPrepScreen data={previewUIData} state="ready" />;
}

