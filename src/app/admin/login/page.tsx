"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, getAdminUser, ADMIN_CREDENTIALS } from "@/lib/api";
import { Button } from "@/components/button";
import { TextField } from "@/components/form";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAdminUser().then((user) => {
      if (user) router.replace("/admin");
    });
  }, [router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setBusy(true);
    setError(null);
    const user = await adminLogin(email, password);
    setBusy(false);
    if (!user) {
      setError("Incorrect email or password.");
      return;
    }
    router.replace("/admin");
  }

  return (
    <div className="mx-auto w-full max-w-sm pt-8">
      <p className="text-center text-[15px] font-semibold tracking-tight">
        AI Job Finder
      </p>
      <p className="mt-1 text-center text-sm text-muted">Admin</p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-6"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-1 text-sm text-muted">
          Separate admin access — not a student account.
        </p>
        <div className="mt-5 space-y-4">
          <TextField
            id="admin-email"
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
          />
          <TextField
            id="admin-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(null);
            }}
          />
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="mt-5">
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </Button>
        </div>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Demo credentials: {ADMIN_CREDENTIALS.email} /{" "}
        {ADMIN_CREDENTIALS.password}
      </p>
    </div>
  );
}
