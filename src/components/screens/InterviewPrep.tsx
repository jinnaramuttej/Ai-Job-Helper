'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarClock, Lightbulb, MessagesSquare, Mic, Pause, Play, RotateCcw, Sparkles, Video } from 'lucide-react';
import type { Question, UIData } from '@/lib/view-models';
import { Bar, Button, Card, EmptyState, ErrorState, Micro, Monogram, PageHeader, Segmented, SkeletonPage, Tag, cx } from '../ui';
import { C, Ring } from '../charts';

const DIFF_TONE = { Easy: 'green', Medium: 'amber', Hard: 'terra' } as const;
type RoleF = 'All' | Question['role'];

export interface InterviewPrepScreenProps {
  data: UIData;
  state: 'ready' | 'loading' | 'empty' | 'error';
  onNavigate?: (screen: string, params?: { jobId?: string; query?: string }) => void;
  onToast?: (msg: string) => void;
  onRetry?: () => void;
}

export function InterviewPrepScreen({
  data,
  state,
  onNavigate,
  onToast = () => undefined,
  onRetry = () => undefined,
}: InterviewPrepScreenProps) {
  const router = useRouter();
  const navigate = onNavigate ?? ((screen) => router.push(`/${screen}`));

  const it = data.interview;
  const [checklist, setChecklist] = useState(it.checklist);
  const [role, setRole] = useState<RoleF>('All');
  const [active, setActive] = useState<Question | null>(null);
  const [prefill, setPrefill] = useState('');

  if (state === 'loading') return <SkeletonPage variant="split" />;

  const header = (
    <PageHeader
      eyebrow={state === 'empty' ? 'Growth · no interviews scheduled' : `Growth · next interview in ${it.hoursUntil} hours`}
      title="Interview Prep"
      actions={
        <Button variant="primary" icon={Mic} onClick={() => setActive(data.questions[1] || data.questions[0])}>
          Start mock interview
        </Button>
      }
    />
  );

  if (state === 'error') {
    return (
      <div className="space-y-8">
        <div className="text-xs font-mono text-muted">Preview data</div>
        {header}
        <ErrorState
          title="Prep materials didn’t load"
          body="We couldn’t fetch your question bank. Your STAR notes are stored locally and safe."
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (active) {
    return (
      <div className="space-y-6">
        <div className="text-xs font-mono text-muted">Preview data</div>
        <MockInterview
          key={active.id}
          q={active}
          all={data.questions}
          prefill={prefill}
          onExit={() => {
            setActive(null);
            setPrefill('');
          }}
          onNext={(q) => {
            setActive(q);
            setPrefill('');
          }}
          onToast={onToast}
        />
      </div>
    );
  }

  const done = checklist.filter((c) => c.done).length;
  const qs = data.questions.filter((q) => role === 'All' || q.role === role);

  return (
    <div className="space-y-8">
      <div className="text-xs font-mono text-muted">Preview data</div>
      {header}
      {state === 'empty' ? (
        <EmptyState
          icon={MessagesSquare}
          title="No interviews yet"
          body="When an application moves to Interview, its prep plan appears here. You can practise with the question bank any time."
          action={
            <>
              <Button variant="primary" onClick={() => setActive(data.questions[0])}>Practise a question</Button>
              <Button onClick={() => navigate('applications')}>Open applications</Button>
            </>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[1.25fr_1fr]">
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-2">
                <Tag category="INTERVIEW">Tomorrow</Tag>
                <span className="font-mono text-[11px] text-muted">{it.date} · {it.time}</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Monogram name={it.company} size={44} />
                <div>
                  <h2 className="font-serif text-[26px] leading-tight">{it.company}</h2>
                  <p className="text-[14px] text-muted">{it.role}</p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-1 gap-3 text-[13.5px] sm:grid-cols-3">
                <div><dt className="micro">Round</dt><dd className="mt-1">{it.round}</dd></div>
                <div>
                  <dt className="micro">Format</dt>
                  <dd className="mt-1 flex items-center gap-1.5"><Video className="size-3.5 text-muted" aria-hidden />{it.mode}</dd>
                </div>
                <div>
                  <dt className="micro">Interviewer</dt>
                  <dd className="mt-1">
                    {it.interviewer.split(',')[0]}
                    <span className="block text-[12px] text-muted">{it.interviewer.split(', ')[1]}</span>
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="primary" icon={Mic} onClick={() => setActive(data.questions[1] || data.questions[0])}>
                  Practise likely questions
                </Button>
                <Button icon={CalendarClock} onClick={() => navigate('calendar')}>Open in calendar</Button>
                <Button variant="ghost" onClick={() => navigate('applications')}>Application →</Button>
              </div>
            </div>
            <div className="border-t border-line bg-soft/40 p-5 md:p-6 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-[19px]">Prep checklist</h3>
                <Ring value={done} max={checklist.length} size={44} stroke={4} color={C.green} label={`${done} of ${checklist.length} prep items done`}>
                  <span className="font-mono text-[11px]">{done}/{checklist.length}</span>
                </Ring>
              </div>
              <ul className="mt-3 space-y-1">
                {checklist.map((c) => (
                  <li key={c.id} className="flex items-start gap-3 rounded-lg px-1 py-1.5">
                    <input
                      id={c.id}
                      type="checkbox"
                      checked={c.done}
                      onChange={() => setChecklist(checklist.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)))}
                      className="mt-0.5 size-4"
                    />
                    <label htmlFor={c.id} className={cx('text-[13.5px] leading-snug', c.done && 'text-faint line-through')}>{c.text}</label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="qb">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="qb" className="font-serif text-[24px]">
              Question bank <span className="font-mono text-[12px] text-faint">{qs.length}</span>
            </h2>
            <Segmented
              label="Filter by role"
              value={role}
              onChange={setRole}
              options={(['All', 'Frontend', 'Full-stack', 'Data', 'Behavioural'] as RoleF[]).map((r) => ({ value: r, label: r }))}
            />
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {qs.map((q) => (
              <li key={q.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Tag tone="ink">{q.role}</Tag>
                    <Tag tone={DIFF_TONE[q.difficulty]}>{q.difficulty}</Tag>
                  </div>
                  <p className="mt-2 text-[14.5px] leading-snug text-ink">{q.text}</p>
                </div>
                <Button size="sm" variant="outline" icon={Play} onClick={() => setActive(q)}>Practise</Button>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="star">
          <h2 id="star" className="font-serif text-[24px]">STAR notes</h2>
          <p className="mt-1 text-[13.5px] text-muted">Situation, Task, Action, Result. Reuse your best stories.</p>
          <ul className="mt-4 space-y-3">
            {data.starNotes.map((s) => (
              <li key={s.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-[17px] leading-snug">{s.title}</h3>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => <Tag key={t} tone="green">{t}</Tag>)}
                </div>
                <dl className="mt-3 space-y-1.5 text-[13px] leading-snug">
                  {([['S', s.s], ['T', s.t], ['A', s.a], ['R', s.r]] as const).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[18px_1fr] gap-2">
                      <dt className="font-mono text-[11px] text-terra">{k}</dt>
                      <dd className="text-ink/85">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 -ml-2"
                  onClick={() => {
                    setPrefill(`${s.s} ${s.t} ${s.a} ${s.r}`);
                    const qTarget = data.questions.find((q) => q.id === 'q10') || data.questions[0];
                    if (qTarget) setActive(qTarget);
                  }}
                >
                  Use in an answer →
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function MockInterview({
  q,
  all,
  prefill,
  onExit,
  onNext,
  onToast,
}: {
  q: Question;
  all: Question[];
  prefill: string;
  onExit: () => void;
  onNext: (q: Question) => void;
  onToast: (m: string) => void;
}) {
  const [answer, setAnswer] = useState(prefill);
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(true);
  const [hint, setHint] = useState(false);
  const [fb, setFb] = useState<{ clarity: number; relevance: number; depth: number } | null>(null);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const idx = all.findIndex((x) => x.id === q.id);

  const grade = () => {
    const kws = (q.hint.toLowerCase().match(/[a-z]{5,}/g) ?? []).filter((k) => answer.toLowerCase().includes(k)).length;
    setFb({
      clarity: Math.min(9, 5 + Math.floor(words / 35)),
      relevance: Math.min(9, 5 + kws * 2),
      depth: Math.min(9, 3 + Math.floor(words / 25)),
    });
    setRunning(false);
  };

  const overall = fb ? ((fb.clarity + fb.relevance + fb.depth) / 3).toFixed(1) : null;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-[13.5px] text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />Back to prep
        </button>
        <span className="font-mono text-[11px] text-muted">Mock interview · question {idx + 1} of {all.length}</span>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tag tone="ink">{q.role}</Tag>
              <Tag tone={DIFF_TONE[q.difficulty]}>{q.difficulty}</Tag>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cx('font-mono text-[22px] tnum', secs > 120 ? 'text-terra' : 'text-ink')}
                role="timer"
                aria-label={`Elapsed ${mm} minutes ${ss} seconds`}
              >
                {mm}:{ss}
              </span>
              <Button size="sm" variant="secondary" icon={running ? Pause : Play} onClick={() => setRunning(!running)}>
                {running ? 'Pause' : 'Resume'}
              </Button>
              <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => setSecs(0)} aria-label="Reset timer">
                Reset
              </Button>
            </div>
          </div>
          <h2 className="mt-5 font-serif text-[24px] leading-snug md:text-[28px]">{q.text}</h2>
          <p className="mt-2 font-mono text-[11px] text-muted">Aim for 90–120 seconds when spoken · about 180–250 words</p>
          <button
            type="button"
            onClick={() => setHint(!hint)}
            aria-expanded={hint}
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-terra hover:underline"
          >
            <Lightbulb className="size-4" aria-hidden />{hint ? 'Hide hint' : 'Show hint'}
          </button>
          {hint && <p className="mt-2 rounded-xl bg-amber/10 px-3 py-2 text-[13.5px] text-ink">{q.hint}</p>}
          <label htmlFor="mock-answer" className="mt-5 block text-[13px] font-medium">Your answer</label>
          <textarea
            id="mock-answer"
            rows={9}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer as you would say it…"
            className="field mt-1.5 leading-relaxed"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted">{words} words</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() =>
                  setAnswer(
                    'useEffect runs after render. The dependency array tells React when to re-run it: an empty array runs once after mount, listed values re-run it when they change, and no array runs it after every render. If you read state inside the effect but leave it out of the array, you get a stale closure. The cleanup function runs before the next effect and on unmount, which is where I remove listeners or cancel timers. In my weather dashboard I fetched data in an effect keyed on the city and used an AbortController in cleanup so quick city changes did not race.'
                  )
                }
              >
                Use sample answer
              </Button>
              <Button variant="primary" icon={Sparkles} disabled={words < 8} onClick={grade}>
                Get feedback
              </Button>
            </div>
          </div>
        </Card>
        <Card className="p-5 md:p-6" aria-live="polite">
          <Micro as="p">Feedback</Micro>
          {!fb ? (
            <EmptyState
              compact
              className="mt-3"
              icon={Sparkles}
              title="Answer, then get feedback"
              body="We score clarity, relevance and depth, and point to the one change that helps most."
            />
          ) : (
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[44px] leading-none">{overall}</span>
                <span className="font-mono text-[12px] text-faint">/10</span>
              </div>
              <ul className="mt-5 space-y-3.5">
                {([['Clarity', fb.clarity], ['Relevance', fb.relevance], ['Depth', fb.depth]] as const).map(([k, v]) => (
                  <li key={k}>
                    <div className="flex justify-between text-[13px]">
                      <span>{k}</span>
                      <span className="font-mono">{v}/10</span>
                    </div>
                    <Bar value={v} max={10} tone={v >= 7 ? 'green' : v >= 5 ? 'blue' : 'amber'} height={6} className="mt-1.5" />
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2 text-[13.5px]">
                <p>
                  <b className="font-medium text-green">Worked:</b>{' '}
                  {fb.relevance >= 7 ? 'You named the key ideas the interviewer listens for.' : 'Clear opening sentence.'}
                </p>
                <p>
                  <b className="font-medium text-amber">Improve:</b>{' '}
                  {fb.depth < 7
                    ? 'Add one concrete example from a project, with a number.'
                    : 'Trim the intro so the example arrives sooner.'}
                </p>
              </div>
              <div className="mt-5 flex gap-2">
                <Button onClick={() => { setFb(null); setSecs(0); setRunning(true); }}>Try again</Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    onNext(all[(idx + 1) % all.length]);
                    onToast('Answer saved to your practice log');
                  }}
                >
                  Next question
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

