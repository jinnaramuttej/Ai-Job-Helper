'use client';

/* Hand-written SVG charts. No chart library. Hairline grids, ink/terracotta marks,
   mono axes, direct labels, hover + keyboard-focus tooltips, no animation. */
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { Card, Micro, cx } from './ui';

export const C = {
  ink: 'var(--color-ink)',
  terra: 'var(--color-terra)',
  line: 'var(--color-line)',
  faint: 'var(--color-faint)',
  muted: 'var(--color-muted)',
  soft: 'var(--color-soft)',
  green: 'var(--color-green)',
  amber: 'var(--color-amber)',
  blue: 'var(--color-blue)',
  violet: 'var(--color-violet)',
  lowGrey: 'var(--color-low-grey)',
};
const MONO = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const SERIF = '"Newsreader", Georgia, "Times New Roman", serif';
const axis: CSSProperties = { fontFamily: MONO, fontSize: 10, fill: C.faint, letterSpacing: '0.04em' };
const axisUp: CSSProperties = { ...axis, textTransform: 'uppercase', letterSpacing: '0.1em', fill: C.muted };

export function useWidth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(Math.floor(el.getBoundingClientRect().width));
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) setW(Math.floor(cr.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function scale(v: number) {
  const t = Math.max(v * 1.1, 1);
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200];
  const step = steps.find((s) => t / s <= 4) ?? 500;
  const max = Math.ceil(t / step) * step;
  const ticks: number[] = [];
  for (let x = 0; x <= max; x += step) ticks.push(x);
  return { max, ticks };
}

export function Tip({ x, y, w, children }: { x: number; y: number; w: number; children: ReactNode }) {
  const left = Math.max(72, Math.min(w - 72, x));
  return (
    <div role="status" className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-line bg-card px-2.5 py-1.5 text-[12px] text-ink shadow-pop" style={{ left, top: y - 10 }}>
      {children}
    </div>
  );
}
export function TipRow({ k, v }: { k: ReactNode; v: ReactNode }) {
  return <div className="flex items-baseline justify-between gap-4"><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{k}</span><span className="font-medium tnum">{v}</span></div>;
}

/* ---------- Sparkline 56x18 ---------- */
export function Sparkline({ data, width = 56, height = 18, color = C.ink, label }: { data: number[]; width?: number; height?: number; color?: string; label?: string }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => [2 + (i / Math.max(1, data.length - 1)) * (width - 4), height - 2 - ((v - min) / span) * (height - 4)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1] ?? [0, 0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label ?? `Trend ${data.join(', ')}`} className="shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2} fill={C.terra} />
    </svg>
  );
}

/* ---------- Ring ---------- */
export function Ring({ value, max = 100, size = 96, stroke = 8, color = C.ink, track = C.soft, children, label }: { value: number; max?: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode; label: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={label} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        {pct > 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} />}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/* ---------- Vertical bar chart ---------- */
export interface BarDatum { label: string; value: number; tip?: string }
export function BarChart({ data, height = 190, highlight, goal, goalLabel = 'Goal', ariaLabel, unit = '', tipLabel, labelEvery = 1, color = C.ink, showValues = true }:
  { data: BarDatum[]; height?: number; highlight?: (i: number) => boolean; goal?: number; goalLabel?: string; ariaLabel: string; unit?: string; tipLabel?: (d: BarDatum, i: number) => ReactNode; labelEvery?: number; color?: string; showValues?: boolean }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const padL = 26, padR = goal != null ? 52 : 6, padT = 18, padB = 24;
  const { max, ticks } = scale(Math.max(...data.map((d) => d.value), goal ?? 0));
  const iw = Math.max(0, w - padL - padR), ih = height - padT - padB;
  const band = iw / (data.length || 1), bw = Math.max(4, Math.min(30, band * 0.58));
  const y = (v: number) => padT + ih - (v / max) * ih;
  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={ariaLabel}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke={C.line} />
              <text x={padL - 7} y={y(t) + 3} textAnchor="end" style={axis}>{t}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = padL + band * i + (band - bw) / 2;
            const hi = highlight?.(i) ?? false;
            const dim = hover != null && hover !== i;
            const showLabel = (i % labelEvery === 0 && !(labelEvery > 1 && i === data.length - 2)) || hi;
            return (
              <g key={i} className="chart-mark" tabIndex={0} aria-label={`${d.label}: ${d.value}${unit}`}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
                <rect className="mark-hit" x={padL + band * i + 1} y={padT - 6} width={Math.max(0, band - 2)} height={ih + 6} rx={4} fill="transparent" />
                <rect x={x} y={y(d.value)} width={bw} height={Math.max(0, padT + ih - y(d.value))} rx={2} fill={hi ? C.terra : color} opacity={dim ? 0.45 : hi ? 1 : 0.85} />
                {d.value === 0 && <rect x={x} y={padT + ih - 1.5} width={bw} height={1.5} fill={C.faint} opacity={0.6} />}
                {showValues && d.value > 0 && <text x={x + bw / 2} y={y(d.value) - 5} textAnchor="middle" style={{ ...axis, fill: hi ? C.terra : C.muted }}>{d.value}</text>}
                {showLabel && <text x={x + bw / 2} y={height - 7} textAnchor="middle" style={{ ...axis, fill: hi ? C.ink : C.faint }}>{d.label}</text>}
              </g>
            );
          })}
          {goal != null && (
            <g aria-hidden>
              <line x1={padL} x2={w - padR + 4} y1={y(goal)} y2={y(goal)} stroke={C.ink} strokeDasharray="3 4" />
              <text x={w - padR + 8} y={y(goal) + 3} style={{ ...axisUp, fill: C.ink }}>{goalLabel} {goal}</text>
            </g>
          )}
        </svg>
      )}
      {hover != null && w > 0 && data[hover] && (
        <Tip x={padL + band * hover + band / 2} y={y(data[hover].value)} w={w}>
          {tipLabel ? tipLabel(data[hover], hover) : <TipRow k={data[hover].label} v={`${data[hover].value}${unit}`} />}
        </Tip>
      )}
    </div>
  );
}

/* ---------- Funnel ---------- */
export function Funnel({ steps, ariaLabel }: { steps: { label: string; value: number }[]; ariaLabel: string }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const rowH = 28, gap = 24, labelW = 84;
  const h = steps.length * rowH + (steps.length - 1) * gap + 4;
  const max = steps[0]?.value || 1;
  const drops = steps.slice(1).map((s, i) => steps[i].value - s.value);
  const worst = drops.indexOf(Math.max(...drops));
  const barW = Math.max(0, w - labelW - 4);
  return (
    <div ref={ref} className="relative w-full">
      {w > 0 && (
        <svg width={w} height={h} role="img" aria-label={ariaLabel}>
          {steps.map((s, i) => {
            const y = i * (rowH + gap);
            const bw = Math.max(3, (s.value / max) * barW);
            const prevW = i > 0 ? Math.max(3, (steps[i - 1].value / max) * barW) : bw;
            const isWorstTarget = i - 1 === worst;
            const conv = i < steps.length - 1 ? Math.round((steps[i + 1].value / s.value) * 100) : null;
            return (
              <g key={s.label} className="chart-mark" tabIndex={0} aria-label={`${s.label}: ${s.value}${conv != null ? `, ${conv}% continue` : ''}`}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
                <rect className="mark-hit" x={0} y={y - 2} width={w} height={rowH + 4} rx={6} fill="transparent" />
                <text x={0} y={y + rowH / 2 + 4} style={axisUp}>{s.label}</text>
                {i > 0 && <rect x={labelW + bw} y={y} width={Math.max(0, prevW - bw)} height={rowH} rx={4} fill={isWorstTarget ? C.terra : C.soft} opacity={isWorstTarget ? 0.14 : 1} />}
                <rect x={labelW} y={y} width={bw} height={rowH} rx={4} fill={C.ink} opacity={hover != null && hover !== i ? 0.5 : 0.88} />
                {bw > 0.85 * barW ? (
                  <text x={labelW + bw - 8} y={y + rowH / 2 + 6} textAnchor="end" style={{ fontFamily: SERIF, fontSize: 18, fill: '#ffffff' }}>{s.value}</text>
                ) : (
                  <text x={labelW + bw + 8} y={y + rowH / 2 + 6} textAnchor="start" style={{ fontFamily: SERIF, fontSize: 18, fill: C.ink }}>{s.value}</text>
                )}
                {conv != null && (
                  <text x={labelW} y={y + rowH + 16} style={{ ...axis, fill: i === worst ? C.terra : C.muted }}>
                    ↓ {conv}% continue{i === worst ? ` · biggest drop (−${drops[i]})` : ''}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {hover != null && w > 0 && steps[hover] && (
        <Tip x={labelW + ((steps[hover].value / max) * barW) / 2} y={hover * (rowH + gap)} w={w}>
          <TipRow k={steps[hover].label} v={steps[hover].value} />
          <TipRow k="of applied" v={`${Math.round((steps[hover].value / max) * 100)}%`} />
        </Tip>
      )}
    </div>
  );
}

/* ---------- Radar ---------- */
export function Radar({ axes, series, max = 100, maxSize = 320, ariaLabel, unitFor }: { axes: string[]; series: { name: string; values: number[]; color: string; fill: number }[]; max?: number; maxSize?: number; ariaLabel: string; unitFor?: (seriesIdx: number) => string }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const size = Math.min(w, maxSize);
  const cxp = w / 2, cyp = size / 2, R = Math.max(10, Math.min(size / 2 - 30, w / 2 - 72));
  const n = axes.length;
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, v: number) => [cxp + (v / max) * R * Math.cos(ang(i)), cyp + (v / max) * R * Math.sin(ang(i))];
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).map((x) => x.toFixed(1)).join(',')).join(' ');
  return (
    <div ref={ref} className="relative w-full" style={{ height: size || maxSize }}>
      {w > 0 && (
        <svg width={w} height={size} role="img" aria-label={ariaLabel}>
          {[25, 50, 75, 100].map((r) => <polygon key={r} points={poly(axes.map(() => (r / 100) * max))} fill="none" stroke={C.line} />)}
          {axes.map((_, i) => { const [x, y] = pt(i, max); return <line key={i} x1={cxp} y1={cyp} x2={x} y2={y} stroke={C.line} />; })}
          {series.map((s) => (
            <g key={s.name}>
              <polygon points={poly(s.values)} fill={s.color} fillOpacity={s.fill} stroke={s.color} strokeWidth={1.5} strokeLinejoin="round" />
              {s.values.map((v, i) => { const [x, y] = pt(i, v); return <circle key={i} cx={x} cy={y} r={hover === i ? 3.5 : 2.2} fill={s.color} />; })}
            </g>
          ))}
          {axes.map((a, i) => {
            const [x, y] = pt(i, max * 1.14);
            const cos = Math.cos(ang(i)), sin = Math.sin(ang(i));
            const vertical = Math.abs(cos) < 0.2;
            const anchor = vertical ? 'middle' : cos > 0 ? 'start' : 'end';
            const parts = a.length > 9 && a.includes(' ') ? a.split(' ') : [a];
            const y0 = vertical ? (sin < 0 ? y - 3 : y + 9) : y + 3 - (parts.length - 1) * 5.5;
            return (
              <text key={a} x={x} y={y0} textAnchor={anchor} style={{ ...axis, fill: hover === i ? C.ink : C.muted }}>
                {parts.map((p, k) => <tspan key={k} x={x} dy={k ? 11 : 0}>{p}</tspan>)}
              </text>
            );
          })}
          {axes.map((a, i) => {
            const a0 = ang(i) - Math.PI / n, a1 = ang(i) + Math.PI / n, rr = R * 1.08;
            const d = `M${cxp},${cyp} L${cxp + rr * Math.cos(a0)},${cyp + rr * Math.sin(a0)} A${rr},${rr} 0 0 1 ${cxp + rr * Math.cos(a1)},${cyp + rr * Math.sin(a1)} Z`;
            return (
              <g key={a} className="chart-mark" tabIndex={0} aria-label={`${a}: ${series.map((s, k) => `${s.name} ${s.values[i]}${unitFor?.(k) ?? ''}`).join(', ')}`}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
                <path className="mark-hit" d={d} fill="transparent" />
              </g>
            );
          })}
        </svg>
      )}
      {hover != null && w > 0 && (
        <Tip x={pt(hover, max * 0.5)[0]} y={pt(hover, max * 0.5)[1]} w={w}>
          <div className="mb-1 font-medium">{axes[hover]}</div>
          {series.map((s, k) => <TipRow key={s.name} k={s.name} v={`${s.values[hover]}${unitFor?.(k) ?? ''}`} />)}
        </Tip>
      )}
    </div>
  );
}

export function SeriesKey({ items }: { items: { label: string; color: string; fill?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
          <span className="inline-block h-[3px] w-3.5 rounded-full" style={{ background: it.color }} />{it.label}
        </span>
      ))}
    </div>
  );
}

/* ---------- Horizontal bar ---------- */
export function HBar({ value, max, color = C.ink, height = 8, extra, extraColor = C.terra, label }: { value: number; max: number; color?: string; height?: number; extra?: number; extraColor?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const ext = extra ? Math.max(0, Math.min(100 - pct, (extra / max) * 100)) : 0;
  return (
    <svg width="100%" height={height} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className="block">
      <rect x="0" y="0" width="100%" height={height} rx={height / 2} fill={C.soft} />
      {ext > 0 && <rect x={`${pct}%`} y="0" width={`${ext}%`} height={height} fill={extraColor} opacity={0.35} />}
      <rect x="0" y="0" width={`${pct}%`} height={height} rx={height / 2} fill={color} />
    </svg>
  );
}

/* ---------- Heatmap ---------- */
export function Heatmap({ weeks, startISO, ariaLabel }: { weeks: number[][]; startISO: string; ariaLabel: string }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<[number, number] | null>(null);
  const labelW = 22, gap = 3, cols = weeks.length, top = 16;
  const cell = Math.max(8, Math.min(18, Math.floor((w - labelW - gap * (cols - 1)) / cols)));
  const h = top + 7 * cell + 6 * gap;
  const tints = [C.soft, 'var(--color-heat-1)', 'var(--color-heat-2)', 'var(--color-heat-3)', C.terra];
  const dateOf = (wi: number, di: number) => {
    const t = new Date(startISO + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + wi * 7 + di);
    return t;
  };
  const fmt = (t: Date) => t.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  const months: { x: number; label: string }[] = [];
  weeks.forEach((_, wi) => {
    const t = dateOf(wi, 0);
    const prev = wi > 0 ? dateOf(wi - 1, 0).getUTCMonth() : -1;
    if (t.getUTCMonth() !== prev) months.push({ x: labelW + wi * (cell + gap), label: t.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) });
  });
  return (
    <div ref={ref} className="relative w-full" style={{ height: h }}>
      {w > 0 && (
        <svg width={w} height={h} role="img" aria-label={ariaLabel}>
          {months.map((m) => <text key={m.label} x={m.x} y={10} style={axisUp}>{m.label}</text>)}
          {['M', '', 'W', '', 'F', '', 'S'].map((l, di) => l && <text key={di} x={0} y={top + di * (cell + gap) + cell - 2} style={axis}>{l}</text>)}
          {weeks.map((col, wi) => col.map((v, di) => {
            const x = labelW + wi * (cell + gap), y = top + di * (cell + gap);
            if (v < 0) return <rect key={`${wi}-${di}`} x={x + 0.5} y={y + 0.5} width={cell - 1} height={cell - 1} rx={3} fill="none" stroke={C.line} strokeDasharray="2 2" />;
            return (
              <g key={`${wi}-${di}`} className="chart-mark" tabIndex={wi === weeks.length - 1 && di === 4 ? 0 : -1} aria-label={`${fmt(dateOf(wi, di))}: ${v} actions`}
                onMouseEnter={() => setHover([wi, di])} onMouseLeave={() => setHover(null)} onFocus={() => setHover([wi, di])} onBlur={() => setHover(null)}>
                <rect className="mark-hit" x={x} y={y} width={cell} height={cell} rx={3} fill={tints[Math.min(4, v)]} stroke={hover && hover[0] === wi && hover[1] === di ? C.ink : 'none'} />
              </g>
            );
          }))}
        </svg>
      )}
      {hover && w > 0 && (
        <Tip x={labelW + hover[0] * (cell + gap) + cell / 2} y={top + hover[1] * (cell + gap)} w={w}>
          <TipRow k={fmt(dateOf(hover[0], hover[1]))} v={`${weeks[hover[0]][hover[1]]} actions`} />
        </Tip>
      )}
    </div>
  );
}

/* ---------- Line chart ---------- */
export function LineChart({ points, height = 180, yMin = 0, yMax = 100, step = 10, ariaLabel, unit = '', labelAll = false, tipExtra }: { points: { label: string; value: number }[]; height?: number; yMin?: number; yMax?: number; step?: number; ariaLabel: string; unit?: string; labelAll?: boolean; tipExtra?: (i: number) => ReactNode }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const padL = 28, padR = 18, padT = 22, padB = 24;
  const iw = Math.max(0, w - padL - padR), ih = height - padT - padB;
  const n = points.length;
  const inset = n > 1 ? 16 : 0;
  const x = (i: number) => padL + inset + (n === 1 ? iw / 2 : (i / (n - 1)) * (iw - 2 * inset));
  const y = (v: number) => padT + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const ticks: number[] = [];
  for (let t = yMin; t <= yMax; t += step) ticks.push(t);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={ariaLabel}>
          {ticks.map((t) => (
            <g key={t}><line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke={C.line} /><text x={padL - 7} y={y(t) + 3} textAnchor="end" style={axis}>{t}</text></g>
          ))}
          <path d={d} fill="none" stroke={C.ink} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => {
            const last = i === n - 1;
            return (
              <g key={i} className="chart-mark" tabIndex={0} aria-label={`${p.label}: ${p.value}${unit}`}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
                <rect className="mark-hit" x={x(i) - iw / Math.max(1, n - 1) / 2} y={padT - 8} width={iw / Math.max(1, n - 1)} height={ih + 8} fill="transparent" rx={4} />
                <circle cx={x(i)} cy={y(p.value)} r={last || hover === i ? 4 : 3} fill={last ? C.terra : 'var(--color-card)'} stroke={last ? C.terra : C.ink} strokeWidth={1.5} />
                {(labelAll || last) && <text x={x(i)} y={y(p.value) - 9} textAnchor="middle" style={{ ...axis, fill: last ? C.terra : C.muted, fontSize: last ? 11 : 10 }}>{p.value}</text>}
                <text x={x(i)} y={height - 7} textAnchor="middle" style={axis}>{p.label}</text>
              </g>
            );
          })}
        </svg>
      )}
      {hover != null && w > 0 && points[hover] && (
        <Tip x={x(hover)} y={y(points[hover].value)} w={w}>
          <TipRow k={points[hover].label} v={`${points[hover].value}${unit}`} />
          {tipExtra?.(hover)}
        </Tip>
      )}
    </div>
  );
}

/* ---------- Donut with leader-line labels ---------- */
export function Donut({ segments, size = 170, ariaLabel, center }: { segments: { label: string; value: number; color: string }[]; size?: number; ariaLabel: string; center?: ReactNode }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const wide = w >= size + 220;
  const h = size + 24;
  const cxp = wide ? w / 2 : size / 2 + 4, cyp = h / 2, R = size / 2, r = R - 22;

  // Immutably calculate arcs without reassigning acc after render
  const arcs = segments.reduce<{ a0: number; a1: number; mid: number; label: string; value: number; color: string }[]>((accArcs, s) => {
    const a0 = accArcs.length ? accArcs[accArcs.length - 1].a1 : -Math.PI / 2;
    const a1 = a0 + (s.value / total) * Math.PI * 2;
    accArcs.push({ ...s, a0, a1, mid: (a0 + a1) / 2 });
    return accArcs;
  }, []);

  const path = (a0: number, a1: number, ro: number, ri: number) => {
    const g = 0.012;
    const s0 = a0 + g, s1 = a1 - g, large = s1 - s0 > Math.PI ? 1 : 0;
    const P = (rad: number, a: number) => `${(cxp + rad * Math.cos(a)).toFixed(2)},${(cyp + rad * Math.sin(a)).toFixed(2)}`;
    return `M${P(ro, s0)} A${ro},${ro} 0 ${large} 1 ${P(ro, s1)} L${P(ri, s1)} A${ri},${ri} 0 ${large} 0 ${P(ri, s0)} Z`;
  };
  const labels = arcs.map((a, i) => ({ i, side: Math.cos(a.mid) >= 0 ? 1 : -1, y: cyp + (R + 12) * Math.sin(a.mid), ax: cxp + (R + 2) * Math.cos(a.mid), ay: cyp + (R + 2) * Math.sin(a.mid) }));
  [1, -1].forEach((side) => {
    const L = labels.filter((l) => l.side === side).sort((a, b) => a.y - b.y);
    for (let k = 1; k < L.length; k++) if (L[k].y - L[k - 1].y < 18) L[k].y = L[k - 1].y + 18;
  });
  return (
    <div ref={ref} className={cx('relative w-full', !wide && 'flex flex-wrap items-center gap-4')}>
      <div className="relative" style={{ width: wide ? '100%' : size + 8, height: h }}>
        {w > 0 && (
          <svg width={wide ? w : size + 8} height={h} role="img" aria-label={ariaLabel}>
            {arcs.map((a, i) => (
              <g key={a.label} className="chart-mark" tabIndex={0} aria-label={`${a.label}: ${a.value} (${Math.round((a.value / total) * 100)}%)`}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
                <path className="mark-hit" d={path(a.a0, a.a1, hover === i ? R + 3 : R, r)} fill={a.color} opacity={hover != null && hover !== i ? 0.45 : 1} />
              </g>
            ))}
            {wide && labels.map((l) => {
              const a = arcs[l.i];
              const ex = cxp + l.side * (R + 26);
              const tx = cxp + l.side * (R + 30);
              return (
                <g key={a.label} aria-hidden>
                  <polyline points={`${l.ax},${l.ay} ${ex},${l.y}`} fill="none" stroke={C.faint} strokeWidth={0.8} />
                  <text x={tx} y={l.y + 3.5} textAnchor={l.side > 0 ? 'start' : 'end'} style={{ ...axis, fill: hover === l.i ? C.ink : C.muted }}>
                    {a.label} <tspan style={{ fill: C.ink }}>{a.value}</tspan> · {Math.round((a.value / total) * 100)}%
                  </text>
                </g>
              );
            })}
          </svg>
        )}
        {center && <div className="pointer-events-none absolute grid place-items-center text-center" style={{ left: cxp - r, top: cyp - r, width: r * 2, height: r * 2 }}>{center}</div>}
      </div>
      {!wide && (
        <ul className="min-w-[140px] flex-1 space-y-1.5">
          {arcs.map((a) => (
            <li key={a.label} className="flex items-center gap-2 text-[12.5px]">
              <span className="size-2 rounded-full" style={{ background: a.color }} aria-hidden />
              <span className="flex-1 text-muted">{a.label}</span>
              <span className="font-mono text-[11.5px] text-ink">{a.value}</span>
              <span className="w-9 text-right font-mono text-[11px] text-faint">{Math.round((a.value / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      )}
      {hover != null && w > 0 && wide && arcs[hover] && (
        <Tip x={cxp + (R * 0.7) * Math.cos(arcs[hover].mid)} y={cyp + (R * 0.7) * Math.sin(arcs[hover].mid)} w={w}>
          <TipRow k={arcs[hover].label} v={`${arcs[hover].value} jobs`} />
        </Tip>
      )}
    </div>
  );
}

/* ---------- Stacked horizontal bars ---------- */
export function StackedBars({ rows, keys, colors, ariaLabel, textOn }: { rows: { label: string; parts: number[] }[]; keys: string[]; colors: string[]; ariaLabel: string; textOn?: string[] }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<[number, number] | null>(null);
  const labelW = 86, totalW = 34, rowH = 18, gap = 14;
  const max = Math.max(...rows.map((r) => r.parts.reduce((a, b) => a + b, 0)), 1);
  const barW = Math.max(0, w - labelW - totalW);
  const h = rows.length * (rowH + gap) - gap + 2;
  return (
    <div ref={ref} className="relative w-full" style={{ height: h }}>
      {w > 0 && (
        <svg width={w} height={h} role="img" aria-label={ariaLabel}>
          {rows.map((row, ri) => {
            const y = ri * (rowH + gap);
            let x = labelW;
            const total = row.parts.reduce((a, b) => a + b, 0);
            return (
              <g key={row.label}>
                <text x={0} y={y + rowH / 2 + 3.5} style={{ ...axis, fill: C.muted }}>{row.label}</text>
                {row.parts.map((p, k) => {
                  if (!p) return null;
                  const sw = (p / max) * barW;
                  const sx = x;
                  x += sw;
                  return (
                    <g key={k} className="chart-mark" tabIndex={0} aria-label={`${row.label}, ${keys[k]}: ${p}`}
                      onMouseEnter={() => setHover([ri, k])} onMouseLeave={() => setHover(null)} onFocus={() => setHover([ri, k])} onBlur={() => setHover(null)}>
                      <rect className="mark-hit" x={sx} y={y} width={Math.max(1, sw - 1.5)} height={rowH} rx={2} fill={colors[k]} opacity={hover && !(hover[0] === ri && hover[1] === k) ? 0.5 : 1} />
                      {sw > 18 && <text x={sx + sw / 2} y={y + rowH / 2 + 3.5} textAnchor="middle" style={{ ...axis, fill: textOn?.[k] ?? 'var(--color-card)' }}>{p}</text>}
                    </g>
                  );
                })}
                <text x={labelW + (total / max) * barW + 6} y={y + rowH / 2 + 4} style={{ fontFamily: SERIF, fontSize: 14, fill: C.ink }}>{total}</text>
              </g>
            );
          })}
        </svg>
      )}
      {hover && w > 0 && rows[hover[0]] && (
        <Tip x={labelW + barW / 2} y={hover[0] * (rowH + gap)} w={w}>
          <TipRow k={`${rows[hover[0]].label} · ${keys[hover[1]]}`} v={`${rows[hover[0]].parts[hover[1]]} jobs`} />
        </Tip>
      )}
    </div>
  );
}

/* ---------- Scatter: match score vs outcome ---------- */
export function Scatter({ points, rows, xMin = 30, xMax = 75, ariaLabel }: { points: { x: number; row: number; label: string; color: string }[]; rows: string[]; xMin?: number; xMax?: number; ariaLabel: string }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const padL = 82, padR = 14, padT = 6, padB = 26, rowH = 32;
  const h = padT + rows.length * rowH + padB;
  const iw = Math.max(0, w - padL - padR);
  const x = (v: number) => padL + ((v - xMin) / (xMax - xMin)) * iw;
  const ticks: number[] = [];
  for (let t = Math.ceil(xMin / 10) * 10; t <= xMax; t += 10) ticks.push(t);
  const yOf = (row: number, i: number) => padT + row * rowH + rowH / 2 + (((i * 7) % 5) - 2) * 2.6;
  return (
    <div ref={ref} className="relative w-full" style={{ height: h }}>
      {w > 0 && (
        <svg width={w} height={h} role="img" aria-label={ariaLabel}>
          {ticks.map((t) => (
            <g key={t}><line x1={x(t)} x2={x(t)} y1={padT} y2={h - padB} stroke={C.line} /><text x={x(t)} y={h - 8} textAnchor="middle" style={axis}>{t}</text></g>
          ))}
          {t70(xMin, xMax) && <line x1={x(70)} x2={x(70)} y1={padT} y2={h - padB} stroke={C.green} strokeDasharray="3 3" />}
          {rows.map((r, ri) => {
            const ps = points.filter((p) => p.row === ri);
            const avg = ps.length ? Math.round(ps.reduce((a, p) => a + p.x, 0) / ps.length) : null;
            return (
              <g key={r}>
                <line x1={padL} x2={w - padR} y1={padT + ri * rowH + rowH / 2} y2={padT + ri * rowH + rowH / 2} stroke={C.line} strokeDasharray="1 3" />
                <text x={0} y={padT + ri * rowH + rowH / 2 + 3.5} style={axisUp}>{r}</text>
                {avg != null && <g aria-hidden><line x1={x(avg)} x2={x(avg)} y1={padT + ri * rowH + 5} y2={padT + ri * rowH + rowH - 5} stroke={C.ink} strokeWidth={1.5} /></g>}
              </g>
            );
          })}
          {points.map((p, i) => (
            <g key={i} className="chart-mark" tabIndex={0} aria-label={`${p.label}: match ${p.x}, ${rows[p.row]}`}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
              <circle className="mark-hit" cx={x(p.x)} cy={yOf(p.row, i)} r={hover === i ? 6 : 4.5} fill={p.color} fillOpacity={0.85} stroke="var(--color-card)" strokeWidth={1} />
            </g>
          ))}
        </svg>
      )}
      {hover != null && w > 0 && points[hover] && (
        <Tip x={x(points[hover].x)} y={yOf(points[hover].row, hover)} w={w}>
          <div className="font-medium">{points[hover].label}</div>
          <TipRow k="match" v={points[hover].x} />
          <TipRow k="outcome" v={rows[points[hover].row]} />
        </Tip>
      )}
    </div>
  );
}
function t70(a: number, b: number) { return a < 70 && b > 70; }

/* ---------- Chart card + new-user placeholder ---------- */
export function ChartCard({ title, eyebrow, meta, insight, children, className }: { title: string; eyebrow?: string; meta?: ReactNode; insight?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={cx('flex min-w-0 flex-col p-5', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">{eyebrow && <Micro as="p">{eyebrow}</Micro>}<h3 className="mt-1 font-serif text-[19px] leading-snug">{title}</h3></div>
        {meta}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
      {insight && (
        <p className="mt-4 flex gap-2 border-t border-line pt-3 text-[13px] leading-snug text-muted">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-terra" aria-hidden /><span>{insight}</span>
        </p>
      )}
    </Card>
  );
}

export function ChartEmpty({ text, action, height = 170 }: { text: string; action?: ReactNode; height?: number }) {
  return (
    <div className="dashed-box flex flex-col items-center justify-center gap-3 px-6 text-center" style={{ minHeight: height }}>
      <p className="max-w-[260px] text-[13.5px] text-muted">{text}</p>
      {action}
    </div>
  );
}

