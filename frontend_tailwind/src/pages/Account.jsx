import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "../redux/authSlice";

// ui
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";

// option tabs
import ProfileTab from "../components/accountTabs/ProfileTab";
import AvatarTab from "../components/accountTabs/AvatarTab";


export default function AccountPage() {
  const navigate = useNavigate();
  const disPatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { userData } = useSelector((state) => state.auth);

  // Logout
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      if (data.success) {
        disPatch(setLogout());
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const [activeTab, setActiveTab] = useState("profile"); // default tab
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab userData={userData} />;
      case "avatar":
        return <AvatarTab />;
      // case "security":
      //   return <SecurityTab />;
      // case "bills":
      //   return <BillsTab />;
      // case "payment":
      //   return <PaymentTab />;
      // case "privacy":
      //   return <PrivacyTab />;
      // case "notifications":
      //   return <NotificationTab />;
      // case "deactivate":
      //   return <DeactivateTab />;
      default:
        return <ProfileTab userData={userData} />;
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex pt-20">
      {/* Sidebar */}
      <aside className="w-50 bg-white shadow-md p-4 space-y-4 h-[calc(100vh-5rem)] sticky top-20">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="flex items-center gap-2 w-full justify-start mb-4"
          onClick={() => navigate("/")} // go back to home
        >
          <ArrowLeft size={18} />
          <span>Home</span>
        </Button>

        {/* User Info */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 flex justify-center items-center rounded-full bg-black text-white overflow-hidden text-3xl">
            {userData?.pfpImg ? (
              <img
                src={userData.pfpImg}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              (userData?.name?.[0] || "U").toUpperCase()
            )}
          </div>
          <p className="font-semibold pt-2 pb-1">{userData?.name}</p>
          <p className="text-xs text-gray-500">{userData?.role ? userData.role : "User"}</p>
        </div>

        <nav className="space-y-2 text-sm">
          <Button
            variant="ghost"
            className={`w-full justify-start ${activeTab === "profile" ? "bg-gray-200 font-semibold" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start ${activeTab === "avatar" ? "bg-gray-200 font-semibold" : ""}`}
            onClick={() => setActiveTab("avatar")}
          >
            Avatar
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start ${activeTab === "security" ? "bg-gray-200 font-semibold" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Account Security
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start ${activeTab === "bills" ? "bg-gray-200 font-semibold" : ""}`}
            onClick={() => setActiveTab("bills")}
          >
            Bills
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start ${activeTab === "payment" ? "bg-gray-200 font-semibold" : ""}`}
            onClick={() => setActiveTab("payment")}
          >
            Payment Methods
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start ${activeTab === "privacy" ? "bg-gray-200 font-semibold" : ""}`}
            onClick={() => setActiveTab("privacy")}
          >
            Privacy
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start ${activeTab === "notifications" ? "bg-gray-200 font-semibold" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start ${activeTab === "deactivate" ? "bg-gray-200 font-semibold" : ""}`}
            onClick={() => setActiveTab("deactivate")}
          >
            Deactivate Account
          </Button>
        </nav>

        <Button onClick={logout} variant="destructive" className="w-full flex gap-2 mt-6 hover:bg-red-700 transition">
          <LogOut size={16} /> Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Card className="shadow-lg rounded-2xl">
          {renderContent()}
        </Card>
      </main>
    </div>
  );
}
