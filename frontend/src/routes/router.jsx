import PublicRouteLayout from "../layouts/PublicRouteLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import ScrollToTop from "../components/ScrollToTop";

import InstructorLayout from '../layouts/InstructorLayout';
import StudentLayout from "../layouts/StudentLayout";
import { publicRoutes, authRoutes, studentRoutes, instructorRoutes } from './index';

import { Navigate, Route, Routes } from 'react-router-dom';


const AppRouter = props => {

  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

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
    </>
  );
};

export default AppRouter;
