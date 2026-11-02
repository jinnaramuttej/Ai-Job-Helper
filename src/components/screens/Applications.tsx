'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Columns3, List, Mail, Plus, Rows3, Send, StickyNote } from 'lucide-react';
import type { Application, AppStatus, UIData } from '@/lib/view-models';
import {
  Button, Card, Drawer, EmptyState, ErrorState, Field, IconButton, MatchScore, Micro, Modal, Monogram, PageHeader, Segmented, SkeletonPage,
  StatusBadge, Dot, cx,
} from '../ui';
import { STATUS_META, STATUS_ORDER, addDays, fmtDate, kanban, relDay } from '@/lib/view-models';

type View = 'board' | 'table' | 'timeline';
type SortKey = 'company' | 'date' | 'score' | 'status';

export interface ApplicationsScreenProps {
  data: UIData;
  state: 'ready' | 'loading' | 'empty' | 'error';
  onNavigate?: (screen: string) => void;
  onToast?: (msg: string) => void;
  onRetry?: () => void;
}

export function ApplicationsScreen({
  data,
  state,
  onNavigate,
  onToast = () => undefined,
  onRetry = () => undefined,
}: ApplicationsScreenProps) {
  const router = useRouter();
  const navigate = onNavigate ?? ((s) => router.push(`/${s}`));
  const today = new Date().toISOString().slice(0, 10);

  const [apps, setApps] = useState<Application[]>(state === 'empty' ? [] : data.applications);
  const [view, setView] = useState<View>('board');
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [emailFor, setEmailFor] = useState<Application | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'date', dir: -1 });

  const counts = kanban(apps);
  const total = apps.length;
  const reviewed = total - counts.applied;
  const interviewed = counts.interview + counts.offer;
  const open = apps.find((a) => a.id === openId) ?? null;

  const move = (id: string, status: AppStatus) => {
    const a = apps.find((x) => x.id === id);
    if (!a || a.status === status) return;
    setApps(apps.map((x) => (x.id === id ? { ...x, status, timeline: [...x.timeline, { date: today, label: `Moved to ${STATUS_META[status].label}` }] } : x)));
    onToast(`${a.company} moved to ${STATUS_META[status].label}`);
  };

  const update = (id: string, p: Partial<Application>) => setApps(apps.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const sorted = useMemo(() => {
    const r = [...apps];
    const by: Record<SortKey, (a: Application, b: Application) => number> = {
      company: (a, b) => a.company.localeCompare(b.company),
      date: (a, b) => a.date.localeCompare(b.date),
      score: (a, b) => a.score - b.score,
      status: (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    };
    return r.sort((a, b) => by[sort.key](a, b) * sort.dir);
  }, [apps, sort]);

  if (state === 'loading') return <SkeletonPage variant="board" />;

  const header = (
    <PageHeader
      eyebrow={`Workflow · ${total} applications`}
      title="Applications"
      actions={
        <>
          <Segmented
            label="View"
            value={view}
            onChange={setView}
            options={[
              { value: 'board', label: 'Board', icon: Columns3 },
              { value: 'table', label: 'Table', icon: Rows3 },
              { value: 'timeline', label: 'Timeline', icon: List },
            ]}
          />
          <Button variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>
            Add application
          </Button>
        </>
      }
    />
  );

  if (state === 'error') {
    return (
      <div className="space-y-8">
        {header}
        <ErrorState title="Your board didn’t load" body="We couldn’t fetch your applications. Nothing was lost; changes made offline will sync." onRetry={onRetry} />
      </div>
    );
  }

  const funnel = [
    { label: 'Applied', value: total, conv: null as number | null },
    { label: 'Reviewed', value: reviewed, conv: total ? Math.round((reviewed / total) * 100) : 0 },
    { label: 'Interview', value: interviewed, conv: reviewed ? Math.round((interviewed / reviewed) * 100) : 0 },
    { label: 'Offer', value: counts.offer, conv: interviewed ? Math.round((counts.offer / interviewed) * 100) : 0 },
  ];
  const drops = funnel.slice(1).map((f, i) => funnel[i].value - f.value);
  const worst = drops.indexOf(Math.max(...drops)) + 1;

  return (
    <div className="space-y-8">
      {header}
      {total === 0 ? (
        <EmptyState
          icon={Send}
          title="No applications yet"
          body="Track every application in one place. Add one manually, or apply from a job and we’ll add it for you."
          action={
            <>
              <Button variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>Add application</Button>
              <Button onClick={() => navigate('jobs')}>Find jobs</Button>
            </>
          }
        />
      ) : (
        <>
          <section aria-label="Application numbers" className="grid grid-cols-2 gap-px border-y border-line bg-line lg:grid-cols-4">
            {[
              { k: 'Total', v: String(total), h: `${counts.applied} awaiting reply`, tone: 'amber' as const },
              { k: 'Response rate', v: `${Math.round((reviewed / (total || 1)) * 100)}%`, h: `${reviewed} of ${total} heard back`, tone: 'blue' as const },
              { k: 'Interview rate', v: `${Math.round((interviewed / (total || 1)) * 100)}%`, h: `${interviewed} reached interview`, tone: 'green' as const },
              { k: 'Offers', v: String(counts.offer), h: apps.filter((a) => a.status === 'offer').map((a) => a.company).join(', ') || 'None yet', tone: 'violet' as const },
            ].map((m) => (
              <div key={m.k} className="bg-canvas px-4 py-4 md:px-5">
                <span className="micro flex items-center gap-2"><Dot tone={m.tone} />{m.k}</span>
                <div className="mt-2 font-serif text-[30px] leading-none tnum">{m.v}</div>
                <p className="mt-1.5 truncate text-[12.5px] text-muted">{m.h}</p>
              </div>
            ))}
          </section>

          <section aria-label="Conversion funnel" className="card flex flex-col divide-y divide-line overflow-hidden md:flex-row md:divide-x md:divide-y-0">
            {funnel.map((f, i) => (
              <div key={f.label} className="flex-1 px-4 py-3.5 md:px-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="micro">{f.label}</span>
                  {f.conv != null && (
                    <span className={cx('font-mono text-[11px]', i === worst ? 'text-terra' : 'text-muted')}>
                      {i === worst ? '↓ biggest drop · ' : '↓ '}{f.conv}%
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="font-serif text-[24px] leading-none">{f.value}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-soft">
                    <div className={cx('h-full rounded-full', i === worst ? 'bg-terra' : 'bg-ink')} style={{ width: `${(f.value / (total || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </section>

          {view === 'board' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {STATUS_ORDER.map((col) => {
                const colApps = apps.filter((a) => a.status === col);
                const meta = STATUS_META[col];
                return (
                  <div key={col} className="flex min-h-[360px] flex-col rounded-2xl bg-soft/60 p-3">
                    <div className="mb-3 flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Dot tone={meta.tone} />
                        <span className="font-medium text-[13.5px] text-ink">{meta.label}</span>
                      </div>
                      <span className="font-mono text-[11px] text-muted">{colApps.length}</span>
                    </div>
                    <ul className="space-y-2.5 flex-1 overflow-y-auto scroll-thin">
                      {colApps.map((a) => (
                        <li key={a.id}>
                          <Card className="p-3.5 hover:border-border-subtle transition-colors cursor-pointer" onClick={() => setOpenId(a.id)}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-[13.5px] truncate text-ink">{a.company}</span>
                              <MatchScore score={a.score} size="xs" bar={false} />
                            </div>
                            <div className="text-[12.5px] text-muted truncate mt-0.5">{a.role}</div>
                            <div className="mt-2.5 flex items-center justify-between font-mono text-[10.5px] text-faint">
                              <span>{relDay(a.date, today)}</span>
                              <span>{a.nextStep ? 'Next: ' + a.nextStep.split(' ')[0] : ''}</span>
                            </div>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {view === 'table' && (
            <Card className="overflow-hidden">
              <table className="w-full text-left">
                <thead className="border-b border-line bg-soft/40">
                  <tr>
                    {['Company', 'Role', 'Status', 'Applied', 'Match', ''].map((h, i) => (
                      <th key={i} className="micro px-4 py-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-[13.5px]">
                  {sorted.map((a) => (
                    <tr key={a.id} className="hover:bg-soft/40 transition-colors cursor-pointer" onClick={() => setOpenId(a.id)}>
                      <td className="px-4 py-3 font-medium text-ink flex items-center gap-2.5">
                        <Monogram name={a.company} size={24} />{a.company}
                      </td>
                      <td className="px-4 py-3 text-muted">{a.role}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3 font-mono text-[12px] text-muted">{fmtDate(a.date)}</td>
                      <td className="px-4 py-3"><MatchScore score={a.score} size="xs" bar={false} /></td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setOpenId(a.id); }} className="text-terra text-[12.5px] hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {view === 'timeline' && (
            <Card className="p-6">
              <ol className="relative ml-2 border-l border-line space-y-6">
                {sorted.map((a) => (
                  <li key={a.id} className="relative pl-6">
                    <span className="absolute -left-[5px] top-1 size-2 rounded-full bg-terra ring-4 ring-card" aria-hidden />
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[14px] text-ink">{a.company}</span>
                      <StatusBadge status={a.status} />
                      <span className="font-mono text-[11px] text-faint ml-auto">{fmtDate(a.date)}</span>
                    </div>
                    <div className="text-[13px] text-muted mt-1">{a.role} · {a.nextStep}</div>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </>
      )}

      {/* Drawer for Application Detail */}
      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open?.company ?? 'Application'} eyebrow={open?.role}>
        {open && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <div className="micro text-faint">Status</div>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={open.status} />
                  <select
                    value={open.status}
                    onChange={(e) => move(open.id, e.target.value as AppStatus)}
                    className="field !w-auto !py-1 text-[12.5px]"
                  >
                    {STATUS_ORDER.map((st) => (
                      <option key={st} value={st}>{STATUS_META[st].label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-right">
                <div className="micro text-faint">Applied</div>
                <div className="font-mono text-[13px] text-ink mt-1">{fmtDate(open.date)}</div>
              </div>
            </div>

            <div>
              <div className="micro text-faint mb-2">Recruiter / Contact</div>
              <div className="card p-4 space-y-1 text-[13px]">
                <div className="font-medium text-ink">{open.contact.name}</div>
                <div className="text-muted">{open.contact.title}</div>
                <div className="text-terra">{open.contact.email}</div>
              </div>
            </div>

            <div>
              <div className="micro text-faint mb-2">Notes</div>
              <textarea
                value={open.notes}
                onChange={(e) => update(open.id, { notes: e.target.value })}
                rows={3}
                className="field text-[13px]"
                placeholder="Add notes about interviews, questions asked, referrals..."
              />
            </div>

            <div>
              <div className="micro text-faint mb-3">Timeline</div>
              <ol className="relative ml-2 border-l border-line space-y-4">
                {open.timeline.map((t, idx) => (
                  <li key={idx} className="relative pl-5 text-[12.5px]">
                    <span className="absolute -left-[4.5px] top-1 size-2 rounded-full bg-btn ring-4 ring-card" aria-hidden />
                    <span className="font-mono text-[11px] text-faint">{t.date}</span>
                    <div className="text-ink font-medium">{t.label}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal to Add Application */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Application"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const newApp: Application = {
                  id: `app-${Date.now()}`,
                  company: 'Acme Corp',
                  role: 'Frontend Intern',
                  date: today,
                  status: 'applied',
                  score: 75,
                  nextStep: 'Under review',
                  responseDays: null,
                  contact: { name: 'Recruiter', title: 'Talent Acquisition', email: 'talent@acme.com' },
                  notes: '',
                  resume: 'resume_v5.pdf',
                  timeline: [{ date: today, label: 'Application submitted' }],
                };
                setApps([newApp, ...apps]);
                setAddOpen(false);
                onToast('Application added');
              }}
            >
              Save application
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Company name"><input className="field" defaultValue="Acme Corp" /></Field>
          <Field label="Role title"><input className="field" defaultValue="Frontend Intern" /></Field>
          <Field label="Status">
            <select className="field">
              {STATUS_ORDER.map((st) => (
                <option key={st} value={st}>{STATUS_META[st].label}</option>
              ))}
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}

