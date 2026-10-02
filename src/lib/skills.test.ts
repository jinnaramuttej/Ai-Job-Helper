import { describe, it, expect } from "vitest";
import { normalize, displayName, SKILL_TABLE } from "./skills";

describe("normalize", () => {
  it("maps aliases to canonical names", () => {
    expect(normalize("js, react.js, NodeJS, Postgres")).toEqual([
      "javascript",
      "react",
      "node.js",
      "postgresql",
    ]);
  });

  it("handles multi-word aliases, punctuation, and dedupes", () => {
    expect(normalize(" Java Script ; reactjs \n React , cpp , C++")).toEqual([
      "javascript",
      "react",
      "c++",
    ]);
  });

  it("keeps unknown skills as cleaned text", () => {
    expect(normalize("Rust, Crystal Lang,   GO")).toEqual([
      "rust",
      "crystal lang",
      "go",
    ]);
  });
});

describe("SKILL_TABLE", () => {
  it("every alias maps to exactly one canonical skill", () => {
    const seen = new Map<string, string>();
    for (const entry of SKILL_TABLE) {
      const variants = [entry.name, ...entry.aliases].map((v) =>
        v.trim().toLowerCase().replace(/\s+/g, " "),
      );
      for (const variant of variants) {
        const previous = seen.get(variant);
        expect(!previous || previous === entry.name).toBe(true);
        seen.set(variant, entry.name);
      }
    }
  });
});

describe("displayName", () => {
  it("returns the display casing for canonical skills", () => {
    expect(displayName("javascript")).toBe("JavaScript");
    expect(displayName("node.js")).toBe("Node.js");
    expect(displayName("unknown thing")).toBe("unknown thing");
  });
});
