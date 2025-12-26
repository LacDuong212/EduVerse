import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import NotFoundPage from "../app/not-found";
import RoleBasedLayout from "../layouts/RoleBasedLayout";


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

  if (allowedRole && allowedRole !== userData?.role) {
    return (
      <RoleBasedLayout isNested={false}>
        <NotFoundPage />
      </RoleBasedLayout>
    );
  }

  return <Outlet />;
}
