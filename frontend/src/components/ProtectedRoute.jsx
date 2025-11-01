import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from 'react';

export default function ProtectedRoute() {
  const { isLoggedIn } = useSelector(state => state.auth);
  const location = useLocation();

  // #TODO: loading
  if (isLoggedIn === undefined) return <div>Loading...</div>;

  return isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate
      to={`/auth/sign-in?redirectTo=${encodeURIComponent(location.pathname)}`}
      replace
    />
  );
}
