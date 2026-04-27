import { useEffect, useMemo, useState } from "react";
import useVideoStream from "@/hooks/useVideoStream";
import useVideoUpload from "@/hooks/useVideoUpload";

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

const getVideoDuration = (source) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      if (source instanceof File) window.URL.revokeObjectURL(video.src);
      resolve(Math.round(video.duration));
    };
    video.onerror = () => reject("Failed to load video metadata");
    video.src = source instanceof File ? URL.createObjectURL(source) : source;
  });
};

export const useLecture = (show, initialLecture, onSave) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    isFree: false,
    duration: 0,
  });

  const [videoFile, setVideoFile] = useState(null);
  const [existingVideoId, setExistingVideoId] = useState("");
  const [errors, setErrors] = useState({});

  const { uploadVideo, progress, isUploading } = useVideoUpload();

  const { streamUrl: s3StreamUrl } = useVideoStream(existingVideoId);

  useEffect(() => {
    if (show) {
      if (initialLecture) {
        setForm({
          title: initialLecture.title || "",
          description: initialLecture.description || "",
          isFree: initialLecture.isFree || false,
          duration: initialLecture.duration || 0,
        });
        setExistingVideoId(initialLecture.videoUrl || "");
      } else {
        setForm({ title: "", description: "", isFree: false, duration: 0 });
        setExistingVideoId("");
      }
      setVideoFile(null);
      setErrors({});
    }
  }, [show, initialLecture]);

  const previewHref = useMemo(() => {
    if (videoFile) return URL.createObjectURL(videoFile);
    if (s3StreamUrl) return s3StreamUrl;
    return null;
  }, [videoFile, s3StreamUrl]);

  useEffect(() => {
    return () => { if (previewHref?.startsWith("blob:")) URL.revokeObjectURL(previewHref); };
  }, [previewHref]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, videoId: "File is too large (Max 2GB)" }));
      return;
    }

    try {
      const seconds = await getVideoDuration(file);
      updateField("duration", seconds);
      setVideoFile(file);
      setExistingVideoId("");
      setErrors(prev => ({ ...prev, videoId: null }));
    } catch (err) {
      setErrors(prev => ({ ...prev, videoId: "Could not read video metadata" }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!videoFile && !existingVideoId) newErrors.videoId = "Video is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (videoFile) {
      const newVideoId = await uploadVideo(videoFile);
      if (newVideoId) {
        onSave({ ...form, videoUrl: newVideoId });
      }
    } else {
      onSave({ ...form, videoUrl: existingVideoId });
    }
  };

  return {
    state: {
      form,
      videoFile,
      errors,
      isUploading,
      progress
    },
    computed: {
      previewHref,
      isNewVideo: !!videoFile
    },
    handlers: {
      updateField,
      handleFileChange,
      handleSubmit
    }
  };
};