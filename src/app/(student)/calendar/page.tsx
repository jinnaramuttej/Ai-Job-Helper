import type { Metadata } from 'next';
import { CalendarScreen } from '@/components/screens/Calendar';
import { previewUIData } from '@/lib/preview';

export const metadata: Metadata = {
  title: 'Calendar',
};

export default function CalendarPage() {
  return <CalendarScreen data={previewUIData} state="ready" />;
}

