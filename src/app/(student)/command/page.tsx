import type { Metadata } from 'next';
import { CommandScreen } from '@/components/screens/Command';
import { previewUIData } from '@/lib/preview';

export const metadata: Metadata = {
  title: 'Command',
};

export default async function CommandPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return <CommandScreen data={previewUIData} state="ready" seed={params?.q || null} />;
}

