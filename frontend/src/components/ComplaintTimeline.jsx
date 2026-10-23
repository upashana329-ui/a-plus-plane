import { CheckCircle2, Clock, FilePlus, UserCheck, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../utils/format';
import { StatusBadge } from './ui/Badge';
import { cn } from '../utils/cn';

export default function ComplaintTimeline({ items = [], complaint = null }) {
  // If items are passed, use them; otherwise construct from complaint data
  let timelineItems = Array.isArray(items) && items.length > 0 ? items : [];

  if (timelineItems.length === 0 && complaint) {
    timelineItems = [
      {
        title: 'Grievance Submitted',
        description: 'Ticket registered successfully in campus grievance system.',
        date: complaint.createdAt,
        status: 'SUBMITTED',
      },
    ];

    if (complaint.assignedTo) {
      timelineItems.push({
        title: 'Officer Assigned',
        description: `Assigned to ${complaint.assignedTo} for review and resolution.`,
        date: complaint.updatedAt,
        status: complaint.status,
      });
    }

    if (complaint.status && complaint.status !== 'SUBMITTED') {
      timelineItems.push({
        title: `Status: ${complaint.status}`,
        description: complaint.resolutionNote || 'Administrative status updated.',
        date: complaint.updatedAt,
        status: complaint.status,
      });
    }
  }

  if (timelineItems.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-slate-500">
        No status transitions recorded yet.
      </p>
    );
  }

  return (
    <ol className="relative ml-2 space-y-6 border-l-2 border-slate-200">
      {timelineItems.map((event, index) => {
        const isLast = index === timelineItems.length - 1;

        return (
          <li key={index} className="ml-6">
            <span
              className={cn(
                'absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white',
                isLast ? 'bg-brand-600 text-white' : 'bg-slate-300 text-slate-700'
              )}
            >
              <Clock className="h-3 w-3" />
            </span>

            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <h4 className="text-sm font-semibold text-slate-900">{event.title || event.status}</h4>
              {event.date && (
                <time className="text-[11px] text-slate-500">
                  {formatDateTime(event.date)}
                </time>
              )}
            </div>

            {event.status && (
              <div className="mt-1">
                <StatusBadge status={event.status} className="text-[11px]" />
              </div>
            )}

            {event.description && (
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                {event.description}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}