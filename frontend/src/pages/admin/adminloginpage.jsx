import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

import AuthShell, { AuthLink } from '../../components/AuthShell';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';
import { ROUTES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errors';
import { validateLogin } from '../../utils/validators';

const FIELD_ORDER = ['studentId', 'password'];

export default function AdminLoginPage() {
  useDocumentTitle('Admin Login');

  const { adminLogin, sessionMessage, clearSessionMessage } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState({ studentId: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    setFormError('');

    const firstInvalid = FIELD_ORDER.find((field) => validationErrors[field]);
    if (firstInvalid) {
      document.getElementById(`admin-login-${firstInvalid}`)?.focus();
      return;
    }

    clearSessionMessage();
    setSubmitting(true);

    try {
      // Uses the real login API. A session is created ONLY if the backend
      // reports role ADMIN; otherwise adminLogin throws and nothing is saved.
      const admin = await adminLogin(values);
      toast.success(`Signed in as ${admin.name}.`);
      // GuestRoute then sends the admin to the admin dashboard.
    } catch (error) {
      setFormError(getErrorMessage(error, 'Admin login failed. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      icon={ShieldCheck}
      title="Admin login"
      subtitle="For authorised college staff only."
      footer={
        <>
          Are you a student? <AuthLink to={ROUTES.login}>Student login</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {sessionMessage && (
          <Alert variant="warning" onDismiss={clearSessionMessage}>
            {sessionMessage}
          </Alert>
        )}

        {formError && <Alert variant="error">{formError}</Alert>}

        <Alert variant="info" title="How admin access works">
          Your account must have the ADMIN role in the database. The role comes from the server and cannot be
          granted from this page.
        </Alert>

        <Input
          id="admin-login-studentId"
          name="studentId"
          label="Administrator ID"
          required
          autoComplete="username"
          autoCapitalize="characters"
          value={values.studentId}
          onChange={handleChange}
          error={errors.studentId}
        />

        <Input
          id="admin-login-password"
          name="password"
          type="password"
          label="Password"
          required
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Button type="submit" fullWidth size="lg" loading={submitting}>
          {submitting ? 'Signing in…' : 'Sign in as admin'}
        </Button>
      </form>
    </AuthShell>
  );
}