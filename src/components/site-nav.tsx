"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/jobs", label: "Jobs" },
  { href: "/recommended", label: "Recommended" },
  { href: "/applications", label: "Applications" },
  { href: "/resume", label: "Resume" },
  { href: "/profile", label: "Profile" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      <ul className="flex flex-wrap items-center gap-1">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
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
  );
}
