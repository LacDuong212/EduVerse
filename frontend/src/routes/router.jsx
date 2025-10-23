import SignInPage from "../app/auth/sign-in/SignInPage";
import SignUpPage from "../app/auth/sign-up/SignUpPage";
import NotFoundPage from "../app/not-found";
import InstructorLayout from '../layouts/InstructorLayout';

import { instructorRoutes } from '@/routes/index';
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
      <Route path="/auth/sign-in" element={<SignInPage />} />
      <Route path="/auth/sign-up" element={<SignUpPage />} />

      {/* INSTRUCTOR ROUTES */}
      {(instructorRoutes || []).map((route, idx) => 
        <Route 
          key={idx + route.name} 
          path={route.path} 
          element={isAuthenticated 
            ? <InstructorLayout {...props}>{route.element}</InstructorLayout> 
            : <Navigate to={{
              pathname: '/auth/sign-in',
              search: 'redirectTo=' + route.path
            }} />} 
        />
      )}

      {/* 404 FALLBACK */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
