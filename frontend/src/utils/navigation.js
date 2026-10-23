import { ROUTES } from './constants';

// Where should this user land? Admins and students have different dashboards.
export function getDashboardPath(isAdmin) {
  return isAdmin ? ROUTES.adminDashboard : ROUTES.studentDashboard;
}

// After login, send the user back to the page they originally wanted,
// but ONLY if it belongs to their own area. This also blocks "open redirect"
// tricks such as "//evil.com" or "https://evil.com".
export function getSafeRedirect(from, isAdmin) {
  const fallback = getDashboardPath(isAdmin);

  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) {
    return fallback;
  }

  const path = from.split(/[?#]/)[0];
  const allowedPrefix = isAdmin ? '/admin/' : '/student/';

  if (!path.startsWith(allowedPrefix) || path === ROUTES.adminLogin) {
    return fallback;
  }
  return from;
}