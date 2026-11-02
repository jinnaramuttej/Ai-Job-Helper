'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, CornerDownLeft, FileText, History, Paperclip, Plus, Sparkles, X } from 'lucide-react';
import type { ChatTurn, UIData } from '@/lib/view-models';
import { Button, Drawer, EmptyState, ErrorState, IconButton, Micro, Skeleton, Tag, cx } from '../ui';
import { answer, type AiAnswer } from '@/lib/assistant';
import { AiResultCard, useTyped } from './Overview';

interface Msg {
  id: string;
  role: 'user' | 'ai';
  time: string;
  text: string;
  base?: ChatTurn;
  ans?: AiAnswer;
  fresh?: boolean;
}

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export interface CommandScreenProps {
  data: UIData;
  state: 'ready' | 'loading' | 'empty' | 'error';
  seed?: string | null;
  onNavigate?: (screen: string, params?: { jobId?: string; query?: string }) => void;
  onToast?: (msg: string) => void;
  onRetry?: () => void;
}

export function CommandScreen({
  data,
  state,
  seed = null,
  onNavigate,
  onToast = () => undefined,
  onRetry = () => undefined,
}: CommandScreenProps) {
  const router = useRouter();
  const navigate = onNavigate ?? ((screen, params) => {
    if (params?.jobId) {
      router.push(`/${screen}?jobId=${encodeURIComponent(params.jobId)}`);
    } else if (params?.query) {
      router.push(`/${screen}?q=${encodeURIComponent(params.query)}`);
    } else {
      router.push(`/${screen}`);
    }
  });

  const initial: Msg[] = state === 'empty' ? [] : data.conversation.map((t) => ({
    id: t.id,
    role: t.role,
    time: t.time,
    text: t.text,
    base: t,
  }));

  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [q, setQ] = useState('');
  const [attached, setAttached] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const id = String(Date.now());
    setMsgs((m) => [
      ...m.map((x) => ({ ...x, fresh: false })),
      { id: `u${id}`, role: 'user', time: nowTime(), text: attached ? `${t} (with resume_v5.pdf)` : t },
      { id: `a${id}`, role: 'ai', time: nowTime(), text: '', ans: answer(t, data), fresh: true },
    ]);
    setQ('');
  };

  useEffect(() => {
    if (seed && !seeded.current && state === 'ready') {
      seeded.current = true;
      send(seed);
    }
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [msgs.length]);

  if (state === 'loading') {
    return (
      <div className="flex h-full" aria-busy="true" aria-label="Loading assistant">
        <div className="hidden w-[272px] space-y-3 border-r border-line p-5 lg:block">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
        </div>
        <div className="flex-1 space-y-6 p-6 md:p-10">
          {[60, 80, 50, 75].map((_, i) => <Skeleton key={i} className={cx('h-16 rounded-2xl', i % 2 ? '' : 'ml-auto')} />)}
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="p-4 md:p-10">
        <ErrorState
          title="The assistant is unavailable"
          body="We couldn’t reach the AI service. Your history is saved; you can still browse Jobs and Applications."
          onRetry={onRetry}
        />
      </div>
    );
  }

  const history = (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <Button variant="secondary" icon={Plus} className="w-full" onClick={() => { setMsgs([]); setHistoryOpen(false); }}>
          New command
        </Button>
      </div>
      <div className="scroll-thin flex-1 overflow-y-auto px-3 pb-6">
        {data.commandHistory.map((g) => (
          <div key={g.group} className="mb-5">
            <div className="micro px-2 pb-1.5 text-faint">{g.group}</div>
            <ul className="space-y-0.5">
              {(state === 'empty' ? [] : g.items).map((it) => (
                <li key={it.text}>
                  <button
                    type="button"
                    onClick={() => { send(it.text); setHistoryOpen(false); }}
                    className="group flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-soft"
                  >
                    <History className="mt-0.5 size-3.5 shrink-0 text-faint" aria-hidden />
                    <span className="min-w-0 flex-1 text-[13px] leading-snug text-ink">{it.text}</span>
                    <span className="font-mono text-[10.5px] text-faint">{it.time}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {state === 'empty' && <p className="px-2 text-[13px] text-muted">No past commands yet.</p>}
      </div>
    </div>
  );

  return (
    <div className="flex md:h-full flex-col">
      <div className="px-4 pt-2 text-xs font-mono text-muted">Preview data</div>
      <div className="flex md:h-full">
        <aside className="hidden w-[272px] shrink-0 border-r border-line bg-side/60 lg:block" aria-label="Command history">
          {history}
        </aside>
        <Drawer open={historyOpen} onClose={() => setHistoryOpen(false)} title="History" side="left" width="md:w-[320px]">
          {history}
        </Drawer>
        <section className="flex min-w-0 flex-1 flex-col" aria-label="Assistant">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 md:px-8">
            <div className="min-w-0">
              <Micro as="p">AI assistant · grounded in your resume, matches and job posts</Micro>
              <h1 className="mt-1 font-serif text-[30px] leading-tight md:text-[34px]">Command</h1>
            </div>
            <Button variant="secondary" size="sm" icon={History} className="lg:hidden" onClick={() => setHistoryOpen(true)}>
              History
            </Button>
          </div>
          <div className="scroll-thin flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="mx-auto max-w-[820px] space-y-7">
              {msgs.length === 0 && (
                <EmptyState
                  icon={Sparkles}
                  title="Ask anything about your search"
                  body="Commands use your resume, your 128 scored jobs and your applications. Every answer lists its sources."
                  action={data.suggestions.map((s) => <Button key={s} size="sm" onClick={() => send(s)}>{s}</Button>)}
                />
              )}
              {msgs.map((m) =>
                m.role === 'user' ? (
                  <UserBubble key={m.id} m={m} />
                ) : (
                  <AiMessage key={m.id} m={m} data={data} onNavigate={navigate} onToast={onToast} />
                )
              )}
              <div ref={endRef} />
            </div>
          </div>
          <div className="border-t border-line bg-canvas px-4 pb-3 pt-3 md:px-8">
            <div className="mx-auto max-w-[820px]">
              <div className="scroll-thin -mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
                {data.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-ink shadow-pill transition-colors duration-150 hover:border-border-subtle"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send(q); }} className="card flex flex-col gap-2 p-3 focus-within:border-low-grey focus-within:ring-2 focus-within:ring-terra/25">
                {attached && (
                  <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-line bg-soft px-2.5 py-1.5 text-[12.5px]">
                    <FileText className="size-3.5 text-violet" aria-hidden />resume_v5.pdf<span className="font-mono text-[10.5px] text-faint">ATS 72</span>
                    <button type="button" aria-label="Remove attached resume" onClick={() => setAttached(false)} className="text-muted hover:text-ink">
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </span>
                )}
                <label htmlFor="cmd-input" className="sr-only">Message Jaggle</label>
                <textarea
                  id="cmd-input"
                  rows={2}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(q);
                    }
                  }}
                  placeholder="Ask for jobs, a resume edit, interview prep…"
                  className="w-full resize-none bg-transparent px-1 text-[15px] leading-relaxed focus-visible:outline-none"
                />
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Paperclip}
                    onClick={() => setAttached((a) => !a)}
                    aria-pressed={attached}
                  >
                    {attached ? 'Resume attached' : 'Attach resume'}
                  </Button>
                  <div className="flex items-center gap-3">
                    <span className="hidden font-mono text-[10.5px] text-faint sm:inline">Shift ↵ for new line</span>
                    <Button type="submit" variant="primary" size="sm" iconRight={CornerDownLeft} disabled={!q.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              </form>
              <p className="mt-2 pr-24 font-mono text-[10.5px] leading-[28px] text-faint">
                Answers use only your resume, scores and synced job posts. Check key details before you apply.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function UserBubble({ m }: { m: Msg }) {
  return (
    <div className="flex flex-col items-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-soft px-4 py-2.5 text-[14.5px] text-ink">{m.text}</div>
      <span className="mt-1 font-mono text-[10.5px] text-faint">You · {m.time}</span>
    </div>
  );
}

function AiMessage({
  m,
  data,
  onNavigate,
  onToast,
}: {
  m: Msg;
  data: UIData;
  onNavigate: (s: string, p?: { jobId?: string; query?: string }) => void;
  onToast: (s: string) => void;
}) {
  const text = m.ans ? m.ans.text : m.text;
  const typed = useTyped(m.fresh ? text : null);
  const shown = m.fresh ? typed.shown : text;
  const done = !m.fresh || typed.done;
  const sources = m.base?.sources ?? m.ans?.sources ?? [];
  const jobs = useMemo(() => {
    const f = m.base?.jobFilter;
    if (!f) return [];
    return data.jobs
      .filter((j) => (!f.mode || j.mode === f.mode) && (!f.role || j.role === f.role) && j.score >= (f.min ?? 0))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [m.base, data.jobs]);
  const [applied, setApplied] = useState<number[]>([]);
  const [checked, setChecked] = useState<number[]>([]);

  return (
    <article className="flex gap-3" aria-label="Assistant reply">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-terra/10 text-terra">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium">Jaggle</span>
          <span className="font-mono text-[10.5px] text-faint">{m.time}</span>
        </div>
        <p className="mt-1 text-[15px] leading-relaxed text-ink">
          {shown}
          {sources.length > 0 && done && sources.map((_, i) => <sup key={i} className="ml-0.5 font-mono text-[10px] text-terra">[{i + 1}]</sup>)}
          {!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-ink" aria-hidden />}
        </p>
        {done && (
          <div className="mt-4 space-y-4">
            {m.base?.kind === 'jobs' && (
              <div className="grid gap-3 md:grid-cols-3">
                {jobs.map((j) => (
                  <AiResultCard
                    key={j.id}
                    onNavigate={onNavigate}
                    c={{
                      id: j.id,
                      kind: 'job',
                      title: j.title,
                      meta: `${j.company} · ${j.mode}`,
                      score: j.score,
                      jobId: j.id,
                      action: 'View match',
                      target: 'jobs',
                    }}
                  />
                ))}
              </div>
            )}
            {m.base?.kind === 'diff' && m.base.diff && (
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <Tag category="RESUME">Resume diff</Tag>
                    <span className="font-mono text-[11px] text-muted">v5 → v6 · NovaPay</span>
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setApplied([0, 1, 2]);
                      onToast('3 edits applied to a new draft: resume_v6_novapay');
                    }}
                  >
                    Apply all
                  </Button>
                </div>
                {m.base.diff.map((d, i) => (
                  <div key={i} className="grid gap-2 border-b border-line px-4 py-3 last:border-0 md:grid-cols-[88px_1fr_auto] md:items-start md:gap-4">
                    <span className="micro pt-0.5">{d.section}</span>
                    <div className="space-y-1.5 text-[13px] leading-snug">
                      <p className="rounded-md bg-terra/[0.07] px-2 py-1 text-muted line-through decoration-terra/50">
                        <span className="sr-only">Removed: </span>{d.before}
                      </p>
                      <p className="rounded-md bg-green/[0.08] px-2 py-1 text-ink">
                        <span className="sr-only">Added: </span>{d.after}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={applied.includes(i) ? 'ghost' : 'outline'}
                      icon={applied.includes(i) ? Check : undefined}
                      disabled={applied.includes(i)}
                      onClick={() => {
                        setApplied([...applied, i]);
                        onToast('Edit applied to draft');
                      }}
                    >
                      {applied.includes(i) ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {m.base?.kind === 'plan' && m.base.plan && (
              <ul className="card divide-y divide-line">
                {m.base.plan.map((p, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-3">
                    <input
                      id={`plan-${m.id}-${i}`}
                      type="checkbox"
                      checked={checked.includes(i)}
                      onChange={() => setChecked(checked.includes(i) ? checked.filter((x) => x !== i) : [...checked, i])}
                      className="size-4"
                    />
                    <label htmlFor={`plan-${m.id}-${i}`} className={cx('flex-1 text-[14px]', checked.includes(i) && 'text-faint line-through')}>
                      {p.title}
                    </label>
                    <span className="font-mono text-[11px] text-muted">{p.minutes} min</span>
                  </li>
                ))}
                <li className="flex items-center justify-between px-4 py-2.5">
                  <span className="font-mono text-[11px] text-muted">
                    {checked.length}/{m.base.plan.length} done · {m.base.plan.reduce((a, p) => a + p.minutes, 0)} min
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => onNavigate('interview')}>
                    Open Interview Prep →
                  </Button>
                </li>
              </ul>
            )}
            {m.ans && m.ans.cards.length > 0 && (
              <div className={cx('grid gap-3', m.ans.cards.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
                {m.ans.cards.map((c) => (
                  <AiResultCard
                    key={c.id}
                    c={c}
                    onNavigate={onNavigate}
                    onAction={c.action === 'Add to plan' ? () => onToast(`${c.title} added to your learning plan`) : undefined}
                  />
                ))}
              </div>
            )}
            {sources.length > 0 && (
              <div className="border-t border-line pt-2.5">
                <Micro as="p" className="text-faint">Sources used</Micro>
                <ol className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {sources.map((s, i) => (
                    <li key={s} className="font-mono text-[11px] text-muted">
                      <span className="text-terra">[{i + 1}]</span> {s}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="flex gap-1">
              <IconButton
                label="Copy answer"
                icon={Copy}
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(text).catch(() => undefined);
                  onToast('Answer copied');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

