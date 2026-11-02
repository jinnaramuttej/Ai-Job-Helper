import { describe, it, expect } from 'vitest';
import { marksIfAdded } from './insights';
import {
  tierOf,
  gainOf,
  kanban,
  initialsOf,
  fmtDate,
  addDays,
  daysBetween,
  weekdayIdx,
  relDay,
  fmtPosted,
  toUIJob,
  toJobRow,
  toJobDetail,
  toUIApplication,
  toUIUser,
  type Job,
  type Application,
} from './view-models';

describe('view-models unit tests', () => {
  describe('tierOf', () => {
    it('returns Strong for >= 70', () => {
      expect(tierOf(75)).toEqual({ word: 'Strong', tone: 'green' });
      expect(tierOf(70)).toEqual({ word: 'Strong', tone: 'green' });
    });
    it('returns Good for 50-69', () => {
      expect(tierOf(69)).toEqual({ word: 'Good', tone: 'blue' });
      expect(tierOf(50)).toEqual({ word: 'Good', tone: 'blue' });
    });
    it('returns Partial for 30-49', () => {
      expect(tierOf(49)).toEqual({ word: 'Partial', tone: 'amber' });
      expect(tierOf(30)).toEqual({ word: 'Partial', tone: 'amber' });
    });
    it('returns Low for < 30', () => {
      expect(tierOf(29)).toEqual({ word: 'Low', tone: 'faint' });
      expect(tierOf(0)).toEqual({ word: 'Low', tone: 'faint' });
    });
  });

  describe('initialsOf', () => {
    it('computes initials correctly', () => {
      expect(initialsOf('Ananya Sharma')).toBe('AS');
      expect(initialsOf('Single')).toBe('S');
      expect(initialsOf('')).toBe('U');
    });
  });

  describe('gainOf', () => {
    it('finds largest missing skill gain', () => {
      const mockJob = {
        skills: [
          { name: 'React', marks: 25, have: true },
          { name: 'TypeScript', marks: 20, have: false },
          { name: 'Docker', marks: 10, have: false },
        ],
      } as unknown as Job;

      expect(gainOf(mockJob)).toEqual({ marks: 20, skill: 'TypeScript' });
    });

    it('returns 0 when all skills are present', () => {
      const mockJob = {
        skills: [{ name: 'React', marks: 25, have: true }],
      } as unknown as Job;

      expect(gainOf(mockJob)).toEqual({ marks: 0, skill: '' });
    });
  });

  describe('kanban', () => {
    it('counts applications by status', () => {
      const apps = [
        { status: 'applied' },
        { status: 'applied' },
        { status: 'review' },
        { status: 'interview' },
        { status: 'offer' },
      ] as Application[];

      const counts = kanban(apps);
      expect(counts.applied).toBe(2);
      expect(counts.review).toBe(1);
      expect(counts.interview).toBe(1);
      expect(counts.offer).toBe(1);
      expect(counts.rejected).toBe(0);
    });
  });

  describe('date helpers', () => {
    it('fmtDate formats UTC dates', () => {
      expect(fmtDate('2025-10-24')).toBe('Oct 24');
    });

    it('addDays adds days to iso string', () => {
      expect(addDays('2025-10-24', 2)).toBe('2025-10-26');
      expect(addDays('2025-10-24', -1)).toBe('2025-10-23');
    });

    it('daysBetween returns difference in days', () => {
      expect(daysBetween('2025-10-20', '2025-10-24')).toBe(4);
    });

    it('weekdayIdx returns 0 for Monday', () => {
      // 2025-10-20 is Monday
      expect(weekdayIdx('2025-10-20')).toBe(0);
      // 2025-10-24 is Friday
      expect(weekdayIdx('2025-10-24')).toBe(4);
    });

    it('relDay computes relative day without hardcoded constant', () => {
      expect(relDay('2025-10-24', '2025-10-24')).toBe('Today');
      expect(relDay('2025-10-23', '2025-10-24')).toBe('Yesterday');
      expect(relDay('2025-10-25', '2025-10-24')).toBe('Tomorrow');
    });

    it('fmtPosted formats hours into human string', () => {
      expect(fmtPosted(0)).toBe('just now');
      expect(fmtPosted(5)).toBe('5h ago');
      expect(fmtPosted(24)).toBe('1d ago');
      expect(fmtPosted(48)).toBe('2d ago');
    });
  });

  describe('adapters', () => {
    it('toUIJob maps ApiJob properly', () => {
      const apiJob = {
        id: 'job-1',
        title: 'Frontend Engineer',
        company: 'Acme Corp',
        location: 'Remote',
        role: 'Frontend Developer',
        requiredSkills: ['React', 'TypeScript'],
        minExperienceYears: 0,
        summary: 'Build UI components',
      };

      const uiJob = toUIJob(apiJob);
      expect(uiJob.id).toBe('job-1');
      expect(uiJob.title).toBe('Frontend Engineer');
      expect(uiJob.role).toBe('Frontend');
      expect(uiJob.mode).toBe('Remote');
      expect(uiJob.level).toBe('Intern');
    });

    it('toUIApplication maps ApiApplication properly', () => {
      const apiApp = {
        id: 'app-1',
        jobId: 'job-1',
        studentId: 'student-1',
        appliedAt: '2025-10-24T10:00:00Z',
      };

      const uiApp = toUIApplication(apiApp, {
        id: 'job-1',
        title: 'Developer',
        company: 'Stripe',
        location: 'Bengaluru',
        role: 'Engineering',
        requiredSkills: [],
        minExperienceYears: 0,
        summary: '',
      });

      expect(uiApp.id).toBe('app-1');
      expect(uiApp.company).toBe('Stripe');
      expect(uiApp.date).toBe('2025-10-24');
      expect(uiApp.status).toBe('applied');
    });

    it('toUIUser maps Profile and CurrentUser', () => {
      const user = toUIUser(
        {
          name: 'Jane Doe',
          email: 'jane@example.com',
          branch: 'Computer Science',
          year: '2025',
          preferredLocation: 'Pune',
          skills: ['Python', 'SQL'],
          preferredRoles: ['Data Analyst'],
        },
        null,
      );

      expect(user.name).toBe('Jane Doe');
      expect(user.first).toBe('Jane');
      expect(user.initials).toBe('JD');
      expect(user.skills).toContain('Python');
    });

    describe('toJobRow', () => {
      const job = {
        id: 'job-101',
        title: 'Frontend Engineer Intern',
        company: 'Acme Corp',
        location: 'Remote',
        role: 'Frontend Developer',
        requiredSkills: ['React', 'TypeScript', 'CSS'],
        minExperienceYears: 0,
        summary: 'Develop responsive interfaces',
      };

      const matchResult = {
        score: 75,
        skillsPoints: 47,
        rolePoints: 15,
        locationPoints: 10,
        experiencePoints: 3,
        matchedSkills: ['react', 'css'],
        missingSkills: ['typescript'],
      };

      it('maps job row correctly with score and 4 marks summing to score', () => {
        const row = toJobRow(job, matchResult);

        expect(row.id).toBe('job-101');
        expect(row.title).toBe('Frontend Engineer Intern');
        expect(row.company).toBe('Acme Corp');
        expect(row.role).toBe('Frontend');
        expect(row.mode).toBe('Remote');
        expect(row.level).toBe('Intern');
        expect(row.score).toBe(75);

        // Acceptance: the four marks sum to the ring score
        expect(row.marks.skills + row.marks.role + row.marks.location + row.marks.experience).toBe(row.score);
        expect(row.marks.skills).toBe(47);
        expect(row.marks.role).toBe(15);
        expect(row.marks.location).toBe(10);
        expect(row.marks.experience).toBe(3);

        // Matched vs missing skills
        const react = row.skills.find((s) => s.name.toLowerCase() === 'react')!;
        const ts = row.skills.find((s) => s.name.toLowerCase() === 'typescript')!;
        expect(react.have).toBe(true);
        expect(ts.have).toBe(false);
      });
    });

    describe('toJobDetail', () => {
      const job = {
        id: 'job-202',
        title: 'Full-stack Developer',
        company: 'Nova Labs',
        location: 'Bengaluru',
        role: 'Full-stack Developer',
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        minExperienceYears: 1,
        summary: 'Build web applications',
      };

      const profile = {
        name: 'Alex Rivera',
        email: 'alex@example.com',
        branch: 'CSE',
        year: '3rd year',
        preferredLocation: 'Bengaluru',
        skills: ['React', 'TypeScript'],
        preferredRoles: ['Full-stack Developer'],
      };

      it('maps job detail and missing skills have marks matching marksIfAdded', () => {
        const detail = toJobDetail(job, null, profile);

        // Acceptance: the four marks sum to the ring score
        expect(detail.marks.skills + detail.marks.role + detail.marks.location + detail.marks.experience).toBe(detail.score);

        // Matched skills have = true
        const react = detail.skills.find((s) => s.name === 'React')!;
        expect(react.have).toBe(true);

        // Missing skill has marks matching marksIfAdded
        const node = detail.skills.find((s) => s.name === 'Node.js')!;
        expect(node.have).toBe(false);
        const expectedGain = marksIfAdded(job, profile, 'Node.js');
        expect(node.marks).toBe(expectedGain);
      });
    });
  });
});
