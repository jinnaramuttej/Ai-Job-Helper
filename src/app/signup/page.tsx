"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.error) {
          setGeneralError(data.error);
        }
      } else {
        router.push("/jobs");
        router.refresh();
      }
    } catch (err) {
      setGeneralError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm p-6 rounded-[10px] border border-line bg-surface shadow-sm">
        <h1 className="text-xl font-semibold mb-6 tracking-tight text-ink">Sign up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[14px] font-medium text-ink mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[8px] border border-line px-3 py-2 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/20"
              required
            />
            {errors.name && <p className="text-[#e11d48] text-[13px] mt-1">{errors.name[0]}</p>}
          </div>
          <div>
            <label className="block text-[14px] font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[8px] border border-line px-3 py-2 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/20"
              required
            />
            {errors.email && <p className="text-[#e11d48] text-[13px] mt-1">{errors.email[0]}</p>}
          </div>
          <div>
            <label className="block text-[14px] font-medium text-ink mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[8px] border border-line px-3 py-2 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/20"
              required
            />
            {errors.password && <p className="text-[#e11d48] text-[13px] mt-1">{errors.password[0]}</p>}
          </div>
          {generalError && <p className="text-[#e11d48] text-[14px] font-medium">{generalError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-[8px] bg-accent py-[10px] text-[14px] font-medium text-surface transition-colors hover:bg-accent-strong disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>
        <p className="mt-5 text-[14px] text-muted text-center">
          Already have an account? <Link href="/login" className="text-accent font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
