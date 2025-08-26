import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut } from "lucide-react";

import { AppContent } from "../context/AppContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        axios.defaults.withCredentials = true;
        const { data } = await axios.get(`${backendUrl}/api/user/profile`);
        if (data.success) {
          setUserData(data.user);
        } else {
          setUserData(null);
          navigate("/login");
        }
      } catch (error) {
        setUserData(null);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [backendUrl, navigate]);

  // Logout
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setUserData(null);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Initials for avatar fallback
  const initials =
    userData?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "U";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 space-y-4">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-20 h-20 mb-2">
            <AvatarImage src="/profile.jpg" alt="User Avatar" />
            <AvatarFallback className="flex items-center justify-center font-bold text-3xl bg-black text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold">{userData?.name}</p>
          <p className="text-xs text-gray-500">Student</p>
        </div>

        <nav className="space-y-2 text-sm">
          <Button variant="ghost" className="w-full justify-start">Profile</Button>
          <Button variant="ghost" className="w-full justify-start">Photo</Button>
          <Button variant="ghost" className="w-full justify-start">Account Security</Button>
          <Button variant="ghost" className="w-full justify-start">Subscriptions</Button>
          <Button variant="ghost" className="w-full justify-start">Payment Methods</Button>
          <Button variant="ghost" className="w-full justify-start">Privacy</Button>
          <Button variant="ghost" className="w-full justify-start">Notifications</Button>
          <Button variant="ghost" className="w-full justify-start">Deactivate Account</Button>
        </nav>

        <Button onClick={logout} variant="destructive" className="w-full flex gap-2 mt-6">
          <LogOut size={16} /> Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>YOUR PROFILE</CardTitle>
            <p className="text-sm text-gray-500">Add information about yourself</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <Label className="block mb-1">Full Name</Label>
              <Input value={userData?.name || ""} readOnly />
            </div>

            <div>
              <Label className="block mb-1">Biography</Label>
              <textarea
                className="w-full border rounded-md p-2 text-sm h-24"
                placeholder="Tell us about yourself"
              ></textarea>
            </div>

            <div>
              <Label className="block mb-1">Website</Label>
              <Input placeholder="https://yourwebsite.com" />
            </div>

            <div>
              <Label className="block mb-1">Facebook</Label>
              <Input placeholder="facebook.com/username" />
            </div>

            <div>
              <Label className="block mb-1">Instagram</Label>
              <Input placeholder="instagram.com/username" />
            </div>

            <div>
              <Label className="block mb-1">Twitter</Label>
              <Input placeholder="twitter.com/username" />
            </div>

            <Button className="mt-4">Save Changes</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
