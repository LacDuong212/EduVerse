import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import useImageUpload from "@/hooks/useImageUpload";
import useVideoStream from "@/hooks/useVideoStream";
import useVideoUpload from "@/hooks/useVideoUpload";
import { useCourseEditor } from "../../CourseEditorContext";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export const useStep2 = (stepperInstance) => {
  const { currentCourse: course, onUpdate } = useCourseEditor();
  const { uploadCourseImage, isUploading: isImgLoading } = useImageUpload();
  const { uploadVideo, progress: vidProgress, isUploading: isVidLoading } = useVideoUpload();

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [imageState, setImageState] = useState({
    tab: (course?.image && typeof course.image === "string") ? "url" : "upload",
    url: typeof course?.image === "string" ? course.image : "",
    file: null,
  });

  const [videoState, setVideoState] = useState({
    videoId: typeof course?.previewVideo === "string" ? course.previewVideo : "",
    file: null,
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const previews = useMemo(() => {
    const imgUrl = imageState.file ? URL.createObjectURL(imageState.file) : imageState.url;
    const vidUrl = videoState.file ? URL.createObjectURL(videoState.file) : null;
    return { image: imgUrl, video: vidUrl };
  }, [imageState.file, imageState.url, videoState.file]);

  useEffect(() => {
    return () => {
      if (previews.image?.startsWith("blob:")) URL.revokeObjectURL(previews.image);
      if (previews.video?.startsWith("blob:")) URL.revokeObjectURL(previews.video);
    };
  }, [previews]);

  const isS3Reference = useMemo(() => {
    if (!videoState.videoId || videoState.file) return false;
    return videoState.videoId.startsWith("LEC") || /^1766.*\.mp4$/.test(videoState.videoId);
  }, [videoState.videoId, videoState.file]);

  const { streamUrl: s3StreamUrl, loading: streamLoading } = useVideoStream(
    isS3Reference ? videoState.videoId : null
  );

  const handleImageFileChange = useCallback((fileOrEvent) => {
    const file = fileOrEvent?.target?.files ? fileOrEvent.target.files[0] : fileOrEvent;
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setFieldErrors(p => ({ ...p, image: "Image too large (max 5MB)." }));
      return;
    }

    setImageState(p => ({ ...p, file, url: "", tab: "upload" }));
    setFieldErrors(p => ({ ...p, image: null }));
  }, []);

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE) {
      setFieldErrors(p => ({ ...p, videoId: "Video too large (max 2GB)." }));
      return;
    }

    setVideoState({ file, videoId: "" });
    setFieldErrors(p => ({ ...p, videoId: null }));
  };

  const handleRemoveMedia = (type) => {
    if (type === "image") {
      setImageState(p => ({ ...p, url: "", file: null }));
      if (imageInputRef.current) imageInputRef.current.value = "";
    } else {
      setVideoState({ file: null, videoId: "" });
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const validate = () => {
    const errs = {};
    if (!imageState.url && !imageState.file) errs.image = "Course image is required.";

    if (videoState.videoId && !videoState.file && !isS3Reference)
      errs.videoId = "Invalid video ID format.";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isImgLoading || isVidLoading || !validate()) return;

    try {
      let finalImg = imageState.url;
      let finalVidId = videoState.videoId;

      if (imageState.file) {
        const uploadedUrl = await uploadCourseImage(course.courseId, imageState.file);
        if (uploadedUrl) finalImg = uploadedUrl;
      }

      const executeSave = async (videoId) => {
        const payload = {
          image: finalImg,
          thumbnail: finalImg,
          previewVideo: videoId || "",
        };

        const success = await onUpdate(payload);

        if (success) {
          setImageState(p => ({ ...p, file: null, url: finalImg }));
          setVideoState(p => ({ ...p, file: null, videoId: videoId || "" }));

          toast.success("Media changes saved!");
          stepperInstance?.next();
        }
      };

      if (videoState.file) {
        await uploadVideo(videoState.file, executeSave);
      } else {
        await executeSave(finalVidId);
      }

    } catch (err) {
      toast.error("Failed to save changes..");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => accepted[0] && handleImageFileChange(accepted[0]),
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    multiple: false,
    disabled: isImgLoading
  });

  return {
    state: { imageState, videoState, fieldErrors, vidProgress, isImgLoading, isVidLoading, streamLoading, isS3Reference, isBusy: isImgLoading || isVidLoading },
    previews: { previewImage: previews.image, videoObjectUrl: previews.video, s3StreamUrl },
    refs: { imageInputRef, videoInputRef },
    dropzone: { getRootProps, getInputProps, isDragActive },
    methods: { setImageState, setVideoState, handleImageFileChange, handleVideoFileChange, handleRemoveMedia, handleSubmit }
  };
};