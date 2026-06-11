import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function useLectureConclusion({
  show,
  aiData,
  courseId,
  lectureId,
  isLastLecture,
  onHide,
  onNext,
  navigate,
}) {
  const quizzes = aiData?.quizzes || [];

  const [userAnswers, setUserAnswers] = useState({});
  const [checkedState, setCheckedState] = useState({});
  const [quizScore, setQuizScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;

    setUserAnswers({});
    setCheckedState({});
    setQuizScore(0);
    setWrongAnswers([]);
    setLoading(false);
  }, [show, aiData]);

  const allQuizzesCompleted = useMemo(() => {
    if (!quizzes.length) return true;
    return Object.keys(checkedState).length === quizzes.length;
  }, [quizzes.length, checkedState]);

  const isLocked = !allQuizzesCompleted;

  const handleSelect = useCallback(
    (qIndex, optIndex) => {
      if (checkedState[qIndex]) return;

      setUserAnswers((prev) => ({
        ...prev,
        [qIndex]: optIndex,
      }));
    },
    [checkedState]
  );

  const handleCheck = useCallback(
    (qIndex) => {
      const selectedOptIndex = userAnswers[qIndex];
      const quiz = quizzes[qIndex];

      if (!quiz || selectedOptIndex === undefined) return;

      const selectedText = quiz.options?.[selectedOptIndex];
      const isCorrect = selectedText === quiz.correctAnswer;

      setCheckedState((prev) => ({
        ...prev,
        [qIndex]: true,
      }));

      if (isCorrect) {
        setQuizScore((prev) => prev + 1);
      } else {
        setWrongAnswers((prev) => [
          ...prev,
          {
            question: quiz.question,
            topic: quiz.topic || "General",
          },
        ]);
      }
    },
    [quizzes, userAnswers]
  );

  const saveQuizResult = useCallback(async () => {
    if (!backendUrl || !courseId || !lectureId || !quizzes.length) return;

    await axios.post(
      `${backendUrl}/api/quizzes`,
      {
        courseId,
        lectureId,
        score: quizScore,
        totalQuestions: quizzes.length,
        wrongAnswers,
      },
      { withCredentials: true }
    );
  }, [courseId, lectureId, quizScore, quizzes.length, wrongAnswers]);

  const generateAssessment = useCallback(async () => {
    const { data } = await axios.get(
      `${backendUrl}/api/courses/${encodeURIComponent(courseId)}/assessment`,
      { withCredentials: true }
    );

    return data?.result || data?.assessment || null;
  }, [courseId]);

  const handleClose = useCallback(async () => {
    try {
      setLoading(true);

      if (quizzes.length > 0 && Object.keys(checkedState).length > 0) {
        await saveQuizResult();
      }

      onHide?.();
    } catch (error) {
      console.error("Save quiz on close error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Cannot save quiz result."
      );
    } finally {
      setLoading(false);
    }
  }, [quizzes.length, checkedState, saveQuizResult, onHide]);

  const handleNextOrFinish = useCallback(async () => {
    try {
      setLoading(true);

      if (quizzes.length > 0) {
        await saveQuizResult();
      }

      if (isLastLecture) {
        toast.info("AI is analyzing your performance... Please wait!");

        const assessment = await generateAssessment();

        if (assessment) {
          onHide?.();
          navigate(`/student/courses/${courseId}/result`, {
            state: { assessment },
          });
        } else {
          toast.error("Cannot generate assessment.");
        }

        return;
      }

      onNext?.();
    } catch (error) {
      console.error("Lecture conclusion error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    quizzes.length,
    saveQuizResult,
    isLastLecture,
    generateAssessment,
    onHide,
    navigate,
    courseId,
    onNext,
  ]);

  return {
    userAnswers,
    checkedState,
    loading,
    isLocked,
    handleSelect,
    handleCheck,
    handleClose,
    handleNextOrFinish,
  };
}