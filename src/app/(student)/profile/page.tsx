import type { Metadata } from 'next';
import { SettingsScreen } from '@/components/screens/Settings';
import { previewUIData } from '@/lib/preview';

export const metadata: Metadata = {
  title: 'Profile and Settings',
};

export default function ProfilePage() {
  return <SettingsScreen data={previewUIData} state="ready" />;
}
