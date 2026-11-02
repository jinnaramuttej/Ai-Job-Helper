'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, FileText, Layers, Plus } from 'lucide-react';
import type { UIData } from '@/lib/view-models';
import { Bar, Button, Card, EmptyState, ErrorState, Micro, PageHeader, SkeletonPage, Tag, Toggle, cx } from '../ui';
import { C, ChartCard, Radar, SeriesKey } from '../charts';

export interface SkillsScreenProps {
  data: UIData;
  state: 'ready' | 'loading' | 'empty' | 'error';
  onNavigate?: (screen: string, params?: { jobId?: string; query?: string }) => void;
  onToast?: (msg: string) => void;
  onRetry?: () => void;
}

export function SkillsScreen({
  data,
  state,
  onNavigate,
  onToast = () => undefined,
  onRetry = () => undefined,
}: SkillsScreenProps) {
  const router = useRouter();
  const navigate = onNavigate ?? ((screen) => router.push(`/${screen}`));

  const [plan, setPlan] = useState(data.learning);
  const [on, setOn] = useState<string[]>(data.whatIf.defaultOn);

  if (state === 'loading') return <SkeletonPage variant="split" />;

  const header = (
    <PageHeader
      eyebrow={`Growth · ${data.user.skills.length} skills on your resume · 8 tracked against ${data.stats.jobsIndexed} jobs`}
      title="Skills"
      actions={
        <>
          <Button icon={FileText} onClick={() => navigate('resume')}>Edit in Resume Studio</Button>
          <Button variant="primary" icon={Plus} onClick={() => onToast('Skill picker opens here (UI only)')}>Add skill</Button>
        </>
      }
    />
  );

  if (state === 'error') {
    return (
      <div className="space-y-8">
        {header}
        <ErrorState
          title="Skill data is unavailable"
          body="Market demand is recalculated nightly and the job didn’t finish. Your own skills are safe."
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="space-y-8">
        {header}
        <EmptyState
          icon={Layers}
          title="No skills yet"
          body="Upload your resume or add skills manually. We’ll compare them with what 128 jobs ask for."
          action={
            <>
              <Button variant="primary" onClick={() => navigate('resume')}>Upload resume</Button>
              <Button onClick={() => onToast('Skill picker opens here (UI only)')}>Add manually</Button>
            </>
          }
        />
      </div>
    );
  }

  const rows = [...data.skills].sort((a, b) => (b.demand - b.level) - (a.demand - a.level));
  const strong = data.whatIf.base + data.backlog.filter((b) => on.includes(b.skill)).reduce((s, b) => s + b.strongGain, 0);
  const avg = data.whatIf.baseAvg + data.backlog.filter((b) => on.includes(b.skill)).reduce((s, b) => s + b.avgGain, 0);

  return (
    <div className="space-y-8">
      {header}
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-end justify-between px-5 pb-3 pt-5">
            <h2 className="font-serif text-[22px]">Skill map</h2>
            <span className="font-mono text-[11px] text-muted">sorted by gap</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="border-y border-line bg-soft/40">
                <tr>
                  {['Skill', 'Your level', 'Market demand', 'Gap', 'Jobs unlocked'].map((h) => (
                    <th key={h} scope="col" className="micro px-5 py-2.5 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((s) => {
                  const gap = s.demand - s.level;
                  const has = data.user.skills.includes(s.name);
                  return (
                    <tr key={s.name} className="transition-colors duration-150 hover:bg-soft/40">
                      <th scope="row" className="px-5 py-3 text-[14px] font-medium">
                        <span className="whitespace-nowrap">{s.name}</span>
                        {has && (
                          <span className="mt-0.5 block whitespace-nowrap font-mono text-[10px] font-normal uppercase tracking-[0.08em] text-green">
                            On resume
                          </span>
                        )}
                      </th>
                      <td className="w-[180px] px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Bar value={s.level} tone={s.level >= 60 ? 'green' : s.level >= 35 ? 'blue' : 'amber'} className="flex-1" />
                          <span className="w-7 text-right font-mono text-[12px]">{s.level}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span className="font-serif text-[17px]">{s.demand}%</span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        {gap > 0 ? <Tag tone="terra">Behind {gap}</Tag> : <Tag tone="green">Ahead {Math.abs(gap)}</Tag>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-[12.5px]">
                        {s.jobs}<span className="text-faint"> jobs</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <ChartCard
          title="You vs the market"
          eyebrow="8 axes · 0–100"
          meta={<SeriesKey items={[{ label: 'You', color: C.terra }, { label: 'Market', color: C.ink }]} />}
          insight="Biggest gaps: TypeScript and Node.js. Both sit in more than 40% of postings."
        >
          <Radar
            ariaLabel="Radar of your skill levels against market demand"
            axes={data.skills.map((s) => s.name)}
            maxSize={340}
            series={[
              { name: 'Market', values: data.skills.map((s) => s.demand), color: C.ink, fill: 0.05 },
              { name: 'You', values: data.skills.map((s) => s.level), color: C.terra, fill: 0.14 },
            ]}
            unitFor={(k) => (k === 0 ? '% of jobs' : '/100')}
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section aria-labelledby="lp-title">
          <div className="flex items-end justify-between">
            <h2 id="lp-title" className="font-serif text-[24px]">Learning plan</h2>
            <span className="font-mono text-[11px] text-muted">
              {plan.reduce((s, p) => s + p.hours, 0)} h total · {plan.filter((p) => p.progress === 100).length}/{plan.length} done
            </span>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {plan.map((p) => {
              const done = p.progress === 100;
              return (
                <li key={p.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Tag tone="blue">{p.skill}</Tag>
                      <span className="font-mono text-[11px] text-faint">{p.hours} h</span>
                    </div>
                    <h3 className={cx('mt-1.5 font-serif text-[18px] leading-snug', done && 'text-muted line-through')}>{p.title}</h3>
                    <p className="text-[13px] text-muted">{p.resource}</p>
                  </div>
                  <div className="flex items-center gap-4 sm:w-[300px]">
                    <div className="flex-1">
                      <Bar value={p.progress} tone={done ? 'green' : 'ink'} height={6} />
                      <span className="mt-1 block font-mono text-[11px] text-muted">{p.progress}%</span>
                    </div>
                    <Button
                      size="sm"
                      variant={done ? 'ghost' : 'outline'}
                      icon={done ? Check : undefined}
                      onClick={() => {
                        setPlan(plan.map((x) => (x.id === p.id ? { ...x, progress: done ? 40 : 100 } : x)));
                        if (!done) onToast(`${p.skill} marked done. Add it to your resume to update scores.`);
                      }}
                    >
                      {done ? 'Done' : 'Mark done'}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <Card className="p-5 md:p-6" aria-labelledby="wi-title">
          <Micro as="p">What-if simulator</Micro>
          <h2 id="wi-title" className="mt-1 font-serif text-[22px]">If you learned…</h2>
          <ul className="mt-4 space-y-2.5">
            {data.backlog.map((b) => (
              <li key={b.skill} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium">{b.skill}</div>
                  <div className="font-mono text-[11px] text-muted">+{b.marks} marks · {b.jobs} jobs · +{b.strongGain} strong</div>
                </div>
                <Toggle
                  checked={on.includes(b.skill)}
                  onChange={(v) => setOn(v ? [...on, b.skill] : on.filter((x) => x !== b.skill))}
                  label={`Simulate learning ${b.skill}`}
                />
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line" aria-live="polite">
            <div className="bg-soft/40 p-4">
              <Micro as="p">Strong matches</Micro>
              <p className="mt-2 flex items-baseline gap-2 font-serif text-[34px] leading-none">
                <span className="text-faint">{data.whatIf.base}</span>
                <ArrowRight className="size-5 self-center text-muted" aria-label="becomes" />
                <span className={strong > data.whatIf.base ? 'text-green' : ''}>{strong}</span>
              </p>
            </div>
            <div className="bg-soft/40 p-4">
              <Micro as="p">Average match</Micro>
              <p className="mt-2 flex items-baseline gap-2 font-serif text-[34px] leading-none">
                <span className="text-faint">{data.whatIf.baseAvg}</span>
                <ArrowRight className="size-5 self-center text-muted" aria-label="becomes" />
                <span className={avg > data.whatIf.baseAvg ? 'text-green' : ''}>{avg}</span>
              </p>
            </div>
          </div>
          <p className="mt-3 text-[12.5px] text-muted">Docker alone helps 23 jobs but pushes none past 70, so it adds marks without new strong matches.</p>
          <Button
            variant="primary"
            className="mt-4 w-full"
            disabled={!on.length}
            onClick={() => onToast(`${on.join(', ')} added to your learning plan`)}
          >
            Add selected to plan
          </Button>
        </Card>
      </div>
    </div>
  );
}
