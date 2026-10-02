import type { Profile } from "./mock";

export function calculateCompleteness(profile: Profile, hasResume: boolean): number {
  let filled = 0;
  const total = 7;
  
  if (profile.name) filled++;
  if (profile.branch) filled++;
  if (profile.year) filled++;
  if (profile.preferredLocation) filled++;
  if (profile.skills && profile.skills.length > 0) filled++;
  if (profile.preferredRoles && profile.preferredRoles.length > 0) filled++;
  if (hasResume) filled++;
  
  return Math.round((filled / total) * 100);
}
