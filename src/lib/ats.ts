/**
 * Rule-based ATS scoring. Pure function, no backend needed.
 *
 * Scoring (out of 100):
 *  - 60 points: keyword coverage. Distinct keywords from ATS_KEYWORDS
 *    found in the text, one point per keyword relative to a target of
 *    15 (so 4 points each), capped at 60.
 *  - 40 points: standard sections present — Education, Skills,
 *    Projects, Experience — 10 points each.
 *
 * Also returns what was found and 2–3 actionable tips derived from what
 * is missing.
 */

export type AtsSection = "Education" | "Skills" | "Projects" | "Experience";

export type AtsResult = {
  /** Total score, 0–100. */
  score: number;
  /** Keyword coverage, 0–60. */
  keywordScore: number;
  /** Section coverage, 0–40. */
  sectionScore: number;
  /** Distinct keywords found, in canonical casing. */
  keywordsFound: string[];
  sectionsFound: AtsSection[];
  sectionsMissing: AtsSection[];
  /** 2–3 tips generated from what is missing. */
  tips: string[];
};

export const ATS_SECTIONS: AtsSection[] = [
  "Education",
  "Skills",
  "Projects",
  "Experience",
];

/** Roughly 80 common tech keywords recruiters and ATS tools scan for. */
export const ATS_KEYWORDS: string[] = [
  // Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "R",
  "MATLAB",
  "SQL",
  "HTML",
  "CSS",
  // Frontend
  "React",
  "Angular",
  "Vue",
  "Next.js",
  "Redux",
  "Tailwind",
  "Sass",
  "Bootstrap",
  "jQuery",
  // Backend and APIs
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "Spring",
  "Rails",
  "Laravel",
  "FastAPI",
  "GraphQL",
  "REST",
  "API",
  "microservices",
  // Data and ML
  "machine learning",
  "deep learning",
  "data analysis",
  "data structures",
  "algorithms",
  "NLP",
  "computer vision",
  "TensorFlow",
  "PyTorch",
  "scikit-learn",
  "pandas",
  "NumPy",
  "Excel",
  "Tableau",
  "Power BI",
  // Databases
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "Firebase",
  // Cloud and DevOps
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Jenkins",
  "CI/CD",
  "Linux",
  "Bash",
  "Git",
  "GitHub",
  "GitLab",
  // Practices and tools
  "Agile",
  "Scrum",
  "testing",
  "Jest",
  "Selenium",
  "Pytest",
  "Figma",
  "networking",
  "OOP",
  "Webpack",
  "Vite",
  "Kafka",
];

const KEYWORD_TARGET = 15;
const KEYWORD_POINTS = 60 / KEYWORD_TARGET; // 4 points per distinct keyword
const SECTION_POINTS = 10;

/** High-value keywords we suggest when coverage is low. */
const SUGGESTED_KEYWORDS = [
  "Git",
  "Docker",
  "AWS",
  "SQL",
  "Linux",
  "Excel",
  "REST",
  "Agile",
];

const SECTION_TIPS: Record<AtsSection, string> = {
  Education:
    "Add an Education section with your degree, college, and graduation year.",
  Skills:
    "Add a Skills section listing the tools and technologies you know.",
  Projects:
    "Add a Projects section that links to 1 or 2 things you have built.",
  Experience:
    "Add an Experience section — internships, part-time work, and volunteering all count.",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Matches a keyword as a whole token, case-insensitively. "+", "#" and
 * alphanumerics count as word characters so "C" does not match inside
 * "C++" or "C#", and "Java" does not match inside "JavaScript".
 */
function containsKeyword(text: string, keyword: string): boolean {
  const pattern = new RegExp(
    `(^|[^a-z0-9+#])${escapeRegExp(keyword.toLowerCase())}([^a-z0-9+#]|$)`,
    "i",
  );
  return pattern.test(text);
}

function formatSuggestionList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
}

function buildTips(
  sectionsMissing: AtsSection[],
  keywordsFound: string[],
): string[] {
  const tips: string[] = sectionsMissing.map((section) => SECTION_TIPS[section]);

  if (keywordsFound.length < KEYWORD_TARGET) {
    const foundSet = new Set(keywordsFound.map((k) => k.toLowerCase()));
    const suggestions = SUGGESTED_KEYWORDS.filter(
      (k) => !foundSet.has(k.toLowerCase()),
    ).slice(0, 3);
    if (suggestions.length > 0) {
      tips.push(
        `Mention tools like ${formatSuggestionList(suggestions)} if you have used them.`,
      );
    }
  }

  if (tips.length === 0) {
    tips.push(
      "Strong coverage — mirror the wording of each job description you apply to.",
    );
  }

  return tips.slice(0, 3);
}

export function scoreResume(text: string): AtsResult {
  const keywordsFound = ATS_KEYWORDS.filter((keyword) =>
    containsKeyword(text, keyword),
  );
  const keywordScore = Math.min(
    60,
    Math.round(keywordsFound.length * KEYWORD_POINTS),
  );

  const sectionsFound = ATS_SECTIONS.filter((section) =>
    containsKeyword(text, section),
  );
  const sectionsMissing = ATS_SECTIONS.filter(
    (section) => !sectionsFound.includes(section),
  );
  const sectionScore = sectionsFound.length * SECTION_POINTS;

  return {
    score: keywordScore + sectionScore,
    keywordScore,
    sectionScore,
    keywordsFound,
    sectionsFound,
    sectionsMissing,
    tips: buildTips(sectionsMissing, keywordsFound),
  };
}
