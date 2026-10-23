import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Inbox, RefreshCw, Save, Search, SearchX, UserCheck, X } from 'lucide-react';

import ComplaintTimeline from '../../components/ComplaintTimeline';
import DemoBanner from '../../components/DemoBanner';
import Alert from '../../components/ui/Alert';
import Badge, { PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { PageSpinner } from '../../components/ui/Spinner';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';
import {
  DEMO_STAFF,
  assignComplaint,
  listAllComplaints,
  updateComplaintStatus,
} from '../../services/adminService';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errors';
import { formatDate, formatDateTime } from '../../utils/format';

const UNASSIGNED = 'Unassigned';
const ASSIGNEE_FILTER_OPTIONS = [UNASSIGNED, ...DEMO_STAFF];

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export default function ManageComplaintsPage() {
  useDocumentTitle('Manage Complaints');

  const toast = useToast();

  const [state, setState] = useState({ status: 'loading', complaints: [], error: '' });
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [assigneeDraft, setAssigneeDraft] = useState('');
  const [busy, setBusy] = useState(''); // '', 'status' or 'assign'

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, status: 'loading', error: '' }));

    // DEMO SERVICE: see adminService.js. Not real database data.
    listAllComplaints()
      .then((complaints) => {
        if (!cancelled) setState({ status: 'ready', complaints, error: '' });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', complaints: [], error: getErrorMessage(error, 'We could not load complaints.') });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const { status, complaints, error } = state;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((complaint) => {
      if (statusFilter && complaint.status !== statusFilter) return false;
      if (categoryFilter && complaint.category !== categoryFilter) return false;
      if (assigneeFilter === UNASSIGNED && complaint.assignedTo) return false;
      if (assigneeFilter && assigneeFilter !== UNASSIGNED && complaint.assignedTo !== assigneeFilter) return false;
      if (query) {
        const haystack =
          `${complaint.ticketId} ${complaint.title} ${complaint.studentName} ${complaint.studentId}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [complaints, search, statusFilter, categoryFilter, assigneeFilter]);

  const hasFilters = Boolean(search || statusFilter || categoryFilter || assigneeFilter);
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setAssigneeFilter('');
  };

  // The selected complaint is looked up by id so the dialog always shows the latest values.
  const selected = complaints.find((complaint) => complaint.id === selectedId) || null;

  const openComplaint = (complaint) => {
    setSelectedId(complaint.id);
    setStatusDraft(complaint.status);
    setAssigneeDraft(complaint.assignedTo || '');
  };

  const closeComplaint = () => {
    if (!busy) setSelectedId(null);
  };

  const replaceComplaint = (updated) => {
    setState((current) => ({
      ...current,
      complaints: current.complaints.map((item) => (item.id === updated.id ? updated : item)),
    }));
  };

  // DEMO ONLY: changes the status in browser memory. Nothing is saved to the database.
  const handleStatusUpdate = async () => {
    if (!selected || busy) return;
    if (statusDraft === selected.status) {
      toast.info('That is already the current status.');
      return;
    }

    setBusy('status');
    try {
      const updated = await updateComplaintStatus(selected.id, statusDraft);
      replaceComplaint(updated);
      toast.success(`Demo only: status changed to "${updated.status}". Not saved to the database.`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not change the status.'));
    } finally {
      setBusy('');
    }
  };

  // DEMO ONLY: assigns in browser memory. Nothing is saved to the database.
  const handleAssign = async () => {
    if (!selected || busy) return;
    if (assigneeDraft === (selected.assignedTo || '')) {
      toast.info('That assignment is already set.');
      return;
    }

    setBusy('assign');
    try {
      const updated = await assignComplaint(selected.id, assigneeDraft);
      replaceComplaint(updated);
      toast.success(
        updated.assignedTo
          ? `Demo only: assigned to ${updated.assignedTo}. Not saved to the database.`
          : 'Demo only: assignment removed. Not saved to the database.',
      );
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not assign the complaint.'));
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage complaints</h1>
        <p className="mt-1 text-sm text-slate-600">Search, filter and open a complaint to see its details.</p>
      </div>

      <DemoBanner title="Demo data and demo controls">
        These complaints are sample data. The status and assignment controls only change what you see in this
        browser tab. The backend has no admin API yet, so nothing is saved, and a page refresh resets it.
      </DemoBanner>

      {status === 'loading' && <PageSpinner label="Loading complaints…" />}

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
          <EmptyState icon={Inbox} title="No complaints yet" description="Complaints will appear here once students submit them." />
        </Card>
      )}

      {status === 'ready' && complaints.length > 0 && (
        <>
          <Card>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                id="admin-complaint-search"
                type="search"
                label="Search"
                icon={Search}
                placeholder="Ticket, title or student"
                autoComplete="off"
                className="sm:col-span-2 lg:col-span-4"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Select
                id="admin-status-filter"
                label="Status"
                placeholder="All statuses"
                options={COMPLAINT_STATUSES}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              />
              <Select
                id="admin-category-filter"
                label="Category"
                placeholder="All categories"
                options={COMPLAINT_CATEGORIES}
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              />
              <Select
                id="admin-assignee-filter"
                label="Assigned to"
                placeholder="Anyone"
                options={ASSIGNEE_FILTER_OPTIONS}
                value={assigneeFilter}
                onChange={(event) => setAssigneeFilter(event.target.value)}
              />
              <div className="flex items-end">
                <Button variant="ghost" icon={X} onClick={clearFilters} disabled={!hasFilters}>
                  Clear filters
                </Button>
              </div>
            </div>
          </Card>

          <p className="text-sm text-slate-600" role="status" aria-live="polite">
            Showing {filtered.length} of {complaints.length} complaint{complaints.length === 1 ? '' : 's'} (demo data)
          </p>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title="No complaints match your filters"
                description="Try a different search word, or clear the filters."
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
                    <caption className="sr-only">All complaints (demo data)</caption>
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th scope="col" className="px-5 py-3">Ticket ID</th>
                        <th scope="col" className="px-5 py-3">Complaint</th>
                        <th scope="col" className="px-5 py-3">Category</th>
                        <th scope="col" className="px-5 py-3">Status</th>
                        <th scope="col" className="px-5 py-3">Assigned to</th>
                        <th scope="col" className="px-5 py-3">Submitted</th>
                        <th scope="col" className="px-5 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filtered.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-900">{complaint.ticketId}</td>
                          <td className="max-w-xs px-5 py-3.5">
                            <span className="line-clamp-1 font-medium text-slate-800">{complaint.title}</span>
                            <span className="block text-xs text-slate-500">
                              {complaint.studentName} ({complaint.studentId})
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{complaint.category}</td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <StatusBadge status={complaint.status} />
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                            {complaint.assignedTo || <span className="text-slate-400">{UNASSIGNED}</span>}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{formatDate(complaint.createdAt)}</td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openComplaint(complaint)}
                              aria-label={`Open details of ${complaint.ticketId}`}
                            >
                              Manage
                            </Button>
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
                    <button
                      type="button"
                      onClick={() => openComplaint(complaint)}
                      className="block w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-brand-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium text-slate-500">{complaint.ticketId}</p>
                        <StatusBadge status={complaint.status} />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{complaint.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {complaint.studentName} · {complaint.category}
                      </p>
                      <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{complaint.assignedTo || UNASSIGNED}</span>
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {/* Complaint detail dialog */}
      <Modal
        open={Boolean(selected)}
        onClose={closeComplaint}
        dismissible={!busy}
        size="lg"
        title={selected ? `${selected.ticketId}: ${selected.title}` : 'Complaint'}
        description="Demo data. Changes made here are not saved to the database."
        footer={
          <Button variant="outline" onClick={closeComplaint} disabled={Boolean(busy)}>
            Close
          </Button>
        }
      >
        {selected && (
          <div className="space-y-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Student">
                {selected.studentName} ({selected.studentId})
              </Detail>
              <Detail label="Category">{selected.category}</Detail>
              <Detail label="Submitted on">{formatDateTime(selected.createdAt)}</Detail>
              <Detail label="Last updated">{formatDateTime(selected.updatedAt)}</Detail>
              <Detail label="Status">
                <StatusBadge status={selected.status} />
              </Detail>
              <Detail label="Priority">
                <PriorityBadge priority={selected.priority} />
              </Detail>
              <Detail label="Assigned to">{selected.assignedTo || UNASSIGNED}</Detail>
            </dl>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</h3>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{selected.description}</p>
            </div>

            {/* Demo-only controls */}
            <section aria-labelledby="demo-controls-heading" className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h3 id="demo-controls-heading" className="text-sm font-semibold text-slate-900">
                  Update this complaint
                </h3>
                <Badge tone="amber">Demo only: not saved</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Select
                    id="admin-status-draft"
                    label="Change status"
                    options={COMPLAINT_STATUSES}
                    value={statusDraft}
                    onChange={(event) => setStatusDraft(event.target.value)}
                    disabled={Boolean(busy)}
                  />
                  <Button
                    size="sm"
                    icon={Save}
                    onClick={handleStatusUpdate}
                    loading={busy === 'status'}
                    disabled={Boolean(busy) && busy !== 'status'}
                  >
                    Update status (demo)
                  </Button>
                </div>

                <div className="space-y-2">
                  <Select
                    id="admin-assignee-draft"
                    label="Assign to"
                    placeholder={UNASSIGNED}
                    options={DEMO_STAFF}
                    value={assigneeDraft}
                    onChange={(event) => setAssigneeDraft(event.target.value)}
                    disabled={Boolean(busy)}
                  />
                  <Button
                    size="sm"
                    icon={UserCheck}
                    onClick={handleAssign}
                    loading={busy === 'assign'}
                    disabled={Boolean(busy) && busy !== 'assign'}
                  >
                    Save assignment (demo)
                  </Button>
                </div>
              </div>
            </section>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status timeline</h3>
              <ComplaintTimeline items={selected.timeline} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}