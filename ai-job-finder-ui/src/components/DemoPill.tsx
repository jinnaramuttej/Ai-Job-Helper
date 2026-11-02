import { useState } from 'react';
import { ChevronUp, FlaskConical } from 'lucide-react';
import type { DataState, Screen } from '../mock';
import { SCREEN_LABEL } from './Shell';
import { cx, useDismiss } from './ui';

const PRODUCT: Screen[] = ['overview', 'command', 'jobs', 'matches', 'saved', 'skills', 'resume', 'interview', 'insights', 'applications', 'calendar', 'activity', 'settings'];
const OUTSIDE: Screen[] = ['landing', 'login', 'signup', 'onboarding'];
const STATES: DataState[] = ['ready', 'loading', 'empty', 'error'];

/** Developer tool only. Collapsed by default; simulates backend states. Not part of the product UI. */
export function DemoPill({ screen, state, onScreen, onState }: { screen: Screen; state: DataState; onScreen: (s: Screen) => void; onState: (s: DataState) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} className="fixed bottom-[78px] right-3 z-[60] md:bottom-5 md:right-5">
      {open && (
        <div role="dialog" aria-label="Demo controls" className="absolute bottom-11 right-0 w-[272px] rounded-2xl border border-dashed border-[#CFC8BB] bg-card p-4 shadow-pop">
          <div className="flex items-center justify-between">
            <span className="micro">Demo controls</span>
            <span className="rounded border border-dashed border-[#CFC8BB] px-1.5 font-mono text-[10px] uppercase text-faint">dev only</span>
          </div>
          <label htmlFor="demo-screen" className="mt-3 block text-[12px] text-muted">Screen</label>
          <select id="demo-screen" className="field mt-1 !py-2 text-[13px]" value={screen} onChange={(e) => onScreen(e.target.value as Screen)}>
            <optgroup label="Product">{PRODUCT.map((s) => <option key={s} value={s}>{SCREEN_LABEL[s]}</option>)}</optgroup>
            <optgroup label="Marketing and auth">{OUTSIDE.map((s) => <option key={s} value={s}>{SCREEN_LABEL[s]}</option>)}</optgroup>
          </select>
          <div className="mt-3 text-[12px] text-muted" id="demo-state">Data state</div>
          <div className="mt-1 grid grid-cols-4 gap-1" role="group" aria-labelledby="demo-state">
            {STATES.map((s) => (
              <button key={s} type="button" aria-pressed={state === s} onClick={() => onState(s)}
                className={cx('rounded-md border px-1 py-1.5 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors duration-150',
                  state === s ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:text-ink')}>
                {s}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-snug text-faint">Simulates backend responses for review. Not part of the product.</p>
        </div>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`Demo controls, ${state} state`}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-[#CFC8BB] bg-card px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted shadow-pill transition-colors duration-150 hover:text-ink">
        <FlaskConical className="size-3.5" aria-hidden />Demo
        {state !== 'ready' && <span className="rounded bg-amber/10 px-1 text-amber">{state}</span>}
        <ChevronUp className={cx('size-3 transition-transform duration-150', open && 'rotate-180')} aria-hidden />
      </button>
    </div>
  );
}
