import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FilePlus2,
  Hourglass,
  Inbox,
  RefreshCw,
  User,
} from 'lucide-react';

import DemoBanner from '../../components/DemoBanner';
import StatCard from '../../components/StatCard';
import Alert from '../../components/ui/Alert';
import Button, { buttonStyles } from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { listMyComplaints } from '../../services/complaintService';
import { summarizeComplaints } from '../../utils/complaintStats';
import { API_AVAILABILITY, COMPLAINT_STATUS, ROUTES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';

const QUICK_ACTIONS = [
  { to: ROUTES.raiseGrievance, label: 'Raise a grievance', text: 'Report a new problem', icon: FilePlus2 },
  { to: ROUTES.myComplaints, label: 'View my complaints', text: 'Search and filter your tickets', icon: ClipboardList },
  { to: ROUTES.profile, label: 'My profile', text: 'Check your student details', icon: User },
];

export default function StudentDashboardPage() {
  useDocumentTitle('Student Dashboard');

  const { student } = useAuth();
  const studentId = student.studentId;

  const [state, setState] = useState({ status: 'loading', complaints: [], error: '' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, status: 'loading', error: '' }));

    listMyComplaints(studentId)
      .then((complaints) => {
        if (!cancelled) setState({ status: 'ready', complaints, error: '' });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', complaints: [], error: getErrorMessage(error, 'We could not load your complaints.') });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [studentId, reloadKey]);

  const { status, complaints, error } = state;
  const loading = status === 'loading';
  const summary = summarizeComplaints(complaints);
  const recent = complaints.slice(0, 5);
  const firstName = (student.name || '').trim().split(/\s+/)[0] || 'there';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {firstName}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {student.course} · Semester {student.semester} · Section {student.section}
        </p>
      </div>

      {!API_AVAILABILITY.complaints && (
        <DemoBanner>
          Your complaints below are sample data kept in your browser only. The backend does not have complaint
          endpoints yet, so nothing is saved to the database and a page refresh resets everything.
        </DemoBanner>
      )}

      {status === 'error' && (
        <Alert variant="error" title="Could not load complaints">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            className="mt-3"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </Button>
        </Alert>
      )}

      {/* Statistics */}
      <section aria-label="Complaint statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total complaints" value={summary.total} icon={ClipboardList} tone="blue" loading={loading} />
        <StatCard label="Open" value={summary.open} icon={Hourglass} tone="amber" helper="Not yet resolved or rejected" loading={loading} />
        <StatCard
          label="In progress"
          value={summary.byStatus[COMPLAINT_STATUS.IN_PROGRESS]}
          icon={Activity}
          tone="purple"
          loading={loading}
        />
        <StatCard
          label="Resolved"
          value={summary.byStatus[COMPLAINT_STATUS.RESOLVED]}
          icon={CheckCircle2}
          tone="green"
          loading={loading}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent complaints */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent complaints"
            action={
              complaints.length > 0 && (
                <Link
                  to={ROUTES.myComplaints}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
                >
                  View all
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )
            }
          />

          {loading ? (
            <PageSpinner label="Loading your complaints…" className="py-10" />
          ) : status === 'error' ? (
            <p className="py-6 text-center text-sm text-slate-500">Complaints could not be loaded.</p>
          ) : recent.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="You haven’t submitted any complaints yet"
              description="When you raise a grievance, it will appear here so you can follow its progress."
              action={
                <Link to={ROUTES.raiseGrievance} className={buttonStyles()}>
                  <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                  Raise your first grievance
                </Link>
              }
            />
          ) : (
            <ul className="-mx-2 divide-y divide-slate-100">
              {recent.map((complaint) => (
                <li key={complaint.id}>
                  <Link
                    to={ROUTES.complaintDetails(complaint.id)}
                    className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{complaint.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {complaint.ticketId} · {complaint.category} · {formatDate(complaint.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={complaint.status} className="shrink-0" />
                    <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader title="Quick actions" />
          <ul className="space-y-2">
            {QUICK_ACTIONS.map(({ to, label, text, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:border-brand-200 hover:bg-brand-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">{label}</span>
                    <span className="block text-xs text-slate-500">{text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}