import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, IdCard, Layers, LogOut, ShieldCheck, User } from 'lucide-react';

import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';
import { ROUTES } from '../../utils/constants';
import { getInitials } from '../../utils/format';

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-medium text-slate-900">{value || '—'}</dd>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  useDocumentTitle('My Profile');

  const { student, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Go home first so the protected page does not bounce to the login page.
    navigate(ROUTES.home, { replace: true });
    logout();
    toast.info('You have been logged out.');
  };

  const roleLabel = student.role === 'ADMIN' ? 'Administrator' : 'Student';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My profile</h1>
        <p className="mt-1 text-sm text-slate-600">Your student details as registered with A+ Plane.</p>
      </div>

      <Card>
        <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700"
            aria-hidden="true"
          >
            {getInitials(student.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xl font-bold text-slate-900">{student.name}</p>
            <p className="truncate text-sm text-slate-500">{student.studentId}</p>
          </div>
        </div>

        <CardHeader title="Student details" />
        <dl className="grid gap-6 sm:grid-cols-2">
          <ProfileRow icon={User} label="Full name" value={student.name} />
          <ProfileRow icon={IdCard} label="Student ID" value={student.studentId} />
          <ProfileRow icon={BookOpen} label="Course" value={student.course} />
          <ProfileRow icon={GraduationCap} label="Semester" value={student.semester ? `Semester ${student.semester}` : ''} />
          <ProfileRow icon={Layers} label="Section" value={student.section ? `Section ${student.section}` : ''} />
          <ProfileRow icon={ShieldCheck} label="Account type" value={roleLabel} />
        </dl>
      </Card>

      <Alert variant="info" title="About this information">
        These details were returned by the server when you logged in. Your password is never stored or shown in
        this app. Your login session lives in this browser tab only and ends when you close the tab or log out.
      </Alert>

      <Card>
        <CardHeader title="Session" description="Log out to end your session on this device." />
        <Button variant="danger" icon={LogOut} onClick={handleLogout}>
          Log out
        </Button>
      </Card>
    </div>
  );
}