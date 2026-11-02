'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity, Bell, Bookmark, Briefcase, CalendarDays, ChartLine, ChevronDown, Ellipsis, FileText, Globe, House, Keyboard, Layers,
  LayoutGrid, LogOut, Menu, MessagesSquare, Search, Send, Settings, Sparkles, SquareKanban, Target, User, X, type LucideIcon,
} from 'lucide-react';
import type { NotificationItem, UIData } from '@/lib/view-models';
import { signOut } from '@/lib/api';
import { Avatar, Dropdown, IconButton, Kbd, MenuItem, Tag, cx, useLayer } from './ui';

export interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: boolean;
}

export const SCREEN_LABEL: Record<string, string> = {
  '/dashboard': 'Overview',
  '/overview': 'Overview',
  '/command': 'Command',
  '/jobs': 'Jobs',
  '/recommended': 'Matches',
  '/saved': 'Saved',
  '/skills': 'Skills',
  '/resume': 'Resume Studio',
  '/interview': 'Interview Prep',
  '/insights': 'Insights',
  '/applications': 'Applications',
  '/calendar': 'Calendar',
  '/activity': 'Activity',
  '/profile': 'Settings',
  '/settings': 'Settings',
};

export const NAV_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Core',
    items: [
      { id: 'overview', href: '/dashboard', label: 'Overview', icon: LayoutGrid },
      { id: 'command', href: '/command', label: 'Command', icon: Sparkles },
      { id: 'jobs', href: '/jobs', label: 'Jobs', icon: Briefcase },
      { id: 'matches', href: '/recommended', label: 'Matches', icon: Target },
      { id: 'saved', href: '/saved', label: 'Saved', icon: Bookmark },
    ],
  },
  {
    section: 'Growth',
    items: [
      { id: 'skills', href: '/skills', label: 'Skills', icon: Layers },
      { id: 'resume', href: '/resume', label: 'Resume Studio', icon: FileText },
      { id: 'interview', href: '/interview', label: 'Interview Prep', icon: MessagesSquare },
      { id: 'insights', href: '/insights', label: 'Insights', icon: ChartLine },
    ],
  },
  {
    section: 'Workflow',
    items: [
      { id: 'applications', href: '/applications', label: 'Applications', icon: SquareKanban },
      { id: 'calendar', href: '/calendar', label: 'Calendar', icon: CalendarDays },
      { id: 'activity', href: '/activity', label: 'Activity', icon: Activity },
    ],
  },
];

function NavLink({ href, active, icon: Icon, label, badge, onClick }: { href: string; active: boolean; icon: LucideIcon; label: string; badge?: ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'group flex w-full items-center gap-3 rounded-full px-3 py-[7px] text-[14px] transition-colors duration-150',
        active ? 'bg-soft font-medium text-ink' : 'text-muted hover:bg-soft/70 hover:text-ink',
      )}
    >
      <Icon className={cx('size-[17px] shrink-0', active ? 'text-ink' : 'text-faint group-hover:text-ink')} aria-hidden />
      <span className="flex-1 truncate text-left">{label}</span>
      {badge}
      {active && <span className="size-1.5 shrink-0 rounded-full bg-terra" aria-hidden />}
    </Link>
  );
}

export function Sidebar({ user, appCount = 0, onClose }: { user?: { name: string; email: string; program?: string }; appCount?: number; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex h-full w-[264px] flex-col border-r border-line bg-side">
      <div className="flex items-center justify-between px-6 pb-5 pt-6">
        <Link href="/dashboard" className="flex items-baseline gap-2 rounded-md text-left" aria-label="Jaggle home">
          <span className="font-serif text-[22px] leading-none tracking-[-0.01em] text-ink">Jaggle</span>
        </Link>
        {onClose && <IconButton label="Close navigation" icon={X} onClick={onClose} size="sm" />}
      </div>
      <div className="mx-6 border-t border-line" />
      <div className="scroll-thin flex-1 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((sec) => (
          <div key={sec.section} className="mb-6">
            <div className="micro px-3 pb-2 text-faint">{sec.section}</div>
            <ul className="space-y-0.5">
              {sec.items.map((it) => {
                const active = pathname === it.href || (it.href !== '/dashboard' && pathname.startsWith(`${it.href}/`));
                return (
                  <li key={it.id}>
                    <NavLink
                      href={it.href}
                      active={active}
                      icon={it.icon}
                      label={it.label}
                      onClick={onClose}
                      badge={
                        it.badge && appCount > 0 ? (
                          <span className="rounded-full border border-line bg-white px-1.5 py-px font-mono text-[10.5px] text-muted" aria-label={`${appCount} applications`}>
                            {appCount}
                          </span>
                        ) : undefined
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-3 pb-4 pt-3">
        <NavLink
          href="/settings"
          active={pathname === '/settings' || pathname === '/profile'}
          icon={Settings}
          label="Settings"
          onClick={onClose}
        />
        {user && (
          <Link href="/settings" onClick={onClose} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-150 hover:bg-soft/70">
            <Avatar name={user.name} size={34} />
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-medium text-ink">{user.name}</span>
              <span className="block truncate text-[12px] text-muted">{user.program || user.email}</span>
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export function MobileDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useLayer(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[66] bg-ink/30 md:hidden" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Navigation" tabIndex={-1} className="absolute inset-y-0 left-0 shadow-pop outline-none">
        {children}
      </div>
    </div>
  );
}

function Notifications({ items, setItems }: { items: NotificationItem[]; setItems: (n: NotificationItem[]) => void }) {
  const unread = items.filter((n) => n.unread).length;
  const router = useRouter();

  const getTargetHref = (target: string) => {
    switch (target) {
      case 'matches': return '/recommended';
      case 'jobs': return '/jobs';
      case 'applications': return '/applications';
      case 'resume': return '/resume';
      case 'interview': return '/interview';
      case 'activity': return '/activity';
      case 'calendar': return '/calendar';
      case 'settings': return '/settings';
      default: return `/${target}`;
    }
  };

  return (
    <Dropdown
      align="right"
      panelClassName="w-[min(380px,calc(100vw-24px))] !p-0"
      button={({ open, toggle }) => (
        <span className="relative inline-flex">
          <IconButton label={`Notifications${unread ? `, ${unread} unread` : ''}`} icon={Bell} onClick={toggle} aria-expanded={open} aria-haspopup="true" />
          {unread > 0 && <span className="pointer-events-none absolute right-[9px] top-[8px] size-2 rounded-full bg-terra ring-2 ring-canvas" aria-hidden />}
        </span>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-serif text-[18px]">Notifications</span>
            <button type="button" className="text-[12.5px] text-terra hover:underline" onClick={() => setItems(items.map((n) => ({ ...n, unread: false })))}>
              Mark all read
            </button>
          </div>
          <ul className="max-h-[360px] overflow-y-auto">
            {items.map((n) => (
              <li key={n.id} className="border-b border-line last:border-0">
                <button
                  type="button"
                  onClick={() => {
                    setItems(items.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
                    router.push(getTargetHref(n.target));
                    close();
                  }}
                  className="flex w-full gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-soft/60"
                >
                  <span className={cx('mt-1.5 size-1.5 shrink-0 rounded-full', n.unread ? 'bg-terra' : 'bg-transparent')} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <Tag category={n.category} />
                      <span className="font-mono text-[11px] text-faint">{n.time}</span>
                      {n.unread && <span className="sr-only">unread</span>}
                    </span>
                    <span className="mt-1.5 block text-[13.5px] font-medium text-ink">{n.title}</span>
                    <span className="block text-[12.5px] text-muted">{n.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-line px-4 py-2.5">
            <Link href="/activity" onClick={close} className="text-[12.5px] text-muted hover:text-ink">
              View all activity →
            </Link>
          </div>
        </div>
      )}
    </Dropdown>
  );
}

export function TopBar({ user, notifications = [], onOpenPalette, onOpenDrawer, onToast }: { user?: { name: string; email: string }; notifications?: NotificationItem[]; onOpenPalette: () => void; onOpenDrawer: () => void; onToast: (m: string) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [items, setItems] = useState(notifications);

  const currentLabel = SCREEN_LABEL[pathname] || (pathname.startsWith('/jobs/') ? 'Job Details' : 'Dashboard');

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-canvas px-3 md:px-8">
      <IconButton label="Open navigation" icon={Menu} onClick={onOpenDrawer} className="md:hidden" />
      <span className="font-serif text-[19px] md:hidden">Jaggle</span>
      <nav aria-label="Breadcrumb" className="hidden md:block">
        <ol className="flex items-center gap-2 text-[13.5px]">
          <li className="text-muted">Workspace</li>
          <li aria-hidden className="text-faint">/</li>
          <li aria-current="page" className="text-ink">{currentLabel}</li>
        </ol>
      </nav>
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Search or run a command (Command K)"
          className="hidden h-9 w-[260px] items-center gap-2 rounded-full border border-line bg-white px-3.5 text-[13.5px] text-faint shadow-pill transition-colors duration-150 hover:border-border-subtle md:flex lg:w-[320px]"
        >
          <Search className="size-4" aria-hidden />
          <span className="flex-1 truncate text-left">Search jobs, pages, actions…</span>
          <Kbd>⌘K</Kbd>
        </button>
        <IconButton label="Search" icon={Search} onClick={onOpenPalette} className="md:hidden" />
        <Notifications items={items} setItems={setItems} />
        {user && (
          <Dropdown
            align="right"
            panelClassName="w-64"
            button={({ open, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Account menu"
                className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 transition-colors duration-150 hover:bg-soft"
              >
                <Avatar name={user.name} size={30} />
                <ChevronDown className="hidden size-3.5 text-muted md:block" aria-hidden />
              </button>
            )}
          >
            {(close) => (
              <div role="menu">
                <div className="border-b border-line px-2.5 pb-2.5 pt-1.5">
                  <div className="text-[13.5px] font-medium">{user.name}</div>
                  <div className="truncate text-[12px] text-muted">{user.email}</div>
                </div>
                <div className="pt-1.5">
                  <MenuItem icon={User} onClick={() => { router.push('/settings'); close(); }}>Profile and settings</MenuItem>
                  <MenuItem icon={Keyboard} onClick={() => { onToast('Tip: press ⌘K (Ctrl K) anywhere to open the command palette'); close(); }} hint={<Kbd>⌘K</Kbd>}>Shortcuts</MenuItem>
                  <MenuItem icon={Globe} onClick={() => { router.push('/'); close(); }}>View landing page</MenuItem>
                  <MenuItem icon={LogOut} onClick={() => { handleSignOut(); close(); }}>Sign out</MenuItem>
                </div>
              </div>
            )}
          </Dropdown>
        )}
      </div>
    </header>
  );
}

export function MobileTabBar({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  const tabs = [
    { href: '/overview', label: 'Home', icon: House },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/applications', label: 'Apply', icon: Send },
    { href: '/resume', label: 'Resume', icon: FileText },
    { href: '#more', label: 'More', icon: Ellipsis },
  ];

  const primaryHrefs = ['/overview', '/jobs', '/applications', '/resume'];

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-side pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const isMore = t.href === '#more';
          const active = isMore ? !primaryHrefs.includes(pathname) : pathname === t.href;
          return (
            <li key={t.label}>
              {isMore ? (
                <button
                  type="button"
                  onClick={onMore}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'relative flex w-full flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] transition-colors duration-150',
                    active ? 'text-ink' : 'text-faint hover:text-ink',
                  )}
                >
                  <t.icon className="size-5" aria-hidden />
                  <span className={active ? 'font-medium' : ''}>{t.label}</span>
                  {active && <span className="absolute top-1 size-1 rounded-full bg-terra" aria-hidden />}
                </button>
              ) : (
                <Link
                  href={t.href}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'relative flex w-full flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] transition-colors duration-150',
                    active ? 'text-ink' : 'text-faint hover:text-ink',
                  )}
                >
                  <t.icon className="size-5" aria-hidden />
                  <span className={active ? 'font-medium' : ''}>{t.label}</span>
                  {active && <span className="absolute top-1 size-1 rounded-full bg-terra" aria-hidden />}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

