import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '../../utils/cn';

// ----- Shared helpers (Select.jsx and Textarea.jsx reuse these) -----
export function fieldClasses(hasError, extra) {
  return cn(
    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors',
    'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
    hasError
      ? 'border-red-400 focus:border-red-500'
      : 'border-slate-300 hover:border-slate-400 focus:border-brand-500',
    extra,
  );
}

export function FieldLabel({ htmlFor, required, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {required && (
        <span className="ml-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

export function FieldMessages({ error, hint, errorId, hintId }) {
  if (error) {
    return (
      <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={hintId} className="mt-1.5 text-xs text-slate-500">
        {hint}
      </p>
    );
  }
  return null;
}

// ----- Input -----
// Props: label, error, hint, required (visual * and aria-required), icon, type, id, className, ...input props.
// Password inputs automatically get a "show / hide password" button.
const Input = forwardRef(function Input(
  { label, error, hint, required = false, icon: Icon, type = 'text', id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={className}>
      {label && (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        )}

        <input
          ref={ref}
          id={inputId}
          type={actualType}
          aria-required={required || undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={fieldClasses(Boolean(error), cn(Icon && 'pl-10', isPassword && 'pr-11'))}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      <FieldMessages error={error} hint={hint} errorId={errorId} hintId={hintId} />
    </div>
  );
});

export default Input;