import { SKILL_TABLE, normalize } from "../skills";

export type Confidence = "found" | "guessed" | "missing";

export type ParsedField<T> = {
  value: T;
  confidence: Confidence;
};

export type ParsedResumeData = {
  name: ParsedField<string>;
  email: ParsedField<string>;
  phone: ParsedField<string>;
  degree: ParsedField<string>;
  college: ParsedField<string>;
  year: ParsedField<string>;
  skills: ParsedField<string[]>;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWord(text: string, word: string) {
  const pattern = new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(word.toLowerCase())}([^a-z0-9+#]|$)`, "i");
  return pattern.test(text);
}

export function parseResume(text: string): ParsedResumeData {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  let nameValue = "";
  let nameConfidence: Confidence = "missing";
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /\+?\d[\d\s.-]{8,}\d/;
  const headingRegex = /^(education|skills|experience|projects|summary|profile|contact)\b/i;

  // Name: first non-empty line that is not an email or heading
  for (const line of lines) {
    if (!emailRegex.test(line) && !headingRegex.test(line)) {
      nameValue = line;
      nameConfidence = "guessed"; // Per prompt logic, simple heuristics usually yield a guess
      break;
    }
  }

  // Email
  const emailMatch = text.match(emailRegex);
  const emailValue = emailMatch ? emailMatch[0] : "";
  const emailConfidence: Confidence = emailMatch ? "found" : "missing";

  // Phone
  const phoneMatch = text.match(phoneRegex);
  const phoneValue = phoneMatch ? phoneMatch[0] : "";
  const phoneConfidence: Confidence = phoneMatch ? "found" : "missing";

  // Degree
  const degreeRegex = /(B\.Tech|B\.E|B\.Sc|MCA|M\.Tech|Bachelor|Master)[^\n]*/i;
  const degreeMatch = text.match(degreeRegex);
  const degreeValue = degreeMatch ? degreeMatch[0].trim() : "";
  const degreeConfidence: Confidence = degreeMatch ? "found" : "missing";

  // Year
  const yearRegex = /20\d{2}/g;
  const yearMatches = [...text.matchAll(yearRegex)];
  let yearValue = "";
  let yearConfidence: Confidence = "missing";
  if (yearMatches.length > 0) {
    // Pick the largest year as graduation year guess
    const years = yearMatches.map(m => parseInt(m[0], 10));
    yearValue = Math.max(...years).toString();
    yearConfidence = "guessed";
  }

  // College - simplistic heuristic: line containing 'University', 'Institute', 'College'
  const collegeRegex = /[^\n]*(University|Institute|College)[^\n]*/i;
  const collegeMatch = text.match(collegeRegex);
  const collegeValue = collegeMatch ? collegeMatch[0].trim() : "";
  const collegeConfidence: Confidence = collegeMatch ? "guessed" : "missing";

  // Skills
  const foundSkills = new Set<string>();
  for (const entry of SKILL_TABLE) {
    // Check canonical
    if (containsWord(text, entry.name)) foundSkills.add(entry.name);
    // Check aliases
    for (const alias of entry.aliases) {
      if (containsWord(text, alias)) foundSkills.add(entry.name);
    }
  }
  
  const skillsList = Array.from(foundSkills);
  const skillsConfidence: Confidence = skillsList.length > 0 ? "found" : "missing";

  return {
    name: { value: nameValue, confidence: nameConfidence },
    email: { value: emailValue, confidence: emailConfidence },
    phone: { value: phoneValue, confidence: phoneConfidence },
    degree: { value: degreeValue, confidence: degreeConfidence },
    college: { value: collegeValue, confidence: collegeConfidence },
    year: { value: yearValue, confidence: yearConfidence },
    skills: { value: skillsList, confidence: skillsConfidence },
  };
}
