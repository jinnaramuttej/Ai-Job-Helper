"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  adminCreateJob,
  adminUpdateJob,
  ROLE_OPTIONS,
  type Job,
  type JobInput,
} from "@/lib/api";
import { Button } from "@/components/button";
import {
  SelectField,
  TextareaField,
  TextField,
} from "@/components/form";

type FormState = {
  title: string;
  company: string;
  location: string;
  role: string;
  experience: string;
  summary: string;
  skillsText: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = "Enter a title.";
  if (!form.company.trim()) errors.company = "Enter a company.";
  if (!form.location.trim()) errors.location = "Enter a location.";
  if (!form.role) errors.role = "Select a role.";

  const experience = form.experience.trim();
  if (!experience) {
    errors.experience = "Enter the minimum years of experience.";
  } else if (!/^\d+$/.test(experience)) {
    errors.experience = "Experience must be a whole number of years.";
  }

  if (!form.summary.trim()) errors.summary = "Enter a short description.";
  if (
    form.skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean).length === 0
  ) {
    errors.skillsText = "Enter at least one skill.";
  }
  return errors;
}

/** Shared form for adding and editing jobs. */
export function JobForm({ initialJob }: { initialJob?: Job }) {
  const router = useRouter();
  const isEdit = Boolean(initialJob);

  const [form, setForm] = useState<FormState>(() =>
    initialJob
      ? {
          title: initialJob.title,
          company: initialJob.company,
          location: initialJob.location,
          role: initialJob.role,
          experience: String(initialJob.minExperienceYears),
          summary: initialJob.summary,
          skillsText: initialJob.requiredSkills.join(", "),
        }
      : {
          title: "",
          company: "",
          location: "",
          role: "",
          experience: "0",
          summary: "",
          skillsText: "",
        },
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);

  const roleOptions = initialJob && !ROLE_OPTIONS.includes(initialJob.role)
    ? [...ROLE_OPTIONS, initialJob.role]
    : ROLE_OPTIONS;

  function update(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const input: JobInput = {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      role: form.role,
      minExperienceYears: Number.parseInt(form.experience.trim(), 10),
      summary: form.summary.trim(),
      requiredSkills: form.skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    };

    setBusy(true);
    if (isEdit && initialJob) {
      await adminUpdateJob(initialJob.id, input);
      router.push(`/admin/jobs/${initialJob.id}`);
    } else {
      const created = await adminCreateJob(input);
      router.push(`/admin/jobs/${created.id}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="job-title"
          label="Title"
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          error={errors.title}
          placeholder="e.g. Frontend developer intern"
        />
        <TextField
          id="job-company"
          label="Company"
          value={form.company}
          onChange={(event) => update("company", event.target.value)}
          error={errors.company}
          placeholder="e.g. PixelWorks"
        />
        <TextField
          id="job-location"
          label="Location"
          value={form.location}
          onChange={(event) => update("location", event.target.value)}
          error={errors.location}
          placeholder="e.g. Bengaluru or Remote"
        />
        <SelectField
          id="job-role"
          label="Role"
          value={form.role}
          onChange={(event) => update("role", event.target.value)}
          error={errors.role}
          options={roleOptions}
          placeholder="Select a role"
        />
        <TextField
          id="job-experience"
          label="Minimum experience (years)"
          inputMode="numeric"
          value={form.experience}
          onChange={(event) => update("experience", event.target.value)}
          error={errors.experience}
          helper="Use 0 for roles open to anyone."
        />
        <div className="sm:col-span-2">
          <TextareaField
            id="job-summary"
            label="Short description"
            value={form.summary}
            onChange={(event) => update("summary", event.target.value)}
            error={errors.summary}
          />
        </div>
        <div className="sm:col-span-2">
          <TextField
            id="job-skills"
            label="Required skills"
            value={form.skillsText}
            onChange={(event) => update("skillsText", event.target.value)}
            error={errors.skillsText}
            helper="Separate skills with commas."
            placeholder="e.g. JavaScript, React, SQL"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Button type="submit" disabled={busy}>
          {busy
            ? isEdit
              ? "Saving…"
              : "Adding…"
            : isEdit
              ? "Save changes"
              : "Add job"}
        </Button>
        <Link
          href={isEdit && initialJob ? `/admin/jobs/${initialJob.id}` : "/admin/jobs"}
          className="text-sm text-muted underline-offset-2 transition-colors duration-150 hover:text-ink hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
