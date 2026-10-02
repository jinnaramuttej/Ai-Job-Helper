import { describe, it, expect } from "vitest";
import { searchJobs } from "./search";
import type { Job, Profile } from "./mock";

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "Apple",
    location: "Remote",
    role: "Frontend developer",
    requiredSkills: ["JavaScript", "React"],
    minExperienceYears: 1,
    summary: "...",
  },
  {
    id: "2",
    title: "Backend Developer",
    company: "Zebra",
    location: "Remote",
    role: "Backend developer",
    requiredSkills: ["Node.js", "SQL"],
    minExperienceYears: 2,
    summary: "...",
  },
];

const mockProfile: Profile = {
  name: "Test",
  email: "test@test.com",
  branch: "CS",
  year: "3rd year",
  preferredLocation: "Remote",
  skills: ["JavaScript"],
  preferredRoles: ["Frontend developer"],
};

describe("searchJobs", () => {
  it("sorts by company_az", () => {
    const result = searchJobs(mockJobs, null, "", "company_az", 1, 10);
    expect(result.items[0].company).toBe("Apple");
    expect(result.items[1].company).toBe("Zebra");
  });

  it("matches alias skills", () => {
    // searching "js" should match "JavaScript" in job 1
    const result = searchJobs(mockJobs, null, "js", "newest", 1, 10);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("1");
  });

  it("paginates correctly", () => {
    const result = searchJobs(mockJobs, null, "", "newest", 1, 1);
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(2);
  });
});
