import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useCourseEditor } from "../../CourseEditorContext";


const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const useStep3 = (stepperInstance) => {
  const {
    setCourse,
    currentCourse: course,
    courseDraft: draft,
    updateField: onUpdateField,
    onSaveDraft
  } = useCourseEditor();

  const [curriculum, setCurriculum] = useState([]);
  const [errors, setErrors] = useState({});

  // section modal
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);

  // lecture modal
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [editingLectureIndex, setEditingLectureIndex] = useState(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);

  // AI modal
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedAILecture, setSelectedAILecture] = useState(null); // { sectionIdx, lectureIdx }

  // initialize curriculum
  useEffect(() => {
    if (course?.curriculum) {
      setCurriculum(course.curriculum.map(s => ({
        ...s,
        lectures: s.lectures || []
      })));
    }
  }, [course?.id]);

  // helper: calculate total lectures
  const calculateTotalLectures = (curr) => {
    return curr.reduce((acc, sec) => acc + (sec.lectures?.length || 0), 0);
  };

  // computed stats
  const totalSections = curriculum.length;
  const totalLectures = calculateTotalLectures(curriculum);

  // --- SECTION handlers ---
  const openAddSection = () => {
    setEditingSection(null);
    setEditingSectionIndex(null);
    setShowSectionModal(true);
  };

  const openEditSection = (index, sectionData) => {
    setEditingSection({ title: sectionData.section });
    setEditingSectionIndex(index);
    setShowSectionModal(true);
  };

  const handleSaveSection = (title) => {
    const updated = [...curriculum];

    if (editingSectionIndex !== null) {
      updated[editingSectionIndex] = { ...updated[editingSectionIndex], section: title };
    } else {
      updated.push({ section: title, lectures: [] });
    }

    setCurriculum(updated);
    onUpdateField("curriculum", updated);
    setShowSectionModal(false);
  };

  const handleRemoveSection = (index) => {
    if (!window.confirm("Are you sure? All lectures in this section will be deleted.")) return;

    const updated = curriculum.filter((_, i) => i !== index);
    const newCount = calculateTotalLectures(updated);

    setCurriculum(updated);
    onUpdateField("curriculum", updated);
    onUpdateField("lecturesCount", newCount);
  };

  // --- LECTURE handlers ---
  const openAddLecture = (sectionIndex) => {
    setEditingLecture(null);
    setEditingLectureIndex(null);
    setActiveSectionIndex(sectionIndex);
    setShowLectureModal(true);
  };

  const openEditLecture = (sectionIndex, lectureIndex, lectureData) => {
    setEditingLecture(lectureData);
    setEditingLectureIndex(lectureIndex);
    setActiveSectionIndex(sectionIndex);
    setShowLectureModal(true);
  };

  const handleSaveLecture = (lectureData) => {
    const updated = [...curriculum];
    const targetSection = { ...updated[activeSectionIndex] };
    const targetLectures = [...targetSection.lectures];

    if (editingLectureIndex !== null) {
      targetLectures[editingLectureIndex] = lectureData;
    } else {
      targetLectures.push(lectureData);
    }

    targetSection.lectures = targetLectures;
    updated[activeSectionIndex] = targetSection;

    const newCount = calculateTotalLectures(updated);

    setCurriculum(updated);
    onUpdateField("curriculum", updated);
    onUpdateField("lecturesCount", newCount);
    setShowLectureModal(false);
  };

  const handleRemoveLecture = (sectionIndex, lectureIndex) => {
    if (!window.confirm("Remove this lecture?")) return;

    const updated = [...curriculum];
    const targetSection = { ...updated[sectionIndex] };
    targetSection.lectures = targetSection.lectures.filter((_, i) => i !== lectureIndex);
    updated[sectionIndex] = targetSection;

    const newCount = calculateTotalLectures(updated);

    setCurriculum(updated);
    onUpdateField("curriculum", updated);
    onUpdateField("lecturesCount", newCount);
  };

  const currentSelectedLecture = useMemo(() => {
    if (!selectedAILecture) return null;
    return curriculum[selectedAILecture.sectionIdx]?.lectures[selectedAILecture.lectureIdx];
  }, [curriculum, selectedAILecture]);

  // --- AI logic ---
  const openAIModal = (sectionIdx, lectureIdx) => {
    const lecture = curriculum[sectionIdx].lectures[lectureIdx];
    setSelectedAILecture({ sectionIdx, lectureIdx, data: lecture });
    setShowAIModal(true);
  };

  const handleGenerateAI = async () => {
    if (!selectedAILecture) return;
    const { sectionIdx, lectureIdx, data: lecture } = selectedAILecture;

    if (!course?.id || !lecture.id) {
      toast.warning("Please save changes first.");
      return;
    }
    if (!lecture.videoUrl) {
      toast.warning("Video missing.");
      return;
    }

    try {
      // update status to processing
      updateLectureAIStatus(sectionIdx, lectureIdx, "Processing");

      const { data } = await axios.post(
        `${backendUrl}/api/courses/generate-ai`,
        { courseId: course.id, lectureId: lecture.id, videoKey: lecture.videoUrl },
        { withCredentials: true }
      );

      if (!data.success) throw new Error(data.message);
      toast.info("AI Generation started...");
    } catch (error) {
      console.error(error);
      toast.error("Generation failed");
      updateLectureAIStatus(sectionIdx, lectureIdx, "Failed");
    }
  };

  const handleDeleteAI = () => {
    if (!selectedAILecture || !window.confirm("Delete this AI content?")) return;
    const { sectionIdx, lectureIdx } = selectedAILecture;

    const updated = [...curriculum];
    const targetSection = { ...updated[sectionIdx] };
    const targetLectures = [...targetSection.lectures];

    targetLectures[lectureIdx] = {
      ...targetLectures[lectureIdx],
      aiData: null
    };

    targetSection.lectures = targetLectures;
    updated[sectionIdx] = targetSection;

    setCurriculum(updated);

    onUpdateField("curriculum", updated);

    setShowAIModal(false);
    toast.success("AI Content removed.");
  };

  // helper: update nested state
  const updateLectureAIStatus = (sectionIdx, lectureIdx, status) => {
    setCurriculum(prev => {
      const updated = [...prev];
      const targetSection = { ...updated[sectionIdx] };
      const targetLectures = [...targetSection.lectures];

      targetLectures[lectureIdx] = {
        ...targetLectures[lectureIdx],
        aiData: { ...targetLectures[lectureIdx].aiData, status }
      };

      targetSection.lectures = targetLectures;
      updated[sectionIdx] = targetSection;

      onUpdateField("curriculum", updated);

      return updated;
    });
  };

  // AI Polling
  useEffect(() => {
    const hasProcessing = curriculum.some(s => s.lectures?.some(l => l.aiData?.status === "Processing"));
    if (!hasProcessing || !course?.id) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/instructor/courses/${course.id}`,
          { withCredentials: true }
        );

        if (data.success && data.result) {
          if (Object.keys(draft).length === 0) {
            setCourse(data.result);
          } else {
            setCourse(prev => ({ ...data.result, ...prev }));
          }
        } else {
          throw new Error(data.message);
        }
      } catch (e) { console.error("Polling error", e); }
    }, 1 * 60 * 1000); // every 1m

    return () => clearInterval(interval);
  }, [curriculum, course?.id, draft, setCourse]);

  const validate = () => {
    const errs = {};
    if (curriculum.length === 0) errs.curriculum = "Add at least one section.";
    else if (curriculum.some(s => s.lectures.length === 0)) errs.curriculum = "Each section must have at least one lecture.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please check form for errors.");
      return;
    }

    if (course?.status?.toUpperCase() === "DRAFT") {
      try {
        await onSaveDraft({
          curriculum,
          lecturesCount: totalLectures
        });

        toast.success("Curriculum saved!");
      } catch (err) {
        console.error("Save curriculum:", err);
        toast.error(err?.message || "Failed to save curriculum");
        return;
      }
    } else {
      onUpdateField("curriculum", curriculum);
      onUpdateField("lecturesCount", totalLectures);
      toast.info("Curriculum updated locally.");
    }

    stepperInstance?.next();
  };

  return {
    data: { curriculum, errors, stats: { totalSections, totalLectures }, courseId: course?.id },
    modals: {
      section: {
        show: showSectionModal,
        data: editingSection,
        close: () => setShowSectionModal(false)
      },
      lecture: {
        show: showLectureModal,
        data: editingLecture,
        close: () => setShowLectureModal(false)
      },
      ai: {
        show: showAIModal,
        data: currentSelectedLecture,
        close: () => setShowAIModal(false)
      }
    },
    handlers: {
      openAddSection, openEditSection, handleSaveSection, handleRemoveSection,
      openAddLecture, openEditLecture, handleSaveLecture, handleRemoveLecture,
      openAIModal, handleGenerateAI, handleDeleteAI,
      handleSubmit, goBack: (e) => { e.preventDefault(); stepperInstance?.previous(); }
    }
  };
};