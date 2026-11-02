'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookmarkX, CalendarClock, Columns3, MapPin, Pencil, Search, Wallet } from 'lucide-react';
import type { Job, UIData } from '@/lib/view-models';
import { Button, Card, EmptyState, ErrorState, IconButton, MatchScore, Modal, Monogram, PageHeader, SkeletonPage, cx } from '../ui';
import { fmtPosted, gainOf } from '@/lib/view-models';

export interface SavedScreenProps {
  data: UIData;
  state: 'ready' | 'loading' | 'empty' | 'error';
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onNavigate?: (screen: string, params?: { jobId?: string; query?: string }) => void;
  onToast?: (msg: string) => void;
  onRetry?: () => void;
}

export function SavedScreen({
  data,
  state,
  savedIds,
  onToggleSave,
  onNavigate,
  onToast = () => undefined,
  onRetry = () => undefined,
}: SavedScreenProps) {
  const router = useRouter();
  const navigate = onNavigate ?? ((screen, params) => {
    if (params?.jobId) {
      router.push(`/${screen}?jobId=${encodeURIComponent(params.jobId)}`);
    } else {
      router.push(`/${screen}`);
    }
  });

  const [notes, setNotes] = useState<Record<string, string>>(data.savedNotes ?? {});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [cmp, setCmp] = useState<string[]>([]);
  const [cmpOpen, setCmpOpen] = useState(false);

  if (state === 'loading') return <SkeletonPage variant="grid" />;

  const jobs = state === 'empty' ? [] : data.jobs.filter((j) => savedIds.has(j.id)).sort((a, b) => (a.deadlineDays ?? 99) - (b.deadlineDays ?? 99) || b.score - a.score);
  const closing = jobs.filter((j) => j.deadlineDays !== null && j.deadlineDays <= 7).length;

  const header = (
    <PageHeader
      eyebrow={`${jobs.length} jobs · ${closing} closing soon`}
      title="Saved"
      actions={
        <>
          <span className="hidden text-[12.5px] text-muted sm:inline">
            {cmp.length ? `${cmp.length} selected` : 'Select 2–3 to compare'}
          </span>
          <Button variant="primary" icon={Columns3} disabled={cmp.length < 2} onClick={() => setCmpOpen(true)}>
            Compare{cmp.length ? ` (${cmp.length})` : ''}
          </Button>
        </>
      }
    />
  );

  if (state === 'error') {
    return (
      <div className="space-y-8">
        {header}
        <ErrorState
          title="Saved jobs didn’t load"
          body="We couldn’t reach your list. Nothing has been removed."
          onRetry={onRetry}
        />
      </div>
    );
  }

  const chosen = cmp.map((id) => data.jobs.find((j) => j.id === id)!).filter(Boolean);

  return (
    <div className="space-y-8">
      {header}
      {jobs.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No saved jobs"
          body="Save jobs from the ledger to compare them side by side and keep notes."
          action={<Button variant="primary" onClick={() => navigate('jobs')}>Browse jobs</Button>}
        />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((j) => {
            const sel = cmp.includes(j.id);
            const urgent = j.deadlineDays !== null && j.deadlineDays <= 3;
            return (
              <li key={j.id}>
                <Card className={cx('flex h-full flex-col p-5 transition-colors duration-150', sel && 'border-ink')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Monogram name={j.company} size={32} />
                      <div className="min-w-0">
                        <div className="truncate text-[13.5px] font-medium">{j.company}</div>
                        <div className="font-mono text-[10.5px] text-faint">Posted {fmtPosted(j.postedHours)}</div>
                      </div>
                    </div>
                    <IconButton
                      label={`Remove ${j.title} from saved`}
                      icon={BookmarkX}
                      size="sm"
                      onClick={() => {
                        onToggleSave(j.id);
                        setCmp(cmp.filter((x) => x !== j.id));
                        onToast(`Removed ${j.company} from saved`);
                      }}
                    />
                  </div>
                  <h2 className="mt-3 font-serif text-[19px] leading-snug">{j.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-muted">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden />
                      {j.city === 'Remote' ? 'Remote' : `${j.city} · ${j.mode}`}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Wallet className="size-3.5" aria-hidden />
                      {j.stipend}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <MatchScore score={j.score} size="md" className="flex-1" />
                    {j.deadlineDays !== null && (
                      <span className={cx('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 font-mono text-[11px]', urgent ? 'bg-terra/10 text-terra' : j.deadlineDays <= 7 ? 'bg-amber/10 text-amber' : 'bg-soft text-muted')}>
                        <CalendarClock className="size-3" aria-hidden />Closes in {j.deadlineDays}d
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex-1 border-t border-line pt-3">
                    {editing === j.id ? (
                      <div>
                        <label htmlFor={`note-${j.id}`} className="sr-only">Note for {j.company}</label>
                        <textarea
                          id={`note-${j.id}`}
                          rows={3}
                          className="field text-[13px]"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          autoFocus
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setNotes({ ...notes, [j.id]: draft });
                              setEditing(null);
                              onToast('Note saved');
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(j.id);
                          setDraft(notes[j.id] ?? '');
                        }}
                        className="group flex w-full items-start gap-2 text-left"
                      >
                        <Pencil className="mt-0.5 size-3.5 shrink-0 text-faint group-hover:text-ink" aria-hidden />
                        <span className={cx('text-[13px] leading-snug', notes[j.id] ? 'text-ink/85' : 'text-faint')}>
                          {notes[j.id] || 'Add a note…'}
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <label className={cx('inline-flex items-center gap-2 text-[13px]', !sel && cmp.length >= 3 ? 'cursor-not-allowed text-faint' : 'cursor-pointer')}>
                      <input
                        type="checkbox"
                        checked={sel}
                        disabled={!sel && cmp.length >= 3}
                        onChange={() => setCmp(sel ? cmp.filter((x) => x !== j.id) : [...cmp, j.id])}
                        className="size-4"
                      />
                      Compare
                    </label>
                    <Button size="sm" variant="outline" onClick={() => navigate('jobs', { jobId: j.id })}>Open</Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      <CompareModal open={cmpOpen} onClose={() => setCmpOpen(false)} jobs={chosen} onOpen={(id) => navigate('jobs', { jobId: id })} />
    </div>
  );
}

function CompareModal({ open, onClose, jobs, onOpen }: { open: boolean; onClose: () => void; jobs: Job[]; onOpen: (id: string) => void }) {
  const rows: { label: string; get: (j: Job) => number | string; num?: boolean; max?: number }[] = [
    { label: 'Total match', get: (j) => j.score, num: true, max: 100 },
    { label: 'Skills', get: (j) => j.marks.skills, num: true, max: 70 },
    { label: 'Role', get: (j) => j.marks.role, num: true, max: 15 },
    { label: 'Location', get: (j) => j.marks.location, num: true, max: 10 },
    { label: 'Experience', get: (j) => j.marks.experience, num: true, max: 5 },
    { label: 'Skills matched', get: (j) => `${j.skills.filter((s) => s.have).length}/${j.skills.length}` },
    { label: 'Best gain', get: (j) => { const g = gainOf(j); return g.marks ? `+${g.marks} ${g.skill}` : '—'; } },
    { label: 'Where', get: (j) => (j.city === 'Remote' ? 'Remote' : `${j.city} · ${j.mode}`) },
    { label: 'Stipend', get: (j) => j.stipend },
    { label: 'Deadline', get: (j) => (j.deadlineDays !== null ? `${j.deadlineDays} days` : 'Rolling') },
  ];
  return (
    <Modal open={open} onClose={onClose} title="Compare jobs" eyebrow="Side-by-side marks" size="xl" footer={<Button variant="primary" onClick={onClose}>Done</Button>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="w-[140px] py-3 pr-3"><span className="sr-only">Metric</span></th>
              {jobs.map((j) => (
                <th key={j.id} scope="col" className="px-3 py-3 align-bottom font-normal">
                  <div className="flex items-center gap-2"><Monogram name={j.company} size={24} /><span className="text-[13px] font-medium">{j.company}</span></div>
                  <button type="button" onClick={() => onOpen(j.id)} className="mt-1 text-left font-serif text-[16px] leading-snug hover:underline">{j.title}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => {
              const vals = jobs.map(r.get);
              const best = r.num ? Math.max(...(vals as number[])) : null;
              return (
                <tr key={r.label}>
                  <th scope="row" className="micro py-3 pr-3 font-normal">{r.label}</th>
                  {vals.map((v, i) => {
                    const isBest = r.num && v === best && jobs.length > 1;
                    return (
                      <td key={i} className="px-3 py-3">
                        {r.num ? (
                          <span className={cx('font-mono text-[13px]', isBest && 'text-green')}>
                            {r.label === 'Total match' ? <span className="font-serif text-[22px] text-ink">{v}</span> : v}<span className="text-faint">/{r.max}</span>{isBest && <span className="ml-1.5 text-[10.5px] uppercase tracking-wide">best</span>}
                          </span>
                        ) : <span className="text-[13px]">{v}</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

