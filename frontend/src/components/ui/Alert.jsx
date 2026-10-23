import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

import { cn } from '../../utils/cn';

const VARIANTS = {
  error: { box: 'border-red-200 bg-red-50 text-red-900', icon: 'text-red-600', Icon: AlertCircle, role: 'alert' },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: 'text-emerald-600', Icon: CheckCircle2, role: 'status' },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: 'text-amber-600', Icon: TriangleAlert, role: 'status' },
  info: { box: 'border-brand-200 bg-brand-50 text-brand-900', icon: 'text-brand-600', Icon: Info, role: 'status' },
};

export default function Alert({ variant = 'info', title, children, onDismiss, className }) {
  const { box, icon, Icon, role } = VARIANTS[variant];

  return (
    <div role={role} className={cn('flex items-start gap-3 rounded-xl border p-4', box, className)}>
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', icon)} aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-1')}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-0.5 opacity-60 hover:opacity-100"
          aria-label="Dismiss message"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}