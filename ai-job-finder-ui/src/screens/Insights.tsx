import { useState } from 'react';
import { Check, ChartLine } from 'lucide-react';
import type { ScreenProps } from './types';
import { Button, EmptyState, ErrorState, Micro, PageHeader, SectionTitle, SkeletonPage } from '../components/ui';
import { BarChart, C, ChartCard, Donut, HBar, LineChart, Scatter, StackedBars, TipRow } from '../components/charts';
import { byLocation, byRoleTier, byWeekday, responseBins } from '../lib/derive';

type Range = '4w' | '8w' | '12w';
const CUTOFF: Record<Range, string> = { '4w': '2025-09-29', '8w': '2025-09-01', '12w': '2025-08-04' };

export function Insights({ data, state, onNavigate, onRetry }: ScreenProps) {
  const [range, setRange] = useState<Range>('12w');
  if (state === 'loading') return <SkeletonPage variant="grid" />;
  const header = (
    <PageHeader eyebrow={`Market · ${data.stats.jobsIndexed} jobs today · You · ${data.stats.applications} applications`} title="Insights"
      actions={<div className="flex items-center gap-2"><label htmlFor="ins-range" className="text-[13px] text-muted">Range</label>
        <select id="ins-range" value={range} onChange={(e) => setRange(e.target.value as Range)} className="field !w-auto !rounded-full !py-1.5 text-[13px]">
          <option value="4w">Last 4 weeks</option><option value="8w">Last 8 weeks</option><option value="12w">Last 12 weeks</option>
        </select></div>} />
  );
  if (state === 'error') return <div className="space-y-8">{header}<ErrorState title="Insights couldn’t be calculated" body="The analytics job timed out. Raw data is intact; try again in a minute." onRetry={onRetry} /></div>;
  if (state === 'empty') return <div className="space-y-8">{header}<EmptyState icon={ChartLine} title="Not enough data yet" body="Insights need a scored resume and at least one tracked application. Nothing here is estimated." action={<><Button variant="primary" onClick={() => onNavigate('resume')}>Upload resume</Button><Button onClick={() => onNavigate('applications')}>Track an application</Button></>} /></div>;

  const apps = data.applications.filter((a) => a.date >= CUTOFF[range]);
  const loc = byLocation(data.jobs);
  const roles = byRoleTier(data.jobs);
  const resp = responseBins(apps);
  const week = byWeekday(apps);
  const topDay = week.reduce((m, d) => (d.value > m.value ? d : m), week[0]);
  const rowOf = { rejected: 0, applied: 1, review: 2, interview: 3, offer: 4 } as const;
  const colors = [C.faint, C.blue, C.amber, C.green, C.violet];
  const pts = apps.map((a) => ({ x: a.score, row: rowOf[a.status], label: `${a.company} · ${a.role}`, color: colors[rowOf[a.status]] }));
  const avgOf = (ss: string[]) => { const xs = apps.filter((a) => ss.includes(a.status)); return xs.length ? Math.round(xs.reduce((s, a) => s + a.score, 0) / xs.length) : 0; };
  const winners = apps.filter((a) => a.status === 'interview' || a.status === 'offer');
  const days = apps.map((a) => a.responseDays).filter((d): d is number => d !== null).sort((a, b) => a - b);
  const median = days.length ? (days.length % 2 ? days[(days.length - 1) / 2] : (days[days.length / 2 - 1] + days[days.length / 2]) / 2) : 0;
  const trendN = range === '4w' ? 4 : 8;
  const trend = data.stats.matchTrend.slice(-trendN).map((v, i) => ({ label: data.stats.matchTrendLabels.slice(-trendN)[i], value: v }));

  return (
    <div className="space-y-10">
      {header}
      <section className="space-y-5" aria-labelledby="mk">
        <SectionTitle id="mk" title="The market" sub="A snapshot of today’s 128 indexed jobs. It doesn’t change with the range." />
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard title="Top skills in demand" eyebrow="% of jobs asking" insight="React leads at 61%. TypeScript (48%) is the most-asked skill you don’t list yet.">
            <ul className="space-y-3">
              {data.skills.map((s) => {
                const has = data.user.skills.includes(s.name);
                return (
                  <li key={s.name} className="grid grid-cols-[100px_1fr_40px] items-center gap-3">
                    <span className="flex items-center gap-1.5 truncate text-[13px]">{has && <Check className="size-3.5 shrink-0 text-green" aria-label="on your resume" />}{s.name}</span>
                    <HBar value={s.demand} max={70} color={has ? C.ink : C.terra} height={8} label={`${s.name}: ${s.demand}% of jobs`} />
                    <span className="text-right font-mono text-[12px]">{s.demand}%</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 font-mono text-[10.5px] text-faint">TERRACOTTA = NOT ON YOUR RESUME YET</p>
          </ChartCard>
          <ChartCard title="Jobs by location" eyebrow={`${data.stats.jobsIndexed} jobs`} insight={`${loc[0].label} has the most openings (${loc[0].value}); remote roles score you highest on location.`}>
            <Donut ariaLabel="Donut chart of jobs by location" size={156} segments={loc.map((l, i) => ({ ...l, color: [C.ink, C.terra, C.blue, C.amber, C.green, C.lowGrey][i] ?? C.faint }))}
              center={<div><div className="font-serif text-[24px] leading-none">{data.stats.jobsIndexed}</div><div className="font-mono text-[9.5px] text-muted">JOBS</div></div>} />
          </ChartCard>
          <ChartCard className="lg:col-span-2 xl:col-span-1" title="Jobs by role" eyebrow="split by your match tier" insight="All 3 strong matches are frontend. Full-stack is your next-best pool.">
            <StackedBars ariaLabel="Stacked bars of jobs by role and match tier" rows={roles} keys={['Strong', 'Good', 'Partial', 'Low']} colors={[C.green, C.blue, C.amber, C.lowGrey]} textOn={['#fff', '#fff', '#fff', C.ink]} />
            <div className="mt-4 flex flex-wrap gap-3">
              {[['Strong 70+', C.green], ['Good 50–69', C.blue], ['Partial 30–49', C.amber], ['Low <30', C.lowGrey]].map(([l, c]) => (
                <span key={l} className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-muted"><span className="size-2 rounded-[2px]" style={{ background: c }} aria-hidden />{l}</span>
              ))}
            </div>
          </ChartCard>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="you">
        <SectionTitle id="you" title="Your search" sub={`${apps.length} applications in range · ${range === '4w' ? 'since Sep 29' : range === '8w' ? 'since Sep 1' : 'since Aug 4'}`} />
        <div className="grid gap-5 lg:grid-cols-2">
          <ChartCard title="Match score vs outcome" eyebrow={`${apps.length} applications`}
            insight={`Interviews and offers average ${avgOf(['interview', 'offer'])}; rejections average ${avgOf(['rejected'])}. ${winners.length ? `Every interview so far came from a job scoring ${Math.min(...winners.map((w) => w.score))}+.` : ''}`}>
            <Scatter ariaLabel="Scatter of match score against application outcome" points={pts} rows={['Rejected', 'No reply', 'In review', 'Interview', 'Offer']} xMin={30} xMax={75} />
            <p className="mt-2 font-mono text-[10.5px] text-faint">TICK = ROW AVERAGE · DASHED = STRONG THRESHOLD (70)</p>
          </ChartCard>
          <ChartCard title="Response time" eyebrow="days to first reply" insight={`Median reply: ${median} days. ${resp[4].value} companies took 12 days or more.`}>
            <BarChart ariaLabel="Distribution of days to first reply" data={resp} unit=" companies" height={200} highlight={(i) => i === resp.reduce((m, d, k) => (d.value > resp[m].value ? k : m), 0)} />
          </ChartCard>
          <ChartCard title="Applications by day of week" eyebrow="when you apply" insight={`${topDay.label === 'Tue' ? 'Tuesday' : topDay.label} is your power day: ${topDay.value} of ${apps.length} applications.`}>
            <BarChart ariaLabel="Applications by day of week" data={week} unit=" applications" height={200} highlight={(i) => week[i].label === topDay.label} />
          </ChartCard>
          <ChartCard title="Average match, week by week" eyebrow={`${trendN}-week trend`} meta={<span className="font-mono text-[11px] text-green">+{data.stats.avgMatchDelta} this week</span>}
            insight="The jump this week came from resume v5: adding project metrics lifted skills marks across 61 jobs.">
            <LineChart ariaLabel="Average match score by week" points={trend} yMin={20} yMax={50} step={10} height={200} labelAll tipExtra={(i) => i === trend.length - 1 ? <TipRow k="vs last week" v={`+${data.stats.avgMatchDelta}`} /> : null} />
          </ChartCard>
        </div>
      </section>
      <Micro as="p" className="text-faint">Scores are calculated from your resume and public job posts. No estimates.</Micro>
    </div>
  );
}
