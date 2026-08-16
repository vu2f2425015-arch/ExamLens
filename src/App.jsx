import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './utils/ProtectedRoute';

// Layouts
import AdminLayout   from './pages/Admin/AdminLayout';
import TeacherLayout from './pages/Teacher/TeacherLayout';
import StudentLayout from './pages/Student/StudentLayout';

// Auth
import Login from './pages/Login/Login';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import Students       from './pages/Admin/Students';
import Teachers       from './pages/Admin/Teachers';
import Divisions      from './pages/Admin/Divisions';
import Exams          from './pages/Admin/Exams';
import LiveMonitoring from './pages/Admin/LiveMonitoring';
import AIAlerts       from './pages/Admin/AIAlerts';
import Recordings     from './pages/Admin/Recordings';
import Reports        from './pages/Admin/Reports';
import Settings       from './pages/Admin/Settings';

// Teacher Pages
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import MyDivisions      from './pages/Teacher/MyDivisions';
import DivisionRoster   from './pages/Teacher/DivisionRoster';
import ExamAssignment   from './pages/Teacher/ExamAssignment';
import TeacherExams     from './pages/Teacher/TeacherExams';
import TeacherAlerts    from './pages/Teacher/TeacherAlerts';
import TeacherResults   from './pages/Teacher/TeacherResults';
import TeacherProfile   from './pages/Teacher/TeacherProfile';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import MyExams          from './pages/Student/MyExams';
import OngoingExams     from './pages/Student/OngoingExams';
import Results          from './pages/Student/Results';
import Profile          from './pages/Student/Profile';

// Exam Flow Pages
import Instructions  from './pages/Exam/Instructions';
import ExamInterface from './pages/Exam/ExamInterface';
import ExamResults   from './pages/Exam/ExamResults';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Entry */}
            <Route path="/" element={<Login />} />

            {/* Admin Portal — Protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard"  element={<AdminDashboard />} />
              <Route path="students"   element={<Students />} />
              <Route path="teachers"   element={<Teachers />} />
              <Route path="divisions"  element={<Divisions />} />
              <Route path="exams"      element={<Exams />} />
              <Route path="live"       element={<LiveMonitoring />} />
              <Route path="alerts"     element={<AIAlerts />} />
              <Route path="recordings" element={<Recordings />} />
              <Route path="reports"    element={<Reports />} />
              <Route path="settings"   element={<Settings />} />
            </Route>

            {/* Teacher Portal — Protected */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="divisions" element={<MyDivisions />} />
              <Route path="divisions/:id" element={<DivisionRoster />} />
              <Route path="exams" element={<TeacherExams />} />
              <Route path="exams/new" element={<ExamAssignment />} />
              <Route path="alerts" element={<TeacherAlerts />} />
              <Route path="results" element={<TeacherResults />} />
              <Route path="profile" element={<TeacherProfile />} />
            </Route>

            {/* Student Portal — Protected */}
            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="exams"     element={<MyExams />} />
              <Route path="ongoing"   element={<OngoingExams />} />
              <Route path="results"   element={<Results />} />
              <Route path="profile"   element={<Profile />} />
            </Route>

            {/* Exam Flow — Accessible by Authenticated Students */}
            <Route
              path="/exam/:id"
              element={
                <ProtectedRoute requiredRole="student">
                  <Instructions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:id/take"
              element={
                <ProtectedRoute requiredRole="student">
                  <ExamInterface />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:id/results"
              element={
                <ProtectedRoute requiredRole="student">
                  <ExamResults />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
