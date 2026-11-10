import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Guard({ admin, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="container">
        <div className="page-loading" role="status">
          <span className="spinner spinner-lg" aria-hidden="true" />
          <span>Checking your session…</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
