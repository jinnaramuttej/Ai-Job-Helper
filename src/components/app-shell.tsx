'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';
import type { CurrentUser } from '@/lib/api';
import { Sidebar, TopBar, MobileDrawer, MobileTabBar } from './Shell';
import { CommandPalette } from './CommandPalette';
import { previewNotifications, previewJobs } from '@/lib/preview';
import { cx, useIsMobile } from './ui';

interface Toast {
  id: number;
  text: string;
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: CurrentUser | null;
}) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const mainRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  // Keyboard shortcut for CommandPalette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fullHeightPages = ['/jobs', '/recommended', '/command'];
  const full = fullHeightPages.includes(pathname);

  const toastRegion = (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 bottom-[124px] z-[95] flex flex-col items-center gap-2 px-4 md:bottom-6">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex max-w-[92vw] items-center gap-2 rounded-full bg-btn px-4 py-2.5 text-[13px] text-white shadow-pop">
          <Check className="size-4 shrink-0 text-[#7FD6B4]" aria-hidden />
          <span className="truncate">{t.text}</span>
        </div>
      ))}
    </div>
  );

  const userData = user ? { name: user.name, email: user.email } : undefined;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-canvas">
      <a href="#main" className="sr-only z-[100] rounded-full bg-btn px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>

      {/* Desktop Sidebar */}
      <aside className="hidden h-full shrink-0 md:block">
        <Sidebar user={userData} />
      </aside>

      {/* Mobile Drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidebar user={userData} onClose={() => setDrawerOpen(false)} />
      </MobileDrawer>

      {/* Content wrapper */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          user={userData}
          notifications={previewNotifications}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenDrawer={() => setDrawerOpen(true)}
          onToast={toast}
        />
        <main
          id="main"
          ref={mainRef}
          tabIndex={-1}
          className={cx('scroll-thin min-h-0 flex-1 outline-none', full ? 'overflow-y-auto md:overflow-hidden' : 'overflow-y-auto')}
        >
          <div className={full ? 'pb-24 md:h-full md:pb-0' : 'mx-auto w-full max-w-[1280px] px-4 pb-28 pt-6 md:px-8 md:pb-16 md:pt-8 xl:px-10'}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      {isMobile && <MobileTabBar onMore={() => setDrawerOpen(true)} />}

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        jobs={previewJobs}
        onToast={toast}
      />

      {toastRegion}
    </div>
  );
}
