import { useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Mail, Plus, TriangleAlert, X } from 'lucide-react';
import type { ScreenProps } from './types';
import type { MockData } from '../mock';
import { Button, Card, Chip, Field, MatchScore, Micro, Segmented, Skeleton, cx } from '../components/ui';
import { C, HBar } from '../components/charts';
import { jobsTouchedBy } from '../lib/derive';

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
      <div className="flex gap-1" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={score} aria-valuetext={words[score]}>
        {[0, 1, 2, 3].map((i) => <span key={i} className={cx('h-1.5 flex-1 rounded-full', i < score ? colors[score] : 'bg-soft')} />)}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted">{value ? words[score] : 'Strength'}</span>
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {rules.map((r) => <li key={r.label} className={cx('flex items-center gap-1 text-[11.5px]', r.ok ? 'text-green' : 'text-faint')}>{r.ok ? <Check className="size-3" aria-hidden /> : <X className="size-3" aria-hidden />}{r.label}</li>)}
        </ul>
      </div>
    </div>
  );
}

function AuthLayout({ children, data, aside, onNavigate }: { children: ReactNode; data: MockData; aside?: ReactNode; onNavigate: ScreenProps['onNavigate'] }) {
  const j = data.jobs.find((x) => x.id === 'j-brightlane')!;
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col px-5 py-6 md:px-12">
        <button type="button" onClick={() => onNavigate('landing')} className="flex w-fit items-baseline gap-2"><span className="font-serif text-[21px]">AI Job Finder</span><span className="font-mono text-[10.5px] text-faint">v1.0</span></button>
        <div className="flex flex-1 items-center justify-center py-10"><div className="w-full max-w-[400px]">{children}</div></div>
        <p className="font-mono text-[11px] text-faint">© 2025 AI Job Finder · Privacy · Terms</p>
      </div>
      <div className="hidden border-l border-line bg-side p-10 lg:flex lg:items-center lg:justify-center">
        {aside ?? (
          <div className="w-full max-w-[440px]">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-3"><div><Micro as="p">{j.company} · {j.city}</Micro><p className="mt-1 font-serif text-[20px] leading-snug">{j.title}</p></div><MatchScore score={j.score} size="sm" bar={false} /></div>
              <ul className="mt-5 space-y-2.5">
                {([['Skills', j.marks.skills, 70], ['Role', j.marks.role, 15], ['Location', j.marks.location, 10], ['Experience', j.marks.experience, 5]] as [string, number, number][]).map(([k, v, m]) => (
                  <li key={k} className="grid grid-cols-[80px_1fr_44px] items-center gap-3"><span className="text-[12.5px] text-muted">{k}</span><HBar value={v} max={m} height={5} color={C.ink} /><span className="text-right font-mono text-[11.5px]">{v}/{m}</span></li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl bg-green/[0.07] px-3 py-2 text-[12.5px]">Add Node.js (+7) and this becomes a <b className="font-medium">Strong 72</b>.</p>
            </Card>
            <blockquote className="mt-8">
              <p className="font-serif text-[24px] leading-snug">“I stopped guessing. Every application now has a reason behind it.”</p>
              <footer className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">B.Tech CSE student, Pune</footer>
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
}

function Banner({ children }: { children: ReactNode }) {
  return <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-terra/25 bg-terra/[0.06] px-3.5 py-3 text-[13.5px]"><TriangleAlert className="mt-0.5 size-4 shrink-0 text-terra" aria-hidden />{children}</div>;
}

export function Login({ data, state, onNavigate, onToast }: ScreenProps) {
  const [email, setEmail] = useState(state === 'ready' ? data.user.email : '');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(state === 'loading');
  const [err, setErr] = useState(state === 'error' ? 'That email and password don’t match. 2 attempts left before a short lockout.' : '');
  const submit = () => {
    if (!email.includes('@')) { setErr('Enter the email you signed up with.'); return; }
    if (pw.length < 6) { setErr('Enter your password (at least 6 characters).'); return; }
    setErr(''); setBusy(true);
    window.setTimeout(() => { setBusy(false); onNavigate('overview'); onToast(`Welcome back, ${data.user.first}`); }, 800);
  };
  return (
    <AuthLayout data={data} onNavigate={onNavigate}>
      <Micro as="p">Welcome back</Micro>
      <h1 className="mt-2 font-serif text-[36px] leading-tight">Sign in</h1>
      <p className="mt-1.5 text-[14.5px] text-muted">Pick up where you left off: 3 new strong matches are waiting.</p>
      <form className="mt-7 space-y-4" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
        {err && <Banner>{err}</Banner>}
        {state === 'loading' && busy && <Skeleton className="h-1 w-full" />}
        <Field label="Email" htmlFor="li-email"><input id="li-email" type="email" autoComplete="email" className="field" value={email} disabled={busy} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" aria-invalid={!!err && !email.includes('@')} /></Field>
        <Field label="Password" htmlFor="li-pw">
          <div className="relative">
            <input id="li-pw" type={show ? 'text' : 'password'} autoComplete="current-password" className="field pr-10" value={pw} disabled={busy} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink">{show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}</button>
          </div>
        </Field>
        <div className="flex items-center justify-between text-[13px]">
          <label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked className="size-4" />Remember me</label>
          <button type="button" className="text-terra hover:underline" onClick={() => onToast('Reset link sent (demo)')}>Forgot password?</button>
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>{busy ? 'Signing in' : 'Sign in'}</Button>
        <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
        <Button size="lg" className="w-full" icon={Mail} disabled={busy} onClick={() => onToast('Magic link sent to your college email (demo)')}>Email me a sign-in link</Button>
      </form>
      <p className="mt-6 text-[13.5px] text-muted">New here? <button type="button" className="font-medium text-terra hover:underline" onClick={() => onNavigate('signup')}>Create an account</button></p>
    </AuthLayout>
  );
}

export function Signup({ data, state, onNavigate, onToast }: ScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(state === 'loading');
  const [err, setErr] = useState(state === 'error' ? 'An account with this email already exists. Sign in instead?' : '');
  const strong = scorePassword(pw).score >= 3;
  const valid = name.trim().length > 1 && email.includes('@') && strong && agree;
  return (
    <AuthLayout data={data} onNavigate={onNavigate}>
      <Micro as="p">Free for students</Micro>
      <h1 className="mt-2 font-serif text-[36px] leading-tight">Create your account</h1>
      <p className="mt-1.5 text-[14.5px] text-muted">Two minutes now; every job scored from then on.</p>
      <form className="mt-7 space-y-4" noValidate onSubmit={(e) => {
        e.preventDefault();
        if (!valid) { setErr('Fill in every field and choose a stronger password.'); return; }
        setErr(''); setBusy(true);
        window.setTimeout(() => { setBusy(false); onNavigate('onboarding'); onToast('Account created'); }, 800);
      }}>
        {err && <Banner>{err} {state === 'error' && <button type="button" className="font-medium text-terra hover:underline" onClick={() => onNavigate('login')}>Sign in</button>}</Banner>}
        <Field label="Full name" htmlFor="su-name"><input id="su-name" autoComplete="name" className="field" value={name} disabled={busy} onChange={(e) => setName(e.target.value)} placeholder="Ananya Sharma" /></Field>
        <Field label="Email" htmlFor="su-email" hint="College email unlocks campus-only listings."><input id="su-email" type="email" autoComplete="email" className="field" value={email} disabled={busy} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" /></Field>
        <Field label="Password" htmlFor="su-pw"><input id="su-pw" type="password" autoComplete="new-password" className="field" value={pw} disabled={busy} onChange={(e) => setPw(e.target.value)} /></Field>
        <PasswordStrength value={pw} />
        <label className="flex items-start gap-2 text-[13px] text-muted"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4" />I agree to the Terms and Privacy Policy. We never share your resume.</label>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy} disabled={!valid && !busy}>Create account</Button>
      </form>
      <p className="mt-6 text-[13.5px] text-muted">Already have an account? <button type="button" className="font-medium text-terra hover:underline" onClick={() => onNavigate('login')}>Sign in</button></p>
    </AuthLayout>
  );
}

const ROLE_OPTS = ['Frontend Developer', 'Full-stack Developer', 'Data Analyst', 'Backend Developer', 'QA Engineer', 'Mobile Developer'];
const SKILL_OPTS = ['React', 'JavaScript', 'HTML', 'CSS', 'Git', 'Python', 'SQL', 'TypeScript', 'Node.js', 'Java', 'C++', 'Figma'];
const LOC_OPTS = ['Bengaluru', 'Remote', 'Hyderabad', 'Pune', 'Mumbai', 'Gurugram'];

export function Onboarding({ data, state, onNavigate, onToast }: ScreenProps) {
  const prefill = state === 'ready';
  const [step, setStep] = useState(0);
  const [roles, setRoles] = useState<string[]>(prefill ? ['Frontend Developer', 'Full-stack Developer'] : []);
  const [skills, setSkills] = useState<string[]>(prefill ? data.user.skills : []);
  const [locs, setLocs] = useState<string[]>(prefill ? ['Bengaluru', 'Remote'] : []);
  const [mode, setMode] = useState<'remote' | 'hybrid' | 'any'>('any');
  const [stipend, setStipend] = useState(25000);
  const [custom, setCustom] = useState('');
  const toggle = (arr: string[], v: string, set: (x: string[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const touched = jobsTouchedBy(data.jobs, skills);
  const aside = (
    <div className="w-full max-w-[420px]">
      <Card className="p-6" aria-live="polite">
        <Micro as="p">Your setup so far</Micro>
        <dl className="mt-4 space-y-3 text-[13.5px]">
          <div className="flex justify-between gap-3"><dt className="text-muted">Target roles</dt><dd className="text-right">{roles.length ? roles.map((r) => r.replace(' Developer', '')).join(', ') : '—'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Skills</dt><dd>{skills.length}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Locations</dt><dd className="text-right">{locs.join(', ') || '—'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Min stipend</dt><dd>₹{stipend.toLocaleString('en-IN')}/mo</dd></div>
        </dl>
        <div className="mt-5 border-t border-line pt-4">
          <p className="font-serif text-[22px] leading-snug">{touched} of {data.stats.jobsIndexed} jobs ask for your skills</p>
          <div className="mt-3"><HBar value={touched} max={data.stats.jobsIndexed} color={C.terra} height={6} /></div>
        </div>
      </Card>
    </div>
  );
  return (
    <AuthLayout data={data} onNavigate={onNavigate} aside={aside}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] text-muted">Step {step + 1} of 2</span>
        <div className="flex flex-1 gap-1" aria-hidden><span className="h-1 flex-1 rounded-full bg-ink" /><span className={cx('h-1 flex-1 rounded-full', step === 1 ? 'bg-ink' : 'bg-soft')} /></div>
      </div>
      {state === 'error' && <div className="mt-5"><Banner>We couldn’t save your answers. They’re kept on this device; try again.</Banner></div>}
      {state === 'loading' ? <div className="mt-6 space-y-3"><Skeleton className="h-9 w-2/3" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div> : step === 0 ? (
        <div className="mt-6">
          <h1 className="font-serif text-[32px] leading-tight">About you</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">This sets your role and experience marks.</p>
          <div className="mt-6 space-y-4">
            <Field label="College" htmlFor="ob-col"><input id="ob-col" className="field" defaultValue={prefill ? data.user.college : ''} placeholder="College or university" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Degree" htmlFor="ob-deg"><select id="ob-deg" className="field" defaultValue="btech"><option value="btech">B.Tech / B.E.</option><option value="bsc">B.Sc</option><option value="bca">BCA</option><option value="mca">MCA</option></select></Field>
              <Field label="Year" htmlFor="ob-yr"><select id="ob-yr" className="field" defaultValue="2"><option value="1">1st year</option><option value="2">2nd year</option><option value="3">3rd year</option><option value="4">4th year</option></select></Field>
            </div>
            <Field label="Roles you want" hint={roles.length ? `${roles.length} selected` : 'Pick at least one'}><div className="flex flex-wrap gap-2">{ROLE_OPTS.map((r) => <Chip key={r} active={roles.includes(r)} onClick={() => toggle(roles, r, setRoles)}>{r}</Chip>)}</div></Field>
          </div>
          <div className="mt-8 flex justify-between gap-2">
            <Button variant="ghost" onClick={() => onNavigate('signup')} icon={ArrowLeft}>Back</Button>
            <Button variant="primary" iconRight={ArrowRight} disabled={!roles.length} onClick={() => setStep(1)}>Continue</Button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <h1 className="font-serif text-[32px] leading-tight">Skills and preferences</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">Skills carry 70 marks. You can import the rest from your resume later.</p>
          <div className="mt-6 space-y-5">
            <Field label="Skills you’ve used">
              <div className="flex flex-wrap gap-2">{[...new Set([...SKILL_OPTS, ...skills])].map((s) => <Chip key={s} active={skills.includes(s)} onClick={() => toggle(skills, s, setSkills)}>{s}</Chip>)}</div>
              <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = custom.trim(); if (v && !skills.includes(v)) setSkills([...skills, v]); setCustom(''); }}>
                <label htmlFor="ob-add" className="sr-only">Add another skill</label>
                <input id="ob-add" className="field" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add another skill" />
                <Button type="submit" icon={Plus} aria-label="Add skill">Add</Button>
              </form>
            </Field>
            <Field label="Locations"><div className="flex flex-wrap gap-2">{LOC_OPTS.map((l) => <Chip key={l} active={locs.includes(l)} onClick={() => toggle(locs, l, setLocs)}>{l}</Chip>)}</div></Field>
            <Field label="Work mode"><Segmented label="Work mode" value={mode} onChange={setMode} options={[{ value: 'remote', label: 'Remote first' }, { value: 'hybrid', label: 'Hybrid OK' }, { value: 'any', label: 'Any' }]} /></Field>
            <div>
              <div className="flex items-baseline justify-between"><label htmlFor="ob-st" className="text-[13px] font-medium">Minimum stipend</label><span className="font-serif text-[17px]">₹{stipend.toLocaleString('en-IN')}/mo</span></div>
              <input id="ob-st" type="range" min={10000} max={80000} step={5000} value={stipend} onChange={(e) => setStipend(Number(e.target.value))} className="mt-2 w-full" />
            </div>
          </div>
          <div className="mt-8 flex justify-between gap-2">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(0)}>Back</Button>
            <Button variant="primary" iconRight={Check} disabled={skills.length < 3} onClick={() => { onNavigate('overview'); onToast(`You’re set. ${data.stats.jobsIndexed} jobs scored.`); }}>Finish setup</Button>
          </div>
          {skills.length < 3 && <p className="mt-2 text-right text-[12px] text-muted">Pick at least 3 skills</p>}
        </div>
      )}
    </AuthLayout>
  );
}
