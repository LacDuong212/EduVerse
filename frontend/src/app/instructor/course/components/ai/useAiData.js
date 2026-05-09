import { useEffect, useMemo, useState } from "react";
import useVideoStream from "@/hooks/useVideoStream";

export const useAiData = (lecture, show) => {
  const [activeTab, setActiveTab] = useState("summary");

  const { streamUrl: s3StreamUrl } = useVideoStream(lecture?.oldVideoId || lecture?.videoId);

  useEffect(() => {
    if (show) setActiveTab("summary");
  }, [show, lecture?.lecId]);

  const aiData = lecture?.aiData || {};
  const status = aiData.status || "none";

  const isProcessing = status === "processing";
  const isFailed = status === "failed";
  const hasData = status === "completed";

  const content = useMemo(() => ({
    title: lecture?.title || "Unknown Lecture",
    summary: aiData.summary || "No summary available.",
    keyConcepts: aiData.lessonNotes?.keyConcepts || [],
    mainPoints: aiData.lessonNotes?.mainPoints || [],
    quizzes: aiData.quizzes || [],
    videoUrl: s3StreamUrl,
  }), [lecture, aiData, s3StreamUrl]);

  return {
    state: {
      activeTab,
      status,
      isProcessing,
      isFailed,
      hasData,
      showModal: !!lecture && show
    },
    data: content,
    handlers: {
      setActiveTab
    }
  };
};