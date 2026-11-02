import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { ScreenProps } from './types';
import type { CalEvent } from '../mock';
import { Button, Card, EmptyState, ErrorState, Field, IconButton, Micro, Modal, PageHeader, SkeletonPage, Tag, cx } from '../components/ui';
import { TODAY, fmtDate } from '../lib/derive';

const TYPE = {
  interview: { label: 'Interview', tone: 'green', pill: 'bg-green/10 text-green', dot: 'bg-green', action: 'Prepare', target: 'interview' },
  deadline: { label: 'Deadline', tone: 'terra', pill: 'bg-terra/10 text-terra', dot: 'bg-terra', action: 'Open job', target: 'jobs' },
  followup: { label: 'Follow-up', tone: 'amber', pill: 'bg-amber/10 text-amber', dot: 'bg-amber', action: 'Send follow-up', target: 'applications' },
  other: { label: 'Other', tone: 'blue', pill: 'bg-blue/10 text-blue', dot: 'bg-blue', action: 'Details', target: 'activity' },
} as const;

export function Calendar({ data, state, onNavigate, onToast, onRetry }: ScreenProps) {
  const [events, setEvents] = useState<CalEvent[]>(state === 'empty' ? [] : data.calendar);
  const [ym, setYm] = useState({ y: 2025, m: 9 });
  const [sel, setSel] = useState(TODAY);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'interview' as CalEvent['type'], date: TODAY, time: '10:00' });

  const cells = useMemo(() => {
    const first = new Date(Date.UTC(ym.y, ym.m, 1));
    const offset = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate();
    const out: { date: string; inMonth: boolean; day: number }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(Date.UTC(ym.y, ym.m, 1 - offset + i));
      out.push({ date: d.toISOString().slice(0, 10), inMonth: d.getUTCMonth() === ym.m, day: d.getUTCDate() });
    }
    return out.slice(0, offset + days > 35 ? 42 : 35);
  }, [ym]);

  if (state === 'loading') return <SkeletonPage variant="split" />;
  const monthName = new Date(Date.UTC(ym.y, ym.m, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const header = (
    <PageHeader eyebrow={`Workflow · ${events.filter((e) => e.date >= TODAY && e.type === 'interview').length} interviews and ${events.filter((e) => e.date >= TODAY && e.type === 'deadline').length} deadlines ahead`} title="Calendar"
      actions={<Button variant="primary" icon={Plus} onClick={() => { setForm({ ...form, date: sel }); setAddOpen(true); }}>Add event</Button>} />
  );
  if (state === 'error') return <div className="space-y-8">{header}<ErrorState title="Calendar didn’t sync" body="We couldn’t load your events. Reminders already scheduled will still be sent." onRetry={onRetry} /></div>;

  const dayEvents = (d: string) => events.filter((e) => e.date === d).sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));
  const selEvents = dayEvents(sel);
  const upcoming = events.filter((e) => e.date > sel).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const shift = (n: number) => setYm(({ y, m }) => { const d = new Date(Date.UTC(y, m + n, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });

  return (
    <div className="space-y-6">
      {header}
      {events.length === 0 && <EmptyState compact icon={CalendarDays} title="Nothing scheduled" body="Interviews, deadlines and follow-ups from your applications land here automatically." action={<Button onClick={() => setAddOpen(true)}>Add your first event</Button>} />}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
            <div className="flex items-center gap-1">
              <IconButton label="Previous month" icon={ChevronLeft} size="sm" onClick={() => shift(-1)} />
              <h2 className="min-w-[150px] text-center font-serif text-[20px]" aria-live="polite">{monthName}</h2>
              <IconButton label="Next month" icon={ChevronRight} size="sm" onClick={() => shift(1)} />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden flex-wrap gap-1.5 md:flex">{(Object.keys(TYPE) as CalEvent['type'][]).map((t) => <Tag key={t} tone={TYPE[t].tone}>{TYPE[t].label}</Tag>)}</div>
              <Button size="sm" onClick={() => { setYm({ y: 2025, m: 9 }); setSel(TODAY); }}>Today</Button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-line bg-[#FBF9F4]">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d} className="micro px-2 py-2 text-center md:text-left">{d}</div>)}
          </div>
          <div className="grid grid-cols-7" role="grid" aria-label={monthName}>
            {cells.map((c, i) => {
              const evs = dayEvents(c.date);
              const isToday = c.date === TODAY, isSel = c.date === sel;
              return (
                <button key={c.date} type="button" role="gridcell" aria-selected={isSel} onClick={() => setSel(c.date)}
                  aria-label={`${fmtDate(c.date, true)}${evs.length ? `, ${evs.length} event${evs.length > 1 ? 's' : ''}` : ''}${isToday ? ', today' : ''}`}
                  className={cx('flex min-h-[64px] min-w-0 flex-col gap-1 overflow-hidden border-line p-1.5 text-left align-top transition-colors duration-150 md:min-h-[104px] md:p-2', i % 7 !== 6 && 'border-r', i < cells.length - 7 && 'border-b',
                    isSel ? 'bg-soft' : 'hover:bg-[#FBF9F4]', !c.inMonth && 'bg-[#F9F6F0]')}>
                  <span className={cx('grid size-6 place-items-center rounded-full font-mono text-[11.5px]', isToday ? 'bg-terra text-white' : c.inMonth ? 'text-ink' : 'text-faint')}>{c.day}</span>
                  <span className="hidden w-full min-w-0 flex-col gap-1 md:flex">
                    {evs.slice(0, 2).map((e) => <span key={e.id} className={cx('block w-full truncate rounded-[5px] px-1.5 py-0.5 text-[11px] leading-tight', TYPE[e.type].pill)}>{e.time ? `${e.time} ` : ''}{e.title}</span>)}
                    {evs.length > 2 && <span className="px-1 font-mono text-[10.5px] text-muted">+{evs.length - 2} more</span>}
                  </span>
                  <span className="flex gap-0.5 md:hidden">{evs.map((e) => <span key={e.id} className={cx('size-1.5 rounded-full', TYPE[e.type].dot)} aria-hidden />)}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <aside className="space-y-5" aria-label="Agenda">
          <Card className="p-5">
            <Micro as="p">{sel === TODAY ? 'Today' : 'Agenda'}</Micro>
            <h2 className="mt-1 font-serif text-[24px]">{new Date(sel + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })}</h2>
            {selEvents.length === 0 ? (
              <div className="mt-4 dashed-box px-4 py-6 text-center"><p className="text-[13.5px] text-muted">Nothing scheduled.</p><Button size="sm" className="mt-3" icon={Plus} onClick={() => { setForm({ ...form, date: sel }); setAddOpen(true); }}>Add event</Button></div>
            ) : (
              <ul className="mt-4 space-y-3">
                {selEvents.map((e) => (
                  <li key={e.id} className="rounded-xl border border-line bg-white p-3.5">
                    <div className="flex items-center justify-between gap-2"><Tag tone={TYPE[e.type].tone}>{TYPE[e.type].label}</Tag><span className="font-mono text-[11px] text-muted">{e.time ?? 'All day'}</span></div>
                    <p className="mt-2 text-[14px] font-medium leading-snug">{e.title}</p>
                    {(e.company || e.note) && <p className="mt-0.5 text-[12.5px] text-muted">{[e.company, e.note].filter(Boolean).join(' · ')}</p>}
                    <button type="button" onClick={() => onNavigate(TYPE[e.type].target)} className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-terra hover:underline">{TYPE[e.type].action}<ArrowRight className="size-3.5" aria-hidden /></button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <div>
            <h3 className="font-serif text-[19px]">Coming up</h3>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {upcoming.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => { setSel(e.date); const d = new Date(e.date + 'T12:00:00Z'); setYm({ y: d.getUTCFullYear(), m: d.getUTCMonth() }); }} className="flex w-full items-center gap-3 py-2.5 text-left transition-colors duration-150 hover:bg-soft/40">
                    <span className={cx('size-1.5 shrink-0 rounded-full', TYPE[e.type].dot)} aria-hidden />
                    <span className="w-[86px] shrink-0 font-mono text-[11px] text-muted">{fmtDate(e.date, true)}</span>
                    <span className="min-w-0 flex-1 truncate text-[13px]">{e.title}</span>
                    <span className="sr-only">{TYPE[e.type].label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add event"
        footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button><Button variant="primary" disabled={!form.title.trim()} onClick={() => {
          setEvents([...events, { id: `c${Date.now()}`, date: form.date, time: form.time || undefined, title: form.title.trim(), type: form.type }]);
          setSel(form.date); setAddOpen(false); setForm({ ...form, title: '' }); onToast(`${TYPE[form.type].label} added for ${fmtDate(form.date, true)}`);
        }}>Add to calendar</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="ev-t" className="sm:col-span-2"><input id="ev-t" className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Verdant · Round 2" /></Field>
          <Field label="Type" htmlFor="ev-ty"><select id="ev-ty" className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CalEvent['type'] })}>{(Object.keys(TYPE) as CalEvent['type'][]).map((t) => <option key={t} value={t}>{TYPE[t].label}</option>)}</select></Field>
          <Field label="Date" htmlFor="ev-d"><input id="ev-d" type="date" className="field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Time" htmlFor="ev-ti" hint="Leave empty for all-day"><input id="ev-ti" type="time" className="field" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
          <Field label="Reminder" htmlFor="ev-r"><select id="ev-r" className="field" defaultValue="1d"><option value="1h">1 hour before</option><option value="1d">1 day before</option><option value="none">No reminder</option></select></Field>
        </div>
      </Modal>
    </div>
  );
}
