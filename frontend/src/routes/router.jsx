import { Route, Routes, useLocation } from "react-router-dom";
import ChatbotWidget from "@/app/chatbot";
import BaseRedirect from "@/components/BaseRedirect";
import PublicOnlyRoute from "@/components/PublicOnlyRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import RoutePreloaderListener from "@/components/RoutePreloaderListener";
import RoleBasedLayout from "@/layouts/RoleBasedLayout";
import { publicRoutes, authRoutes, studentRoutes, instructorRoutes } from "./index";

const HIDE_CHATBOT = [
  "/",
  "/auth",       // includes /auth/login, /auth/sign-up,...
  "/404",
];

const AppRouter = props => {
  const location = useLocation();

  const shouldHideChat = HIDE_CHATBOT?.some(path => {
    if (path === "/") return location.pathname === "/";
    else location.pathname.startsWith(path);
  });

  return (
    <>
      <ScrollToTop />
      <RoutePreloaderListener />
      {!shouldHideChat && <ChatbotWidget />}

      <Routes>
        <Route path="/" element={<BaseRedirect />} />

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
            element={
              route.guestOnly ? (
                <PublicOnlyRoute>
                  {route.element}
                </PublicOnlyRoute>
              ) : (
                route.element
              )
            }
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