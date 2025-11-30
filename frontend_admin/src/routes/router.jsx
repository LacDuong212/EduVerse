import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { authAdminRoutes, adminRoutes } from './index';

import AdminProtectedRoute from './AdminProtectedRoute';

const AppRouter = props => {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ADMIN ROUTES */}
      {(adminRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={
            <AdminProtectedRoute>
              <AdminLayout {...props}>
                {route.element}
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
      ))}

      {/* AUTH ADMIN ROUTES */}
      {(authAdminRoutes || []).map((route, idx) =>
        <Route
          key={idx + route.name}
          path={route.path}
          element={route.element}
        />
      )}

    </Routes>
  );
};

export default AppRouter;
