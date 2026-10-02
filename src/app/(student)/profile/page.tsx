import type { Metadata } from "next";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-2 text-[15px] text-muted">
        Tell us about yourself so we can match you with the right jobs.
      </p>
      <ProfileForm />
    </section>
  );
}
