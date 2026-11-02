'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CornerDownLeft,
  Flame,
  Plus,
  Search,
  Sparkles,
  Target,
  Upload,
  X,
} from 'lucide-react';
import type { AiAnswer, AiCard } from '@/lib/assistant';
import { answer } from '@/lib/assistant';
import type { UIData } from '@/lib/view-models';
import { CAT_TONE, fmtDate, fmtPosted } from '@/lib/view-models';
import { histogram } from '@/lib/insights';
import { useGSAP, gsap } from '@/lib/gsap';
import {
  Button,
  Card,
  Dot,
  ErrorState,
  MatchScore,
  Micro,
  Modal,
  Monogram,
  SectionTitle,
  Skeleton,
  SkillDots,
  StatusBadge,
  TONES,
  Tag,
  cx,
} from '../ui';
import {
  BarChart,
  C,
  ChartCard,
  ChartEmpty,
  Funnel,
  HBar,
  Heatmap,
  LineChart,
  Radar,
  Ring,
  SeriesKey,
  Sparkline,
  TipRow,
} from '../charts';

export interface OverviewScreenProps {
  data: UIData;
  state: 'ready' | 'loading' | 'empty' | 'error';
  savedCount?: number;
  onNavigate?: (screen: string, params?: { jobId?: string; query?: string }) => void;
  onToast?: (msg: string) => void;
  onRetry?: () => void;
}

export function OverviewScreen({
  data,
  state,
  savedCount = 0,
  onNavigate,
  onToast = () => undefined,
  onRetry = () => undefined,
}: OverviewScreenProps) {
  const router = useRouter();
  const navigate = onNavigate ?? ((screen, params) => {
    if (params?.jobId) {
      router.push(`/${screen}?jobId=${encodeURIComponent(params.jobId)}`);
    } else if (params?.query) {
      router.push(`/${screen}?q=${encodeURIComponent(params.query)}`);
    } else {
      router.push(`/${screen}`);
    }
  });

  const [scoringOpen, setScoringOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth entrance stagger for dashboard elements
  useGSAP(
    () => {
      if (!containerRef.current || state === 'loading') return;

      gsap.from('.dash-fade-in', {
        y: 24,
        opacity: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power2.out',
      });
    },
    { scope: containerRef, dependencies: [state] }
  );

  if (state === 'loading') return <OverviewSkeleton />;
  const empty = state === 'empty';

  return (
    <div ref={containerRef} className="space-y-10">
      <Greeting data={data} empty={empty} onNavigate={navigate} />
      {data.nextBestAction && (
        <Card className="dash-fade-in flex flex-col gap-4 border-terra/30 bg-terra/[0.04] p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="micro flex items-center gap-1.5 text-terra">
              <Sparkles className="size-3.5" aria-hidden />
              <span>Next best action</span>
            </div>
            <h2 className="mt-1 font-serif text-[18px] font-normal text-ink">{data.nextBestAction.title}</h2>
            <p className="mt-0.5 text-[13.5px] text-muted">{data.nextBestAction.description}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            iconRight={ArrowRight}
            className="shrink-0 self-start sm:self-center shadow-sm"
            onClick={() => navigate(data.nextBestAction!.target)}
          >
            {data.nextBestAction.action}
          </Button>
        </Card>
      )}
      {state === 'error' ? (
        <ErrorState
          title="We couldn’t load your overview"
          body="The scoring service didn’t respond. Your applications and resume are safe. Retry, or open Jobs directly."
          onRetry={onRetry}
        />
      ) : (
        <>
          <div className="dash-fade-in">
            <KpiRow data={data} empty={empty} savedCount={savedCount} onNavigate={navigate} />
          </div>
          <div className="dash-fade-in">
            <CommandCard data={data} onNavigate={navigate} />
          </div>
          <div className="dash-fade-in grid gap-10 xl:grid-cols-[2fr_1fr] xl:gap-12">
            <Attention data={data} empty={empty} onNavigate={navigate} onToast={onToast} />
            <RightRail data={data} empty={empty} onScoring={() => setScoringOpen(true)} />
          </div>
          <div className="dash-fade-in">
            <Analytics data={data} empty={empty} onNavigate={navigate} onToast={onToast} />
          </div>
          <div className="dash-fade-in grid gap-10 xl:grid-cols-[1.55fr_1fr]">
            <TopMatches data={data} empty={empty} onNavigate={navigate} />
            <RecentApps data={data} empty={empty} onNavigate={navigate} />
          </div>
        </>
      )}
      <ScoringModal open={scoringOpen} onClose={() => setScoringOpen(false)} data={data} />
    </div>
  );
}

function Greeting({
  data,
  empty,
  onNavigate,
}: {
  data: UIData;
  empty: boolean;
  onNavigate: (s: string) => void;
}) {
  return (
    <div className="dash-fade-in relative overflow-hidden rounded-3xl border border-line bg-card shadow-card">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80"
          alt="Modern tech workspace"
          fill
          sizes="100vw"
          className="size-full object-cover opacity-18 filter contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/95 to-canvas/80" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="micro flex flex-wrap items-center gap-x-2">
            <span>{data.today?.label ?? 'Today'}</span>
            <span aria-hidden className="text-faint">·</span>
            {empty ? (
              <span>Let’s set up your cockpit</span>
            ) : (
              <span className="flex items-center gap-1.5 text-terra">
                <Dot tone="terra" />
                {data.stats.strong} new strong matches today
              </span>
            )}
            <span aria-hidden className="text-faint">·</span>
            <span className="font-mono text-[11px] text-muted">ATS {data.stats.ats}/100</span>
          </p>
          <h1 className="mt-3 font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.02em] md:text-[44px]">
            {empty ? `Welcome, ${data.user.first}.` : `Good morning, ${data.user.first}.`}
          </h1>
          <p className="mt-2 text-[15.5px] leading-relaxed text-muted">
            {empty
              ? 'Upload your resume and every indexed tech job gets a transparent 100-point match breakdown.'
              : `Here’s what needs your attention today across ${data.stats.jobsIndexed} indexed listings.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white/80 px-3.5 font-mono text-[11px] text-muted backdrop-blur-sm">
            <Dot tone={empty ? 'faint' : 'green'} />
            {empty ? 'Waiting for first sync' : `Synced ${data.source.synced}`}
          </span>
          <Button icon={Upload} onClick={() => onNavigate('resume')} className="bg-white/85 shadow-sm hover:bg-white">
            Upload resume
          </Button>
          <Button variant="primary" icon={Search} onClick={() => onNavigate('jobs')} className="shadow-md">
            Find jobs
          </Button>
        </div>
      </div>
    </div>
  );
}

function KpiRow({
  data,
  empty,
  savedCount,
  onNavigate,
}: {
  data: UIData;
  empty: boolean;
  savedCount: number;
  onNavigate: (s: string) => void;
}) {
  const s = data.stats;
  const kpis: {
    label: string;
    tone: 'amber' | 'blue' | 'terra' | 'ink' | 'violet';
    status: string;
    statusTone: 'green' | 'amber';
    value: number;
    helper: string;
    spark: number[];
    target: string;
  }[] = [
    {
      label: 'Applications sent',
      tone: 'amber',
      status: 'Live',
      statusTone: 'green',
      value: s.applications,
      helper: `${s.thisWeek} this week · goal ${s.weeklyGoal}`,
      spark: s.weekly,
      target: 'applications',
    },
    {
      label: 'Strong matches',
      tone: 'blue',
      status: `+${s.strong} new`,
      statusTone: 'green',
      value: s.strong,
      helper: `Scoring 70+ of ${s.jobsIndexed} jobs`,
      spark: s.strongSpark,
      target: 'recommended',
    },
    {
      label: 'Average match',
      tone: 'terra',
      status: `+${s.avgMatchDelta} vs last week`,
      statusTone: 'green',
      value: s.avgMatch,
      helper: `Across ${s.jobsIndexed} indexed jobs`,
      spark: s.matchTrend,
      target: 'insights',
    },
    {
      label: 'Saved jobs',
      tone: 'ink',
      status: '2 closing soon',
      statusTone: 'amber',
      value: savedCount,
      helper: 'PixelWorks closes in 2 days',
      spark: s.savedSpark,
      target: 'saved',
    },
    {
      label: 'Resume ATS',
      tone: 'violet',
      status: `+${s.ats - s.atsPrev} vs last week`,
      statusTone: 'green',
      value: s.ats,
      helper: `Up from ${s.atsPrev} · resume v5`,
      spark: [58, 61, 64, 68, 72],
      target: 'resume',
    },
  ];

  return (
    <section aria-label="Key numbers" className="grid grid-cols-2 gap-px border-y border-line bg-line xl:grid-cols-5">
      {kpis.map((k, i) => (
        <button
          key={k.label}
          type="button"
          onClick={() => onNavigate(k.target)}
          className={cx(
            'group flex min-w-0 flex-col bg-canvas px-4 py-5 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-soft/50 hover:shadow-md md:px-5',
            i === 4 && 'col-span-2 xl:col-span-1'
          )}
        >
          <div className="flex min-h-[36px] flex-wrap content-start items-center justify-between gap-x-2 gap-y-1">
            <span className="micro flex items-center gap-2"><Dot tone={k.tone} />{k.label}</span>
            <span className={cx('font-mono text-[11px]', empty ? 'text-faint' : k.statusTone === 'green' ? 'text-green' : 'text-amber')}>
              {empty ? 'No data' : k.status}
            </span>
          </div>
          <div className="mt-3 font-serif text-[40px] leading-none text-ink tnum">{empty ? '–' : k.value}</div>
          <p className="mt-2 truncate text-[13px] text-muted">{empty ? 'Appears after your first upload' : k.helper}</p>
          <div className="mt-3 flex items-center justify-between">
            {empty ? (
              <span className="h-px w-14 border-t border-dashed border-border-subtle" aria-hidden />
            ) : (
              <Sparkline data={k.spark} label={`${k.label} trend`} />
            )}
            <ArrowUpRight className="size-4 text-faint transition-colors duration-150 group-hover:text-ink" aria-hidden />
          </div>
        </button>
      ))}
    </section>
  );
}

export function AiResultCard({
  c,
  onNavigate,
  onAction,
}: {
  c: AiCard;
  onNavigate: (s: string, p?: { jobId?: string; query?: string }) => void;
  onAction?: (c: AiCard) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-line bg-white p-4 transition-colors duration-150 hover:border-border-subtle">
      {c.kind === 'job' && (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[12.5px] text-muted">
                <Monogram name={c.meta} size={18} />
                <span className="truncate">{c.meta}</span>
              </div>
              <div className="mt-1.5 font-serif text-[16px] leading-snug">{c.title}</div>
            </div>
            {c.score != null && <MatchScore score={c.score} size="xs" bar={false} />}
          </div>
          {c.score != null && <div className="mt-3"><HBarScore score={c.score} /></div>}
        </>
      )}
      {c.kind === 'edit' && (
        <>
          <div className="flex items-center justify-between gap-2">
            <Tag category="RESUME">{c.title}</Tag>
            <span className="font-mono text-[11px] text-green">{c.meta}</span>
          </div>
          <p className="mt-2.5 text-[12.5px] leading-snug text-faint line-through">{c.before}</p>
          <p className="mt-1.5 text-[13px] leading-snug text-ink">{c.after}</p>
        </>
      )}
      {c.kind === 'task' && (
        <>
          <div className="font-serif text-[16px] leading-snug">{c.title}</div>
          <div className="mt-1 font-mono text-[11px] text-muted">{c.meta}</div>
        </>
      )}
      <div className="mt-auto pt-3">
        <button
          type="button"
          onClick={() => (onAction ? onAction(c) : onNavigate(c.target, c.jobId ? { jobId: c.jobId } : undefined))}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-terra hover:underline"
        >
          {c.action}<ArrowRight className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function HBarScore({ score }: { score: number }) {
  const t = score >= 70 ? C.green : score >= 50 ? C.blue : score >= 30 ? C.amber : C.faint;
  return <HBar value={score} max={100} color={t} height={4} />;
}

export function useTyped(text: string | null, speed = 3) {
  const [prevText, setPrevText] = useState(text);
  const [n, setN] = useState(0);

  if (prevText !== text) {
    setPrevText(text);
    setN(0);
  }

  useEffect(() => {
    if (!text || n >= text.length) return;
    const t = window.setTimeout(() => setN((x) => Math.min(text.length, x + speed)), 16);
    return () => window.clearTimeout(t);
  }, [text, n, speed]);
  return { shown: text ? text.slice(0, n) : '', done: !!text && n >= text.length };
}

function CommandCard({
  data,
  onNavigate,
}: {
  data: UIData;
  onNavigate: (s: string, p?: { query?: string }) => void;
}) {
  const [q, setQ] = useState('');
  const [asked, setAsked] = useState('');
  const [ans, setAns] = useState<AiAnswer | null>(null);
  const { shown, done } = useTyped(ans?.text ?? null);

  const run = (text: string) => {
    if (!text.trim()) return;
    setAsked(text.trim());
    setAns(answer(text, data));
  };

  return (
    <section aria-label="Command">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted">Preview data</span>
      </div>
      <Card className="p-5 transition-shadow duration-150 focus-within:border-border-subtle focus-within:ring-2 focus-within:ring-terra/25 md:p-6">
        <form onSubmit={(e) => { e.preventDefault(); run(q); }} className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Sparkles className="mt-1 size-5 shrink-0 text-terra" aria-hidden />
            <label htmlFor="ov-cmd" className="sr-only">Tell Jaggle what you need</label>
            <textarea
              id="ov-cmd"
              rows={3}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  run(q);
                }
              }}
              placeholder="Tell Jaggle what you need (e.g. ‘Find remote data jobs above 60’, ‘Tailor my resume for NovaPay’, ‘Prep me for tomorrow’s interview’)"
              className="min-h-[52px] w-full resize-none bg-transparent text-[15.5px] leading-relaxed text-ink focus-visible:outline-none md:h-[56px]"
            />
          </div>
          <Button type="submit" variant="primary" iconRight={CornerDownLeft} className="self-end md:self-center">
            Command
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <Micro className="mr-1">Quick actions</Micro>
          {data.quickActions.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setQ(a);
                run(a);
              }}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] text-ink shadow-pill transition-colors duration-150 hover:border-border-subtle"
            >
              {a}
            </button>
          ))}
        </div>
      </Card>
      {ans && (
        <Card className="mt-3 p-5 md:p-6" aria-live="polite">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13.5px] text-muted">
              <span className="micro mr-2">You asked</span>“{asked}”
            </p>
            <button
              type="button"
              aria-label="Dismiss answer"
              onClick={() => setAns(null)}
              className="grid size-7 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-soft hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="mt-3 flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-terra/10 text-terra">
              <Sparkles className="size-3.5" aria-hidden />
            </span>
            <p className="max-w-3xl text-[15px] leading-relaxed text-ink">
              {shown}
              {!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-ink" aria-hidden />}
            </p>
          </div>
          {done && (
            <>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {ans.cards.map((c) => <AiResultCard key={c.id} c={c} onNavigate={onNavigate} />)}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3">
                <Micro>Sources used</Micro>
                {ans.sources.map((s, i) => (
                  <span key={s} className="font-mono text-[11px] text-muted">
                    <sup className="text-terra">{i + 1}</sup> {s}
                  </span>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto"
                  iconRight={ArrowRight}
                  onClick={() => onNavigate('command', { query: asked })}
                >
                  Continue in Command
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </section>
  );
}

function Attention({
  data,
  empty,
  onNavigate,
  onToast,
}: {
  data: UIData;
  empty: boolean;
  onNavigate: (s: string, p?: { jobId?: string }) => void;
  onToast: (m: string) => void;
}) {
  const [items, setItems] = useState(data.attention);
  return (
    <section aria-labelledby="att-title" className="min-w-0">
      <SectionTitle
        id="att-title"
        title="Needs your attention"
        count={empty ? undefined : items.length}
        action={
          <button type="button" onClick={() => onNavigate('activity')} className="text-[13.5px] text-terra hover:underline">
            All tasks →
          </button>
        }
      />
      {empty ? (
        <div className="mt-5">
          <ChartEmpty
            height={220}
            text="Nothing needs you yet. Once your resume is in, matches, follow-ups and deadlines appear here."
            action={<Button variant="primary" size="sm" icon={Upload} onClick={() => onNavigate('resume')}>Upload resume</Button>}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5">
          <ChartEmpty
            height={200}
            text="All clear. You’ve handled everything for today."
            action={<Button size="sm" onClick={() => setItems(data.attention)}>Show again</Button>}
          />
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {items.map((it) => (
            <li key={it.id} className="group flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Dot tone={CAT_TONE[it.category]} />
                  <Tag category={it.category} />
                  <span className="font-mono text-[11px] text-faint">{it.time}</span>
                </div>
                <h3 className="mt-2 font-serif text-[19px] leading-snug text-ink">{it.title}</h3>
                <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-muted">{it.body}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  iconRight={ArrowRight}
                  onClick={() => onNavigate(it.target, it.jobId ? { jobId: it.jobId } : undefined)}
                >
                  {it.action}
                </Button>
                <button
                  type="button"
                  aria-label={`Mark “${it.title}” as done`}
                  onClick={() => {
                    setItems(items.filter((x) => x.id !== it.id));
                    onToast('Marked as done');
                  }}
                  className="grid size-8 place-items-center rounded-full text-faint transition-colors duration-150 hover:bg-soft hover:text-ink"
                >
                  <Check className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CareerOsCard({ onScoring }: { onScoring: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
      {/* Real photographic backdrop with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80"
          alt="Connected systems"
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="size-full object-cover opacity-16 filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/90 to-card/60" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-lg bg-terra/15 text-terra">
            <Target className="size-4" />
          </div>
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">Transparent Formula</span>
        </div>
        <h3 className="mt-3 font-serif text-[19px] leading-snug">Your career OS</h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
          Every job gets the same transparent score. Improve your inputs and watch the marks follow.
        </p>
        <button
          type="button"
          onClick={onScoring}
          className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-terra hover:underline"
        >
          How scores work →
        </button>
      </div>
    </div>
  );
}

function RightRail({
  data,
  empty,
  onScoring,
}: {
  data: UIData;
  empty: boolean;
  onScoring: () => void;
}) {
  const s = data.stats;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return (
    <aside className="min-w-0 space-y-6" aria-label="Your week">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <Micro>Weekly goal</Micro>
          <span className="font-mono text-[11px] text-faint">Oct 20 – 26</span>
        </div>
        <div className="mt-4 flex items-center gap-5">
          <Ring
            value={empty ? 0 : s.thisWeek}
            max={s.weeklyGoal}
            size={88}
            stroke={7}
            color={C.terra}
            label={`${empty ? 0 : s.thisWeek} of ${s.weeklyGoal} applications this week`}
          >
            <div>
              <div className="font-serif text-[26px] leading-none">{empty ? 0 : s.thisWeek}<span className="text-faint">/{s.weeklyGoal}</span></div>
              <div className="mt-0.5 font-mono text-[10px] text-muted">SENT</div>
            </div>
          </Ring>
          <div className="min-w-0">
            <p className="font-serif text-[18px] leading-snug">
              {empty ? 'Send your first application' : `${s.weeklyGoal - s.thisWeek} more to hit your goal`}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted">
              <Flame className="size-4 text-terra" aria-hidden />{empty ? 'No streak yet' : `${s.streak}-day streak`}
            </p>
          </div>
        </div>
        <ol className="mt-5 grid grid-cols-7 gap-1" aria-label="This week">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
            const on = !empty && s.activeWeek[i];
            const today = i === 4;
            return (
              <li key={i} className="flex flex-col items-center gap-1.5" aria-label={`${days[i]}: ${on ? 'active' : i > 4 ? 'upcoming' : 'no activity'}${today ? ' (today)' : ''}`}>
                <span className={cx('font-mono text-[10px]', today ? 'text-ink' : 'text-faint')}>{d}</span>
                <span
                  className={cx(
                    'grid size-7 place-items-center rounded-full border',
                    on ? 'border-terra/40 bg-terra/10 text-terra' : i > 4 ? 'border-dashed border-line' : 'border-line',
                    today && 'ring-2 ring-ink/15 ring-offset-1 ring-offset-card'
                  )}
                >
                  {on && <Check className="size-3.5" aria-hidden />}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>

      <CareerOsCard onScoring={onScoring} />

      <section aria-labelledby="pulse-title">
        <div className="flex items-baseline justify-between">
          <h2 id="pulse-title" className="font-serif text-[22px] leading-tight">Career pulse</h2>
          <span className="font-mono text-[11px] text-muted">Preview data</span>
        </div>
        {empty ? (
          <div className="mt-4"><ChartEmpty height={140} text="Your timeline starts when you upload a resume or save a job." /></div>
        ) : (
          <ol className="relative ml-1.5 mt-4 space-y-4 border-l border-line">
            {data.pulse.map((p, i) => (
              <li key={i} className="relative pl-5">
                <span className={cx('absolute -left-[4.5px] top-[7px] size-2 rounded-full ring-4 ring-canvas', TONES[CAT_TONE[p.category]].dot)} aria-hidden />
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-medium text-ink">{p.label}</span>
                  <span className="shrink-0 font-mono text-[11px] text-faint">{p.time}</span>
                </div>
                <p className="text-[13px] text-muted">{p.detail}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </aside>
  );
}

function Analytics({
  data,
  empty,
  onNavigate,
  onToast,
}: {
  data: UIData;
  empty: boolean;
  onNavigate: (s: string) => void;
  onToast: (m: string) => void;
}) {
  const s = data.stats;
  const [plan, setPlan] = useState<string[]>([]);
  const bins = histogram(data.jobs);
  const activeDays = data.heatmap.flat().filter((v) => v > 0).length;
  const mainVersions = data.resumeVersions.filter((v) => !v.variant).slice().reverse();
  const E = (text: string, label: string, target: string) => (
    <ChartEmpty text={text} action={<Button size="sm" onClick={() => onNavigate(target)}>{label}</Button>} />
  );

  return (
    <section aria-labelledby="an-title" className="space-y-5">
      <SectionTitle
        id="an-title"
        title="Your search, analysed"
        sub={empty ? 'Charts fill in as you use Jaggle. Nothing here is guessed.' : `Last 12 weeks · ${s.jobsIndexed} jobs indexed · ${s.applications} applications`}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-12">
        <ChartCard
          className="xl:col-span-7"
          eyebrow="Pace"
          title="Applications per week"
          meta={!empty && <span className="font-mono text-[11px] text-muted">{s.applications} total</span>}
          insight={!empty && 'Your pace is up 50% over the last 4 weeks.'}
        >
          {empty ? E('Your weekly bars start with your first application.', 'Find jobs to apply to', 'jobs') : (
            <BarChart
              ariaLabel="Applications per week, last 12 weeks"
              data={s.weekly.map((v, i) => ({ label: s.weekLabels[i], value: v }))}
              highlight={(i) => i === s.weekly.length - 1}
              goal={s.weeklyGoal}
              labelEvery={2}
              unit=" applications"
              tipLabel={(d, i) => (
                <>
                  <TipRow k={`Week of ${d.label}`} v={`${d.value} sent`} />
                  <TipRow k="vs goal" v={`${d.value}/${s.weeklyGoal}`} />
                  {i === s.weekly.length - 1 && <div className="mt-1 font-mono text-[10px] text-terra">THIS WEEK</div>}
                </>
              )}
            />
          )}
        </ChartCard>
        <ChartCard
          className="xl:col-span-5"
          eyebrow="Conversion"
          title="Pipeline"
          meta={<span className="font-mono text-[11px] text-muted">Awaiting stage updates</span>}
        >
          <ChartEmpty
            text="Pipeline stages appear once applications advance to review and interview."
            action={<Button size="sm" onClick={() => onNavigate('applications')}>Add application</Button>}
          />
        </ChartCard>

        <ChartCard
          className="xl:col-span-4"
          eyebrow="Fit"
          title="Match score distribution"
          meta={!empty && <span className="font-mono text-[11px] text-muted">{s.jobsIndexed} jobs</span>}
          insight={!empty && `${s.strong} of ${s.jobsIndexed} jobs are strong matches. Adding TypeScript could add ${data.backlog[0]?.strongGain ?? 0}.`}
        >
          {empty ? E('Scores appear when we can read your resume.', 'Upload resume', 'resume') : (
            <BarChart
              ariaLabel="Histogram of match scores across 128 jobs"
              height={180}
              data={bins.map((v, i) => ({ label: String(i * 10), value: v }))}
              highlight={(i) => i >= 7}
              unit=" jobs"
              tipLabel={(d, i) => (
                <>
                  <TipRow k={`Score ${i * 10}–${i * 10 + 9}`} v={`${d.value} jobs`} />
                  {i >= 7 && <div className="mt-1 font-mono text-[10px] text-green">STRONG</div>}
                </>
              )}
            />
          )}
        </ChartCard>
        <ChartCard
          className="xl:col-span-4"
          eyebrow="Skills"
          title="Skills vs market"
          meta={!empty && <SeriesKey items={[{ label: 'You', color: C.terra }, { label: 'Market', color: C.ink }]} />}
          insight={!empty && 'TypeScript is your biggest gap: 48% of jobs ask for it and you’re at 40.'}
        >
          {empty ? E('Add skills to compare yourself with the market.', 'Add skills', 'skills') : (
            <Radar
              ariaLabel="Radar chart of your skill levels against market demand"
              maxSize={280}
              axes={data.skills.map((k) => k.name)}
              series={[
                { name: 'Market', values: data.skills.map((k) => k.demand), color: C.ink, fill: 0.05 },
                { name: 'You', values: data.skills.map((k) => k.level), color: C.terra, fill: 0.14 },
              ]}
              unitFor={(k) => (k === 0 ? '% of jobs' : '/100')}
            />
          )}
        </ChartCard>
        <ChartCard
          className="xl:col-span-4"
          eyebrow="Next moves"
          title="Skill backlog"
          insight={!empty && 'Clearing the top two would add 11 strong matches (3 → 14).'}
        >
          {empty ? E('Your backlog is built from the skills jobs ask for.', 'Upload resume', 'resume') : (
            <ul className="space-y-3.5">
              {data.backlog.map((b) => {
                const inPlan = plan.includes(b.skill);
                return (
                  <li key={b.skill}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13.5px] font-medium">{b.skill}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPlan(inPlan ? plan.filter((x) => x !== b.skill) : [...plan, b.skill]);
                          onToast(inPlan ? `${b.skill} removed from plan` : `${b.skill} added to your learning plan`);
                        }}
                        aria-pressed={inPlan}
                        className={cx(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] transition-colors duration-150',
                          inPlan ? 'border-green/30 bg-green/10 text-green' : 'border-line bg-white text-ink hover:border-border-subtle'
                        )}
                      >
                        {inPlan ? <Check className="size-3" aria-hidden /> : <Plus className="size-3" aria-hidden />}
                        {inPlan ? 'In plan' : 'Add to plan'}
                      </button>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <div className="flex-1">
                        <HBar
                          value={b.marks * b.jobs}
                          max={(data.backlog[0]?.marks ?? 1) * (data.backlog[0]?.jobs ?? 1)}
                          color={b === data.backlog[0] ? C.terra : C.ink}
                          height={6}
                          label={`${b.skill}: plus ${b.marks} marks across ${b.jobs} jobs`}
                        />
                      </div>
                      <span className="w-[136px] shrink-0 whitespace-nowrap text-right font-mono text-[11px] text-muted">
                        <span className="font-serif text-[14px] text-ink">+{b.marks}</span> marks · {b.jobs} jobs
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ChartCard>

        <ChartCard
          className="xl:col-span-4"
          eyebrow="Consistency"
          title="Activity"
          meta={<span className="flex items-center gap-1 font-mono text-[11px] text-terra"><Flame className="size-3.5" aria-hidden />{s.streak}-day streak</span>}
        >
          <ChartEmpty
            text="Activity heatmap lights up as you search, save, and submit applications."
            action={<Button size="sm" onClick={() => onNavigate('jobs')}>Start searching</Button>}
          />
        </ChartCard>
        <ChartCard
          className="xl:col-span-4"
          eyebrow="Speed"
          title="Time in stage"
          meta={<span className="font-mono text-[11px] text-muted">avg days</span>}
        >
          <ChartEmpty
            text="Stage timings will appear once employer responses are recorded."
            action={<Button size="sm" onClick={() => onNavigate('applications')}>Track an application</Button>}
          />
        </ChartCard>
        <ChartCard
          className="lg:col-span-2 xl:col-span-4"
          eyebrow="Resume"
          title="ATS score over versions"
          meta={!empty && <span className="font-mono text-[11px] text-green">+14 since v1</span>}
          insight={!empty && 'Keywords is still the weakest category (24/40). Tailoring lifts it per job.'}
        >
          {empty ? E('Upload a resume to get your first ATS score.', 'Upload resume', 'resume') : (
            <LineChart
              ariaLabel="ATS score across resume versions: 58, 61, 64, 68, 72"
              yMin={50}
              yMax={80}
              step={10}
              labelAll
              height={176}
              points={mainVersions.map((v) => ({ label: v.id, value: v.score }))}
              tipExtra={(i) => (
                <div className="mt-1 max-w-[180px] whitespace-normal text-[11.5px] text-muted">
                  {mainVersions[i].date}: {mainVersions[i].note}
                </div>
              )}
            />
          )}
        </ChartCard>
      </div>
    </section>
  );
}

function TopMatches({
  data,
  empty,
  onNavigate,
}: {
  data: UIData;
  empty: boolean;
  onNavigate: (s: string, p?: { jobId?: string }) => void;
}) {
  const rows = data.jobs.filter((j) => j.postedHours <= 168).sort((a, b) => b.score - a.score).slice(0, 5);
  return (
    <section aria-labelledby="tm-title" className="min-w-0">
      <SectionTitle
        id="tm-title"
        title="Top matches"
        count="NEW THIS WEEK"
        action={<button type="button" onClick={() => onNavigate('recommended')} className="text-[13.5px] text-terra hover:underline">All matches →</button>}
      />
      {empty ? (
        <div className="mt-4">
          <ChartEmpty text="Your best-fitting jobs will be listed here, with their working." action={<Button size="sm" onClick={() => onNavigate('resume')}>Upload resume</Button>} />
        </div>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-line bg-soft/40">
              <tr>
                <th scope="col" className="micro px-4 py-2.5 font-normal md:px-5">Score</th>
                <th scope="col" className="micro px-3 py-2.5 font-normal">Role</th>
                <th scope="col" className="micro hidden px-3 py-2.5 font-normal lg:table-cell">Skills</th>
                <th scope="col" className="micro hidden px-3 py-2.5 font-normal sm:table-cell">Posted</th>
                <th scope="col" className="px-3 py-2.5"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((j) => (
                <tr
                  key={j.id}
                  className="cursor-pointer transition-colors duration-200 hover:bg-soft/60"
                  onClick={() => onNavigate('jobs', { jobId: j.id })}
                >
                  <td className="w-[96px] px-4 py-3.5 md:px-5"><MatchScore score={j.score} size="xs" /></td>
                  <td className="px-3 py-3.5">
                    <div className="font-serif text-[16px] leading-snug">{j.title}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted">
                      <Monogram name={j.company} size={16} />{j.company} · {j.city === 'Remote' ? 'Remote' : `${j.city}, ${j.mode}`}
                    </div>
                  </td>
                  <td className="hidden px-3 py-3.5 lg:table-cell">
                    <SkillDots skills={j.skills} />
                    <div className="mt-1 font-mono text-[11px] text-muted">{j.skills.filter((k) => k.have).length}/{j.skills.length} skills</div>
                  </td>
                  <td className="hidden px-3 py-3.5 font-mono text-[11px] text-faint sm:table-cell">{fmtPosted(j.postedHours)}</td>
                  <td className="px-3 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('jobs', { jobId: j.id });
                      }}
                      aria-label={`View ${j.title} at ${j.company}`}
                      className="inline-grid size-8 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-soft hover:text-ink"
                    >
                      <ArrowRight className="size-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}

function RecentApps({
  data,
  empty,
  onNavigate,
}: {
  data: UIData;
  empty: boolean;
  onNavigate: (s: string) => void;
}) {
  const rows = [...data.applications].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  return (
    <section aria-labelledby="ra-title" className="min-w-0">
      <SectionTitle
        id="ra-title"
        title="Recent applications"
        action={<button type="button" onClick={() => onNavigate('applications')} className="text-[13.5px] text-terra hover:underline">Board →</button>}
      />
      {empty ? (
        <div className="mt-4">
          <ChartEmpty text="Applications you send or track will show up here." action={<Button size="sm" onClick={() => onNavigate('applications')}>Add application</Button>} />
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {rows.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onNavigate('applications')}
                className="flex w-full items-center gap-3 py-3.5 text-left transition-all duration-200 hover:-translate-x-0.5 hover:bg-soft/40 px-2 rounded-xl"
              >
                <Monogram name={a.company} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-ink">{a.role}</span>
                  <span className="block truncate text-[12.5px] text-muted">{a.company} · {fmtDate(a.date)}</span>
                </span>
                <span className="hidden font-mono text-[11px] text-muted sm:inline">
                  <span className="font-serif text-[15px] text-ink">{a.score}</span>/100
                </span>
                <StatusBadge status={a.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ScoringModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: UIData;
}) {
  const j = data.jobs.find((x) => x.id === 'j-brightlane') || data.jobs[0];
  if (!j) return null;
  const rows: [string, number, number, string][] = [
    ['Skills', j.marks.skills, 70, j.why.skills],
    ['Role', j.marks.role, 15, j.why.role],
    ['Location', j.marks.location, 10, j.why.location],
    ['Experience', j.marks.experience, 5, j.why.experience],
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="How match scores work"
      eyebrow="Every score shows its working"
      footer={<Button variant="primary" onClick={onClose}>Got it</Button>}
    >
      <p className="text-[14px] text-muted">
        Each job is marked out of 100 with fixed weights. No hidden model: every mark points to a line in your resume or a preference you set.
      </p>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full" aria-hidden>
        <span className="bg-ink" style={{ width: '70%' }} />
        <span className="bg-terra" style={{ width: '15%' }} />
        <span className="bg-blue" style={{ width: '10%' }} />
        <span className="bg-amber" style={{ width: '5%' }} />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
        <span>Skills 70</span>
        <span>Role 15</span>
        <span>Location 10</span>
        <span>Exp 5</span>
      </div>
      <div className="mt-6 rounded-xl border border-line">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-serif text-[16px]">{j.title} · {j.company}</span>
          <MatchScore score={j.score} size="xs" bar={false} />
        </div>
        {rows.map(([k, v, m, why]) => (
          <div key={k} className="grid grid-cols-[90px_1fr_56px] items-center gap-3 border-b border-line px-4 py-2.5 last:border-0">
            <span className="text-[13px] font-medium">{k}</span>
            <span className="text-[12.5px] text-muted">{why}</span>
            <span className="text-right font-mono text-[12px]">{v}/{m}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading overview">
      <div className="space-y-3">
        <Skeleton className="h-3 w-72" />
        <Skeleton className="h-11 w-[420px] max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-px border-y border-line bg-line xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={cx('space-y-3 bg-canvas px-5 py-5', i === 4 && 'col-span-2 xl:col-span-1')}>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
      <Skeleton className="h-[132px] rounded-2xl" />
      <div className="grid gap-10 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 border-b border-line pb-5">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-5">
          <Skeleton className="h-[200px] rounded-2xl" />
          <Skeleton className="h-[130px] rounded-2xl" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-12">
        {[7, 5, 4, 4, 4, 4, 4, 4].map((c, i) => (
          <Skeleton key={i} className={cx('h-[300px] rounded-2xl', c === 7 ? 'xl:col-span-7' : c === 5 ? 'xl:col-span-5' : 'xl:col-span-4')} />
        ))}
      </div>
    </div>
  );
}

