import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useImageUpload from "@/hooks/useImageUpload";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

const INITIAL_STATE = {
  studentId: null,
  name: "",
  email: "",
  phonenumber: "",
  avatar: null,
  bio: "",
  website: "",
  socials: {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  },
};

export default function useMyProfile() {
  const { uploadAvatar, isUploading: avatarUploading } = useImageUpload();

  const [student, setStudent] = useState(INITIAL_STATE);
  const [serverSnapshot, setServerSnapshot] = useState(INITIAL_STATE);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setErrors({});

      try {
        const res = await handleRequest(authApi.get("/student/profile"));

        if (res?.success) {
          const normalizedData = normalizeStudentProfile(res.result);
          setStudent(normalizedData);
          setServerSnapshot(normalizedData);
        } else {
          setErrors(res?.errors || {});
        }
      } catch (err) {
        setErrors(err?.response?.data?.errors || {});
        toast.error(err?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    return () => {
      if (previewAvatar && typeof previewAvatar === "string" && previewAvatar.startsWith("blob:")) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewAvatar && typeof previewAvatar === "string" && previewAvatar.startsWith("blob:")) {
      URL.revokeObjectURL(previewAvatar);
    }

    setSelectedFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  const updateField = (path, value) => {
    setStudent((prev) => {
      const next = _.cloneDeep(prev);
      _.set(next, path, value);
      return next;
    });
  };

  const avatarLogic = useMemo(() => {
    const savedAvatar = student?.avatar || "";

    return {
      currentSrc: previewAvatar === "" ? null : (previewAvatar || savedAvatar || ""),
      hasSavedAvatar: !!savedAvatar,
      remove: () => {
        if (previewAvatar && typeof previewAvatar === "string" && previewAvatar.startsWith("blob:")) {
          URL.revokeObjectURL(previewAvatar);
        }
        setPreviewAvatar("");
        setSelectedFile(null);
      },
      undo: () => {
        if (previewAvatar && typeof previewAvatar === "string" && previewAvatar.startsWith("blob:")) {
          URL.revokeObjectURL(previewAvatar);
        }
        setPreviewAvatar(null);
        setSelectedFile(null);
      },
      isUploading: avatarUploading || submitting,
    };
  }, [student?.avatar, previewAvatar, avatarUploading, submitting]);

  const submitProfile = async (e) => {
    if (e) e.preventDefault();

    setSubmitting(true);
    setErrors({});

    try {
      let finalAvatar = student.avatar;

      if (selectedFile) {
        finalAvatar = await uploadAvatar(selectedFile);
      } else if (previewAvatar === "") {
        finalAvatar = null;
      }

      const currentData = {
        ...student,
        avatar: finalAvatar,
        bio: student?.bio || "",
        socials: {
          facebook: student?.socials?.facebook || "",
          instagram: student?.socials?.instagram || "",
          linkedin: student?.socials?.linkedin || "",
          youtube: student?.socials?.youtube || "",
        },
      };

      const payload = buildPayload(currentData, serverSnapshot);

      if (_.isEmpty(payload)) {
        toast.info("No changes to save.");
        return;
      }

      const res = await handleRequest(authApi.patch("/student/profile", payload));

      if (res?.success) {
        toast.success("Profile updated!");

        const normalizedData = normalizeStudentProfile(res.result);
        setStudent(normalizedData);
        setServerSnapshot(normalizedData);

        if (previewAvatar && typeof previewAvatar === "string" && previewAvatar.startsWith("blob:")) {
          URL.revokeObjectURL(previewAvatar);
        }

        setPreviewAvatar(null);
        setSelectedFile(null);
      } else {
        setErrors(res?.errors || {});
      }
    } catch (err) {
      setErrors(err?.response?.data?.errors || {});
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const isDirty =
    !_.isEqual(student, serverSnapshot) ||
    !!selectedFile ||
    previewAvatar === "";

  return {
    student,
    updateField,
    avatarLogic,
    handleFileChange,
    submitProfile,
    errors,
    loading,
    submitting,
    isDirty,
  };
}

function normalizeStudentProfile(data = {}) {
  return _.merge({}, INITIAL_STATE, {
    studentId: data?._id || data?.studentId || null,
    name: data?.user?.name || data?.name || "",
    email: data?.user?.email || data?.email || "",
    phonenumber: data?.user?.phonenumber || data?.phonenumber || "",
    avatar: data?.user?.pfpImg || data?.avatar || "",
    bio: data?.user?.bio || data?.bio || "",
    website: data?.user?.website || data?.website || "",
    socials: {
      facebook: data?.user?.socials?.facebook || data?.socials?.facebook || "",
      instagram: data?.user?.socials?.instagram || data?.socials?.instagram || "",
      linkedin: data?.user?.socials?.linkedin || data?.socials?.linkedin || "",
      youtube: data?.user?.socials?.youtube || data?.socials?.youtube || "",
    },
  });
}

function buildPayload(currentData, snapshot) {
  const payload = {};

  if (!_.isEqual(currentData.name, snapshot.name)) {
    payload.name = currentData.name;
  }

  if (!_.isEqual(currentData.phonenumber, snapshot.phonenumber)) {
    payload.phonenumber = currentData.phonenumber;
  }

  if (!_.isEqual(currentData.avatar, snapshot.avatar)) {
    payload.avatar = currentData.avatar;
  }

  if (!_.isEqual(currentData.bio, snapshot.bio)) {
    payload.bio = currentData.bio;
  }

  if (!_.isEqual(currentData.website, snapshot.website)) {
    payload.website = currentData.website;
  }

  if (!_.isEqual(currentData.socials, snapshot.socials)) {
    payload.socials = {
      facebook: currentData?.socials?.facebook || "",
      instagram: currentData?.socials?.instagram || "",
      linkedin: currentData?.socials?.linkedin || "",
      youtube: currentData?.socials?.youtube || "",
    };
  }

  return payload;
}