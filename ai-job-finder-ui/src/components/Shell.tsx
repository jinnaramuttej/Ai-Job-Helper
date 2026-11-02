import { useState, type ReactNode } from 'react';
import {
  Activity, Bell, Bookmark, Briefcase, CalendarDays, ChartLine, ChevronDown, Ellipsis, FileText, Globe, House, Keyboard, Layers,
  LayoutGrid, LogOut, Menu, MessagesSquare, Search, Send, Settings, Sparkles, SquareKanban, Target, User, X, type LucideIcon,
} from 'lucide-react';
import type { MockData, NotificationItem, Screen } from '../mock';
import { Avatar, Dropdown, IconButton, Kbd, MenuItem, Tag, cx, useLayer } from './ui';

export const SCREEN_LABEL: Record<Screen, string> = {
  overview: 'Overview', command: 'Command', jobs: 'Jobs', matches: 'Matches', saved: 'Saved',
  skills: 'Skills', resume: 'Resume Studio', interview: 'Interview Prep', insights: 'Insights',
  applications: 'Applications', calendar: 'Calendar', activity: 'Activity', settings: 'Settings',
  landing: 'Landing page', login: 'Sign in', signup: 'Sign up', onboarding: 'Onboarding',
};

export const NAV: { section: string; items: { id: Screen; label: string; icon: LucideIcon; badge?: boolean }[] }[] = [
  { section: 'Core', items: [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'command', label: 'Command', icon: Sparkles },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'matches', label: 'Matches', icon: Target },
    { id: 'saved', label: 'Saved', icon: Bookmark },
  ] },
  { section: 'Growth', items: [
    { id: 'skills', label: 'Skills', icon: Layers },
    { id: 'resume', label: 'Resume Studio', icon: FileText },
    { id: 'interview', label: 'Interview Prep', icon: MessagesSquare },
    { id: 'insights', label: 'Insights', icon: ChartLine },
  ] },
  { section: 'Workflow', items: [
    { id: 'applications', label: 'Applications', icon: SquareKanban, badge: true },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'activity', label: 'Activity', icon: Activity },
  ] },
];

function NavButton({ active, icon: Icon, label, onClick, badge }: { active: boolean; icon: LucideIcon; label: string; onClick: () => void; badge?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined}
      className={cx('group flex w-full items-center gap-3 rounded-full px-3 py-[7px] text-[14px] transition-colors duration-150',
        active ? 'bg-soft font-medium text-ink' : 'text-muted hover:bg-soft/70 hover:text-ink')}>
      <Icon className={cx('size-[17px] shrink-0', active ? 'text-ink' : 'text-faint group-hover:text-ink')} aria-hidden />
      <span className="flex-1 truncate text-left">{label}</span>
      {badge}
      {active && <span className="size-1.5 shrink-0 rounded-full bg-terra" aria-hidden />}
    </button>
  );
}

export function Sidebar({ current, onNavigate, data, appCount, onClose }: { current: Screen; onNavigate: (s: Screen) => void; data: MockData; appCount: number; onClose?: () => void }) {
  return (
    <nav aria-label="Main" className="flex h-full w-[264px] flex-col border-r border-line bg-side">
      <div className="flex items-center justify-between px-6 pb-5 pt-6">
        <button type="button" onClick={() => onNavigate('overview')} className="flex items-baseline gap-2 rounded-md text-left" aria-label="AI Job Finder home">
          <span className="font-serif text-[22px] leading-none tracking-[-0.01em] text-ink">AI Job Finder</span>
          <span className="font-mono text-[11px] text-faint">v1.0</span>
        </button>
        {onClose && <IconButton label="Close navigation" icon={X} onClick={onClose} size="sm" />}
      </div>
      <div className="mx-6 border-t border-line" />
      <div className="scroll-thin flex-1 overflow-y-auto px-3 py-5">
        {NAV.map((sec) => (
          <div key={sec.section} className="mb-6">
            <div className="micro px-3 pb-2 text-faint">{sec.section}</div>
            <ul className="space-y-0.5">
              {sec.items.map((it) => (
                <li key={it.id}>
                  <NavButton active={current === it.id} icon={it.icon} label={it.label} onClick={() => onNavigate(it.id)}
                    badge={it.badge ? <span className="rounded-full border border-line bg-white px-1.5 py-px font-mono text-[10.5px] text-muted" aria-label={`${appCount} applications`}>{appCount}</span> : undefined} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-3 pb-4 pt-3">
        <NavButton active={current === 'settings'} icon={Settings} label="Settings" onClick={() => onNavigate('settings')} />
        <button type="button" onClick={() => onNavigate('settings')} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-150 hover:bg-soft/70">
          <Avatar name={data.user.name} size={34} />
          <span className="min-w-0">
            <span className="block truncate text-[13.5px] font-medium text-ink">{data.user.name}</span>
            <span className="block truncate text-[12px] text-muted">{data.user.program}</span>
          </span>
        </button>
      </div>
    </nav>
  );
}

export function MobileDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useLayer(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[66] bg-[#1B1916]/30 md:hidden" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Navigation" tabIndex={-1} className="absolute inset-y-0 left-0 shadow-pop outline-none">
        {children}
      </div>
    </div>
  );
}

function Notifications({ items, setItems, onNavigate }: { items: NotificationItem[]; setItems: (n: NotificationItem[]) => void; onNavigate: (s: Screen) => void }) {
  const unread = items.filter((n) => n.unread).length;
  return (
    <Dropdown align="right" panelClassName="w-[min(380px,calc(100vw-24px))] !p-0"
      button={({ open, toggle }) => (
        <span className="relative inline-flex">
          <IconButton label={`Notifications${unread ? `, ${unread} unread` : ''}`} icon={Bell} onClick={toggle} aria-expanded={open} aria-haspopup="true" />
          {unread > 0 && <span className="pointer-events-none absolute right-[9px] top-[8px] size-2 rounded-full bg-terra ring-2 ring-canvas" aria-hidden />}
        </span>
      )}>
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-serif text-[18px]">Notifications</span>
            <button type="button" className="text-[12.5px] text-terra hover:underline" onClick={() => setItems(items.map((n) => ({ ...n, unread: false })))}>Mark all read</button>
          </div>
          <ul className="max-h-[360px] overflow-y-auto">
            {items.map((n) => (
              <li key={n.id} className="border-b border-line last:border-0">
                <button type="button" onClick={() => { setItems(items.map((x) => (x.id === n.id ? { ...x, unread: false } : x))); onNavigate(n.target); close(); }}
                  className="flex w-full gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-soft/60">
                  <span className={cx('mt-1.5 size-1.5 shrink-0 rounded-full', n.unread ? 'bg-terra' : 'bg-transparent')} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2"><Tag category={n.category} /><span className="font-mono text-[11px] text-faint">{n.time}</span>{n.unread && <span className="sr-only">unread</span>}</span>
                    <span className="mt-1.5 block text-[13.5px] font-medium text-ink">{n.title}</span>
                    <span className="block text-[12.5px] text-muted">{n.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-line px-4 py-2.5">
            <button type="button" className="text-[12.5px] text-muted hover:text-ink" onClick={() => { onNavigate('activity'); close(); }}>View all activity →</button>
          </div>
        </div>
      )}
    </Dropdown>
  );
}

export function TopBar({ current, data, onOpenPalette, onOpenDrawer, onNavigate, onToast }: { current: Screen; data: MockData; onOpenPalette: () => void; onOpenDrawer: () => void; onNavigate: (s: Screen) => void; onToast: (m: string) => void }) {
  const [items, setItems] = useState(data.notifications);
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-canvas px-3 md:px-8">
      <IconButton label="Open navigation" icon={Menu} onClick={onOpenDrawer} className="md:hidden" />
      <span className="font-serif text-[19px] md:hidden">AI Job Finder</span>
      <nav aria-label="Breadcrumb" className="hidden md:block">
        <ol className="flex items-center gap-2 text-[13.5px]">
          <li className="text-muted">Workspace</li>
          <li aria-hidden className="text-faint">/</li>
          <li aria-current="page" className="text-ink">{SCREEN_LABEL[current]}</li>
        </ol>
      </nav>
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <button type="button" onClick={onOpenPalette} aria-label="Search or run a command (Command K)"
          className="hidden h-9 w-[260px] items-center gap-2 rounded-full border border-line bg-white px-3.5 text-[13.5px] text-faint shadow-pill transition-colors duration-150 hover:border-[#D6CEC0] md:flex lg:w-[320px]">
          <Search className="size-4" aria-hidden />
          <span className="flex-1 truncate text-left">Search jobs, pages, actions…</span>
          <Kbd>⌘K</Kbd>
        </button>
        <IconButton label="Search" icon={Search} onClick={onOpenPalette} className="md:hidden" />
        <Notifications items={items} setItems={setItems} onNavigate={onNavigate} />
        <Dropdown align="right" panelClassName="w-64"
          button={({ open, toggle }) => (
            <button type="button" onClick={toggle} aria-expanded={open} aria-haspopup="menu" aria-label="Account menu"
              className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 transition-colors duration-150 hover:bg-soft">
              <Avatar name={data.user.name} size={30} />
              <ChevronDown className="hidden size-3.5 text-muted md:block" aria-hidden />
            </button>
          )}>
          {(close) => (
            <div role="menu">
              <div className="border-b border-line px-2.5 pb-2.5 pt-1.5">
                <div className="text-[13.5px] font-medium">{data.user.name}</div>
                <div className="truncate text-[12px] text-muted">{data.user.email}</div>
              </div>
              <div className="pt-1.5">
                <MenuItem icon={User} onClick={() => { onNavigate('settings'); close(); }}>Profile and settings</MenuItem>
                <MenuItem icon={Keyboard} onClick={() => { onToast('Tip: press ⌘K (Ctrl K) anywhere to open the command palette'); close(); }} hint={<Kbd>⌘K</Kbd>}>Shortcuts</MenuItem>
                <MenuItem icon={Globe} onClick={() => { onNavigate('landing'); close(); }}>View landing page</MenuItem>
                <MenuItem icon={LogOut} onClick={() => { onNavigate('login'); close(); }}>Sign out</MenuItem>
              </div>
            </div>
          )}
        </Dropdown>
      </div>
    </header>
  );
}

export function MobileTabBar({ current, onNavigate, onMore }: { current: Screen; onNavigate: (s: Screen) => void; onMore: () => void }) {
  const tabs: { id: Screen | 'more'; label: string; icon: LucideIcon }[] = [
    { id: 'overview', label: 'Home', icon: House },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applications', label: 'Apply', icon: Send },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'more', label: 'More', icon: Ellipsis },
  ];
  const primary: Screen[] = ['overview', 'jobs', 'applications', 'resume'];
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-side pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = t.id === 'more' ? !primary.includes(current) : current === t.id;
          return (
            <li key={t.id}>
              <button type="button" onClick={() => (t.id === 'more' ? onMore() : onNavigate(t.id))} aria-current={active && t.id !== 'more' ? 'page' : undefined}
                className={cx('relative flex w-full flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] transition-colors duration-150', active ? 'text-ink' : 'text-faint hover:text-ink')}>
                <t.icon className="size-5" aria-hidden />
                <span className={active ? 'font-medium' : ''}>{t.label}</span>
                {active && <span className="absolute top-1 size-1 rounded-full bg-terra" aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
