import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

import { buttonStyles } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ROUTES } from '../utils/constants';
import { getDashboardPath } from '../utils/navigation';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </span>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-brand-600">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">We can’t find that page</h1>
        <p className="mt-3 text-slate-600">
          The link may be broken, or the page may have been moved. Let’s get you back on track.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={ROUTES.home} className={buttonStyles({ size: 'lg' })}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Return home
          </Link>
          {isAuthenticated && (
            <Link to={getDashboardPath(isAdmin)} className={buttonStyles({ variant: 'outline', size: 'lg' })}>
              Go to dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}