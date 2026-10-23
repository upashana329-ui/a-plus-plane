import { cn } from '../../utils/cn';

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md/5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4', className)}>
      <div>
        {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ className, children }) {
  return <div className={cn('text-sm text-slate-700', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn('mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-4', className)}>
      {children}
    </div>
  );
}
