"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getProfile,
  saveProfile,
  ROLE_OPTIONS,
  YEAR_OPTIONS,
  type Profile,
} from "@/lib/api";
import { Button } from "@/components/button";
import { TextField, inputClasses, labelClasses } from "@/components/form";

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skillsText, setSkillsText] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProfile().then((loaded) => {
      if (cancelled) return;
      setProfile(loaded);
      setSkillsText(loaded.skills.join(", "));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  function toggleRole(role: string) {
    if (!profile) return;
    const hasRole = profile.preferredRoles.includes(role);
    update(
      "preferredRoles",
      hasRole
        ? profile.preferredRoles.filter((r) => r !== role)
        : [...profile.preferredRoles, role],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;
    const skills = skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    const next = { ...profile, skills };
    await saveProfile(next);
    setProfile(next);
    setSaved(true);
  }

  if (!profile) {
    return <p className="mt-6 text-[15px] text-muted">Loading…</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="name"
          label="Full name"
          value={profile.name}
          onChange={(event) => update("name", event.target.value)}
          autoComplete="name"
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          value={profile.email}
          readOnly
          autoComplete="email"
          helper="Your college email can't be changed."
        />
        <TextField
          id="branch"
          label="Branch"
          value={profile.branch}
          onChange={(event) => update("branch", event.target.value)}
          placeholder="e.g. Computer science"
        />
        <div>
          <label htmlFor="year" className={labelClasses}>
            Year
          </label>
          <select
            id="year"
            value={profile.year}
            onChange={(event) => update("year", event.target.value)}
            className={inputClasses}
          >
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <TextField
          id="location"
          label="Preferred location"
          value={profile.preferredLocation}
          onChange={(event) =>
            update("preferredLocation", event.target.value)
          }
          placeholder="e.g. Bengaluru, remote"
        />
        <TextField
          id="skills"
          label="Skills"
          value={skillsText}
          onChange={(event) => {
            setSkillsText(event.target.value);
            setSaved(false);
          }}
          placeholder="e.g. JavaScript, React, SQL"
          helper="Separate skills with commas."
        />
      </div>

      <fieldset className="mt-6">
        <legend className={`${labelClasses} p-0`}>Preferred roles</legend>
        <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {ROLE_OPTIONS.map((role) => {
            const checked = profile.preferredRoles.includes(role);
            return (
              <label
                key={role}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[15px] text-ink transition-colors duration-150 hover:bg-accent-soft"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleRole(role)}
                  className="size-4 shrink-0 accent-accent"
                />
                {role}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Button type="submit">Save changes</Button>
        <span aria-live="polite" className="text-sm text-muted">
          {saved ? "Changes saved." : ""}
        </span>
      </div>
    </form>
  );
}
