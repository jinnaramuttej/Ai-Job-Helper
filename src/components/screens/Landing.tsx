'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
  Layers,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  SquareKanban,
  Target,
  TriangleAlert,
  Upload,
  Zap,
} from 'lucide-react';
import type { Job, UIData } from '@/lib/view-models';
import { Button, MatchScore, Micro, Skeleton, cx } from '../ui';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // Reliable scroll trigger with IntersectionObserver
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const sampleJob = data.jobs[0] ?? {
    id: 'sample',
    title: 'Frontend Engineer',
    company: 'Linear',
    city: 'Remote',
    mode: 'Full-time',
    score: 92,
    postedHours: 12,
    marks: { skills: 65, role: 14, location: 9, experience: 4 },
    skills: [
      { name: 'React', have: true, marks: 18 },
      { name: 'TypeScript', have: true, marks: 16 },
      { name: 'Next.js', have: true, marks: 15 },
      { name: 'Node.js', have: false, marks: 9 },
    ],
    why: {
      skills: 'Matches 3 of 4 core skills',
      role: 'Direct match for Frontend Engineer',
      location: 'Remote position matches preference',
      experience: '0-2 years required',
    },
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-ink text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-6 px-4 md:px-8">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="font-serif text-[24px] tracking-tight text-white transition-colors group-hover:text-terra">
              Jaggle
            </span>
          </Link>
          <nav aria-label="Landing" className="hidden flex-1 items-center gap-6 text-[14px] text-white/70 md:flex">
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
                className="transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra"
              >
                {l}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => navigate('login')}
              className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              Sign in
            </Button>
            <Button size="sm" variant="primary" onClick={() => navigate('signup')}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      {state === 'error' && (
        <div role="alert" className="border-b border-terra/30 bg-terra/20">
          <div className="mx-auto flex max-w-[1180px] items-center gap-2 px-4 py-2.5 text-[13px] text-white md:px-8">
            <TriangleAlert className="size-4 text-terra" aria-hidden />
            Live job counts are temporarily unavailable. Sign-up still works.
          </div>
        </div>
      )}

      <main>
        {/* HERO SECTION WITH VIDEO BACKGROUND & DARK OVERLAY */}
        <section className="relative flex min-h-[90vh] items-center overflow-hidden border-b border-white/10 py-20 md:py-28">
          {/* Background Video */}
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

          {/* Dark Overlay on top of the video */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink/95 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-radial-gradient from-terra/10 via-transparent to-transparent opacity-50" />

          {/* Hero Content on top of the overlay */}
          <div className="relative z-10 mx-auto w-full max-w-[1180px] px-4 md:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="reveal-on-scroll inline-flex items-center gap-2 rounded-full border border-terra/30 bg-terra/15 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white">
                  <span className="size-2 rounded-full bg-terra animate-pulse" />
                  For students · internships & early careers
                </div>

                <h1 className="reveal-on-scroll mt-6 font-serif text-[44px] font-normal leading-[1.05] tracking-[-0.03em] text-white md:text-[64px]">
                  Know why a job fits you, before you apply.
                </h1>

                <p className="reveal-on-scroll mt-6 max-w-[540px] text-[17px] leading-relaxed text-white/80 md:text-[18px]">
                  Jaggle reads your resume, scores every listing out of 100, and shows its working: which skills earned marks, which are missing, and what one change would move the needle.
                </p>

                <div className="reveal-on-scroll mt-8 flex flex-wrap items-center gap-4">
                  <Button
                    size="lg"
                    variant="primary"
                    iconRight={ArrowRight}
                    onClick={() => navigate('signup')}
                    className="shadow-lg hover:shadow-terra/30"
                  >
                    Get started free
                  </Button>
                  <button
                    type="button"
                    onClick={() => go('scoring')}
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 text-[14px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    See how scoring works
                  </button>
                </div>

                <div className="reveal-on-scroll mt-8 flex flex-wrap items-center gap-4 text-[12px] text-white/70">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px]">
                    <span className="size-1.5 rounded-full bg-green" />
                    {state === 'error'
                      ? 'Jobs indexed today: unavailable'
                      : `${data.stats.jobsIndexed || data.jobs.length || 128} jobs indexed today · scored in 1.8s`}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <ShieldCheck className="size-3.5 text-terra" /> 100% Private resume data
                  </span>
                </div>
              </div>

              {/* Hero Live Job Breakdown Overlaid on the Video */}
              <div className="reveal-on-scroll">
                {state === 'loading' ? (
                  <Skeleton className="h-[420px] rounded-3xl bg-white/10" />
                ) : (
                  <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-ink/75 p-6 shadow-2xl backdrop-blur-xl md:p-8">
                    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="font-mono text-[11px] uppercase tracking-wider text-terra">
                          Featured Match Preview
                        </div>
                        <div className="mt-1 font-serif text-[22px] font-normal text-white">
                          {sampleJob.title}
                        </div>
                        <div className="text-[13px] text-white/70">
                          {sampleJob.company} · {sampleJob.city}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-[36px] font-bold leading-none text-green">
                          {sampleJob.score}
                        </div>
                        <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/60">
                          / 100 MARKS
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        ['Skills', sampleJob.marks.skills, 70],
                        ['Role', sampleJob.marks.role, 15],
                        ['Location', sampleJob.marks.location, 10],
                        ['Experience', sampleJob.marks.experience, 5],
                      ].map(([k, v, m]) => (
                        <div key={k as string} className="grid grid-cols-[80px_1fr_48px] items-center gap-3">
                          <span className="text-[13px] text-white/70">{k}</span>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-terra transition-all"
                              style={{ width: `${((v as number) / (m as number)) * 100}%` }}
                            />
                          </div>
                          <span className="text-right font-mono text-[11.5px] text-white/90">
                            {v}/{m}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3.5">
                      <div className="flex items-center gap-2 text-[12.5px] text-white/90">
                        <Check className="size-4 shrink-0 text-green" />
                        <span>Matched: React, TypeScript, Next.js</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[12.5px]">
                        <span className="text-white/70">Missing skill: Node.js</span>
                        <span className="font-mono text-[11px] font-medium text-green">
                          +9 marks available
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION (WITH BACKGROUND IMAGE & DARK OVERLAY) */}
        <section id="how" className="relative overflow-hidden border-b border-white/10 py-24">
          {/* Background Image with Dark Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
              alt="Tech workspace collaboration"
              fill
              sizes="100vw"
              className="size-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-ink/90" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1180px] px-4 md:px-8">
            <div className="reveal-on-scroll max-w-xl">
              <Micro as="p" className="text-terra">How it works</Micro>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-white md:text-[44px]">
                Three steps, no guesswork
              </h2>
              <p className="mt-3 text-[16px] text-white/70">
                From your initial resume PDF to targeted job applications with zero wasted effort.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
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
                <div
                  key={s.step}
                  className="reveal-on-scroll rounded-2xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-[38px] font-normal leading-none text-white/30">
                      {s.step}
                    </span>
                    <div className="grid size-10 place-items-center rounded-xl bg-terra/20 text-terra">
                      <s.icon className="size-5" />
                    </div>
                  </div>
                  <h3 className="mt-6 font-serif text-[22px] font-normal text-white">{s.title}</h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-white/70">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION (WITH BACKGROUND IMAGE & DARK OVERLAY) */}
        <section id="features" className="relative overflow-hidden border-b border-white/10 py-24">
          {/* Background Image with Dark Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80"
              alt="Architectural workspace"
              fill
              sizes="100vw"
              className="size-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-ink/90" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1180px] px-4 md:px-8">
            <div className="reveal-on-scroll max-w-xl">
              <Micro as="p" className="text-terra">Features</Micro>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-white md:text-[44px]">
                A cockpit for the whole search
              </h2>
              <p className="mt-3 text-[16px] text-white/70">
                Engineered specifically for university students navigating technical internships and early roles.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Target,
                  title: 'Match scores with working',
                  desc: 'A side-by-side ledger of every job with matched skills, missing requirements, and line citations.',
                  pill: 'Skills 70 · Role 15 · Loc 10',
                },
                {
                  icon: FileText,
                  title: 'Resume Studio',
                  desc: 'Comprehensive ATS diagnostics, version comparison, and tailoring advice that never fabricates experience.',
                  pill: 'ATS 88 · Keywords Align',
                },
                {
                  icon: Layers,
                  title: 'Skill backlog',
                  desc: 'Identifies which missing skill unlocks the largest volume of high-scoring positions across the market.',
                  pill: '+9 Marks · 14 Jobs Impacted',
                },
                {
                  icon: SquareKanban,
                  title: 'Application board',
                  desc: 'Kanban columns, timeline tracking, follow-up deadlines, and auto-generated correspondence drafts.',
                  pill: 'Kanban & Timeline Sync',
                },
                {
                  icon: MessagesSquare,
                  title: 'Interview prep',
                  desc: 'Position-specific technical and behavioral questions, timed practice modes, and structured STAR note logs.',
                  pill: 'Role-Specific Prompts',
                },
                {
                  icon: Sparkles,
                  title: 'Jaggle Command',
                  desc: 'Natural language queries like “remote frontend roles above 65 marks”. Every suggestion cites verifiable sources.',
                  pill: 'AI-Powered Assistant',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="reveal-on-scroll rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid size-9 place-items-center rounded-lg bg-white/10 text-white">
                      <f.icon className="size-4 text-terra" />
                    </div>
                    <span className="font-mono text-[10.5px] uppercase tracking-wider text-white/50">
                      {f.pill}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-[20px] font-normal text-white">{f.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/70">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SCORING BREAKDOWN SECTION (WITH BACKGROUND IMAGE & OVERLAY) */}
        <section id="scoring" className="relative overflow-hidden border-b border-white/10 py-24">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80"
              alt="Analytics charts"
              fill
              sizes="100vw"
              className="size-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-ink/90" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-[1180px] gap-12 px-4 md:px-8 lg:grid-cols-2 lg:items-center">
            <div className="reveal-on-scroll">
              <Micro as="p" className="text-terra">Scoring</Micro>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-white md:text-[44px]">
                Every score shows its working
              </h2>
              <p className="mt-4 max-w-[480px] text-[16px] leading-relaxed text-white/80">
                No opaque black box. Four immutable weights applied uniformly across every indexed role. Update your resume or career preferences, and immediately verify which marks adjust.
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md">
                <div
                  className="flex h-3.5 overflow-hidden rounded-full shadow-inner"
                  role="img"
                  aria-label="Weights: skills 70, role 15, location 10, experience 5"
                >
                  <span className="bg-white transition-all" style={{ width: '70%' }} />
                  <span className="bg-terra transition-all" style={{ width: '15%' }} />
                  <span className="bg-blue transition-all" style={{ width: '10%' }} />
                  <span className="bg-amber transition-all" style={{ width: '5%' }} />
                </div>
                <dl className="mt-5 grid grid-cols-4 gap-3 text-center sm:text-left">
                  {[
                    ['Skills', 70, 'bg-white'],
                    ['Role', 15, 'bg-terra'],
                    ['Location', 10, 'bg-blue'],
                    ['Experience', 5, 'bg-amber'],
                  ].map(([k, v, c]) => (
                    <div key={k as string} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <dt className="flex items-center justify-center sm:justify-start gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/60">
                        <span className={cx('size-2 rounded-full', c as string)} aria-hidden />
                        {k}
                      </dt>
                      <dd className="mt-1 font-serif text-[28px] leading-none text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="reveal-on-scroll">
              {data.jobs[0] ? <Breakdown job={data.jobs[0]} /> : null}
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section id="faq" className="border-b border-white/10 bg-ink/95 py-24">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-4 md:px-8 lg:grid-cols-[1fr_1.6fr]">
            <div className="reveal-on-scroll">
              <Micro as="p" className="text-terra">FAQ</Micro>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-white md:text-[40px]">
                Questions, answered
              </h2>
              <p className="mt-3 text-[15px] text-white/70">
                Clear answers regarding resume handling, calculation integrity, and indexing cadence.
              </p>
            </div>
            <ul className="reveal-on-scroll divide-y divide-white/10 border-y border-white/10">
              {faqList.map((f, i) => (
                <li key={f.q}>
                  <button
                    type="button"
                    aria-expanded={faq === i}
                    aria-controls={`faq-${i}`}
                    onClick={() => setFaq(faq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors duration-150 hover:text-terra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra"
                  >
                    <span className="font-serif text-[19px] text-white">{f.q}</span>
                    <ChevronDown
                      className={cx('size-4 shrink-0 text-white/60 transition-transform duration-200', faq === i && 'rotate-180')}
                      aria-hidden
                    />
                  </button>
                  {faq === i && (
                    <p id={`faq-${i}`} className="-mt-1 pb-5 text-[14.5px] leading-relaxed text-white/75">
                      {f.a}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* HEROIC FINAL CTA BANNER (WITH BACKGROUND IMAGE & OVERLAY) */}
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80"
              alt="Modern architectural tech workspace"
              fill
              sizes="100vw"
              className="size-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-terra/20" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1180px] px-4 md:px-8">
            <div className="reveal-on-scroll flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-[620px]">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-terra/40 bg-terra/20 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-white">
                  <Sparkles className="size-3 text-terra" /> Free for students
                </span>
                <h2 className="mt-4 font-serif text-[32px] font-normal leading-tight text-white md:text-[44px]">
                  Start with your resume. Leave with a reason for every application.
                </h2>
                <p className="mt-3 text-[16px] text-white/75">
                  Join students scoring tech jobs with zero guesswork. Set up your personalized career cockpit in two minutes.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="primary"
                  iconRight={ArrowRight}
                  onClick={() => navigate('signup')}
                  className="shadow-xl hover:shadow-terra/30"
                >
                  Create your account
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-ink py-12">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-4 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8">
          <div>
            <span className="font-serif text-[22px] tracking-tight text-white">Jaggle</span>
            <p className="mt-2 max-w-[280px] text-[13.5px] leading-relaxed text-white/60">
              A calm career cockpit for students and new graduates. Built with clarity.
            </p>
          </div>
          {[
            ['Product', ['Jobs', 'Resume Studio', 'Skills', 'Interview Prep']],
            ['Company', ['About', 'Careers', 'Contact']],
            ['Legal', ['Privacy', 'Terms', 'Data deletion']],
          ].map(([h, ls]) => (
            <div key={h as string}>
              <Micro as="p" className="text-white/40">{h as string}</Micro>
              <ul className="mt-3 space-y-2 text-[13.5px] text-white/70">
                {(ls as string[]).map((l) => (
                  <li key={l}>
                    <button
                      type="button"
                      onClick={() => navigate(l.toLowerCase().replace(/\s+/g, '-'))}
                      className="transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terra"
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-[1180px] border-t border-white/10 px-4 py-5 font-mono text-[11px] text-white/40 md:px-8">
          © 2025 Jaggle · Scores are transparent guidance, not algorithmic guarantees.
        </div>
      </footer>
    </div>
  );
}

// Clean Job Breakdown Component with High Contrast Glass Card
function Breakdown({ job }: { job: Job }) {
  const node =
    job.skills.find((s) => !s.have && s.name === 'Node.js') ??
    job.skills.filter((s) => !s.have).sort((a, b) => b.marks - a.marks)[0];
  const rows: [string, number, number][] = [
    ['Skills', job.marks.skills, 70],
    ['Role', job.marks.role, 15],
    ['Location', job.marks.location, 10],
    ['Experience', job.marks.experience, 5],
  ];

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-xl md:p-8">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-terra">
            {job.company}
          </div>
          <p className="mt-1 font-serif text-[22px] leading-snug text-white">{job.title}</p>
        </div>
        <div className="text-right">
          <div className="font-serif text-[36px] font-bold leading-none text-green">
            {job.score}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/60">
            / 100 MARKS
          </div>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {rows.map(([k, v, m]) => (
          <li key={k} className="grid grid-cols-[80px_1fr_48px] items-center gap-3">
            <span className="text-[13px] text-white/70">{k}</span>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-terra transition-all"
                style={{ width: `${(v / m) * 100}%` }}
              />
            </div>
            <span className="text-right font-mono text-[12px] text-white/90">
              {v}/{m}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-[13px]">
        <p className="flex items-center gap-2 text-white/90">
          <Check className="size-4 shrink-0 text-green" aria-hidden />
          <span>Matched: {job.skills.filter((s) => s.have).slice(0, 4).map((s) => s.name).join(', ')}</span>
        </p>
        {node && (
          <p className="flex items-center gap-2 text-white/90">
            <Zap className="size-4 shrink-0 text-terra" aria-hidden />
            <span>Missing: {node.name}</span>
            <span className="ml-auto rounded-full border border-green/30 bg-green/20 px-2.5 py-0.5 font-mono text-[11px] font-medium text-green">
              +{node.marks} → {job.score + node.marks} marks
            </span>
          </p>
        )}
      </div>
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
