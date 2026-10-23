import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FilePlus2, Inbox, RefreshCw, Search, SearchX, X } from 'lucide-react';

import DemoBanner from '../../components/DemoBanner';
import Alert from '../../components/ui/Alert';
import Button, { buttonStyles } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { listMyComplaints } from '../../services/complaintService';
import { API_AVAILABILITY, COMPLAINT_CATEGORIES, COMPLAINT_STATUSES, ROUTES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';

export default function MyComplaintsPage() {
  useDocumentTitle('My Complaints');

  const { student } = useAuth();
  const studentId = student.studentId;

  const [state, setState] = useState({ status: 'loading', complaints: [], error: '' });
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((complaint) => {
      if (statusFilter && complaint.status !== statusFilter) return false;
      if (categoryFilter && complaint.category !== categoryFilter) return false;
      if (query) {
        const haystack = `${complaint.ticketId} ${complaint.title}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [complaints, search, statusFilter, categoryFilter]);

  const hasFilters = Boolean(search || statusFilter || categoryFilter);
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My complaints</h1>
          <p className="mt-1 text-sm text-slate-600">Search, filter and open any complaint to see its progress.</p>
        </div>
        <Link to={ROUTES.raiseGrievance} className={buttonStyles()}>
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          Raise grievance
        </Link>
      </div>

      {!API_AVAILABILITY.complaints && <DemoBanner />}

      {status === 'loading' && <PageSpinner label="Loading your complaints…" />}

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

      {status === 'ready' && complaints.length === 0 && (
        <Card>
          <EmptyState
            icon={Inbox}
            title="No complaints yet"
            description="Once you raise a grievance, you can search and track it here."
            action={
              <Link to={ROUTES.raiseGrievance} className={buttonStyles()}>
                <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                Raise a grievance
              </Link>
            }
          />
        </Card>
      )}

      {status === 'ready' && complaints.length > 0 && (
        <>
          {/* Search and filters */}
          <Card>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
              <Input
                id="complaint-search"
                type="search"
                label="Search"
                icon={Search}
                placeholder="Ticket ID or title"
                autoComplete="off"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Select
                id="complaint-status-filter"
                label="Status"
                placeholder="All statuses"
                options={COMPLAINT_STATUSES}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              />
              <Select
                id="complaint-category-filter"
                label="Category"
                placeholder="All categories"
                options={COMPLAINT_CATEGORIES}
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              />
              <Button variant="ghost" icon={X} onClick={clearFilters} disabled={!hasFilters}>
                Clear
              </Button>
            </div>
          </Card>

          <p className="text-sm text-slate-600" role="status" aria-live="polite">
            Showing {filtered.length} of {complaints.length} complaint{complaints.length === 1 ? '' : 's'}
          </p>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title="No complaints match your filters"
                description="Try a different search word, or clear the filters to see everything."
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            </Card>
          ) : (
            <>
              {/* Table: tablets and desktops */}
              <Card padded={false} className="hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <caption className="sr-only">Your complaints</caption>
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th scope="col" className="px-5 py-3">Ticket ID</th>
                        <th scope="col" className="px-5 py-3">Title</th>
                        <th scope="col" className="px-5 py-3">Category</th>
                        <th scope="col" className="px-5 py-3">Submitted</th>
                        <th scope="col" className="px-5 py-3">Status</th>
                        <th scope="col" className="px-5 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filtered.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-900">{complaint.ticketId}</td>
                          <td className="max-w-xs px-5 py-3.5 text-slate-700">
                            <span className="line-clamp-2">{complaint.title}</span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{complaint.category}</td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{formatDate(complaint.createdAt)}</td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <StatusBadge status={complaint.status} />
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-right">
                            <Link
                              to={ROUTES.complaintDetails(complaint.id)}
                              className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline"
                              aria-label={`View details of ${complaint.ticketId}`}
                            >
                              View
                              <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Cards: phones */}
              <ul className="space-y-3 md:hidden">
                {filtered.map((complaint) => (
                  <li key={complaint.id}>
                    <Link
                      to={ROUTES.complaintDetails(complaint.id)}
                      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium text-slate-500">{complaint.ticketId}</p>
                        <StatusBadge status={complaint.status} />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{complaint.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {complaint.category} · {formatDate(complaint.createdAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}