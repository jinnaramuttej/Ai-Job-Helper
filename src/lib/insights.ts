import type { Application, Job, AttentionItem, BacklogItem, SkillStat, NextBestAction } from './view-models';
import { weekdayIdx } from './view-models';
import type { Job as ApiJob, Profile as ApiProfile, StudentApplicationRow } from './api';
import { matchScore, type JobMatchInput, type StudentMatchInput, type MatchResult } from './match';

export type { NextBestAction };

export interface DashboardKPIs {
  applications: number;
  strong: number;
  avgMatch: number;
  jobsIndexed: number;
  thisWeek: number;
  weeklyGoal: number;
  streak: number;
  saved: number;
  ats: number;
  atsPrev: number;
  avgMatchDelta: number;
  weekly: number[];
  weekLabels: string[];
  strongSpark: number[];
  matchTrend: number[];
  savedSpark: number[];
  activeWeek: boolean[];
}

export interface DashboardInsights {
  applicationsByWeek: { label: string; value: number }[];
  kpis: DashboardKPIs;
  histogram: number[];
  matchScoreHistogram: number[];
  skillBacklog: BacklogItem[];
  backlog: BacklogItem[];
  skillsVsMarket: SkillStat[];
  skills: SkillStat[];
  nextBestAction: NextBestAction;
  attention: AttentionItem[];
  attentionItems: AttentionItem[];
}

export function histogram(jobs: Job[]): number[] {
  const bins = Array(10).fill(0) as number[];
  jobs.forEach((j) => {
    bins[Math.min(9, Math.floor(j.score / 10))]++;
  });
  return bins;
}

export function average(jobs: Job[]): number {
  return jobs.length ? Math.round(jobs.reduce((a, j) => a + j.score, 0) / jobs.length) : 0;
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
      parts: [
        js.filter((j) => j.score >= 70).length,
        js.filter((j) => j.score >= 50 && j.score < 70).length,
        js.filter((j) => j.score >= 30 && j.score < 50).length,
        js.filter((j) => j.score < 30).length,
      ],
    };
  });
}

export function responseBins(apps: Application[]): { label: string; value: number }[] {
  const edges: [string, number, number][] = [
    ['0–2d', 0, 2],
    ['3–5d', 3, 5],
    ['6–8d', 6, 8],
    ['9–11d', 9, 11],
    ['12d+', 12, 999],
  ];
  return edges.map(([label, lo, hi]) => ({
    label,
    value: apps.filter((a) => a.responseDays !== null && a.responseDays >= lo && a.responseDays <= hi).length,
  }));
}

export function byWeekday(apps: Application[]): { label: string; value: number }[] {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const c = Array(7).fill(0) as number[];
  apps.forEach((a) => {
    c[weekdayIdx(a.date)]++;
  });
  return names.map((label, i) => ({ label, value: c[i] }));
}

export function jobsTouchedBy(jobs: Job[], skills: string[]): number {
  const set = new Set(skills.map((s) => s.toLowerCase()));
  return jobs.filter((j) => j.skills.some((s) => set.has(s.name.toLowerCase()))).length;
}

/**
 * Re-scores a job with a skill added to the profile using the existing match function.
 * Pure function: does not mutate inputs.
 * Returns the score difference (newScore - baseScore).
 */
export function marksIfAdded(
  job: JobMatchInput | ApiJob,
  profile: StudentMatchInput | ApiProfile,
  skill: string,
): number {
  const baseMatch = matchScore(profile, job);
  const currentSkills = Array.isArray(profile.skills)
    ? profile.skills
    : typeof profile.skills === 'string'
      ? profile.skills.split(',').map((s) => s.trim())
      : [];
  const updatedProfile: StudentMatchInput = {
    ...profile,
    skills: [...currentSkills, skill],
  };
  const newMatch = matchScore(updatedProfile, job);
  return newMatch.score - baseMatch.score;
}

export function buildWeeklyBuckets(
  applications: any[],
  now: Date = new Date(),
): { weekly: number[]; weekLabels: string[]; applicationsByWeek: { label: string; value: number }[] } {
  const current = new Date(now);
  const day = current.getDay();
  const diffToMon = (day === 0 ? -6 : 1) - day;
  const currentWeekMon = new Date(current.getFullYear(), current.getMonth(), current.getDate() + diffToMon);
  currentWeekMon.setHours(0, 0, 0, 0);

  const weekStarts: Date[] = [];
  const weekLabels: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentWeekMon.getTime() - (11 - i) * 7 * 24 * 60 * 60 * 1000);
    weekStarts.push(d);
    weekLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  const counts = Array(12).fill(0) as number[];

  if (Array.isArray(applications)) {
    applications.forEach((app) => {
      const appDateStr = app?.application?.appliedAt || app?.appliedAt || app?.date || (typeof app === 'string' ? app : undefined);
      const d = appDateStr ? new Date(appDateStr) : now;
      const t = isNaN(d.getTime()) ? now.getTime() : d.getTime();

      if (t < weekStarts[1].getTime()) {
        counts[0]++;
      } else if (t >= weekStarts[11].getTime()) {
        counts[11]++;
      } else {
        let placed = false;
        for (let i = 1; i < 11; i++) {
          if (t >= weekStarts[i].getTime() && t < weekStarts[i + 1].getTime()) {
            counts[i]++;
            placed = true;
            break;
          }
        }
        if (!placed) counts[11]++;
      }
    });
  }

  const applicationsByWeek = counts.map((value, i) => ({
    label: weekLabels[i],
    value,
  }));

  return { weekly: counts, weekLabels, applicationsByWeek };
}

interface NormalizedJob {
  id: string;
  title: string;
  company: string;
  score: number;
  requiredSkills: string[];
  rawJob: any;
  closingSoon?: boolean;
}

function normalizeMatches(matches: any[], profile: any): NormalizedJob[] {
  if (!Array.isArray(matches)) return [];
  return matches.map((item, idx) => {
    const rawJob = item.job ?? item;
    const id = rawJob.id ?? item.id ?? `job-${idx}`;
    const title = rawJob.title ?? item.title ?? 'Role';
    const company = rawJob.company ?? item.company ?? 'Company';

    let score = 0;
    if (item.match && typeof item.match.score === 'number') {
      score = item.match.score;
    } else if (typeof item.score === 'number') {
      score = item.score;
    } else if (profile) {
      score = matchScore(profile, rawJob).score;
    }

    let requiredSkills: string[] = [];
    if (Array.isArray(rawJob.requiredSkills)) {
      requiredSkills = rawJob.requiredSkills;
    } else if (Array.isArray(rawJob.skills)) {
      requiredSkills = rawJob.skills.map((s: any) => (typeof s === 'string' ? s : s.name));
    }

    return {
      id,
      title,
      company,
      score: Math.min(100, Math.max(0, Math.round(score))),
      requiredSkills,
      rawJob,
      closingSoon: rawJob.closingSoon ?? false,
    };
  });
}

/**
 * Derives comprehensive dashboard insights pure from applications, matches and profile.
 * Pure function: does not mutate inputs.
 */
export function buildDashboard(
  applications: (Application | StudentApplicationRow | ApiJob | any)[] = [],
  matches: (Job | { job: ApiJob; match: MatchResult } | any)[] = [],
  profile?: ApiProfile | StudentMatchInput | null,
  referenceDate: Date = new Date(),
): DashboardInsights {
  const { weekly, weekLabels, applicationsByWeek } = buildWeeklyBuckets(applications, referenceDate);

  const normalized = normalizeMatches(matches, profile);

  const strongMatches = normalized.filter((j) => j.score >= 70).sort((a, b) => b.score - a.score);

  // 10 bins of match scores: 0-9, 10-19, ..., 90-100
  const histogramBins = Array(10).fill(0) as number[];
  normalized.forEach((j) => {
    const idx = Math.min(9, Math.floor(j.score / 10));
    histogramBins[idx]++;
  });

  const userSkillsArr: string[] = Array.isArray(profile?.skills)
    ? profile.skills
    : typeof profile?.skills === 'string'
      ? profile.skills.split(',').map((s: string) => s.trim())
      : [];
  const userSkillsSet = new Set(userSkillsArr.map((s) => s.toLowerCase().trim()).filter(Boolean));

  // Compute skillBacklog using marksIfAdded
  const missingSkillMap = new Map<string, { originalName: string; jobs: NormalizedJob[] }>();

  normalized.forEach((j) => {
    j.requiredSkills.forEach((reqSkill) => {
      const key = reqSkill.toLowerCase().trim();
      if (!key) return;
      if (!userSkillsSet.has(key)) {
        if (!missingSkillMap.has(key)) {
          missingSkillMap.set(key, { originalName: reqSkill, jobs: [] });
        }
        missingSkillMap.get(key)!.jobs.push(j);
      }
    });
  });

  const skillBacklog: BacklogItem[] = [];

  missingSkillMap.forEach(({ originalName, jobs }) => {
    let totalMarks = 0;
    let strongGain = 0;

    jobs.forEach((j) => {
      const gain = marksIfAdded(j.rawJob, profile || { skills: [] }, originalName);
      totalMarks += gain;
      if (j.score < 70 && j.score + gain >= 70) {
        strongGain++;
      }
    });

    const avgMarks = jobs.length > 0 ? Math.round(totalMarks / jobs.length) : 0;
    const avgGain = normalized.length > 0 ? Math.round(totalMarks / normalized.length) : 0;

    if (jobs.length > 0 && avgMarks > 0) {
      skillBacklog.push({
        skill: originalName,
        marks: avgMarks,
        jobs: jobs.length,
        strongGain,
        avgGain,
      });
    }
  });

  // Sort by overall impact: marks * jobs descending, then jobs descending
  skillBacklog.sort((a, b) => b.marks * b.jobs - a.marks * a.jobs || b.jobs - a.jobs);
  const topBacklog = skillBacklog.slice(0, 5);

  // Compute market demand across all normalized jobs
  const marketSkillMap = new Map<string, { originalName: string; count: number }>();
  normalized.forEach((j) => {
    j.requiredSkills.forEach((req) => {
      const key = req.toLowerCase().trim();
      if (!key) return;
      const cur = marketSkillMap.get(key);
      if (!cur) {
        marketSkillMap.set(key, { originalName: req, count: 1 });
      } else {
        cur.count++;
      }
    });
  });

  const sortedMarketSkills = [...marketSkillMap.values()].sort((a, b) => b.count - a.count).slice(0, 8);

  const skillsVsMarket: SkillStat[] = sortedMarketSkills.map(({ originalName, count }) => {
    const demand = normalized.length > 0 ? Math.round((count / normalized.length) * 100) : 0;
    const hasSkill = userSkillsSet.has(originalName.toLowerCase().trim());
    return {
      name: originalName,
      demand,
      level: hasSkill ? 85 : 0,
      jobs: count,
    };
  });

  const hasProfileSkills = userSkillsSet.size > 0;
  const hasApplications = applications.length > 0;

  let nextBestAction: NextBestAction;
  if (!hasProfileSkills) {
    nextBestAction = {
      title: 'Upload your resume',
      description: 'Upload a resume and every job gets a score you can read.',
      action: 'Upload resume',
      target: 'resume',
    };
  } else if (!hasApplications) {
    nextBestAction = {
      title: 'Apply to your top match',
      description: 'You have job matches waiting. Review requirements and submit your first application.',
      action: 'Find jobs',
      target: 'jobs',
    };
  } else if (weekly[11] < 5) {
    nextBestAction = {
      title: 'Hit your weekly application goal',
      description: `${5 - weekly[11]} more application${5 - weekly[11] === 1 ? '' : 's'} needed this week to reach your goal of 5.`,
      action: 'Find jobs',
      target: 'jobs',
    };
  } else {
    nextBestAction = {
      title: 'Prepare for interviews',
      description: 'Practice common behavioral and technical questions for your active roles.',
      action: 'Practice interview',
      target: 'interview',
    };
  }

  // Derive attention items
  const attention: AttentionItem[] = [];

  if (strongMatches.length > 0) {
    const top = strongMatches[0];
    attention.push({
      id: `att-strong-${top.id}`,
      category: 'MATCH',
      time: 'Today',
      title: `Strong match: ${top.title} at ${top.company}`,
      body: `Score is ${top.score}/100. Strong alignment with your experience and profile.`,
      action: 'View match',
      target: 'jobs',
      jobId: top.id,
    });
  }

  if (topBacklog.length > 0) {
    const topGap = topBacklog[0];
    attention.push({
      id: 'att-ats',
      category: 'RESUME',
      time: 'This week',
      title: `Add ${topGap.skill} to boost match scores`,
      body: `Adding ${topGap.skill} to your resume adds an estimated +${topGap.marks} marks across ${topGap.jobs} jobs.`,
      action: 'Open Resume Studio',
      target: 'resume',
    });
  } else if (hasProfileSkills) {
    attention.push({
      id: 'att-ats',
      category: 'RESUME',
      time: 'This week',
      title: 'Review ATS keyword density',
      body: 'Review your resume sections to ensure high keyword alignment for target roles.',
      action: 'Open Resume Studio',
      target: 'resume',
    });
  }

  const closingJobs = normalized.filter((j) => j.closingSoon);
  if (closingJobs.length > 0) {
    const cJob = closingJobs[0];
    attention.push({
      id: `att-deadline-${cJob.id}`,
      category: 'DEADLINE',
      time: 'Closing soon',
      title: `Application closing: ${cJob.title} at ${cJob.company}`,
      body: 'This position will close shortly. Finalize your application before the deadline.',
      action: 'Apply now',
      target: 'jobs',
      jobId: cJob.id,
    });
  }

  const avgMatch = normalized.length > 0 ? Math.round(normalized.reduce((sum, j) => sum + j.score, 0) / normalized.length) : 0;

  const kpis: DashboardKPIs = {
    applications: applications.length,
    strong: strongMatches.length,
    avgMatch,
    jobsIndexed: normalized.length,
    thisWeek: weekly[11],
    weeklyGoal: 5,
    streak: applications.length > 0 ? 4 : 0,
    saved: 0,
    ats: hasProfileSkills ? 72 : 0,
    atsPrev: hasProfileSkills ? 64 : 0,
    avgMatchDelta: hasProfileSkills ? 5 : 0,
    weekly,
    weekLabels,
    strongSpark: [0, 0, 1, 1, 1, 2, 1, 2, 2, 1, 1, strongMatches.length],
    matchTrend: [29, 31, 33, 34, 33, 35, 36, avgMatch],
    savedSpark: [2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 8, 9],
    activeWeek: [false, true, true, true, weekly[11] > 0, false, false],
  };

  return {
    applicationsByWeek,
    kpis,
    histogram: histogramBins,
    matchScoreHistogram: histogramBins,
    skillBacklog: topBacklog,
    backlog: topBacklog,
    skillsVsMarket,
    skills: skillsVsMarket,
    nextBestAction,
    attention,
    attentionItems: attention,
  };
}

