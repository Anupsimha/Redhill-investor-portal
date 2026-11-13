import { ReactNode, useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, ChevronDown, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import Logo from './Logo';
import { User } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  sidebarContent?: (closeMenu: () => void) => ReactNode;
  children: ReactNode;
}

/**
 * Investor navigation. Every destination maps to an existing route
 * (/dashboard, /explore) or to a section rendered on the dashboard.
 */
const INVESTOR_NAV = [
  { label: 'Dashboard', to: '/dashboard', hash: '' },
  { label: 'My Investments', to: '/dashboard', hash: '#investments' },
  { label: 'Projects', to: '/explore', hash: '' },
  { label: 'Ledger', to: '/dashboard', hash: '#ledger' },
  { label: 'Support', to: '/dashboard', hash: '#support' },
];

export default function Layout({ user, onLogout, sidebarContent, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname, location.hash]);

  // Profile menu: close on outside click / Escape
  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setProfileOpen(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  // Mobile drawer: Escape closes, background scroll locked
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileMenuOpen]);

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map(p => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const displayName = user?.name || user?.email || 'User';
  const displayRole = (user?.role || 'User').replace(/_/g, ' ');
  const isInvestor = user?.role === 'investor';

  const isActive = (item: typeof INVESTOR_NAV[number]) => {
    if (item.to !== location.pathname) {
      // Project dossiers belong to "My Investments"
      return item.hash === '#investments' && location.pathname.startsWith('/project/');
    }
    if (item.to === '/dashboard') return (location.hash || '') === item.hash;
    return true;
  };

  const drawerTransition = { duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] as const };

  const ProfileBlock = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex items-center gap-3 min-w-0">
      <div className={`${compact ? 'w-9 h-9' : 'w-10 h-10'} rounded-full bg-redhill-charcoal text-white flex items-center justify-center text-xs font-semibold tracking-wide shrink-0`}>
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-redhill-charcoal truncate">{displayName}</p>
        <p className="text-[10px] text-redhill-gold uppercase tracking-[0.18em] truncate mt-0.5">{displayRole}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-redhill-ivory text-redhill-charcoal flex flex-col md:flex-row relative">
      {/* ================================================================= */}
      {/* ADMIN: light operations sidebar                                    */}
      {/* ================================================================= */}
      {sidebarContent && (
        <>
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center justify-between px-5 h-16 bg-white/95 backdrop-blur-md border-b border-redhill-line sticky top-0 z-40">
            <Logo />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="portal-nav-drawer"
              className="w-11 h-11 inline-flex items-center justify-center rounded-md text-redhill-charcoal hover:bg-redhill-sand transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <aside className="hidden md:flex w-[272px] bg-white border-r border-redhill-line flex-col sticky top-0 h-screen flex-shrink-0 z-30">
            <div className="h-20 px-6 border-b border-redhill-line flex items-center">
              <Logo />
            </div>
            <div className="px-6 pt-5 pb-2">
              <p className="eyebrow text-redhill-muted">Operations Console</p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {sidebarContent(() => {})}
            </div>
            <div className="p-4 border-t border-redhill-line flex items-center justify-between gap-3">
              <ProfileBlock compact />
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-md text-redhill-muted hover:text-redhill-red hover:bg-redhill-sand transition-colors flex-shrink-0 cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ================================================================= */}
      {/* MAIN COLUMN                                                        */}
      {/* ================================================================= */}
      <main className="flex-1 flex flex-col min-h-screen relative min-w-0">
        {!sidebarContent && (
          <header className="bg-white/95 backdrop-blur-md border-b border-redhill-line sticky top-0 z-40">
            <div className="page-container h-16 md:h-[76px] grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
              <Link to={isInvestor ? '/dashboard' : '/admin'} aria-label="Redhill Infra — portal home" className="justify-self-start shrink-0">
                <Logo />
              </Link>

              {/* Desktop navigation */}
              {isInvestor ? (
                <nav aria-label="Investor" className="hidden lg:flex items-center justify-center gap-7 xl:gap-9 justify-self-center">
                  {INVESTOR_NAV.map(item => {
                    const active = isActive(item);
                    return (
                      <Link
                        key={item.label}
                        to={`${item.to}${item.hash}`}
                        aria-current={active ? 'page' : undefined}
                        className={`nav-link text-[13px] tracking-[0.06em] whitespace-nowrap transition-colors duration-300 ${
                          active ? 'text-redhill-charcoal font-semibold' : 'text-redhill-muted hover:text-redhill-charcoal'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              ) : (
                <Link
                  to="/admin"
                  className="hidden lg:inline-flex items-center justify-center gap-2 text-[13px] text-redhill-muted hover:text-redhill-charcoal transition-colors justify-self-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Operations Console
                </Link>
              )}

              <div className="flex items-center justify-end gap-2 justify-self-end">
                {/* Profile menu */}
                <div ref={profileRef} className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(o => !o)}
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    className="btn-press flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-full border border-redhill-line hover:border-redhill-stone bg-white cursor-pointer"
                  >
                    <span className="w-8 h-8 rounded-full bg-redhill-charcoal text-white flex items-center justify-center text-[11px] font-semibold tracking-wide">
                      {initials}
                    </span>
                    <span className="text-left hidden xl:block">
                      <span className="block text-xs font-medium text-redhill-charcoal leading-none">{displayName}</span>
                      <span className="block text-[10px] text-redhill-gold uppercase tracking-[0.16em] mt-1">{displayRole}</span>
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-redhill-muted transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 mt-2 w-72 bg-white border border-redhill-line rounded-lg shadow-[0_24px_48px_-24px_rgba(29,30,34,0.35)] overflow-hidden"
                      >
                        <div className="p-4 border-b border-redhill-line">
                          <ProfileBlock />
                          <dl className="mt-4 space-y-1.5 text-xs">
                            <div className="flex justify-between gap-3">
                              <dt className="text-redhill-muted">Email</dt>
                              <dd className="text-redhill-charcoal truncate">{user.email}</dd>
                            </div>
                            {user.login_id && (
                              <div className="flex justify-between gap-3">
                                <dt className="text-redhill-muted">Login ID</dt>
                                <dd className="text-redhill-charcoal font-mono">{user.login_id}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                        <div className="px-4 py-3 flex items-center gap-2 text-[11px] text-redhill-muted bg-redhill-ivory">
                          <ShieldCheck className="w-3.5 h-3.5 text-redhill-gold" />
                          Authenticated investor session
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={onLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-redhill-charcoal hover:bg-redhill-sand hover:text-redhill-red transition-colors border-t border-redhill-line cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile menu trigger */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="portal-nav-drawer"
                  className={`${isInvestor ? 'lg:hidden' : 'md:hidden'} w-11 h-11 inline-flex items-center justify-center rounded-md text-redhill-charcoal hover:bg-redhill-sand transition-colors cursor-pointer`}
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Page Children */}
        <div className="flex-1 w-full min-w-0">
          {children}
        </div>

        {!sidebarContent && (
          <footer className="border-t border-redhill-line bg-white">
            <div className="page-container py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-redhill-muted">
              <span>© {new Date().getFullYear()} Redhill Infrastructure Pvt Ltd · Bengaluru</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-redhill-gold" />Private investor portal</span>
            </div>
          </footer>
        )}
      </main>

      {/* ================================================================= */}
      {/* MOBILE / TABLET DRAWER (investor + admin)                          */}
      {/* ================================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div id="portal-nav-drawer" role="dialog" aria-modal="true" aria-label="Portal navigation" className="fixed inset-0 z-50 flex">
            <motion.div
              className="fixed inset-0 bg-redhill-ink/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="relative flex flex-col w-[86%] max-w-sm h-full bg-white border-r border-redhill-line shadow-2xl"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={drawerTransition}
            >
              <div className="h-16 px-5 border-b border-redhill-line flex justify-between items-center">
                <Logo />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  autoFocus
                  className="w-11 h-11 inline-flex items-center justify-center rounded-md text-redhill-charcoal hover:bg-redhill-sand transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {sidebarContent ? sidebarContent(() => setMobileMenuOpen(false)) : isInvestor ? (
                  <nav aria-label="Investor mobile" className="flex flex-col px-2 pt-2">
                    {INVESTOR_NAV.map((item, i) => {
                      const active = isActive(item);
                      return (
                        <Link
                          key={item.label}
                          to={`${item.to}${item.hash}`}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-current={active ? 'page' : undefined}
                          className={`min-h-[56px] flex items-center gap-4 border-b border-redhill-line font-serif text-lg transition-colors ${
                            active ? 'text-redhill-charcoal' : 'text-redhill-muted hover:text-redhill-charcoal'
                          }`}
                        >
                          <span className="font-sans text-[11px] tracking-[0.2em] text-redhill-gold w-6">0{i + 1}</span>
                          {item.label}
                          {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-redhill-red" />}
                        </Link>
                      );
                    })}
                  </nav>
                ) : (
                  <Link to="/admin" className="flex items-center gap-2 px-3 py-3 text-sm text-redhill-charcoal">
                    <ArrowLeft className="w-4 h-4" /> Back to Operations Console
                  </Link>
                )}
              </div>

              <div className="p-4 border-t border-redhill-line flex items-center justify-between gap-3 bg-redhill-ivory">
                <ProfileBlock compact />
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-redhill-charcoal hover:text-redhill-red hover:bg-white border border-redhill-line transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
