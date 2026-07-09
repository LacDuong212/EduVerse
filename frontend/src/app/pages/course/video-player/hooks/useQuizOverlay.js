import { useState, useEffect, useRef, useCallback } from "react";

export default function useQuizOverlay({
  playerContainerRef,
  quizzes,
  source,
  playerKey,
  onAllAnsweredAtVideoEnd,
}) {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [answeredCount, setAnsweredCount] = useState(0);

  // shownRef: indices that have been queued/displayed (prevents re-triggering on seek-back)
  const shownRef = useRef(new Set());
  // quizQueueRef: queued quizzes waiting to be shown after current one is dismissed
  const quizQueueRef = useRef([]);
  const activeQuizRef = useRef(null); // mirror of activeQuiz state for use inside event handlers

  const quizzesRef = useRef(quizzes);
  const onAllAnsweredRef = useRef(onAllAnsweredAtVideoEnd);

  // shownSeqRef: running count of quizzes displayed this session. Drives the
  // "a / total" label so it reflects how many quizzes the student has reached
  // (1st shown → 1, 2nd shown → 2, …), independent of the quiz's timestamp order.
  const shownSeqRef = useRef(0);

  const hasTimestampQuizzes = (quizzes || []).some((q) => q.timestamp != null);
  const timestampQuizTotal = (quizzes || []).filter((q) => q.timestamp != null).length;

  // hasPendingTimestampQuizzes: true until ALL timestamp quizzes have been answered
  const hasPendingTimestampQuizzes = hasTimestampQuizzes && answeredCount < timestampQuizTotal;

  useEffect(() => { quizzesRef.current = quizzes; }, [quizzes]);
  useEffect(() => { onAllAnsweredRef.current = onAllAnsweredAtVideoEnd; }, [onAllAnsweredAtVideoEnd]);

  // Reset all state when lecture changes
  useEffect(() => {
    shownRef.current = new Set();
    quizQueueRef.current = [];
    activeQuizRef.current = null;
    shownSeqRef.current = 0;
    setAnsweredCount(0);
    setActiveQuiz(null);
    setQuizResults([]);
  }, [source, playerKey]);

  const showQuiz = useCallback((quizObj) => {
    shownSeqRef.current += 1;
    const withSeq = { ...quizObj, seq: shownSeqRef.current };
    activeQuizRef.current = withSeq;
    setActiveQuiz(withSeq);
  }, []);

  // timeupdate: normal playback — show one quiz at a time as timestamp is reached
  const handleTimeUpdate = useCallback((videoEl) => {
    if (activeQuizRef.current) return; // already showing a quiz
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
      showQuiz({ quiz: next, index: next._idx });
    }
  }, [showQuiz]);

  // seeked: user jumped forward — collect ALL skipped quizzes, queue them, show first immediately
  const handleSeeked = useCallback((videoEl) => {
    if (activeQuizRef.current) return; // already showing a quiz, ignore seek
    const currentTime = videoEl.currentTime;
    const all = quizzesRef.current || [];

    const skipped = all
      .map((q, i) => ({ ...q, _idx: i }))
      .filter((q) => q.timestamp != null && !shownRef.current.has(q._idx) && q.timestamp <= currentTime)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (skipped.length === 0) return;

    // Mark all as queued so timeupdate won't re-trigger them
    skipped.forEach((q) => shownRef.current.add(q._idx));
    videoEl.pause();

    // Queue the rest after the first
    quizQueueRef.current = skipped.slice(1);
    showQuiz({ quiz: skipped[0], index: skipped[0]._idx });
  }, [showQuiz]);

  // ended: video finished — force-show any timestamp quizzes not yet triggered
  // (handles the case where AI assigned a timestamp beyond the actual video duration)
  const handleEnded = useCallback((videoEl) => {
    if (activeQuizRef.current) return;
    const all = quizzesRef.current || [];
    const remaining = all
      .map((q, i) => ({ ...q, _idx: i }))
      .filter((q) => q.timestamp != null && !shownRef.current.has(q._idx))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (remaining.length === 0) return;

    remaining.forEach((q) => shownRef.current.add(q._idx));
    quizQueueRef.current = remaining.slice(1);
    showQuiz({ quiz: remaining[0], index: remaining[0]._idx });
  }, [showQuiz]);

  useEffect(() => {
    if (!hasTimestampQuizzes || !source) return;
    const videoEl = playerContainerRef.current?.querySelector("video");
    if (!videoEl) return;

    const onTimeUpdate = () => handleTimeUpdate(videoEl);
    const onSeeked = () => handleSeeked(videoEl);
    const onEnded = () => handleEnded(videoEl);
    // Prevent Plyr (or browser) from resuming while a quiz overlay is active
    const onPlay = () => {
      if (activeQuizRef.current) videoEl.pause();
    };

    videoEl.addEventListener("timeupdate", onTimeUpdate);
    videoEl.addEventListener("seeked", onSeeked);
    videoEl.addEventListener("ended", onEnded);
    videoEl.addEventListener("play", onPlay);
    return () => {
      videoEl.removeEventListener("timeupdate", onTimeUpdate);
      videoEl.removeEventListener("seeked", onSeeked);
      videoEl.removeEventListener("ended", onEnded);
      videoEl.removeEventListener("play", onPlay);
    };
  }, [source, playerKey, hasTimestampQuizzes, playerContainerRef, handleTimeUpdate, handleSeeked, handleEnded]);

  const onQuizAnswer = useCallback((quizIndex, selectedOption) => {
    const quiz = (quizzesRef.current || [])[quizIndex];
    if (!quiz) return;
    const isCorrect = selectedOption === quiz.correctAnswer;
    setAnsweredCount((c) => c + 1);
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
    // If more quizzes are queued, show the next one immediately (no video play in between)
    const next = quizQueueRef.current[0];
    if (next) {
      quizQueueRef.current = quizQueueRef.current.slice(1);
      showQuiz({ quiz: next, index: next._idx });
      return;
    }

    // Queue exhausted — clear overlay, then decide what to do
    activeQuizRef.current = null;
    setActiveQuiz(null);

    const videoEl = playerContainerRef.current?.querySelector("video");
    if (!videoEl) return;

    // Check if there are still quizzes reachable later during normal playback
    const hasLaterQuizzes = (quizzesRef.current || []).some(
      (q, i) => q.timestamp != null && !shownRef.current.has(i)
    );

    if (!hasLaterQuizzes) {
      const isNearEnd =
        videoEl.duration > 0 && videoEl.currentTime >= videoEl.duration - 1.5;
      if (isNearEnd) {
        onAllAnsweredRef.current?.();
        return;
      }
    }

    videoEl.play();
  }, [playerContainerRef, showQuiz]);

  return {
    activeQuiz,
    quizResults,
    hasTimestampQuizzes,
    hasPendingTimestampQuizzes,
    onQuizAnswer,
    onQuizContinue,
  };
}
