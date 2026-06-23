import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useVideoStream from "@/hooks/useVideoStream";

export const useAiData = (lecture, show, onUpdate) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);

  const { streamUrl: s3StreamUrl } = useVideoStream(lecture?.oldVideoId || lecture?.videoId);

  const lastLoadedLecId = useRef(null);

  const aiData = lecture?.aiData || {};
  const status = aiData.status || "none";

  const isProcessing = status === "processing";
  const isFailed = status === "failed";
  const hasData = status === "completed";

  const rawData = useMemo(() => ({
    title: lecture?.title || "Unknown Lecture",
    summary: aiData.summary || "",
    keyConcepts: aiData.lessonNotes?.keyConcepts || [],
    mainPoints: aiData.lessonNotes?.mainPoints || [],
    practicalTips: aiData.lessonNotes?.practicalTips || [],
    quizzes: aiData.quizzes || [],
    videoUrl: s3StreamUrl,
  }), [lecture?.title, aiData.summary, aiData.lessonNotes, aiData.quizzes, s3StreamUrl]);

  const lastLoadedRawData = useRef(null);

  useEffect(() => {
    if (!show || !lecture?.lecId || !hasData) {
      if (!show) {
        lastLoadedLecId.current = null;
      }
      setIsEditing(false);
      setEditedData(null);
      lastLoadedRawData.current = null;
      return;
    }

    const rawDataString = JSON.stringify(rawData);
    if (lastLoadedLecId.current !== lecture.lecId || lastLoadedRawData.current !== rawDataString) {
      setEditedData(JSON.parse(rawDataString));
      lastLoadedLecId.current = lecture.lecId;
      lastLoadedRawData.current = rawDataString;
      setIsEditing(false);
    }
  }, [lecture?.lecId, show, hasData, rawData]);

  useEffect(() => {
    if (show) setActiveTab("summary");
  }, [show, lecture?.lecId]);

  const handleSummaryChange = useCallback((val) => {
    setEditedData(prev => ({ ...prev, summary: val }));
  }, []);

  const handleMainPointChange = useCallback((idx, val) => {
    setEditedData(prev => {
      const updatedPoints = [...prev.mainPoints];
      updatedPoints[idx] = val;
      return { ...prev, mainPoints: updatedPoints };
    });
  }, []);

  const handlePracticalTipChange = useCallback((idx, val) => {
    setEditedData(prev => {
      const updatedTips = [...prev.practicalTips];
      updatedTips[idx] = val;
      return { ...prev, practicalTips: updatedTips };
    });
  }, []);

  const handleConceptChange = useCallback((idx, field, val) => {
    setEditedData(prev => {
      const updatedConcepts = [...prev.keyConcepts];
      updatedConcepts[idx] = { ...updatedConcepts[idx], [field]: val };
      return { ...prev, keyConcepts: updatedConcepts };
    });
  }, []);

  const handleQuizChange = useCallback((qIdx, field, val) => {
    setEditedData(prev => {
      const updatedQuizzes = [...prev.quizzes];
      updatedQuizzes[qIdx] = { ...updatedQuizzes[qIdx], [field]: val };
      return { ...prev, quizzes: updatedQuizzes };
    });
  }, []);

  const handleQuizTimestampChange = useCallback((qIdx, mmss) => {
    setEditedData(prev => {
      const updatedQuizzes = [...prev.quizzes];
      const parts = mmss.split(":").map(Number);
      const secs = parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])
        ? parts[0] * 60 + parts[1]
        : null;
      updatedQuizzes[qIdx] = { ...updatedQuizzes[qIdx], timestamp: secs };
      return { ...prev, quizzes: updatedQuizzes };
    });
  }, []);

  const handleQuizOptionChange = useCallback((qIdx, oIdx, val) => {
    setEditedData(prev => {
      const updatedQuizzes = [...prev.quizzes];
      const updatedOptions = [...updatedQuizzes[qIdx].options];
      const oldOptionVal = updatedOptions[oIdx];

      updatedOptions[oIdx] = val;
      updatedQuizzes[qIdx].options = updatedOptions;

      if (updatedQuizzes[qIdx].correctAnswer === oldOptionVal) {
        updatedQuizzes[qIdx].correctAnswer = val;
      }
      return { ...prev, quizzes: updatedQuizzes };
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (onUpdate && editedData) {
      await onUpdate(editedData);
    }
    setIsEditing(false);
  }, [onUpdate, editedData]);

  const handleCancel = useCallback(() => {
    setEditedData(JSON.parse(JSON.stringify(rawData)));
    setIsEditing(false);
  }, [rawData]);

  const startEditing = useCallback(() => setIsEditing(true), []);

  return {
    state: {
      activeTab,
      isProcessing,
      isFailed,
      hasData,
      isEditing,
      showModal: !!lecture && show
    },
    data: rawData,
    editedData,
    handlers: {
      setActiveTab,
      setIsEditing,
      startEditing,
      handleSummaryChange,
      handleMainPointChange,
      handlePracticalTipChange,
      handleConceptChange,
      handleQuizChange,
      handleQuizOptionChange,
      handleQuizTimestampChange,
      handleSave,
      handleCancel
    }
  };
};