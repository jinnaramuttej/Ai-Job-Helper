"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  getResume,
  parseResume,
  removeResume,
  saveParsedResume,
  type Resume,
} from "@/lib/api";
import { scoreResume } from "@/lib/ats";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/button";
import { TextField } from "@/components/form";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_EXTENSIONS = /\.(pdf|doc|docx)$/i;
const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const FILE_INPUT_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type ParsedFormState = {
  name: string;
  degree: string;
  college: string;
  graduationYear: string;
  skillsText: string;
};

const EMPTY_PARSED_FORM: ParsedFormState = {
  name: "",
  degree: "",
  college: "",
  graduationYear: "",
  skillsText: "",
};

function validateFile(file: File): string | null {
  const typeOk =
    ACCEPTED_EXTENSIONS.test(file.name) || ACCEPTED_MIME_TYPES.has(file.type);
  if (!typeOk) return "Only PDF or DOC files are allowed.";
  if (file.size > MAX_FILE_SIZE) return "Files must be 5 MB or smaller.";
  return null;
}

export function ResumeManager() {
  const [loaded, setLoaded] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [parsedForm, setParsedForm] =
    useState<ParsedFormState>(EMPTY_PARSED_FORM);
  const [savedParsed, setSavedParsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    getResume().then((stored) => {
      if (cancelled) return;
      if (stored) {
        setResume(stored);
        setParsedForm({
          name: stored.parsed.name,
          degree: stored.parsed.degree,
          college: stored.parsed.college,
          graduationYear: stored.parsed.graduationYear,
          skillsText: stored.parsed.skills.join(", "),
        });
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ats = useMemo(
    () => (resume ? scoreResume(resume.text) : null),
    [resume],
  );

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSavedParsed(false);
    setUploading(true);
    try {
      const next = await parseResume(file);
      setResume(next);
      setParsedForm({
        name: next.parsed.name,
        degree: next.parsed.degree,
        college: next.parsed.college,
        graduationYear: next.parsed.graduationYear,
        skillsText: next.parsed.skills.join(", "),
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the resume.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSampleResume() {
    setError(null);
    setSavedParsed(false);
    setUploading(true);
    try {
      // Pass a string to trigger the mock parse
      const next = await parseResume("sample_resume.pdf");
      setResume(next);
      setParsedForm({
        name: next.parsed.name,
        degree: next.parsed.degree,
        college: next.parsed.college,
        graduationYear: next.parsed.graduationYear,
        skillsText: next.parsed.skills.join(", "),
      });
    } catch (uploadError) {
      setError("Could not load sample resume.");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    void handleFile(event.dataTransfer.files?.[0]);
  }

  async function handleRemove() {
    await removeResume();
    setResume(null);
    setParsedForm(EMPTY_PARSED_FORM);
    setSavedParsed(false);
    setError(null);
  }

  function updateParsed(key: keyof ParsedFormState, value: string) {
    setParsedForm((prev) => ({ ...prev, [key]: value }));
    setSavedParsed(false);
  }

  async function handleParsedSubmit(event: FormEvent) {
    event.preventDefault();
    if (!resume) return;
    const parsed = {
      name: parsedForm.name.trim(),
      degree: parsedForm.degree.trim(),
      college: parsedForm.college.trim(),
      graduationYear: parsedForm.graduationYear.trim(),
      skills: parsedForm.skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    };
    await saveParsedResume(parsed);
    setResume({ ...resume, parsed });
    setSavedParsed(true);
  }

  if (!loaded) {
    return <p className="mt-6 text-[15px] text-muted">Loading…</p>;
  }

  return (
    <>
      {/* Upload card */}
      <div className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-6">
        <h2 className="text-base font-semibold">Your resume</h2>

        {resume ? (
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[15px] font-medium text-ink">
                {resume.file.fileName}
              </p>
              <p className="mt-0.5 text-sm text-muted">
                Uploaded on {formatDate(resume.file.uploadedAt)}
              </p>
              {uploading ? (
                <p className="mt-1 text-sm text-muted">
                  Parsing your resume…
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Replace
              </Button>
              <Button
                variant="danger"
                onClick={handleRemove}
                disabled={uploading}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={[
              "mt-4 rounded-lg border border-dashed px-4 py-8 text-center transition-colors duration-150",
              dragActive
                ? "border-accent bg-accent-soft"
                : "border-line bg-bg",
            ].join(" ")}
          >
            <p className="text-[15px] text-ink">
              {uploading
                ? "Uploading and parsing…"
                : "Drag and drop your resume here"}
            </p>
            <p className="mt-1 text-sm text-muted">
              One PDF or DOC file, up to 5 MB.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Choose file
              </Button>
              <Button
                variant="secondary"
                onClick={handleSampleResume}
                disabled={uploading}
              >
                Use a sample resume
              </Button>
            </div>
          </div>
        )}

        {error ? (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_INPUT_ACCEPT}
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {resume ? (
        <>
          {/* Parsed fields */}
          <form
            onSubmit={handleParsedSubmit}
            className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-6"
          >
            <h2 className="text-base font-semibold">Parsed from your resume</h2>
            <p className="mt-1 text-sm text-muted">
              Check the details and fix anything we got wrong.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField
                id="parsed-name"
                label="Name"
                value={parsedForm.name}
                onChange={(event) => updateParsed("name", event.target.value)}
                autoComplete="name"
              />
              <TextField
                id="parsed-degree"
                label="Degree"
                value={parsedForm.degree}
                onChange={(event) => updateParsed("degree", event.target.value)}
              />
              <TextField
                id="parsed-college"
                label="College"
                value={parsedForm.college}
                onChange={(event) =>
                  updateParsed("college", event.target.value)
                }
              />
              <TextField
                id="parsed-graduation-year"
                label="Graduation year"
                value={parsedForm.graduationYear}
                onChange={(event) =>
                  updateParsed("graduationYear", event.target.value)
                }
                inputMode="numeric"
              />
              <div className="sm:col-span-2">
                <TextField
                  id="parsed-skills"
                  label="Skills"
                  value={parsedForm.skillsText}
                  onChange={(event) =>
                    updateParsed("skillsText", event.target.value)
                  }
                  helper="Separate skills with commas."
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-4">
              <Button type="submit">Save changes</Button>
              <span aria-live="polite" className="text-sm text-muted">
                {savedParsed ? "Changes saved." : ""}
              </span>
            </div>
          </form>

          {/* ATS feedback */}
          {ats ? (
            <div className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-6">
              <h2 className="text-base font-semibold">ATS feedback</h2>
              <p className="mt-3 text-2xl font-semibold tabular-nums">
                {ats.score} / 100
              </p>
              <p className="mt-1 text-sm text-muted">
                Keywords {ats.keywordScore} / 60, sections {ats.sectionScore} /{" "}
                40
              </p>

              <h3 className="mt-5 text-sm font-medium text-ink">
                What we found
              </h3>
              <p className="mt-1 text-[15px] text-ink">
                Sections:{" "}
                {ats.sectionsFound.length > 0
                  ? ats.sectionsFound.join(", ")
                  : "None"}
              </p>
              <p className="mt-1 text-[15px] text-ink">
                Keywords:{" "}
                {ats.keywordsFound.length > 0
                  ? ats.keywordsFound.join(", ")
                  : "None"}
              </p>

              <h3 className="mt-5 text-sm font-medium text-ink">Tips</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px] text-ink">
                {ats.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-6">
          <h2 className="text-base font-semibold">What you&apos;ll see after uploading</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-ink">Parsed details</h3>
              <p className="mt-1 text-[14px] text-muted">
                We extract your name, education, and skills. You can review and edit them to make sure they are accurate.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-ink">ATS feedback</h3>
              <p className="mt-1 text-[14px] text-muted">
                You get a score out of 100 on how ATS-friendly your resume is, plus 2-3 actionable tips to improve it.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
