import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Home, RefreshCw, Send, Wrench } from 'lucide-react';
import { apiRequest } from '../../services/api';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/format';

const REQUEST_TYPES = [
  { value: 'ALLOCATION', label: 'Room Allocation / Change' },
  { value: 'MAINTENANCE', label: 'Hostel Room / Washroom Maintenance' },
  { value: 'OTHER', label: 'General Hostel Request / Inquiry' },
];

export default function HostelManagement() {
  useDocumentTitle('Hostel Management');
  const toast = useToast();

  const [hostels, setHostels] = useState([]);
  const [requests, setRequests] = useState([]);
  const [hostelId, setHostelId] = useState('');
  const [type, setType] = useState('ALLOCATION');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [h, r] = await Promise.all([
        apiRequest('/hostels'),
        apiRequest('/hostels/requests'),
      ]);

      const hostelList = Array.isArray(h) ? h : [];
      setHostels(hostelList);
      setRequests(Array.isArray(r) ? r : []);

      if (hostelList.length > 0 && !hostelId) {
        setHostelId(hostelList[0].id);
      }
    } catch (err) {
      setError(err.message || 'Unable to load hostel details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submitRequest(event) {
    event.preventDefault();
    if (!hostelId) return;

    setSubmitting(true);
    setError('');

    try {
      await apiRequest('/hostels/requests', {
        method: 'POST',
        body: JSON.stringify({ hostelId, type, description }),
      });

      setDescription('');
      toast.success('Your hostel request has been logged successfully.');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hostel & Accommodation Management</h1>
          <p className="text-sm text-slate-500">
            Check residential block availability, submit room allocation requests, and report facility maintenance.
          </p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} loading={loading} onClick={loadData}>
          Refresh
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Available Hostels Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Hostels & Room Availability</h2>
        {loading ? (
          <p className="py-6 text-sm text-slate-500">Loading hostel details…</p>
        ) : hostels.length === 0 ? (
          <Card className="text-center py-8">
            <Building2 className="mx-auto h-10 w-10 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">No hostel records registered yet.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hostels.map((hostel) => (
              <Card key={hostel.id} className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <Badge tone="blue">{hostel.rooms?.length || 0} Rooms</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{hostel.name}</h3>
                  <p className="text-xs text-slate-500">{hostel.address}</p>
                </div>
                {hostel.rooms && hostel.rooms.length > 0 && (
                  <div className="space-y-1 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                    {hostel.rooms.slice(0, 3).map((room) => {
                      const available = Math.max(0, room.capacity - room.occupied);
                      return (
                        <div key={room.id} className="flex justify-between">
                          <span>Room {room.roomNumber}</span>
                          <span className={available > 0 ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                            {available} of {room.capacity} beds free
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request Form */}
      <Card>
        <CardHeader
          title="Submit a Hostel Request"
          description="Log room allocation inquiries or maintenance complaints."
        />
        <form onSubmit={submitRequest} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="hostel-select"
              label="Select Hostel Block"
              value={hostelId}
              onChange={(e) => setHostelId(e.target.value)}
              options={hostels.map((h) => ({ value: h.id, label: `${h.name} (${h.address})` }))}
              required
            />
            <Select
              id="hostel-request-type"
              label="Request Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={REQUEST_TYPES}
              required
            />
          </div>

          <Textarea
            id="hostel-desc"
            label="Details of your request"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Please check leaking pipe in bathroom of room 204, or request for semester room allocation."
            minLength={5}
            maxLength={1500}
            required
            helper="Minimum 5 characters. Maximum 1500 characters."
          />

          <Button type="submit" variant="primary" loading={submitting} icon={Send} disabled={!hostelId}>
            {submitting ? 'Submitting…' : 'Submit Hostel Request'}
          </Button>
        </form>
      </Card>

      {/* Past Requests */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">My Hostel Requests</h2>
        {requests.length === 0 ? (
          <Card className="py-8 text-center text-sm text-slate-500">
            No active hostel requests lodged yet.
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <Card key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {r.type}
                    </span>
                    <Badge tone={r.status === 'RESOLVED' ? 'green' : 'amber'}>
                      {r.status || 'PENDING'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-800">{r.description}</p>
                  {r.createdAt && (
                    <p className="text-xs text-slate-400">Lodged: {formatDateTime(r.createdAt)}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
