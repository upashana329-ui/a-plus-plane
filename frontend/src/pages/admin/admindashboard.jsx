import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Hourglass,
  RefreshCw,
  XCircle,
} from 'lucide-react';

import DemoBanner from '../../components/DemoBanner';
import StatCard from '../../components/StatCard';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getAdminOverview } from '../../services/adminService';
import { COMPLAINT_STATUS, COMPLAINT_STATUSES, ROUTES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';

// Chart colours. The status name is always shown as text too (legend / tooltip).
const STATUS_COLORS = {
  [COMPLAINT_STATUS.SUBMITTED]: '#3b82f6',
  [COMPLAINT_STATUS.UNDER_REVIEW]: '#f59e0b',
  [COMPLAINT_STATUS.IN_PROGRESS]: '#8b5cf6',
  [COMPLAINT_STATUS.RESOLVED]: '#10b981',
  [COMPLAINT_STATUS.REJECTED]: '#ef4444',
};

export default function AdminDashboardPage() {
  useDocumentTitle('Admin Dashboard');

  const { student } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', data: null, error: '' });

    // DEMO SERVICE: see adminService.js. Not real database data.
    getAdminOverview()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data, error: '' });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', data: null, error: getErrorMessage(error, 'We could not load the dashboard.') });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const { status, data, error } = state;
  const loading = status === 'loading';
  const stats = data?.stats;

  const statusData = stats
    ? COMPLAINT_STATUSES.map((name) => ({ name, value: stats.byStatus[name] })).filter((item) => item.value > 0)
    : [];
  const categoryData = data?.byCategory || [];
  const trendData = data?.trend || [];

  const statusSummary = stats
    ? COMPLAINT_STATUSES.map((name) => `${name}: ${stats.byStatus[name]}`).join(', ')
    : '';
  const categorySummary = categoryData.map((item) => `${item.category}: ${item.count}`).join(', ');
  const trendSummary = trendData.map((item) => `${item.month}: ${item.complaints}`).join(', ');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Signed in as {student.name}.</p>
      </div>

      <DemoBanner title="Demo data: all metrics on this page">
        The backend has no admin API yet, so every number, chart and complaint below is sample data generated in
        your browser. None of it comes from your database.
      </DemoBanner>

      {status === 'error' && (
        <Alert variant="error" title="Could not load the dashboard">
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
      <section aria-label="Complaint statistics (demo data)" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total complaints" value={stats?.total} icon={ClipboardList} tone="blue" loading={loading} helper="Demo data" />
        <StatCard label="Open" value={stats?.open} icon={Hourglass} tone="amber" loading={loading} helper="Demo data" />
        <StatCard
          label="In progress"
          value={stats?.byStatus[COMPLAINT_STATUS.IN_PROGRESS]}
          icon={Activity}
          tone="purple"
          loading={loading}
          helper="Demo data"
        />
        <StatCard
          label="Resolved"
          value={stats?.byStatus[COMPLAINT_STATUS.RESOLVED]}
          icon={CheckCircle2}
          tone="green"
          loading={loading}
          helper="Demo data"
        />
        <StatCard
          label="Rejected"
          value={stats?.byStatus[COMPLAINT_STATUS.REJECTED]}
          icon={XCircle}
          tone="red"
          loading={loading}
          helper="Demo data"
        />
      </section>

      {status === 'ready' && stats.total === 0 && (
        <Card>
          <EmptyState title="No complaints to show" description="There is no data to chart yet." />
        </Card>
      )}

      {status === 'ready' && stats.total > 0 && (
        <>
          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Complaints by status" description="Demo data" />
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div
                  role="img"
                  aria-label={`Donut chart of complaints by status. ${statusSummary}`}
                  className="h-52 w-52 shrink-0"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {statusData.map((item) => (
                          <Cell key={item.name} fill={STATUS_COLORS[item.name]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* The legend doubles as a text version of the chart */}
                <ul className="w-full space-y-2 text-sm">
                  {COMPLAINT_STATUSES.map((name) => (
                    <li key={name} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[name] }}
                          aria-hidden="true"
                        />
                        {name}
                      </span>
                      <span className="font-semibold text-slate-900">{stats.byStatus[name]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card>
              <CardHeader title="Complaints per month" description="Last 6 months · demo data" />
              <div
                role="img"
                aria-label={`Line chart of complaints per month. ${trendSummary}`}
                className="h-56"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="complaints"
                      name="Complaints"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Complaints by category" description="Demo data" />
            <div
              role="img"
              aria-label={`Bar chart of complaints by category. ${categorySummary}`}
              style={{ height: Math.max(200, categoryData.length * 40) }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={110}
                    tick={{ fontSize: 12, fill: '#475569' }}
                  />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" name="Complaints" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Recent complaints */}
          <Card>
            <CardHeader
              title="Recent complaints"
              description="Demo data"
              action={
                <Link
                  to={ROUTES.adminComplaints}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
                >
                  Manage all
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              }
            />
            <ul className="-mx-2 divide-y divide-slate-100">
              {data.recent.map((complaint) => (
                <li key={complaint.id}>
                  <Link
                    to={ROUTES.adminComplaints}
                    className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{complaint.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {complaint.ticketId} · {complaint.studentName} · {complaint.category} ·{' '}
                        {formatDate(complaint.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={complaint.status} className="shrink-0" />
                    <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}