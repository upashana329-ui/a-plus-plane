import { Info } from 'lucide-react';
import { API_AVAILABILITY } from '../utils/constants';

export default function DemoBanner({ title, children }) {
  // If the backend APIs are live and active, suppress fake demo warnings
  if (API_AVAILABILITY.complaints && API_AVAILABILITY.admin) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <Info className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        {title && <p className="font-semibold text-amber-950">{title}</p>}
        <div className="text-xs leading-relaxed text-amber-800">{children}</div>
      </div>
    </div>
  );
}