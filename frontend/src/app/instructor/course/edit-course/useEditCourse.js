import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { authApi } from "@/utils/api";
import { mapResponseErrors } from "@/utils/mapper";
import { handleRequest } from "@/utils/request";
import { validateCourse } from "../schemas";

export default function useEditCourse() {
  const navigate = useNavigate();
  const { id: courseId } = useParams();

  const [course, setCourse] = useState(null);
  const courseRef = useRef(course);
  const [changes, setChanges] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return navigate("/instructor/courses");
      setIsLoading(true);

      const response = await handleRequest(authApi.get(`/instructor/courses/${courseId}`));

      if (response.success) {
        setCourse(response.result);
      } else {
        navigate("/instructor/courses");
      }
      setIsLoading(false);
    };
    fetchCourse();
  }, [courseId, navigate]);

  useEffect(() => {
    courseRef.current = course;
  }, [course]);

  const currentCourse = useMemo(() => {
    if (!course) return null;
    return _.mergeWith({}, course, changes, (objValue, srcValue) => {
      if (_.isArray(srcValue)) return srcValue;
    });
  }, [course, changes]);

  const cleanEmptyParents = (obj, path) => {
    const parts = path.split(".");
    while (parts.length > 1) {
      parts.pop();
      const parentPath = parts.join(".");
      const parentVal = _.get(obj, parentPath);
      if (_.isObject(parentVal) && _.isEmpty(parentVal)) {
        _.unset(obj, parentPath);
      } else break;
    }
  };

  const updateField = useCallback((pathOrObject, newValue) => {
    setChanges((prev) => {
      const nextChanges = { ...prev };

      const processChange = (path, value) => {
        const originalValue = _.get(courseRef.current, path);

        if (_.isEqual(value, originalValue)) {
          _.unset(nextChanges, path);
          cleanEmptyParents(nextChanges, path);
        } else {
          _.set(nextChanges, path, value);
        }
      };

      if (_.isObject(pathOrObject) && newValue === undefined) {
        Object.entries(pathOrObject).forEach(([path, val]) => processChange(path, val));
      } else {
        processChange(pathOrObject, newValue);
      }

      return { ...nextChanges };
    });
  }, []);

  const onUpdate = async (specificChanges = null) => {
    const payload = specificChanges || changes;
    if (Object.keys(payload).length === 0) return true;

    setErrors({});

    const response = await handleRequest(authApi.patch(`/instructor/courses/${courseId}`, payload));
    if (response.success) {
      setCourse(response.result);
      setChanges({});
      setErrors({});
      return true;
    } else {
      if (response.errors) setErrors(mapResponseErrors(response.errors));
      return false;
    }
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    const response = await handleRequest(
      authApi.post(`/instructor/courses/${courseId}/submit`, changes)
    );

    if (response.success) {
      toast.success("Course submitted for review!");
      navigate("/instructor/courses");
    } else {
      if (response.errors) setErrors(mapResponseErrors(response.errors));
    }
    setIsSubmitting(false);
  };

  const onDiscardChanges = async () => {
    if (!course?.hasPendingChanges && !course?.curriculum?.hasPendingChanges)
      toast.info("No server-saved changes to clear.");

    if (!window.confirm("Are you sure? This will revert all unsubmitted changes and revert any video updated.")) return;

    setIsLoading(true);
    const response = await handleRequest(
      authApi.delete(`/instructor/courses/${courseId}/changes`)
    );

    if (response.success) {
      setCourse(response.result);
      setChanges({});
      setErrors({});
      toast.success("Changes discarded.");
    }
    setIsLoading(false);
  };

  return {
    course,
    changes,
    currentCourse,
    updateField,
    onUpdate,
    onSubmit,
    onDiscardChanges,
    isDirty: !_.isEmpty(changes),
    isLoading,
    isSubmitting,
    errors,
    setErrors,
  };
}