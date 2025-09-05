import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setLogin, setLogout } from "../redux/authSlice";

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

  const { userData, isLoggedIn } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        axios.defaults.withCredentials = true;
        const { data } = await axios.get(backendUrl + '/api/user/profile');
        if (data.success) {
          disPatch(setLogin(data.user));
        } else {
          disPatch(setLogout());
          navigate("/login");
        }
      } catch (error) {
        disPatch(setLogout());
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [backendUrl, disPatch, navigate]);

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
      case "security":
        return <SecurityTab />;
      case "subscriptions":
        return <SubscriptionTab />;
      case "payment":
        return <PaymentTab />;
      case "privacy":
        return <PrivacyTab />;
      case "notifications":
        return <NotificationTab />;
      case "deactivate":
        return <DeactivateTab />;
      default:
        return <ProfileTab userData={userData} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) { return null; } // to avoid rendering when not logged in

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 space-y-4 sticky top-0 h-screen overflow-y-auto">
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
          <div className='w-16 h-16 flex justify-center items-center rounded-full bg-black text-white relative group cursor-pointer text-3xl'>
            {userData?.name[0].toUpperCase()}
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
            className={`w-full justify-start ${activeTab === "subscriptions" ? "bg-gray-200 font-semibold" : ""}`}
            onClick={() => setActiveTab("subscriptions")}
          >
            Subscriptions
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

        <Button onClick={logout} variant="destructive" className="w-full flex gap-2 mt-6">
          <LogOut size={16} /> Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto h-screen">
        <Card className="shadow-lg rounded-2xl">
          {renderContent()}
        </Card>
      </main>
    </div>
  );
}
