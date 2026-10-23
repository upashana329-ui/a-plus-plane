import { useState } from 'react';
import { LogIn } from 'lucide-react';

import AuthShell, { AuthLink } from '../components/AuthShell';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/errors';
import { validateLogin } from '../utils/validators';

const FIELD_ORDER = ['studentId', 'password'];

export default function LoginPage() {
  useDocumentTitle('Student Login');

  const { login, sessionMessage, clearSessionMessage } = useAuth();
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
      document.getElementById(`login-${firstInvalid}`)?.focus();
      return;
    }

    clearSessionMessage();
    setSubmitting(true);

    try {
      // REAL API: POST /api/auth/login
      const student = await login(values);
      toast.success(`Welcome back, ${student.name}.`);
      // No navigate() here. After login succeeds, GuestRoute sends the user to
      // the correct dashboard based on the role returned by the backend.
    } catch (error) {
      setFormError(getErrorMessage(error, 'Login failed. Please check your details and try again.'));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      icon={LogIn}
      title="Student login"
      subtitle="Sign in to raise and track your grievances."
      footer={
        <>
          New to A+ Plane? <AuthLink to={ROUTES.register}>Create an account</AuthLink>
          <span className="mx-2 text-slate-300" aria-hidden="true">
            |
          </span>
          <AuthLink to={ROUTES.adminLogin}>Admin login</AuthLink>
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

        <Input
          id="login-studentId"
          name="studentId"
          label="Student ID"
          required
          autoComplete="username"
          autoCapitalize="characters"
          placeholder="e.g. TEST1001"
          value={values.studentId}
          onChange={handleChange}
          error={errors.studentId}
        />

        <Input
          id="login-password"
          name="password"
          type="password"
          label="Password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Button type="submit" fullWidth size="lg" loading={submitting}>
          {submitting ? 'Signing in…' : 'Log in'}
        </Button>
      </form>
    </AuthShell>
  );
}