# A+ Plane — Smart Campus Services & Student Grievance Portal

A unified, production-oriented digital campus platform where university students can securely log in, raise grievances with real-time status tracking, access academic information, request hostel rooms, view campus bus routes, report lost & found belongings, access confidential safety support (Her Voice), and interact with an AI & Voice campus assistant.

---

## 1. System Architecture & Tech Stack

### Frontend
- **Framework**: React 18 with Vite 6
- **Routing**: React Router DOM v6 with protected routes and guest redirection
- **Styling**: Tailwind CSS v4 design system with modern glassmorphism, responsive navigation drawers, and accessible color contrast
- **Icons**: Lucide React
- **Data Visualization**: Recharts (admin analytics, status breakdown, trend metrics)
- **Speech & AI**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) + AI Assistant widget

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with strict type checking
- **ORM**: Prisma Client v6
- **Database**: PostgreSQL (Neon Cloud Database)
- **Validation**: Zod schema validation on all incoming payloads
- **Security**:
  - `bcryptjs` password hashing (salt rounds: 12)
  - `jsonwebtoken` (JWT) authentication with role-based access control (RBAC)
  - `helmet` security headers
  - `express-rate-limit` DDoS and brute-force mitigation
  - CORS policy enforcement with configurable origins
  - Centralized error handling and graceful shutdown listeners (`SIGINT`, `SIGTERM`)

---

## 2. Platform Modules & Features

### 1. Grievance Management System
- **Categories**: Academic, Examination, Hostel, Library, Transport, Infrastructure, IT & Wi-Fi, Fees & Accounts, Safety & Discipline, Other.
- **Unique Ticket Generation**: Every complaint receives an official, readable ticket (e.g. `TKT-19542`).
- **Complete Status Lifecycle**:
  - `SUBMITTED` → `UNDER_REVIEW` → `ASSIGNED` → `IN_PROGRESS` → `AWAITING_INFORMATION` → `RESOLVED` → `REOPENED` → `CLOSED`
- **Chronological Audit Timeline**: Shows the submission time, assigned officer, resolution notes, and status transition timestamps.
- **Reopening Mechanism**: Students can reopen resolved or closed tickets if they require further administrative review.
- **Ownership & Privacy**: Students can view only their own grievances. Tampering with IDs or API requests returns 403 Forbidden.

### 2. Administrator Console
- **Analytics & Metrics**: Overview cards (Total, Open, In Progress, Resolved) and Recharts charts for category distribution and volume trends.
- **Grievance Moderation**: Filter complaints by status, category, priority, or search term.
- **Staff Assignment**: Assign tickets to designated campus officers (e.g., IT Systems Team, Hostel Warden Desk, Transport Incharge).
- **Official Status Updates**: Apply resolution notes and update ticket status directly to PostgreSQL.

### 3. Campus Bus Management & Transit Grievance System
- **Unified Transit Route**: Direct campus connection — **Campus to Haldwani** (`BUS-HALDWANI`).
- **Dedicated Schedule**: Daily night transit operating from **1:00 AM to 4:30 AM**.
- **Bus Grievance System**: Students can lodge complaints across 7 categories (Bus Arrived Late, Bus Left Without Me, Bus Did Not Arrive, Bus Missed My Pickup Stop, Bus Route Problem, Bus Timing Mismatch, Other Bus Problems).
- **Complaint Tracking**: Generates unique ticket IDs (e.g., `BUS-TKT-XXXXX`) with live status tracking (`Pending`, `Under Review`, `In Progress`, `Resolved`, `Rejected`) and administrative remarks.
- **Admin Bus Dashboard**: Problem detection analytics (late bus frequencies, left-behind counts, missed stops), status updates, and official resolution remarks.

### 4. Hostel & Accommodation
- View campus residence blocks (e.g., Mandakini Residence, Bhagirathi Residence) with room numbers and capacities.
- Submit accommodation, room change, or maintenance requests.
- Track request approval status (`PENDING`, `APPROVED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`).

### 5. Campus Lost & Found
- Post found or missing belongings with category, campus location, and description.
- Search and filter items (`OPEN`, `CLAIMED`, `RESOLVED`).
- Safe owner controls: only the listing owner or administrators can update listing resolution.

### 6. Academic Curriculum & Subjects
- Filter subjects and syllabus credits tailored to the student's registered course and semester.
- View subject code, credit value, and faculty details.

### 7. Her Voice — Safety & Confidential Reporting
- Discreet, non-judgmental support reporting for ragging, harassment, cyber threats, or unsafe conditions.
- Strict confidentiality: reports are flagged as `isConfidential: true` and are isolated from public grievance lists, accessible only to designated administrators.
- Immediate campus helpline numbers and emergency contact guidance (112 / Women Helpline 1090).

### 8. Campus AI & Voice Assistant
- Interactive floating assistant accessible from all pages.
- Supports voice input via browser microphone (`SpeechRecognition`) and text questions.
- Answers real campus questions using live database queries for bus routes, hostels, subjects, and grievances.

---

## 3. Pre-configured Credentials

The database comes seeded with demo student and administrator credentials:

| Role | Student ID | Password | Access Area |
|------|------------|----------|-------------|
| **Student** | `TEST1001` | `Student@123` | Student Dashboard, Grievance, Bus, Hostel, Academics |
| **Administrator** | `ADMIN01` | `Admin@123` | Admin Dashboard, Grievance Moderation, Overview |

Students can also register new accounts anytime via `/register`.

---

## 4. Local Development Setup

### Prerequisites
- Node.js 18+ (tested on Node 20 / 22 / 24)
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install
# Generate Prisma Client
npx prisma generate
# Seed initial demo accounts and campus modules
npm run seed
# Start backend in development mode (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Start frontend in development mode (runs on http://localhost:5173)
npm run dev
```

### 3. Running Unit Tests
```bash
cd backend
npm test
```

---

## 5. Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-here-min-32-chars"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
VITE_API_BASE_URL="http://localhost:5000/api"
```

---

## 6. Production Deployment Instructions

### Deploying the Backend (e.g., Render / Railway / AWS EC2)
1. Set the repository root directory or root to `backend`.
2. **Build Command**: `npm install && npx prisma generate && npm run build`
3. **Start Command**: `npm start` (runs `node dist/server.js`)
4. Configure environment variables in the host dashboard:
   - `DATABASE_URL` (Neon PostgreSQL connection string)
   - `JWT_SECRET` (Secure 64+ char random token)
   - `FRONTEND_URL` (Your production frontend URL, e.g., `https://aplusplane.vercel.app`)
   - `NODE_ENV=production`

### Deploying the Frontend (e.g., Vercel / Netlify / Cloudflare Pages)
1. Set root directory to `frontend`.
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. Configure environment variables:
   - `VITE_API_BASE_URL=https://your-backend-service.onrender.com/api`
   - `VITE_API_URL=https://your-backend-service.onrender.com/api`
5. Configure SPA fallback: Ensure all paths redirect to `index.html` for React Router.

---

## 7. API Endpoints Reference

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| `GET` | `/api/health` | Public | Database & API health connectivity check |
| `POST` | `/api/auth/register` | Public | Student registration |
| `POST` | `/api/auth/login` | Public | Student & Admin login (returns JWT token) |
| `GET` | `/api/student/profile` | Student | Authenticated student profile information |
| `GET` | `/api/student/dashboard` | Student | Student grievance counts and module metrics |
| `POST` | `/api/complaints` | Student | Submit new grievance ticket |
| `GET` | `/api/complaints/my` | Student | List complaints filed by current student |
| `GET` | `/api/complaints/:id` | Student/Admin | Get detailed complaint information and history |
| `POST` | `/api/complaints/:id/reopen`| Student | Reopen resolved or closed complaint |
| `GET` | `/api/admin/overview` | Admin | Aggregate statistics and category breakdowns |
| `GET` | `/api/admin/complaints` | Admin | Filter and list all campus grievances |
| `PATCH` | `/api/admin/complaints/:id/status` | Admin | Update complaint status and resolution notes |
| `PATCH` | `/api/admin/complaints/:id/assign` | Admin | Assign complaint to designated staff member |
| `GET` | `/api/bus/routes` | Authenticated | List all bus routes, stops, and schedules |
| `POST` | `/api/bus/assignments` | Student | Enroll student in selected bus route |
| `GET` | `/api/hostels` | Authenticated | List all hostel blocks and room capacities |
| `POST` | `/api/hostels/requests` | Student | Submit hostel accommodation/maintenance request |
| `GET` | `/api/hostels/requests` | Student/Admin | List hostel requests (filtered by role) |
| `GET` | `/api/lost-found` | Authenticated | List lost & found listings with search filter |
| `POST` | `/api/lost-found` | Student | Create lost or found item listing |
| `PATCH` | `/api/lost-found/:id/status` | Owner/Admin | Mark listing as claimed or resolved |
| `GET` | `/api/subjects` | Student | View curriculum subjects for current course & semester |
| `POST` | `/api/safety/complaints` | Student | Submit confidential safety report |
| `GET` | `/api/safety/admin/complaints` | Admin | Review confidential safety reports |
| `POST` | `/api/ai/chat` | Public/Auth | Query campus AI assistant with natural language |
