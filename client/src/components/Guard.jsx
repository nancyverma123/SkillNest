import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
export default function Guard({ admin, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="wrap">Loading…</p>;
  if (!user) return <Navigate to="/auth" />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}
