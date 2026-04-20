import _ from "lodash";
import { useEffect, useState } from "react";
import { FaFacebook, FaLinkedinIn } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import useProfile from "@/hooks/useProfile";
import { api } from "@/utils/api";
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

export const useMyProfile = () => {
  const { uploadAvatar, isAvatarUploading } = useProfile();

  const INITIAL_STATE = {
    insId: null,
    name: null,
    email: null,
    phonenumber: null,
    avatar: null,
    address: null,
    occupation: null,
    website: null,
    socials: {
      facebook: null,
      instagram: null,
      linkedin: null,
      youtube: null,
    },
    introduction: "",
    skills: [],
    education: [],
  };

  const [instructor, setInstructor] = useState(INITIAL_STATE);
  const [serverSnapshot, setServerSnapshot] = useState(INITIAL_STATE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await handleRequest(api.get("/instructor/profile", { withCredentials: true }));
        if (res.success) {
          setInstructor(res.result);
          setServerSnapshot(res.result);
        }
      } catch (e) {
        setErrors(e);
      }
    };
    load();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    isUploading: isAvatarUploading
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
    e.preventDefault();
    setErrors({});
    
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
      return toast.info("No changes to save.");
    }

    try {
      const res = await handleRequest(api.patch("/instructor/profile", payload, { withCredentials: true }));
      if (res.success) {
        toast.success("Profile updated!");
        setInstructor(res.result);
        setServerSnapshot(res.result);
        setPreviewAvatar(null);
        setSelectedFile(null);
      }
    } catch (err) {
      toast.error("Update failed..");
    }
  };

  return {
    instructor,
    updateField,
    errors,
    avatarLogic,
    listActions,
    handleFileChange,
    submitProfile
  };
};