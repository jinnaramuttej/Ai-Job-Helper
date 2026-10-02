"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Star, FileText, User, Menu, LogOut } from "lucide-react";

type CurrentUser = { name: string; email: string };

const navItems = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/recommended", label: "Recommended", icon: Star },
  { href: "/applications", label: "Applications", icon: FileText },
  { href: "/resume", label: "Resume", icon: FileText }, // using FileText for resume too, or maybe another icon
];

export function AppShell({ children, user }: { children: React.ReactNode; user: CurrentUser | null }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userInitials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-surface">
      {/* Top Wordmark */}
      <div className="p-5">
        <Link
          href="/jobs"
          className="text-[16px] font-semibold tracking-tight text-ink"
        >
          AI Job Finder
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-[40px] items-center gap-3 rounded-[8px] px-3 text-[14px] transition-colors duration-150 ${
                active
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-muted hover:bg-accent-soft/50 hover:text-ink"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={1.75}
                className={active ? "text-accent" : "text-muted"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Block */}
      <div className="relative border-t border-line p-3">
        {userMenuOpen && user && (
          <div className="absolute bottom-full left-3 mb-1 w-[calc(100%-24px)] rounded-[8px] border border-line bg-surface py-1 shadow-sm">
            <Link
              href="/profile"
              className="flex w-full items-center gap-2 px-3 py-2 text-[14px] text-ink hover:bg-accent-soft/50 transition-colors duration-150"
            >
              <User size={18} strokeWidth={1.75} className="text-muted" />
              Profile
            </Link>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-[14px] text-ink hover:bg-accent-soft/50 transition-colors duration-150"
            >
              <LogOut size={18} strokeWidth={1.75} className="text-muted" />
              Log out
            </button>
          </div>
        )}

        {user ? (
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex w-full items-center gap-3 rounded-[8px] p-2 text-left transition-colors duration-150 hover:bg-accent-soft/50"
          >
            <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-accent text-[14px] font-medium text-surface">
              {userInitials}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-[14px] font-medium text-ink">
                {user.name}
              </div>
              <div className="truncate text-[12px] text-muted">
                {user.email}
              </div>
            </div>
          </button>
        ) : (
          <div className="flex flex-col gap-2 p-2">
            <Link
              href="/login"
              className="flex h-[36px] items-center justify-center rounded-[8px] bg-accent text-[14px] font-medium text-surface transition-colors duration-150 hover:bg-accent-strong"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="flex h-[36px] items-center justify-center rounded-[8px] border border-line text-[14px] font-medium text-ink transition-colors duration-150 hover:bg-accent-soft/50"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-bg">
      {/* Desktop Sidebar (hidden below 900px) */}
      <aside className="hidden w-[240px] shrink-0 border-r border-line bg-surface min-[900px]:block">
        <div className="fixed top-0 bottom-0 left-0 w-[240px]">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Top Bar (hidden on desktop) */}
      <div className="max-[899px]:block min-[900px]:hidden">
        <header className="fixed left-0 right-0 top-0 z-20 flex h-[56px] items-center justify-between border-b border-line bg-surface px-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:text-ink"
            aria-label="Open menu"
          >
            <Menu size={24} strokeWidth={1.75} />
          </button>
          <div className="text-[16px] font-semibold tracking-tight text-ink">
            AI Job Finder
          </div>
          {user ? (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-accent text-[12px] font-medium text-surface"
            >
              {userInitials}
            </button>
          ) : (
            <div className="w-10" /> /* Placeholder for balance */
          )}
        </header>

        {/* Mobile Avatar Menu Dropdown */}
        {userMenuOpen && user && (
          <div className="fixed right-4 top-[60px] z-30 w-48 rounded-[8px] border border-line bg-surface py-1 shadow-sm">
            <Link
              href="/profile"
              className="flex w-full items-center gap-2 px-3 py-2 text-[14px] text-ink hover:bg-accent-soft/50 transition-colors duration-150"
            >
              <User size={18} strokeWidth={1.75} className="text-muted" />
              Profile
            </Link>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-[14px] text-ink hover:bg-accent-soft/50 transition-colors duration-150"
            >
              <LogOut size={18} strokeWidth={1.75} className="text-muted" />
              Log out
            </button>
          </div>
        )}

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-ink/20 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="relative w-[280px] max-w-[calc(100%-3rem)] bg-surface shadow-xl">
              <SidebarContent />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pt-[56px] min-[900px]:pt-0">
        <div className="mx-auto w-full max-w-[960px] px-4 pt-[32px] sm:px-[16px] pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
