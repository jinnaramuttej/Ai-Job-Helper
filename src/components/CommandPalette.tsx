'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellPlus, Briefcase, FilePlus2, Mic, Plus, RefreshCw, Search, Sparkles, Upload, type LucideIcon } from 'lucide-react';
import type { Job } from '@/lib/view-models';
import { Kbd, useLayer } from './ui';
import { NAV_SECTIONS } from './Shell';

interface Item {
  id: string;
  group: 'Jobs' | 'Pages' | 'Actions' | 'Ask AI';
  label: string;
  sub?: string;
  icon: LucideIcon;
  run: () => void;
  score?: number;
}

export function CommandPalette({
  open,
  onClose,
  jobs = [],
  onToast,
}: {
  open: boolean;
  onClose: () => void;
  jobs?: Job[];
  onToast: (m: string) => void;
}) {
  const router = useRouter();
  const ref = useLayer(open, onClose);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);

  const items = useMemo<Item[]>(() => {
    const ql = q.trim().toLowerCase();
    const navigate = (href: string) => () => {
      router.push(href);
      onClose();
    };

    const jobItems: Item[] = jobs
      .filter((j) => !ql || `${j.title} ${j.company} ${j.role} ${j.city}`.toLowerCase().includes(ql))
      .sort((a, b) => b.score - a.score)
      .slice(0, ql ? 6 : 4)
      .map((j) => ({
        id: `job-${j.id}`,
        group: 'Jobs',
        label: j.title,
        sub: `${j.company} · ${j.city}`,
        score: j.score,
        icon: Briefcase,
        run: navigate(`/jobs?focus=${j.id}`),
      }));

    const pageItems: Item[] = NAV_SECTIONS.flatMap((s) => s.items)
      .concat([{ id: 'settings', href: '/settings', label: 'Settings', icon: Search }])
      .filter((p) => !ql || p.label.toLowerCase().includes(ql))
      .map((p) => ({
        id: `page-${p.id}`,
        group: 'Pages',
        label: p.label,
        sub: 'Go to page',
        icon: p.icon,
        run: navigate(p.href),
      }));

    const actionItems: Item[] = ([
      { id: 'a-upload', label: 'Upload a new resume', icon: Upload, run: navigate('/resume') },
      { id: 'a-alert', label: 'Create a job alert from current filters', icon: BellPlus, run: () => { onToast('Alert created: Frontend · Remote · 60+ (daily)'); onClose(); } },
      { id: 'a-app', label: 'Add an application', icon: Plus, run: navigate('/applications') },
      { id: 'a-mock', label: 'Start a mock interview', icon: Mic, run: navigate('/interview') },
      { id: 'a-export', label: 'Export tailored resume', icon: FilePlus2, run: navigate('/resume') },
      { id: 'a-sync', label: 'Sync jobs now', icon: RefreshCw, run: () => { onToast('Synced: 128 jobs, 0 new since 2m ago'); onClose(); } },
    ] as Omit<Item, 'group'>[]).filter((a) => !ql || a.label.toLowerCase().includes(ql)).map((a) => ({ ...a, group: 'Actions' as const }));

    const ask: Item[] = ql ? [{
      id: 'ask',
      group: 'Ask AI',
      label: `Ask Jaggle: “${q.trim()}”`,
      sub: 'Opens Command',
      icon: Sparkles,
      run: navigate(`/command?query=${encodeURIComponent(q.trim())}`),
    }] : [];

    return [...jobItems, ...pageItems, ...actionItems, ...ask];
  }, [q, jobs, router, onClose, onToast]);

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[idx]?.run();
    }
  };

  const handleQueryChange = (val: string) => {
    setQ(val);
    setIdx(0);
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-start justify-center bg-ink/30 px-3 pt-[9vh]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Command palette" className="card w-full max-w-[640px] overflow-hidden shadow-pop">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-[18px] text-faint" aria-hidden />
          <input
            data-autofocus
            value={q}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={onKey}
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={items[idx] ? `cmdk-${items[idx].id}` : undefined}
            aria-label="Search or ask"
            placeholder="Search jobs, pages and actions, or ask anything…"
            className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-ink focus-visible:outline-none"
          />
          <Kbd>esc</Kbd>
        </div>
        <div id="cmdk-list" role="listbox" aria-label="Results" className="scroll-thin max-h-[56vh] overflow-y-auto p-2">
          {items.length === 0 && <p className="px-3 py-8 text-center text-[13.5px] text-muted">No results. Press ↵ to ask Jaggle.</p>}
          {(['Jobs', 'Pages', 'Actions', 'Ask AI'] as const).map((g) => {
            const inG = items.filter((it) => it.group === g);
            if (!inG.length) return null;
            return (
              <div key={g} className="mb-2">
                <div className="micro px-2.5 py-1 text-faint">{g}</div>
                {inG.map((it) => {
                  const globalIdx = items.indexOf(it);
                  const active = globalIdx === idx;
                  const Icon = it.icon;
                  return (
                    <button
                      key={it.id}
                      id={`cmdk-${it.id}`}
                      role="option"
                      aria-selected={active}
                      onClick={it.run}
                      onMouseEnter={() => setIdx(globalIdx)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[14px] transition-colors duration-150 ${active ? 'bg-soft font-medium text-ink' : 'text-muted hover:text-ink'}`}
                    >
                      <Icon className={`size-4 shrink-0 ${active ? 'text-ink' : 'text-faint'}`} aria-hidden />
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.sub && <span className="font-mono text-[11px] text-faint">{it.sub}</span>}
                      {it.score !== undefined && <span className="font-serif text-[15px] font-medium text-ink">{it.score}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

