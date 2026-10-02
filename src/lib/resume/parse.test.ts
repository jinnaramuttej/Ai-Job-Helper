import { describe, it, expect } from "vitest";
import { parseResume } from "./parse";

const fixture1 = `
John Doe
john.doe@example.com | +1 555-123-4567

Education
B.Tech in Computer Science, State University, 2025

Skills
JavaScript, TypeScript, React, Node.js, HTML, CSS
`;

const fixture2 = `
JANE SMITH
Data Scientist
jane.smith@email.com
+44 7700 900077

Experience
Data Analyst at Corp
2023 - 2024
Used Python, pandas, and SQL.

Education
M.Tech in Data Science
National Institute of Technology
Expected 2026
`;

const fixture3_messy = `
contact: messy.dev@mess.org 
phone: 9876543210
SKILLS: r, go, c++, machine learning.
I have a B.Sc in Physics from some random college.
I graduate in 2024.
Some weird text.
`;

describe("parseResume", () => {
  it("parses standard resume perfectly", () => {
    const result = parseResume(fixture1);
    expect(result.name.value).toBe("John Doe");
    expect(result.email.value).toBe("john.doe@example.com");
    expect(result.phone.value).toBe("+1 555-123-4567");
    expect(result.degree.value).toContain("B.Tech in Computer Science");
    expect(result.college.value).toContain("State University");
    expect(result.year.value).toBe("2025");
    expect(result.skills.value).toEqual(expect.arrayContaining(["javascript", "typescript", "react", "node.js", "html", "css"]));
  });

  it("parses multi-line education and missing skills", () => {
    const result = parseResume(fixture2);
    expect(result.name.value).toBe("JANE SMITH");
    expect(result.email.value).toBe("jane.smith@email.com");
    expect(result.phone.value).toBe("+44 7700 900077");
    expect(result.degree.value).toContain("M.Tech in Data Science");
    expect(result.college.value).toContain("National Institute of Technology");
    expect(result.year.value).toBe("2026");
    expect(result.skills.value).toEqual(expect.arrayContaining(["python", "pandas", "sql"]));
  });

  it("parses messy resume, extracting short alias skills accurately", () => {
    const result = parseResume(fixture3_messy);
    expect(result.email.value).toBe("messy.dev@mess.org");
    expect(result.phone.value).toBe("9876543210");
    expect(result.degree.value).toContain("B.Sc in Physics");
    expect(result.college.value).toContain("some random college");
    expect(result.year.value).toBe("2024");
    expect(result.skills.value).toEqual(expect.arrayContaining(["r", "go", "c++", "machine learning"]));
  });
});
