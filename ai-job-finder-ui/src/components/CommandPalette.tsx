import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BellPlus, Briefcase, CornerDownLeft, FilePlus2, Mic, Plus, RefreshCw, Search, Sparkles, Upload, type LucideIcon } from 'lucide-react';
import type { MockData, Screen } from '../mock';
import type { NavParams } from '../screens/types';
import { Kbd, cx, useLayer } from './ui';
import { NAV, SCREEN_LABEL } from './Shell';

interface Item { id: string; group: 'Jobs' | 'Pages' | 'Actions' | 'Ask AI'; label: string; sub?: string; icon: LucideIcon; run: () => void; score?: number }

export function CommandPalette({ open, onClose, data, onNavigate, onToast }: { open: boolean; onClose: () => void; data: MockData; onNavigate: (s: Screen, p?: NavParams) => void; onToast: (m: string) => void }) {
  const ref = useLayer(open, onClose);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  useEffect(() => { if (open) { setQ(''); setIdx(0); } }, [open]);

  const items = useMemo<Item[]>(() => {
    const ql = q.trim().toLowerCase();
    const go = (s: Screen, p?: NavParams) => () => { onNavigate(s, p); onClose(); };
    const jobs: Item[] = data.jobs
      .filter((j) => !ql || `${j.title} ${j.company} ${j.role} ${j.city}`.toLowerCase().includes(ql))
      .sort((a, b) => b.score - a.score)
      .slice(0, ql ? 6 : 4)
      .map((j) => ({ id: `job-${j.id}`, group: 'Jobs', label: j.title, sub: `${j.company} · ${j.city}`, score: j.score, icon: Briefcase, run: go('jobs', { jobId: j.id }) }));
    const pages: Item[] = [...NAV.flatMap((s) => s.items), { id: 'settings' as Screen, label: 'Settings', icon: Search }]
      .filter((p) => !ql || p.label.toLowerCase().includes(ql))
      .map((p) => ({ id: `page-${p.id}`, group: 'Pages', label: SCREEN_LABEL[p.id], sub: 'Go to page', icon: p.icon, run: go(p.id) }));
    const actions: Item[] = ([
      { id: 'a-upload', label: 'Upload a new resume', icon: Upload, run: go('resume') },
      { id: 'a-alert', label: 'Create a job alert from current filters', icon: BellPlus, run: () => { onToast('Alert created: Frontend · Remote · 60+ (daily)'); onClose(); } },
      { id: 'a-app', label: 'Add an application', icon: Plus, run: go('applications') },
      { id: 'a-mock', label: 'Start a mock interview', icon: Mic, run: go('interview') },
      { id: 'a-export', label: 'Export tailored resume', icon: FilePlus2, run: go('resume') },
      { id: 'a-sync', label: 'Sync jobs now', icon: RefreshCw, run: () => { onToast('Synced: 128 jobs, 0 new since 2m ago'); onClose(); } },
    ] as Omit<Item, 'group'>[]).filter((a) => !ql || a.label.toLowerCase().includes(ql)).map((a) => ({ ...a, group: 'Actions' as const }));
    const ask: Item[] = ql ? [{ id: 'ask', group: 'Ask AI', label: `Ask AI Job Finder: “${q.trim()}”`, sub: 'Opens Command', icon: Sparkles, run: go('command', { query: q.trim() }) }] : [];
    return [...jobs, ...pages, ...actions, ...ask];
  }, [q, data, onNavigate, onClose, onToast]);

  useEffect(() => { setIdx(0); }, [q]);
  useEffect(() => { document.getElementById(`cmdk-${items[idx]?.id}`)?.scrollIntoView({ block: 'nearest' }); }, [idx, items]);

  if (!open) return null;
  const groups = ['Jobs', 'Pages', 'Actions', 'Ask AI'] as const;
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); items[idx]?.run(); }
  };
  return (
    <div className="fixed inset-0 z-[75] flex items-start justify-center bg-[#1B1916]/30 px-3 pt-[9vh]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Command palette" className="card w-full max-w-[640px] overflow-hidden shadow-pop">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-[18px] text-faint" aria-hidden />
          <input data-autofocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-activedescendant={items[idx] ? `cmdk-${items[idx].id}` : undefined} aria-label="Search or ask"
            placeholder="Search jobs, pages and actions, or ask anything…" className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-ink focus-visible:outline-none" />
          <Kbd>esc</Kbd>
        </div>
        <div id="cmdk-list" role="listbox" aria-label="Results" className="scroll-thin max-h-[56vh] overflow-y-auto p-2">
          {items.length === 0 && <p className="px-3 py-8 text-center text-[13.5px] text-muted">No results. Press ↵ to ask AI Job Finder.</p>}
          {groups.map((g) => {
            const gi = items.filter((it) => it.group === g);
            if (!gi.length) return null;
            return (
              <div key={g} role="group" aria-label={g} className="mb-1.5">
                <div className="micro px-3 pb-1 pt-2 text-faint">{g}</div>
                {gi.map((it) => {
                  const i = items.indexOf(it);
                  const active = i === idx;
                  return (
                    <div key={it.id} id={`cmdk-${it.id}`} role="option" aria-selected={active} onMouseEnter={() => setIdx(i)} onClick={it.run}
                      className={cx('flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150', active ? 'bg-soft' : 'hover:bg-soft/60')}>
                      <span className={cx('grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-white', it.group === 'Ask AI' ? 'text-terra' : 'text-muted')}><it.icon className="size-4" aria-hidden /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] text-ink">{it.label}</span>
                        {it.sub && <span className="block truncate text-[12px] text-muted">{it.sub}</span>}
                      </span>
                      {it.score != null && <span className="font-mono text-[11.5px] text-muted"><span className="font-serif text-[16px] text-ink">{it.score}</span>/100</span>}
                      {active ? <CornerDownLeft className="size-4 text-muted" aria-hidden /> : <ArrowRight className="size-4 text-transparent" aria-hidden />}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-[#FBF9F4] px-4 py-2.5 text-[11.5px] text-muted">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
          <span className="flex items-center gap-1"><Kbd>esc</Kbd> close</span>
          <span className="ml-auto hidden items-center gap-1 sm:flex"><Kbd>⌘K</Kbd> toggle anywhere</span>
        </div>
      </div>
    </div>
  );
}
