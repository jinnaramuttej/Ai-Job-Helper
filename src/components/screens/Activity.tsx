'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Search } from 'lucide-react';
import type { Category, UIData } from '@/lib/view-models';
import { Button, Chip, EmptyState, ErrorState, PageHeader, SkeletonPage, TONES, Tag, cx } from '../ui';
import { CAT_TONE, relDay } from '@/lib/view-models';

const FILTERS: { value: 'ALL' | Category; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'MATCH', label: 'Matches' },
  { value: 'APPLICATION', label: 'Applications' },
  { value: 'RESUME', label: 'Resume' },
  { value: 'INTERVIEW', label: 'Interviews' },
  { value: 'DEADLINE', label: 'Deadlines' },
];

export interface ActivityScreenProps {
  data: UIData;
  state: 'ready' | 'loading' | 'empty' | 'error';
  onNavigate?: (screen: string, params?: { jobId?: string; query?: string }) => void;
  onToast?: (msg: string) => void;
  onRetry?: () => void;
}

export function ActivityScreen({
  data,
  state,
  onNavigate,
  onRetry = () => undefined,
}: ActivityScreenProps) {
  const router = useRouter();
  const navigate = onNavigate ?? ((screen) => router.push(`/${screen}`));

  const [filter, setFilter] = useState<'ALL' | Category>('ALL');
  const [q, setQ] = useState('');

  if (state === 'loading') return <SkeletonPage variant="list" />;

  const header = <PageHeader eyebrow="Workflow · everything that happened, by day" title="Activity" />;

  if (state === 'error') {
    return (
      <div className="space-y-8">
        <div className="text-xs font-mono text-muted">Preview data</div>
        {header}
        <ErrorState
          title="Activity didn’t load"
          body="We couldn’t fetch your timeline. Events are still being recorded."
          onRetry={onRetry}
        />
      </div>
    );
  }

  const all = state === 'empty' ? [] : data.activity;
  const items = all.filter(
    (e) => (filter === 'ALL' || e.category === filter) && (!q || `${e.title} ${e.detail}`.toLowerCase().includes(q.toLowerCase()))
  );
  const days = [...new Set(items.map((e) => e.date))].sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="text-xs font-mono text-muted">Preview data</div>
      {header}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="scroll-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter activity">
          {FILTERS.map((f) => (
            <Chip
              key={f.value}
              active={filter === f.value}
              onClick={() => setFilter(f.value)}
              count={f.value === 'ALL' ? all.length : all.filter((e) => e.category === f.value).length}
            >
              {f.label}
            </Chip>
          ))}
        </div>
        <div className="relative md:w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <label htmlFor="act-q" className="sr-only">Search activity</label>
          <input
            id="act-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search activity"
            className="field !rounded-full pl-9"
          />
        </div>
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={all.length ? 'No events match' : 'No activity yet'}
          body={all.length ? 'Try another filter or clear your search.' : 'Searches, saves, applications and resume changes will appear here as a timeline.'}
          action={
            all.length ? (
              <Button onClick={() => { setFilter('ALL'); setQ(''); }}>Clear filters</Button>
            ) : (
              <Button variant="primary" onClick={() => navigate('jobs')}>Find jobs</Button>
            )
          }
        />
      ) : (
        <div className="space-y-8">
          {days.map((d) => (
            <section key={d} aria-labelledby={`day-${d}`}>
              <h2 id={`day-${d}`} className="micro sticky top-0 z-[1] bg-canvas py-2">
                {relDay(d)}
                <span className="ml-2 text-faint">· {items.filter((e) => e.date === d).length}</span>
              </h2>
              <ol className="relative ml-1.5 mt-2 border-l border-line">
                {items
                  .filter((e) => e.date === d)
                  .map((e) => (
                    <li key={e.id} className="relative flex flex-col gap-1 py-3 pl-6 sm:flex-row sm:items-start sm:gap-5">
                      <span className={cx('absolute -left-[4.5px] top-[18px] size-2 rounded-full ring-4 ring-canvas', TONES[CAT_TONE[e.category]].dot)} aria-hidden />
                      <span className="w-12 shrink-0 pt-0.5 font-mono text-[11px] text-faint">{e.time}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Tag category={e.category} />
                          <span className="text-[14px] font-medium text-ink">{e.title}</span>
                        </div>
                        <p className="mt-0.5 text-[13px] text-muted">{e.detail}</p>
                      </div>
                    </li>
                  ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

