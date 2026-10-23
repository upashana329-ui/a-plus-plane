import { useEffect, useState } from 'react';
import {
  AlertCircle,
  EyeOff,
  HeartHandshake,
  Lock,
  PhoneCall,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/format';

const SAFETY_CATEGORIES = [
  { value: 'RAGGING', label: 'Anti-Ragging Report (Immediate Action)' },
  { value: 'HARASSMENT', label: 'Women Grievance / Anti-Harassment (ICC)' },
  { value: 'CYBER_CARE', label: 'Cyber Care (Blackmail, Online Harassment)' },
  { value: 'TRANSPORT_SAFETY', label: 'Campus Bus & Commute Safety' },
  { value: 'OTHER_SAFETY', label: 'General Safety or Security Concern' },
];

const EMERGENCY_CONTACTS = [
  { name: 'National Emergency', phone: '112' },
  { name: 'Women Helpline', phone: '1090' },
  { name: 'Anti-Ragging National Toll-Free', phone: '1800-180-5522' },
  { name: 'Campus Security Control Room', phone: '+91-135-2770126' },
];

export default function HerVoiceForm({ initialCategory = 'HARASSMENT' }) {
  useDocumentTitle('Her Voice & Campus Safety');
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'my-reports'
  const [category, setCategory] = useState(initialCategory);
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [myComplaints, setMyComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [complaintsError, setComplaintsError] = useState('');

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  async function loadMyComplaints() {
    setLoadingComplaints(true);
    setComplaintsError('');
    try {
      const data = await apiRequest('/safety/my-complaints');
      setMyComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setComplaintsError(err.message || 'Unable to load confidential complaints.');
    } finally {
      setLoadingComplaints(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'my-reports') {
      loadMyComplaints();
    }
  }, [activeTab]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (title.trim().length < 5) {
      setFormError('Title must be at least 5 characters long.');
      return;
    }
    if (description.trim().length < 20) {
      setFormError('Please provide a detailed description (at least 20 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category,
        title: title.trim(),
        description: description.trim(),
        platform: platform.trim() || undefined,
        incidentDate: incidentDate ? new Date(incidentDate).toISOString() : undefined,
      };

      const res = await apiRequest('/safety/complaints', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success(res.message || 'Your confidential grievance has been safely lodged.');
      setTitle('');
      setPlatform('');
      setIncidentDate('');
      setDescription('');
      setActiveTab('my-reports');
    } catch (err) {
      setFormError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-700 p-6 text-white shadow-md sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
              <EyeOff className="h-3.5 w-3.5" />
              100% Confidential & Anonymous Option
            </div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">Her Voice & Campus Safety</h1>
            <p className="max-w-xl text-rose-100 text-sm sm:text-base">
              A protected, discreet grievance space for ragging, harassment, cyber care, and commute security.
              Only authorized nodal officers review these records.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur-xs">
            <HeartHandshake className="h-12 w-12 text-rose-200" />
          </div>
        </div>
      </div>

      {/* Emergency Helpline Bar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {EMERGENCY_CONTACTS.map((item) => (
          <div
            key={item.phone}
            className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-rose-900"
          >
            <PhoneCall className="h-5 w-5 shrink-0 text-rose-600" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">{item.name}</p>
              <a href={`tel:${item.phone}`} className="text-sm font-bold hover:underline">
                {item.phone}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'report'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Lodge Confidential Report
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my-reports')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'my-reports'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          My Safety Reports
        </button>
      </div>

      {activeTab === 'report' && (
        <Card>
          <CardHeader
            title="Confidential Grievance Submission"
            description="All information is encrypted and accessible only to committee members."
          />

          <Alert variant="info" className="mb-6">
            <div className="space-y-1">
              <p className="font-semibold">Your safety is our top priority:</p>
              <ul className="list-disc pl-5 space-y-0.5 text-xs">
                <li>Never share passwords, OTPs, or intimate personal media in text descriptions.</li>
                <li>In case of urgent physical danger, reach a safe location and call 112 immediately.</li>
              </ul>
            </div>
          </Alert>

          {formError && (
            <Alert variant="error" className="mb-6">
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Select
              id="safety-category"
              name="category"
              label="Incident Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={SAFETY_CATEGORIES}
              required
            />

            <Input
              id="safety-title"
              name="title"
              label="Subject / Summary"
              placeholder="e.g. Inappropriate behavior during evening lab session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                id="safety-platform"
                name="platform"
                label="Location or Platform (Optional)"
                placeholder="e.g. Bus Route 4, Library 2nd Floor, WhatsApp group"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              />

              <Input
                id="safety-date"
                name="incidentDate"
                type="datetime-local"
                label="Approximate Incident Date & Time (Optional)"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </div>

            <Textarea
              id="safety-description"
              name="description"
              label="Confidential Statement"
              rows={5}
              placeholder="Please provide details of the event, individuals involved (if known), and any impact. Your statement is protected by institutional policy."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              helper="Minimum 20 characters. Maximum 5000 characters."
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                icon={Send}
                className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
              >
                {submitting ? 'Submitting securely…' : 'Submit Confidential Report'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'my-reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Submitted Confidential Reports</h2>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={loadingComplaints}
              onClick={loadMyComplaints}
            >
              Refresh
            </Button>
          </div>

          {complaintsError && <Alert variant="error">{complaintsError}</Alert>}

          {loadingComplaints && <p className="text-sm text-slate-500 py-6 text-center">Loading reports…</p>}

          {!loadingComplaints && myComplaints.length === 0 && (
            <Card className="text-center py-12">
              <Lock className="mx-auto h-10 w-10 text-slate-400 mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No confidential reports filed</h3>
              <p className="mt-1 text-sm text-slate-500">
                Any safety grievance or harassment reports you file will appear here securely.
              </p>
            </Card>
          )}

          {!loadingComplaints &&
            myComplaints.map((item) => (
              <Card key={item.ticketId || item.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">
                      #{item.ticketId || 'CONFIDENTIAL'}
                    </span>
                    <Badge tone="purple">{item.category}</Badge>
                  </div>
                  <Badge tone={item.status === 'RESOLVED' ? 'green' : 'amber'}>
                    {item.status || 'SUBMITTED'}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500">
                  Lodged on: {formatDateTime(item.createdAt)}
                </p>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
