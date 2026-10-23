import { Loader2 } from 'lucide-react';

import { cn } from '../../utils/cn';

const SIZES = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export default function Spinner({ size = 'md', className }) {
  return <Loader2 className={cn('animate-spin text-brand-600', SIZES[size], className)} aria-hidden="true" />;
}

// A centred loading block for whole pages or cards.
export function PageSpinner({ label = 'Loading…', className }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 py-16 text-slate-500', className)}
    >
      <Spinner size="lg" />
      <p className="text-sm">{label}</p>
    </div>
  );
}