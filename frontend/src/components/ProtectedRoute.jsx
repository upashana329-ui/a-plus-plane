import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES, ROUTES } from '../utils/constants';
import { getDashboardPath, getSafeRedirect } from '../utils/navigation';

// Wraps pages that need a logged-in user: <ProtectedRoute role={ROLES.STUDENT} /> or role={ROLES.ADMIN}
export default function ProtectedRoute({ role = ROLES.STUDENT }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const loginPath = role === ROLES.ADMIN ? ROUTES.adminLogin : ROUTES.login;
    return <Navigate to={loginPath} replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  // Logged in, but in the wrong area: send them to their own dashboard.
  if (role === ROLES.ADMIN && !isAdmin) return <Navigate to={ROUTES.studentDashboard} replace />;
  if (role === ROLES.STUDENT && isAdmin) return <Navigate to={ROUTES.adminDashboard} replace />;

  return <Outlet />;
}

// Wraps login, register and admin-login pages for unauthenticated visitors.
export function GuestRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const destination = getSafeRedirect(location.state?.from, isAdmin) || getDashboardPath(isAdmin);
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
