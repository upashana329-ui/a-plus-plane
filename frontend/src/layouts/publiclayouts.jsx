import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, X, Smartphone } from 'lucide-react';

import Logo from '../components/Logo';
import { buttonStyles } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME, ROUTES } from '../utils/constants';
import { getDashboardPath } from '../utils/navigation';

// The landing page must have elements with these ids (see Part 3).
const NAV_LINKS = [
  { to: '/#features', label: 'Features' },
  { to: '/#how-it-works', label: 'How it works' },
];

function AuthButtons({ onNavigate, stacked = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const layout = stacked ? 'w-full' : '';

  if (isAuthenticated) {
    return (
      <Link
        to={getDashboardPath(isAdmin)}
        onClick={onNavigate}
        className={buttonStyles({ variant: 'primary', size: 'sm', fullWidth: stacked, className: layout })}
      >
        Go to dashboard
      </Link>
    );
  }

  return (
    <>
      <Link
        to={ROUTES.login}
        onClick={onNavigate}
        className={buttonStyles({ variant: 'outline', size: 'sm', fullWidth: stacked, className: layout })}
      >
        Log in
      </Link>
      <Link
        to={ROUTES.register}
        onClick={onNavigate}
        className={buttonStyles({ variant: 'primary', size: 'sm', fullWidth: stacked, className: layout })}
      >
        Register
      </Link>
    </>
  );
}

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-700 focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-slate-600 hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install-modal'))}
              className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50/70 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
              title="Install A+ Plane on Android"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Install App</span>
            </button>
            <AuthButtons />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-nav" className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  window.dispatchEvent(new CustomEvent('open-pwa-install-modal'));
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 transition"
              >
                <Smartphone className="h-4 w-4" />
                Add to Android Home Screen
              </button>
              <AuthButtons onNavigate={closeMenu} stacked />
            </div>
          </div>
        )}
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-hidden">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <Logo to={null} />
            <p className="mt-3 max-w-sm text-sm text-slate-500">
              A simple, transparent way for students to raise grievances and follow their progress.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to={ROUTES.login} className="text-slate-600 hover:text-brand-700">
              Student login
            </Link>
            <Link to={ROUTES.register} className="text-slate-600 hover:text-brand-700">
              Register
            </Link>
            <Link to={ROUTES.adminLogin} className="text-slate-600 hover:text-brand-700">
              Admin login
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-100">
          <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
            © {new Date().getFullYear()} {APP_NAME}. A student-built project; complaint and admin screens
            currently show demo data.
          </p>
        </div>
      </footer>
    </div>
  );
}