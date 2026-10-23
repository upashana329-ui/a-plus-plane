import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

import { FieldLabel, FieldMessages, fieldClasses } from './Input';

// options can be plain values ['A', 'B'] or objects [{ value: 'a', label: 'Option A' }].
// Note: a native <select> always gives back a STRING (even for numbers).
const Select = forwardRef(function Select(
  { label, error, hint, required = false, options = [], placeholder, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id || autoId;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={className}>
      {label && (
        <FieldLabel htmlFor={selectId} required={required}>
          {label}
        </FieldLabel>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-required={required || undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={fieldClasses(Boolean(error), 'appearance-none pr-10')}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => {
            const value = typeof option === 'object' ? option.value : option;
            const text = typeof option === 'object' ? option.label : option;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>

      <FieldMessages error={error} hint={hint} errorId={errorId} hintId={hintId} />
    </div>
  );
});

export default Select;