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
  score: number;
  keywordScore: number;
  sectionScore: number;
  contactScore: number;
  lengthScore: number;
  actionScore: number;
  keywordsFound: string[];
  sectionsFound: string[];
  tips: string[];
};

export const ATS_SECTIONS = ["Education", "Skills", "Projects", "Experience", "Summary"];

export const ATS_KEYWORDS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "HTML", "CSS",
  "React", "Angular", "Vue", "Next.js", "Redux", "Tailwind", "Bootstrap",
  "Node.js", "Express", "Django", "Flask", "Spring", "Rails", "Laravel", "GraphQL", "REST", "API",
  "machine learning", "data analysis", "data structures", "algorithms", "TensorFlow", "PyTorch", "pandas", "Excel",
  "MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase",
  "AWS", "Azure", "Docker", "Kubernetes", "CI/CD", "Linux", "Git", "GitHub"
];

const ACTION_VERBS = ["built", "developed", "led", "created", "designed", "implemented", "managed", "optimized", "improved"];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWord(text: string, word: string) {
  const pattern = new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(word.toLowerCase())}([^a-z0-9+#]|$)`, "i");
  return pattern.test(text);
}

export function scoreResume(text: string): AtsResult {
  // 1. Keyword coverage (40 pts)
  const keywordsFound = ATS_KEYWORDS.filter(k => containsWord(text, k));
  const keywordScore = Math.min(40, Math.round((keywordsFound.length / 15) * 40));
  const keywordLost = 40 - keywordScore;

  // 2. Sections found (25 pts)
  const sectionsFound = ATS_SECTIONS.filter(s => containsWord(text, s));
  const sectionScore = sectionsFound.length * 5;
  const sectionLost = 25 - sectionScore;

  // 3. Contact info (15 pts)
  let contactScore = 0;
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /\+?\d[\d\s.-]{8,}\d/.test(text);
  const hasLink = /linkedin\.com|github\.com/i.test(text);
  if (hasEmail) contactScore += 5;
  if (hasPhone) contactScore += 5;
  if (hasLink) contactScore += 5;
  const contactLost = 15 - contactScore;

  // 4. Length sanity (10 pts)
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  let lengthScore = 0;
  if (words >= 300 && words <= 900) {
    lengthScore = 10;
  } else if (words > 150 && words < 1200) {
    lengthScore = 5;
  }
  const lengthLost = 10 - lengthScore;

  // 5. Action verbs & quantified results (10 pts)
  const hasAction = ACTION_VERBS.some(v => containsWord(text, v));
  const hasNumbers = /\d+%|\b\d+\b/.test(text) && !/20\d\d/.test(text); // Basic check for numbers that aren't years
  // Let's just do a simpler number check
  const hasQuantified = /\d{1,3}(?:,\d{3})*(?:\.\d+)?%?/.test(text);
  
  let actionScore = 0;
  if (hasAction) actionScore += 5;
  if (hasNumbers || hasQuantified) actionScore += 5;
  const actionLost = 10 - actionScore;

  // Total
  const score = keywordScore + sectionScore + contactScore + lengthScore + actionScore;

  // Build tips ordered by points lost
  const potentialTips = [
    { lost: keywordLost, tip: "Include more relevant industry keywords to match ATS systems." },
    { lost: sectionLost, tip: "Make sure you have clear sections like Education, Skills, Projects, and Experience." },
    { lost: contactLost, tip: "Include your email, phone number, and a link to LinkedIn or GitHub." },
    { lost: lengthLost, tip: words < 300 ? "Your resume is too short. Aim for 300-900 words." : "Your resume is too long. Keep it concise (under 900 words)." },
    { lost: actionLost, tip: "Start bullet points with action verbs and include quantified results (numbers/percentages)." },
  ];

  const tips = potentialTips
    .filter(t => t.lost > 0)
    .sort((a, b) => b.lost - a.lost)
    .map(t => t.tip);

  return {
    score,
    keywordScore,
    sectionScore,
    contactScore,
    lengthScore,
    actionScore,
    keywordsFound,
    sectionsFound,
    tips: tips.length > 0 ? tips : ["Great job! Your resume hits all the ATS benchmarks."],
  };
}

export function checkJobMatch(resumeText: string, jobRequiredSkills: string[]): { missingSkills: string[], keywordCoveragePercent: number } {
  const resumeLower = resumeText.toLowerCase();
  const matched = jobRequiredSkills.filter(s => containsWord(resumeText, s));
  const missingSkills = jobRequiredSkills.filter(s => !matched.includes(s));
  const keywordCoveragePercent = jobRequiredSkills.length === 0 ? 100 : Math.round((matched.length / jobRequiredSkills.length) * 100);
  
  return { missingSkills, keywordCoveragePercent };
}

