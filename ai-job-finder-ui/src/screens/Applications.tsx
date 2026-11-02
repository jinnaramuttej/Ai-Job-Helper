import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarClock, Columns3, Copy, FileText, GripVertical, List, Mail, Plus, Rows3, Send, StickyNote } from 'lucide-react';
import type { ScreenProps } from './types';
import type { Application, AppStatus } from '../mock';
import {
  Button, Card, Drawer, EmptyState, ErrorState, Field, IconButton, MatchScore, Micro, Modal, Monogram, PageHeader, Segmented, SkeletonPage,
  StatusBadge, Dot, cx,
} from '../components/ui';
import { STATUS_META, STATUS_ORDER, TODAY, addDays, fmtDate, kanban, relDay } from '../lib/derive';

type View = 'board' | 'table' | 'timeline';
type SortKey = 'company' | 'date' | 'score' | 'status';

export function Applications({ data, state, onNavigate, onToast, onRetry }: ScreenProps) {
  const [apps, setApps] = useState<Application[]>(state === 'empty' ? [] : data.applications);
  const [view, setView] = useState<View>('board');
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [emailFor, setEmailFor] = useState<Application | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'date', dir: -1 });
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<AppStatus | null>(null);

  const counts = kanban(apps);
  const total = apps.length;
  const reviewed = total - counts.applied;
  const interviewed = counts.interview + counts.offer;
  const open = apps.find((a) => a.id === openId) ?? null;
  const move = (id: string, status: AppStatus) => {
    const a = apps.find((x) => x.id === id);
    if (!a || a.status === status) return;
    setApps(apps.map((x) => (x.id === id ? { ...x, status, timeline: [...x.timeline, { date: TODAY, label: `Moved to ${STATUS_META[status].label}` }] } : x)));
    onToast(`${a.company} moved to ${STATUS_META[status].label}`);
  };
  const update = (id: string, p: Partial<Application>) => setApps(apps.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const sorted = useMemo(() => {
    const r = [...apps];
    const by: Record<SortKey, (a: Application, b: Application) => number> = {
      company: (a, b) => a.company.localeCompare(b.company), date: (a, b) => a.date.localeCompare(b.date),
      score: (a, b) => a.score - b.score, status: (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    };
    return r.sort((a, b) => by[sort.key](a, b) * sort.dir);
  }, [apps, sort]);

  if (state === 'loading') return <SkeletonPage variant="board" />;
  const header = (
    <PageHeader eyebrow={`Workflow · ${total} applications · ${apps.filter((a) => a.date >= '2025-10-20').length} this week`} title="Applications"
      actions={<>
        <Segmented label="View" value={view} onChange={setView} options={[{ value: 'board', label: 'Board', icon: Columns3 }, { value: 'table', label: 'Table', icon: Rows3 }, { value: 'timeline', label: 'Timeline', icon: List }]} />
        <Button variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>Add application</Button>
      </>} />
  );
  if (state === 'error') return <div className="space-y-8">{header}<ErrorState title="Your board didn’t load" body="We couldn’t fetch your applications. Nothing was lost; changes made offline will sync." onRetry={onRetry} /></div>;

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
        <EmptyState icon={Send} title="No applications yet" body="Track every application in one place. Add one manually, or apply from a job and we’ll add it for you."
          action={<><Button variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>Add application</Button><Button onClick={() => onNavigate('jobs')}>Find jobs</Button></>} />
      ) : (
        <>
          <section aria-label="Application numbers" className="grid grid-cols-2 gap-px border-y border-line bg-line lg:grid-cols-4">
            {[
              { k: 'Total', v: String(total), h: `${counts.applied} awaiting reply`, tone: 'amber' as const },
              { k: 'Response rate', v: `${Math.round((reviewed / total) * 100)}%`, h: `${reviewed} of ${total} heard back`, tone: 'blue' as const },
              { k: 'Interview rate', v: `${Math.round((interviewed / total) * 100)}%`, h: `${interviewed} reached interview`, tone: 'green' as const },
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
                  {f.conv != null && <span className={cx('font-mono text-[11px]', i === worst ? 'text-terra' : 'text-muted')}>{i === worst ? '↓ biggest drop · ' : '↓ '}{f.conv}%</span>}
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="font-serif text-[24px] leading-none">{f.value}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-soft"><div className={cx('h-full rounded-full', i === worst ? 'bg-terra' : 'bg-ink')} style={{ width: `${(f.value / total) * 100}%` }} /></div>
                </div>
              </div>
            ))}
          </section>

          {view === 'board' && (
            <div className="scroll-thin -mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
              <div className="grid min-w-[1060px] grid-cols-5 gap-4">
                {STATUS_ORDER.map((st) => {
                  const col = apps.filter((a) => a.status === st).sort((a, b) => b.date.localeCompare(a.date));
                  const avg = col.length ? Math.round(col.reduce((s, a) => s + a.score, 0) / col.length) : 0;
                  return (
                    <section key={st} aria-label={`${STATUS_META[st].label}, ${col.length}`}
                      onDragOver={(e) => { e.preventDefault(); setOver(st); }} onDragLeave={() => setOver(null)}
                      onDrop={(e) => { e.preventDefault(); if (dragId) move(dragId, st); setDragId(null); setOver(null); }}
                      className={cx('flex min-h-[420px] flex-col rounded-2xl border p-2.5 transition-colors duration-150', over === st ? 'border-dashed border-ink/40 bg-soft' : 'border-line bg-[#F3EFE7]/60')}>
                      <header className="flex items-center justify-between px-1.5 pb-2.5 pt-1">
                        <span className="flex items-center gap-2 text-[13.5px] font-medium"><Dot tone={STATUS_META[st].tone} />{STATUS_META[st].label}<span className="font-mono text-[11px] text-muted">{col.length}</span></span>
                        <span className="font-mono text-[10.5px] text-faint">{col.length ? `avg ${avg}` : ''}</span>
                      </header>
                      <ul className="flex-1 space-y-2">
                        {col.map((a) => (
                          <li key={a.id} draggable onDragStart={(e) => { setDragId(a.id); e.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => setDragId(null)}
                            className={cx('group rounded-xl border border-line bg-card shadow-[0_1px_0_rgba(30,20,0,0.03)] transition-[border-color,box-shadow,opacity] duration-150 hover:border-[#D6CEC0] hover:shadow-card', dragId === a.id && 'opacity-50')}>
                            <button type="button" onClick={() => setOpenId(a.id)} className="w-full p-3 text-left" aria-label={`${a.role} at ${a.company}, ${STATUS_META[a.status].label}. Open details`}>
                              <div className="flex items-start justify-between gap-2">
                                <span className="flex min-w-0 items-center gap-1.5 text-[12px] text-muted"><Monogram name={a.company} size={16} /><span className="truncate">{a.company}</span></span>
                                <GripVertical className="size-3.5 shrink-0 cursor-grab text-faint opacity-0 transition-opacity duration-150 group-hover:opacity-100" aria-hidden />
                              </div>
                              <div className="mt-1.5 line-clamp-2 font-serif text-[15px] leading-snug text-ink">{a.role}</div>
                              <div className="mt-2.5 flex items-center justify-between gap-2">
                                <span className="font-mono text-[10.5px] text-faint">{fmtDate(a.date)}</span>
                                <span className="font-mono text-[10.5px] text-muted"><span className="font-serif text-[14px] text-ink">{a.score}</span>/100</span>
                              </div>
                              <div className="mt-2 flex items-start gap-1.5 border-t border-line pt-2 text-[11.5px] leading-snug text-muted"><CalendarClock className="mt-px size-3 shrink-0" aria-hidden />{a.nextStep}</div>
                            </button>
                          </li>
                        ))}
                      </ul>
                      {st === 'applied' && <button type="button" onClick={() => setAddOpen(true)} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#D6CEC0] py-2 text-[12.5px] text-muted transition-colors duration-150 hover:bg-card hover:text-ink"><Plus className="size-3.5" aria-hidden />Add</button>}
                    </section>
                  );
                })}
              </div>
              <p className="mt-2 font-mono text-[11px] text-faint">Drag cards between columns, or open a card to change its status from the keyboard.</p>
            </div>
          )}

          {view === 'table' && (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="border-b border-line bg-[#FBF9F4]">
                  <tr>
                    {([['company', 'Company · role'], ['date', 'Applied'], ['score', 'Match'], ['status', 'Status']] as [SortKey, string][]).map(([k, label]) => (
                      <th key={k} scope="col" aria-sort={sort.key === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'} className="px-4 py-2.5 font-normal">
                        <button type="button" onClick={() => setSort({ key: k, dir: sort.key === k ? (sort.dir === 1 ? -1 : 1) : 1 })} className="micro inline-flex items-center gap-1 hover:text-ink">
                          {label}{sort.key === k ? (sort.dir === 1 ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />) : <ArrowUpDown className="size-3 opacity-50" aria-hidden />}
                        </button>
                      </th>
                    ))}
                    <th scope="col" className="micro px-4 py-2.5 font-normal">Next step</th>
                    <th scope="col" className="px-4 py-2.5"><span className="sr-only">Notes</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {sorted.map((a) => (
                    <tr key={a.id} className="transition-colors duration-150 hover:bg-soft/40">
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => setOpenId(a.id)} className="flex items-center gap-2.5 text-left">
                          <Monogram name={a.company} size={28} />
                          <span><span className="block text-[13.5px] font-medium hover:underline">{a.company}</span><span className="block text-[12.5px] text-muted">{a.role}</span></span>
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-muted">{fmtDate(a.date)}</td>
                      <td className="w-[110px] px-4 py-3"><MatchScore score={a.score} size="xs" /></td>
                      <td className="px-4 py-3">
                        <label htmlFor={`st-${a.id}`} className="sr-only">Status for {a.company}</label>
                        <select id={`st-${a.id}`} value={a.status} onChange={(e) => move(a.id, e.target.value as AppStatus)} className="field !w-auto !py-1.5 text-[12.5px]">
                          {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                        </select>
                      </td>
                      <td className="max-w-[240px] px-4 py-3 text-[12.5px] text-muted">{a.nextStep}</td>
                      <td className="px-4 py-3 text-right"><IconButton label={`Notes for ${a.company}${a.notes ? ' (has notes)' : ''}`} icon={StickyNote} size="sm" onClick={() => setOpenId(a.id)} className={a.notes ? 'text-terra' : ''} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {view === 'timeline' && (
            <ol className="relative ml-2 space-y-8 border-l border-line pl-6">
              {data.stats.weekLabels.map((wk, wi) => {
                const start = addDays('2025-08-04', wi * 7);
                const end = addDays(start, 6);
                const items = apps.filter((a) => a.date >= start && a.date <= end).sort((a, b) => b.date.localeCompare(a.date));
                return { wk, items };
              }).reverse().map(({ wk, items }) => (
                <li key={wk} className="relative">
                  <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full border-2 border-canvas bg-ink" aria-hidden />
                  <div className="flex items-baseline gap-3"><h3 className="font-serif text-[18px]">Week of {wk}</h3><span className="font-mono text-[11px] text-muted">{items.length} sent</span></div>
                  {items.length === 0 ? <p className="mt-1 text-[13px] text-faint">No applications this week.</p> : (
                    <ul className="mt-2.5 space-y-2">
                      {items.map((a) => (
                        <li key={a.id}>
                          <button type="button" onClick={() => setOpenId(a.id)} className="flex w-full items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-2.5 text-left transition-colors duration-150 hover:border-[#D6CEC0]">
                            <span className="w-[70px] shrink-0 font-mono text-[11px] text-faint">{fmtDate(a.date, true)}</span>
                            <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-medium">{a.role}</span><span className="block truncate text-[12px] text-muted">{a.company}</span></span>
                            <StatusBadge status={a.status} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      <AppDrawer app={open} onClose={() => setOpenId(null)} onMove={move} onUpdate={update} onToast={onToast} onEmail={(a) => setEmailFor(a)} />
      <EmailModal app={emailFor} onClose={() => setEmailFor(null)} onSent={(a) => { update(a.id, { timeline: [...a.timeline, { date: TODAY, label: 'Follow-up email sent' }], nextStep: 'Wait for reply (sent today)' }); setEmailFor(null); onToast(`Follow-up to ${a.contact.name} marked as sent`); }} onToast={onToast} />
      <AddModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={(a) => { setApps([a, ...apps]); setAddOpen(false); onToast(`${a.company} added to Applied`); }} />
    </div>
  );
}

function AppDrawer({ app, onClose, onMove, onUpdate, onToast, onEmail }: { app: Application | null; onClose: () => void; onMove: (id: string, s: AppStatus) => void; onUpdate: (id: string, p: Partial<Application>) => void; onToast: (m: string) => void; onEmail: (a: Application) => void }) {
  const [note, setNote] = useState('');
  const [remind, setRemind] = useState('2025-10-31');
  const [lastId, setLastId] = useState<string | null>(null);
  if (app && app.id !== lastId) { setLastId(app.id); setNote(app.notes); }
  return (
    <Drawer open={!!app} onClose={onClose} title={app?.role ?? ''} eyebrow={app ? `${app.company} · applied ${fmtDate(app.date)}` : ''}
      footer={app && <><Button variant="ghost" onClick={() => { onMove(app.id, 'rejected'); onClose(); }}>Archive</Button><Button variant="primary" icon={Mail} onClick={() => onEmail(app)}>Send follow-up</Button></>}>
      {app && (
        <div className="divide-y divide-line">
          <div className="grid grid-cols-3 gap-3 px-5 py-4">
            <div><Micro as="p">Status</Micro>
              <label htmlFor="drawer-status" className="sr-only">Status</label>
              <select id="drawer-status" value={app.status} onChange={(e) => onMove(app.id, e.target.value as AppStatus)} className="field mt-1 !py-1.5 text-[13px]">
                {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </div>
            <div><Micro as="p">Match</Micro><div className="mt-1.5"><MatchScore score={app.score} size="xs" /></div></div>
            <div><Micro as="p">Next step</Micro><p className="mt-1.5 text-[12.5px] leading-snug">{app.nextStep}</p></div>
          </div>
          <section className="px-5 py-4" aria-labelledby="dr-tl">
            <h3 id="dr-tl" className="font-serif text-[17px]">Timeline</h3>
            <ol className="relative ml-1 mt-3 space-y-3 border-l border-line">
              {app.timeline.map((t, i) => (
                <li key={i} className="relative pl-4">
                  <span className={cx('absolute -left-[4.5px] top-1.5 size-2 rounded-full', i === app.timeline.length - 1 ? 'bg-terra' : 'bg-ink')} aria-hidden />
                  <div className="flex items-baseline justify-between gap-2"><span className="text-[13px]">{t.label}</span><span className="font-mono text-[10.5px] text-faint">{relDay(t.date)}</span></div>
                </li>
              ))}
            </ol>
          </section>
          <section className="px-5 py-4">
            <label htmlFor="dr-notes" className="font-serif text-[17px]">Notes</label>
            <textarea id="dr-notes" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Interviewer names, questions asked, salary range…" className="field mt-2" />
            <div className="mt-2 flex justify-end"><Button size="sm" onClick={() => { onUpdate(app.id, { notes: note }); onToast('Notes saved'); }}>Save notes</Button></div>
          </section>
          <section className="px-5 py-4">
            <h3 className="font-serif text-[17px]">Contacts</h3>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-white p-3">
              <span className="grid size-9 place-items-center rounded-full bg-soft font-serif text-[14px]">{app.contact.name.split(' ').map((p) => p[0]).join('')}</span>
              <div className="min-w-0 flex-1"><div className="text-[13.5px] font-medium">{app.contact.name}</div><div className="truncate text-[12px] text-muted">{app.contact.title} · {app.contact.email}</div></div>
              <IconButton label={`Copy ${app.contact.name}'s email`} icon={Copy} size="sm" onClick={() => { navigator.clipboard?.writeText(app.contact.email).catch(() => undefined); onToast('Email copied'); }} />
            </div>
          </section>
          <section className="px-5 py-4">
            <h3 className="font-serif text-[17px]">Follow-up reminder</h3>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <Field label="Remind me on" htmlFor="dr-remind" className="flex-1"><input id="dr-remind" type="date" min={TODAY} value={remind} onChange={(e) => setRemind(e.target.value)} className="field" /></Field>
              <Button icon={CalendarClock} onClick={() => onToast(`Reminder set for ${fmtDate(remind, true)}`)}>Set reminder</Button>
            </div>
            <p className="mt-2 text-[12px] text-muted">We also add it to your Calendar as a follow-up.</p>
          </section>
          <section className="px-5 py-4">
            <h3 className="font-serif text-[17px]">Documents</h3>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-white p-3">
              <FileText className="size-5 text-violet" aria-hidden />
              <div className="flex-1"><div className="text-[13.5px]">{app.resume}</div><div className="font-mono text-[11px] text-muted">Resume version used · ATS {({ 'resume_v1.pdf': 58, 'resume_v2.pdf': 61, 'resume_v3.pdf': 64, 'resume_v4.pdf': 68, 'resume_v5.pdf': 72 } as Record<string, number>)[app.resume]}</div></div>
              <Button size="sm" variant="ghost" onClick={() => onToast(`Opening ${app.resume} (preview only)`)}>View</Button>
            </div>
          </section>
        </div>
      )}
    </Drawer>
  );
}

function EmailModal({ app, onClose, onSent, onToast }: { app: Application | null; onClose: () => void; onSent: (a: Application) => void; onToast: (m: string) => void }) {
  const body = app ? `Hi ${app.contact.name.split(' ')[0]},\n\nI applied for the ${app.role} role on ${fmtDate(app.date)} and wanted to check in on its status. Since applying, I shipped the college fest website in React (4,200 visitors in 3 days), which is close to the work your team does.\n\nHappy to share more or do a short call. Thank you for your time.\n\nBest,\nAnanya Sharma\n+91 98450 12345` : '';
  return (
    <Modal open={!!app} onClose={onClose} title="Send follow-up" eyebrow="Draft email" size="lg"
      footer={app && <><Button variant="ghost" icon={Copy} onClick={() => { navigator.clipboard?.writeText(body).catch(() => undefined); onToast('Draft copied'); }}>Copy draft</Button><Button onClick={() => onToast('Opening your mail app…')}>Open in mail app</Button><Button variant="primary" icon={Send} onClick={() => onSent(app)}>Mark as sent</Button></>}>
      {app && (
        <div className="space-y-3">
          <Field label="To" htmlFor="em-to"><input id="em-to" className="field" defaultValue={`${app.contact.name} <${app.contact.email}>`} /></Field>
          <Field label="Subject" htmlFor="em-sub"><input id="em-sub" className="field" defaultValue={`Following up: ${app.role} application`} /></Field>
          <Field label="Message" htmlFor="em-body" hint="Three short paragraphs. Specific beats long."><textarea id="em-body" rows={10} className="field font-sans leading-relaxed" defaultValue={body} key={app.id} /></Field>
        </div>
      )}
    </Modal>
  );
}

function AddModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (a: Application) => void }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState(TODAY);
  const [status, setStatus] = useState<AppStatus>('applied');
  const valid = company.trim() && role.trim();
  const submit = () => {
    if (!valid) return;
    onAdd({ id: `n${Date.now()}`, company: company.trim(), role: role.trim(), date, status, score: 50, nextStep: 'Follow up in 7 days', responseDays: null,
      contact: { name: 'Recruiter', title: 'Talent team', email: `careers@${company.toLowerCase().replace(/[^a-z]/g, '')}.com` }, notes: '', resume: 'resume_v5.pdf', timeline: [{ date, label: 'Applied with resume_v5.pdf' }] });
    setCompany(''); setRole('');
  };
  return (
    <Modal open={open} onClose={onClose} title="Add application"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!valid} onClick={submit}>Add to board</Button></>}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Field label="Company" htmlFor="ad-co"><input id="ad-co" className="field" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. NovaPay" /></Field>
        <Field label="Role" htmlFor="ad-ro"><input id="ad-ro" className="field" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Intern" /></Field>
        <Field label="Date applied" htmlFor="ad-da"><input id="ad-da" type="date" className="field" value={date} max={TODAY} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Status" htmlFor="ad-st"><select id="ad-st" className="field" value={status} onChange={(e) => setStatus(e.target.value as AppStatus)}>{STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}</select></Field>
        <Field label="Job link (optional)" htmlFor="ad-li" className="sm:col-span-2" hint="Paste the posting and we’ll score it against your resume."><input id="ad-li" className="field" placeholder="https://" /></Field>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}
