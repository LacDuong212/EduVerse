import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import GuestLayout from "./GuestLayout";
import StudentLayout from "./StudentLayout";
import InstructorLayout from "./InstructorLayout";

export default function PublicRouteLayout() {
  const { isLoggedIn, userData } = useSelector(state => state.auth);

  if (!isLoggedIn) {
    return (
      <GuestLayout>
        <Outlet />
      </GuestLayout>
    );
  }

  if (userData?.role === "instructor") {
    return (
      <InstructorLayout>
        <Outlet />
      </InstructorLayout>
    );
  }

  if (userData?.role === "student") {
    return (
      <StudentLayout>
        <Outlet />
      </StudentLayout>
    );
  }

  // fallback
  return (
    <GuestLayout>
      <Outlet />
    </GuestLayout>
  );
}
