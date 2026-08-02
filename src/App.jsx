import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './utils/ProtectedRoute';

// Layouts
import AdminLayout   from './pages/Admin/AdminLayout';
import StudentLayout from './pages/Student/StudentLayout';

// Auth
import Login from './pages/Login/Login';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import Students       from './pages/Admin/Students';
import Exams          from './pages/Admin/Exams';
import LiveMonitoring from './pages/Admin/LiveMonitoring';
import AIAlerts       from './pages/Admin/AIAlerts';
import Recordings     from './pages/Admin/Recordings';
import Reports        from './pages/Admin/Reports';
import Settings       from './pages/Admin/Settings';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import MyExams          from './pages/Student/MyExams';
import OngoingExams     from './pages/Student/OngoingExams';
import Results          from './pages/Student/Results';
import Profile          from './pages/Student/Profile';

// Exam Pages
import Instructions  from './pages/Exam/Instructions';
import ExamInterface from './pages/Exam/ExamInterface';
import ExamResults   from './pages/Exam/ExamResults';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />

          {/* Admin — protected */}
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
            <Route path="exams"      element={<Exams />} />
            <Route path="live"       element={<LiveMonitoring />} />
            <Route path="alerts"     element={<AIAlerts />} />
            <Route path="recordings" element={<Recordings />} />
            <Route path="reports"    element={<Reports />} />
            <Route path="settings"   element={<Settings />} />
          </Route>

          {/* Student — protected */}
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

          {/* Exam flow — accessible by authenticated students */}
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
