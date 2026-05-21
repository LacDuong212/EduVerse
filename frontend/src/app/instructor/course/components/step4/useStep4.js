import _ from "lodash";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCourseEditor } from "../../CourseEditorContext";
import { step4Fields, validateCourse } from "../../schemas";

export const useStep4 = (stepperInstance) => {
  const { changes, currentCourse, isDirty, onSubmit, isSubmitting, errors: globalErrors, setErrors: setGlobalErrors } = useCourseEditor();
  const [tagsInput, setTagsInput] = useState(currentCourse.tags?.join(", ") || "");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const relevantErrors = _.pick(globalErrors, step4Fields);
    if (!_.isEqual(errors, relevantErrors)) {
      setErrors(relevantErrors);
    }
  }, [globalErrors]);

  const goBack = () => {
    stepperInstance?.previous();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const finalTags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0 && t.length <= 25)
      .slice(0, 14);

    const originalTags = currentCourse?.tags || [];
    const tagsChanged = !_.isEqual(finalTags, originalTags);

    let finalChanges = { ...changes };

    if (tagsChanged) {
      _.set(finalChanges, "tags", finalTags);
    } else {
      _.unset(finalChanges, "tags");
    }

    const actualDirty = Object.keys(finalChanges).length > 0
      || currentCourse.curriculum.hasPendingChanges
      || currentCourse.hasPendingChanges;
    if (!actualDirty) return toast.info("You haven't changed anything to submit..");

    const validationData = { ...currentCourse, tags: finalTags };
    const { success, step, errors: newErrors } = validateCourse(validationData);

    if (!success) {
      setGlobalErrors((prev) => ({ ...prev, ...newErrors }));
      if (step !== null) stepperInstance?.to(step);
      return toast.error("Course failed validation, please check each step again before submitting.");
    }

    await onSubmit(finalChanges);
  };

  return {
    isDirty,
    tagsInput,
    setTagsInput,
    goBack,
    handleSubmit,
    isSubmitting,
  };
};