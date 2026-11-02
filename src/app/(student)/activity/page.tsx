import type { Metadata } from 'next';
import { ActivityScreen } from '@/components/screens/Activity';
import { previewUIData } from '@/lib/preview';

export const metadata: Metadata = {
  title: 'Activity',
};

export default function ActivityPage() {
  return <ActivityScreen data={previewUIData} state="ready" />;
}

