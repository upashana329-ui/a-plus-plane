import { useEffect, useState } from 'react';
import { CheckCircle2, PackageSearch, PlusCircle, RefreshCw, Search, Tag } from 'lucide-react';
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

const CATEGORIES = [
  { value: 'Electronics', label: 'Electronics (Laptops, Chargers, Earphones)' },
  { value: 'Books', label: 'Books, Notebooks & Stationary' },
  { value: 'Identity card', label: 'ID Cards, Keys & Wallets' },
  { value: 'Clothing', label: 'Clothing, Bags & Water Bottles' },
  { value: 'Other', label: 'Other Items' },
];

export default function LostFound() {
  useDocumentTitle('Campus Lost & Found');
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  async function loadItems(query = search) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        search: query,
        status: 'ALL',
      });

      const res = await apiRequest(`/lost-found?${params.toString()}`);
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || 'Unable to load lost & found items.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems('');
  }, []);

  async function submitReport(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await apiRequest('/lost-found', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          category,
          location,
        }),
      });

      setTitle('');
      setDescription('');
      setLocation('');
      setShowAddForm(false);
      toast.success('Your lost & found item report has been published.');
      await loadItems();
    } catch (err) {
      toast.error(err.message || 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await apiRequest(`/lost-found/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      toast.success('Status updated successfully.');
      await loadItems();
    } catch (err) {
      toast.error(err.message || 'Could not update status.');
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campus Lost & Found Portal</h1>
          <p className="text-sm text-slate-500">
            Report misplaced belongings or help reunite fellow students with lost campus items.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => setShowAddForm((v) => !v)}
          >
            {showAddForm ? 'Cancel Report' : 'Report an Item'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={() => loadItems()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Report Form Collapse */}
      {showAddForm && (
        <Card className="border-brand-200 bg-brand-50/20">
          <CardHeader
            title="Report a Lost or Found Item"
            description="Provide identifiable details so the rightful owner can claim it."
          />
          <form onSubmit={submitReport} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="lf-title"
                label="Item Name / Summary"
                placeholder="e.g. Blue Dell Laptop Charger"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                minLength={2}
                maxLength={120}
                required
              />
              <Select
                id="lf-category"
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={CATEGORIES}
                required
              />
            </div>

            <Input
              id="lf-location"
              label="Location Where Found / Lost"
              placeholder="e.g. Block C Library 2nd Floor, Table 14"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={150}
              required
            />

            <Textarea
              id="lf-desc"
              label="Description & Distinguishing Features"
              rows={3}
              placeholder="Describe color, stickers, model details, or where it can be claimed."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={5}
              maxLength={2000}
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                Publish Report
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadItems(search);
        }}
        className="flex gap-2"
      >
        <div className="flex-1">
          <Input
            id="search-input"
            placeholder="Search by keyword, item name, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" icon={Search}>
          Search
        </Button>
      </form>

      {/* Item List */}
      <div>
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Searching items…</p>
        ) : items.length === 0 ? (
          <Card className="py-12 text-center">
            <PackageSearch className="mx-auto h-12 w-12 text-slate-400 mb-2" />
            <h3 className="text-base font-semibold text-slate-800">No items match your query</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try searching with broader terms or report a new lost/found item above.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id} className="flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone="blue">{item.category}</Badge>
                    <Badge tone={item.status === 'RESOLVED' ? 'green' : 'amber'} dot>
                      {item.status || 'OPEN'}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <p>
                    <strong className="text-slate-700">Location:</strong> {item.location}
                  </p>
                  <p>
                    <strong className="text-slate-700">Reported by:</strong>{' '}
                    {item.reporter?.name || 'Fellow Student'}
                  </p>
                  {item.createdAt && <p>Posted: {formatDateTime(item.createdAt)}</p>}

                  {item.status !== 'RESOLVED' && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => updateStatus(item.id, 'RESOLVED')}
                      >
                        Mark Claimed / Resolved
                      </Button>
                    </div>
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
