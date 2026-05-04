import _ from "lodash";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import useImageUpload from "@/hooks/useImageUpload";
import useVideoStream from "@/hooks/useVideoStream";
import useVideoUpload from "@/hooks/useVideoUpload";
import { useCourseEditor } from "../../CourseEditorContext";
import { step2Fields, validateStep2 } from "../../schemas";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export const useStep2 = (stepperInstance) => {
  const { currentCourse, onUpdate, errors: globalErrors } = useCourseEditor();
  const { uploadCourseImage, isUploading: isImgLoading } = useImageUpload();
  const { uploadVideo, progress: vidProgress, isUploading: isVidLoading } = useVideoUpload();

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [imageState, setImageState] = useState({
    tab: (currentCourse?.image && typeof currentCourse.image === "string") ? "url" : "upload",
    url: typeof currentCourse?.image === "string" ? currentCourse.image : null,
    file: null,
  });

  const [videoState, setVideoState] = useState({
    previewVideo: typeof currentCourse?.previewVideo === "string" ? currentCourse.previewVideo : null,
    file: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const relevantErrors = _.pick(globalErrors, step2Fields);
    if (!_.isEqual(errors, relevantErrors)) {
      setErrors(relevantErrors);
    }
  }, [globalErrors]);

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
    if (!videoState.previewVideo || videoState.file) return false;
    return videoState.previewVideo.startsWith("LEC") || /^1766.*\.mp4$/.test(videoState.previewVideo);
  }, [videoState.previewVideo, videoState.file]);

  const { streamUrl: s3StreamUrl, loading: streamLoading } = useVideoStream(
    isS3Reference ? videoState.previewVideo : null
  );

  const handleImageFileChange = useCallback((fileOrEvent) => {
    const file = fileOrEvent?.target?.files ? fileOrEvent.target.files[0] : fileOrEvent;
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors(p => ({ ...p, image: "Image too large (max 5MB)." }));
      return;
    }

    setImageState(p => ({ ...p, file, url: null, tab: "upload" }));
    setErrors(p => ({ ...p, image: null }));
  }, []);

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE) {
      setErrors(p => ({ ...p, previewVideo: "Video too large (max 2GB)." }));
      return;
    }

    setVideoState({ file, previewVideo: null });
    setErrors(p => ({ ...p, previewVideo: null }));
  };

  const handleRemoveMedia = (type) => {
    if (type === "image") {
      setImageState(p => ({ ...p, url: "", file: null }));
      if (imageInputRef.current) imageInputRef.current.value = null;
    } else {
      setVideoState({ file: null, previewVideo: null });
      if (videoInputRef.current) videoInputRef.current.value = null;
    }
  };

  const validate = () => {
    const errs = {};
    if (!imageState.url && !imageState.file) errs.image = "Course image is required.";

    if (videoState.previewVideo && !videoState.file && !isS3Reference)
      errs.previewVideo = "Please provide a valid preview video.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isImgLoading || isVidLoading) return;

    if (!validate()) {
      toast.error("Please make sure all the fields are correct..");
      return;
    }

    try {
      let finalImg = imageState.url;
      let finalVidId = videoState.previewVideo;

      const executeSave = async (previewVideo) => {
        const payload = {
          image: finalImg,
          thumbnail: finalImg,
          previewVideo: previewVideo,
        };

        const success = await onUpdate(payload);

        if (success) {
          setImageState(p => ({ ...p, file: null, url: finalImg }));
          setVideoState(p => ({ ...p, file: null, previewVideo }));

          toast.success("Media changes saved!");
          stepperInstance?.next();
        } else {

        }
      };

      if (imageState.file) {
        const uploadedUrl = await uploadCourseImage(currentCourse.courseId, imageState.file);
        if (uploadedUrl) {
          finalImg = uploadedUrl;
          setImageState(p => ({ ...p, file: null, url: finalImg }));
        }
      }

      if (videoState.file) {
        finalVidId = await uploadVideo(videoState.file);
        setVideoState(p => ({ ...p, file: null, finalVidId }));
      }

      await executeSave(finalVidId);
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
    state: { imageState, videoState, errors, vidProgress, isImgLoading, isVidLoading, streamLoading, isS3Reference, isBusy: isImgLoading || isVidLoading },
    previews: { previewImage: previews.image, videoObjectUrl: previews.video, s3StreamUrl },
    refs: { imageInputRef, videoInputRef },
    dropzone: { getRootProps, getInputProps, isDragActive },
    methods: { setImageState, setVideoState, handleImageFileChange, handleVideoFileChange, handleRemoveMedia, handleSubmit }
  };
};