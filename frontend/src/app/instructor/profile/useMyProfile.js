import _ from "lodash";
import { useEffect, useState } from "react";
import { FaFacebook, FaLinkedinIn } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import useImageUpload from "@/hooks/useImageUpload";
import { authApi } from "@/utils/api";
import { mapResponseErrors } from "@/utils/mapper";
import { handleRequest } from "@/utils/request";

export const linkedAccount = [{
  name: "Google",
  description: "You have successfully connected to your Google account",
  icon: FcGoogle,
  isActive: true,
  variant: "text-google-icon"
}, {
  name: "Linkedin",
  description: "Connect to your Linkedin account",
  icon: FaLinkedinIn,
  isActive: false,
  variant: "text-linkedin"
}, {
  name: "Facebook",
  description: "Connect to your Facebook account",
  icon: FaFacebook,
  isActive: false,
  variant: "text-facebook"
}];

export default function useMyProfile() {
  const { uploadAvatar, isUploading: avatarUploading } = useImageUpload();

  const INITIAL_STATE = {
    insId: null,
    name: "",
    email: "",
    phonenumber: "",
    avatar: null,
    address: "",
    occupation: "",
    website: "",
    socials: {
      facebook: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    },
    introduction: "",
    skills: [],
    education: [],
  };

  const [instructor, setInstructor] = useState(INITIAL_STATE);
  const [serverSnapshot, setServerSnapshot] = useState(INITIAL_STATE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [errors, setErrors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const res = await handleRequest(authApi.get("/instructor/profile"));
      if (res.success) {
        setInstructor(res.result);
        setServerSnapshot(res.result);
      } else {
        setErrors(mapResponseErrors(res.errors));
      }

      setLoading(false);
    };
    load();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewAvatar && previewAvatar.startsWith("blob:")) {
      URL.revokeObjectURL(previewAvatar);
    }

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewAvatar(localUrl);
  };

  const avatarLogic = {
    currentSrc: previewAvatar === "" ? null : (previewAvatar || instructor?.avatar || ""),
    hasSavedAvatar: !!instructor?.avatar,
    remove: () => {
      setPreviewAvatar("");
      setSelectedFile(null);
    },
    undo: () => {
      setPreviewAvatar(null);
      setSelectedFile(null);
    },
    isUploading: avatarUploading || submitting
  };

  const updateField = (path, value) => {
    setInstructor(prev => {
      const newState = _.cloneDeep(prev);
      _.set(newState, path, value);
      return newState;
    });
  };

  const listActions = {
    addEducation: () => updateField("education", [...instructor.education, { fieldOfStudy: "", institution: "" }]),
    removeEducation: (index) => updateField("education", instructor.education.filter((_, i) => i !== index)),
    updateEducation: (index, field, value) => updateField(`education[${index}].${field}`, value),

    addSkill: () => updateField("skills", [...instructor.skills, { name: "", level: 50 }]),
    removeSkill: (index) => updateField("skills", instructor.skills.filter((_, i) => i !== index)),
    updateSkill: (index, field, value) => updateField(`skills[${index}].${field}`, value),
  };

  const submitProfile = async (e) => {
    if (e) e.preventDefault();

    setSubmitting(true);
    setErrors({});

    try {
      let finalAvatar = instructor.avatar;

      if (selectedFile) {
        finalAvatar = await uploadAvatar(selectedFile);
      } else if (previewAvatar === "") {
        finalAvatar = null;
      }

      const currentData = {
        ...instructor,
        avatar: finalAvatar
      };

      const payload = _.pickBy(currentData, (value, key) => {
        return !_.isEqual(value, serverSnapshot[key]);
      });

      if (_.isEmpty(payload)) {
        toast.info("No changes to save.");
        setSubmitting(false);
        return;
      }

      const res = await handleRequest(authApi.patch("/instructor/profile", payload));

      if (res.success) {
        toast.success("Profile updated!");

        const normalizedData = _.merge({}, INITIAL_STATE, res.result);
        setInstructor(normalizedData);
        setServerSnapshot(normalizedData);

        setPreviewAvatar(null);
        setSelectedFile(null);
      } else {
        setErrors(mapResponseErrors(res.errors));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed..");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    instructor,
    updateField,
    errors,
    avatarLogic,
    listActions,
    handleFileChange,
    submitProfile,
    loading,
    submitting,
    isDirty: !_.isEqual(instructor, serverSnapshot) || !!selectedFile || previewAvatar === ""
  };
}