import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FallbackLoading from '@/components/FallbackLoading';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.admin);
  const location = useLocation();

  if (loading) {
    return <FallbackLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />;
  }

  return children;
};

export default AdminProtectedRoute;