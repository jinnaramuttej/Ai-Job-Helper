'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  FileCheck2,
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
import { Button, Card, MatchScore, Micro, Skeleton, cx } from '../ui';
import { C, HBar } from '../charts';
import { useGSAP, gsap } from '@/lib/gsap';

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

  // GSAP ScrollTrigger & entrance animations
  useGSAP(
    () => {
      if (!containerRef.current) return;

      // Hero text entrance
      gsap.from('.hero-fade-in', {
        y: 28,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
      });

      // Hero image & floating badges
      gsap.from('.hero-image-container', {
        scale: 0.94,
        opacity: 0,
        duration: 1.1,
        ease: 'power2.out',
      });

      gsap.from('.hero-float-badge', {
        y: 22,
        opacity: 0,
        duration: 0.8,
        stagger: 0.14,
        delay: 0.35,
        ease: 'back.out(1.5)',
      });

      // Scroll-triggered animations for each section
      const sections = gsap.utils.toArray<HTMLElement>('.scroll-reveal-section');
      sections.forEach((sec) => {
        const items = sec.querySelectorAll('.scroll-reveal-item');
        if (items.length > 0) {
          gsap.from(items, {
            scrollTrigger: {
              trigger: sec,
              start: 'top 82%',
            },
            y: 32,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
          });
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-canvas">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-6 px-4 md:px-8">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="font-serif text-[22px] tracking-tight text-ink transition-colors group-hover:text-terra">
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
        {/* HERO SECTION */}
        <section className="mx-auto grid max-w-[1180px] gap-12 px-4 pb-16 pt-12 md:px-8 md:pt-18 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <Micro as="p" className="hero-fade-in flex items-center gap-2">
              <span className="size-2 rounded-full bg-terra animate-pulse" aria-hidden />
              For students · internships and first jobs
            </Micro>
            <h1 className="hero-fade-in mt-5 font-serif text-[44px] leading-[1.04] tracking-[-0.025em] md:text-[62px]">
              Know why a job fits you, before you apply.
            </h1>
            <p className="hero-fade-in mt-5 max-w-[520px] text-[17px] leading-relaxed text-muted">
              Jaggle reads your resume, scores every listing out of 100, and shows its working: which skills earned marks, which are missing, and what one change would move the needle.
            </p>
            <div className="hero-fade-in mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="primary" iconRight={ArrowRight} onClick={() => navigate('signup')}>
                Get started free
              </Button>
              <Button size="lg" onClick={() => go('scoring')}>
                See how scoring works
              </Button>
            </div>
            <div className="hero-fade-in mt-6 flex flex-wrap items-center gap-3 text-[12px] text-muted">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 font-mono text-[11px] text-faint">
                <span className="size-1.5 rounded-full bg-green" />
                {state === 'error'
                  ? 'Jobs indexed today: unavailable'
                  : `${data.stats.jobsIndexed || data.jobs.length || 128} jobs indexed today · scored in 1.8s`}
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-muted">
                <ShieldCheck className="size-3.5 text-terra" /> 100% Private resume data
              </span>
            </div>
          </div>

          {/* Hero Visual Composition with Real Imagery and Floating Widgets */}
          {state === 'loading' ? (
            <Skeleton className="h-[480px] rounded-2xl" />
          ) : (
            <HeroVisual data={data} empty={state === 'empty' || !data.jobs.length} />
          )}
        </section>

        {/* HOW IT WORKS SECTION (Real pictures with overlays) */}
        <section id="how" className="scroll-reveal-section border-t border-line bg-side/60 py-20">
          <div className="mx-auto max-w-[1180px] px-4 md:px-8">
            <div className="max-w-xl">
              <Micro as="p">How it works</Micro>
              <h2 className="mt-2 font-serif text-[34px] leading-tight md:text-[42px]">Three steps, no guesswork</h2>
              <p className="mt-3 text-[16px] text-muted">
                From your initial resume PDF to calibrated job applications with zero wasted effort.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: '01',
                  icon: Upload,
                  title: 'Upload your resume',
                  desc: 'We extract your verified skills, education, coursework, and past projects into an active student profile. You review and correct anything in seconds.',
                  image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
                  badge: 'ATS Parsing & Verification',
                  tagTone: 'terra',
                },
                {
                  step: '02',
                  icon: Target,
                  title: 'Every job gets marks',
                  desc: 'Transparent weights: Skills 70, Role alignment 15, Preferred location 10, Experience 5. Every single mark cites an exact line from your resume.',
                  image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                  badge: '100-Point Match Ledger',
                  tagTone: 'green',
                },
                {
                  step: '03',
                  icon: Sparkles,
                  title: 'Close the gaps & get hired',
                  desc: 'Discover the exact skill or keyword that turns multiple 50s into 70+ strong matches. Track applications on an integrated Kanban board.',
                  image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
                  badge: 'Targeted Skill Backlog',
                  tagTone: 'amber',
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="scroll-reveal-item group relative overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-pop"
                >
                  {/* Photo Container with Overlay */}
                  <div className="relative h-48 w-full overflow-hidden bg-ink/10">
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent" />
                    <div className="absolute left-4 top-4 flex items-center justify-between gap-2">
                      <span className="font-serif text-[28px] font-bold text-white/90 drop-shadow-md">
                        {s.step}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/70 px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider text-white backdrop-blur-md">
                        <s.icon className="size-3 text-terra" />
                        {s.badge}
                      </span>
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="p-6">
                    <h3 className="font-serif text-[22px] font-normal leading-snug text-ink group-hover:text-terra transition-colors">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION (Visual cards with photography & overlays) */}
        <section id="features" className="scroll-reveal-section border-t border-line py-20">
          <div className="mx-auto max-w-[1180px] px-4 md:px-8">
            <div className="max-w-xl">
              <Micro as="p">Features</Micro>
              <h2 className="mt-2 font-serif text-[34px] leading-tight md:text-[42px]">
                A cockpit for the whole search
              </h2>
              <p className="mt-3 text-[16px] text-muted">
                Engineered specifically for students navigating tech internships and early-career job hunts.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Target,
                  title: 'Match scores with working',
                  desc: 'A side-by-side ledger of every job with matched skills, missing requirements, and line citations.',
                  image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80',
                  pill: 'Skills 70 · Role 15 · Loc 10',
                },
                {
                  icon: FileText,
                  title: 'Resume Studio',
                  desc: 'Comprehensive ATS diagnostics, version comparison, and tailoring advice that never fabricates experience.',
                  image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80',
                  pill: 'ATS 88 · Keywords Align',
                },
                {
                  icon: Layers,
                  title: 'Skill backlog',
                  desc: 'Identifies which missing skill unlocks the largest volume of high-scoring positions across the market.',
                  image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80',
                  pill: '+9 Marks · 14 Jobs Impacted',
                },
                {
                  icon: SquareKanban,
                  title: 'Application board',
                  desc: 'Kanban columns, timeline tracking, follow-up deadlines, and auto-generated correspondence drafts.',
                  image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=700&q=80',
                  pill: 'Kanban & Timeline Sync',
                },
                {
                  icon: MessagesSquare,
                  title: 'Interview prep',
                  desc: 'Position-specific technical and behavioral questions, timed practice modes, and structured STAR note logs.',
                  image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80',
                  pill: 'Role-Specific Prompts',
                },
                {
                  icon: Sparkles,
                  title: 'Jaggle Command',
                  desc: 'Natural language queries like “remote frontend roles above 65 marks”. Every suggestion cites verifiable sources.',
                  image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=700&q=80',
                  pill: 'AI-Powered Assistant',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="scroll-reveal-item group relative overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border-subtle hover:shadow-card"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-ink/10">
                    <Image
                      src={f.image}
                      alt={f.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/75 px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider text-white backdrop-blur-md">
                      <f.icon className="size-3 text-terra" />
                      {f.pill}
                    </span>
                  </div>
                  <div className="p-6 pt-3">
                    <h3 className="font-serif text-[21px] font-normal text-ink group-hover:text-terra transition-colors">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SCORING BREAKDOWN SECTION */}
        <section id="scoring" className="scroll-reveal-section border-t border-line bg-side py-20">
          <div className="mx-auto grid max-w-[1180px] gap-12 px-4 md:px-8 lg:grid-cols-2 lg:items-center">
            <div>
              <Micro as="p">Scoring</Micro>
              <h2 className="mt-2 font-serif text-[34px] leading-tight md:text-[42px]">
                Every score shows its working
              </h2>
              <p className="mt-4 max-w-[480px] text-[16px] leading-relaxed text-muted">
                No opaque black box. Four immutable weights applied uniformly across every indexed role. Update your resume or career preferences, and immediately verify which marks adjust.
              </p>

              <div className="mt-8 rounded-2xl border border-line bg-card p-6 shadow-sm">
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
                <dl className="mt-5 grid grid-cols-4 gap-3 text-center sm:text-left">
                  {[
                    ['Skills', 70, 'bg-ink'],
                    ['Role', 15, 'bg-terra'],
                    ['Location', 10, 'bg-blue'],
                    ['Experience', 5, 'bg-amber'],
                  ].map(([k, v, c]) => (
                    <div key={k as string} className="rounded-xl border border-line bg-canvas/60 p-3">
                      <dt className="flex items-center justify-center sm:justify-start gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                        <span className={cx('size-2 rounded-full', c as string)} aria-hidden />
                        {k}
                      </dt>
                      <dd className="mt-1 font-serif text-[28px] leading-none text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Interactive breakdown card with visual polish */}
            <div className="scroll-reveal-item">
              {data.jobs[0] ? <Breakdown job={data.jobs[0]} /> : null}
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section id="faq" className="scroll-reveal-section border-t border-line py-20">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-4 md:px-8 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <Micro as="p">FAQ</Micro>
              <h2 className="mt-2 font-serif text-[34px] leading-tight md:text-[40px]">
                Questions, answered
              </h2>
              <p className="mt-3 text-[15px] text-muted">
                Clear answers regarding resume handling, calculation integrity, and indexing cadence.
              </p>
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {faqList.map((f, i) => (
                <li key={f.q}>
                  <button
                    type="button"
                    aria-expanded={faq === i}
                    aria-controls={`faq-${i}`}
                    onClick={() => setFaq(faq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors duration-150 hover:text-terra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    <span className="font-serif text-[19px]">{f.q}</span>
                    <ChevronDown
                      className={cx('size-4 shrink-0 text-muted transition-transform duration-200', faq === i && 'rotate-180')}
                      aria-hidden
                    />
                  </button>
                  {faq === i && (
                    <p id={`faq-${i}`} className="-mt-1 pb-5 text-[14.5px] leading-relaxed text-muted animate-in fade-in">
                      {f.a}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* HEROIC FINAL CTA BANNER */}
        <section className="scroll-reveal-section border-t border-line bg-canvas py-16">
          <div className="mx-auto max-w-[1180px] px-4 md:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-ink/20 bg-ink p-8 text-white shadow-pop md:p-14">
              {/* Background atmospheric image with dark overlay */}
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

              <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-[620px]">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-terra/30 bg-terra/20 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-white">
                    <Sparkles className="size-3 text-terra" /> Free for students
                  </span>
                  <h2 className="mt-4 font-serif text-[32px] font-normal leading-tight md:text-[44px]">
                    Start with your resume. Leave with a reason for every application.
                  </h2>
                  <p className="mt-3 text-[16px] text-white/70">
                    Join university students scoring jobs with zero guesswork. Set up your personalized career cockpit in two minutes.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    variant="primary"
                    iconRight={ArrowRight}
                    onClick={() => navigate('signup')}
                    className="shadow-lg hover:shadow-terra/30"
                  >
                    Create your account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-line bg-side">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8">
          <div>
            <span className="font-serif text-[22px] tracking-tight text-ink">Jaggle</span>
            <p className="mt-2 max-w-[280px] text-[13.5px] leading-relaxed text-muted">
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
          © 2025 Jaggle · Scores are transparent guidance, not algorithmic guarantees.
        </div>
      </footer>
    </div>
  );
}

// Hero Visual Component with Real Picture, Overlays, and Floating Live Badges
function HeroVisual({ data, empty }: { data: UIData; empty: boolean }) {
  const sampleJob = data.jobs[0] ?? {
    title: 'Frontend Engineer',
    company: 'Vercel',
    score: 92,
    marks: { skills: 65, role: 14, location: 9, experience: 4 },
  };

  return (
    <div className="hero-image-container relative mx-auto w-full max-w-[560px]">
      {/* Outer Card / Frame */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-card p-2 shadow-pop">
        {/* Real Photo with Dark Atmospheric Overlay */}
        <div className="relative h-[440px] w-full overflow-hidden rounded-2xl bg-ink sm:h-[480px]">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
            alt="Student developers collaborating in a modern workspace"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 560px"
            className="size-full object-cover opacity-90 transition-transform duration-700 hover:scale-103"
          />
          {/* Subtle multi-layer gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-ink/60" />

          {/* Floating Glassmorphism Badge: Top-Left Match Score */}
          <div className="hero-float-badge animate-float absolute left-4 top-4 max-w-[270px] rounded-2xl border border-white/20 bg-ink/75 p-3.5 text-white shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-green">
                <Target className="size-3.5" />
                94 Match Score
              </span>
              <span className="rounded-full bg-green/20 px-2 py-0.5 font-mono text-[10px] text-green">
                STRONG FIT
              </span>
            </div>
            <div className="mt-2 font-serif text-[16px] leading-snug">{sampleJob.title}</div>
            <div className="text-[12px] text-white/70">{sampleJob.company} · Remote</div>
            <div className="mt-2.5 flex items-center gap-1.5 font-mono text-[10px] text-white/80 border-t border-white/10 pt-2">
              <span className="size-1.5 rounded-full bg-terra" />
              Skills 68/70 · Role 15/15 · Loc 10/10
            </div>
          </div>

          {/* Floating Glassmorphism Badge: Top-Right Skill Boost */}
          <div className="hero-float-badge animate-float-delayed absolute right-4 top-16 hidden max-w-[210px] rounded-2xl border border-white/20 bg-ink/75 p-3 text-white shadow-xl backdrop-blur-md sm:block">
            <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-terra">
              <Zap className="size-3.5" />
              <span>+9 Marks Available</span>
            </div>
            <div className="mt-1 text-[12.5px] leading-tight text-white/90">
              Add <span className="font-medium text-white">TypeScript</span> to unlock 11 more roles
            </div>
          </div>

          {/* Floating Glassmorphism Badge: Bottom-Left ATS Health */}
          <div className="hero-float-badge animate-float absolute bottom-4 left-4 max-w-[260px] rounded-2xl border border-white/20 bg-ink/75 p-3.5 text-white shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-xl bg-terra/20 text-terra">
                <FileCheck2 className="size-4" />
              </div>
              <div>
                <div className="font-mono text-[11px] text-white/80">Resume ATS Score</div>
                <div className="font-serif text-[18px] leading-none text-white">88 / 100 · Optimal</div>
              </div>
            </div>
            <p className="mt-2 text-[11.5px] text-white/70">
              0 formatting warnings · Keywords match 92% of target tech roles
            </p>
          </div>

          {/* Floating Glassmorphism Badge: Bottom-Right Interview Alert */}
          <div className="hero-float-badge animate-float-delayed absolute bottom-6 right-4 hidden max-w-[200px] rounded-2xl border border-white/20 bg-ink/75 p-3 text-white shadow-xl backdrop-blur-md sm:block">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber">
              <Calendar className="size-3" />
              <span>Interview Prep Ready</span>
            </div>
            <div className="mt-1 text-[12px] font-medium leading-snug">
              Tomorrow · 2:30 PM
            </div>
            <div className="mt-0.5 text-[11px] text-white/60">3 STAR stories organized</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Breakdown Sub-component with Clean Visuals
function Breakdown({ job, compact }: { job: Job; compact?: boolean }) {
  const node =
    job.skills.find((s) => !s.have && s.name === 'Node.js') ??
    job.skills.filter((s) => !s.have).sort((a, b) => b.marks - a.marks)[0];
  const rows: [string, number, number][] = [
    ['Skills', job.marks.skills, 70],
    ['Role', job.marks.role, 15],
    ['Location', job.marks.location, 10],
    ['Experience', job.marks.experience, 5],
  ];

  const inner = (
    <div className={compact ? 'p-4' : 'p-6'}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Micro as="p" className="text-terra">{job.company}</Micro>
          <p className="mt-1 font-serif text-[20px] leading-snug">{job.title}</p>
        </div>
        <MatchScore score={job.score} size={compact ? 'xs' : 'sm'} bar={false} />
      </div>
      <ul className="mt-5 space-y-3">
        {rows.map(([k, v, m]) => (
          <li key={k} className="grid grid-cols-[80px_1fr_48px] items-center gap-3">
            <span className="text-[13px] text-muted">{k}</span>
            <HBar
              value={v}
              max={m}
              extra={k === 'Skills' ? node?.marks : undefined}
              extraColor={C.green}
              height={6}
              label={`${k} ${v} of ${m}`}
            />
            <span className="text-right font-mono text-[12px] text-ink">
              {v}/{m}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 space-y-2 border-t border-line pt-4 text-[13px]">
        <p className="flex items-center gap-2 text-ink">
          <Check className="size-4 text-green shrink-0" aria-hidden />
          <span>Matched: {job.skills.filter((s) => s.have).slice(0, 4).map((s) => s.name).join(', ')}</span>
        </p>
        {node && (
          <p className="flex items-center gap-2 text-ink">
            <span className="size-4 shrink-0 grid place-items-center rounded-full bg-terra/10 text-terra text-[11px] font-mono">
              +
            </span>
            <span>Missing: {node.name}</span>
            <span className="ml-auto rounded-full border border-green/30 bg-green/10 px-2.5 py-0.5 font-mono text-[11px] text-green font-medium">
              +{node.marks} → {job.score + node.marks} marks
            </span>
          </p>
        )}
      </div>
    </div>
  );

  return compact ? inner : <Card className="shadow-card">{inner}</Card>;
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
