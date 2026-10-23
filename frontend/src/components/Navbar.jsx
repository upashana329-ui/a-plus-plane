import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, Shield, Smartphone } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import Button from './ui/Button';

export default function Navbar({ onMenuToggle, showMenuButton = false }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate(ROUTES.home, { replace: true });
    logout();
  };

  const handleOpenInstallModal = () => {
    window.dispatchEvent(new CustomEvent('open-pwa-install-modal'));
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <button
              type="button"
              onClick={onMenuToggle}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <Logo to={isAuthenticated ? (isAdmin ? ROUTES.adminDashboard : ROUTES.studentDashboard) : ROUTES.home} />
        </div>

        <nav className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button */}
          <button
            type="button"
            onClick={handleOpenInstallModal}
            className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50/70 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 hover:text-brand-800 transition"
            title="Install A+ Plane on Android"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-900">{user?.name}</span>
                <span className="text-xs text-slate-500">
                  {isAdmin ? 'Administrator' : `${user?.studentId} · ${user?.course || 'Student'}`}
                </span>
              </span>

              {isAdmin ? (
                <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                  <Shield className="h-3.5 w-3.5" /> Admin
                </span>
              ) : (
                <Link
                  to={ROUTES.profile}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 hover:ring-2 hover:ring-brand-500"
                  title="My Profile"
                >
                  <User className="h-4 w-4" />
                </Link>
              )}

              <Button
                variant="outline"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                className="hidden sm:inline-flex"
              >
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={ROUTES.login}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link
                to={ROUTES.register}
                className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-700"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
