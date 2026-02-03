import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protects routes by authentication and optional role checks.
 * @param {React.ReactNode} children
 * @param {string[]} [requiredRoles] - If provided, user must have at least one of these roles.
 *   Omit for any authenticated user.
 */
export default function ProtectedRoute({ children, requiredRoles }) {
  const { user, loading, hasAnyRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
