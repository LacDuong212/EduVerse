import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useVideoStream } from "@/hooks/useVideoStream";
import { useVideoUpload } from "@/hooks/useVideoUpload";

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const ALLOWED_EXTENSIONS = ["mp4", "mov", "mkv", "avi"];

// helper: get duration from video file
const getVideoDurationFromFile = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };
      video.onerror = function () { reject("Cannot load video metadata"); };
      video.src = URL.createObjectURL(file);
    } catch (e) { reject(e); }
  });
};
// helper: get duration from video URL
const getVideoDurationFromUrl = (url) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve(Math.round(video.duration));
    };
    video.onerror = () => reject("Failed to load video metadata from S3");
    video.src = url;
  });
};

export const useLecture = (show, initialLecture, onSave, courseId) => {
  const userId = useSelector((state) => state.auth.userData?.id);
  const iocId = courseId || userId || null;

  const [form, setForm] = useState({
    title: '',
    description: '',
    isFree: false,
    duration: 0,
  });

  const [videoState, setVideoState] = useState({
    file: null,
    fileName: '',
    videoId: ''
  });

  const [errors, setErrors] = useState({});
  const { uploadVideo, progress, isUploading } = useVideoUpload();

  const isS3Reference = useMemo(() => {
    if (!videoState.videoId || videoState.file) return false;
    const val = videoState.videoId;
    return val.startsWith("LEC") || /^1766.*\.mp4$/.test(val);
  }, [videoState.videoId, videoState.file]);

  const { streamUrl: s3StreamUrl } = useVideoStream(
    iocId,
    isS3Reference ? videoState.videoId : null
  );

  // init
  useEffect(() => {
    if (show) {
      if (initialLecture) {
        setForm({
          title: initialLecture.title || '',
          description: initialLecture.description || '',
          isFree: initialLecture.isFree || false,
          duration: initialLecture.duration || 0,
        });
        setVideoState({
          file: null,
          fileName: '',
          videoId: initialLecture.videoUrl || ''
        });
      } else {
        setForm({ title: '', description: '', isFree: false, duration: 0 });
        setVideoState({ file: null, fileName: '', videoId: '' });
      }
      setErrors({});
    }
  }, [show, initialLecture]);

  useEffect(() => {
    if (s3StreamUrl && !videoState.file) {
      getVideoDurationFromUrl(s3StreamUrl)
        .then((seconds) => {
          updateForm("duration", seconds);
        })
        .catch((err) => console.error("S3 Duration Error:", err));
    }
  }, [s3StreamUrl, videoState.file]);

  // --- Preview Logic ---
  const filePreviewUrl = useMemo(() => {
    if (videoState.file) return URL.createObjectURL(videoState.file);
    return null;
  }, [videoState.file]);

  useEffect(() => {
    return () => { if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl); };
  }, [filePreviewUrl]);

  const previewHref = useMemo(() => {
    if (filePreviewUrl) return filePreviewUrl; // priority: new file
    if (s3StreamUrl) return s3StreamUrl;       // fallback: valid ID
    return null;
  }, [filePreviewUrl, s3StreamUrl]);

  // --- Handlers ---
  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleIdChange = (e) => {
    setVideoState({
      videoId: e.target.value,
      file: null,
      fileName: ''
    });
    setErrors(prev => ({ ...prev, videoId: null }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];

    setVideoState(prev => ({ ...prev, file: null, fileName: '', videoId: '' }));
    updateForm("duration", 0);
    setErrors(prev => ({ ...prev, video: null }));

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, video: `File is too large. Max size is 2GB.` }));
      e.target.value = "";
      return;
    }
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      setErrors(prev => ({ ...prev, video: `Invalid file type.` }));
      e.target.value = "";
      return;
    }

    try {
      const seconds = await getVideoDurationFromFile(file);
      updateForm("duration", seconds);
    } catch (err) {
      console.error("Duration error", err);
    }

    setVideoState({ file, fileName: file.name, videoId: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Lecture title is required.";

    // must have EITHER a file OR a videoId
    if (!videoState.file) {
      if (!videoState.videoId.trim())
        newErrors.video = "Please upload a video or enter a valid Video ID.";
      if (!isS3Reference)
        newErrors.videoId = "Please provide a valid video ID.";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = (key) => {
      onSave({ ...form, videoUrl: key });
    };

    if (videoState.file) {
      uploadVideo(videoState.file, (key) => submitData(key));
    } else {
      submitData(videoState.videoId);
    }
  };

  return {
    state: { form, videoState, errors, isUploading, progress },
    computed: { previewHref },
    handlers: { updateForm, handleIdChange, handleFileChange, handleSubmit }
  };
};