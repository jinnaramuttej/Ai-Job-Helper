import type { Metadata } from "next";
import { RecommendedBlock } from "@/components/recommended";
import { getCurrentUser, getStudentApplications, getProfile, getRecommendedJobs, getResume } from "@/lib/api";

export const metadata: Metadata = {
  title: "Jobs",
};

export default async function JobsPage() {
  const user = await getCurrentUser();
  let applicationsSent = 0;
  let profileCompleteness = "0%";
  let matchedJobsCount = 0;

  if (user) {
    const [applications, profile, recommended, resume] = await Promise.all([
      getStudentApplications(user.id),
      getProfile(),
      getRecommendedJobs(100), // Get a decent number for the count
      getResume(),
    ]);
    
    applicationsSent = applications.length;
    matchedJobsCount = recommended.filter(r => r.match.score >= 50).length;
    
    // Calculate completeness: name, branch, year, location, skills, roles, resume (7 fields total)
    let filled = 0;
    const total = 7;
    if (profile.name) filled++;
    if (profile.branch) filled++;
    if (profile.year) filled++;
    if (profile.preferredLocation) filled++;
    if (profile.skills && profile.skills.length > 0) filled++;
    if (profile.preferredRoles && profile.preferredRoles.length > 0) filled++;
    if (resume) filled++;
    
    profileCompleteness = `${Math.round((filled / total) * 100)}%`;
  }

  // Calculate time-based greeting
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const firstName = user?.name ? user.name.split(" ")[0] : "";

  return (
    <section>
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {user ? `${greeting}, ${firstName}` : "Jobs"}
        </h1>
        <p className="text-[15px] text-muted">
          {user ? "Here's an overview of your job search." : "Discover and apply for your next role."}
        </p>

        {user && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[10px] border border-line bg-surface p-4">
              <div className="text-[24px] font-semibold tracking-tight text-ink">
                {applicationsSent}
              </div>
              <div className="mt-1 text-[13px] text-muted">Applications sent</div>
            </div>
            <div className="rounded-[10px] border border-line bg-surface p-4">
              <div className="text-[24px] font-semibold tracking-tight text-ink">
                {profileCompleteness}
              </div>
              <div className="mt-1 text-[13px] text-muted">Profile completeness</div>
            </div>
            <div className="rounded-[10px] border border-line bg-surface p-4">
              <div className="text-[24px] font-semibold tracking-tight text-ink">
                {matchedJobsCount}
              </div>
              <div className="mt-1 text-[13px] text-muted">Jobs matching your skills</div>
            </div>
          </div>
        )}
      </div>

      <RecommendedBlock />
      <h2 className="mt-8 text-base font-semibold">All jobs</h2>
      <p className="mt-2 text-[15px] text-muted">
        The full job list with search and filters arrives in the next phase.
      </p>
    </section>
  );
}
