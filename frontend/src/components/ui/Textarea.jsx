import { forwardRef, useId } from 'react';

import { FieldLabel, FieldMessages, fieldClasses } from './Input';

// Pass maxLength and value to get a live character counter (showCount).
const Textarea = forwardRef(function Textarea(
  { label, error, hint, required = false, showCount = false, id, className, rows = 5, ...rest },
  ref,
) {
  const autoId = useId();
  const textareaId = id || autoId;
  const errorId = `${textareaId}-error`;
  const hintId = `${textareaId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  const length = String(rest.value ?? '').length;

  return (
    <div className={className}>
      {label && (
        <FieldLabel htmlFor={textareaId} required={required}>
          {label}
        </FieldLabel>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-required={required || undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={fieldClasses(Boolean(error), 'resize-y')}
        {...rest}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <FieldMessages error={error} hint={hint} errorId={errorId} hintId={hintId} />
        </div>
        {showCount && rest.maxLength && (
          <p className="mt-1.5 shrink-0 text-xs text-slate-500" aria-hidden="true">
            {length}/{rest.maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

export default Textarea;