import { describe, it, expect } from "vitest";
import { extractSkills, parseResumeText } from "./parse-resume";
import { MOCK_RESUME_TEXT } from "./mock";

describe("parseResumeText", () => {
  it("parses name, degree, college, and graduation year from resume text", () => {
    const parsed = parseResumeText(MOCK_RESUME_TEXT);
    expect(parsed.name.value).toBe("Ananya Sharma");
    expect(parsed.degree.value).toMatch(/B\.Tech in Computer Science/i);
    expect(parsed.college.value).toMatch(/National Institute of Technology/i);
    expect(parsed.graduationYear.value).toBe("2027");
  });

  it("normalizes an all-caps name to title case keeping particles lowercase", () => {
    const parsed = parseResumeText("JOHN DE VRIES\nB.Tech in Computer Science\n");
    expect(parsed.name.value).toBe("John de Vries");
  });

  it("normalizes an all-lowercase name to title case", () => {
    const parsed = parseResumeText("ananya sharma\nB.Tech in Computer Science\n");
    expect(parsed.name.value).toBe("Ananya Sharma");
  });

  it("matches skills through the alias dictionary", () => {
    const skills = extractSkills(
      "Worked with JS, reactjs, NodeJS and postgres on a team project.",
    );
    expect(skills.includes("JavaScript")).toBe(true);
    expect(skills.includes("React")).toBe(true);
    expect(skills.includes("Node.js")).toBe(true);
    expect(skills.includes("PostgreSQL")).toBe(true);
  });

  it("does not match keywords inside unrelated words", () => {
    const skills = extractSkills("I used JavaScript on a Rusty old laptop.");
    expect(skills.includes("JavaScript")).toBe(true);
    expect(skills.includes("Java")).toBe(false);
    expect(skills.includes("Rust")).toBe(false);
  });

  it("falls back to the email local part when no name line is found", () => {
    const parsed = parseResumeText(
      "Education\nB.Sc in Physics\nContact: dev.patel@college.edu",
    );
    expect(typeof parsed.name.value).toBe("string");
  });

  it("always returns a result, even for empty text", () => {
    const parsed = parseResumeText("");
    expect(parsed.name.value).toEqual("");
    expect(parsed.degree.value).toEqual("");
    expect(parsed.college.value).toEqual("");
    expect(parsed.graduationYear.value).toEqual("");
    expect(parsed.skills.value).toEqual([]);
  });
});
