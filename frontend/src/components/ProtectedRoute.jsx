import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import NotFoundPage from "../app/not-found";


export default function ProtectedRoute({ allowedRole }) {
  const { isLoggedIn, userData } = useSelector(state => state.auth);
  const location = useLocation();

  if (isLoggedIn === undefined) return <div>Loading...</div>;

  if (!isLoggedIn) {
    return (
      <Navigate
        to={`/auth/sign-in?redirectTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (allowedRole) {
    if (allowedRole !== userData?.role) return <NotFoundPage />;
  }

  return <Outlet />;
}
