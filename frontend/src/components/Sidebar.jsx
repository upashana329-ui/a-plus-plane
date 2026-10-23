import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  User,
  Bus,
  Home,
  Compass,
  BookOpen,
  ShieldAlert,
  Bot,
  LogOut,
  ShieldCheck,
  Smartphone,
  Download,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/cn';
import Button from './ui/Button';

export const STUDENT_MENU = [
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

export const ADMIN_MENU = [
  { to: ROUTES.adminDashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.adminComplaints, label: 'Manage Complaints', icon: ClipboardList },
  { to: ROUTES.bus, label: 'Bus Transit', icon: Bus },
  { to: ROUTES.hostel, label: 'Hostel Requests', icon: Home },
  { to: ROUTES.lostFound, label: 'Lost & Found', icon: Compass },
  { to: ROUTES.subjects, label: 'Academic Subjects', icon: BookOpen },
  { to: ROUTES.herVoice, label: 'Her Voice Reports', icon: ShieldAlert },
];

export default function Sidebar({ onNavigate }) {
  const { user, isAdmin, logout } = useAuth();
  const items = isAdmin ? ADMIN_MENU : STUDENT_MENU;

  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-5">
        <Logo to={isAdmin ? ROUTES.adminDashboard : ROUTES.studentDashboard} showTagline={false} />
      </div>

      <nav aria-label="Portal navigation" className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 flex items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {isAdmin ? <ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> : null}
          {isAdmin ? 'Admin Console' : 'Student Portal'}
        </p>

        <ul className="space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-4">
        {/* PWA Mobile App Install Card */}
        <div className="mb-3 rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-indigo-50/50 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900">Install Mobile App</p>
              <p className="text-[11px] text-slate-500">Android PWA Support</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install-modal'))}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700 shadow-xs ring-1 ring-brand-200 hover:bg-brand-50 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Add to Home Screen
          </button>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 font-bold text-brand-700">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
            <p className="truncate text-xs text-slate-500">
              {isAdmin ? 'Administrator' : user?.studentId}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" fullWidth icon={LogOut} onClick={logout}>
          Log out
        </Button>
      </div>
    </aside>
  );
}
