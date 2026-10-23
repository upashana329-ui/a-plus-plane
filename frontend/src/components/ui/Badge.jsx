import { cn } from '../../utils/cn';
import { COMPLAINT_STATUS } from '../../utils/constants';

const TONES = {
  neutral: { box: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
  blue: { box: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-500' },
  green: { box: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  amber: { box: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  red: { box: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
  purple: { box: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
};

export default function Badge({ tone = 'neutral', dot = false, className, children }) {
  const styles = TONES[tone] || TONES.neutral;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        styles.box,
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} aria-hidden="true" />}
      {children}
    </span>
  );
}

// The text label is always shown, so meaning never depends on colour alone.
const STATUS_TONES = {
  [COMPLAINT_STATUS.SUBMITTED]: 'blue',
  [COMPLAINT_STATUS.UNDER_REVIEW]: 'amber',
  [COMPLAINT_STATUS.IN_PROGRESS]: 'purple',
  [COMPLAINT_STATUS.RESOLVED]: 'green',
  [COMPLAINT_STATUS.REJECTED]: 'red',
};

export function StatusBadge({ status, className }) {
  return (
    <Badge tone={STATUS_TONES[status] || 'neutral'} dot className={className}>
      {status}
    </Badge>
  );
}

const PRIORITY_TONES = { Low: 'neutral', Medium: 'amber', High: 'red' };

export function PriorityBadge({ priority, className }) {
  if (!priority) return null;
  return (
    <Badge tone={PRIORITY_TONES[priority] || 'neutral'} className={className}>
      {priority} priority
    </Badge>
  );
}