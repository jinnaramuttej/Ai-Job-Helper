"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminLogout, getAdminUser, type AdminUser } from "@/lib/api";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/students", label: "Students" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Chrome + route guard for everything under /admin. The login page
 * renders bare (no nav). All other admin routes require a session.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [state, setState] = useState<{
    status: "loading" | "ready";
    user: AdminUser | null;
  }>({ status: "loading", user: null });

  useEffect(() => {
    let cancelled = false;
    getAdminUser().then((user) => {
      if (cancelled) return;
      setState({ status: "ready", user });
      if (!user && !isLoginPage) {
        router.replace("/admin/login");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <main className="flex-1 px-4 py-8">{children}</main>;
  }

  if (state.status === "loading" || !state.user) {
    return (
      <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 py-8 sm:px-6">
        <p className="text-[15px] text-muted">Loading…</p>
      </main>
    );
  }

  async function handleLogout() {
    await adminLogout();
    router.replace("/admin/login");
  }

  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-[1040px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 sm:px-6">
          <Link
            href="/admin"
            className="rounded-md py-1 text-[15px] font-semibold tracking-tight text-ink transition-colors duration-150 hover:text-accent"
          >
            AI Job Finder <span className="font-normal text-muted">Admin</span>
          </Link>
          <div className="flex flex-wrap items-center gap-1">
            <nav aria-label="Admin navigation">
              <ul className="flex flex-wrap items-center gap-1">
                {adminLinks.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "block rounded-md px-3 py-2 text-sm transition-colors duration-150",
                          active
                            ? "bg-accent-soft font-medium text-accent"
                            : "text-muted hover:bg-accent-soft hover:text-ink",
                        ].join(" ")}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md px-3 py-2 text-sm text-muted transition-colors duration-150 hover:bg-accent-soft hover:text-ink"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}
