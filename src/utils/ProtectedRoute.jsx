import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (requiredRole && !allowedRoles.includes(role)) {
    const fallback =
      role === 'admin'
        ? '/admin/dashboard'
        : role === 'teacher'
        ? '/teacher/dashboard'
        : '/student/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
