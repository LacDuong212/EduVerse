import ForgotPasswordPage from "../app/auth/forgot-password/ForgotPasswordPage";
import SignInPage from "../app/auth/sign-in/SignInPage";
import SignUpPage from "../app/auth/sign-up/SignUpPage";
import ResetPasswordPage from "../app/auth/reset-password/ResetPasswordPage";
import NotFoundPage from "../app/not-found";

import ProtectedRoute from "../components/ProtectedRoute";

import InstructorLayout from '../layouts/InstructorLayout';

import { instructorRoutes } from './index';

import { Route, Routes } from 'react-router-dom';

const AppRouter = props => {

  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route path="/auth/sign-in" element={<SignInPage />} />
      <Route path="/auth/sign-up" element={<SignUpPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

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

      {/* 404 FALLBACK */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
