import { useState, useEffect, useMemo } from "react";

export const useAiData = (lecture, show) => {
  const [activeTab, setActiveTab] = useState("summary");

  // reset tab to summary whenever the modal opens or lecture changes
  useEffect(() => {
    if (show) setActiveTab("summary");
  }, [show, lecture?.id]);

  const aiData = lecture?.aiData || {};
  const status = aiData.status || "None";

  const isProcessing = status === "Processing";
  const isFailed = status === "Failed";
  const hasData = status === "Completed";

  const content = useMemo(() => ({
    title: lecture?.title || "Unknown Lecture",
    summary: aiData.summary || "No summary available.",
    keyConcepts: aiData.lessonNotes?.keyConcepts || [],
    mainPoints: aiData.lessonNotes?.mainPoints || [],
    quizzes: aiData.quizzes || [],
  }), [lecture, aiData]);

  return {
    state: {
      activeTab,
      status,
      isProcessing,
      isFailed,
      hasData,
      showModal: !!lecture && show // safety check
    },
    data: content,
    handlers: {
      setActiveTab
    }
  };
};