'use client';

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { Inbox, RefreshCw, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import type { AppStatus, Category, JobSkill, Tone } from '@/lib/view-models';
import { CAT_TONE, STATUS_META, initialsOf, tierOf } from '@/lib/view-models';

export function cx(...a: Array<string | false | null | undefined | 0>): string {
  return a.filter(Boolean).join(' ');
}

export const TONES: Record<Tone, { text: string; bg: string; dot: string; hex: string }> = {
  green: { text: 'text-green', bg: 'bg-green/10', dot: 'bg-green', hex: 'var(--color-green)' },
  amber: { text: 'text-amber', bg: 'bg-amber/10', dot: 'bg-amber', hex: 'var(--color-amber)' },
  blue: { text: 'text-blue', bg: 'bg-blue/10', dot: 'bg-blue', hex: 'var(--color-blue)' },
  violet: { text: 'text-violet', bg: 'bg-violet/10', dot: 'bg-violet', hex: 'var(--color-violet)' },
  terra: { text: 'text-terra', bg: 'bg-terra/10', dot: 'bg-terra', hex: 'var(--color-terra)' },
  ink: { text: 'text-ink', bg: 'bg-ink/[0.06]', dot: 'bg-ink', hex: 'var(--color-ink)' },
  faint: { text: 'text-muted', bg: 'bg-faint/15', dot: 'bg-faint', hex: 'var(--color-faint)' },
};

/* ---------- layering: Escape + focus trap + focus restore for stacked dialogs ---------- */
const layerStack: number[] = [];
let layerSeq = 0;
export function useLayer(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onClose);
  useEffect(() => { cb.current = onClose; });
  useEffect(() => {
    if (!open) return;
    const id = ++layerSeq;
    layerStack.push(id);
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const root = ref.current;
      const el = root?.querySelector<HTMLElement>('[data-autofocus],input:not([type=hidden]),textarea,select');
      (el ?? root)?.focus();
    }, 20);
    const onKey = (e: KeyboardEvent) => {
      if (layerStack[layerStack.length - 1] !== id) return;
      if (e.key === 'Escape') { e.preventDefault(); cb.current(); return; }
      if (e.key === 'Tab' && ref.current) {
        const f = Array.from(ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      const i = layerStack.indexOf(id);
      if (i >= 0) layerStack.splice(i, 1);
      prev?.focus?.();
    };
  }, [open]);
  return ref;
}

export function useDismiss<T extends HTMLElement = HTMLDivElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const cb = useRef(onClose);
  useEffect(() => { cb.current = onClose; });
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb.current(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cb.current(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return ref;
}

export function useIsMobile(): boolean {
  const q = '(max-width: 767px)';
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    on();
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

/* ---------- primitives ---------- */
export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('card', className)} {...rest}>{children}</div>;
}

export function Micro({ children, className, as = 'span', id }: { children: ReactNode; className?: string; as?: 'span' | 'p' | 'div' | 'h2' | 'h3'; id?: string }) {
  const As = as;
  return <As id={id} className={cx('micro', className)}>{children}</As>;
}

export function Dot({ tone = 'ink', className }: { tone?: Tone; className?: string }) {
  return <span aria-hidden className={cx('inline-block size-1.5 shrink-0 rounded-full', TONES[tone].dot, className)} />;
}

export function Tag({ category, tone, children, className }: { category?: Category; tone?: Tone; children?: ReactNode; className?: string }) {
  const t = TONES[tone ?? (category ? CAT_TONE[category] : 'ink')];
  return (
    <span className={cx('inline-flex shrink-0 items-center whitespace-nowrap rounded-[6px] px-1.5 py-[3px] font-mono text-[11px] uppercase leading-none tracking-[0.08em]', t.bg, t.text, className)}>
      {children ?? category}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden className={cx('inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)} />;
}

type BtnVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
export function Button({ variant = 'secondary', size = 'md', icon: Icon, iconRight: IconR, loading, className, children, type, disabled, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; icon?: LucideIcon; iconRight?: LucideIcon; loading?: boolean }) {
  const sizes = { sm: 'h-8 px-3 text-[13px]', md: 'h-9 px-4 text-[13.5px]', lg: 'h-11 px-5 text-[15px]' };
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-btn text-white hover:bg-btn-hover shadow-[0_1px_0_rgba(0,0,0,0.25)]',
    secondary: 'border border-line bg-white text-ink shadow-pill hover:border-border-subtle hover:bg-card',
    outline: 'border border-line bg-transparent text-ink hover:border-border-subtle hover:bg-white',
    ghost: 'text-muted hover:bg-soft hover:text-ink',
    danger: 'bg-terra text-white hover:bg-terra-hover',
    link: 'text-terra underline-offset-4 hover:underline',
  };
  return (
    <button
      type={type ?? 'button'}
      disabled={disabled || loading}
      className={cx('inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-[background-color,border-color,color,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'link' ? 'text-[13.5px]' : sizes[size], variants[variant], className)}
      {...rest}
    >
      {loading ? <Spinner className="size-3.5" /> : Icon && <Icon className={size === 'sm' ? 'size-3.5' : 'size-4'} aria-hidden />}
      {children}
      {IconR && <IconR className={size === 'sm' ? 'size-3.5' : 'size-4'} aria-hidden />}
    </button>
  );
}

export function IconButton({ label, icon: Icon, className, size = 'md', variant = 'ghost', ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: LucideIcon; size?: 'sm' | 'md'; variant?: 'ghost' | 'secondary' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx('inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-150',
        size === 'sm' ? 'size-8' : 'size-9',
        variant === 'secondary' ? 'border border-line bg-white text-ink shadow-pill hover:border-border-subtle' : 'text-muted hover:bg-soft hover:text-ink', className)}
      {...rest}
    >
      <Icon className={size === 'sm' ? 'size-4' : 'size-[18px]'} aria-hidden />
    </button>
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return <kbd className={cx('inline-flex items-center rounded-[5px] border border-line bg-white px-1.5 py-[1px] font-mono text-[10.5px] text-muted shadow-[0_1px_0_var(--color-line)]', className)}>{children}</kbd>;
}

export function Bar({ value, max = 100, tone = 'ink', className, height = 4, color }: { value: number; max?: number; tone?: Tone; className?: string; height?: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div aria-hidden className={cx('w-full overflow-hidden rounded-full bg-soft', className)} style={{ height }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color ?? TONES[tone].hex }} />
    </div>
  );
}

export function MatchScore({ score, size = 'md', className, bar = true }: { score: number; size?: 'lg' | 'md' | 'sm' | 'xs'; className?: string; bar?: boolean }) {
  const t = tierOf(score);
  const num = { lg: 'text-[40px]', md: 'text-[30px]', sm: 'text-[22px]', xs: 'text-[17px]' }[size];
  const stacked = size === 'sm' || size === 'xs';
  return (
    <div className={cx('min-w-0', className)} role="img" aria-label={`Match score ${score} out of 100, ${t.word}`}>
      <div className="flex items-baseline gap-1">
        <span className={cx('font-serif leading-none text-ink tnum', num)}>{score}</span>
        <span className="font-mono text-[10.5px] text-faint">/100</span>
        {!stacked && <span className={cx('ml-1.5 font-mono text-[11px] uppercase tracking-[0.1em]', TONES[t.tone].text)}>{t.word}</span>}
      </div>
      {stacked && <div className={cx('mt-1 font-mono text-[10px] uppercase tracking-[0.1em]', TONES[t.tone].text)}>{t.word}</div>}
      {bar && <Bar value={score} tone={t.tone} className={stacked ? 'mt-1.5' : 'mt-2'} />}
    </div>
  );
}

export function SkillDots({ skills, className }: { skills: JobSkill[]; className?: string }) {
  const sorted = [...skills].sort((a, b) => Number(b.have) - Number(a.have));
  const have = skills.filter((s) => s.have).length;
  return (
    <span className={cx('inline-flex items-center gap-[3px]', className)} role="img" aria-label={`${have} of ${skills.length} required skills matched`}>
      {sorted.map((s, i) => (
        <span key={i} title={`${s.name}: ${s.have ? 'on your resume' : 'missing'}`} className={cx('size-[6px] rounded-full', s.have ? 'bg-green' : 'border border-low-grey')} />
      ))}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: AppStatus; className?: string }) {
  const m = STATUS_META[status];
  return (
    <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-white px-2 py-[3px] text-[12px] text-ink', className)}>
      <Dot tone={m.tone} />{m.label}
    </span>
  );
}

const MONO_TONES: Tone[] = ['blue', 'violet', 'amber', 'green', 'terra'];
export function Monogram({ name, size = 28, className }: { name: string; size?: number; className?: string }) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const t = TONES[MONO_TONES[h % MONO_TONES.length]];
  return (
    <span aria-hidden className={cx('inline-grid shrink-0 place-items-center rounded-[8px] font-serif leading-none', t.bg, t.text, className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.46) }}>
      {name.replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase() || 'J'}
    </span>
  );
}

export function Avatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  return (
    <span aria-hidden className={cx('inline-grid shrink-0 place-items-center rounded-full bg-btn font-serif text-canvas', className)} style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}>
      {initialsOf(name)}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx('animate-pulse rounded-md bg-soft', className)} />;
}

export function SkeletonPage({ variant = 'grid' }: { variant?: 'grid' | 'list' | 'split' | 'board' }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-6">
      <div className="space-y-3"><Skeleton className="h-3 w-40" /><Skeleton className="h-10 w-72" /><Skeleton className="h-4 w-96 max-w-full" /></div>
      {variant === 'board' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="space-y-3"><Skeleton className="h-4 w-24" />{Array.from({ length: 3 }).map((__, j) => <Skeleton key={j} className="h-28 w-full rounded-xl" />)}</div>)}</div>
      ) : variant === 'list' ? (
        <Card className="divide-y divide-line">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex items-center gap-4 p-4"><Skeleton className="size-9 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div><Skeleton className="h-8 w-20 rounded-full" /></div>)}</Card>
      ) : variant === 'split' ? (
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]"><Skeleton className="h-[420px] rounded-2xl" /><Skeleton className="h-[420px] rounded-2xl" /></div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, body, action, className, compact }: { icon?: LucideIcon; title: string; body: string; action?: ReactNode; className?: string; compact?: boolean }) {
  return (
    <div className={cx('dashed-box flex flex-col items-center justify-center px-6 text-center', compact ? 'py-8' : 'py-14', className)}>
      <div className="mb-3 grid size-10 place-items-center rounded-full bg-soft text-muted"><Icon className="size-5" aria-hidden /></div>
      <h3 className="font-serif text-[21px] leading-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[14px] text-muted">{body}</p>
      {action && <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', body = 'We couldn’t reach the server. Your data is safe; try again in a moment.', onRetry, className }: { title?: string; body?: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cx('card flex flex-col items-center px-6 py-12 text-center', className)}>
      <div className="mb-3 grid size-10 place-items-center rounded-full bg-terra/10 text-terra"><TriangleAlert className="size-5" aria-hidden /></div>
      <h3 className="font-serif text-[22px] leading-tight">{title}</h3>
      <p className="mt-1.5 max-w-md text-[14px] text-muted">{body}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {onRetry && <Button variant="primary" icon={RefreshCw} onClick={onRetry}>Try again</Button>}
        <Button variant="secondary">Status page</Button>
      </div>
      <p className="mt-4 font-mono text-[11px] text-faint">ERR 503 · request 7f3a-91c2 · 09:52</p>
    </div>
  );
}

export function PageHeader({ eyebrow, title, sub, actions, className }: { eyebrow?: ReactNode; title: ReactNode; sub?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <header className={cx('flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <Micro as="p">{eyebrow}</Micro>}
        <h1 className="mt-1.5 font-serif text-[34px] leading-[1.05] tracking-[-0.015em] md:text-[40px]">{title}</h1>
        {sub && <p className="mt-2 text-[15px] text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ title, count, sub, action, className, id }: { title: ReactNode; count?: ReactNode; sub?: ReactNode; action?: ReactNode; className?: string; id?: string }) {
  return (
    <div className={cx('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 id={id} className="font-serif text-[24px] leading-tight tracking-[-0.01em] md:text-[26px]">
          {title}
          {count != null && <span className="ml-2 align-middle font-mono text-[12px] tracking-normal text-faint">{count}</span>}
        </h2>
        {sub && <p className="mt-1 text-[14px] text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
      className={cx('relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full border transition-colors duration-150 disabled:opacity-50',
        checked ? 'border-btn bg-btn' : 'border-line bg-soft')}>
      <span className={cx('inline-block size-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-150', checked ? 'translate-x-[18px]' : 'translate-x-[2px]')} />
    </button>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: LucideIcon; count?: number }[]; label: string; className?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('inline-flex max-w-full overflow-x-auto rounded-full border border-line bg-white p-[3px] shadow-pill', className)}>
      {options.map((o) => {
        const on = value === o.value;
        const Icon = o.icon;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
            className={cx('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors duration-150', on ? 'bg-soft font-medium text-ink' : 'text-muted hover:text-ink')}>
            {Icon && <Icon className="size-3.5" aria-hidden />}{o.label}
            {o.count != null && <span className="font-mono text-[11px] text-faint">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Chip({ active, onClick, children, icon: Icon, className, count }: { active?: boolean; onClick?: () => void; children: ReactNode; icon?: LucideIcon; className?: string; count?: number }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={cx('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-150',
        active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink shadow-pill hover:border-border-subtle', className)}>
      {Icon && <Icon className="size-3.5" aria-hidden />}{children}
      {count != null && <span className={cx('font-mono text-[11px]', active ? 'text-white/70' : 'text-faint')}>{count}</span>}
    </button>
  );
}

export function RemovableChip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-soft py-1 pl-3 pr-1 text-[12.5px] text-ink">
      {children}
      <button type="button" onClick={onRemove} aria-label={`Remove filter ${typeof children === 'string' ? children : ''}`} className="grid size-5 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-white hover:text-ink">
        <X className="size-3" aria-hidden />
      </button>
    </span>
  );
}

export function Field({ label, hint, htmlFor, children, className, error }: { label: string; hint?: ReactNode; htmlFor?: string; children: ReactNode; className?: string; error?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink">{label}</label>
      {children}
      {hint && <div className="mt-1.5 text-[12.5px] text-muted">{hint}</div>}
      {error && <p className="mt-1.5 text-[12.5px] text-terra" role="alert">{error}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = 'md', eyebrow }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; eyebrow?: ReactNode }) {
  const ref = useLayer(open, onClose);
  if (!open) return null;
  const w = { sm: 'sm:max-w-[420px]', md: 'sm:max-w-[560px]', lg: 'sm:max-w-[760px]', xl: 'sm:max-w-[980px]' }[size];
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/30 sm:items-center sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Dialog'} tabIndex={-1}
        className={cx('card flex max-h-[92vh] w-full flex-col overflow-hidden rounded-b-none shadow-pop outline-none sm:rounded-2xl', w)}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>{eyebrow && <Micro as="p">{eyebrow}</Micro>}<h2 className="font-serif text-[22px] leading-tight">{title}</h2></div>
          <IconButton label="Close dialog" icon={X} onClick={onClose} size="sm" />
        </div>
        <div className="scroll-thin overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-warm-bg px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, footer, eyebrow, side = 'right', width = 'md:w-[480px]' }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; eyebrow?: ReactNode; side?: 'left' | 'right'; width?: string }) {
  const ref = useLayer(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] bg-ink/25" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Panel'} tabIndex={-1}
        className={cx('absolute inset-y-0 flex w-full flex-col bg-card shadow-pop outline-none', width, side === 'right' ? 'right-0 border-l border-line' : 'left-0 border-r border-line')}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">{eyebrow && <Micro as="p">{eyebrow}</Micro>}<h2 className="font-serif text-[22px] leading-tight">{title}</h2></div>
          <IconButton label="Close panel" icon={X} onClick={onClose} size="sm" />
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

export function Dropdown({ button, children, align = 'left', className, panelClassName }: { button: (p: { open: boolean; toggle: () => void }) => ReactNode; children: (close: () => void) => ReactNode; align?: 'left' | 'right'; className?: string; panelClassName?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} className={cx('relative', className)}>
      {button({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className={cx('card absolute z-50 mt-2 p-1.5 shadow-pop', align === 'right' ? 'right-0' : 'left-0', panelClassName ?? 'w-56')}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ children, onClick, icon: Icon, active, hint }: { children: ReactNode; onClick: () => void; icon?: LucideIcon; active?: boolean; hint?: ReactNode }) {
  return (
    <button type="button" role="menuitem" onClick={onClick}
      className={cx('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition-colors duration-150 hover:bg-soft', active && 'bg-soft font-medium')}>
      {Icon && <Icon className="size-4 text-muted" aria-hidden />}
      <span className="flex-1">{children}</span>
      {hint}
    </button>
  );
}

export function KV({ k, v, className }: { k: ReactNode; v: ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-baseline justify-between gap-3 py-2', className)}>
      <span className="text-[13px] text-muted">{k}</span>
      <span className="text-right text-[13.5px] text-ink">{v}</span>
    </div>
  );
}

