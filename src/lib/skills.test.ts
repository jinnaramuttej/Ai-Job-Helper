import test from "node:test";
import assert from "node:assert/strict";
import { normalize, displayName, SKILL_TABLE } from "./skills";

test("normalize maps aliases to canonical names", () => {
  assert.deepEqual(normalize("js, react.js, NodeJS, Postgres"), [
    "javascript",
    "react",
    "node.js",
    "postgresql",
  ]);
});

test("normalize handles multi-word aliases, punctuation, and dedupes", () => {
  assert.deepEqual(normalize(" Java Script ; reactjs \n React , cpp , C++"), [
    "javascript",
    "react",
    "c++",
  ]);
});

test("normalize keeps unknown skills as cleaned text", () => {
  assert.deepEqual(normalize("Rust, Crystal Lang,   GO"), [
    "rust",
    "crystal lang",
    "go",
  ]);
});

test("every alias maps to exactly one canonical skill", () => {
  const seen = new Map<string, string>();
  for (const entry of SKILL_TABLE) {
    const variants = [entry.name, ...entry.aliases].map((v) =>
      v.trim().toLowerCase().replace(/\s+/g, " "),
    );
    for (const variant of variants) {
      const previous = seen.get(variant);
      assert.ok(
        !previous || previous === entry.name,
        `"${variant}" is claimed by both "${previous}" and "${entry.name}"`,
      );
      seen.set(variant, entry.name);
    }
  }
});

test("displayName returns the display casing for canonical skills", () => {
  assert.equal(displayName("javascript"), "JavaScript");
  assert.equal(displayName("node.js"), "Node.js");
  assert.equal(displayName("unknown thing"), "unknown thing");
});
