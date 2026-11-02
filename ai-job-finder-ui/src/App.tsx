import { useCallback, useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { MOCK, type DataState, type Screen } from './mock';
import type { NavParams } from './screens/types';
import { MobileDrawer, MobileTabBar, Sidebar, TopBar } from './components/Shell';
import { CommandPalette } from './components/CommandPalette';
import { DemoPill } from './components/DemoPill';
import { cx, useIsMobile } from './components/ui';
import { kanban } from './lib/derive';
import { Overview } from './screens/Overview';
import { Command } from './screens/Command';
import { Jobs } from './screens/Jobs';
import { Applications } from './screens/Applications';
import { ResumeStudio } from './screens/ResumeStudio';
import { Skills } from './screens/Skills';
import { Insights } from './screens/Insights';
import { InterviewPrep } from './screens/InterviewPrep';
import { Calendar } from './screens/Calendar';
import { Saved } from './screens/Saved';
import { ActivityScreen } from './screens/Activity';
import { Settings } from './screens/Settings';
import { Landing } from './screens/Landing';
import { Login, Onboarding, Signup } from './screens/Auth';

const OUTSIDE: Screen[] = ['landing', 'login', 'signup', 'onboarding'];
const FULL_HEIGHT: Screen[] = ['jobs', 'matches', 'command'];

export default function App() {
  const [screen, setScreen] = useState<Screen>('overview');
  const [dataState, setDataState] = useState<DataState>('ready');
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(MOCK.savedIds));
  const [focusJob, setFocusJob] = useState<string | null>(null);
  const [commandSeed, setCommandSeed] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const mainRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  const navigate = useCallback((s: Screen, p?: NavParams) => {
    setScreen(s);
    setFocusJob(p?.jobId ?? null);
    setCommandSeed(p?.query ?? null);
    setDrawerOpen(false);
    requestAnimationFrame(() => { mainRef.current?.scrollTo({ top: 0 }); window.scrollTo({ top: 0 }); });
  }, []);
  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);
  const retry = useCallback(() => {
    setDataState('loading');
    window.setTimeout(() => setDataState('ready'), 900);
  }, []);
  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen((o) => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const common = { data: MOCK, state: dataState, onNavigate: navigate, onToast: toast, onRetry: retry };
  const appCount = dataState === 'empty' ? 0 : Object.values(kanban(MOCK.applications)).reduce((a, b) => a + b, 0);

  const content = (() => {
    switch (screen) {
      case 'overview': return <Overview {...common} savedCount={savedIds.size} />;
      case 'command': return <Command {...common} seed={commandSeed} />;
      case 'jobs': return <Jobs {...common} mode="all" savedIds={savedIds} onToggleSave={toggleSave} focusJobId={focusJob} />;
      case 'matches': return <Jobs {...common} mode="matches" savedIds={savedIds} onToggleSave={toggleSave} focusJobId={focusJob} />;
      case 'saved': return <Saved {...common} savedIds={savedIds} onToggleSave={toggleSave} />;
      case 'skills': return <Skills {...common} />;
      case 'resume': return <ResumeStudio {...common} focusJobId={focusJob} />;
      case 'interview': return <InterviewPrep {...common} />;
      case 'insights': return <Insights {...common} />;
      case 'applications': return <Applications {...common} />;
      case 'calendar': return <Calendar {...common} />;
      case 'activity': return <ActivityScreen {...common} />;
      case 'settings': return <Settings {...common} />;
      case 'landing': return <Landing {...common} />;
      case 'login': return <Login {...common} />;
      case 'signup': return <Signup {...common} />;
      case 'onboarding': return <Onboarding {...common} />;
      default: return null;
    }
  })();

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
  const demo = <DemoPill screen={screen} state={dataState} onScreen={(s) => navigate(s)} onState={setDataState} />;

  const full = FULL_HEIGHT.includes(screen);
  const layout = OUTSIDE.includes(screen) ? (
    <div className="min-h-full bg-canvas">
      <div key={`${screen}-${dataState}`}>{content}</div>
    </div>
  ) : (
    <div className="flex h-[100dvh] overflow-hidden bg-canvas">
      <a href="#main" className="sr-only z-[100] rounded-full bg-btn px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <aside className="hidden h-full shrink-0 md:block"><Sidebar current={screen} onNavigate={navigate} data={MOCK} appCount={appCount} /></aside>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidebar current={screen} onNavigate={navigate} data={MOCK} appCount={appCount} onClose={() => setDrawerOpen(false)} />
      </MobileDrawer>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar current={screen} data={MOCK} onOpenPalette={() => setPaletteOpen(true)} onOpenDrawer={() => setDrawerOpen(true)} onNavigate={navigate} onToast={toast} />
        <main id="main" ref={mainRef} tabIndex={-1} className={cx('scroll-thin min-h-0 flex-1 outline-none', full ? 'overflow-y-auto md:overflow-hidden' : 'overflow-y-auto')}>
          <div key={`${screen}-${dataState}`} className={full ? 'pb-24 md:h-full md:pb-0' : 'mx-auto w-full max-w-[1280px] px-4 pb-28 pt-6 md:px-8 md:pb-16 md:pt-8 xl:px-10'}>
            {content}
          </div>
        </main>
      </div>
      {isMobile && <MobileTabBar current={screen} onNavigate={navigate} onMore={() => setDrawerOpen(true)} />}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} data={MOCK} onNavigate={navigate} onToast={toast} />
    </div>
  );

  return (
    <>
      {layout}
      {toastRegion}
      {demo}
    </>
  );
}
