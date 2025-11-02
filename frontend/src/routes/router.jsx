import PublicRouteLayout from "../layouts/PublicRouteLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import AdminLayout from '../layouts/AdminLayout';
import InstructorLayout from '../layouts/InstructorLayout';
import StudentLayout from "../layouts/StudentLayout";
import GuestLayout from "../layouts/GuestLayout";
import { publicRoutes, authRoutes, studentRoutes, instructorRoutes, authAdminRoutes, adminRoutes } from './index';

import { Navigate, Route, Routes } from 'react-router-dom';


const AppRouter = props => {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* ADMIN ROUTES */}
      <Route element={<ProtectedRoute allowedRole={"admin"} />}>
        {(adminRoutes || []).map((route, idx) =>
          <Route
            key={idx + route.name}
            path={route.path}
            element={
              <AdminLayout {...props}>{route.element}</AdminLayout>
            }
          />
        )}
      </Route>

      {/* INSTRUCTOR ROUTES */}
      <Route element={<ProtectedRoute allowedRole={"instructor"} />}>
        {(instructorRoutes || []).map((route, idx) => (
          <Route
            key={idx + route.name}
            path={route.path}
            element={
              <InstructorLayout {...props} isNested={route.isNested}>
                {route.element}
              </InstructorLayout>
            }
          />
        ))}
      </Route>

      {/* STUDENT ROUTES */}
      <Route element={<ProtectedRoute allowedRole={"student"} />}>
        {(studentRoutes || []).map((route, idx) => (
          <Route
            key={idx + route.name}
            path={route.path}
            element={
              <StudentLayout {...props} isNested={route.isNested}>
                {route.element}
              </StudentLayout>
            }
          />
        ))}
      </Route>

      {/* AUTH ADMIN ROUTES */}
      {(authAdminRoutes || []).map((route, idx) =>
        <Route
          key={idx + route.name}
          path={route.path}
          element={route.element}
        />
      )}

      {/* AUTH ROUTES */}
      {(authRoutes || []).map((route, idx) =>
        <Route
          key={idx + route.name}
          path={route.path}
          element={route.element}
        />
      )}

      {/* PUBLIC ROUTES */}
      <Route element={<PublicRouteLayout />}>
        {(publicRoutes || []).map((route, idx) => (
          <Route
            key={idx + route.name}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>

    </Routes>
  );
};

export default AppRouter;
