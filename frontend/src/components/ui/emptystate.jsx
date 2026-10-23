import { Inbox } from 'lucide-react';

import { cn } from '../../utils/cn';

// icon: a Lucide icon component. action: any React node, such as a button or link.
export default function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-4 py-12 text-center', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}