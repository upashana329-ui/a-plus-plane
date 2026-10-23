import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bus,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  HelpCircle,
  Inbox,
  Info,
  MapPin,
  Moon,
  PlusCircle,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Upload,
  UserCheck,
  X,
} from 'lucide-react';
import { busApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import {
  BUS_COMPLAINT_CATEGORIES,
  BUS_COMPLAINT_CATEGORY_DESCRIPTIONS,
  BUS_COMPLAINT_STATUSES,
  BUS_ROUTE_NAME,
  BUS_TIMING_DISPLAY,
  BUS_TIMING_FROM,
  BUS_TIMING_TO,
} from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/format';

const STATUS_TONES = {
  Pending: 'amber',
  'Under Review': 'blue',
  'In Progress': 'purple',
  Resolved: 'green',
  Rejected: 'red',
};

export default function BusForm() {
  useDocumentTitle('Campus Bus Transit & Grievance');
  const toast = useToast();
  const { user, student, isAdmin } = useAuth();
  const currentStudent = student || user;

  // Active view tab: 'routes' | 'register' | 'my-complaints' (for students)
  // or 'admin-complaints' | 'routes' (for admin)
  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin-complaints' : 'routes');

  // Route & Assignment state
  const [routes, setRoutes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [routesError, setRoutesError] = useState('');

  // Student Complaints state
  const [myComplaints, setMyComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [complaintError, setComplaintError] = useState('');

  // Complaint Form state
  const [formData, setFormData] = useState({
    route: BUS_ROUTE_NAME,
    category: '',
    scheduledTime: '01:00 AM',
    actualTime: '',
    pickupLocation: 'Main Campus Bus Terminal',
    incidentDate: new Date().toISOString().split('T')[0],
    description: '',
    evidenceUrl: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Admin Management state
  const [adminComplaints, setAdminComplaints] = useState([]);
  const [recurringProblems, setRecurringProblems] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminFilter, setAdminFilter] = useState({
    status: '',
    category: '',
    date: '',
    search: '',
  });

  // Admin Action Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [remarksDraft, setRemarksDraft] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // 1. Load Bus Routes & Student assignments
  async function loadRouteData() {
    setLoadingRoutes(true);
    setRoutesError('');
    try {
      const [routeData, assignmentData] = await Promise.all([
        busApi.getRoutes(),
        busApi.getMyAssignments().catch(() => []),
      ]);
      setRoutes(Array.isArray(routeData) ? routeData : []);
      setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
    } catch (err) {
      setRoutesError(err.message || 'Unable to load bus routes.');
    } finally {
      setLoadingRoutes(false);
    }
  }

  // 2. Load Student's own complaints
  async function loadMyComplaints() {
    setLoadingComplaints(true);
    setComplaintError('');
    try {
      const data = await busApi.getMyComplaints();
      setMyComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setComplaintError(err.message || 'Unable to load your bus complaints.');
    } finally {
      setLoadingComplaints(false);
    }
  }

  // 3. Load Admin Complaints & Recurring Analytics
  async function loadAdminComplaints() {
    setLoadingAdmin(true);
    try {
      const params = {};
      if (adminFilter.status) params.status = adminFilter.status;
      if (adminFilter.category) params.category = adminFilter.category;
      if (adminFilter.date) params.date = adminFilter.date;
      if (adminFilter.search) params.search = adminFilter.search;

      const res = await busApi.adminGetComplaints(params);
      setAdminComplaints(res.complaints || []);
      setRecurringProblems(res.recurringProblems || null);
    } catch (err) {
      toast.error(err.message || 'Failed to load bus grievance records.');
    } finally {
      setLoadingAdmin(false);
    }
  }

  useEffect(() => {
    loadRouteData();
    if (!isAdmin) {
      loadMyComplaints();
    } else {
      loadAdminComplaints();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminComplaints();
    }
  }, [adminFilter.status, adminFilter.category, adminFilter.date]);

  // Route enrollment
  async function assignRoute(routeId) {
    setAssigningId(routeId);
    try {
      await busApi.assignRoute(routeId);
      toast.success('You have successfully enrolled in this bus transit route.');
      await loadRouteData();
    } catch (err) {
      toast.error(err.message || 'Could not enroll in bus route.');
    } finally {
      setAssigningId(null);
    }
  }

  // Validate Complaint Form
  function validateForm() {
    const errs = {};
    if (!formData.category) {
      errs.category = 'Please select a complaint category.';
    }
    if (!formData.scheduledTime) {
      errs.scheduledTime = 'Scheduled bus time is required.';
    }
    if (!formData.pickupLocation || formData.pickupLocation.trim().length < 2) {
      errs.pickupLocation = 'Please select or enter the pickup stop.';
    }
    if (!formData.incidentDate) {
      errs.incidentDate = 'Date of incident is required.';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      errs.description = 'Please describe the incident in at least 10 characters.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Handle Complaint Submission
  async function handleSubmitComplaint(e) {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setSubmittingComplaint(true);
    try {
      const payload = {
        route: formData.route || BUS_ROUTE_NAME,
        category: formData.category,
        scheduledTime: formData.scheduledTime,
        actualTime: formData.actualTime ? formData.actualTime.trim() : undefined,
        pickupLocation: formData.pickupLocation.trim(),
        incidentDate: formData.incidentDate,
        description: formData.description.trim(),
        evidenceUrl: formData.evidenceUrl ? formData.evidenceUrl.trim() : undefined,
      };

      const res = await busApi.submitComplaint(payload);
      setSubmittedTicket(res.ticketId || res.complaint?.ticketId);
      toast.success(`Complaint registered! Ticket ID: ${res.ticketId || res.complaint?.ticketId}`);

      // Reset form
      setFormData({
        route: BUS_ROUTE_NAME,
        category: '',
        scheduledTime: '01:00 AM',
        actualTime: '',
        pickupLocation: 'Main Campus Bus Terminal',
        incidentDate: new Date().toISOString().split('T')[0],
        description: '',
        evidenceUrl: '',
      });
      setFormErrors({});

      // Refresh complaints list and switch tab
      await loadMyComplaints();
    } catch (err) {
      toast.error(err.message || 'Could not submit your complaint. Please try again.');
    } finally {
      setSubmittingComplaint(false);
    }
  }

  // Admin status update
  async function handleAdminStatusUpdate(e) {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdatingStatus(true);
    try {
      await busApi.adminUpdateStatus(
        selectedComplaint.id,
        statusDraft,
        remarksDraft.trim()
      );
      toast.success('Bus complaint updated successfully.');
      setSelectedComplaint(null);
      await loadAdminComplaints();
    } catch (err) {
      toast.error(err.message || 'Failed to update complaint.');
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Handle image upload simulation / conversion to data URL
  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, evidenceUrl: reader.result }));
      toast.success('Photo / evidence attached successfully.');
    };
    reader.readAsDataURL(file);
  }

  // Active route stops options
  const haldwaniRoute = routes.find((r) => r.name.toLowerCase().includes('haldwani')) || routes[0];
  const stopOptions = haldwaniRoute?.stops?.map((s) => s.name) || [
    'Main Campus Bus Terminal',
    'ISBT Transit Bay',
    'Haridwar Bypass Junction',
    'Rampur Road Toll Plaza',
    'Haldwani Central Bus Station',
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Moon className="h-3.5 w-3.5 text-amber-300" />
              <span>Dedicated Night Transit Schedule</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Campus Bus Transit & Grievance Portal
            </h1>
            <p className="max-w-2xl text-sm text-blue-100 sm:text-base">
              Official university transportation service for the{' '}
              <strong className="text-white font-bold">{BUS_ROUTE_NAME}</strong> route. Track timings,
              enroll in the bus pass, or register transportation grievances directly with the administration.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              loading={loadingRoutes || loadingAdmin || loadingComplaints}
              onClick={() => {
                loadRouteData();
                if (isAdmin) loadAdminComplaints();
                else loadMyComplaints();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Highlighted Schedule Callout */}
        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-200">
              <Bus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-blue-200">
                Official Campus Route
              </p>
              <p className="text-sm font-bold text-white">{BUS_ROUTE_NAME}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-amber-200">
                Bus Timing Window
              </p>
              <p className="text-sm font-bold text-white">
                {BUS_TIMING_FROM} – {BUS_TIMING_TO}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-200">
                Student Grievance System
              </p>
              <p className="text-sm font-bold text-white">Direct Ticket Resolution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {isAdmin ? (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('admin-complaints')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'admin-complaints'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Admin Bus Grievance Management</span>
              {adminComplaints.length > 0 && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                  {adminComplaints.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('routes')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'routes'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Bus className="h-4 w-4" />
              <span>Bus Route & Schedule Details</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('routes')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'routes'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Bus className="h-4 w-4" />
              <span>Route & Timings ({BUS_ROUTE_NAME})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Register Bus Complaint</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('my-complaints')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'my-complaints'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Track My Complaints</span>
              {myComplaints.length > 0 && (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-800">
                  {myComplaints.length}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* TAB 1: Route & Schedule Details */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          {routesError && <Alert variant="error">{routesError}</Alert>}

          {loadingRoutes ? (
            <p className="py-12 text-center text-sm text-slate-500">Loading bus schedule…</p>
          ) : routes.length === 0 ? (
            <Card className="py-12 text-center">
              <Bus className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No active bus routes found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Route schedule for Campus to Haldwani is being updated.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Route Card (Main 2 columns) */}
              <div className="lg:col-span-2 space-y-6">
                {routes.map((route) => {
                  const assigned = assignments.some((item) => item.routeId === route.id);

                  return (
                    <Card key={route.id} className="relative overflow-hidden border-blue-100 shadow-md">
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                              <Bus className="h-3.5 w-3.5" />
                              {route.routeCode || 'BUS-HALDWANI'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              Active Route
                            </span>
                          </div>
                          <h2 className="text-xl font-extrabold text-slate-900">{route.name}</h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Unified daily transit connecting campus students with Haldwani station.
                          </p>
                        </div>

                        {assigned && (
                          <Badge tone="green" dot className="px-3 py-1 text-xs">
                            Enrolled & Assigned
                          </Badge>
                        )}
                      </div>

                      {/* Prominent Timings Section */}
                      <div className="mt-5 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 to-orange-50/40 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="text-sm font-bold text-amber-950">
                                Official Bus Schedule: {BUS_TIMING_FROM} to {BUS_TIMING_TO}
                              </h3>
                              <span className="rounded-full bg-amber-200/60 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                                Daily Service
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                              Departs from <strong>Main Campus Bus Terminal</strong> at{' '}
                              <strong>{BUS_TIMING_FROM}</strong> and arrives at{' '}
                              <strong>Haldwani Central Bus Station</strong> at{' '}
                              <strong>{BUS_TIMING_TO}</strong>. Please report 15 minutes before departure.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stops & Key Points */}
                      <div className="mt-6">
                        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          Route Stops Sequence
                        </h3>
                        <div className="space-y-2">
                          {route.stops && route.stops.length > 0 ? (
                            route.stops.map((stop, idx) => (
                              <div
                                key={stop.id || idx}
                                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3.5 py-2 text-xs transition-colors hover:bg-blue-50/40"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                                  {stop.sequence || idx + 1}
                                </span>
                                <span className="font-semibold text-slate-800">{stop.name}</span>
                                {idx === 0 && (
                                  <span className="ml-auto rounded-md bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                    Departure Point
                                  </span>
                                )}
                                {idx === route.stops.length - 1 && (
                                  <span className="ml-auto rounded-md bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                    Final Destination
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400">Regular campus transit stops</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3 sm:flex-row">
                        {!isAdmin && (
                          <Button
                            variant={assigned ? 'secondary' : 'primary'}
                            icon={assigned ? CheckCircle2 : Bus}
                            loading={assigningId === route.id}
                            disabled={assigned}
                            onClick={() => assignRoute(route.id)}
                            className="flex-1"
                          >
                            {assigned ? 'You are Enrolled in this Route' : 'Enroll in Campus to Haldwani Route'}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          icon={ShieldAlert}
                          onClick={() => setActiveTab(isAdmin ? 'admin-complaints' : 'register')}
                        >
                          {isAdmin ? 'View Bus Grievances' : 'Report Bus Problem'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Sidebar Guide */}
              <div className="space-y-4">
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader title="Transit Information" icon={Info} />
                  <div className="mt-3 space-y-3 text-xs text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-900">Night Transport Rules:</p>
                      <ul className="mt-1 list-disc pl-4 space-y-1">
                        <li>Valid Student College ID card is mandatory for boarding.</li>
                        <li>Seats are allocated on first-come reservation priority.</li>
                        <li>Report at assigned stop 15 minutes prior to departure.</li>
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      <p className="font-semibold text-slate-900">Facing transit issues?</p>
                      <p className="mt-1">
                        If the bus arrives late, leaves without you, or misses your pickup point, please
                        file an official grievance using the <strong>Register Bus Complaint</strong> tab.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      <p className="font-semibold text-slate-900">Transport Helpdesk:</p>
                      <p className="mt-1 text-slate-700">
                        📞 Transport Incharge Desk: <strong>+91 98765 43210</strong>
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Register Bus Complaint (Student) */}
      {activeTab === 'register' && !isAdmin && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-blue-100">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Register Bus Complaint</h2>
                    <p className="text-xs text-slate-500">
                      Lodge a formal transportation grievance for the Campus to Haldwani route.
                    </p>
                  </div>
                </div>
              </div>

              {submittedTicket && (
                <div className="my-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">Complaint Lodged Successfully!</h4>
                      <p className="text-xs text-emerald-800 mt-1">
                        Your complaint ID is <strong className="font-mono font-bold">{submittedTicket}</strong>.
                        You can track the live status and administrative remarks in the{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('my-complaints')}
                          className="font-bold underline hover:text-emerald-950"
                        >
                          Track My Complaints
                        </button>{' '}
                        tab.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitComplaint} className="mt-6 space-y-5">
                {/* Auto-filled Student Details */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student ID (Auto-fetched)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentStudent?.studentId || 'Loading...'}
                      className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-2 text-xs font-mono font-semibold text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student Name (Auto-fetched)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentStudent?.name || 'Loading...'}
                      className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-2 text-xs font-semibold text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Campus / Route (Locked to single simplified route) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campus / Route
                  </label>
                  <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-bold text-blue-900">{BUS_ROUTE_NAME}</span>
                    </div>
                    <span className="rounded-md bg-blue-200/70 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                      Timings: {BUS_TIMING_FROM} – {BUS_TIMING_TO}
                    </span>
                  </div>
                </div>

                {/* Complaint Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Complaint Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.category ? 'border-red-500 bg-red-50/20' : 'border-slate-300 bg-white'
                    }`}
                  >
                    <option value="">Select a complaint category...</option>
                    {BUS_COMPLAINT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.category}</p>
                  )}
                  {formData.category && BUS_COMPLAINT_CATEGORY_DESCRIPTIONS[formData.category] && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>{BUS_COMPLAINT_CATEGORY_DESCRIPTIONS[formData.category]}</span>
                    </p>
                  )}
                </div>

                {/* Scheduled & Actual Times */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Scheduled Bus Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      placeholder="e.g. 01:00 AM"
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.scheduledTime ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.scheduledTime && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.scheduledTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Actual Bus Time <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.actualTime}
                      onChange={(e) => setFormData({ ...formData, actualTime: e.target.value })}
                      placeholder="e.g. 01:45 AM (if bus arrived late)"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Pickup Location & Date of Incident */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pickup Location / Bus Stop <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.pickupLocation}
                      onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {stopOptions.map((stop) => (
                        <option key={stop} value={stop}>
                          {stop}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Incident <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.incidentDate ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.incidentDate && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.incidentDate}</p>
                    )}
                  </div>
                </div>

                {/* Complaint Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Complaint Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed facts about what happened (e.g. how many minutes late the bus was, what stop was bypassed, or if driver did not stop)..."
                    className={`w-full rounded-xl border p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.description ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.description}</p>
                  )}
                  <p className="mt-1 text-[11px] text-slate-400">
                    Minimum 10 characters. Be concise and factual to aid official review.
                  </p>
                </div>

                {/* Evidence Attachment Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supporting Evidence / Photo <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                      <Upload className="h-4 w-4 text-slate-500" />
                      <span>Choose Photo / Screenshot</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    {formData.evidenceUrl && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Attachment added
                      </span>
                    )}
                  </div>
                  {formData.evidenceUrl && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={formData.evidenceUrl}
                        alt="Evidence preview"
                        className="h-20 w-32 object-cover rounded-lg border border-slate-200 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, evidenceUrl: '' }))}
                        className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow-xs hover:bg-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={Send}
                    loading={submittingComplaint}
                    className="w-full sm:w-auto px-6 py-2.5 font-bold"
                  >
                    Submit Bus Complaint
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border-blue-200">
              <CardHeader title="Grievance Categories Guide" icon={HelpCircle} />
              <div className="mt-3 space-y-2.5 text-xs text-slate-700">
                {BUS_COMPLAINT_CATEGORIES.map((cat, idx) => (
                  <div key={cat} className="rounded-lg bg-white/80 p-2.5 border border-blue-100 shadow-2xs">
                    <p className="font-bold text-slate-900">
                      {idx + 1}. {cat}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {BUS_COMPLAINT_CATEGORY_DESCRIPTIONS[cat]}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: Track My Complaints (Student) */}
      {activeTab === 'my-complaints' && !isAdmin && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My Bus Grievances</h2>
              <p className="text-xs text-slate-500">
                Track status updates, administrative replies, and resolution remarks for your filed complaints.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={PlusCircle}
              onClick={() => setActiveTab('register')}
            >
              File New Complaint
            </Button>
          </div>

          {complaintError && <Alert variant="error">{complaintError}</Alert>}

          {loadingComplaints ? (
            <p className="py-12 text-center text-sm text-slate-500">Loading your bus complaints…</p>
          ) : myComplaints.length === 0 ? (
            <Card className="py-12 text-center">
              <Inbox className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No bus complaints submitted</h3>
              <p className="mt-1 text-sm text-slate-500">
                You haven&apos;t reported any transportation incidents yet.
              </p>
              <div className="mt-4">
                <Button variant="primary" size="sm" onClick={() => setActiveTab('register')}>
                  Register Bus Complaint
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {myComplaints.map((c) => (
                <Card key={c.id} className="border-slate-200 hover:border-blue-200 transition-all shadow-xs">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {c.ticketId}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{c.category}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Incident on <strong>{formatDate(c.incidentDate)}</strong> at{' '}
                        <strong>{c.pickupLocation}</strong>
                      </p>
                    </div>

                    <Badge tone={STATUS_TONES[c.status] || 'neutral'} dot className="px-3 py-1 text-xs">
                      {c.status}
                    </Badge>
                  </div>

                  {/* Complaint Details */}
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-semibold">Route:</span>
                      <p className="font-semibold text-slate-800">{c.route || BUS_ROUTE_NAME}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-semibold">Scheduled Time:</span>
                      <p className="font-semibold text-slate-800">{c.scheduledTime}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-semibold">Actual Time:</span>
                      <p className="font-semibold text-slate-800">{c.actualTime || 'Not recorded'}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-700 mb-0.5">Description:</p>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                      {c.description}
                    </p>
                  </div>

                  {/* Evidence image if available */}
                  {c.evidenceUrl && (
                    <div className="mt-3">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1">Attached Evidence:</p>
                      <img
                        src={c.evidenceUrl}
                        alt="Evidence"
                        className="h-24 w-auto rounded-lg border border-slate-200 object-cover"
                      />
                    </div>
                  )}

                  {/* Administrator's Official Response */}
                  {c.adminRemarks ? (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
                      <div className="flex items-start gap-2">
                        <UserCheck className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-blue-950">Administrator Official Response:</p>
                          <p className="mt-1 text-xs text-blue-900 leading-relaxed">{c.adminRemarks}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Awaiting administrator review and resolution notes.</span>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="mt-4 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                    <span>Filed: {formatDateTime(c.createdAt)}</span>
                    <span>Last Updated: {formatDateTime(c.updatedAt)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Admin Bus Grievance Management (Admin Only) */}
      {isAdmin && activeTab === 'admin-complaints' && (
        <div className="space-y-6">
          {/* Recurring Problem Analytics Summary */}
          {recurringProblems && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recurring Transit Problems & Analytics
                  </h3>
                  <p className="text-xs text-slate-500">
                    Automated problem detection to identify transportation bottlenecks on {BUS_ROUTE_NAME}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-3.5">
                  <p className="text-[11px] font-semibold text-blue-700 uppercase">Total Complaints</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {recurringProblems.total}
                  </p>
                </Card>

                <Card className="border-amber-200 bg-gradient-to-br from-amber-50/60 to-white p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-amber-800 uppercase">Late Buses</p>
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <p className="mt-1 text-2xl font-black text-amber-900">
                    {recurringProblems.busArrivedLate}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Bus Arrived Late</p>
                </Card>

                <Card className="border-red-200 bg-gradient-to-br from-red-50/60 to-white p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-red-800 uppercase">Left Behind</p>
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                  </div>
                  <p className="mt-1 text-2xl font-black text-red-900">
                    {recurringProblems.busLeftWithoutMe}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Left Without Student</p>
                </Card>

                <Card className="border-orange-200 bg-gradient-to-br from-orange-50/60 to-white p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-orange-800 uppercase">Missed Stops</p>
                    <MapPin className="h-3.5 w-3.5 text-orange-600" />
                  </div>
                  <p className="mt-1 text-2xl font-black text-orange-900">
                    {recurringProblems.busMissedPickupStop}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Stop Passed Without Pickup</p>
                </Card>

                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-3.5 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-emerald-800 uppercase">Resolved</p>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <p className="mt-1 text-2xl font-black text-emerald-900">
                    {recurringProblems.byStatus?.resolved || 0}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {recurringProblems.total > 0
                      ? `${Math.round(
                          ((recurringProblems.byStatus?.resolved || 0) / recurringProblems.total) * 100
                        )}% resolution rate`
                      : 'No issues'}
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* Filters Toolbar */}
          <Card className="p-4 bg-slate-50 border-slate-200">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Filter by Status
                </label>
                <select
                  value={adminFilter.status}
                  onChange={(e) => setAdminFilter({ ...adminFilter, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {BUS_COMPLAINT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Filter by Category
                </label>
                <select
                  value={adminFilter.category}
                  onChange={(e) => setAdminFilter({ ...adminFilter, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {BUS_COMPLAINT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Filter by Date
                </label>
                <input
                  type="date"
                  value={adminFilter.date}
                  onChange={(e) => setAdminFilter({ ...adminFilter, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Search Complaints
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ticket ID, Student, Stop..."
                    value={adminFilter.search}
                    onChange={(e) => setAdminFilter({ ...adminFilter, search: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {(adminFilter.status || adminFilter.category || adminFilter.date || adminFilter.search) && (
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                <span className="text-slate-500">Filters applied</span>
                <button
                  type="button"
                  onClick={() => setAdminFilter({ status: '', category: '', date: '', search: '' })}
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </Card>

          {/* Admin Complaints List */}
          {loadingAdmin ? (
            <p className="py-12 text-center text-sm text-slate-500">Loading bus grievances…</p>
          ) : adminComplaints.length === 0 ? (
            <Card className="py-12 text-center">
              <Inbox className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No bus complaints found</h3>
              <p className="mt-1 text-sm text-slate-500">
                No grievances match your current search or filter criteria.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {adminComplaints.map((c) => (
                <Card key={c.id} className="border-slate-200 shadow-xs hover:border-blue-300 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                          {c.ticketId}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{c.category}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Submitted by <strong>{c.student?.name}</strong> (ID:{' '}
                        <span className="font-mono">{c.student?.studentId}</span>
                        {c.student?.course ? ` · ${c.student?.course}` : ''})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge tone={STATUS_TONES[c.status] || 'neutral'} dot className="px-3 py-1 text-xs">
                        {c.status}
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedComplaint(c);
                          setStatusDraft(c.status);
                          setRemarksDraft(c.adminRemarks || '');
                        }}
                      >
                        Update Status
                      </Button>
                    </div>
                  </div>

                  {/* Incident Information */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-semibold">Route:</span>
                      <p className="font-semibold text-slate-800">{c.route}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-semibold">Incident Date:</span>
                      <p className="font-semibold text-slate-800">{formatDate(c.incidentDate)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-semibold">Pickup Stop:</span>
                      <p className="font-semibold text-slate-800">{c.pickupLocation}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-semibold">Timings (Sched / Act):</span>
                      <p className="font-semibold text-slate-800">
                        {c.scheduledTime} / {c.actualTime || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Student Description:</p>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                      {c.description}
                    </p>
                  </div>

                  {/* Attached photo */}
                  {c.evidenceUrl && (
                    <div className="mt-3">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1">Student Photo Attachment:</p>
                      <a href={c.evidenceUrl} target="_blank" rel="noreferrer" className="inline-block">
                        <img
                          src={c.evidenceUrl}
                          alt="Evidence"
                          className="h-20 w-auto rounded-lg border border-slate-200 object-cover hover:opacity-90 transition-opacity"
                        />
                      </a>
                    </div>
                  )}

                  {/* Remarks Display */}
                  {c.adminRemarks && (
                    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
                      <p className="text-xs font-bold text-blue-950">Official Administrative Remarks:</p>
                      <p className="mt-0.5 text-xs text-blue-900 leading-relaxed">{c.adminRemarks}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                    <span>Filed: {formatDateTime(c.createdAt)}</span>
                    <span>Last Updated: {formatDateTime(c.updatedAt)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Admin Status & Remarks Modal */}
          {selectedComplaint && (
            <Modal
              open={Boolean(selectedComplaint)}
              onClose={() => setSelectedComplaint(null)}
              title={`Manage Bus Grievance: ${selectedComplaint.ticketId}`}
            >
              <form onSubmit={handleAdminStatusUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student & Complaint Details
                  </label>
                  <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 space-y-1 border border-slate-200">
                    <p>
                      <strong>Student:</strong> {selectedComplaint.student?.name} (ID:{' '}
                      {selectedComplaint.student?.studentId})
                    </p>
                    <p>
                      <strong>Category:</strong> {selectedComplaint.category}
                    </p>
                    <p>
                      <strong>Incident Date:</strong> {formatDate(selectedComplaint.incidentDate)}
                    </p>
                    <p>
                      <strong>Stop & Time:</strong> {selectedComplaint.pickupLocation} (Scheduled:{' '}
                      {selectedComplaint.scheduledTime}
                      {selectedComplaint.actualTime ? `, Actual: ${selectedComplaint.actualTime}` : ''})
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Update Complaint Status
                  </label>
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {BUS_COMPLAINT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Administrative Remarks / Resolution Note
                  </label>
                  <textarea
                    rows={4}
                    value={remarksDraft}
                    onChange={(e) => setRemarksDraft(e.target.value)}
                    placeholder="Enter formal explanation, driver disciplinary action, reschedule notice, or resolution remarks..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    This note will be visible to the student in their &apos;Track My Complaints&apos; section.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedComplaint(null)}
                    disabled={updatingStatus}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={updatingStatus}
                    className="font-bold"
                  >
                    Save & Update Status
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}
