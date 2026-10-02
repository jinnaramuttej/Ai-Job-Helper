import test from "node:test";
import assert from "node:assert/strict";
import { extractSkills, parseResumeText } from "./parse-resume";
import { MOCK_RESUME_TEXT } from "./mock";

test("parses name, degree, college, and graduation year from resume text", () => {
  const parsed = parseResumeText(MOCK_RESUME_TEXT);
  assert.equal(parsed.name, "Ananya Sharma");
  assert.match(parsed.degree, /B\.Tech in Computer Science/i);
  assert.match(parsed.college, /National Institute of Technology/i);
  assert.equal(parsed.graduationYear, "2027");
});

test("matches skills through the alias dictionary", () => {
  const skills = extractSkills(
    "Worked with JS, reactjs, NodeJS and postgres on a team project.",
  );
  assert.ok(skills.includes("JavaScript"));
  assert.ok(skills.includes("React"));
  assert.ok(skills.includes("Node.js"));
  assert.ok(skills.includes("PostgreSQL"));
});

test("does not match keywords inside unrelated words", () => {
  const skills = extractSkills("I used JavaScript on a Rusty old laptop.");
  assert.ok(skills.includes("JavaScript"));
  assert.ok(!skills.includes("Java"));
  assert.ok(!skills.includes("Rust"));
});

test("falls back to the email local part when no name line is found", () => {
  const parsed = parseResumeText(
    "Education\nB.Sc in Physics\nContact: dev.patel@college.edu",
  );
  assert.equal(parsed.name, "Dev Patel");
});

test("always returns a result, even for empty text", () => {
  const parsed = parseResumeText("");
  assert.deepEqual(parsed, {
    name: "",
    degree: "",
    college: "",
    graduationYear: "",
    skills: [],
  });
});
