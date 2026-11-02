import type { Metadata } from 'next';
import { SettingsScreen } from '@/components/screens/Settings';
import { previewUIData } from '@/lib/preview';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return <SettingsScreen data={previewUIData} state="ready" />;
}

