import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';

import DemoBanner from '../../components/DemoBanner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';
import { createComplaint } from '../../services/complaintService';
import { API_AVAILABILITY, COMPLAINT_CATEGORIES, PRIORITIES, ROUTES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errors';
import { validateComplaint } from '../../utils/validators';

const FIELD_ORDER = ['title', 'category', 'description', 'priority'];
const INITIAL_VALUES = { title: '', category: '', description: '', priority: '' };

function SummaryRow({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export default function RaiseGrievancePage() {
  useDocumentTitle('Raise a Grievance');

  const { student } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
  };

  // Step 1: validate, then ask for confirmation.
  const handleReview = (event) => {
    event.preventDefault();

    const validationErrors = validateComplaint(values);
    setErrors(validationErrors);

    const firstInvalid = FIELD_ORDER.find((field) => validationErrors[field]);
    if (firstInvalid) {
      document.getElementById(`grievance-${firstInvalid}`)?.focus();
      return;
    }

    setSubmitError('');
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (!submitting) setConfirmOpen(false);
  };

  // Step 2: the student confirms.
  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      // DEMO SERVICE: stored in browser memory only (see complaintService.js).
      const complaint = await createComplaint(student.studentId, values);
      toast.success(
        API_AVAILABILITY.complaints
          ? `Grievance submitted. Your ticket ID is ${complaint.ticketId}.`
          : `Demo grievance created (${complaint.ticketId}). It was not saved to the database.`,
      );
      setConfirmOpen(false);
      navigate(ROUTES.complaintDetails(complaint.id));
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'We could not submit your grievance. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Raise a grievance</h1>
        <p className="mt-1 text-sm text-slate-600">
          Describe the problem clearly so the right team can look into it.
        </p>
      </div>

      {!API_AVAILABILITY.complaints && (
        <DemoBanner title="Demo submission">
          The backend cannot save complaints yet. A grievance submitted here is kept in your browser’s memory
          only, is not stored in the database, and disappears when you refresh the page.
        </DemoBanner>
      )}

      <Card>
        <form onSubmit={handleReview} noValidate className="space-y-5">
          <Input
            id="grievance-title"
            name="title"
            label="Complaint title"
            required
            maxLength={120}
            placeholder="e.g. Projector not working in Room 302"
            value={values.title}
            onChange={handleChange}
            error={errors.title}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              id="grievance-category"
              name="category"
              label="Category"
              required
              placeholder="Select a category"
              options={COMPLAINT_CATEGORIES}
              value={values.category}
              onChange={handleChange}
              error={errors.category}
            />

            <Select
              id="grievance-priority"
              name="priority"
              label="Priority (optional)"
              placeholder="Not specified (Medium)"
              options={PRIORITIES}
              hint="Frontend-only for now: the backend does not support priority yet."
              value={values.priority}
              onChange={handleChange}
              error={errors.priority}
            />
          </div>

          <Textarea
            id="grievance-description"
            name="description"
            label="Detailed description"
            required
            rows={7}
            maxLength={2000}
            showCount
            placeholder="What happened? Where and when? What have you already tried?"
            hint="At least 20 characters. Do not include passwords or other private information."
            value={values.description}
            onChange={handleChange}
            error={errors.description}
          />

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setValues(INITIAL_VALUES);
                setErrors({});
              }}
            >
              Clear form
            </Button>
            <Button type="submit" icon={Send}>
              Review and submit
            </Button>
          </div>
        </form>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={closeConfirm}
        dismissible={!submitting}
        title="Submit this grievance?"
        description="Please check the details below before you submit."
        footer={
          <>
            <Button variant="outline" onClick={closeConfirm} disabled={submitting}>
              Go back and edit
            </Button>
            <Button onClick={handleConfirm} loading={submitting}>
              {submitting ? 'Submitting…' : API_AVAILABILITY.complaints ? 'Confirm and submit' : 'Confirm (demo)'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {submitError && <Alert variant="error">{submitError}</Alert>}

          {!API_AVAILABILITY.complaints && (
            <Alert variant="warning">
              This is a demo submission. It will not be saved to the database.
            </Alert>
          )}

          <dl className="space-y-3">
            <SummaryRow label="Title">{values.title.trim()}</SummaryRow>
            <SummaryRow label="Category">{values.category}</SummaryRow>
            <SummaryRow label="Priority (frontend-only)">{values.priority || 'Not specified (Medium)'}</SummaryRow>
            <SummaryRow label="Description">{values.description.trim()}</SummaryRow>
          </dl>
        </div>
      </Modal>
    </div>
  );
}