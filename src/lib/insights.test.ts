import { describe, it, expect } from 'vitest';
import { matchScore } from './match';
import {
  histogram,
  average,
  byLocation,
  byRoleTier,
  responseBins,
  byWeekday,
  jobsTouchedBy,
  marksIfAdded,
  buildDashboard,
  buildWeeklyBuckets,
} from './insights';
import type { Job, Application } from './view-models';

describe('insights unit tests', () => {
  describe('histogram', () => {
    it('sorts job scores into 10 bins', () => {
      const jobs = [
        { score: 5 },
        { score: 15 },
        { score: 25 },
        { score: 95 },
        { score: 100 },
      ] as Job[];

      const bins = histogram(jobs);
      expect(bins).toHaveLength(10);
      expect(bins[0]).toBe(1); // 0-9
      expect(bins[1]).toBe(1); // 10-19
      expect(bins[2]).toBe(1); // 20-29
      expect(bins[9]).toBe(2); // 90-100
    });
  });

  describe('average', () => {
    it('calculates average score', () => {
      const jobs = [{ score: 60 }, { score: 80 }] as Job[];
      expect(average(jobs)).toBe(70);
    });

    it('returns 0 for empty array', () => {
      expect(average([])).toBe(0);
    });
  });

  describe('byLocation', () => {
    it('aggregates jobs by city and caps top 5 plus other', () => {
      const jobs = [
        { city: 'Bengaluru' },
        { city: 'Bengaluru' },
        { city: 'Pune' },
        { city: 'Hyderabad' },
        { city: 'Mumbai' },
        { city: 'Delhi' },
        { city: 'Chennai' },
      ] as Job[];

      const locs = byLocation(jobs);
      expect(locs[0].label).toBe('Bengaluru');
      expect(locs[0].value).toBe(2);
      expect(locs.some((l) => l.label === 'Other')).toBe(true);
    });
  });

  describe('byRoleTier', () => {
    it('buckets jobs by role and tier levels', () => {
      const jobs = [
        { role: 'Frontend', score: 85 },
        { role: 'Frontend', score: 55 },
        { role: 'Data', score: 20 },
      ] as Job[];

      const tiers = byRoleTier(jobs);
      const fe = tiers.find((t) => t.label === 'Frontend')!;
      expect(fe.parts[0]).toBe(1); // Strong >= 70
      expect(fe.parts[1]).toBe(1); // Good 50-69
      expect(fe.parts[2]).toBe(0); // Partial 30-49
      expect(fe.parts[3]).toBe(0); // Low < 30
    });
  });

  describe('responseBins', () => {
    it('counts apps by response day ranges', () => {
      const apps = [
        { responseDays: 1 },
        { responseDays: 4 },
        { responseDays: null },
      ] as Application[];

      const bins = responseBins(apps);
      expect(bins[0].label).toBe('0–2d');
      expect(bins[0].value).toBe(1);
      expect(bins[1].label).toBe('3–5d');
      expect(bins[1].value).toBe(1);
    });
  });

  describe('byWeekday', () => {
    it('counts applications by weekday', () => {
      const apps = [
        { date: '2025-10-20' }, // Monday
        { date: '2025-10-24' }, // Friday
      ] as Application[];

      const week = byWeekday(apps);
      expect(week).toHaveLength(7);
      expect(week[0].label).toBe('Mon');
      expect(week[0].value).toBe(1);
      expect(week[4].label).toBe('Fri');
      expect(week[4].value).toBe(1);
    });
  });

  describe('jobsTouchedBy', () => {
    it('counts jobs that require any of the given skills', () => {
      const jobs = [
        { skills: [{ name: 'React' }, { name: 'CSS' }] },
        { skills: [{ name: 'Python' }] },
      ] as unknown as Job[];

      expect(jobsTouchedBy(jobs, ['React'])).toBe(1);
      expect(jobsTouchedBy(jobs, ['React', 'Python'])).toBe(2);
      expect(jobsTouchedBy(jobs, ['Docker'])).toBe(0);
    });
  });

  describe('marksIfAdded', () => {
    const job = {
      requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      role: 'Full-stack developer',
      location: 'Bengaluru',
      minExperienceYears: 1,
    };

    const student = {
      skills: ['React', 'TypeScript'],
      preferredRoles: ['Full-stack developer'],
      preferredLocation: 'Bengaluru',
      year: '3rd year',
    };

    it('calculates the exact score gain when a missing skill is added', () => {
      const gain = marksIfAdded(job, student, 'Node.js');
      expect(gain).toBeGreaterThan(0);

      // Verify that gain matches a manual re-score
      const manualNewStudent = { ...student, skills: [...student.skills, 'Node.js'] };
      const base = matchScore(student, job);
      const manual = matchScore(manualNewStudent, job);
      expect(gain).toBe(manual.score - base.score);
    });

    it('returns 0 when adding a skill already present on the profile', () => {
      const gain = marksIfAdded(job, student, 'React');
      expect(gain).toBe(0);
    });

    it('returns 0 when adding a skill not required by the job', () => {
      const gain = marksIfAdded(job, student, 'Ruby on Rails');
      expect(gain).toBe(0);
    });

    it('is pure and does not mutate the student profile or job', () => {
      const initialSkills = [...student.skills];
      const initialJobSkills = [...job.requiredSkills];

      marksIfAdded(job, student, 'PostgreSQL');

      expect(student.skills).toEqual(initialSkills);
      expect(job.requiredSkills).toEqual(initialJobSkills);
    });
  });

  describe('buildWeeklyBuckets', () => {
    it('produces exactly 12 weekly buckets and sum equals applications.length', () => {
      const now = new Date('2026-10-25T12:00:00Z');
      const apps = [
        { appliedAt: '2026-06-01T00:00:00Z' }, // very old -> bucket 0
        { appliedAt: '2026-08-15T00:00:00Z' }, // middle
        { appliedAt: '2026-09-01T00:00:00Z' },
        { appliedAt: '2026-10-20T00:00:00Z' }, // current week -> bucket 11
        { appliedAt: '2026-10-25T00:00:00Z' }, // current week -> bucket 11
      ];

      const { weekly, weekLabels, applicationsByWeek } = buildWeeklyBuckets(apps, now);
      expect(weekly).toHaveLength(12);
      expect(weekLabels).toHaveLength(12);
      expect(applicationsByWeek).toHaveLength(12);

      const totalCount = weekly.reduce((a, b) => a + b, 0);
      expect(totalCount).toBe(apps.length);
      expect(applicationsByWeek.reduce((a, b) => a + b.value, 0)).toBe(apps.length);
    });
  });

  describe('buildDashboard', () => {
    const fixedNow = new Date('2026-10-25T12:00:00Z');

    const fixtureJobs = [
      {
        id: 'job-1',
        title: 'Frontend Intern',
        company: 'NovaPay',
        requiredSkills: ['React', 'TypeScript', 'CSS'],
        role: 'Frontend',
        location: 'Bengaluru',
        minExperienceYears: 0,
        closingSoon: true,
      },
      {
        id: 'job-2',
        title: 'Full-stack Intern',
        company: 'PixelWorks',
        requiredSkills: ['React', 'Node.js', 'PostgreSQL'],
        role: 'Full-stack',
        location: 'Remote',
        minExperienceYears: 1,
      },
      {
        id: 'job-3',
        title: 'Backend Intern',
        company: 'CloudSprint',
        requiredSkills: ['Node.js', 'Docker', 'AWS'],
        role: 'Backend',
        location: 'Bengaluru',
        minExperienceYears: 0,
      },
    ];

    const fixtureProfile = {
      skills: ['React', 'CSS'],
      preferredRoles: ['Frontend'],
      preferredLocation: 'Bengaluru',
      year: '3rd year',
    };

    const fixtureApps = [
      { id: 'app-1', appliedAt: '2026-10-21T10:00:00Z' },
      { id: 'app-2', appliedAt: '2026-10-14T10:00:00Z' },
      { id: 'app-3', appliedAt: '2026-09-01T10:00:00Z' },
    ];

    it('returns empty states and Next best action for a new user', () => {
      const result = buildDashboard([], [], null, fixedNow);

      expect(result.applicationsByWeek).toHaveLength(12);
      expect(result.applicationsByWeek.every((w) => w.value === 0)).toBe(true);
      expect(result.kpis.applications).toBe(0);
      expect(result.kpis.strong).toBe(0);
      expect(result.kpis.avgMatch).toBe(0);
      expect(result.kpis.jobsIndexed).toBe(0);
      expect(result.histogram).toEqual(Array(10).fill(0));
      expect(result.skillBacklog).toEqual([]);
      expect(result.skillsVsMarket).toEqual([]);
      expect(result.attention).toEqual([]);
      expect(result.nextBestAction).toEqual({
        title: 'Upload your resume',
        description: 'Upload a resume and every job gets a score you can read.',
        action: 'Upload resume',
        target: 'resume',
      });
    });

    it('computes dashboard insights where weekly bars sum to the application count', () => {
      const matches = fixtureJobs.map((j) => ({
        job: j,
        match: matchScore(fixtureProfile, j),
      }));

      const result = buildDashboard(fixtureApps, matches, fixtureProfile, fixedNow);

      // 1. Weekly bars sum to the application count
      const sumWeekly = result.applicationsByWeek.reduce((a, b) => a + b.value, 0);
      expect(sumWeekly).toBe(fixtureApps.length);
      expect(result.kpis.applications).toBe(fixtureApps.length);

      // 2. Demo KPIs equal totals from jobs
      expect(result.kpis.jobsIndexed).toBe(fixtureJobs.length);
      const expectedStrong = matches.filter((m) => m.match.score >= 70).length;
      expect(result.kpis.strong).toBe(expectedStrong);
      const expectedAvg = Math.round(matches.reduce((a, b) => a + b.match.score, 0) / matches.length);
      expect(result.kpis.avgMatch).toBe(expectedAvg);

      // 3. Histogram of match scores
      expect(result.histogram).toHaveLength(10);
      const histTotal = result.histogram.reduce((a, b) => a + b, 0);
      expect(histTotal).toBe(fixtureJobs.length);

      // 4. Skill backlog uses marksIfAdded
      expect(result.skillBacklog.length).toBeGreaterThan(0);
      result.skillBacklog.forEach((b) => {
        expect(b.marks).toBeGreaterThan(0);
        expect(b.jobs).toBeGreaterThan(0);
        // Verify calculation matches marksIfAdded
        const affectedJob = fixtureJobs.find((j) => j.requiredSkills.includes(b.skill))!;
        const gain = marksIfAdded(affectedJob, fixtureProfile, b.skill);
        expect(gain).toBeGreaterThan(0);
      });

      // 5. Skills vs market radar data
      expect(result.skillsVsMarket.length).toBeGreaterThan(0);
      const reactMarket = result.skillsVsMarket.find((s) => s.name === 'React');
      expect(reactMarket).toBeDefined();
      expect(reactMarket!.level).toBe(85); // Profile has React

      // 6. Next best action
      expect(result.nextBestAction).toBeDefined();
      expect(result.nextBestAction.action).toBeTruthy();

      // 7. Attention items derive strong matches, ATS, deadlines
      expect(result.attention.length).toBeGreaterThan(0);
      expect(result.attention.some((a) => a.category === 'MATCH' || a.category === 'RESUME' || a.category === 'DEADLINE')).toBe(true);
    });

    it('is a pure function and does not mutate fixture data', () => {
      const appsCopy = JSON.parse(JSON.stringify(fixtureApps));
      const jobsCopy = JSON.parse(JSON.stringify(fixtureJobs));
      const profileCopy = JSON.parse(JSON.stringify(fixtureProfile));

      buildDashboard(fixtureApps, fixtureJobs, fixtureProfile, fixedNow);

      expect(fixtureApps).toEqual(appsCopy);
      expect(fixtureJobs).toEqual(jobsCopy);
      expect(fixtureProfile).toEqual(profileCopy);
    });
  });
});

