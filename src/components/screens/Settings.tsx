'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Database, Lock, Plus, RefreshCw, Trash2, TriangleAlert, User, X } from 'lucide-react';
import type { UIData } from '@/lib/view-models';
import { Button, Card, Chip, Dot, ErrorState, Field, IconButton, Micro, Modal, PageHeader, SkeletonPage, Toggle, cx } from '../ui';
import { C, Ring } from '../charts';

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

const SECTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'skills', label: 'Skills' },
  { id: 'prefs', label: 'Preferences' },
  { id: 'alerts', label: 'Job alerts' },
  { id: 'sources', label: 'Job sources' },
  { id: 'notifs', label: 'Notifications' },
  { id: 'security', label: 'Security' },
  { id: 'danger', label: 'Delete account' },
];
const ROLES = ['Frontend Developer', 'Full-stack Developer', 'Data Analyst', 'Backend Developer', 'QA Engineer', 'Mobile Developer'];
const LOCS = ['Bengaluru', 'Remote', 'Hyderabad', 'Pune', 'Mumbai', 'Gurugram', 'Chennai'];

export interface SettingsScreenProps {
  data: UIData;
  state: 'ready' | 'loading' | 'empty' | 'error';
  onNavigate?: (screen: string, params?: { jobId?: string; query?: string }) => void;
  onToast?: (msg: string) => void;
  onRetry?: () => void;
}

export function SettingsScreen({
  data,
  state,
  onNavigate,
  onToast = () => undefined,
  onRetry = () => undefined,
}: SettingsScreenProps) {
  const router = useRouter();
  const navigate = onNavigate ?? ((screen) => router.push(`/${screen}`));

  const empty = state === 'empty';
  const u = data.user;
  const [missing, setMissing] = useState(
    empty ? [{ label: 'Upload a resume', gain: 40 }, { label: 'Add your college', gain: 10 }, ...data.profile.missing] : data.profile.missing
  );
  const [skills, setSkills] = useState(empty ? [] : u.skills);
  const [newSkill, setNewSkill] = useState('');
  const [roles, setRoles] = useState(empty ? [] : u.targetRoles);
  const [locs, setLocs] = useState(empty ? [] : u.locations);
  const [stipend, setStipend] = useState(u.stipendMin);
  const [alerts, setAlerts] = useState(empty ? [] : data.alerts);
  const [notifs, setNotifs] = useState(data.notificationSettings);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(data.source.synced);
  const [pw, setPw] = useState('');
  const [delOpen, setDelOpen] = useState(false);
  const [confirm, setConfirm] = useState('');

  if (state === 'loading') return <SkeletonPage variant="list" />;

  const header = <PageHeader eyebrow="Account · profile, preferences and data" title="Settings" />;

  if (state === 'error') {
    return (
      <div className="space-y-8">
        <div className="text-xs font-mono text-muted">Preview data</div>
        {header}
        <ErrorState
          title="Settings didn’t load"
          body="We couldn’t fetch your profile. No changes were lost."
          onRetry={onRetry}
        />
      </div>
    );
  }

  const strength = 100 - missing.reduce((s, m) => s + m.gain, 0);
  const toggleIn = (arr: string[], v: string, set: (x: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const go = (id: string) => document.getElementById(`set-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="space-y-8">
      <div className="text-xs font-mono text-muted">Preview data</div>
      {header}
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <nav aria-label="Settings sections" className="hidden lg:block">
          <ul className="sticky top-4 space-y-0.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  className={cx(
                    'w-full rounded-full px-3 py-1.5 text-left text-[13.5px] transition-colors duration-150 hover:bg-soft',
                    s.id === 'danger' ? 'text-terra' : 'text-muted hover:text-ink'
                  )}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 space-y-6">
          <Card id="set-profile" className="scroll-mt-6 p-5 md:p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <Ring
                value={strength}
                size={96}
                stroke={8}
                color={strength >= 80 ? C.green : C.terra}
                label={`Profile strength ${strength}%`}
              >
                <div>
                  <div className="font-serif text-[28px] leading-none">{strength}%</div>
                  <div className="font-mono text-[9.5px] text-muted">STRENGTH</div>
                </div>
              </Ring>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-[22px]">Profile strength</h2>
                <p className="text-[13.5px] text-muted">
                  {missing.length
                    ? `Complete ${missing.length} more fields to reach 100%. Stronger profiles get more accurate scores.`
                    : 'Your profile is complete.'}
                </p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {missing.map((m) => (
                    <li key={m.label} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2">
                      <span className="text-[13px]">{m.label} <span className="font-mono text-[11px] text-green">+{m.gain}%</span></span>
                      <Button size="sm" variant="ghost" onClick={() => { setMissing(missing.filter((x) => x !== m)); onToast(`${m.label} added`); }}>
                        Add
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="flex items-center gap-2 font-serif text-[19px]"><User className="size-4 text-muted" aria-hidden />Basics</h3>
              <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); onToast('Profile saved'); }}>
                <Field label="Full name" htmlFor="s-name">
                  <input id="s-name" className="field" defaultValue={empty ? '' : u.name} placeholder="Your name" />
                </Field>
                <Field label="Email" htmlFor="s-email">
                  <input id="s-email" type="email" className="field" defaultValue={u.email} />
                </Field>
                <Field label="College" htmlFor="s-col">
                  <input id="s-col" className="field" defaultValue={empty ? '' : u.college} placeholder="College or university" />
                </Field>
                <Field label="Degree" htmlFor="s-deg">
                  <input id="s-deg" className="field" defaultValue={empty ? '' : u.degree} />
                </Field>
                <Field label="Year" htmlFor="s-yr">
                  <select id="s-yr" className="field" defaultValue="2">
                    <option value="1">1st year</option>
                    <option value="2">2nd year</option>
                    <option value="3">3rd year</option>
                    <option value="4">4th year</option>
                  </select>
                </Field>
                <Field label="City" htmlFor="s-city">
                  <input id="s-city" className="field" defaultValue={u.city} />
                </Field>
                <div className="flex justify-end sm:col-span-2">
                  <Button type="submit" variant="primary">Save changes</Button>
                </div>
              </form>
            </div>
          </Card>

          <Card id="set-skills" className="scroll-mt-6 p-5 md:p-6">
            <h2 className="font-serif text-[22px]">Skills</h2>
            <p className="text-[13.5px] text-muted">Skills drive 70 of every 100 marks. Only list what you can talk about in an interview.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {skills.map((s) => (
                <li key={s} className="inline-flex items-center gap-1 rounded-full border border-line bg-white py-1 pl-3 pr-1 text-[13px]">
                  {s}
                  <button
                    type="button"
                    aria-label={`Remove ${s}`}
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                    className="grid size-5 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-soft hover:text-ink"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </li>
              ))}
              {skills.length === 0 && <li className="text-[13px] text-faint">No skills yet.</li>}
            </ul>
            <form
              className="mt-3 flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const v = newSkill.trim();
                if (v && !skills.includes(v)) {
                  setSkills([...skills, v]);
                  onToast(`${v} added · scores refreshing`);
                }
                setNewSkill('');
              }}
            >
              <label htmlFor="s-add" className="sr-only">Add skill</label>
              <input id="s-add" className="field max-w-[240px]" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill" />
              <Button type="submit" icon={Plus}>Add</Button>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Micro>Most asked, not listed</Micro>
              {['TypeScript', 'Node.js', 'Testing']
                .filter((s) => !skills.includes(s))
                .map((s) => (
                  <Chip key={s} icon={Plus} onClick={() => setSkills([...skills, s])}>
                    {s}
                  </Chip>
                ))}
            </div>
          </Card>

          <Card id="set-prefs" className="scroll-mt-6 p-5 md:p-6">
            <h2 className="font-serif text-[22px]">Preferences</h2>
            <div className="mt-4 space-y-5">
              <Field label="Target roles" hint="Role marks (15) go to jobs matching these.">
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <Chip key={r} active={roles.includes(r)} onClick={() => toggleIn(roles, r, setRoles)}>
                      {r}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="Locations" hint="Location marks (10): Remote and these cities score highest.">
                <div className="flex flex-wrap gap-2">
                  {LOCS.map((r) => (
                    <Chip key={r} active={locs.includes(r)} onClick={() => toggleIn(locs, r, setLocs)}>
                      {r}
                    </Chip>
                  ))}
                </div>
              </Field>
              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="s-stipend" className="text-[13px] font-medium">Minimum stipend</label>
                  <span className="font-serif text-[18px]">₹{stipend.toLocaleString('en-IN')}<span className="font-mono text-[11px] text-muted">/mo</span></span>
                </div>
                <input
                  id="s-stipend"
                  type="range"
                  min={10000}
                  max={80000}
                  step={5000}
                  value={stipend}
                  onChange={(e) => setStipend(Number(e.target.value))}
                  className="mt-2 w-full"
                />
                <div className="flex justify-between font-mono text-[10px] text-faint">
                  <span>₹10k</span>
                  <span>₹45k</span>
                  <span>₹80k</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="primary" onClick={() => onToast('Preferences saved · 128 jobs re-scored')}>
                  Save preferences
                </Button>
              </div>
            </div>
          </Card>

          <Card id="set-alerts" className="scroll-mt-6 p-5 md:p-6">
            <div className="flex items-end justify-between gap-2">
              <h2 className="font-serif text-[22px]">Job alerts</h2>
              <Button
                size="sm"
                icon={Plus}
                onClick={() => {
                  setAlerts([
                    ...alerts,
                    { id: `al${Date.now()}`, name: 'New alert', rule: 'Any role · Min match 50', frequency: 'Daily', on: true, matches: 37 },
                  ]);
                  onToast('Alert created');
                }}
              >
                New alert
              </Button>
            </div>
            {alerts.length === 0 ? (
              <p className="mt-3 text-[13.5px] text-muted">No alerts. Create one from any search in Jobs.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {alerts.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Bell className="size-4 text-muted" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium">{a.name}</div>
                      <div className="text-[12.5px] text-muted">{a.rule} · {a.matches} matching now</div>
                    </div>
                    <label htmlFor={`fq-${a.id}`} className="sr-only">Frequency for {a.name}</label>
                    <select
                      id={`fq-${a.id}`}
                      className="field !w-auto !py-1.5 text-[12.5px]"
                      value={a.frequency}
                      onChange={(e) =>
                        setAlerts(
                          alerts.map((x) =>
                            x.id === a.id ? { ...x, frequency: e.target.value as typeof a.frequency } : x
                          )
                        )
                      }
                    >
                      <option>Instant</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                    <Toggle
                      checked={a.on}
                      onChange={(v) => setAlerts(alerts.map((x) => (x.id === a.id ? { ...x, on: v } : x)))}
                      label={`${a.name} alert ${a.on ? 'on' : 'off'}`}
                    />
                    <IconButton
                      label={`Delete ${a.name} alert`}
                      icon={Trash2}
                      size="sm"
                      onClick={() => {
                        setAlerts(alerts.filter((x) => x.id !== a.id));
                        onToast('Alert deleted');
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card id="set-sources" className="scroll-mt-6 p-5 md:p-6">
            <h2 className="font-serif text-[22px]">Job sources</h2>
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-4">
              <span className="grid size-10 place-items-center rounded-lg bg-blue/10 text-blue"><Database className="size-5" aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[14px] font-medium">
                  {data.source.name}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green/10 px-2 py-0.5 font-mono text-[10.5px] text-green">
                    <Dot tone="green" />Connected
                  </span>
                </div>
                <div className="font-mono text-[12px] text-muted">
                  {data.source.name}: synced {synced}, {empty ? 0 : data.source.jobs} jobs
                </div>
              </div>
              <Button
                size="sm"
                icon={syncing ? undefined : RefreshCw}
                loading={syncing}
                onClick={() => {
                  setSyncing(true);
                  window.setTimeout(() => {
                    setSyncing(false);
                    setSynced('just now');
                    onToast('Sync complete · 128 jobs, 0 new');
                  }, 1200);
                }}
              >
                {syncing ? 'Syncing' : 'Sync now'}
              </Button>
            </div>
            <p className="mt-3 text-[12.5px] text-muted">Listings sync every 30 minutes. Duplicates across sources are merged before scoring.</p>
          </Card>

          <Card id="set-notifs" className="scroll-mt-6 p-5 md:p-6">
            <h2 className="font-serif text-[22px]">Notifications</h2>
            <ul className="mt-3 divide-y divide-line">
              {notifs.map((n) => (
                <li key={n.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <div className="text-[14px]">{n.label}</div>
                    <div className="text-[12.5px] text-muted">{n.desc}</div>
                  </div>
                  <Toggle
                    checked={n.on}
                    onChange={(v) => setNotifs(notifs.map((x) => (x.id === n.id ? { ...x, on: v } : x)))}
                    label={n.label}
                  />
                </li>
              ))}
            </ul>
          </Card>

          <Card id="set-security" className="scroll-mt-6 p-5 md:p-6">
            <h2 className="flex items-center gap-2 font-serif text-[22px]"><Lock className="size-4 text-muted" aria-hidden />Change password</h2>
            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setPw(''); onToast('Password updated'); }}>
              <Field label="Current password" htmlFor="pw-cur" className="sm:col-span-2">
                <input id="pw-cur" type="password" autoComplete="current-password" className="field sm:max-w-[50%]" />
              </Field>
              <Field label="New password" htmlFor="pw-new">
                <input id="pw-new" type="password" autoComplete="new-password" className="field" value={pw} onChange={(e) => setPw(e.target.value)} />
              </Field>
              <Field label="Confirm new password" htmlFor="pw-conf">
                <input id="pw-conf" type="password" autoComplete="new-password" className="field" />
              </Field>
              <div className="sm:col-span-2"><PasswordStrength value={pw} /></div>
              <div className="flex justify-end sm:col-span-2">
                <Button type="submit" variant="primary" disabled={pw.length < 8}>Update password</Button>
              </div>
            </form>
          </Card>

          <Card id="set-danger" className="scroll-mt-6 border-terra/30 p-5 md:p-6">
            <h2 className="flex items-center gap-2 font-serif text-[22px] text-terra"><TriangleAlert className="size-4" aria-hidden />Delete account</h2>
            <p className="mt-1 text-[13.5px] text-muted">Removes your resume, scores, applications and notes within 24 hours. This can’t be undone.</p>
            <Button variant="danger" className="mt-4" icon={Trash2} onClick={() => setDelOpen(true)}>Delete my account</Button>
          </Card>
        </div>
      </div>
      <Modal
        open={delOpen}
        onClose={() => { setDelOpen(false); setConfirm(''); }}
        title="Delete your account?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDelOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={confirm !== 'DELETE'}
              onClick={() => {
                setDelOpen(false);
                onToast('Account scheduled for deletion (demo)');
                navigate('login');
              }}
            >
              Delete forever
            </Button>
          </>
        }
      >
        <p className="text-[14px] text-muted">
          Type <b className="font-mono text-ink">DELETE</b> to confirm. We’ll email {u.email} a copy of your data first.
        </p>
        <label htmlFor="del-c" className="sr-only">Type DELETE to confirm</label>
        <input
          id="del-c"
          className="field mt-3 font-mono"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="DELETE"
        />
        {confirm === 'DELETE' && (
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-terra">
            <Check className="size-3.5" aria-hidden />Confirmed
          </p>
        )}
      </Modal>
    </div>
  );
}

