import { cn } from '../utils/cn';
import Card from './ui/Card';
import Spinner from './ui/Spinner';

const TONES = {
  blue: {
    iconBg: 'bg-brand-50 text-brand-600',
    highlight: 'text-brand-700',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600',
    highlight: 'text-amber-700',
  },
  purple: {
    iconBg: 'bg-violet-50 text-violet-600',
    highlight: 'text-violet-700',
  },
  green: {
    iconBg: 'bg-emerald-50 text-emerald-600',
    highlight: 'text-emerald-700',
  },
  red: {
    iconBg: 'bg-rose-50 text-rose-600',
    highlight: 'text-rose-700',
  },
  neutral: {
    iconBg: 'bg-slate-100 text-slate-600',
    highlight: 'text-slate-800',
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'blue',
  helper,
  loading = false,
  className,
}) {
  const styles = TONES[tone] || TONES.blue;

  return (
    <Card className={cn('relative overflow-hidden p-5 transition-all hover:border-slate-300', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <Spinner size="sm" className="my-1.5" />
            ) : (
              <span className={cn('text-2xl font-extrabold tracking-tight', styles.highlight)}>
                {typeof value === 'number' ? value.toLocaleString() : value ?? '—'}
              </span>
            )}
          </div>
          {helper && <p className="mt-1 text-xs text-slate-500 truncate">{helper}</p>}
        </div>

        {Icon && (
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl p-2.5', styles.iconBg)}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
      </div>
    </Card>
  );
}