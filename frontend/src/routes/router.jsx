import ForgotPasswordPage from "../app/auth/forgot-password/ForgotPasswordPage";
import SignInPage from "../app/auth/sign-in/SignInPage";
import SignUpPage from "../app/auth/sign-up/SignUpPage";
import ResetPasswordPage from "../app/auth/reset-password/ResetPasswordPage";
import NotFoundPage from "../app/not-found";
import CourseDetail from "../app/pages/course/detail/page";

import ProtectedRoute from "../components/ProtectedRoute";

import InstructorLayout from '../layouts/InstructorLayout';
import StudentLayout from "../layouts/StudentLayout";

import { guestRoutes, instructorRoutes, studentRoutes } from './index';

import { Navigate, Route, Routes } from 'react-router-dom';


const AppRouter = props => {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* AUTH ROUTES */}
      <Route path="/auth/sign-in" element={<SignInPage />} />
      <Route path="/auth/sign-up" element={<SignUpPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/courses/:id" element={<CourseDetail />} />

      {/* GUEST ROUTES */}
      {(guestRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={
            // <InstructorLayout {...props} isNested={route.isNested}>{
              route.element
            // }</InstructorLayout>
          }
        />
      ))}

      {/* INSTRUCTOR ROUTES */}
      <Route element={<ProtectedRoute />}>
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
      <Route element={<ProtectedRoute />}>
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

      {/* 404 FALLBACK */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
