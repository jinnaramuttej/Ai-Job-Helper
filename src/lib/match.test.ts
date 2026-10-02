import test from "node:test";
import assert from "node:assert/strict";
import { matchScore } from "./match";

const student = {
  skills: [] as string[],
  preferredRoles: [] as string[],
  preferredLocation: "",
  year: "3rd year",
};

const job = {
  requiredSkills: [] as string[],
  role: "Frontend developer",
  location: "Bengaluru",
  minExperienceYears: 0,
};

test("perfect match scores 100", () => {
  const result = matchScore(
    {
      ...student,
      skills: ["JavaScript", "React"],
      preferredRoles: ["Frontend developer"],
      preferredLocation: "Bengaluru",
      year: "4th year",
    },
    {
      ...job,
      requiredSkills: ["React", "JavaScript"],
      minExperienceYears: 1,
    },
  );
  assert.equal(result.score, 100);
});

test("skill overlap is proportional to the required skills", () => {
  const result = matchScore(
    {
      ...student,
      skills: ["React", "Node.js", "SQL"],
      preferredLocation: "Delhi",
    },
    {
      ...job,
      requiredSkills: ["React", "Node.js", "SQL", "Docker", "Git", "AWS"],
      role: "Backend developer",
    },
  );
  // 3/6 * 70 = 35 skills points, +5 experience (job needs none) = 40
  assert.equal(result.score, 40);
  assert.deepEqual(result.matchedSkills, ["react", "node.js", "sql"]);
  assert.deepEqual(result.missingSkills, ["docker", "git", "aws"]);
});

test("aliases count as matches on both sides", () => {
  const result = matchScore(
    { ...student, skills: "js, reactjs, NodeJS, Postgres" },
    {
      ...job,
      requiredSkills: ["JavaScript", "React", "Node.js", "PostgreSQL"],
    },
  );
  assert.equal(result.skillsPoints, 70);
  assert.deepEqual(result.missingSkills, []);
});

test("remote jobs match any student location", () => {
  const result = matchScore(
    { ...student, preferredLocation: "Madurai" },
    { ...job, location: "Remote" },
  );
  assert.equal(result.locationPoints, 10);
});

test("role points require a preferred role match, including intern variants", () => {
  const withMatch = matchScore(
    { ...student, preferredRoles: ["Frontend developer"] },
    { ...job, role: "Frontend developer intern" },
  );
  assert.equal(withMatch.rolePoints, 15);

  const withoutMatch = matchScore(
    { ...student, preferredRoles: ["Data analyst"] },
    job,
  );
  assert.equal(withoutMatch.rolePoints, 0);
});

test("a student with no skills gets the full missing list", () => {
  const result = matchScore(
    { ...student, skills: [] },
    { ...job, requiredSkills: ["Python", "Django"] },
  );
  assert.equal(result.skillsPoints, 0);
  assert.deepEqual(result.matchedSkills, []);
  assert.deepEqual(result.missingSkills, ["python", "django"]);
});

test("a job with no required skills gives full skill points", () => {
  const result = matchScore(student, job);
  assert.equal(result.skillsPoints, 70);
});

test("experience fit comes from the year of study", () => {
  const firstYear = matchScore(
    { ...student, year: "1st year" },
    { ...job, minExperienceYears: 1 },
  );
  assert.equal(firstYear.experiencePoints, 0);

  const finalYear = matchScore(
    { ...student, year: "4th year" },
    { ...job, minExperienceYears: 1 },
  );
  assert.equal(finalYear.experiencePoints, 5);

  const anyYear = matchScore(
    { ...student, year: "1st year" },
    { ...job, minExperienceYears: 0 },
  );
  assert.equal(anyYear.experiencePoints, 5);
});

test("the total score is rounded to an integer and clamped", () => {
  const result = matchScore(
    {
      ...student,
      skills: ["Python"],
      preferredRoles: ["Frontend developer"],
    },
    {
      ...job,
      requiredSkills: ["Python", "Java", "Go"],
      location: "Remote",
    },
  );
  // 1/3 * 70 = 23.33, +15 role, +10 remote, +5 experience = 53.33 -> 53
  assert.equal(result.score, 53);
  assert.ok(result.score >= 0 && result.score <= 100);
});

test("an empty location preference counts as open to anywhere", () => {
  const result = matchScore(
    { ...student, preferredLocation: "" },
    { ...job, location: "Bengaluru" },
  );
  assert.equal(result.locationPoints, 10);
});
