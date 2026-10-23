// ---------- App identity ----------
export const APP_NAME = 'A+ Plane';
export const APP_TAGLINE = 'Smart Campus Services & Student Grievance Portal';

// ---------- API ----------
// Set in .env as VITE_API_BASE_URL or VITE_API_URL. The fallback matches your local backend.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost'
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api');

// ---------- Which backend features really exist? ----------
// All real database-backed endpoints are active and connected.
export const API_AVAILABILITY = {
  auth: true,
  complaints: true,
  profileApi: true,
  admin: true,
  bus: true,
  hostel: true,
  lostFound: true,
  subjects: true,
  safety: true,
  ai: true,
};

export const SEED_STUDENT_DEMO_COMPLAINTS = false;

// ---------- Roles ----------
export const ROLES = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
};

// ---------- Route paths (one source of truth) ----------
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  adminLogin: '/admin/login',

  studentDashboard: '/student/dashboard',
  raiseGrievance: '/student/raise-grievance',
  myComplaints: '/student/complaints',
  complaintDetailsPattern: '/student/complaints/:id',
  complaintDetails: (id) => `/student/complaints/${encodeURIComponent(id)}`,
  profile: '/student/profile',

  adminDashboard: '/admin/dashboard',
  adminComplaints: '/admin/complaints',

  bus: '/bus',
  hostel: '/hostel',
  lostFound: '/lost-found',
  subjects: '/subjects',
  herVoice: '/her-voice',
  cyberCare: '/cyber-care',
  safetyComplaint: '/safety-complaint',
  voiceAssistant: '/voice-assistant',
};

// ---------- Form option lists ----------
export const COURSES = [
  'B.Tech CSE AI-ML',
  'B.Tech CSE',
  'B.Tech CSE Data Science',
  'B.Tech IT',
  'B.Tech ECE',
  'B.Tech Mechanical',
  'B.Tech Civil',
  'BCA',
  'MCA',
  'MBA',
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
export const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const COMPLAINT_CATEGORIES = [
  'Academic',
  'Examination',
  'Hostel',
  'Library',
  'Transport',
  'Infrastructure',
  'IT & Wi-Fi',
  'Fees & Accounts',
  'Safety & Discipline',
  'Other',
];

export const COMPLAINT_STATUS = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  AWAITING_INFORMATION: 'AWAITING_INFORMATION',
  RESOLVED: 'RESOLVED',
  REOPENED: 'REOPENED',
  CLOSED: 'CLOSED',
};

export const COMPLAINT_STATUS_LABELS = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  AWAITING_INFORMATION: 'Awaiting Info',
  RESOLVED: 'Resolved',
  REOPENED: 'Reopened',
  CLOSED: 'Closed',
  // Backwards compatibility with title-cased labels
  Submitted: 'Submitted',
  'Under Review': 'Under Review',
  'In Progress': 'In Progress',
  Resolved: 'Resolved',
  Rejected: 'Closed',
};

export const COMPLAINT_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'AWAITING_INFORMATION',
  'RESOLVED',
  'REOPENED',
  'CLOSED',
];

export const PRIORITIES = ['Low', 'Medium', 'High'];

// ---------- Campus Bus Transit & Grievance Constants ----------
export const BUS_ROUTE_NAME = 'Campus to Haldwani';
export const BUS_ROUTE_CODE = 'BUS-HALDWANI';
export const BUS_TIMING_FROM = '1:00 AM';
export const BUS_TIMING_TO = '4:30 AM';
export const BUS_TIMING_DISPLAY = '1:00 AM – 4:30 AM (Daily)';

export const BUS_COMPLAINT_CATEGORIES = [
  'Bus Arrived Late',
  'Bus Left Without Me',
  'Bus Did Not Arrive',
  'Bus Missed My Pickup Stop',
  'Bus Route Problem',
  'Bus Timing Mismatch',
  'Other Bus Problems',
];

export const BUS_COMPLAINT_CATEGORY_DESCRIPTIONS = {
  'Bus Arrived Late': 'The bus arrived later than the scheduled time.',
  'Bus Left Without Me': 'The bus departed before I could board it or left me behind.',
  'Bus Did Not Arrive': 'The scheduled bus did not arrive at the pickup point.',
  'Bus Missed My Pickup Stop': 'The bus passed the assigned stop without picking me up.',
  'Bus Route Problem': 'The bus followed the wrong route or did not cover the expected route.',
  'Bus Timing Mismatch': 'The actual bus timing differs from the displayed schedule.',
  'Other Bus Problems': 'Students can report any other transportation-related issue.',
};

export const BUS_COMPLAINT_STATUSES = [
  'Pending',
  'Under Review',
  'In Progress',
  'Resolved',
  'Rejected',
];
