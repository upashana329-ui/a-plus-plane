import { Link } from 'react-router-dom';
import Card from './ui/Card';

// The centred card used by Login, Register and Admin Login pages.
export default function AuthShell({ icon: Icon, title, subtitle, children, footer, wide = false }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-brand-50/60 px-4 py-10 sm:py-14">
      <div className={wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
        <Card className="sm:p-8">
          <div className="mb-6 text-center">
            {Icon && (
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
            )}
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
          </div>

          {children}
        </Card>

        {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
      </div>
    </div>
  );
}

// A styled in-text link, used inside the footer prop.
export function AuthLink({ to, children }) {
  return (
    <Link to={to} className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
      {children}
    </Link>
  );
}
