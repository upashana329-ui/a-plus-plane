import { Link } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';
import { APP_NAME } from '../utils/constants';

export default function Logo({ to = '/', showTagline = true, className }) {
  const content = (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-sky-400 text-white shadow-md shadow-brand-500/20 ring-1 ring-white/30">
        <Compass className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
          <Sparkles className="h-2.5 w-2.5 text-white" />
        </span>
      </div>

      <div className="flex flex-col leading-none">
        <span className="flex items-center gap-1.5 text-lg font-black tracking-tight text-slate-900">
          <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-sm font-extrabold text-brand-700 ring-1 ring-inset ring-brand-700/20">
            A+
          </span>
          <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Plane
          </span>
        </span>
        {showTagline && (
          <span className="mt-1 text-[10px] font-medium tracking-wide uppercase text-slate-500">
            Campus Services & Grievance
          </span>
        )}
      </div>
    </div>
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} className="group inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
      {content}
    </Link>
  );
}