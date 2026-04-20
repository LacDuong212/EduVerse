import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useCourseEditor } from "../../CourseEditorContext";

export const useStep4 = (stepperInstance) => {
  const {
    currentCourse: course,
    courseDraft: draft,
    updateField: onUpdateField,
    isSubmitting,
    handleSubmit: onSubmit
  } = useCourseEditor();

  // init
  const [tagsInput, setTagsInput] = useState(course.tags?.join(', ') || '');
  const isFirstRender = useRef(true);

  // auto-save tags with debounce
  useEffect(() => {
    // skip the very first render to avoid overwriting parent state immediately
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // wait before saving
    const timeoutId = setTimeout(() => {
      const formattedTags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())             // clean whitespace & lowercase
        .filter((t) => t.length > 0 && t.length <= 25)   // remove empty or insanely long strings
        .slice(0, 14);                                  // limit tags

      // check if the tags have actually changed
      const currentTags = course?.tags || [];
      if (JSON.stringify(currentTags) !== JSON.stringify(formattedTags)) {
        onUpdateField("tags", formattedTags);
      }
    }, 800);

    // cleanup timeout if user types again quickly
    return () => clearTimeout(timeoutId);
  }, [tagsInput, onUpdateField]);

  // --- handlers ---
  const handleTagsChange = (e) => {
    setTagsInput(e.target.value);
  };

  const goBack = () => {
    stepperInstance?.previous();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const finalTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0 && t.length <= 25)
      .slice(0, 14);

    onUpdateField("tags", finalTags);

    const hasChangesInDraft = Object.keys(draft).length > 0;
    if (!hasChangesInDraft && course?.status?.toUpperCase() !== "DRAFT") {
      toast.info("No changes to submit.");
      return;
    }

    await onSubmit();
  };

  return {
    state: { tagsInput, isSubmitting },
    handlers: { handleTagsChange, goBack, handleSubmit }
  };
};