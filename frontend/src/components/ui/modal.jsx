import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '../../utils/cn';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' };

// An accessible dialog:
// - Escape closes it (unless dismissible={false})
// - Tab stays inside the dialog
// - The page behind it cannot scroll
// - Focus returns to the button that opened it
// Put action buttons in the `footer` prop.
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Always call the latest onClose without re-running the focus effect.
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;

    const panel = panelRef.current;
    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape' && dismissible) {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const items = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, dismissible]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50"
        aria-hidden="true"
        onMouseDown={dismissible ? () => onCloseRef.current?.() : undefined}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-xl focus:outline-hidden sm:rounded-2xl',
          SIZES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={() => onCloseRef.current?.()}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {children && <div className="overflow-y-auto px-6 py-4">{children}</div>}

        {footer && (
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}