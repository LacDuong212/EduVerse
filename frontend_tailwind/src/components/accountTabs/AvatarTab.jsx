import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setLogin } from "../../redux/authSlice";

// ui
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


export default function AvatarTab() {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { userData } = useSelector((state) => state.auth);

  const initialUrl = userData?.pfpImg || "";
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  // Sample avatars
  const presetAvatars = useMemo(
    () => [
      "https://res.cloudinary.com/dw1fjzfom/image/upload/v1757337424/av1_bpusfl.jpg",
      "https://res.cloudinary.com/dw1fjzfom/image/upload/v1757337424/av2_fpxqof.jpg",
      "https://res.cloudinary.com/dw1fjzfom/image/upload/v1757337425/av3_yibjb6.jpg",
      "https://res.cloudinary.com/dw1fjzfom/image/upload/v1757337425/av4_khpvlh.png",
      "https://res.cloudinary.com/dw1fjzfom/image/upload/v1757337425/av5_a572ef.jpg",
    ],
    []
  );

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate type and size
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(f.type)) {
      toast.error("Please select a JPG or PNG image.");
      e.target.value = "";
      return;
    }
    const maxSizeMB = 5;
    if (f.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxSizeMB}MB.`);
      e.target.value = "";
      return;
    }

    setFile(f);
    setSelectedPreset(null);

    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const removeAvatar = async () => {
    try {
      setIsSaving(true);
      await axios.patch(
        `${backendUrl}/api/user/profile`,
        { pfpImg: "" },
        { withCredentials: true }
      );

      dispatch(setLogin({ ...userData, pfpImg: "" }));
      setPreviewUrl("");
      setFile(null);
      setSelectedPreset(null);
      toast.success("Avatar removed.");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveAvatar = async () => {
    if (!file && !selectedPreset && previewUrl === initialUrl) {
      toast.info("No changes to save.");
      return;
    }

    try {
      setIsSaving(true);

      // Case 1: user chose a preset image -> just update profile URL
      if (selectedPreset) {
        const { data } = await axios.patch(
          `${backendUrl}/api/user/profile`,
          { pfpImg: selectedPreset },
          { withCredentials: true }
        );
        if (data?.success) {
          dispatch(setLogin({ ...userData, pfpImg: selectedPreset }));
          toast.success("Avatar updated!");
        }
        return;
      }

      // Case 2: user uploaded a file -> send multipart to backend & update profile url
      if (file) {
        // optional downscale if image is big
        const fileToSend =
          file.size > 2 * 1024 * 1024 ? await downscaleImage(file, 512, 0.9) : file;

        const form = new FormData();
        form.append("avatar", fileToSend);

        const { data } = await axios.post(`${backendUrl}/api/user/avatar`, form, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (data?.success && data?.avatarUrl) {
          dispatch(setLogin({ ...userData, pfpImg: data.avatarUrl }));
          setFile(null);
          toast.success("Avatar uploaded!");
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const onSelectPreset = (url) => {
    setSelectedPreset(url);
    setFile(null);
    setPreviewUrl(url);
  };

  const hasChanges =
    selectedPreset !== null ||
    (!!file && previewUrl) ||
    (previewUrl || "") !== (initialUrl || "");

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Your Avatar</CardTitle>
        <p className="text-sm text-gray-500">Upload a new avatar or choose a preset.</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Big Preview */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-40 h-40 rounded-full overflow-hidden bg-black flex items-center justify-center text-8xl ring-2 ring-gray-100 text-white">
            {previewUrl || userData?.pfpImg ? (
              <img
                src={previewUrl || userData?.pfpImg}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              (userData?.name?.[0] || "U").toUpperCase()
            )}
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" className="hover:bg-gray-200 transition-colors" onClick={onPickFile}>
                Upload File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={onFileChange}
              />
              <Button
                variant="ghost"
                onClick={removeAvatar}
                disabled={!userData?.pfpImg && !file && !selectedPreset}
              >
                Remove
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              JPG/PNG • up to 5MB • Tip: use a square image for best results.
            </p>
          </div>
        </div>

        {/* Presets */}
        <div>
          <Label className="mb-2 block">Or pick one:</Label>
          <div className="flex flex-wrap gap-[10px]">
            {presetAvatars.map((src) => {
              const active = previewUrl === src;
              return (
                <button
                  type="button"
                  key={src}
                  onClick={() => onSelectPreset(src)}
                  className={`w-16 h-16 rounded-full overflow-hidden flex items-center 
                    justify-center outline-none transition
                    ${active ? "ring-2 ring-indigo-500" : "ring-1 ring-transparent"}`}
                  aria-label="Choose preset avatar"
                >
                  <img
                    src={src}
                    alt="Preset avatar"
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button onClick={saveAvatar} disabled={!hasChanges || isSaving}>
            {isSaving ? "Saving..." : "Save Avatar"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setPreviewUrl(initialUrl);
              setSelectedPreset(null);
              setFile(null);
            }}
            disabled={!hasChanges || isSaving}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </>
  );
}
