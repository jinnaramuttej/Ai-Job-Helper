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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
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
      <header className="sticky top-0 z-50 border-b border-white/15 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-6 px-4 md:px-8">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="font-serif text-[24px] tracking-tight text-white transition-colors group-hover:text-terra">
              Jaggle
            </span>
          </Link>
          <nav aria-label="Landing" className="hidden flex-1 items-center gap-6 text-[14px] text-white/80 md:flex">
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
              className="border border-white/20 bg-white/10 text-white hover:bg-white/25"
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
        {/* HERO SECTION WITH VIDEO BACKGROUND & LIGHT OVERLAY (NO CARDS) */}
        <section className="relative flex min-h-[92vh] items-center overflow-hidden py-24 md:py-32">
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

          {/* Light Translucent Overlay (video is clearly visible!) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/55" />

          {/* Direct Text on Top of Video (NO CARDS) */}
          <div className="relative z-10 mx-auto w-full max-w-[1180px] px-4 md:px-8">
            <div className="max-w-[760px]">
              <div className="reveal-on-scroll inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white backdrop-blur-sm">
                <span className="size-2 rounded-full bg-terra animate-pulse" />
                For students · internships & early careers
              </div>

              <h1 className="reveal-on-scroll mt-6 font-serif text-[48px] font-normal leading-[1.04] tracking-[-0.03em] text-white drop-shadow-md sm:text-[62px] md:text-[72px]">
                Know why a job fits you, before you apply.
              </h1>

              <p className="reveal-on-scroll mt-6 max-w-[620px] text-[18px] leading-relaxed text-white/90 drop-shadow sm:text-[20px]">
                Jaggle reads your resume, scores every listing out of 100, and shows its working: which skills earned marks, which are missing, and what one change would move the needle.
              </p>

              <div className="reveal-on-scroll mt-10 flex flex-wrap items-center gap-4">
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
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/30 bg-black/30 px-6 text-[15px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                >
                  See how scoring works
                </button>
              </div>

              <div className="reveal-on-scroll mt-10 flex flex-wrap items-center gap-6 border-t border-white/20 pt-6 text-[13px] text-white/80">
                <span className="flex items-center gap-2 font-mono text-[11.5px]">
                  <span className="size-2 rounded-full bg-green" />
                  {state === 'error'
                    ? 'Jobs indexed today: unavailable'
                    : `${data.stats.jobsIndexed || data.jobs.length || 128} jobs indexed today · scored in 1.8s`}
                </span>
                <span className="flex items-center gap-2 font-mono text-[11.5px]">
                  <ShieldCheck className="size-4 text-terra" /> 100% Private resume data
                </span>
                <span className="flex items-center gap-2 font-mono text-[11.5px]">
                  <Sparkles className="size-4 text-amber" /> Transparent 4-tier weighting
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION (BACKGROUND IMAGE WITH LIGHT OVERLAY, NO CARDS) */}
        <section id="how" className="relative overflow-hidden py-28">
          {/* Background Image with Light Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
              alt="Tech workspace collaboration"
              fill
              sizes="100vw"
              className="size-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1180px] px-4 md:px-8">
            <div className="reveal-on-scroll max-w-xl">
              <Micro as="p" className="text-terra">How it works</Micro>
              <h2 className="mt-2 font-serif text-[38px] leading-tight text-white drop-shadow md:text-[48px]">
                Three steps, no guesswork
              </h2>
              <p className="mt-3 text-[17px] text-white/90 drop-shadow">
                From your initial resume PDF to calibrated job applications with zero wasted effort.
              </p>
            </div>

            {/* Direct Columns with Separators (NO CARDS) */}
            <div className="mt-14 grid gap-10 md:grid-cols-3">
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
                <div key={s.step} className="reveal-on-scroll border-t-2 border-white/30 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-[44px] font-normal leading-none text-white/50">
                      {s.step}
                    </span>
                    <s.icon className="size-6 text-terra" />
                  </div>
                  <h3 className="mt-4 font-serif text-[24px] font-normal text-white drop-shadow">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-white/85 drop-shadow">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION (BACKGROUND IMAGE WITH LIGHT OVERLAY, NO CARDS) */}
        <section id="features" className="relative overflow-hidden py-28">
          {/* Background Image with Light Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80"
              alt="Architectural workspace"
              fill
              sizes="100vw"
              className="size-full object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1180px] px-4 md:px-8">
            <div className="reveal-on-scroll max-w-xl">
              <Micro as="p" className="text-terra">Features</Micro>
              <h2 className="mt-2 font-serif text-[38px] leading-tight text-white drop-shadow md:text-[48px]">
                A cockpit for the whole search
              </h2>
              <p className="mt-3 text-[17px] text-white/90 drop-shadow">
                Engineered specifically for university students navigating technical internships and early roles.
              </p>
            </div>

            {/* Direct Feature Items with Divider Lines (NO CARDS) */}
            <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
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
                <div key={f.title} className="reveal-on-scroll border-t border-white/25 pt-6">
                  <div className="flex items-center gap-2.5">
                    <f.icon className="size-5 text-terra" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-white/70">
                      {f.pill}
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-[22px] font-normal text-white drop-shadow">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-white/85 drop-shadow">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SCORING BREAKDOWN SECTION (BACKGROUND IMAGE WITH LIGHT OVERLAY, NO CARDS) */}
        <section id="scoring" className="relative overflow-hidden py-28">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80"
              alt="Analytics charts"
              fill
              sizes="100vw"
              className="size-full object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-[1180px] gap-14 px-4 md:px-8 lg:grid-cols-2 lg:items-center">
            <div className="reveal-on-scroll">
              <Micro as="p" className="text-terra">Scoring</Micro>
              <h2 className="mt-2 font-serif text-[38px] leading-tight text-white drop-shadow md:text-[48px]">
                Every score shows its working
              </h2>
              <p className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-white/90 drop-shadow">
                No opaque black box. Four immutable weights applied uniformly across every indexed role. Update your resume or career preferences, and immediately verify which marks adjust.
              </p>

              <div className="mt-8 border-t border-white/25 pt-6">
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
                <dl className="mt-6 grid grid-cols-4 gap-4 text-center sm:text-left">
                  {[
                    ['Skills', 70, 'bg-white'],
                    ['Role', 15, 'bg-terra'],
                    ['Location', 10, 'bg-blue'],
                    ['Experience', 5, 'bg-amber'],
                  ].map(([k, v, c]) => (
                    <div key={k as string} className="border-t border-white/20 pt-3">
                      <dt className="flex items-center justify-center sm:justify-start gap-1.5 font-mono text-[11px] uppercase tracking-wider text-white/70">
                        <span className={cx('size-2 rounded-full', c as string)} aria-hidden />
                        {k}
                      </dt>
                      <dd className="mt-1 font-serif text-[32px] leading-none text-white drop-shadow">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Direct Score Breakdown on Background (NO CARDS) */}
            <div className="reveal-on-scroll border-t border-white/25 pt-6 lg:border-t-0 lg:border-l lg:pl-10">
              <div className="flex items-start justify-between gap-3 border-b border-white/20 pb-4">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-terra">
                    {sampleJob.company}
                  </div>
                  <p className="mt-1 font-serif text-[26px] leading-snug text-white drop-shadow">
                    {sampleJob.title}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-serif text-[42px] font-bold leading-none text-green drop-shadow">
                    {sampleJob.score}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/70">
                    / 100 MARKS
                  </div>
                </div>
              </div>

              <ul className="mt-6 space-y-3.5">
                {[
                  ['Skills', sampleJob.marks.skills, 70],
                  ['Role', sampleJob.marks.role, 15],
                  ['Location', sampleJob.marks.location, 10],
                  ['Experience', sampleJob.marks.experience, 5],
                ].map(([k, v, m]) => (
                  <li key={k as string} className="grid grid-cols-[88px_1fr_48px] items-center gap-3">
                    <span className="text-[14px] text-white/80">{k}</span>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-terra transition-all"
                        style={{ width: `${((v as number) / (m as number)) * 100}%` }}
                      />
                    </div>
                    <span className="text-right font-mono text-[12px] text-white/90">
                      {v}/{m}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2 border-t border-white/20 pt-4 text-[13.5px]">
                <p className="flex items-center gap-2 text-white/90">
                  <Check className="size-4 shrink-0 text-green" aria-hidden />
                  <span>Matched: React, TypeScript, Next.js</span>
                </p>
                <p className="flex items-center gap-2 text-white/90">
                  <Zap className="size-4 shrink-0 text-terra" aria-hidden />
                  <span>Missing: Node.js</span>
                  <span className="ml-auto font-mono text-[11.5px] font-medium text-green">
                    +9 marks available
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION (NO CARDS) */}
        <section id="faq" className="relative overflow-hidden py-28">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80"
              alt="Workspace discussion"
              fill
              sizes="100vw"
              className="size-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-[1180px] gap-12 px-4 md:px-8 lg:grid-cols-[1fr_1.6fr]">
            <div className="reveal-on-scroll">
              <Micro as="p" className="text-terra">FAQ</Micro>
              <h2 className="mt-2 font-serif text-[38px] leading-tight text-white drop-shadow md:text-[44px]">
                Questions, answered
              </h2>
              <p className="mt-3 text-[16px] text-white/80 drop-shadow">
                Clear answers regarding resume handling, calculation integrity, and indexing cadence.
              </p>
            </div>
            <ul className="reveal-on-scroll divide-y divide-white/20 border-y border-white/20">
              {faqList.map((f, i) => (
                <li key={f.q}>
                  <button
                    type="button"
                    aria-expanded={faq === i}
                    aria-controls={`faq-${i}`}
                    onClick={() => setFaq(faq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors duration-150 hover:text-terra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra"
                  >
                    <span className="font-serif text-[20px] text-white drop-shadow">{f.q}</span>
                    <ChevronDown
                      className={cx('size-4 shrink-0 text-white/70 transition-transform duration-200', faq === i && 'rotate-180')}
                      aria-hidden
                    />
                  </button>
                  {faq === i && (
                    <p id={`faq-${i}`} className="-mt-1 pb-5 text-[15px] leading-relaxed text-white/85 drop-shadow">
                      {f.a}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* HEROIC FINAL CTA BANNER (LIGHT OVERLAY, NO CARDS) */}
        <section className="relative overflow-hidden py-28">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80"
              alt="Modern architectural tech workspace"
              fill
              sizes="100vw"
              className="size-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/35 to-terra/20" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1180px] px-4 md:px-8">
            <div className="reveal-on-scroll flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-[640px]">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-terra/50 bg-terra/30 px-3.5 py-1 font-mono text-[11px] uppercase tracking-wider text-white">
                  <Sparkles className="size-3 text-terra" /> Free for students
                </span>
                <h2 className="mt-4 font-serif text-[36px] font-normal leading-tight text-white drop-shadow-md md:text-[48px]">
                  Start with your resume. Leave with a reason for every application.
                </h2>
                <p className="mt-3 text-[17px] text-white/90 drop-shadow">
                  Join students scoring tech jobs with zero guesswork. Set up your personalized career cockpit in two minutes.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="primary"
                  iconRight={ArrowRight}
                  onClick={() => navigate('signup')}
                  className="shadow-2xl hover:shadow-terra/40"
                >
                  Create your account
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/15 bg-black py-14">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-4 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8">
          <div>
            <span className="font-serif text-[24px] tracking-tight text-white">Jaggle</span>
            <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed text-white/70">
              A calm career cockpit for students and new graduates. Built with clarity.
            </p>
          </div>
          {[
            ['Product', ['Jobs', 'Resume Studio', 'Skills', 'Interview Prep']],
            ['Company', ['About', 'Careers', 'Contact']],
            ['Legal', ['Privacy', 'Terms', 'Data deletion']],
          ].map(([h, ls]) => (
            <div key={h as string}>
              <Micro as="p" className="text-white/50">{h as string}</Micro>
              <ul className="mt-3 space-y-2 text-[14px] text-white/80">
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
        <div className="mx-auto max-w-[1180px] border-t border-white/10 px-4 py-6 font-mono text-[11px] text-white/50 md:px-8">
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
