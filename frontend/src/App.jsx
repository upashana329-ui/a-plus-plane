import { Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from './layouts/publiclayouts';
import DashboardLayout from './layouts/dashboardlayout';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';

import LandingPage from './pages/landingpage';
import LoginPage from './pages/Loginpage';
import RegisterPage from './pages/registerpage';
import AdminLoginPage from './pages/admin/adminloginpage';
import NotFoundPage from './pages/notfoundpage';

import StudentDashboardPage from './pages/student/studentdashboardpage';
import RaiseGrievancePage from './pages/student/raisegrievancepage';
import MyComplaintPage from './pages/student/mycomplaintpage';
import ComplaintDetailsPage from './pages/ComplaintDetails';
import ProfilePage from './pages/student/profilepage';

import AdminDashboardPage from './pages/admin/admindashboard';
import ManageComplaintsPage from './pages/admin/managecomplaintspage';

import BusManagement from './modules/bus/BusForm';
import HostelManagement from './modules/hostel/HostelForm';
import LostFound from './modules/lost-found/LostFoundForm';
import Subjects from './modules/subjects/SubjectForm';
import HerVoice from './modules/her-voice/HerVoiceForm';
import VoiceAssistant from './components/VoiceAssistant';
import AIChatbot from './components/AIChatbot';
import InstallPwaPrompt from './components/InstallPwaPrompt';

import { ROLES, ROUTES } from './utils/constants';

export default function App() {
  return (
    <>
      <Routes>
        {/* Public Website */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.home} element={<LandingPage />} />
        </Route>

        {/* Unauthenticated Guest Auth Routes */}
        <Route element={<GuestRoute />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
          <Route path={ROUTES.adminLogin} element={<AdminLoginPage />} />
        </Route>

        {/* Authenticated Student Portal */}
        <Route element={<ProtectedRoute role={ROLES.STUDENT} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.studentDashboard} element={<StudentDashboardPage />} />
            <Route path={ROUTES.raiseGrievance} element={<RaiseGrievancePage />} />
            <Route path={ROUTES.myComplaints} element={<MyComplaintPage />} />
            <Route path={ROUTES.complaintDetailsPattern} element={<ComplaintDetailsPage />} />
            <Route path={ROUTES.profile} element={<ProfilePage />} />

            {/* Campus Modules accessible to Students */}
            <Route path={ROUTES.bus} element={<BusManagement />} />
            <Route path={ROUTES.hostel} element={<HostelManagement />} />
            <Route path={ROUTES.lostFound} element={<LostFound />} />
            <Route path={ROUTES.subjects} element={<Subjects />} />
            <Route path={ROUTES.herVoice} element={<HerVoice />} />
            <Route path={ROUTES.safetyComplaint} element={<HerVoice />} />
            <Route path={ROUTES.cyberCare} element={<HerVoice />} />
            <Route path={ROUTES.voiceAssistant} element={<VoiceAssistant />} />
          </Route>
        </Route>

        {/* Authenticated Admin Console */}
        <Route element={<ProtectedRoute role={ROLES.ADMIN} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.adminDashboard} element={<AdminDashboardPage />} />
            <Route path={ROUTES.adminComplaints} element={<ManageComplaintsPage />} />
            <Route path="/admin/complaints/:id" element={<ComplaintDetailsPage />} />

            {/* Campus Modules accessible to Admins */}
            <Route path="/admin/bus" element={<BusManagement />} />
            <Route path="/admin/hostel" element={<HostelManagement />} />
            <Route path="/admin/lost-found" element={<LostFound />} />
            <Route path="/admin/subjects" element={<Subjects />} />
            <Route path="/admin/her-voice" element={<HerVoice />} />
          </Route>
        </Route>

        {/* Redirect shortcuts */}
        <Route path="/dashboard" element={<Navigate to={ROUTES.studentDashboard} replace />} />
        <Route path="/admin" element={<Navigate to={ROUTES.adminDashboard} replace />} />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Persistent Campus AI Assistant widget available across all routes */}
      <AIChatbot />

      {/* Android Progressive Web App (PWA) Install Prompt & Installation Guide */}
      <InstallPwaPrompt />
    </>
  );
}
