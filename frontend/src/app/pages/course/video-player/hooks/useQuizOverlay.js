import { useState, useEffect, useRef, useCallback } from "react";

export default function useQuizOverlay({ playerContainerRef, quizzes, source, playerKey }) {
  const [activeQuiz, setActiveQuiz] = useState(null); // { quiz, index } | null
  const [quizResults, setQuizResults] = useState([]);

  const shownRef = useRef(new Set());
  const quizzesRef = useRef(quizzes);

  const hasTimestampQuizzes = (quizzes || []).some((q) => q.timestamp != null);

  // Keep quizzesRef in sync without re-attaching the listener
  useEffect(() => {
    quizzesRef.current = quizzes;
  }, [quizzes]);

  // Reset per lecture
  useEffect(() => {
    shownRef.current = new Set();
    setActiveQuiz(null);
    setQuizResults([]);
  }, [source, playerKey]);

  // Attach timeupdate listener when lecture has timestamp quizzes
  useEffect(() => {
    if (!hasTimestampQuizzes || !source) return;

    const videoEl = playerContainerRef.current?.querySelector("video");
    if (!videoEl) return;

    const handleTimeUpdate = () => {
      const currentTime = videoEl.currentTime;
      const all = quizzesRef.current || [];

      const next = all
        .map((q, i) => ({ ...q, _idx: i }))
        .filter((q) => q.timestamp != null && !shownRef.current.has(q._idx))
        .sort((a, b) => a.timestamp - b.timestamp)
        .find((q) => currentTime >= q.timestamp);

      if (next) {
        shownRef.current.add(next._idx);
        videoEl.pause();
        setActiveQuiz({ quiz: next, index: next._idx });
      }
    };

    videoEl.addEventListener("timeupdate", handleTimeUpdate);
    return () => videoEl.removeEventListener("timeupdate", handleTimeUpdate);
  }, [source, playerKey, hasTimestampQuizzes, playerContainerRef]);

  const onQuizAnswer = useCallback((quizIndex, selectedOption) => {
    const quiz = (quizzesRef.current || [])[quizIndex];
    if (!quiz) return;
    const isCorrect = selectedOption === quiz.correctAnswer;
    setQuizResults((prev) => [
      ...prev,
      {
        index: quizIndex,
        question: quiz.question,
        topic: quiz.topic || "General",
        userAnswer: selectedOption,
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation,
        isCorrect,
      },
    ]);
  }, []);

  const onQuizContinue = useCallback(() => {
    const videoEl = playerContainerRef.current?.querySelector("video");
    setActiveQuiz(null);
    videoEl?.play();
  }, [playerContainerRef]);

  return {
    activeQuiz,
    quizResults,
    hasTimestampQuizzes,
    onQuizAnswer,
    onQuizContinue,
  };
}
