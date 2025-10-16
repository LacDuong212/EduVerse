import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";

export default function MainLayout() {
  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer />
      <Navbar />
      <Outlet />
    </div>
  );
}
