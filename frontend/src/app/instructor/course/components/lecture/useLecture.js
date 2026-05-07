import { useEffect, useMemo, useState } from "react";
import useVideoStream from "@/hooks/useVideoStream";
import useVideoUpload from "@/hooks/useVideoUpload";
import { lecture, validator } from "../../schemas";

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

export const useLecture = (show, initialLecture = null, onSave) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    isFree: false,
    duration: 0,
  });

  const [videoFile, setVideoFile] = useState(null);
  const [existingVideoId, setExistingVideoId] = useState("");
  const [errors, setErrors] = useState({});
  const [isSuccessfullyUploaded, setIsSuccessfullyUploaded] = useState(false);

  const { uploadVideo, progress, isUploading } = useVideoUpload();
  const { streamUrl: s3StreamUrl } = useVideoStream(existingVideoId);

  useEffect(() => {
    if (show) {
      if (initialLecture) {
        setForm({
          title: initialLecture.title,
          description: initialLecture.description,
          isFree: initialLecture.isFree ?? false,
          duration: initialLecture.duration || 0,
        });
        setExistingVideoId(initialLecture.videoId);
      } else {
        setForm({ title: "", description: "", isFree: false, duration: 0 });
        setExistingVideoId(null);
      }
      setVideoFile(null);
      setIsSuccessfullyUploaded(false);
      setErrors(null);
    }
  }, [show, initialLecture]);

  const previewHref = useMemo(() => {
    if (videoFile) return URL.createObjectURL(videoFile);
    if (existingVideoId && s3StreamUrl) return s3StreamUrl;
    return null;
  }, [videoFile, s3StreamUrl, existingVideoId]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors && errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
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
      setExistingVideoId(null);
      setIsSuccessfullyUploaded(false);
      setErrors(prev => ({ ...prev, videoId: undefined }));
    } catch (err) {
      setErrors(prev => ({ ...prev, videoId: "Could not read video metadata" }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    let finalVideoId = existingVideoId;

    if (videoFile && !isSuccessfullyUploaded) {
      const newVideoId = await uploadVideo(videoFile);
      if (!newVideoId) return;

      finalVideoId = newVideoId;
      setExistingVideoId(newVideoId);
      setIsSuccessfullyUploaded(true);
    }

    const lecData = { ...form, videoId: finalVideoId };

    const { success, errors: newErrors } = validator(lecData, lecture);
    if (!success) {
      setErrors(newErrors);
      return;
    }

    setErrors(null);
    onSave(lecData);
  };

  return {
    state: { form, videoFile, previewHref, errors, isUploading, progress },
    handlers: { updateField, handleFileChange, handleSubmit }
  };
};