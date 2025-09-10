import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ProfileTab({ userData }) {
  const [name, setName] = useState(userData?.name || "");
  const [bio, setBio] = useState(userData?.bio || "");
  const [website, setWebsite] = useState(userData?.website || "");
  const [socials, setSocials] = useState({
    facebook: userData?.socials?.facebook || "",
    instagram: userData?.socials?.instagram || "",
    twitter: userData?.socials?.twitter || "",
  });

  const handleSave = async () => {
    try {
      const payload = { name, bio, website, socials };

      const { data } = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        payload,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Profile updated!");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Your Profile</CardTitle>
        <p className="text-sm text-gray-500">Update your personal information</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <Label className="block mb-1">Full Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <Label className="block mb-1">Email</Label>
          <Input value={userData?.email || ""} readOnly />
        </div>

        <div>
          <Label className="block mb-1">Phone</Label>
          <Input value={userData?.phonenumber || ""} readOnly />
        </div>

        <div>
          <Label className="block mb-1">Biography</Label>
          <textarea
            className="w-full border rounded-md p-2 text-sm h-24"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div>
          <Label className="block mb-1">Facebook</Label>
          <Input
            placeholder="facebook.com/username"
            value={socials.facebook}
            onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
          />
        </div>

        <div>
          <Label className="block mb-1">Instagram</Label>
          <Input
            placeholder="instagram.com/username"
            value={socials.instagram}
            onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
          />
        </div>

        <div>
          <Label className="block mb-1">Twitter</Label>
          <Input
            placeholder="twitter.com/username"
            value={socials.twitter}
            onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
          />
        </div>

        <div>
          <Label className="block mb-1">Website</Label>
          <Input
            placeholder="https://yourwebsite.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <Button className="mt-4" onClick={handleSave}>
          Save Changes
        </Button>
      </CardContent>
    </>
  );
}

