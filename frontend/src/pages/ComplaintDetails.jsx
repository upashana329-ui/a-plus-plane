import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, SearchX } from 'lucide-react';

import ComplaintTimeline from '../components/ComplaintTimeline';
import DemoBanner from '../components/DemoBanner';
import Alert from '../components/ui/Alert';
import Badge, { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import Button, { buttonStyles } from '../components/ui/Button';
import Card, { CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getMyComplaint } from '../services/complaintService';
import { API_AVAILABILITY, ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/format';

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const { student } = useAuth();
  const studentId = student?.studentId;

  const [state, setState] = useState({ status: 'loading', complaint: null, error: '' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', complaint: null, error: '' });

    if (!studentId) {
      return;
    }

    getMyComplaint(studentId, id)
      .then((complaint) => {
        if (!cancelled) setState({ status: 'ready', complaint, error: '' });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', complaint: null, error: getErrorMessage(error, 'We could not load this complaint.') });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [studentId, id, reloadKey]);

  const { status, complaint, error } = state;
  useDocumentTitle(complaint ? `Complaint ${complaint.ticketId}` : 'Complaint details');

  const backLink = (
    <Link
      to={ROUTES.myComplaints}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to my complaints
    </Link>
  );

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        {backLink}
        <PageSpinner label="Loading complaint…" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-6">
        {backLink}
        <Card>
          <EmptyState
            icon={SearchX}
            title="We couldn’t open this complaint"
            description={error}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" icon={RefreshCw} onClick={() => setReloadKey((key) => key + 1)}>
                  Try again
                </Button>
                <Link to={ROUTES.myComplaints} className={buttonStyles()}>
                  View all complaints
                </Link>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {backLink}

      {complaint?.isDemo && !API_AVAILABILITY.complaints && (
        <DemoBanner>This complaint is demo data. It is not stored in the database.</DemoBanner>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">Ticket {complaint?.ticketId}</p>
          <h1 className="mt-1 break-words text-2xl font-bold text-slate-900">{complaint?.title}</h1>
        </div>
        {complaint && <StatusBadge status={complaint.status} className="text-sm" />}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Complaint information" />
            <dl className="grid gap-5 sm:grid-cols-2">
              <Detail label="Ticket ID">{complaint?.ticketId}</Detail>
              <Detail label="Category">{complaint?.category}</Detail>
              <Detail label="Submitted on">{formatDateTime(complaint?.createdAt)}</Detail>
              <Detail label="Last updated">{formatDateTime(complaint?.updatedAt)}</Detail>
              <Detail label="Current status">
                {complaint && <StatusBadge status={complaint.status} />}
              </Detail>
              <Detail label="Priority">
                {complaint?.priority ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={complaint.priority} />
                    <Badge tone="amber">Frontend-only</Badge>
                  </span>
                ) : (
                  'Not specified'
                )}
              </Detail>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Description" />
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
              {complaint?.description}
            </p>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader title="Status timeline" description="Oldest update first" />
          <ComplaintTimeline items={complaint?.timeline || []} />
        </Card>
      </div>

      <Alert variant="info">
        Comments and attachments are not available yet. They will appear here once the backend supports them.
      </Alert>
    </div>
  );
}