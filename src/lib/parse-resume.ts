/**
 * Server-side resume parsing.
 *
 * Text extraction uses pdf-parse for PDFs and mammoth for DOCX. Skills are
 * matched against the shared alias dictionary; name, degree, college, and
 * graduation year come from simple, forgiving patterns. The result is
 * always returned (with blanks where nothing matched) so the student can
 * correct it in the editable form.
 */

import { SKILL_TABLE, displayName } from "./skills";

export type ParsedResumeFields = {
  name: string;
  degree: string;
  college: string;
  graduationYear: string;
  skills: string[];
};

export type ResumeParseOutcome = ParsedResumeFields & {
  text: string;
};

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const isPdf = mimeType === PDF_MIME || /\.pdf$/i.test(fileName);
  const isDocx = mimeType === DOCX_MIME || /\.docx$/i.test(fileName);

  try {
    if (isPdf) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const result = await parser.getText();
        return result.text ?? "";
      } finally {
        await parser.destroy();
      }
    }

    if (isDocx) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value ?? "";
    }

    // Legacy .doc has no reliable pure-JS extractor; fall back to a
    // best-effort strip of readable ASCII runs.
    return buffer
      .toString("latin1")
      .replace(/[^\x20-\x7E\n]+/g, " ")
      .replace(/\s{3,}/g, "\n");
  } catch {
    return "";
  }
}

/* Field patterns ---------------------------------------------------------- */

// The subject runs until a separator (dash, comma, pipe) so the college
// name on the same line is not swallowed into the degree.
const DEGREE_PATTERN =
  /\b((?:b\.?\s?tech|m\.?\s?tech|b\.?\s?e\b|m\.?\s?e\b|b\.?\s?sc|m\.?\s?sc|b\.?\s?c\.?a|m\.?\s?c\.?a|b\.?\s?com|bachelor(?:'s)?|master(?:'s)?|ph\.?\s?d)(?:\s+(?:of|in)\s+[A-Za-z& ]{3,60})?)/i;

const COLLEGE_WORDS =
  /\b(institute of technology|university|college|institute|school of [a-z ]+)\b/i;

const GRADUATION_PATTERN =
  /(?:graduat\w*|expected|class of|passing(?:\s+out)?|batch)\D{0,20}(19|20)\d{2}/i;

const YEAR_PATTERN = /\b(19|20)\d{2}\b/g;

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/;

const SECTION_WORDS =
  /^(education|skills|projects|experience|work experience|summary|objective|profile|contact|achievements|certifications|coursework|activities|interests|languages)\b/i;

function cleanLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

/** Picks a likely full name from the first few lines. */
function extractName(lines: string[], email: string): string {
  for (const line of lines.slice(0, 6)) {
    if (!line || SECTION_WORDS.test(line)) continue;
    if (EMAIL_PATTERN.test(line) || /\d/.test(line)) continue;
    if (line.includes("@") || line.includes("http")) continue;
    // Degrees and institutions are not names.
    if (DEGREE_PATTERN.test(line) || COLLEGE_WORDS.test(line)) continue;

    const words = line.split(" ").filter(Boolean);
    if (words.length < 2 || words.length > 5) continue;
    if (line.length > 60) continue;

    const looksLikeName = words.every((word) =>
      /^[A-Za-z][A-Za-z'.-]*$/.test(word),
    );
    if (!looksLikeName) continue;

    // Title-case an all-caps header like "ANANYA SHARMA".
    return words
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join(" ");
  }

  // Fall back to the local part of the email address.
  const local = email.split("@")[0] ?? "";
  if (!local) return "";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function extractDegree(text: string): string {
  const match = text.match(DEGREE_PATTERN);
  if (!match) return "";
  return cleanLine(match[1]).replace(/[,.;]+$/, "");
}

function extractCollege(lines: string[]): string {
  const candidate = lines.find(
    (line) =>
      COLLEGE_WORDS.test(line) &&
      // Skip contact lines: "name@college.edu" is not an institution.
      !EMAIL_PATTERN.test(line) &&
      !line.includes("@") &&
      !line.includes("http"),
  );
  if (!candidate) return "";

  // Keep the segment that actually names the institution.
  const segment =
    candidate
      .split(/\s[—–-]\s|,(?=\s*[A-Z])/)
      .find((part) => COLLEGE_WORDS.test(part)) ?? candidate;
  return cleanLine(segment).replace(/[,.;]+$/, "").slice(0, 120);
}

function extractGraduationYear(text: string): string {
  const explicit = text.match(GRADUATION_PATTERN);
  if (explicit) {
    const year = explicit[0].match(/(19|20)\d{2}/);
    if (year) return year[0];
  }
  // Otherwise take the latest plausible year mentioned.
  const years = Array.from(text.matchAll(YEAR_PATTERN))
    .map((match) => Number.parseInt(match[0], 10))
    .filter((year) => year >= 1990 && year <= new Date().getFullYear() + 8);
  if (years.length === 0) return "";
  return String(Math.max(...years));
}

/**
 * Matches resume text against the skills alias dictionary and returns
 * display names of the distinct skills found.
 */
export function extractSkills(text: string): string[] {
  const haystack = ` ${text.toLowerCase().replace(/\s+/g, " ")} `;
  const found: string[] = [];

  for (const entry of SKILL_TABLE) {
    const variants = [entry.name, ...entry.aliases];
    const hit = variants.some((variant) => {
      const needle = variant.toLowerCase();
      const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(
        `(^|[^a-z0-9+#])${escaped}([^a-z0-9+#]|$)`,
        "i",
      );
      return pattern.test(haystack);
    });
    if (hit) found.push(displayName(entry.name));
  }

  return found;
}

export function parseResumeText(text: string): ParsedResumeFields {
  const normalizedText = text.replace(/\r\n?/g, "\n");
  const lines = normalizedText.split("\n").map(cleanLine);
  const email = normalizedText.match(EMAIL_PATTERN)?.[0] ?? "";

  return {
    name: extractName(lines, email),
    degree: extractDegree(normalizedText),
    college: extractCollege(lines),
    graduationYear: extractGraduationYear(normalizedText),
    skills: extractSkills(normalizedText),
  };
}

export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<ResumeParseOutcome> {
  const text = await extractText(buffer, mimeType, fileName);
  return { ...parseResumeText(text), text };
}
