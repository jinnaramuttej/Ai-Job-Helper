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

export type Confidence = "found" | "guessed" | "missing";

export type ParsedField<T> = {
  value: T;
  confidence: Confidence;
};

export type ParsedResumeFields = {
  name: ParsedField<string>;
  email: ParsedField<string>;
  phone: ParsedField<string>;
  degree: ParsedField<string>;
  college: ParsedField<string>;
  graduationYear: ParsedField<string>;
  skills: ParsedField<string[]>;
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

export function extractSkills(text: string): string[] {
  const haystack = ` ${text.toLowerCase().replace(/\s+/g, " ")} `;
  const found: string[] = [];

  for (const entry of SKILL_TABLE) {
    const variants = [entry.name, ...entry.aliases];
    const hit = variants.some((variant) => {
      const needle = variant.toLowerCase();
      const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`(^|[^a-z0-9+#])${escaped}([^a-z0-9+#]|$)`, "i");
      return pattern.test(haystack);
    });
    if (hit) found.push(displayName(entry.name));
  }

  return found;
}

function formatName(name: string): string {
  if (name === name.toUpperCase() || name === name.toLowerCase()) {
    return name.split(/\s+/).map((word, index) => {
      const lowerWord = word.toLowerCase();
      if (index > 0 && /^(de|van|von|der|da|di|la)$/.test(lowerWord)) {
        return lowerWord;
      }
      return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    }).join(" ");
  }
  return name;
}

export function parseResumeText(text: string): ParsedResumeFields {
  const normalizedText = text.replace(/\r\n?/g, "\n");
  const lines = normalizedText.split("\n").map(cleanLine);
  
  let nameValue = "";
  let nameConfidence: Confidence = "missing";
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /\+?\d[\d\s.-]{8,}\d/;
  const headingRegex = /^(education|skills|experience|projects|summary|profile|contact)\b/i;

  for (const line of lines) {
    if (line.length > 0 && !emailRegex.test(line) && !headingRegex.test(line)) {
      // Just taking the first line for name as requested
      nameValue = formatName(line.slice(0, 50));
      nameConfidence = "guessed";
      break;
    }
  }

  const emailMatch = normalizedText.match(emailRegex);
  const emailValue = emailMatch ? emailMatch[0] : "";
  const emailConfidence: Confidence = emailMatch ? "found" : "missing";

  const phoneMatch = normalizedText.match(phoneRegex);
  const phoneValue = phoneMatch ? phoneMatch[0] : "";
  const phoneConfidence: Confidence = phoneMatch ? "found" : "missing";

  const degreeRegex = /(B\.Tech|B\.E|B\.Sc|MCA|M\.Tech|Bachelor|Master)[^\n]*/i;
  const degreeMatch = normalizedText.match(degreeRegex);
  const degreeValue = degreeMatch ? degreeMatch[0].trim() : "";
  const degreeConfidence: Confidence = degreeMatch ? "found" : "missing";

  const yearRegex = /20\d{2}/g;
  const yearMatches = [...normalizedText.matchAll(yearRegex)];
  let yearValue = "";
  let yearConfidence: Confidence = "missing";
  if (yearMatches.length > 0) {
    const years = yearMatches.map(m => parseInt(m[0], 10));
    yearValue = Math.max(...years).toString();
    yearConfidence = "guessed";
  }

  const collegeRegex = /\b(University|Institute|College)\b/i;
  const collegeLine = lines.find(line => !emailRegex.test(line) && collegeRegex.test(line));
  const collegeValue = collegeLine ? collegeLine : "";
  const collegeConfidence: Confidence = collegeLine ? "guessed" : "missing";

  const foundSkills = extractSkills(normalizedText);
  const skillsConfidence: Confidence = foundSkills.length > 0 ? "found" : "missing";

  return {
    name: { value: nameValue, confidence: nameConfidence },
    email: { value: emailValue, confidence: emailConfidence },
    phone: { value: phoneValue, confidence: phoneConfidence },
    degree: { value: degreeValue, confidence: degreeConfidence },
    college: { value: collegeValue, confidence: collegeConfidence },
    graduationYear: { value: yearValue, confidence: yearConfidence },
    skills: { value: foundSkills, confidence: skillsConfidence },
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
