import { useState } from 'react';
import { UserPlus } from 'lucide-react';

import AuthShell, { AuthLink } from '../components/AuthShell';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';
import { COURSES, ROUTES, SECTIONS, SEMESTERS } from '../utils/constants';
import { getErrorMessage, isDuplicateStudentError } from '../utils/errors';
import { validateRegistration } from '../utils/validators';

const FIELD_ORDER = ['name', 'studentId', 'course', 'semester', 'section', 'password', 'confirmPassword'];

const INITIAL_VALUES = {
  name: '',
  studentId: '',
  course: '',
  semester: '',
  section: '',
  password: '',
  confirmPassword: '',
};

const SEMESTER_OPTIONS = SEMESTERS.map((number) => ({ value: String(number), label: `Semester ${number}` }));
const SECTION_OPTIONS = SECTIONS.map((letter) => ({ value: letter, label: `Section ${letter}` }));

export default function RegisterPage() {
  useDocumentTitle('Student Registration');

  const { register } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const focusField = (field) => document.getElementById(`register-${field}`)?.focus();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = validateRegistration(values);
    setErrors(validationErrors);
    setFormError('');

    const firstInvalid = FIELD_ORDER.find((field) => validationErrors[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setSubmitting(true);

    try {
      // REAL API: POST /api/auth/register
      // The backend returns a token, so the user is signed in straight away.
      await register(values);
      toast.success('Your account has been created. Welcome to A+ Plane!');
      // GuestRoute moves the user to their dashboard once the session starts.
    } catch (error) {
      if (isDuplicateStudentError(error)) {
        setErrors({ studentId: 'This Student ID is already registered. Try logging in instead.' });
        focusField('studentId');
      } else {
        setFormError(getErrorMessage(error, 'Registration failed. Please check your details and try again.'));
      }
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      wide
      icon={UserPlus}
      title="Create your student account"
      subtitle="Fill in your details to start raising grievances."
      footer={
        <>
          Already registered? <AuthLink to={ROUTES.login}>Log in</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert variant="error">{formError}</Alert>}

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id="register-name"
            name="name"
            label="Full name"
            required
            autoComplete="name"
            placeholder="e.g. Test Student"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />

          <Input
            id="register-studentId"
            name="studentId"
            label="Student ID"
            required
            autoComplete="username"
            autoCapitalize="characters"
            placeholder="e.g. TEST1001"
            hint="Letters, numbers, hyphens or underscores."
            value={values.studentId}
            onChange={handleChange}
            error={errors.studentId}
          />
        </div>

        <Select
          id="register-course"
          name="course"
          label="Course"
          required
          placeholder="Select your course"
          options={COURSES}
          value={values.course}
          onChange={handleChange}
          error={errors.course}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            id="register-semester"
            name="semester"
            label="Semester"
            required
            placeholder="Select semester"
            options={SEMESTER_OPTIONS}
            value={values.semester}
            onChange={handleChange}
            error={errors.semester}
          />

          <Select
            id="register-section"
            name="section"
            label="Section"
            required
            placeholder="Select section"
            options={SECTION_OPTIONS}
            value={values.section}
            onChange={handleChange}
            error={errors.section}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id="register-password"
            name="password"
            type="password"
            label="Password"
            required
            autoComplete="new-password"
            hint="At least 8 characters, with a letter and a number."
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Input
            id="register-confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            required
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
        </div>

        <Button type="submit" fullWidth size="lg" loading={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}