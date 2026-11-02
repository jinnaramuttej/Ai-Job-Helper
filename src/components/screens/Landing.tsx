'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
  Layers,
  MessagesSquare,
  Sparkles,
  SquareKanban,
  Target,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react';
import type { Job, UIData } from '@/lib/view-models';
import { Button, Card, MatchScore, Micro, Monogram, Skeleton, SkillDots, cx } from '../ui';
import { C, HBar } from '../charts';

export interface LandingScreenProps {
  data: UIData;
  state?: 'ready' | 'loading' | 'empty' | 'error';
  onNavigate?: (screen: string) => void;
}

export function LandingScreen({ data, state = 'ready', onNavigate }: LandingScreenProps) {
  const router = useRouter();
  const navigate = onNavigate ?? ((screen) => router.push(screen.startsWith('/') ? screen : `/${screen}`));
  const [faq, setFaq] = useState<number | null>(0);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-6 px-4 md:px-8">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-serif text-[21px] text-ink">Jaggle</span>
          </Link>
          <nav aria-label="Landing" className="hidden flex-1 items-center gap-6 text-[14px] text-muted md:flex">
            {[
              ['how', 'How it works'],
              ['features', 'Features'],
              ['scoring', 'Scoring'],
              ['faq', 'FAQ'],
            ].map(([id, l]) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                className="transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                {l}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" onClick={() => navigate('login')}>
              Sign in
            </Button>
            <Button size="sm" variant="primary" onClick={() => navigate('signup')}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      {state === 'error' && (
        <div role="alert" className="border-b border-terra/20 bg-terra/[0.06]">
          <div className="mx-auto flex max-w-[1180px] items-center gap-2 px-4 py-2.5 text-[13px] text-ink md:px-8">
            <TriangleAlert className="size-4 text-terra" aria-hidden />
            Live job counts are temporarily unavailable. Sign-up still works.
          </div>
        </div>
      )}

      <main>
        <section className="mx-auto grid max-w-[1180px] gap-12 px-4 pb-16 pt-14 md:px-8 md:pt-20 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <Micro as="p" className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-terra" aria-hidden />
              For students · internships and first jobs
            </Micro>
            <h1 className="mt-5 font-serif text-[44px] leading-[1.04] tracking-[-0.025em] md:text-[62px]">
              Know why a job fits you, before you apply.
            </h1>
            <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-muted">
              Jaggle reads your resume, scores every listing out of 100, and shows its working: which skills earned marks, which are missing, and what one change would move the needle.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="primary" iconRight={ArrowRight} onClick={() => navigate('signup')}>
                Get started free
              </Button>
              <Button size="lg" onClick={() => go('scoring')}>
                See how scoring works
              </Button>
            </div>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
              {state === 'error'
                ? 'Jobs indexed today: unavailable'
                : `${data.stats.jobsIndexed || data.jobs.length || 128} jobs indexed today · scored in about 2 seconds`}
            </p>
          </div>
          {state === 'loading' ? (
            <Skeleton className="h-[440px] rounded-2xl" />
          ) : (
            <Preview data={data} empty={state === 'empty' || !data.jobs.length} />
          )}
        </section>

        <section id="how" className="border-t border-line">
          <div className="mx-auto max-w-[1180px] px-4 py-16 md:px-8">
            <Micro as="p">How it works</Micro>
            <h2 className="mt-2 font-serif text-[34px] leading-tight md:text-[40px]">Three steps, no guesswork</h2>
            <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
              {[
                {
                  icon: Upload,
                  t: 'Upload your resume',
                  d: 'We pull out your skills, education and projects. You check anything we read wrong.',
                },
                {
                  icon: Target,
                  t: 'Every job gets marks',
                  d: 'Skills 70, role 15, location 10, experience 5. Each mark points to a line on your resume.',
                },
                {
                  icon: Sparkles,
                  t: 'Close the gaps',
                  d: 'See the one skill or rewrite that moves the most jobs past 70, then track every application.',
                },
              ].map((s, i) => (
                <li key={s.t} className="bg-card p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-[40px] leading-none text-faint">0{i + 1}</span>
                    <s.icon className="size-5 text-terra" aria-hidden />
                  </div>
                  <h3 className="mt-6 font-serif text-[22px]">{s.t}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="border-t border-line">
          <div className="mx-auto max-w-[1180px] px-4 py-16 md:px-8">
            <Micro as="p">Features</Micro>
            <h2 className="mt-2 font-serif text-[34px] leading-tight md:text-[40px]">A cockpit for the whole search</h2>
            <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Target,
                  t: 'Match scores with working',
                  d: 'A ledger of every job, with matched and missing skills side by side.',
                },
                {
                  icon: FileText,
                  t: 'Resume Studio',
                  d: 'ATS report, version history and job-specific tailoring that never invents experience.',
                },
                {
                  icon: Layers,
                  t: 'Skill backlog',
                  d: 'Which skill unlocks the most jobs, how many marks it adds, and a plan to learn it.',
                },
                {
                  icon: SquareKanban,
                  t: 'Application board',
                  d: 'Kanban, table and timeline views with follow-up drafts and reminders.',
                },
                {
                  icon: MessagesSquare,
                  t: 'Interview prep',
                  d: 'Role-specific questions, a timed mock interview and STAR notes you can reuse.',
                },
                {
                  icon: Sparkles,
                  t: 'Command',
                  d: 'Ask in plain English: “remote frontend jobs above 60”. Every answer cites its sources.',
                },
              ].map((f) => (
                <div key={f.t} className="border-t border-line pt-5">
                  <f.icon className="size-5 text-ink" aria-hidden />
                  <h3 className="mt-4 font-serif text-[21px]">{f.t}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="scoring" className="border-t border-line bg-side">
          <div className="mx-auto grid max-w-[1180px] gap-12 px-4 py-16 md:px-8 lg:grid-cols-2 lg:items-center">
            <div>
              <Micro as="p">Scoring</Micro>
              <h2 className="mt-2 font-serif text-[34px] leading-tight md:text-[40px]">Every score shows its working</h2>
              <p className="mt-4 max-w-[480px] text-[15.5px] leading-relaxed text-muted">
                No black box. Four fixed weights, the same for every job. Change your resume or preferences and you can watch exactly which marks move.
              </p>
              <div className="mt-8">
                <div
                  className="flex h-4 overflow-hidden rounded-full"
                  role="img"
                  aria-label="Weights: skills 70, role 15, location 10, experience 5"
                >
                  <span className="bg-ink" style={{ width: '70%' }} />
                  <span className="bg-terra" style={{ width: '15%' }} />
                  <span className="bg-blue" style={{ width: '10%' }} />
                  <span className="bg-amber" style={{ width: '5%' }} />
                </div>
                <dl className="mt-4 grid grid-cols-4 gap-2">
                  {[
                    ['Skills', 70, 'bg-ink'],
                    ['Role', 15, 'bg-terra'],
                    ['Location', 10, 'bg-blue'],
                    ['Experience', 5, 'bg-amber'],
                  ].map(([k, v, c]) => (
                    <div key={k as string}>
                      <dt className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
                        <span className={cx('size-2 rounded-full', c as string)} aria-hidden />
                        {k}
                      </dt>
                      <dd className="mt-1 font-serif text-[30px] leading-none">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            {data.jobs[0] ? <Breakdown job={data.jobs[0]} /> : null}
          </div>
        </section>

        <section id="faq" className="border-t border-line">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <Micro as="p">FAQ</Micro>
              <h2 className="mt-2 font-serif text-[34px] leading-tight md:text-[40px]">Questions, answered</h2>
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {faqList.map((f, i) => (
                <li key={f.q}>
                  <button
                    type="button"
                    aria-expanded={faq === i}
                    aria-controls={`faq-${i}`}
                    onClick={() => setFaq(faq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    <span className="font-serif text-[19px]">{f.q}</span>
                    <ChevronDown
                      className={cx('size-4 shrink-0 text-muted transition-transform duration-150', faq === i && 'rotate-180')}
                      aria-hidden
                    />
                  </button>
                  {faq === i && (
                    <p id={`faq-${i}`} className="-mt-1 pb-5 text-[14.5px] leading-relaxed text-muted">
                      {f.a}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-6 px-4 py-16 md:flex-row md:items-center md:justify-between md:px-8">
            <h2 className="max-w-[560px] font-serif text-[32px] leading-tight md:text-[38px]">
              Start with your resume. Leave with a reason for every application.
            </h2>
            <Button size="lg" variant="primary" iconRight={ArrowRight} onClick={() => navigate('signup')}>
              Create your account
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-side">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8">
          <div>
            <span className="font-serif text-[20px] text-ink">Jaggle</span>
            <p className="mt-2 max-w-[280px] text-[13.5px] text-muted">A career cockpit for students. Built in Pune.</p>
          </div>
          {[
            ['Product', ['Jobs', 'Resume Studio', 'Skills', 'Interview Prep']],
            ['Company', ['About', 'Careers', 'Contact']],
            ['Legal', ['Privacy', 'Terms', 'Data deletion']],
          ].map(([h, ls]) => (
            <div key={h as string}>
              <Micro as="p">{h as string}</Micro>
              <ul className="mt-3 space-y-2 text-[13.5px] text-muted">
                {(ls as string[]).map((l) => (
                  <li key={l}>
                    <button
                      type="button"
                      onClick={() => navigate(l.toLowerCase().replace(/\s+/g, '-'))}
                      className="transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-[1180px] border-t border-line px-4 py-5 font-mono text-[11px] text-faint md:px-8">
          © 2025 Jaggle · Scores are guidance, not guarantees.
        </div>
      </footer>
    </div>
  );
}

function Preview({ data, empty }: { data: UIData; empty: boolean }) {
  const rows = data.jobs.filter((j) => j.postedHours <= 168).sort((a, b) => b.score - a.score).slice(0, 4);
  const sample = rows[3] || data.jobs[0];

  return (
    <Card className="overflow-hidden" aria-label="Product preview">
      <div className="flex items-center justify-between border-b border-line bg-side px-4 py-2.5">
        <span className="font-serif text-[15px]">
          Jaggle <span className="font-mono text-[10.5px] text-faint">/ Jobs</span>
        </span>
        <span className="font-mono text-[10.5px] text-muted">
          {empty ? '0' : data.stats.jobsIndexed || data.jobs.length} jobs · {empty ? 0 : data.stats.newToday} new
        </span>
      </div>
      {empty || !rows.length ? (
        <div className="p-10 text-center">
          <p className="font-serif text-[20px]">Your scored jobs appear here</p>
          <p className="mt-1 text-[13.5px] text-muted">Upload a resume to see the preview fill in.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-[1fr_1.1fr]">
          <ul className="border-b border-line sm:border-b-0 sm:border-r">
            {rows.map((j, i) => (
              <li key={j.id} className={cx('flex items-center gap-3 border-b border-line px-4 py-3 last:border-0', i === 3 && 'bg-soft')}>
                <div className="w-[50px]">
                  <MatchScore score={j.score} size="xs" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-serif text-[14.5px]">{j.title}</div>
                  <div className="flex items-center gap-1.5 text-[11.5px] text-muted">
                    <Monogram name={j.company} size={14} />
                    {j.company}
                  </div>
                  <div className="mt-1">
                    <SkillDots skills={j.skills} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {sample ? <Breakdown job={sample} compact /> : null}
        </div>
      )}
    </Card>
  );
}

function Breakdown({ job, compact }: { job: Job; compact?: boolean }) {
  const node = job.skills.find((s) => !s.have && s.name === 'Node.js') ?? job.skills.filter((s) => !s.have).sort((a, b) => b.marks - a.marks)[0];
  const rows: [string, number, number][] = [
    ['Skills', job.marks.skills, 70],
    ['Role', job.marks.role, 15],
    ['Location', job.marks.location, 10],
    ['Experience', job.marks.experience, 5],
  ];

  const inner = (
    <div className={compact ? 'p-4' : 'p-5 md:p-6'}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Micro as="p">{job.company}</Micro>
          <p className="mt-1 font-serif text-[18px] leading-snug">{job.title}</p>
        </div>
        <MatchScore score={job.score} size={compact ? 'xs' : 'sm'} bar={false} />
      </div>
      <ul className="mt-4 space-y-2.5">
        {rows.map(([k, v, m]) => (
          <li key={k} className="grid grid-cols-[76px_1fr_44px] items-center gap-3">
            <span className="text-[12.5px] text-muted">{k}</span>
            <HBar
              value={v}
              max={m}
              extra={k === 'Skills' ? node?.marks : undefined}
              extraColor={C.green}
              height={5}
              label={`${k} ${v} of ${m}`}
            />
            <span className="text-right font-mono text-[11.5px]">
              {v}/{m}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-[12.5px]">
        <p className="flex items-center gap-1.5">
          <Check className="size-3.5 text-green" aria-hidden />
          {job.skills.filter((s) => s.have).slice(0, 4).map((s) => s.name).join(', ')}
        </p>
        {node && (
          <p className="flex items-center gap-1.5">
            <X className="size-3.5 text-terra" aria-hidden />
            {node.name}
            <span className="ml-auto rounded-full border border-green/30 bg-green/10 px-2 font-mono text-[10.5px] text-green">
              +{node.marks} → {job.score + node.marks}
            </span>
          </p>
        )}
      </div>
    </div>
  );

  return compact ? inner : <Card>{inner}</Card>;
}

const faqList = [
  {
    q: 'How does the match score work?',
    a: 'We evaluate four transparent weights: Skills (up to 70 marks), Role alignment (up to 15 marks), Preferred location (up to 10 marks), and Experience level (up to 5 marks). Total is 100.',
  },
  {
    q: 'Does Jaggle share my resume with recruiters?',
    a: 'Never. Your resume text stays on your device or in your private workspace. We only match it against job criteria.',
  },
  {
    q: 'Can I track applications I made outside Jaggle?',
    a: 'Yes! The application board lets you add external applications manually, set follow-up dates, and log interview notes.',
  },
  {
    q: 'How often are jobs refreshed?',
    a: 'The index syncs continuously across top tech startup boards and direct company career pages.',
  },
];

