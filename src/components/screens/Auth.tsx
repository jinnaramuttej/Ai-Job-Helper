'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Mail, Plus, TriangleAlert, X } from 'lucide-react';
import type { Job, UIData } from '@/lib/view-models';
import { Button, Card, Chip, Field, MatchScore, Micro, Segmented, Skeleton, cx } from '../ui';
import { C, HBar } from '../charts';
import { jobsTouchedBy } from '@/lib/insights';

export function scorePassword(pw: string) {
  const rules = [
    { ok: pw.length >= 8, label: '8+ characters' },
    { ok: /[A-Z]/.test(pw) && /[a-z]/.test(pw), label: 'Upper and lower case' },
    { ok: /\d/.test(pw), label: 'A number' },
    { ok: /[^A-Za-z0-9]/.test(pw), label: 'A symbol' },
  ];
  return { rules, score: rules.filter((r) => r.ok).length };
}

export function PasswordStrength({ value }: { value: string }) {
  const { rules, score } = scorePassword(value);
  const words = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-terra', 'bg-terra', 'bg-amber', 'bg-blue', 'bg-green'];

  return (
    <div aria-live="polite">
      <div
        className="flex gap-1"
        role="meter"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={words[score]}
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cx('h-1.5 flex-1 rounded-full', i < score ? colors[score] : 'bg-soft')} />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted">{value ? words[score] : 'Strength'}</span>
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {rules.map((r) => (
            <li key={r.label} className={cx('flex items-center gap-1 text-[11.5px]', r.ok ? 'text-green' : 'text-faint')}>
              {r.ok ? <Check className="size-3" aria-hidden /> : <X className="size-3" aria-hidden />}
              {r.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AuthLayout({
  children,
  aside,
  previewJob,
}: {
  children: ReactNode;
  aside?: ReactNode;
  previewJob?: Job;
}) {
  const j = previewJob || {
    id: 'demo-job',
    company: 'Brightlane',
    title: 'Frontend Developer Intern',
    city: 'Bengaluru',
    score: 65,
    marks: { skills: 45, role: 10, location: 8, experience: 2 },
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col px-5 py-6 md:px-12">
        <Link href="/" className="flex w-fit items-baseline gap-2">
          <span className="font-serif text-[21px] text-ink">Jaggle</span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <p className="font-mono text-[11px] text-faint">© 2025 Jaggle · Privacy · Terms</p>
      </div>
      <div className="hidden border-l border-line bg-side p-10 lg:flex lg:items-center lg:justify-center">
        {aside ?? (
          <div className="w-full max-w-[440px]">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Micro as="p">
                    {j.company} · {j.city || 'Remote'}
                  </Micro>
                  <p className="mt-1 font-serif text-[20px] leading-snug">{j.title}</p>
                </div>
                <MatchScore score={j.score} size="sm" bar={false} />
              </div>
              <ul className="mt-5 space-y-2.5">
                {(
                  [
                    ['Skills', j.marks.skills, 70],
                    ['Role', j.marks.role, 15],
                    ['Location', j.marks.location, 10],
                    ['Experience', j.marks.experience, 5],
                  ] as [string, number, number][]
                ).map(([k, v, m]) => (
                  <li key={k} className="grid grid-cols-[80px_1fr_44px] items-center gap-3">
                    <span className="text-[12.5px] text-muted">{k}</span>
                    <HBar value={v} max={m} height={5} color={C.ink} />
                    <span className="text-right font-mono text-[11.5px]">
                      {v}/{m}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl bg-green/[0.07] px-3 py-2 text-[12.5px]">
                Add Node.js (+7) and this becomes a <b className="font-medium">Strong 72</b>.
              </p>
            </Card>
            <blockquote className="mt-8">
              <p className="font-serif text-[24px] leading-snug">
                “I stopped guessing. Every application now has a reason behind it.”
              </p>
              <footer className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                B.Tech CSE student, Pune
              </footer>
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
}

export function Banner({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-terra/25 bg-terra/[0.06] px-3.5 py-3 text-[13.5px]">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-terra" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export interface LoginScreenProps {
  initialEmail?: string;
  onSubmit: (creds: { email: string; password: string }) => Promise<void> | void;
  error?: string;
  loading?: boolean;
  onToast?: (msg: string) => void;
}

export function LoginScreen({ initialEmail = '', onSubmit, error = '', loading = false, onToast }: LoginScreenProps) {
  const [email, setEmail] = useState(initialEmail);
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [clientErr, setClientErr] = useState('');

  const displayError = error || clientErr;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setClientErr('Enter the email you signed up with.');
      return;
    }
    if (pw.length < 1) {
      setClientErr('Enter your password.');
      return;
    }
    setClientErr('');
    onSubmit({ email, password: pw });
  };

  return (
    <AuthLayout>
      <Micro as="p">Welcome back</Micro>
      <h1 className="mt-2 font-serif text-[36px] leading-tight">Sign in</h1>
      <p className="mt-1.5 text-[14.5px] text-muted">Pick up where you left off: scored matches are waiting.</p>
      <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
        {displayError && <Banner>{displayError}</Banner>}
        <Field label="Email" htmlFor="li-email">
          <input
            id="li-email"
            type="email"
            autoComplete="email"
            className="field"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            aria-invalid={!!displayError && !email.includes('@')}
          />
        </Field>
        <Field label="Password" htmlFor="li-pw">
          <div className="relative">
            <input
              id="li-pw"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              className="field pr-10"
              value={pw}
              disabled={loading}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            >
              {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </button>
          </div>
        </Field>
        <div className="flex items-center justify-between text-[13px]">
          <label className="inline-flex items-center gap-2 text-muted">
            <input type="checkbox" defaultChecked className="size-4" />
            Remember me
          </label>
          <button
            type="button"
            className="text-terra hover:underline focus-visible:outline-none"
            onClick={() => onToast?.('Reset link sent (demo)')}
          >
            Forgot password?
          </button>
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} disabled={loading}>
          {loading ? 'Signing in' : 'Sign in'}
        </Button>
        <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full"
          icon={Mail}
          disabled={loading}
          onClick={() => onToast?.('Magic link sent to your college email (demo)')}
        >
          Email me a sign-in link
        </Button>
      </form>
      <p className="mt-6 text-[13.5px] text-muted">
        New here?{' '}
        <Link href="/signup" className="font-medium text-terra hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export interface SignupScreenProps {
  onSubmit: (data: { name: string; email: string; password: string }) => Promise<void> | void;
  error?: string;
  loading?: boolean;
}

export function SignupScreen({ onSubmit, error = '', loading = false }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [agree, setAgree] = useState(false);
  const [clientErr, setClientErr] = useState('');

  const displayError = error || clientErr;
  const strong = scorePassword(pw).score >= 3;
  const valid = name.trim().length > 1 && email.includes('@') && strong && agree;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setClientErr('Please enter your full name.');
      return;
    }
    if (!email.includes('@')) {
      setClientErr('Please enter a valid email address.');
      return;
    }
    if (pw.length < 8) {
      setClientErr('Password must be at least 8 characters.');
      return;
    }
    if (!agree) {
      setClientErr('Please agree to the Terms and Privacy Policy.');
      return;
    }
    setClientErr('');
    onSubmit({ name, email, password: pw });
  };

  return (
    <AuthLayout>
      <Micro as="p">Free for students</Micro>
      <h1 className="mt-2 font-serif text-[36px] leading-tight">Create your account</h1>
      <p className="mt-1.5 text-[14.5px] text-muted">Two minutes now; every job scored from then on.</p>
      <form className="mt-7 space-y-4" noValidate onSubmit={handleSubmit}>
        {displayError && <Banner>{displayError}</Banner>}
        <Field label="Full name" htmlFor="su-name">
          <input
            id="su-name"
            autoComplete="name"
            className="field"
            value={name}
            disabled={loading}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ananya Sharma"
          />
        </Field>
        <Field label="Email" htmlFor="su-email" hint="College email unlocks campus-only listings.">
          <input
            id="su-email"
            type="email"
            autoComplete="email"
            className="field"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
          />
        </Field>
        <Field label="Password" htmlFor="su-pw">
          <input
            id="su-pw"
            type="password"
            autoComplete="new-password"
            className="field"
            value={pw}
            disabled={loading}
            onChange={(e) => setPw(e.target.value)}
          />
        </Field>
        <PasswordStrength value={pw} />
        <label className="flex items-start gap-2 text-[13px] text-muted">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 size-4"
          />
          I agree to the Terms and Privacy Policy. We never share your resume.
        </label>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={(!valid && !loading) || loading}
        >
          Create account
        </Button>
      </form>
      <p className="mt-6 text-[13.5px] text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-terra hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

const ROLE_OPTS = ['Frontend Developer', 'Full-stack Developer', 'Data Analyst', 'Backend Developer', 'QA Engineer', 'Mobile Developer'];
const SKILL_OPTS = ['React', 'JavaScript', 'HTML', 'CSS', 'Git', 'Python', 'SQL', 'TypeScript', 'Node.js', 'Java', 'C++', 'Figma'];
const LOC_OPTS = ['Bengaluru', 'Remote', 'Hyderabad', 'Pune', 'Mumbai', 'Gurugram'];

export interface OnboardingScreenProps {
  initialRoles?: string[];
  initialSkills?: string[];
  initialLocations?: string[];
  totalJobs?: number;
  jobs?: Job[];
  onSubmit: (answers: {
    college: string;
    degree: string;
    year: string;
    roles: string[];
    skills: string[];
    locations: string[];
    mode: 'remote' | 'hybrid' | 'any';
    stipend: number;
  }) => Promise<void> | void;
  loading?: boolean;
}

export function OnboardingScreen({
  initialRoles = [],
  initialSkills = ['React', 'JavaScript'],
  initialLocations = ['Remote'],
  totalJobs = 128,
  jobs = [],
  onSubmit,
  loading = false,
}: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech / B.E.');
  const [year, setYear] = useState('2nd year');
  const [roles, setRoles] = useState<string[]>(initialRoles);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [locs, setLocs] = useState<string[]>(initialLocations);
  const [mode, setMode] = useState<'remote' | 'hybrid' | 'any'>('any');
  const [stipend, setStipend] = useState(25000);
  const [custom, setCustom] = useState('');

  const toggle = (arr: string[], v: string, set: (x: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const touched = jobs.length ? jobsTouchedBy(jobs, skills) : Math.min(totalJobs, skills.length * 14);

  const aside = (
    <div className="w-full max-w-[420px]">
      <Card className="p-6" aria-live="polite">
        <Micro as="p">Your setup so far</Micro>
        <dl className="mt-4 space-y-3 text-[13.5px]">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Target roles</dt>
            <dd className="text-right">{roles.length ? roles.map((r) => r.replace(' Developer', '')).join(', ') : '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Skills</dt>
            <dd>{skills.length}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Locations</dt>
            <dd className="text-right">{locs.join(', ') || '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Min stipend</dt>
            <dd>₹{stipend.toLocaleString('en-IN')}/mo</dd>
          </div>
        </dl>
        <div className="mt-5 border-t border-line pt-4">
          <p className="font-serif text-[22px] leading-snug">{touched} of {totalJobs} jobs ask for your skills</p>
          <div className="mt-3">
            <HBar value={touched} max={totalJobs} color={C.terra} height={6} />
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <AuthLayout aside={aside}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] text-muted">Step {step + 1} of 2</span>
        <div className="flex flex-1 gap-1" aria-hidden>
          <span className="h-1 flex-1 rounded-full bg-ink" />
          <span className={cx('h-1 flex-1 rounded-full', step === 1 ? 'bg-ink' : 'bg-soft')} />
        </div>
      </div>
      {step === 0 ? (
        <div className="mt-6">
          <h1 className="font-serif text-[32px] leading-tight">About you</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">This sets your role and experience marks.</p>
          <div className="mt-6 space-y-4">
            <Field label="College" htmlFor="ob-col">
              <input
                id="ob-col"
                className="field"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="College or university"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Degree" htmlFor="ob-deg">
                <select id="ob-deg" className="field" value={degree} onChange={(e) => setDegree(e.target.value)}>
                  <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                </select>
              </Field>
              <Field label="Year" htmlFor="ob-yr">
                <select id="ob-yr" className="field" value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="1st year">1st year</option>
                  <option value="2nd year">2nd year</option>
                  <option value="3rd year">3rd year</option>
                  <option value="4th year">4th year</option>
                </select>
              </Field>
            </div>
            <Field label="Roles you want" hint={roles.length ? `${roles.length} selected` : 'Pick at least one'}>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTS.map((r) => (
                  <Chip key={r} active={roles.includes(r)} onClick={() => toggle(roles, r, setRoles)}>
                    {r}
                  </Chip>
                ))}
              </div>
            </Field>
          </div>
          <div className="mt-8 flex justify-between gap-2">
            <Button variant="ghost" onClick={() => window.history.back()} icon={ArrowLeft}>
              Back
            </Button>
            <Button variant="primary" iconRight={ArrowRight} disabled={!roles.length} onClick={() => setStep(1)}>
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <h1 className="font-serif text-[32px] leading-tight">Skills and preferences</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">Skills carry 70 marks. You can import the rest from your resume later.</p>
          <div className="mt-6 space-y-5">
            <Field label="Skills you’ve used">
              <div className="flex flex-wrap gap-2">
                {[...new Set([...SKILL_OPTS, ...skills])].map((s) => (
                  <Chip key={s} active={skills.includes(s)} onClick={() => toggle(skills, s, setSkills)}>
                    {s}
                  </Chip>
                ))}
              </div>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = custom.trim();
                  if (v && !skills.includes(v)) setSkills([...skills, v]);
                  setCustom('');
                }}
              >
                <label htmlFor="ob-add" className="sr-only">
                  Add another skill
                </label>
                <input
                  id="ob-add"
                  className="field"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="Add another skill"
                />
                <Button type="submit" icon={Plus} aria-label="Add skill">
                  Add
                </Button>
              </form>
            </Field>
            <Field label="Locations">
              <div className="flex flex-wrap gap-2">
                {LOC_OPTS.map((l) => (
                  <Chip key={l} active={locs.includes(l)} onClick={() => toggle(locs, l, setLocs)}>
                    {l}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Work mode">
              <Segmented
                label="Work mode"
                value={mode}
                onChange={setMode}
                options={[
                  { value: 'remote', label: 'Remote first' },
                  { value: 'hybrid', label: 'Hybrid OK' },
                  { value: 'any', label: 'Any' },
                ]}
              />
            </Field>
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="ob-st" className="text-[13px] font-medium">
                  Minimum stipend
                </label>
                <span className="font-serif text-[17px]">₹{stipend.toLocaleString('en-IN')}/mo</span>
              </div>
              <input
                id="ob-st"
                type="range"
                min={10000}
                max={80000}
                step={5000}
                value={stipend}
                onChange={(e) => setStipend(Number(e.target.value))}
                className="mt-2 w-full accent-ink"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-between gap-2">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              variant="primary"
              iconRight={Check}
              disabled={skills.length < 3 || loading}
              loading={loading}
              onClick={() =>
                onSubmit({
                  college,
                  degree,
                  year,
                  roles,
                  skills,
                  locations: locs,
                  mode,
                  stipend,
                })
              }
            >
              Finish setup
            </Button>
          </div>
          {skills.length < 3 && <p className="mt-2 text-right text-[12px] text-muted">Pick at least 3 skills</p>}
        </div>
      )}
    </AuthLayout>
  );
}
