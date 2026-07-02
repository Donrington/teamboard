import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { FullScreenLoader } from './ui/States';

/**
 * Route guard (docs/06). While the session resolves, show a loader; if unauthenticated,
 * bounce to /login remembering where the user was headed; otherwise render the app.
 */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullScreenLoader label="Restoring session" />;
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
