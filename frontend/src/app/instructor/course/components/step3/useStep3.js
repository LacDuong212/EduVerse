import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";
import { useCourseEditor } from "../../CourseEditorContext";
import { step3Fields, validateStep3 } from "../../schemas";

const validIndex = (ind) => Number.isInteger(ind) && ind >= 0;

export const useStep3 = (stepperInstance) => {
  const { course, changes, currentCourse, updateField, onUpdate, errors: globalErrors } = useCourseEditor();

  const [curriculum, setCurriculum] = useState([]);
  const [errors, setErrors] = useState({});

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);

  const [showLectureModal, setShowLectureModal] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [editingLectureIndex, setEditingLectureIndex] = useState(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);

  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedAILecture, setSelectedAILecture] = useState(null);

  // init curriculum
  useEffect(() => {
    if (currentCourse?.curriculum?.sections) {
      setCurriculum(_.cloneDeep(currentCourse.curriculum.sections).map(s => ({
        ...s,
        lectures: s.lectures || []
      })));
    }
  }, [currentCourse?.courseId]);

  // sync errors
  useEffect(() => {
    const relevantErrors = _.pickBy(globalErrors, (value, key) => _.startsWith(key, "curriculum"));
    if (!_.isEqual(errors, relevantErrors)) setErrors(relevantErrors);
  }, [globalErrors, errors]);

  const stats = useMemo(() => ({
    totalSections: curriculum.length,
    totalLectures: _.sumBy(curriculum, (s) => s.lectures?.length || 0)
  }), [curriculum]);

  const hasProcessing = useMemo(() =>
    curriculum.some(s => s.lectures?.some(l => l?.aiData?.status === "processing")),
    [curriculum]
  );

  const patchLecture = useCallback((sIdx, lIdx, patch) => {
    setCurriculum(prev => {
      const updated = _.cloneDeep(prev);
      const lecture = _.get(updated, `[${sIdx}].lectures[${lIdx}]`);
      if (lecture) {
        Object.assign(lecture, _.isFunction(patch) ? patch(lecture) : patch);
      }
      return updated;
    });
  }, []);

  // section ---
  const handleSaveSection = (title) => {
    setCurriculum(prev => {
      const updated = _.cloneDeep(prev);
      if (validIndex(editingSectionIndex)) {
        updated[editingSectionIndex].title = title;
      } else {
        updated.push({ title, lectures: [] });
      }
      updateField("curriculum.sections", updated);
      return updated;
    });
    setShowSectionModal(false);
  };

  const handleRemoveSection = (index) => {
    const hasLectures = curriculum[index]?.lectures?.length > 0;
    if (hasLectures && !window.confirm("Are you sure? All lectures in this section will be deleted.")) return;

    setCurriculum(prev => {
      const updated = prev.filter((_, i) => i !== index);
      updateField("curriculum.sections", updated);
      return updated;
    });
  };

  // lecture ---
  const handleSaveLecture = (lectureChanges) => {
    setCurriculum(prev => {
      const updated = _.cloneDeep(prev);
      const section = updated[activeSectionIndex];
      if (!section) return prev;

      if (validIndex(editingLectureIndex)) {
        section.lectures[editingLectureIndex] = {
          ...section.lectures[editingLectureIndex],
          ...lectureChanges
        };
      } else {
        section.lectures.push(lectureChanges);
      }

      updateField("curriculum.sections", updated);
      return updated;
    });
    setShowLectureModal(false);
  };

  const handleRemoveLecture = (sectionIndex, lectureIndex) => {
    if (!window.confirm("Remove this lecture?")) return;
    setCurriculum(prev => {
      const updated = _.cloneDeep(prev);
      updated[sectionIndex]?.lectures?.splice(lectureIndex, 1);
      updateField("curriculum.sections", updated);
      return updated;
    });
  };

  // AI ---
  const handleGenerateAI = async () => {
    const { sectionIdx, lectureIdx } = selectedAILecture || {};
    if (!validIndex(sectionIdx) || !validIndex(lectureIdx)) return;

    const target = curriculum[sectionIdx]?.lectures?.[lectureIdx];
    if (!target?.lecId || !target?.videoId) return toast.warning("Missing lecture info or video.");

    patchLecture(sectionIdx, lectureIdx, (l) => ({ aiData: { ...l.aiData, status: "processing" } }));
    toast.info("AI generation started.");

    const res = await handleRequest(authApi.post(
      `/courses/${course?.courseId}/lectures/${target.lecId}/generate-ai`
    ));

    if (res?.success) {
      patchLecture(sectionIdx, lectureIdx, { aiData: res?.result });
      toast.success("AI contents generated!");
    } else {
      patchLecture(sectionIdx, lectureIdx, (l) => ({ aiData: { ...l.aiData, status: "failed" } }));
      toast.error(res?.message || "Generation failed.");
    }
  };

  const handleUpdateAI = (aiChanges) => {
    setCurriculum(prev => {
      const updated = _.cloneDeep(prev);

      const { sectionIdx, lectureIdx } = selectedAILecture || {};

      const section = updated[sectionIdx];
      const lecture = section?.lectures?.[lectureIdx];
      if (!lecture) return prev;

      section.lectures[lectureIdx] = {
        ...lecture,
        aiData: {
          ...lecture.aiData,
          summary: aiChanges.summary,
          lessonNotes: {
            ...lecture.aiData?.lessonNotes,
            keyConcepts: aiChanges.keyConcepts,
            mainPoints: aiChanges.mainPoints
          },
          quizzes: aiChanges.quizzes
        }
      };

      updateField("curriculum.sections", updated);
      return updated;
    });

    setShowAIModal(false);
  };

  const handleDeleteAI = async () => {
    const { sectionIdx, lectureIdx } = selectedAILecture || {};
    if (!validIndex(sectionIdx) || !validIndex(lectureIdx)) return;

    const target = curriculum[sectionIdx]?.lectures?.[lectureIdx];
    if (!target?.lecId) return toast.warning("Missing lecture info.");

    if (!window.confirm("Delete this AI content?")) return;

    const res = await handleRequest(authApi.delete(
      `/courses/${course?.courseId}/lectures/${target.lecId}/ai-contents`
    ));

    if (res?.success) {
      patchLecture(sectionIdx, lectureIdx, { aiData: null });
      toast.success("AI Content removed.");
      // setShowAIModal(false);
    } else {
      toast.error(res?.message || "Failed to remove AI generated contents..");
    }
  };

  // submission ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const { success: validateSuccess, errors: newErrors } = validateStep3(currentCourse);
    if (!validateSuccess) {
      setErrors(newErrors);
      return toast.error("Please make sure all the fields are correct..");
    }

    const step3Changes = _.pick(changes, step3Fields);
    if (_.isEmpty(step3Changes)) return stepperInstance?.next();

    const success = await onUpdate();
    if (success) {
      setErrors({});
      toast.success("Curriculum progress saved!");
      stepperInstance?.next();
    } else {
      if (globalErrors?.general) toast.error("Unable to save changes, try adjusting the fields..");
      else toast.error("Failed to save progress..");
    }
  };

  return {
    state: { course, curriculum, errors, stats, courseId: course?.courseId },

    section: {
      show: showSectionModal,
      data: editingSection,
      open: (idx = null, data = null) => {
        setEditingSectionIndex(idx);
        setEditingSection(data ? { title: data.title } : null);
        setShowSectionModal(true);
      },
      close: () => setShowSectionModal(false),
      save: handleSaveSection,
      remove: handleRemoveSection,
    },

    lecture: {
      show: showLectureModal,
      data: editingLecture,
      open: (secIdx, lecIdx = null, data = null) => {
        setActiveSectionIndex(secIdx);
        setEditingLectureIndex(lecIdx);
        setEditingLecture(data);
        setShowLectureModal(true);
      },
      close: () => setShowLectureModal(false),
      save: handleSaveLecture,
      remove: handleRemoveLecture,
    },

    ai: {
      show: showAIModal,
      data: selectedAILecture ? curriculum[selectedAILecture.sectionIdx].lectures[selectedAILecture.lectureIdx] : null,
      open: (secIdx, lecIdx) => {
        setSelectedAILecture({ sectionIdx: secIdx, lectureIdx: lecIdx });
        setShowAIModal(true);
      },
      close: () => setShowAIModal(false),
      generate: handleGenerateAI,
      update: handleUpdateAI,
      delete: handleDeleteAI,
    },

    handlers: {
      handleSubmit,
      goBack: (e) => { e.preventDefault(); stepperInstance?.previous(); },
    },
  };
};