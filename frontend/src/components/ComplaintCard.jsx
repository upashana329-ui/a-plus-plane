import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import Card from './ui/Card';
import { StatusBadge, PriorityBadge } from './ui/Badge';
import { formatDate } from '../utils/format';
import { ROUTES } from '../utils/constants';

export default function ComplaintCard({ complaint }) {
  if (!complaint) return null;

  return (
    <Card className="group transition-all duration-200 hover:border-brand-300 hover:shadow-md">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
            {complaint.ticketId}
          </span>
          <div className="flex items-center gap-2">
            {complaint.priority && <PriorityBadge priority={complaint.priority} />}
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <Link
          to={ROUTES.complaintDetails(complaint.id || complaint.ticketId)}
          className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors"
        >
          {complaint.title}
        </Link>

        {complaint.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
            {complaint.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              {complaint.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {formatDate(complaint.createdAt)}
            </span>
          </div>

          <Link
            to={ROUTES.complaintDetails(complaint.id || complaint.ticketId)}
            className="inline-flex items-center gap-1 font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform"
          >
            Details <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
