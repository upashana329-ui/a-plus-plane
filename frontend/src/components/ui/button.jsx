import { Loader2 } from 'lucide-react';

import { cn } from '../../utils/cn';

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  outline: 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  light: 'bg-white text-brand-700 shadow-sm hover:bg-brand-50', // for dark blue backgrounds
  outlineLight: 'border border-white/50 text-white hover:bg-white/10', // for dark blue backgrounds
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

// Returns the button classes as a string. Use it to make a <Link> look like a button:
//   <Link to="/login" className={buttonStyles({ variant: 'outline' })}>Log in</Link>
export function buttonStyles({ variant = 'primary', size = 'md', fullWidth = false, className = '' } = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  className,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="h-4 w-4" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}
