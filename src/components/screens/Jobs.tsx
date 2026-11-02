'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, BellPlus, Bookmark, BookmarkCheck, CalendarClock, Check, ChevronDown, Copy, GraduationCap, MapPin, Plus, Search,
  Share2, SlidersHorizontal, Sparkles, Wallet, X,
} from 'lucide-react';
import type { Job, JobFilters, Posted, RoleCat, SortKey, UIData } from '@/lib/view-models';
import { previewJobs } from '@/lib/preview';
import {
  Button, Chip, Dropdown, EmptyState, ErrorState, Field, MatchScore, MenuItem, Micro, Modal, Monogram, RemovableChip, Segmented,
  Skeleton, SkillDots, Tag, Toggle, cx,
} from '../ui';
import { C, HBar } from '../charts';
import { fmtPosted, gainOf, tierOf } from '@/lib/view-models';

const ROLES: RoleCat[] = ['Frontend', 'Full-stack', 'Backend', 'Data', 'QA / DevOps', 'Mobile'];
const LOCS = ['Remote', 'Bengaluru', 'Hyderabad', 'Pune', 'Gurugram', 'Mumbai', 'Chennai', 'Noida'];
const LEVELS = ['Intern', 'Entry'];
const POSTED: { value: Posted; label: string }[] = [
  { value: 'any', label: 'Any time' },
  { value: '24h', label: 'Last 24h' },
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last 7 days' },
];
const SORTS: { value: SortKey; label: string }[] = [
  { value: 'best', label: 'Best match' },
  { value: 'newest', label: 'Newest' },
  { value: 'gain', label: 'Biggest gain' },
];

export interface JobsScreenProps {
  data: UIData;
  state: 'ready' | 'loading' | 'empty' | 'error';
  mode: 'all' | 'matches';
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  focusJobId?: string | null;
  onRetry?: () => void;
  onToast?: (msg: string) => void;
  onNavigate?: (screen: string, params?: { jobId?: string; query?: string }) => void;
}

export function JobsScreen({
  data,
  state,
  mode,
  savedIds,
  onToggleSave,
  focusJobId = null,
  onRetry = () => undefined,
  onToast = () => undefined,
  onNavigate,
}: JobsScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigate = onNavigate ?? ((s, p) => {
    if (s === 'resume') router.push(p?.jobId ? `/resume?jobId=${p.jobId}` : '/resume');
    else if (s === 'jobs') router.push('/jobs');
    else if (s === 'matches') router.push('/recommended');
    else router.push(`/${s}`);
  });

  const isM = mode === 'matches';
  const DEF: JobFilters = useMemo(() => ({
    role: null,
    location: null,
    level: null,
    min: isM ? 50 : 0,
    remote: false,
    posted: 'any',
    sort: isM ? 'gain' : 'best',
  }), [isM]);

  // Read initial values from URL query parameters (or focusJobId)
  const initialJobId = searchParams.get('job') || searchParams.get('jobId') || focusJobId;
  const initialQ = searchParams.get('q') || '';
  const initialRole = (searchParams.get('role') as RoleCat) || null;
  const initialLoc = searchParams.get('location') || null;
  const initialLevel = searchParams.get('level') || null;
  const initialMinRaw = searchParams.get('min');
  const initialMin = initialMinRaw !== null && !isNaN(Number(initialMinRaw)) ? Number(initialMinRaw) : DEF.min;
  const initialRemote = searchParams.get('remote') === 'true';
  const initialPosted = (searchParams.get('posted') as Posted) || 'any';
  const initialSort = (searchParams.get('sort') as SortKey) || DEF.sort;

  const [f, setF] = useState<JobFilters>({
    role: initialRole,
    location: initialLoc,
    level: initialLevel,
    min: initialMin,
    remote: initialRemote,
    posted: initialPosted,
    sort: initialSort,
  });
  const [query, setQuery] = useState(initialQ);
  const [selId, setSelId] = useState<string | null>(initialJobId);
  const [mobileDetail, setMobileDetail] = useState(!!initialJobId);
  const [sheet, setSheet] = useState(false);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  // URL state synchronization
  const syncUrl = useCallback((currentSelId: string | null, currentF: JobFilters, currentQ: string) => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (currentSelId) {
      p.set('job', currentSelId);
    } else {
      p.delete('job');
    }
    p.delete('jobId');

    if (currentQ.trim()) p.set('q', currentQ.trim());
    else p.delete('q');

    if (currentF.role) p.set('role', currentF.role);
    else p.delete('role');

    if (currentF.location) p.set('location', currentF.location);
    else p.delete('location');

    if (currentF.level) p.set('level', currentF.level);
    else p.delete('level');

    if (currentF.min !== DEF.min && currentF.min > 0) p.set('min', String(currentF.min));
    else p.delete('min');

    if (currentF.remote) p.set('remote', 'true');
    else p.delete('remote');

    if (currentF.posted !== 'any') p.set('posted', currentF.posted);
    else p.delete('posted');

    if (currentF.sort !== DEF.sort) p.set('sort', currentF.sort);
    else p.delete('sort');

    const search = p.toString();
    const target = search ? `${window.location.pathname}?${search}` : window.location.pathname;
    window.history.replaceState(null, '', target);
  }, [DEF]);

  const set = (p: Partial<JobFilters>) => {
    setF((prev) => {
      const next = { ...prev, ...p };
      syncUrl(selId, next, query);
      return next;
    });
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    syncUrl(selId, f, val);
  };

  const handleSelectJob = (id: string) => {
    setSelId(id);
    setMobileDetail(true);
    syncUrl(id, f, query);
  };

  const list = useMemo(() => {
    const ql = query.trim().toLowerCase();
    const r = data.jobs.filter((j) => (!f.role || j.role === f.role) && (!f.location || j.city === f.location)
      && (!f.level || (f.level === 'Intern' ? j.level === 'Intern' : j.level.startsWith('Entry'))) && j.score >= f.min && (!f.remote || j.mode === 'Remote')
      && (f.posted === 'any' || j.postedHours <= (f.posted === '24h' ? 23 : f.posted === '3d' ? 72 : 168))
      && (!ql || `${j.title} ${j.company} ${j.skills.map((s) => s.name).join(' ')}`.toLowerCase().includes(ql)));
    const by: Record<SortKey, (a: Job, b: Job) => number> = {
      best: (a, b) => b.score - a.score,
      newest: (a, b) => a.postedHours - b.postedHours || b.score - a.score,
      gain: (a, b) => gainOf(b).marks - gainOf(a).marks || b.score - a.score,
    };
    return r.sort(by[f.sort]);
  }, [data.jobs, f, query]);

  const selected = (selId && data.jobs.find((j) => j.id === selId)) || list[0] || null;
  const chips: { label: string; clear: () => void }[] = [];
  if (f.role) chips.push({ label: `Role: ${f.role}`, clear: () => set({ role: null }) });
  if (f.location) chips.push({ label: `Location: ${f.location}`, clear: () => set({ location: null }) });
  if (f.level) chips.push({ label: `Level: ${f.level}`, clear: () => set({ level: null }) });
  if (f.min !== DEF.min) chips.push({ label: `Min match: ${f.min}`, clear: () => set({ min: DEF.min }) });
  if (f.remote) chips.push({ label: 'Remote only', clear: () => set({ remote: false }) });
  if (f.posted !== 'any') chips.push({ label: `Posted: ${POSTED.find((p) => p.value === f.posted)?.label}`, clear: () => set({ posted: 'any' }) });
  if (query) chips.push({ label: `“${query}”`, clear: () => handleQueryChange('') });
  const describe = chips.length ? chips.map((c) => c.label.replace(/^.*?: /, '')).join(' · ') : 'All jobs';
  const total = isM ? data.jobs.filter((j) => j.score >= 50).length : (data.stats.jobsIndexed || data.jobs.length);

  if (state === 'loading') return <JobsSkeleton />;
  if (state === 'error') return <div className="p-4 md:p-8"><ErrorState title="Jobs didn’t load" body="The job index is taking too long to respond. Your saved jobs and filters are kept." onRetry={onRetry} /></div>;
  if (state === 'empty') {
    return (
      <div className="p-4 md:p-8">
        <Header isM={isM} total={0} data={data} onApplySearch={() => undefined} onAlert={() => undefined} />
        <EmptyState className="mt-8" icon={Search} title={isM ? 'No matches yet' : 'No jobs indexed yet'} body="We score jobs once we can read your resume. Upload it and we’ll fetch and score today’s listings in about a minute."
          action={<><Button variant="primary" onClick={() => navigate('resume')}>Upload resume</Button><Button onClick={() => onToast('Sync started: we’ll notify you when jobs arrive')}>Sync jobs</Button></>} />
      </div>
    );
  }

  const filterPill = (label: string, value: string | null, options: string[], onPick: (v: string | null) => void, anyLabel: string) => (
    <Dropdown key={label} panelClassName="w-52"
      button={({ open, toggle }) => (
        <button type="button" onClick={toggle} aria-expanded={open} aria-haspopup="menu"
          className={cx('inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors duration-150', value ? 'border-ink bg-white text-ink' : 'border-line bg-white text-ink shadow-pill hover:border-border-subtle')}>
          <span className="text-muted">{label}</span>{value && <span className="font-medium">{value}</span>}<ChevronDown className="size-3.5 text-muted" aria-hidden />
        </button>
      )}>
      {(close) => (
        <div role="menu" className="max-h-72 overflow-y-auto">
          <MenuItem active={!value} onClick={() => { onPick(null); close(); }}>{anyLabel}</MenuItem>
          {options.map((o) => <MenuItem key={o} active={value === o} onClick={() => { onPick(o); close(); }} hint={value === o ? <Check className="size-3.5" aria-hidden /> : undefined}>{o}</MenuItem>)}
        </div>
      )}
    </Dropdown>
  );

  return (
    <div className="md:flex md:h-full md:flex-col overflow-hidden">
      <div className="shrink-0 border-b border-line px-4 pb-3 pt-5 md:px-8 md:pt-6">
        <Header isM={isM} total={total} data={data} onApplySearch={(p) => { set({ ...p }); onToast('Saved search applied'); }} onAlert={() => onToast(`Alert created: ${describe} · daily digest`)} />
        <div className="mt-4 flex flex-wrap items-center gap-2 md:flex-nowrap">
          <div className="relative w-full md:w-[240px] md:shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
            <label htmlFor="job-q" className="sr-only">Search jobs</label>
            <input id="job-q" value={query} onChange={(e) => handleQueryChange(e.target.value)} placeholder="Title, company or skill" className="field !h-8 !rounded-full !py-0 pl-9 text-[13px]" />
          </div>
          <div className="scroll-thin hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto md:flex">
            {filterPill('Role', f.role, ROLES, (v) => set({ role: v as RoleCat | null }), 'Any role')}
            {filterPill('Location', f.location, LOCS, (v) => set({ location: v }), 'Anywhere')}
            {filterPill('Level', f.level, LEVELS, (v) => set({ level: v }), 'Any level')}
            <Dropdown panelClassName="w-64"
              button={({ open, toggle }) => (
                <button type="button" onClick={toggle} aria-expanded={open} className={cx('inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors duration-150', f.min !== DEF.min ? 'border-ink bg-white' : 'border-line bg-white shadow-pill hover:border-border-subtle')}>
                  <span className="text-muted">Min match</span><span className="font-mono text-[12px] font-medium">{f.min === 0 ? 'Any' : `${f.min}+`}</span><ChevronDown className="size-3.5 text-muted" aria-hidden />
                </button>
              )}>
              {() => <MinSlider value={f.min} onChange={(v) => set({ min: v })} count={list.length} />}
            </Dropdown>
            <Chip active={f.remote} onClick={() => set({ remote: !f.remote })} className="!h-8 !py-0">Remote</Chip>
            {filterPill('Posted', f.posted === 'any' ? null : POSTED.find((p) => p.value === f.posted)!.label, POSTED.slice(1).map((p) => p.label), (v) => set({ posted: POSTED.find((p) => p.label === v)?.value ?? 'any' }), 'Any time')}
          </div>
          <Button size="sm" icon={SlidersHorizontal} className="md:hidden" onClick={() => setSheet(true)}>Filters{chips.length ? ` · ${chips.length}` : ''}</Button>
          <label htmlFor="job-sort" className="sr-only">Sort</label>
          <select id="job-sort" value={f.sort} onChange={(e) => set({ sort: e.target.value as SortKey })} className="field !h-8 min-w-0 flex-1 !rounded-full !py-0 pr-8 text-[13px] md:w-auto md:flex-none">
            {SORTS.map((s) => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
          </select>
        </div>
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((c) => <RemovableChip key={c.label} onRemove={c.clear}>{c.label}</RemovableChip>)}
            <button type="button" onClick={() => { setF(DEF); setQuery(''); syncUrl(selId, DEF, ''); }} className="text-[12.5px] text-terra hover:underline">Clear all</button>
          </div>
        )}
      </div>

      <div className="md:flex md:min-h-0 md:flex-1">
        <div className={cx('md:w-[480px] md:shrink-0 md:overflow-y-auto md:border-r md:border-line scroll-thin', mobileDetail && 'hidden md:block')}>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-canvas px-4 py-2 md:px-5">
            <span className="font-mono text-[11px] text-muted">Showing {list.length} of {total}</span>
            <span className="font-mono text-[11px] text-faint">{SORTS.find((s) => s.value === f.sort)?.label}</span>
          </div>
          {list.length === 0 ? (
            <div className="p-5"><EmptyState compact icon={SlidersHorizontal} title="No jobs match these filters" body="Try lowering the minimum match or removing a filter." action={<Button size="sm" onClick={() => { setF(DEF); setQuery(''); syncUrl(selId, DEF, ''); }}>Clear filters</Button>} /></div>
          ) : (
            <ul aria-label="Job results">
              {list.map((j) => (
                <Row key={j.id} job={j} isM={isM} selected={selected?.id === j.id} saved={savedIds.has(j.id)} applied={applied.has(j.id)}
                  onSelect={() => handleSelectJob(j.id)}
                  onSave={() => { onToggleSave(j.id); onToast(savedIds.has(j.id) ? `Removed ${j.company} from saved` : `Saved ${j.title} at ${j.company}`); }} />
              ))}
            </ul>
          )}
        </div>
        <div className={cx('scroll-thin min-w-0 md:flex-1 md:overflow-y-auto', !mobileDetail && 'hidden md:block')}>
          {selected ? (
            <Detail key={selected.id} job={selected} data={data} saved={savedIds.has(selected.id)} applied={applied.has(selected.id)}
              onBack={() => setMobileDetail(false)} onSelect={(id) => handleSelectJob(id)} onNavigate={navigate} onToast={onToast}
              onSave={() => { onToggleSave(selected.id); onToast(savedIds.has(selected.id) ? 'Removed from saved' : 'Saved'); }}
              onApplied={() => setApplied(new Set([...applied, selected.id]))} />
          ) : <div className="p-8"><EmptyState compact title="Select a job" body="Pick a job on the left to see its working." /></div>}
        </div>
      </div>

      <Modal open={sheet} onClose={() => setSheet(false)} title="Filters" footer={<><Button variant="ghost" onClick={() => setF(DEF)}>Clear</Button><Button variant="primary" onClick={() => setSheet(false)}>Show {list.length} jobs</Button></>}>
        <div className="space-y-5">
          <Field label="Role"><div className="flex flex-wrap gap-2">{ROLES.map((r) => <Chip key={r} active={f.role === r} onClick={() => set({ role: f.role === r ? null : r })}>{r}</Chip>)}</div></Field>
          <Field label="Location"><div className="flex flex-wrap gap-2">{LOCS.slice(0, 6).map((r) => <Chip key={r} active={f.location === r} onClick={() => set({ location: f.location === r ? null : r })}>{r}</Chip>)}</div></Field>
          <Field label="Level"><div className="flex flex-wrap gap-2">{LEVELS.map((r) => <Chip key={r} active={f.level === r} onClick={() => set({ level: f.level === r ? null : r })}>{r}</Chip>)}</div></Field>
          <MinSlider value={f.min} onChange={(v) => set({ min: v })} count={list.length} />
          <div className="flex items-center justify-between"><span className="text-[13px] font-medium">Remote only</span><Toggle checked={f.remote} onChange={(v) => set({ remote: v })} label="Remote only" /></div>
          <Field label="Posted"><Segmented label="Posted" value={f.posted} onChange={(v) => set({ posted: v })} options={POSTED.map((p) => ({ value: p.value, label: p.label.replace('Last ', '') }))} /></Field>
        </div>
      </Modal>
    </div>
  );
}

function Header({ isM, total, data, onApplySearch, onAlert }: { isM: boolean; total: number; data: UIData; onApplySearch: (p: Partial<JobFilters>) => void; onAlert: () => void }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-baseline gap-3">
        <h1 className="font-serif text-[34px] leading-none md:text-[38px]">{isM ? 'Matches' : 'Jobs'}</h1>
        <span className="font-mono text-[12px] text-muted">{total} {isM ? 'jobs ≥ 50' : 'jobs'} · {data.stats?.newToday ?? 0} new today</span>
      </div>
      <div className="flex items-center gap-2">
        {data.savedSearches && data.savedSearches.length > 0 && (
          <Dropdown align="right" panelClassName="w-64"
            button={({ open, toggle }) => <Button size="sm" iconRight={ChevronDown} onClick={toggle} aria-expanded={open}>Saved searches</Button>}>
            {(close) => (
              <div role="menu">
                <Micro as="p" className="px-2.5 pb-1 pt-1.5">Your searches</Micro>
                {data.savedSearches.map((s) => <MenuItem key={s.id} onClick={() => { onApplySearch(s.filters); close(); }}>{s.name}</MenuItem>)}
              </div>
            )}
          </Dropdown>
        )}
        <Button size="sm" variant="primary" icon={BellPlus} onClick={onAlert}>Create alert</Button>
      </div>
    </div>
  );
}

function MinSlider({ value, onChange, count }: { value: number; onChange: (v: number) => void; count: number }) {
  const t = tierOf(value);
  return (
    <div className="p-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor="min-match" className="text-[13px] font-medium">Minimum match</label>
        <span className="font-mono text-[12px]"><span className="font-serif text-[18px]">{value}</span>/100 · {t.word}</span>
      </div>
      <input id="min-match" type="range" min={0} max={90} step={5} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-3 w-full" />
      <div className="mt-1 flex justify-between font-mono text-[10px] text-faint"><span>0</span><span>30</span><span>50</span><span>70</span><span>90</span></div>
      <p className="mt-2 text-[12px] text-muted">{count} jobs at this threshold</p>
    </div>
  );
}

function Row({ job, isM, selected, saved, applied, onSelect, onSave }: { job: Job; isM: boolean; selected: boolean; saved: boolean; applied: boolean; onSelect: () => void; onSave: () => void }) {
  const have = job.skills.filter((s) => s.have).length;
  const missing = job.skills.filter((s) => !s.have).sort((a, b) => b.marks - a.marks);
  const g = gainOf(job);
  return (
    <li className={cx('relative border-b border-line transition-colors duration-150', selected ? 'bg-soft' : 'hover:bg-soft')}>
      {selected && <span className="absolute inset-y-0 left-0 w-[2px] bg-terra" aria-hidden />}
      <button type="button" onClick={onSelect} aria-current={selected ? 'true' : undefined} aria-label={`${job.title} at ${job.company}, match ${job.score}`}
        className="flex min-h-[84px] w-full items-center gap-4 py-3 pl-4 pr-14 text-left md:pl-5">
        <div className="w-[60px] shrink-0"><MatchScore score={job.score} size="sm" /></div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-serif text-[16px] leading-tight text-ink">{job.title}</div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[12.5px] text-muted">
            <Monogram name={job.company} size={16} />
            <span className="truncate"><span className="text-ink">{job.company}</span> · {job.city === 'Remote' ? 'Remote' : job.city} · {job.level.split(' ·')[0]}</span>
            {applied && <Tag tone="green" className="ml-1">Applied</Tag>}
          </div>
          <div className="mt-1.5 flex min-w-0 items-center gap-2 text-[11.5px]">
            <SkillDots skills={job.skills} />
            <span className="shrink-0 font-mono text-muted">{have}/{job.skills.length} skills</span>
            <span className="truncate text-faint">{isM ? <span className="text-terra">+{g.marks} with {g.skill}</span> : `· ${missing.slice(0, 2).map((m) => m.name).join(', ')}`}</span>
          </div>
        </div>
      </button>
      <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
        <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? `Remove ${job.title} from saved` : `Save ${job.title}`}
          className="grid size-7 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-white hover:text-ink">
          {saved ? <BookmarkCheck className="size-4 text-ink" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
        </button>
        <span className="font-mono text-[10.5px] text-faint">{fmtPosted(job.postedHours).replace(' ago', '')}</span>
      </div>
    </li>
  );
}

function highlight(text: string, kw: string) {
  const i = text.toLowerCase().indexOf(kw.toLowerCase());
  if (i < 0 || !kw) return text;
  return <>{text.slice(0, i)}<mark className="rounded bg-violet/10 px-0.5 text-violet">{text.slice(i, i + kw.length)}</mark>{text.slice(i + kw.length)}</>;
}

function Detail({ job, data, saved, applied, onBack, onSelect, onSave, onApplied, onNavigate, onToast }: { job: Job; data: UIData; saved: boolean; applied: boolean; onBack: () => void; onSelect: (id: string) => void; onSave: () => void; onApplied: () => void; onNavigate: (screen: string, params?: { jobId?: string }) => void; onToast: (m: string) => void }) {
  const [preview, setPreview] = useState<string[]>([]);
  const [applyOpen, setApplyOpen] = useState(false);
  const [resume, setResume] = useState('v5');
  const matched = job.skills.filter((s) => s.have);
  const missing = job.skills.filter((s) => !s.have).sort((a, b) => b.marks - a.marks);
  const add = missing.filter((s) => preview.includes(s.name)).reduce((a, s) => a + s.marks, 0);
  const total = Math.min(100, job.score + add);

  const previewTailor = previewJobs.find((p) => p.role === job.role)?.tailor || previewJobs[0].tailor;
  const tailorItems = job.tailor && job.tailor.length > 0 ? job.tailor : previewTailor;

  const similarFromData = (data.jobs || []).filter((j) => j.id !== job.id && j.role === job.role);
  const similar = similarFromData.length > 0
    ? similarFromData.sort((a, b) => Math.abs(a.score - job.score) - Math.abs(b.score - job.score)).slice(0, 3)
    : previewJobs.filter((p) => p.id !== job.id).slice(0, 3);

  const rows: { k: string; v: number; max: number; why: string; add?: number }[] = [
    { k: 'Skills', v: job.marks.skills, max: 70, why: job.why.skills, add },
    { k: 'Role', v: job.marks.role, max: 15, why: job.why.role },
    { k: 'Location', v: job.marks.location, max: 10, why: job.why.location },
    { k: 'Experience', v: job.marks.experience, max: 5, why: job.why.experience },
  ];
  const closing = job.deadlineDays !== null && job.deadlineDays <= 3;

  return (
    <article className="mx-auto max-w-[860px] px-4 pb-16 pt-5 md:px-8 md:pt-7" aria-label={`${job.title} details`}>
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink md:hidden"><ArrowLeft className="size-4" aria-hidden />All jobs</button>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5"><Monogram name={job.company} size={36} /><div><div className="text-[14px] font-medium">{job.company}</div><div className="font-mono text-[11px] text-faint">Posted {fmtPosted(job.postedHours)} · via {data.source?.name ?? 'Direct Index'}</div></div></div>
          <h2 className="mt-3 font-serif text-[28px] leading-[1.15] tracking-[-0.01em] md:text-[32px]">{job.title}</h2>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden />{job.city === 'Remote' ? 'Remote' : `${job.city} · ${job.mode}`}</span>
            <span className="inline-flex items-center gap-1.5"><GraduationCap className="size-3.5" aria-hidden />{job.level}</span>
            <span className="inline-flex items-center gap-1.5"><Wallet className="size-3.5" aria-hidden />{job.stipend}</span>
            {job.deadlineDays !== null && <span className={cx('inline-flex items-center gap-1.5', closing && 'text-terra')}><CalendarClock className="size-3.5" aria-hidden />Closes in {job.deadlineDays} days</span>}
          </div>
        </div>
        <div className="w-full shrink-0 sm:w-[200px]">
          <MatchScore score={total} size="lg" />
          {add > 0 && <p className="mt-1.5 font-mono text-[11px] text-green">Preview: was {job.score} · +{add} marks</p>}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="primary" icon={applied ? Check : undefined} disabled={applied} onClick={() => setApplyOpen(true)}>{applied ? 'Applied' : 'Apply'}</Button>
        <Button icon={saved ? BookmarkCheck : Bookmark} onClick={onSave} aria-pressed={saved}>{saved ? 'Saved' : 'Save'}</Button>
        <Button icon={Share2} onClick={() => { if (typeof navigator !== 'undefined') navigator.clipboard?.writeText(window.location.href).catch(() => undefined); onToast('Link copied to clipboard'); }}>Share</Button>
      </div>

      <section className="mt-8" aria-labelledby="marks-h">
        <div className="flex items-end justify-between"><h3 id="marks-h" className="font-serif text-[21px]">Your marks</h3><span className="font-mono text-[11px] text-muted">Weights 70 · 15 · 10 · 5</span></div>
        <div className="mt-3 border-y border-line">
          {rows.map((r) => (
            <div key={r.k} className="grid grid-cols-[92px_1fr_76px] items-center gap-x-4 gap-y-1 border-b border-line py-3 last:border-0 md:grid-cols-[92px_1fr_160px_76px]">
              <span className="text-[13.5px] font-medium">{r.k}</span>
              <span className="col-span-2 row-start-2 text-[12.5px] text-muted md:col-span-1 md:row-start-auto">{r.why}</span>
              <div className="hidden md:block"><HBar value={r.v} max={r.max} extra={r.add} extraColor={C.green} color={C.ink} height={4} label={`${r.k} ${r.v} of ${r.max}`} /></div>
              <span className="col-start-3 row-start-1 text-right font-mono text-[12.5px] md:col-start-auto md:row-start-auto">
                {r.add ? <><span className="text-faint line-through">{r.v}</span> <span className="text-green">{r.v + r.add}</span></> : r.v}<span className="text-faint">/{r.max}</span>
              </span>
            </div>
          ))}
          <div className="grid grid-cols-[92px_1fr_76px] items-center gap-4 bg-warm-bg py-3 md:grid-cols-[92px_1fr_160px_76px]">
            <span className="micro pl-0 text-ink">Total</span><span className="text-[12.5px] text-muted">{tierOf(total).word} match{add > 0 ? ` (was ${tierOf(job.score).word.toLowerCase()})` : ''}</span>
            <span className="hidden md:block" /><span className="text-right font-mono text-[13px] font-medium">{total}<span className="text-faint">/100</span></span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2" aria-label="Skills">
        <div>
          <h3 className="font-serif text-[19px]">Matched skills <span className="font-mono text-[11px] text-muted">{matched.length}</span></h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {matched.map((s) => <li key={s.name} className="inline-flex items-center gap-1.5 rounded-full border border-green/25 bg-green/[0.07] px-2.5 py-1 text-[12.5px] text-ink"><Check className="size-3.5 text-green" aria-hidden />{s.name}<span className="font-mono text-[10.5px] text-muted">{s.marks}</span></li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-serif text-[19px]">Missing skills <span className="font-mono text-[11px] text-muted">{missing.length}</span></h3>
          <ul className="mt-3 space-y-1.5">
            {missing.map((s) => {
              const on = preview.includes(s.name);
              return (
                <li key={s.name} className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[13px]"><X className="size-3.5 text-terra" aria-hidden /><span>{s.name}</span><span className="sr-only">missing</span></span>
                  <button type="button" aria-pressed={on} onClick={() => setPreview(on ? preview.filter((x) => x !== s.name) : [...preview, s.name])}
                    className={cx('rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-colors duration-150', on ? 'border-green/40 bg-green/10 text-green' : 'border-line bg-white text-ink hover:border-border-subtle')}>
                    {on ? `✓ +${s.marks} marks` : `+${s.marks} marks`}
                  </button>
                </li>
              );
            })}
          </ul>
          {add > 0 && (
            <div className="mt-3 rounded-xl border border-green/25 bg-green/[0.06] p-3 text-[13px]">
              Learning {preview.join(' + ')} would take this to <b className="font-medium">{total}/100 ({tierOf(total).word})</b>.
              <button type="button" className="ml-1 text-terra hover:underline" onClick={() => onToast(`${preview.join(', ')} added to your learning plan`)}>Add to plan →</button>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="tailor-h">
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <h3 id="tailor-h" className="font-serif text-[21px]">Tailor resume</h3>
            <span className="font-mono text-[11px] text-faint">Preview data</span>
          </div>
          <Button size="sm" variant="ghost" iconRight={Sparkles} onClick={() => onNavigate('resume', { jobId: job.id })}>Open in Resume Studio</Button>
        </div>
        <p className="mt-1 text-[13px] text-muted">Rewrites use only what is already on your resume. Add skills only if you have used them.</p>
        <ol className="mt-3 space-y-3">
          {tailorItems.map((t, i) => (
            <li key={i} className="card p-4">
              <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><Tag category="RESUME">{t.section}</Tag><span className="font-mono text-[11px] text-muted">keyword · {t.keyword}</span></span>
                <button type="button" aria-label="Copy rewrite" onClick={() => { if (typeof navigator !== 'undefined') navigator.clipboard?.writeText(t.after).catch(() => undefined); onToast('Rewrite copied'); }} className="grid size-7 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-soft hover:text-ink"><Copy className="size-3.5" aria-hidden /></button>
              </div>
              <p className="mt-2.5 text-[13px] text-faint line-through"><span className="sr-only">Before: </span>{t.before}</p>
              <p className="mt-1 text-[13.5px] leading-snug text-ink"><span className="sr-only">After: </span>{highlight(t.after, t.keyword)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8"><h3 className="font-serif text-[21px]">About</h3><p className="mt-2 max-w-[68ch] text-[14.5px] leading-relaxed text-ink/85">{job.about}</p></section>

      <section className="mt-8">
        <h3 className="font-serif text-[21px]">Required skills</h3>
        <ul className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          {job.skills.map((s) => (
            <li key={s.name} className="flex items-center justify-between border-b border-line py-2 text-[13.5px]">
              <span className="inline-flex items-center gap-2">{s.have ? <Check className="size-3.5 text-green" aria-label="matched" /> : <X className="size-3.5 text-terra" aria-label="missing" />}{s.name}</span>
              <span className="font-mono text-[11.5px] text-muted">{s.marks} marks</span>
            </li>
          ))}
        </ul>
      </section>

      {similar.length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline gap-2">
            <h3 className="font-serif text-[21px]">Similar jobs</h3>
            <span className="font-mono text-[11px] text-faint">Preview data</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {similar.map((s) => (
              <button key={s.id} type="button" onClick={() => onSelect(s.id)} className="card p-4 text-left transition-colors duration-150 hover:border-border-subtle">
                <div className="flex items-center gap-1.5 text-[12px] text-muted"><Monogram name={s.company} size={16} /><span className="truncate">{s.company}</span></div>
                <div className="mt-1.5 line-clamp-2 font-serif text-[15px] leading-snug">{s.title}</div>
                <div className="mt-2"><MatchScore score={s.score} size="xs" /></div>
              </button>
            ))}
          </div>
        </section>
      )}

      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title={`Apply to ${job.company}`} eyebrow={job.title}
        footer={<><Button variant="ghost" onClick={() => setApplyOpen(false)}>Cancel</Button><Button variant="primary" icon={Check} onClick={() => { onApplied(); setApplyOpen(false); onToast(`Applied to ${job.company} · added to Applications`); }}>Mark as applied</Button></>}>
        <div className="space-y-4">
          <p className="text-[14px] text-muted">We’ll open the company’s application page and track this in your board. Pick the resume you’re sending.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[{ id: 'v5', name: 'resume_v5.pdf', ats: 72 }, { id: 'v5-data', name: 'resume_v5-data.pdf', ats: 66 }].map((r) => (
              <label key={r.id} className={cx('flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors duration-150', resume === r.id ? 'border-ink bg-white' : 'border-line hover:border-border-subtle')}>
                <input type="radio" name="resume" checked={resume === r.id} onChange={() => setResume(r.id)} />
                <span className="flex-1 text-[13.5px]">{r.name}</span><span className="font-mono text-[11px] text-muted">ATS {r.ats}</span>
              </label>
            ))}
          </div>
          <Field label="Note to self (optional)" htmlFor="apply-note"><textarea id="apply-note" rows={2} className="field" placeholder="e.g. Referred by Priya, mention the fest site" /></Field>
          <div className="flex items-center gap-2 rounded-xl bg-soft px-3 py-2.5 text-[12.5px] text-muted"><Plus className="size-3.5" aria-hidden />A follow-up reminder will be set for 7 days from today.</div>
        </div>
      </Modal>
    </article>
  );
}

function JobsSkeleton() {
  return (
    <div className="md:flex md:h-full md:flex-col" aria-busy="true" aria-label="Loading jobs">
      <div className="space-y-4 border-b border-line px-4 pb-4 pt-6 md:px-8">
        <Skeleton className="h-9 w-48" />
        <div className="flex gap-2">{Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}</div>
      </div>
      <div className="md:flex md:min-h-0 md:flex-1">
        <div className="md:w-[480px] md:border-r md:border-line">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="flex h-[84px] items-center gap-4 border-b border-line px-5"><Skeleton className="h-11 w-14" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-2 w-1/3" /></div></div>)}
        </div>
        <div className="hidden flex-1 space-y-4 p-8 md:block"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-32 w-full rounded-2xl" /></div>
      </div>
    </div>
  );
}

