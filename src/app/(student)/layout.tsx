import type { ReactNode } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-[1040px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 sm:px-6">
          <Link
            href="/jobs"
            className="rounded-md py-1 text-[15px] font-semibold tracking-tight text-ink transition-colors duration-150 hover:text-accent"
          >
            AI Job Finder
          </Link>
          <SiteNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}
