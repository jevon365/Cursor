import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Renders children only for users who are clients and not admins.
 * Admins (including dual admin+client) are redirected to /requests.
 */
export default function ClientOnlyRoute({ children }) {
  const { user, loading, hasRole } = useAuth();

  if (loading || !user) {
    return null;
  }

  if (hasRole('admin')) {
    return <Navigate to="/requests" replace />;
  }

  return children;
}
