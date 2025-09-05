import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";


export default function AvatarTab() {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Your Avatar</CardTitle>
        <p className="text-sm text-gray-500">Update your avatar here</p>
      </CardHeader>
    </>
  );
}