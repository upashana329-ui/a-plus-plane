import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X,
  Bus,
  Home,
  Compass,
  BookOpen,
  ShieldAlert,
  Bot,
} from 'lucide-react';

import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { cn } from '../utils/cn';
import { ROUTES } from '../utils/constants';
import { getInitials } from '../utils/format';
import { getDashboardPath } from '../utils/navigation';

const STUDENT_NAV = [
  { to: ROUTES.studentDashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.raiseGrievance, label: 'Raise Grievance', icon: FilePlus2 },
  { to: ROUTES.myComplaints, label: 'My Complaints', icon: ClipboardList },
  { to: ROUTES.bus, label: 'Bus Transit', icon: Bus },
  { to: ROUTES.hostel, label: 'Hostel Portal', icon: Home },
  { to: ROUTES.lostFound, label: 'Lost & Found', icon: Compass },
  { to: ROUTES.subjects, label: 'Academics', icon: BookOpen },
  { to: ROUTES.herVoice, label: 'Her Voice (Safety)', icon: ShieldAlert },
  { to: ROUTES.voiceAssistant, label: 'Campus AI Bot', icon: Bot },
  { to: ROUTES.profile, label: 'Profile', icon: User },
];

const ADMIN_NAV = [
  { to: ROUTES.adminDashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.adminComplaints, label: 'Manage Complaints', icon: ClipboardList },
  { to: ROUTES.bus, label: 'Bus Transit', icon: Bus },
  { to: ROUTES.hostel, label: 'Hostel Requests', icon: Home },
  { to: ROUTES.lostFound, label: 'Lost & Found', icon: Compass },
  { to: ROUTES.subjects, label: 'Academic Subjects', icon: BookOpen },
  { to: ROUTES.herVoice, label: 'Her Voice Reports', icon: ShieldAlert },
];

// The sidebar content is shared by the desktop sidebar and the mobile drawer.
function SidebarContent({ student, isAdmin, onNavigate, onLogout }) {
  const items = isAdmin ? ADMIN_NAV : STUDENT_NAV;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-5">
        <Logo to={getDashboardPath(isAdmin)} showTagline={false} />
      </div>

      <nav aria-label={isAdmin ? 'Admin navigation' : 'Student navigation'} className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 flex items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {isAdmin && <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}
          {isAdmin ? 'Admin console' : 'Student portal'}
        </p>
        <ul className="space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
            aria-hidden="true"
          >
            {getInitials(student?.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{student?.name}</p>
            <p className="truncate text-xs text-slate-500">
              {isAdmin ? 'Administrator' : student?.studentId}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" fullWidth icon={LogOut} onClick={onLogout}>
          Log out
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { student, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    // Go home first so the protected page does not bounce to the login page.
    navigate(ROUTES.home, { replace: true });
    logout();
    toast.info('You have been logged out.');
  };

  // Mobile drawer: Escape closes it, the page behind stops scrolling,
  // focus moves into the drawer and returns to the menu button afterwards.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const menuButton = menuButtonRef.current;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      menuButton?.focus();
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-slate-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-700 focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <SidebarContent student={student} isAdmin={isAdmin} onLogout={handleLogout} />
      </aside>

      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <Logo to={getDashboardPath(isAdmin)} showTagline={false} />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl px-4 py-6 focus:outline-hidden sm:px-6 lg:px-8 lg:py-8"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" aria-hidden="true" onMouseDown={closeMenu} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMenu}
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <SidebarContent
              student={student}
              isAdmin={isAdmin}
              onNavigate={closeMenu}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}
    </div>
  );
}