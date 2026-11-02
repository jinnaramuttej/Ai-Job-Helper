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
  Zap,
} from 'lucide-react';
import type { UIData } from '@/lib/view-models';
import { Button, Micro, cx } from '../ui';

export interface LandingScreenProps {
  data: UIData;
  state?: 'ready' | 'loading' | 'empty' | 'error';
  onNavigate?: (screen: string) => void;
}

export function LandingScreen({ data, state = 'ready', onNavigate }: LandingScreenProps) {
  const router = useRouter();
  const navigate = onNavigate ?? ((screen) => router.push(screen.startsWith('/') ? screen : `/${screen}`));
  const [faq, setFaq] = useState<number | null>(0);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sampleJob = data.jobs[0] ?? {
    id: 'sample',
    title: 'Frontend Engineer',
    company: 'Linear',
    city: 'Remote',
    score: 92,
    marks: { skills: 65, role: 14, location: 9, experience: 4 },
  };

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      {/* Top Navbar in Signature Canvas Theme */}
      <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-6 px-4 md:px-8">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="font-serif text-[24px] tracking-tight text-ink transition-colors group-hover:text-terra">
              Jaggle
            </span>
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
                className="transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra"
              >
                {l}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
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
        {/* HERO SECTION: REVERTED TO THE GLOBE / PLANET VIDEO WITH SUBTLE DARK OVERLAY */}
        <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden border-b border-line text-white">
          {/* Globe / Planet Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/hero-poster.jpg"
            className="absolute inset-0 size-full object-cover object-center"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>

          {/* Calibrated Dark Overlay so the globe animation shines through while text is 100% crisp */}
          <div className="absolute inset-0 bg-ink/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-ink/50" />

          {/* Clean Typography Directly on Video (NO CARDS, NO BADGES) */}
          <div className="relative z-10 mx-auto w-full max-w-[1180px] px-4 py-20 md:px-8">
            <div className="max-w-[800px]">
              <h1 className="font-serif text-[46px] font-normal leading-[1.05] tracking-[-0.03em] text-white sm:text-[62px] md:text-[72px]">
                Know why a job fits you, before you apply.
              </h1>

              <p className="mt-6 max-w-[620px] text-[18px] leading-relaxed text-white/90 sm:text-[20px]">
                Jaggle reads your resume, scores every listing out of 100, and shows its working: which skills earned marks, which are missing, and what one change would move the needle.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  variant="primary"
                  iconRight={ArrowRight}
                  onClick={() => navigate('signup')}
                  className="shadow-xl hover:shadow-terra/30"
                >
                  Get started free
                </Button>
                <button
                  type="button"
                  onClick={() => go('scoring')}
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 text-[15px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  See how scoring works
                </button>
              </div>

              <p className="mt-10 font-mono text-[12px] uppercase tracking-[0.1em] text-white/70">
                {state === 'error'
                  ? 'Jobs indexed today: unavailable'
                  : `${data.stats.jobsIndexed || data.jobs.length || 128} jobs indexed today · scored in about 2 seconds`}
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS: CLEAN WHITE / CANVAS THEME (NO BACKGROUND IMAGE, NO CARDS) */}
        <section id="how" className="flex min-h-screen flex-col justify-center border-b border-line bg-canvas py-24 text-ink">
          <div className="mx-auto w-full max-w-[1180px] px-4 md:px-8">
            <div className="max-w-xl">
              <Micro as="p">How it works</Micro>
              <h2 className="mt-2 font-serif text-[38px] leading-tight text-ink md:text-[46px]">
                Three steps, no guesswork
              </h2>
              <p className="mt-3 text-[17px] text-muted">
                From your initial resume PDF to calibrated job applications with zero wasted effort.
              </p>
            </div>

            {/* Direct 3-Column Timeline with Top Border Dividers (NO CARDS) */}
            <div className="mt-16 grid gap-12 md:grid-cols-3">
              {[
                {
                  step: '01',
                  icon: Upload,
                  title: 'Upload your resume',
                  desc: 'We extract your verified skills, education, coursework, and past projects into an active student profile. You review and correct anything in seconds.',
                },
                {
                  step: '02',
                  icon: Target,
                  title: 'Every job gets marks',
                  desc: 'Transparent weights: Skills 70, Role alignment 15, Preferred location 10, Experience 5. Every single mark cites an exact line from your resume.',
                },
                {
                  step: '03',
                  icon: Sparkles,
                  title: 'Close the gaps & get hired',
                  desc: 'Discover the exact skill or keyword that turns multiple 50s into 70+ strong matches. Track applications on an integrated Kanban board.',
                },
              ].map((s) => (
                <div key={s.step} className="border-t-2 border-line pt-6">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-[44px] font-normal leading-none text-faint">
                      {s.step}
                    </span>
                    <s.icon className="size-6 text-terra" />
                  </div>
                  <h3 className="mt-4 font-serif text-[24px] font-normal text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES: CLEAN LIGHT THEME (NO CARDS) */}
        <section id="features" className="flex min-h-screen flex-col justify-center border-b border-line bg-side py-24 text-ink">
          <div className="mx-auto w-full max-w-[1180px] px-4 md:px-8">
            <div className="max-w-xl">
              <Micro as="p">Features</Micro>
              <h2 className="mt-2 font-serif text-[38px] leading-tight text-ink md:text-[46px]">
                A cockpit for the whole search
              </h2>
              <p className="mt-3 text-[17px] text-muted">
                Engineered specifically for university students navigating technical internships and early roles.
              </p>
            </div>

            {/* Direct Features Grid with Top Dividers (NO CARDS) */}
            <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Target,
                  title: 'Match scores with working',
                  desc: 'A side-by-side ledger of every job with matched skills, missing requirements, and line citations.',
                },
                {
                  icon: FileText,
                  title: 'Resume Studio',
                  desc: 'Comprehensive ATS diagnostics, version comparison, and tailoring advice that never fabricates experience.',
                },
                {
                  icon: Layers,
                  title: 'Skill backlog',
                  desc: 'Identifies which missing skill unlocks the largest volume of high-scoring positions across the market.',
                },
                {
                  icon: SquareKanban,
                  title: 'Application board',
                  desc: 'Kanban columns, timeline tracking, follow-up deadlines, and auto-generated correspondence drafts.',
                },
                {
                  icon: MessagesSquare,
                  title: 'Interview prep',
                  desc: 'Position-specific technical and behavioral questions, timed practice modes, and structured STAR note logs.',
                },
                {
                  icon: Sparkles,
                  title: 'Jaggle Command',
                  desc: 'Natural language queries like “remote frontend roles above 65 marks”. Every suggestion cites verifiable sources.',
                },
              ].map((f) => (
                <div key={f.title} className="border-t border-line pt-6">
                  <f.icon className="size-6 text-terra" />
                  <h3 className="mt-3 font-serif text-[22px] font-normal text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SCORING: CLEAN LIGHT CANVAS THEME (NO CARDS) */}
        <section id="scoring" className="flex min-h-screen flex-col justify-center border-b border-line bg-canvas py-24 text-ink">
          <div className="mx-auto w-full max-w-[1180px] px-4 md:px-8">
            <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
              <div>
                <Micro as="p">Scoring</Micro>
                <h2 className="mt-2 font-serif text-[38px] leading-tight text-ink md:text-[46px]">
                  Every score shows its working
                </h2>
                <p className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-muted">
                  No opaque black box. Four immutable weights applied uniformly across every indexed role. Update your resume or career preferences, and immediately verify which marks adjust.
                </p>

                <div className="mt-8">
                  <div
                    className="flex h-4 overflow-hidden rounded-full shadow-inner"
                    role="img"
                    aria-label="Weights: skills 70, role 15, location 10, experience 5"
                  >
                    <span className="bg-ink transition-all" style={{ width: '70%' }} />
                    <span className="bg-terra transition-all" style={{ width: '15%' }} />
                    <span className="bg-blue transition-all" style={{ width: '10%' }} />
                    <span className="bg-amber transition-all" style={{ width: '5%' }} />
                  </div>
                  <dl className="mt-6 grid grid-cols-4 gap-4 text-center sm:text-left">
                    {[
                      ['Skills', 70, 'bg-ink'],
                      ['Role', 15, 'bg-terra'],
                      ['Location', 10, 'bg-blue'],
                      ['Experience', 5, 'bg-amber'],
                    ].map(([k, v, c]) => (
                      <div key={k as string} className="border-t border-line pt-3">
                        <dt className="flex items-center justify-center sm:justify-start gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                          <span className={cx('size-2 rounded-full', c as string)} aria-hidden />
                          {k}
                        </dt>
                        <dd className="mt-1 font-serif text-[32px] leading-none text-ink">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Direct Job Ledger Breakdown on Canvas (NO CARDS) */}
              <div className="border-t border-line pt-8 lg:border-t-0 lg:border-l lg:pl-12">
                <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <Micro as="p" className="text-terra">{sampleJob.company}</Micro>
                    <p className="mt-1 font-serif text-[26px] leading-snug text-ink">
                      {sampleJob.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-[42px] font-bold leading-none text-green">
                      {sampleJob.score}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                      / 100 MARKS
                    </div>
                  </div>
                </div>

                <ul className="mt-6 space-y-4">
                  {[
                    ['Skills', sampleJob.marks.skills, 70],
                    ['Role', sampleJob.marks.role, 15],
                    ['Location', sampleJob.marks.location, 10],
                    ['Experience', sampleJob.marks.experience, 5],
                  ].map(([k, v, m]) => (
                    <li key={k as string} className="grid grid-cols-[88px_1fr_48px] items-center gap-3">
                      <span className="text-[14px] text-muted">{k}</span>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-terra transition-all"
                          style={{ width: `${((v as number) / (m as number)) * 100}%` }}
                        />
                      </div>
                      <span className="text-right font-mono text-[12px] text-ink">
                        {v}/{m}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 space-y-2.5 border-t border-line pt-4 text-[13.5px]">
                  <p className="flex items-center gap-2 text-ink">
                    <Check className="size-4 shrink-0 text-green" aria-hidden />
                    <span>Matched: React, TypeScript, Next.js</span>
                  </p>
                  <p className="flex items-center gap-2 text-ink">
                    <Zap className="size-4 shrink-0 text-terra" aria-hidden />
                    <span>Missing: Node.js</span>
                    <span className="ml-auto font-mono text-[11.5px] font-medium text-green">
                      +9 marks available
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ: CLEAN LIGHT THEME (TEXT 100% VISIBLE) */}
        <section id="faq" className="flex min-h-screen flex-col justify-center border-b border-line bg-side py-24 text-ink">
          <div className="mx-auto w-full max-w-[1180px] px-4 md:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
              <div>
                <Micro as="p">FAQ</Micro>
                <h2 className="mt-2 font-serif text-[38px] leading-tight text-ink md:text-[44px]">
                  Questions, answered
                </h2>
                <p className="mt-3 text-[16px] text-muted">
                  Clear answers regarding resume handling, calculation integrity, and indexing cadence.
                </p>
              </div>

              {/* High-contrast dark text on light side background */}
              <ul className="divide-y divide-line border-y border-line">
                {faqList.map((f, i) => (
                  <li key={f.q}>
                    <button
                      type="button"
                      aria-expanded={faq === i}
                      aria-controls={`faq-${i}`}
                      onClick={() => setFaq(faq === i ? null : i)}
                      className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors duration-150 hover:text-terra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra"
                    >
                      <span className="font-serif text-[20px] text-ink">{f.q}</span>
                      <ChevronDown
                        className={cx('size-4 shrink-0 text-muted transition-transform duration-200', faq === i && 'rotate-180')}
                        aria-hidden
                      />
                    </button>
                    {faq === i && (
                      <p id={`faq-${i}`} className="-mt-1 pb-6 text-[15px] leading-relaxed text-muted">
                        {f.a}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FINAL CTA: CLEAN LIGHT THEME */}
        <section className="flex min-h-[60vh] flex-col justify-center border-b border-line bg-canvas py-24 text-ink">
          <div className="mx-auto w-full max-w-[1180px] px-4 md:px-8">
            <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-[640px]">
                <h2 className="font-serif text-[38px] font-normal leading-tight text-ink md:text-[48px]">
                  Start with your resume. Leave with a reason for every application.
                </h2>
                <p className="mt-4 text-[17px] text-muted">
                  Join students scoring tech jobs with zero guesswork. Set up your personalized career cockpit in two minutes.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="primary"
                  iconRight={ArrowRight}
                  onClick={() => navigate('signup')}
                  className="shadow-xl"
                >
                  Create your account
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER IN SIGNATURE CANVAS/SIDE THEME */}
      <footer className="border-t border-line bg-side py-14 text-ink">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-4 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8">
          <div>
            <span className="font-serif text-[24px] tracking-tight text-ink">Jaggle</span>
            <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed text-muted">
              A calm career cockpit for students and new graduates. Built with clarity.
            </p>
          </div>
          {[
            ['Product', ['Jobs', 'Resume Studio', 'Skills', 'Interview Prep']],
            ['Company', ['About', 'Careers', 'Contact']],
            ['Legal', ['Privacy', 'Terms', 'Data deletion']],
          ].map(([h, ls]) => (
            <div key={h as string}>
              <Micro as="p">{h as string}</Micro>
              <ul className="mt-3 space-y-2 text-[14px] text-muted">
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
        <div className="mx-auto max-w-[1180px] border-t border-line px-4 py-6 font-mono text-[11px] text-faint md:px-8">
          © 2025 Jaggle · Scores are transparent guidance, not algorithmic guarantees.
        </div>
      </footer>
    </div>
  );
}

const faqList = [
  {
    q: 'How does the match score work?',
    a: 'We evaluate four transparent weights: Skills (up to 70 marks), Role alignment (up to 15 marks), Preferred location (up to 10 marks), and Experience level (up to 5 marks). Total is 100, and every mark links to a verified resume point.',
  },
  {
    q: 'Does Jaggle share my resume with recruiters?',
    a: 'Never. Your resume text remains inside your private workspace. We only match it against job criteria locally in your session.',
  },
  {
    q: 'Can I track applications I made outside Jaggle?',
    a: 'Yes! The application board lets you add external applications manually, set follow-up dates, log interview rounds, and save notes.',
  },
  {
    q: 'How often are jobs refreshed?',
    a: 'The index syncs continuously across tech startup boards and direct company career portals.',
  },
];
