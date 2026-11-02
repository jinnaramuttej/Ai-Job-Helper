import type { Metadata } from 'next';
import { InsightsClient } from './insights-client';

export const metadata: Metadata = {
  title: 'Insights',
};

export default function InsightsPage() {
  return <InsightsClient />;
}
