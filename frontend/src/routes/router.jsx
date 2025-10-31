import AdminLayout from '@/layouts/AdminLayout';

import AdminNotFoundPage from "../app/admin/not-found";
import NotFoundPage from "../app/not-found";

import InstructorLayout from '../layouts/InstructorLayout';

import { authRoutes, instructorRoutes, authAdminRoutes, adminRoutes } from '@/routes/index';
// import { useAuthContext } from '@/context/useAuthContext';

import { Navigate, Route, Routes } from 'react-router-dom';


const AppRouter = props => {
  // const {
  //   isAuthenticated
  // } = useAuthContext();
  const isAuthenticated = true;

  return (
    <Routes>
      {/* AUTH ROUTES */}
      {(authRoutes || []).map((route, idx) =>
        <Route
          key={idx + route.name}
          path={route.path}
          element={route.element}
        />)}

      {/* INSTRUCTOR ROUTES */}
      {(instructorRoutes || []).map((route, idx) =>
        <Route
          key={idx + route.name}
          path={route.path}
          element={isAuthenticated
            ? <InstructorLayout {...props} isNested={route.isNested} >{route.element}</InstructorLayout>
            : <Navigate to={{
              pathname: '/auth/sign-in',
              search: 'redirectTo=' + route.path
            }} />}
        />
      )}

      {/* AUTH ADMIN ROUTES */}
      {(authAdminRoutes || []).map((route, idx) =>
        <Route
          key={idx + route.name}
          path={route.path}
          element={route.element}
        />)}

      {/* ADMIN ROUTES */}
      {(adminRoutes || []).map((route, idx) =>
        <Route
          key={idx + route.name}
          path={route.path}
          element={isAuthenticated
            ? <AdminLayout {...props}>{route.element}</AdminLayout>
            : <Navigate to={{
              pathname: '/auth/sign-in',
              search: 'redirectTo=' + route.path
            }} />} />)}

      {/* 404 ADMIN FALLBACK */}
      <Route path="/admin/*" element={<AdminLayout {...props}><AdminNotFoundPage /></AdminLayout>} />

      {/* 404 FALLBACK */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
