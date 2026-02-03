import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { useMemo } from 'react';

export default function PublicRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Memoize the redirect to prevent infinite loops
  // Only redirect if user is authenticated AND has admin role
  const shouldRedirect = useMemo(() => {
    if (loading || !isAuthenticated || !user) return false;
    const roles = user.roles || (user.role ? [user.role] : []);
    const hasAdminRole = Array.isArray(roles) && roles.includes('admin');
    return hasAdminRole;
  }, [loading, isAuthenticated, user, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (shouldRedirect) {
    // Only redirect if we're not already going to dashboard
    if (location.pathname !== '/dashboard') {
      return <Navigate to="/dashboard" replace />;
    }
    // If already on dashboard, just return null to prevent loop
    return null;
  }

  return children;
}
