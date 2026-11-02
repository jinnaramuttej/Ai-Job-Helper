import { useMemo, useRef, useState } from 'react';
import { Check, CircleAlert, Download, FileText, Plus, Sparkles, Upload, X } from 'lucide-react';
import type { ScreenProps } from './types';
import type { AtsCats, MockData } from '../mock';
import { Bar, Button, Card, ErrorState, Field, MatchScore, Micro, PageHeader, Skeleton, Tag, cx } from '../components/ui';
import { C, Ring } from '../components/charts';
import { jobsTouchedBy } from '../lib/derive';

const STEPS = ['Upload', 'Review', 'ATS report', 'Tailor'];
const CATS: { key: keyof AtsCats; label: string; max: number }[] = [
  { key: 'keywords', label: 'Keywords', max: 40 }, { key: 'sections', label: 'Sections', max: 25 }, { key: 'contact', label: 'Contact', max: 15 },
  { key: 'length', label: 'Length', max: 10 }, { key: 'impact', label: 'Impact', max: 10 },
];

export function ResumeStudio({ data, state, onNavigate, onToast, onRetry, focusJobId }: ScreenProps & { focusJobId: string | null }) {
  const empty = state === 'empty';
  const [step, setStep] = useState(focusJobId ? 3 : empty ? 0 : 2);
  const [hasResume, setHasResume] = useState(!empty);
  if (state === 'loading') {
    return <div className="space-y-6" aria-busy="true" aria-label="Loading Resume Studio"><Skeleton className="h-10 w-64" /><Skeleton className="h-12 w-full rounded-full" /><div className="grid gap-5 lg:grid-cols-3"><Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-72 rounded-2xl lg:col-span-2" /></div></div>;
  }
  const header = (
    <PageHeader eyebrow={hasResume ? 'Active: resume_v5.pdf · ATS 72 · updated Oct 23' : 'No resume yet'} title="Resume Studio"
      actions={hasResume && <><Button icon={Upload} onClick={() => setStep(0)}>Upload new</Button><Button variant="primary" icon={Download} onClick={() => onToast('Exported resume_v5.pdf (UI only)')}>Export</Button></>} />
  );
  if (state === 'error') return <div className="space-y-8">{header}<ErrorState title="We couldn’t parse that resume" body="The file looks scanned or password-protected. Upload a text-based PDF or DOCX, or try the sample resume." onRetry={onRetry} /></div>;
  return (
    <div className="space-y-8">
      {header}
      <nav aria-label="Resume steps">
        <ol className="flex items-center gap-2 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const done = i < step && hasResume;
            const cur = i === step;
            const disabled = !hasResume && i > 0;
            return (
              <li key={s} className="flex shrink-0 items-center gap-2">
                <button type="button" disabled={disabled} onClick={() => setStep(i)} aria-current={cur ? 'step' : undefined}
                  className={cx('flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-150 disabled:opacity-40',
                    cur ? 'border-ink bg-white font-medium text-ink shadow-pill' : 'border-line text-muted hover:text-ink')}>
                  <span className={cx('grid size-5 place-items-center rounded-full font-mono text-[10.5px]', cur ? 'bg-btn text-white' : done ? 'bg-green/15 text-green' : 'bg-soft text-muted')}>
                    {done ? <Check className="size-3" aria-hidden /> : i + 1}
                  </span>{s}
                </button>
                {i < STEPS.length - 1 && <span className="h-px w-6 bg-line md:w-12" aria-hidden />}
              </li>
            );
          })}
        </ol>
      </nav>
      {step === 0 && <UploadStep hasResume={hasResume} onParsed={(name) => { setHasResume(true); setStep(1); onToast(`Parsed ${name}: 7 skills, 5 sections found`); }} />}
      {step === 1 && <ReviewStep data={data} onNext={() => setStep(2)} onToast={onToast} />}
      {step === 2 && <AtsStep data={data} onTailor={() => setStep(3)} onToast={onToast} />}
      {step === 3 && <TailorStep data={data} initialJob={focusJobId} onToast={onToast} onNavigate={onNavigate} />}
    </div>
  );
}

function UploadStep({ hasResume, onParsed }: { hasResume: boolean; onParsed: (name: string) => void }) {
  const [over, setOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [file, setFile] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const start = (name: string) => {
    setFile(name); setProgress(0);
    let p = 0;
    const t = window.setInterval(() => {
      p += 9;
      setProgress(Math.min(100, p));
      if (p >= 100) { window.clearInterval(t); window.setTimeout(() => onParsed(name), 200); }
    }, 110);
  };
  const stage = progress == null ? '' : progress < 35 ? 'Extracting text' : progress < 70 ? 'Finding sections' : 'Matching skills against 128 jobs';
  return (
    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; start(f ? f.name : 'resume.pdf'); }}
        className={cx('flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors duration-150', over ? 'border-ink bg-soft' : 'border-[#CFC8BB] bg-card')}>
        {progress == null ? (
          <>
            <span className="grid size-12 place-items-center rounded-full bg-soft text-ink"><Upload className="size-5" aria-hidden /></span>
            <h2 className="mt-4 font-serif text-[24px]">Drop your resume here</h2>
            <p className="mt-1 text-[14px] text-muted">PDF or DOCX, up to 5 MB. We never share it.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button variant="primary" icon={Upload} onClick={() => input.current?.click()}>Browse files</Button>
              <Button onClick={() => start('sample_resume_ananya.pdf')}>Use a sample resume</Button>
            </div>
            <input ref={input} type="file" accept=".pdf,.doc,.docx" className="sr-only" aria-label="Choose resume file" onChange={(e) => { const f = e.target.files?.[0]; if (f) start(f.name); }} />
          </>
        ) : (
          <div className="w-full max-w-sm" role="status" aria-live="polite">
            <FileText className="mx-auto size-8 text-violet" aria-hidden />
            <p className="mt-3 text-[14px] font-medium">{file}</p>
            <div className="mt-4"><Bar value={progress} tone="ink" height={6} /></div>
            <p className="mt-2 font-mono text-[11px] text-muted">{stage} · {progress}%</p>
          </div>
        )}
      </div>
      <Card className="p-5">
        <Micro as="p">{hasResume ? 'Current resume' : 'What we read'}</Micro>
        {hasResume ? (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-white p-3">
            <FileText className="size-5 text-violet" aria-hidden />
            <div className="flex-1"><div className="text-[14px]">resume_v5.pdf</div><div className="font-mono text-[11px] text-muted">Uploaded Oct 23 · ATS 72</div></div>
          </div>
        ) : <p className="mt-2 text-[13.5px] text-muted">Contact details, education, skills, projects and experience. Nothing else.</p>}
        <ul className="mt-4 space-y-2.5 text-[13.5px]">
          {['Skills are matched to 128 jobs in about 2 seconds', 'Every score shows which lines earned its marks', 'You approve every edit before it is saved'].map((t) => (
            <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-green" aria-hidden />{t}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function ReviewStep({ data, onNext, onToast }: { data: MockData; onNext: () => void; onToast: (m: string) => void }) {
  const p = data.parsedResume;
  const [skills, setSkills] = useState(p.skills);
  const [add, setAdd] = useState('');
  const [phone, setPhone] = useState(p.phone);
  const [years, setYears] = useState(p.years);
  const touched = useMemo(() => jobsTouchedBy(data.jobs, skills), [data.jobs, skills]);
  const hint = (field: string) => p.hints.find((h) => h.field === field);
  const Hint = ({ field, resolved }: { field: string; resolved?: boolean }) => {
    const h = hint(field);
    if (!h) return null;
    return resolved ? <span className="flex items-center gap-1.5 text-green"><Check className="size-3.5" aria-hidden />Looks good</span>
      : <span className="flex items-start gap-1.5 text-amber"><CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden /><span><b className="font-medium">Check this:</b> {h.text}</span></span>;
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <Card className="p-5 md:p-6">
        <h2 className="font-serif text-[22px]">Parsed details</h2>
        <p className="mt-1 text-[13.5px] text-muted">Edit anything we read wrong. Changes update your scores immediately.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="rv-name"><input id="rv-name" className="field" defaultValue={p.name} /></Field>
          <Field label="Email" htmlFor="rv-email"><input id="rv-email" type="email" className="field" defaultValue={p.email} /></Field>
          <Field label="Phone" htmlFor="rv-phone" hint={<Hint field="phone" resolved={phone.startsWith('+')} />}><input id="rv-phone" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Field label="CGPA" htmlFor="rv-cgpa"><input id="rv-cgpa" className="field" defaultValue={p.cgpa} /></Field>
          <Field label="College" htmlFor="rv-col" className="sm:col-span-2"><input id="rv-col" className="field" defaultValue={p.college} /></Field>
          <Field label="Degree" htmlFor="rv-deg"><input id="rv-deg" className="field" defaultValue={p.degree} /></Field>
          <Field label="Years" htmlFor="rv-yrs" hint={<Hint field="years" resolved={years !== p.years} />}><input id="rv-yrs" className="field" value={years} onChange={(e) => setYears(e.target.value)} /></Field>
        </div>
        <div className="mt-6">
          <div className="text-[13px] font-medium">Skills</div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {skills.map((s) => (
              <li key={s} className="inline-flex items-center gap-1 rounded-full border border-line bg-white py-1 pl-3 pr-1 text-[13px]">
                {s}{s === 'SQL' && <span className="font-mono text-[10px] text-amber">basic</span>}
                <button type="button" aria-label={`Remove ${s}`} onClick={() => setSkills(skills.filter((x) => x !== s))} className="grid size-5 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-soft hover:text-ink"><X className="size-3" aria-hidden /></button>
              </li>
            ))}
          </ul>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = add.trim(); if (v && !skills.includes(v)) setSkills([...skills, v]); setAdd(''); }}>
            <label htmlFor="rv-add" className="sr-only">Add a skill</label>
            <input id="rv-add" className="field max-w-[260px]" value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Add a skill, e.g. TypeScript" />
            <Button type="submit" icon={Plus}>Add</Button>
          </form>
          <div className="mt-2 text-[12.5px]"><Hint field="skills" /></div>
        </div>
      </Card>
      <div className="space-y-5">
        <Card className="p-5" aria-live="polite">
          <Micro as="p">Live impact</Micro>
          <p className="mt-2 font-serif text-[22px] leading-snug">{skills.length} skills found; affects {touched} job scores</p>
          <p className="mt-1.5 text-[13px] text-muted">Of {data.stats.jobsIndexed} indexed jobs, {touched} ask for at least one skill on your list.</p>
          <div className="mt-4"><Bar value={touched} max={data.stats.jobsIndexed} tone="blue" height={6} /></div>
        </Card>
        <Card className="p-5">
          <Micro as="p">Sections found</Micro>
          <ul className="mt-3 space-y-2 text-[13.5px]">
            {['Contact', 'Education', 'Skills', 'Projects', 'Experience'].map((s) => <li key={s} className="flex items-center justify-between"><span>{s}</span><Check className="size-4 text-green" aria-label="found" /></li>)}
            <li className="flex items-center justify-between text-muted"><span>Links (GitHub, portfolio)</span><X className="size-4 text-terra" aria-label="missing" /></li>
          </ul>
        </Card>
        <Button variant="primary" className="w-full" onClick={() => { onToast('Details saved · scores refreshed'); onNext(); }}>Save and see ATS report</Button>
      </div>
    </div>
  );
}

function AtsStep({ data, onTailor, onToast }: { data: MockData; onTailor: () => void; onToast: (m: string) => void }) {
  const v5 = data.resumeVersions[0];
  const [tips, setTips] = useState(data.atsTips);
  const [a, setA] = useState('v3');
  const [b, setB] = useState('v5');
  const projected = v5.score + tips.filter((t) => t.done && !data.atsTips.find((x) => x.id === t.id)?.done).reduce((s, t) => s + t.points, 0);
  const va = data.resumeVersions.find((v) => v.id === a)!, vb = data.resumeVersions.find((v) => v.id === b)!;
  const lowest = CATS.reduce((m, c) => (v5.cats[c.key] / c.max < v5.cats[m.key] / m.max ? c : m), CATS[0]);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-5">
            <Ring value={v5.score} size={96} stroke={8} color={C.ink} label={`ATS score ${v5.score} out of 100`}>
              <div><div className="font-serif text-[32px] leading-none">{v5.score}</div><div className="font-mono text-[10px] text-faint">/100</div></div>
            </Ring>
            <div>
              <Micro as="p">ATS score · v5</Micro>
              <p className="mt-1 font-serif text-[20px] leading-snug">Good, and up 8 on last week</p>
              <p className="mt-1 text-[13px] text-muted">Projected with checked tips: <b className="font-medium text-ink">{projected}</b></p>
            </div>
          </div>
          <ul className="mt-6 space-y-3.5">
            {CATS.map((c) => (
              <li key={c.key}>
                <div className="flex items-baseline justify-between text-[13px]"><span className="flex items-center gap-2">{c.label}{c.key === lowest.key && <Tag tone="terra">Weakest</Tag>}</span><span className="font-mono text-[12px]">{v5.cats[c.key]}<span className="text-faint">/{c.max}</span></span></div>
                <Bar value={v5.cats[c.key]} max={c.max} tone={c.key === lowest.key ? 'terra' : 'ink'} className="mt-1.5" height={6} />
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 md:p-6">
          <div className="flex items-end justify-between gap-2"><h2 className="font-serif text-[22px]">Fix list</h2><span className="font-mono text-[11px] text-muted">{tips.filter((t) => t.done).length}/{tips.length} done</span></div>
          <ul className="mt-4 divide-y divide-line">
            {tips.map((t) => (
              <li key={t.id} className="flex items-start gap-3 py-3">
                <input id={`tip-${t.id}`} type="checkbox" checked={t.done} onChange={() => setTips(tips.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} className="mt-1 size-4" />
                <label htmlFor={`tip-${t.id}`} className={cx('flex-1 text-[14px] leading-snug', t.done && 'text-faint line-through')}>{t.text}</label>
                {t.points > 0 && <span className="font-mono text-[11px] text-green">+{t.points}</span>}
                <Tag tone="ink" className="hidden sm:inline-flex">{t.cat}</Tag>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2"><Button variant="primary" icon={Sparkles} onClick={onTailor}>Tailor for a job</Button><Button onClick={() => onToast('Saved as draft v6 (UI only)')}>Save as v6</Button></div>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-5 md:p-6">
          <h2 className="font-serif text-[22px]">Version history</h2>
          <ul className="mt-3 divide-y divide-line">
            {data.resumeVersions.map((v) => (
              <li key={v.id} className="grid grid-cols-[1fr_90px_40px] items-center gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[14px] font-medium">{v.label}{v.id === 'v5' && <Tag tone="green">Main</Tag>}{v.variant && <Tag category="RESUME">Variant</Tag>}</div>
                  <div className="truncate text-[12px] text-muted">{v.date} · {v.note}</div>
                </div>
                <Bar value={v.score} tone={v.score >= 70 ? 'green' : 'blue'} />
                <span className="text-right font-serif text-[18px]">{v.score}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-serif text-[22px]">Compare versions</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="cmp-a" className="sr-only">Version A</label>
              <select id="cmp-a" value={a} onChange={(e) => setA(e.target.value)} className="field !w-auto !py-1.5 text-[13px]">{data.resumeVersions.map((v) => <option key={v.id} value={v.id}>{v.id}</option>)}</select>
              <span className="font-mono text-[11px] text-muted">vs</span>
              <label htmlFor="cmp-b" className="sr-only">Version B</label>
              <select id="cmp-b" value={b} onChange={(e) => setB(e.target.value)} className="field !w-auto !py-1.5 text-[13px]">{data.resumeVersions.map((v) => <option key={v.id} value={v.id}>{v.id}</option>)}</select>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            <div className="grid grid-cols-[1fr_80px_80px_70px] border-b border-line bg-[#FBF9F4] px-4 py-2"><span className="micro">Category</span><span className="micro text-right">{va.id}</span><span className="micro text-right">{vb.id}</span><span className="micro text-right">Δ</span></div>
            {[...CATS.map((c) => ({ label: c.label, x: va.cats[c.key], y: vb.cats[c.key], max: c.max })), { label: 'Total', x: va.score, y: vb.score, max: 100 }].map((r) => (
              <div key={r.label} className={cx('grid grid-cols-[1fr_80px_80px_70px] items-center px-4 py-2.5 text-[13px]', r.label === 'Total' ? 'bg-[#FBF9F4] font-medium' : 'border-b border-line')}>
                <span>{r.label}</span><span className="text-right font-mono">{r.x}/{r.max}</span><span className="text-right font-mono">{r.y}/{r.max}</span>
                <span className={cx('text-right font-mono', r.y - r.x > 0 ? 'text-green' : r.y - r.x < 0 ? 'text-terra' : 'text-faint')}>{r.y - r.x > 0 ? '+' : ''}{r.y - r.x}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[va, vb].map((v) => <div key={v.id} className="rounded-xl bg-soft/60 p-3"><Micro as="p">{v.label} · {v.date}</Micro><p className="mt-1 text-[13px]">{v.note}</p></div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TailorStep({ data, initialJob, onToast, onNavigate }: { data: MockData; initialJob: string | null; onToast: (m: string) => void; onNavigate: ScreenProps['onNavigate'] }) {
  const top = data.jobs.filter((j) => j.postedHours <= 168).sort((a, b) => b.score - a.score).slice(0, 6);
  const focused = initialJob ? data.jobs.find((j) => j.id === initialJob) : undefined;
  const options = focused && !top.includes(focused) ? [focused, ...top] : top;
  const [jobId, setJobId] = useState(focused ? focused.id : options[0].id);
  const job = data.jobs.find((j) => j.id === jobId)!;
  const [applied, setApplied] = useState<number[]>([]);
  const gains = [3, 2, 2];
  const ats = data.stats.ats + applied.reduce((s, i) => s + gains[i], 0);
  const missing = job.skills.filter((s) => !s.have).sort((a, b) => b.marks - a.marks);
  const tipFor = (line: string) => job.tailor.findIndex((t) => t.before === line);
  const unplaced = job.tailor.map((t, i) => ({ t, i })).filter(({ t }) => !data.resumeText.some((s) => s.lines.includes(t.before)));
  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="tl-job" className="text-[13px] font-medium">Tailor for</label>
          <select id="tl-job" value={jobId} onChange={(e) => { setJobId(e.target.value); setApplied([]); }} className="field !w-auto min-w-[260px] text-[13.5px]">
            {options.map((j) => <option key={j.id} value={j.id}>{j.company} · {j.title} ({j.score})</option>)}
          </select>
        </div>
        <div className="flex items-center gap-6">
          <div><Micro as="p">ATS for this job</Micro><p className="font-serif text-[24px] leading-none">{data.stats.ats} → <span className="text-green">{ats}</span></p></div>
          <div><Micro as="p">Match</Micro><MatchScore score={job.score} size="xs" bar={false} /></div>
        </div>
      </Card>
      <div className="flex flex-wrap items-center gap-2">
        <Micro className="mr-1">Missing keywords</Micro>
        {missing.map((s) => <span key={s.name} className="inline-flex items-center gap-1.5 rounded-full border border-terra/25 bg-terra/[0.06] px-2.5 py-1 text-[12.5px]"><X className="size-3 text-terra" aria-hidden />{s.name}<span className="font-mono text-[10.5px] text-muted">+{s.marks}</span></span>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5 md:p-6">
          <div className="flex items-center justify-between"><h2 className="font-serif text-[20px]">Original · v5</h2><span className="font-mono text-[11px] text-muted">ATS 72</span></div>
          <div className="mt-4 space-y-5">
            {data.resumeText.map((s) => (
              <section key={s.id}><Micro as="h3">{s.title}</Micro><ul className="mt-1.5 space-y-1.5">{s.lines.map((l) => <li key={l} className={cx('text-[13.5px] leading-snug', tipFor(l) >= 0 && 'rounded bg-amber/10 px-1 -mx-1')}>{l}</li>)}</ul></section>
            ))}
          </div>
        </Card>
        <Card className="p-5 md:p-6">
          <div className="flex items-center justify-between"><h2 className="font-serif text-[20px]">Tailored for {job.company}</h2><span className="font-mono text-[11px] text-green">{applied.length}/{job.tailor.length} applied</span></div>
          <div className="mt-4 space-y-5">
            {data.resumeText.map((s) => (
              <section key={s.id}>
                <Micro as="h3">{s.title}</Micro>
                <ul className="mt-1.5 space-y-2">
                  {s.lines.map((l) => {
                    const ti = tipFor(l);
                    if (ti < 0) return <li key={l} className="text-[13.5px] leading-snug">{l}</li>;
                    const t = job.tailor[ti];
                    const done = applied.includes(ti);
                    return (
                      <li key={l} className="rounded-xl border border-line bg-white p-3">
                        {done ? <p className="text-[13.5px] leading-snug"><Check className="mr-1 inline size-3.5 text-green" aria-label="applied" />{t.after}</p> : (
                          <>
                            <p className="rounded bg-terra/[0.07] px-1.5 py-0.5 text-[13px] text-muted line-through decoration-terra/50"><span className="sr-only">Remove: </span>{t.before}</p>
                            <p className="mt-1 rounded bg-green/[0.09] px-1.5 py-0.5 text-[13px] text-ink"><span className="sr-only">Insert: </span>{t.after}</p>
                            <div className="mt-2 flex items-center justify-between"><span className="font-mono text-[10.5px] text-muted">keyword · {t.keyword} · +{gains[ti]} ATS</span><Button size="sm" variant="outline" onClick={() => { setApplied([...applied, ti]); onToast('Suggestion applied'); }}>Apply suggestion</Button></div>
                          </>
                        )}
                      </li>
                    );
                  })}
                  {unplaced.filter(({ t }) => t.section === s.title).map(({ t, i }) => (
                    <li key={`u${i}`} className="rounded-xl border border-dashed border-[#CFC8BB] bg-white p-3">
                      <p className="text-[13px] text-ink"><span className="micro mr-2 text-green">Add</span>{t.after}</p>
                      <div className="mt-2 flex justify-end">{applied.includes(i) ? <span className="flex items-center gap-1 text-[12px] text-green"><Check className="size-3.5" aria-hidden />Applied</span> : <Button size="sm" variant="outline" onClick={() => { setApplied([...applied, i]); onToast('Suggestion applied'); }}>Apply suggestion</Button>}</div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Card>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="text-[13px] text-muted">Only add skills you have actually used. Tailoring rewords; it never invents.</p>
        <div className="flex gap-2">
          <Button onClick={() => onNavigate('jobs', { jobId: job.id })}>View job</Button>
          <Button variant="primary" icon={Download} onClick={() => onToast(`Exported resume_v6_${job.company.toLowerCase().replace(/[^a-z]/g, '')}.pdf (UI only)`)}>Export tailored PDF</Button>
        </div>
      </div>
    </div>
  );
}
