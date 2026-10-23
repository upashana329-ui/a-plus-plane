import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FilePlus2,
  LayoutDashboard,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  UserPlus,
} from 'lucide-react';

import Badge, { StatusBadge } from '../components/ui/Badge';
import { buttonStyles } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { COMPLAINT_STATUS, ROUTES } from '../utils/constants';

const FEATURES = [
  {
    icon: FilePlus2,
    title: 'Raise a grievance in minutes',
    text: 'Describe the problem, pick a category and submit. No paperwork and no queues.',
  },
  {
    icon: Activity,
    title: 'Track every status change',
    text: 'Follow a complaint from Submitted to Resolved with a clear status timeline.',
  },
  {
    icon: Search,
    title: 'Find complaints quickly',
    text: 'Search and filter your complaints by status or category whenever you need to check one.',
  },
  {
    icon: LayoutDashboard,
    title: 'One simple dashboard',
    text: 'See how many complaints are open or resolved, and jump straight to what needs attention.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure student login',
    text: 'Sign in with your Student ID. Passwords are hashed by the server and never stored in the browser.',
  },
  {
    icon: Smartphone,
    title: 'Works on every screen',
    text: 'Use the portal on a phone, tablet or laptop with the same easy layout.',
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: 'Create your account',
    text: 'Register once with your Student ID, course, semester and section.',
  },
  {
    icon: Send,
    title: 'Submit your grievance',
    text: 'Write a clear title and description, and choose the right category.',
  },
  {
    icon: Activity,
    title: 'Follow the progress',
    text: 'Check your dashboard to see whether it is under review or in progress.',
  },
  {
    icon: CheckCircle2,
    title: 'Get a resolution',
    text: 'Once the issue is handled, the complaint is marked Resolved.',
  },
];

// A small decorative preview. It is clearly labelled as a sample.
function SamplePreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Sample complaint</p>
          <Badge tone="amber">Illustration only</Badge>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Ticket ID: SAMPLE-0001</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Wi-Fi not working in the library</p>
              <p className="mt-0.5 text-xs text-slate-500">Category: IT &amp; Wi-Fi</p>
            </div>
            <StatusBadge status={COMPLAINT_STATUS.IN_PROGRESS} />
          </div>
        </div>

        <ol className="mt-4 space-y-3 text-sm">
          {[COMPLAINT_STATUS.SUBMITTED, COMPLAINT_STATUS.UNDER_REVIEW, COMPLAINT_STATUS.IN_PROGRESS].map(
            (status) => (
              <li key={status} className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-brand-600" aria-hidden="true" />
                {status}
              </li>
            ),
          )}
          <li className="flex items-center gap-3 text-slate-400">
            <span className="h-5 w-5 rounded-full border-2 border-slate-300" aria-hidden="true" />
            {COMPLAINT_STATUS.RESOLVED}
          </li>
        </ol>
      </div>
    </div>
  );
}

export default function LandingPage() {
  useDocumentTitle('');

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-50/70">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <Badge tone="blue">College Grievance Portal</Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Raise your concerns. <span className="text-brand-600">Track every step.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              A+ Plane gives students one clear place to report academic, hostel, library, transport and
              other campus issues, and to see exactly where each complaint stands.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={ROUTES.register} className={buttonStyles({ size: 'lg' })}>
                Create student account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to={ROUTES.login} className={buttonStyles({ variant: 'outline', size: 'lg' })}>
                Student login
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Staff member?{' '}
              <Link to={ROUTES.adminLogin} className="font-semibold text-brand-700 hover:underline">
                Admin login
              </Link>
            </p>

            <p className="mt-6 max-w-xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="font-semibold">Project status:</span> registration and login are connected to
              the live backend. Complaint and admin screens currently show clearly labelled demo data.
            </p>
          </div>

          <SamplePreview />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to be heard</h2>
            <p className="mt-3 text-slate-600">
              Simple tools built around how students actually raise and follow up on problems.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
            <p className="mt-3 text-slate-600">Four simple steps from problem to resolution.</p>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-brand-700">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Ready to raise your first grievance?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Create your account in under a minute, or log in if you already have one.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={ROUTES.register} className={buttonStyles({ variant: 'light', size: 'lg' })}>
              Register now
            </Link>
            <Link to={ROUTES.login} className={buttonStyles({ variant: 'outlineLight', size: 'lg' })}>
              Log in
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}