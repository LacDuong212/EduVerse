import { useSelector } from "react-redux";

import GuestLayout from "./GuestLayout";
import InstructorLayout from "./InstructorLayout";
import StudentLayout from "./StudentLayout";

export default function RoleBasedLayout({ children, isNested }) {
  const { isLoggedIn, userData } = useSelector(state => state.auth);

  // determine layout
  let LayoutComponent = GuestLayout; // default to Guest

  if (isLoggedIn) {
    if (userData?.role === "instructor") {
      LayoutComponent = InstructorLayout;
    } else if (userData?.role === "student") {
      LayoutComponent = StudentLayout;
    }
  }

  // render layout
  return (
    <LayoutComponent isNested={isNested} >
      {children}
    </LayoutComponent>
  );
}
