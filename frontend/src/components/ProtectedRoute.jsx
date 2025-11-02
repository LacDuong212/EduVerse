import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import NotFoundPage from "../app/not-found";
import { fetchAdminProfile } from '../redux/adminSlice';


export default function ProtectedRoute({ allowedRole }) {
  const { isLoggedIn, userData } = useSelector(state => state.auth);
  const location = useLocation();

  if (isLoggedIn === undefined) return <div>Loading...</div>;

  if (!isLoggedIn) {
    if (allowedRole === "admin") return (
      <Navigate
        to={`/admin/auth/sign-in?redirectTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );

    return (
      <Navigate
        to={`/auth/sign-in?redirectTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (allowedRole) {
    if (allowedRole === "admin" ) {
      const admin = fetchAdminProfile();
      if (admin === null || admin.id === null) return <NotFoundPage/>
    }
    else if (allowedRole !== userData?.role) return <NotFoundPage />;
  } 

  return <Outlet />;
}
