import type { Application, AppStatus, Category, Job, Tone } from '../mock';

export const TODAY = '2025-10-24';

export const STATUS_ORDER: AppStatus[] = ['applied', 'review', 'interview', 'offer', 'rejected'];
export const STATUS_META: Record<AppStatus, { label: string; tone: Tone }> = {
  applied: { label: 'Applied', tone: 'blue' },
  review: { label: 'In review', tone: 'amber' },
  interview: { label: 'Interview', tone: 'green' },
  offer: { label: 'Offer', tone: 'violet' },
  rejected: { label: 'Rejected', tone: 'faint' },
};
export const CAT_TONE: Record<Category, Tone> = {
  MATCH: 'blue', APPLICATION: 'amber', RESUME: 'violet', INTERVIEW: 'green', DEADLINE: 'terra',
};

export type TierWord = 'Strong' | 'Good' | 'Partial' | 'Low';
export function tierOf(score: number): { word: TierWord; tone: Tone } {
  if (score >= 70) return { word: 'Strong', tone: 'green' };
  if (score >= 50) return { word: 'Good', tone: 'blue' };
  if (score >= 30) return { word: 'Partial', tone: 'amber' };
  return { word: 'Low', tone: 'faint' };
}

const d = (iso: string) => new Date(iso + 'T12:00:00Z');
export function fmtDate(iso: string, withDay = false): string {
  return d(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC', ...(withDay ? { weekday: 'short' } : {}) });
}
export function addDays(iso: string, n: number): string {
  const t = d(iso);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}
export function daysBetween(a: string, b: string): number {
  return Math.round((d(b).getTime() - d(a).getTime()) / 86400000);
}
/** Monday = 0 … Sunday = 6 */
export function weekdayIdx(iso: string): number {
  return (d(iso).getUTCDay() + 6) % 7;
}
export function relDay(iso: string): string {
  const n = daysBetween(iso, TODAY);
  if (n === 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n === -1) return 'Tomorrow';
  return fmtDate(iso, true);
}
export function fmtPosted(hours: number): string {
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? '1d ago' : `${days}d ago`;
}

export function histogram(jobs: Job[]): number[] {
  const bins = Array(10).fill(0) as number[];
  jobs.forEach((j) => { bins[Math.min(9, Math.floor(j.score / 10))]++; });
  return bins;
}
export function average(jobs: Job[]): number {
  return jobs.length ? Math.round(jobs.reduce((a, j) => a + j.score, 0) / jobs.length) : 0;
}
export function gainOf(job: Job): { marks: number; skill: string } {
  const miss = job.skills.filter((s) => !s.have).sort((a, b) => b.marks - a.marks)[0];
  return miss ? { marks: miss.marks, skill: miss.name } : { marks: 0, skill: '' };
}
export function kanban(apps: Application[]): Record<AppStatus, number> {
  const out: Record<AppStatus, number> = { applied: 0, review: 0, interview: 0, offer: 0, rejected: 0 };
  apps.forEach((a) => { out[a.status]++; });
  return out;
}
export function byLocation(jobs: Job[]): { label: string; value: number }[] {
  const m = new Map<string, number>();
  jobs.forEach((j) => m.set(j.city, (m.get(j.city) ?? 0) + 1));
  const sorted = [...m.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 5).map(([label, value]) => ({ label, value }));
  const rest = sorted.slice(5).reduce((a, [, v]) => a + v, 0);
  return rest ? [...top, { label: 'Other', value: rest }] : top;
}
export function byRoleTier(jobs: Job[]): { label: string; parts: number[] }[] {
  const roles = ['Frontend', 'Full-stack', 'Data', 'Backend', 'QA / DevOps', 'Mobile'];
  return roles.map((r) => {
    const js = jobs.filter((j) => j.role === r);
    return {
      label: r,
      parts: [js.filter((j) => j.score >= 70).length, js.filter((j) => j.score >= 50 && j.score < 70).length,
        js.filter((j) => j.score >= 30 && j.score < 50).length, js.filter((j) => j.score < 30).length],
    };
  });
}
export function responseBins(apps: Application[]): { label: string; value: number }[] {
  const edges: [string, number, number][] = [['0–2d', 0, 2], ['3–5d', 3, 5], ['6–8d', 6, 8], ['9–11d', 9, 11], ['12d+', 12, 999]];
  return edges.map(([label, lo, hi]) => ({ label, value: apps.filter((a) => a.responseDays !== null && a.responseDays >= lo && a.responseDays <= hi).length }));
}
export function byWeekday(apps: Application[]): { label: string; value: number }[] {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const c = Array(7).fill(0) as number[];
  apps.forEach((a) => { c[weekdayIdx(a.date)]++; });
  return names.map((label, i) => ({ label, value: c[i] }));
}
export function jobsTouchedBy(jobs: Job[], skills: string[]): number {
  const set = new Set(skills.map((s) => s.toLowerCase()));
  return jobs.filter((j) => j.skills.some((s) => set.has(s.name.toLowerCase()))).length;
}
export function initialsOf(name: string): string {
  const parts = name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || name.slice(0, 2).toUpperCase();
}
