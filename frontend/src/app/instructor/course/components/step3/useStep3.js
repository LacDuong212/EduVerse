import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";
import { useCourseEditor } from "../../CourseEditorContext";
import { step3Fields, validateStep3 } from "../../schemas";

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

  useEffect(() => {
    const relevantErrors = _.pickBy(globalErrors, (value, key) => {
      return _.startsWith(key, "curriculum");
    });

    if (!_.isEqual(errors, relevantErrors)) {
      setErrors(relevantErrors);
    }
  }, [globalErrors]);

  const stats = useMemo(() => ({
    totalSections: curriculum.length,
    totalLectures: _.sumBy(curriculum, (s) => s.lectures?.length || 0)
  }), [curriculum]);

  // SECTIONS ---
  const handleSaveSection = (title) => {
    const updatedCurriculum = _.cloneDeep(curriculum);
    if (editingSectionIndex !== null) {
      updatedCurriculum[editingSectionIndex].title = title;
    } else {
      updatedCurriculum.push({ title, lectures: [] });
    }
    setCurriculum(updatedCurriculum);
    updateField("curriculum.sections", updatedCurriculum);
    setShowSectionModal(false);
  };

  const handleRemoveSection = (index) => {
    const length = curriculum[index]?.lectures?.length;
    if (length)
      if (!window.confirm("Are you sure? All lectures in this section will be deleted.")) return;
    const updated = curriculum.filter((_, i) => i !== index);
    setCurriculum(updated);
    updateField("curriculum.sections", updated);
  };

  // LECTURES ---
  const handleSaveLecture = (lectureChanges) => {
    const updated = _.cloneDeep(curriculum);
    const isEditing = editingLectureIndex !== null;
    const section = updated[activeSectionIndex];
    let savedLecture;
    if (isEditing) {
      const existing = section.lectures[editingLectureIndex];
      savedLecture = { ...existing, ...lectureChanges };
      section.lectures[editingLectureIndex] = savedLecture;
    } else {
      savedLecture = lectureChanges;
      section.lectures.push(savedLecture);
    }
    setCurriculum(updated);
    updateField("curriculum.sections", updated);

    setEditingLecture(savedLecture);
    setShowLectureModal(false);
  };

  const handleRemoveLecture = (sectionIndex, lectureIndex) => {
    if (!window.confirm("Remove this lecture?")) return;
    const updated = _.cloneDeep(curriculum);
    updated[sectionIndex].lectures.splice(lectureIndex, 1);
    setCurriculum(updated);
    updateField("curriculum.sections", updated);
  };

  // AI --- #TODO
  const handleGenerateAI = async () => {
    if (!selectedAILecture) return;
    const { sectionIdx, lectureIdx } = selectedAILecture;
    const lecture = curriculum[sectionIdx].lectures[lectureIdx];
    if (!course?.courseId || !lecture?.lecId) return toast.warning("Please save curriculum changes first.");
    if (!lecture?.videoId) return toast.warning("No video found for this lecture.");
    try {
      updateLectureAIStatus(sectionIdx, lectureIdx, "processing");
      const res = await handleRequest(
        authApi.post(`/courses/${course.courseId}/lectures/${lecture.lecId}/generate-ai`)
      );
      if (res.success) toast.info("AI Generation started...");
      else throw new Error(res.message);
    } catch (error) {
      toast.error("Generation failed..");
      updateLectureAIStatus(sectionIdx, lectureIdx, "failed");
    }
  };

  const handleDeleteAI = () => {
    if (!selectedAILecture) return;
    if (!window.confirm("Delete this AI content?")) return;
    // const updated = [...curriculum];
    // const targetSection = { ...updated[sectionIdx] };
    // const targetLectures = [...targetSection.lectures];
    // targetLectures[lectureIdx] = {
    //   ...targetLectures[lectureIdx],
    //   aiData: null
    // };
    // targetSection.lectures = targetLectures;
    // updated[sectionIdx] = targetSection;
    // setCurriculum(updated);
    // updateField("curriculum", updated);
    // setShowAIModal(false);
    // toast.success("AI Content removed.");
  };

  const updateLectureAIStatus = (sIdx, lIdx, status) => {
    const updated = _.cloneDeep(curriculum);
    _.set(updated, `${sIdx}.lectures.${lIdx}.aiData.status`, status);
    setCurriculum(updated);
    // updateField(`curriculum.sections.${sIdx}.lectures.${lIdx}.aiData.status`, status);
  };

  // AI Polling
  // useEffect(() => {
  //   const hasProcessing = curriculum.some(s => s.lectures?.some(l => l.aiData?.status === "processing"));
  //   if (!hasProcessing || !currentCourse?.courseId) return;
  //   const interval = setInterval(async () => {
  //     try {
  //       const res = await handleRequest(authApi.get(`/instructor/courses/${currentCourse?.courseId}`));
  //       if (res.success) {

  //       } else throw new Error(res.message);
  //     } catch (e) { console.error("[DEBUG] Polling Error:", e); }
  //   }, 1 * 60 * 1000); // every 1m
  //   return () => clearInterval(interval);
  // }, [curriculum, currentCourse?.courseId]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const { success: validateSuccess, errors: newErrors } = validateStep3(currentCourse);
    if (!validateSuccess) {
      setErrors(newErrors);

      toast.error("Please make sure all the fields are correct..");
      return;
    }

    const step3Changes = _.pick(changes, step3Fields);
    if (_.isEmpty(step3Changes)) return stepperInstance?.next();

    const success = await onUpdate();
    if (success) {
      setErrors({});
      toast.success("Curriculum progress saved!");
      stepperInstance?.next();
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
      delete: handleDeleteAI,
    },

    handlers: {
      handleSubmit,
      goBack: (e) => { e.preventDefault(); stepperInstance?.previous(); },
    },
  };
};