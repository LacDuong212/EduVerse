import _, { set } from "lodash";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useVideoStream } from "@/hooks/useVideoStream";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { useCourseEditor } from "../../CourseEditorContext";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 1 * 1024 * 1024 * 1024; // 1GB

export const useStep2 = (stepperInstance) => {
  const {
    currentCourse: course,
    updateField: onUpdateField,
    onSaveDraft
  } = useCourseEditor();
  const userId = useSelector((state) => state.auth.userData?.id);

  const iocId = course.id || userId || null;
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const { uploadImage, isUploading: isImgLoading } = useImageUpload();
  const { uploadVideo, progress: vidProgress, isUploading: isVidLoading } = useVideoUpload();

  // states
  const [imageState, setImageState] = useState({
    tab: (course?.image && typeof course.image === "string") ? "url" : "upload",
    url: typeof course?.image === "string" ? course.image : '',
    file: null,
  });

  const [videoState, setVideoState] = useState({
    videoId: typeof course?.previewVideo === "string" ? course.previewVideo : '',
    file: null,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [previews, setPreviews] = useState({ image: null, video: null });

  // syncing
  useEffect(() => {
    if (course?.image && !isImgLoading) {
      setImageState(prev => {
        if (prev.url !== course.image && !prev.file) {
          return {
            ...prev,
            url: course.image,
            tab: "url"
          };
        }
        return prev;
      });
    }

    if (course?.previewVideo && !isVidLoading) {
      setVideoState(prev => {
        if (prev.videoId !== course.previewVideo && !prev.file) {
          return { ...prev, videoId: course.previewVideo };
        }
        return prev;
      });
    }
  }, [course?.image, course?.previewVideo, isImgLoading, isVidLoading]);

  useEffect(() => {
    const imgUrl = imageState.file ? URL.createObjectURL(imageState.file) : imageState.url;
    const vidUrl = videoState.file ? URL.createObjectURL(videoState.file) : null;

    setPreviews({ image: imgUrl, video: vidUrl });

    return () => {
      if (imageState.file) URL.revokeObjectURL(imgUrl);
      if (videoState.file) URL.revokeObjectURL(vidUrl);
    };
  }, [imageState.file, imageState.url, videoState.file]);

  const isBusy = isImgLoading || isVidLoading;

  const isS3Reference = useMemo(() => {
    if (!videoState.videoId || videoState.file) return false;
    const isNewFormat = videoState.videoId.startsWith("LEC");
    const isLegacyFormat = /^1766.*\.mp4$/.test(videoState.videoId);
    return isNewFormat || isLegacyFormat;
  }, [videoState.videoId, videoState.file]);

  const { streamUrl: s3StreamUrl, loading: streamLoading } = useVideoStream(
    iocId,
    isS3Reference ? videoState.videoId : null
  );

  // handlers
  const handleImageFileChange = useCallback((fileOrEvent) => {
    const file = fileOrEvent?.target?.files ? fileOrEvent.target.files[0] : fileOrEvent;
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setFieldErrors(p => ({ ...p, image: "Image is too large (Max 5MB)." }));
      return;
    }

    setImageState(p => ({ ...p, file, url: '', tab: "upload" }));
    setFieldErrors(p => ({ ...p, image: null }));
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImageState(p => ({ ...p, url: '', file: null }));
    if (imageInputRef.current) imageInputRef.current.value = '';
  }, []);

  const handleVideoFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE) {
      setFieldErrors(p => ({ ...p, videoId: "Video is too large (Max 1GB)." }));
      e.target.value = "";
      return;
    }

    const allowedExts = ['mp4', 'mov', 'avi', 'mkv'];
    const fileExt = file.name.split('.').pop().toLowerCase();


    if (!allowedExts.includes(fileExt)) {
      setFieldErrors(p => ({ ...p, videoId: "Unsupported video format." }));
      e.target.value = "";
      return;
    }

    setVideoState({ file, videoId: '' });
    setFieldErrors(p => ({ ...p, videoId: null }));
  };

  const handleRemoveVideo = useCallback(() => {
    setVideoState({ file: null, videoId: '' });
    if (videoInputRef.current) videoInputRef.current.value = '';
  }, []);

  // dropzone setup (for image)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => accepted[0] && handleImageFileChange(accepted[0]),
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    multiple: false,
    disabled: isImgLoading
  });

  const validate = () => {
    const errs = {};
    if (!imageState.url && !imageState.file) errs.image = "Course image is required.";

    const v = videoState.videoId;
    if (v && v.trim() !== "" && !videoState.file) {
      const isNewFormat = v.startsWith("LEC");
      const isLegacyFormat = /^1766.*\.mp4$/.test(v);
      if (!isNewFormat && !isLegacyFormat) errs.videoId = "Invalid video ID format.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isBusy) return;
    if (!validate()) return;

    try {
      let finalImg = imageState.url;
      if (imageState.tab === "upload" && imageState.file) {
        finalImg = await uploadImage(imageState.file, iocId);
      }

      const executeFinalSave = async (vidId) => {
        const finalVidId = vidId || "";

        const updatedData = {
          image: finalImg,
          previewVideo: finalVidId,
          thumbnail: finalImg,
        };

        onUpdateField(updatedData);

        if (course?.status?.toUpperCase() === "DRAFT") {
          try {
            await onSaveDraft(updatedData);

            setImageState(p => ({ ...p, file: null, url: finalImg }));
            setVideoState(p => ({ ...p, file: null, videoId: finalVidId }));

            toast.success("Course media saved!");
          } catch (err) {
            return;
          }
        } else {
          toast.info("Media updated locally.");
        }

        stepperInstance?.next();
      };

      if (videoState.file) {
        await uploadVideo(videoState.file, async (vidId) => {
          try {
            await executeFinalSave(vidId);
          } catch (innerErr) {
            toast.error("Save failed due to video upload error");
          }
        });
      } else {
        await executeFinalSave(videoState.videoId);
      }
    } catch (err) {
      console.error("Save course media error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to save media";
      toast.error(msg);
    }
  };

  return {
    state: {
      imageState,
      videoState,
      fieldErrors,
      isBusy,
      isS3Reference,
      vidProgress,
      isImgLoading,
      isVidLoading,
      streamLoading
    },
    previews: {
      previewImage: previews.image,
      videoObjectUrl: previews.video,
      s3StreamUrl
    },
    refs: {
      imageInputRef,
      videoInputRef
    },
    dropzone: {
      getRootProps,
      getInputProps,
      isDragActive
    },
    methods: {
      setImageState,
      setVideoState,
      handleImageFileChange,
      handleVideoFileChange,
      handleRemoveVideo,
      handleRemoveImage,
      handleSubmit,
      setFieldErrors
    }
  };
};