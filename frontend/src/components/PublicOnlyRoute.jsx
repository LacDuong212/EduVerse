import { useSelector } from "react-redux";
import { Navigate, useSearchParams } from "react-router-dom";

export default function PublicOnlyRoute({ children }) {
  const userData = useSelector((state) => state.auth.userData);
  const [searchParams] = useSearchParams();

  // if is logged in, redirect
  if (userData) {
    const roleRedirect = userData.role === "student" ? "/" : "/instructor/dashboard";
    const redirectTo = searchParams.get("redirectTo") || roleRedirect;

    return <Navigate to={redirectTo} replace />;
  }

  // if not logged in, render the page
  return children;
}