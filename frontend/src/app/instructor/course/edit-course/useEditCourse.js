import axios from "axios";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { COURSE_DRAFT_KEY } from "@/contexts/constants";
import { hasMeaningfulDraftData, validateFullCourse, handleAxiosError } from "../components/formUtils";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const useEditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const draftKey = `${COURSE_DRAFT_KEY}_${id}`;

  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [course, setCourse] = useState(null);
  const [courseDraft, setCourseDraft] = useState({});

  // merged draft
  const currentCourse = useMemo(() => _.merge({}, course, courseDraft), [course, courseDraft]);

  // init data
  useEffect(() => {
    const init = async () => {
      if (!id) return navigate("/instructor/courses");

      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/instructor/courses/${id}`,
          { withCredentials: true }
        );

        if (data.success && data.result) {
          setCourse(data.result);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        toast.error(handleAxiosError(error, "Failed to load course"));
        navigate("/instructor/courses");
      } finally {
        setIsLoading(false);
      }
    };

    const draft = sessionStorage.getItem(draftKey);
    if (draft && hasMeaningfulDraftData(JSON.parse(draft))) {
      setCourseDraft(JSON.parse(draft));
    }

    init();
  }, [id, draftKey, navigate]);

  // guard if draft exists
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [courseDraft]);

  // update draft
  const updateField = async (pathOrObject, newValue) => {
    setCourseDraft((prevDraft) => {
      const nextDraft = { ...prevDraft };

      // bulk update
      if (typeof pathOrObject === "object" && pathOrObject !== null) {
        Object.entries(pathOrObject).forEach(([path, value]) => {
          const originalValue = _.get(course, path);
          if (!_.isEqual(value, originalValue)) {
            _.set(nextDraft, path, value);
          } else {
            _.unset(nextDraft, path);
            cleanEmptyParents(nextDraft, path);
          }
        });
      }
      // single update
      else {
        const path = pathOrObject;
        const originalValue = _.get(course, path);
        if (_.isEqual(newValue, originalValue)) {
          _.unset(nextDraft, path);
          cleanEmptyParents(nextDraft, path);
        } else {
          _.set(nextDraft, path, newValue);
        }
      }

      return nextDraft;
    });
  };

  // if is DRAFT course, auto-save to db
  const onSaveDraft = useCallback(async (changes = null) => {
    if (!course) return null;

    if (course?.status?.toUpperCase() !== "DRAFT") {
      return toast.warn("Only DRAFT courses can be auto-saved.");
    }

    const dataToSave = changes || courseDraft;

    if (!hasMeaningfulDraftData(dataToSave)) {
      return toast.info("No changes to save.");
    }

    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/instructor/courses/${id}/draft`,
        dataToSave,
        { withCredentials: true }
      );

      if (data.success) {
        setCourse((prev) => ({ ...prev, ...data.result }));

        if (changes) {
          const keysToRemove = Object.keys(changes);
          setCourseDraft((prevDraft) => _.omit(prevDraft, keysToRemove));
        } else {
          setCourseDraft({});
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(handleAxiosError(error, "Save draft failed"));
      throw error;
    }
  }, [isDirty, id, course, courseDraft]);

  // helper: clean up empty parent objects/arrays
  const cleanEmptyParents = (obj, path) => {
    const pathParts = path.split('.');

    while (pathParts.length > 0) {
      pathParts.pop();
      const parentPath = pathParts.join('.');

      if (!parentPath) break;

      const parentValue = _.get(obj, parentPath);

      if (_.isObject(parentValue) && _.isEmpty(parentValue)) {
        _.unset(obj, parentPath);
      } else {
        break;
      }
    }
  };

  // auto-save draft to session storage
  useEffect(() => {
    if (hasMeaningfulDraftData(courseDraft)) {
      sessionStorage.setItem(draftKey, JSON.stringify(courseDraft));
      setIsDirty(true);
    } else {
      sessionStorage.removeItem(draftKey);
      setIsDirty(false);
    }
  }, [courseDraft, draftKey]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const error = validateFullCourse(currentCourse);
    if (error) { toast.error(error); return; }

    if (!window.confirm("Submit course? Draft changes will be cleared.")) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...courseDraft,
        isPublish: true,
      };

      const { data } = await axios.patch(
        `${backendUrl}/api/instructor/courses/${id}`,
        payload,
        { withCredentials: true }
      );

      if (data.success) {
        const isNewPublish = course?.status?.toUpperCase() === "DRAFT";
        toast.success(isNewPublish ? "Course published!" : "Course updated!");
        sessionStorage.removeItem(draftKey);
        navigate("/instructor/courses");
      }
    } catch (error) {
      console.error("Submission failed", error);
      toast.error(handleAxiosError(error, "Submission failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    course,
    setCourse,

    courseDraft,
    setCourseDraft,

    currentCourse,

    updateField,
    onSaveDraft,

    isLoading,
    isDirty,

    isSubmitting,
    handleSubmit,
  };
};

export default useEditCourse;