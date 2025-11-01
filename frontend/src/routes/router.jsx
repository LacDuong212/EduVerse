import AdminNotFoundPage from "../app/admin/not-found";
import NotFoundPage from "../app/not-found";
import CourseDetail from "../app/pages/course/detail/page";

import ProtectedRoute from "../components/ProtectedRoute";

import AdminLayout from '../layouts/AdminLayout';
import InstructorLayout from '../layouts/InstructorLayout';
import StudentLayout from "../layouts/StudentLayout";

import { guestRoutes, authRoutes, studentRoutes, instructorRoutes, authAdminRoutes, adminRoutes } from '@/routes/index';

import { Route, Routes } from 'react-router-dom';


const AppRouter = props => {

  return (
    <Routes>
      {/* AUTH ROUTES */}
      {(authRoutes || []).map((route, idx) =>
        <Route
          key={idx + route.name}
          path={route.path}
          element={route.element}
        />)}
      <Route path="/courses/:id" element={<CourseDetail />} />

      {/* INSTRUCTOR ROUTES */}
      <Route element={<ProtectedRoute />}>
        {([/*...guestRoutes*/, ...instructorRoutes] || []).map((route, idx) => (
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
      <Route element={<ProtectedRoute />}>
        {([...guestRoutes, ...studentRoutes] || []).map((route, idx) => (
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
        />)}

      {/* ADMIN ROUTES */}
      <Route element={<ProtectedRoute />}>
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


      {/* 404 ADMIN FALLBACK */}
      <Route path="/admin/*" element={<AdminLayout {...props}><AdminNotFoundPage /></AdminLayout>} />

      {/* 404 FALLBACK */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
