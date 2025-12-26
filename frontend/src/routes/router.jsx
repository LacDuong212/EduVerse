import ChatbotWidget from "../app/chatbot";
import ProtectedRoute from "../components/ProtectedRoute";
import ScrollToTop from "../components/ScrollToTop";
import RoleBasedLayout from "../layouts/RoleBasedLayout";

import { publicRoutes, authRoutes, studentRoutes, instructorRoutes } from "./index";

import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";


const HIDE_CHATBOT = [
  "/auth",       // includes /auth/login, /auth/sign-up,...
  "/404",
];

const AppRouter = props => {
  const { isLoggedIn, userData } = useSelector(state => state.auth);
  const location = useLocation();

  const shouldHideChat = HIDE_CHATBOT.some(path =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      <ScrollToTop />
      {!shouldHideChat && <ChatbotWidget />}

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* INSTRUCTOR ROUTES */}
        <Route element={<ProtectedRoute allowedRole={"instructor"} />}>
          {(instructorRoutes || []).map((route, idx) => (
            <Route
              key={idx + route.name}
              path={route.path}
              element={
                <RoleBasedLayout {...props} isNested={route.isNested}>
                  {route.element}
                </RoleBasedLayout>
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
                <RoleBasedLayout isNested={route.isNested}>
                  {route.element}
                </RoleBasedLayout>
              }
            />
          ))}
        </Route>

        {/* AUTH ROUTES */}
        {(authRoutes || []).map((route, idx) =>
          <Route
            key={idx + route.name}
            path={route.path}
            element={isLoggedIn ? (<Navigate to="/home" replace />) : route.element}
          />
        )}

        {/* PUBLIC ROUTES */}
        {(publicRoutes || []).map((route, idx) => (
          <Route
            key={idx + route.name}
            path={route.path}
            element={
              <RoleBasedLayout>
                {route.element}
              </RoleBasedLayout>
            }
          />
        ))}

      </Routes>
    </>
  );
};

export default AppRouter;
