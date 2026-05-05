import { useMemo } from "react";
import useCourseProgress from "@/hooks/useCourseProgress";
import useVideoStream from "@/hooks/useVideoStream";
import { parseYouTubeId, toPlyrSource } from "@/utils/plyrSource";

export default function useVideoPlayerData(
  course,
  courseId,
  lectureId,
  localProgressOverrides = {}
) {
  const {
    progress,
    loading: progressLoading,
    error: progressError,
    ready: progressReady,
  } = useCourseProgress(courseId);

  const sections = useMemo(() => {
    return course?.curriculum?.sections || [];
  }, [course]);

  const lectures = useMemo(() => {
    return sections.flatMap((section) => section.lectures || []);
  }, [sections]);

  const currentLecture = useMemo(() => {
    if (!course) return null;

    return (
      lectures.find((lecture) => lecture.lecId === lectureId) ||
      lectures.find((lecture) => lecture.isFree) ||
      null
    );
  }, [course, lectures, lectureId]);

  const videoId = currentLecture?.videoId || null;

  const {
    streamUrl,
    loading: streamLoading,
    error: streamError,
  } = useVideoStream(videoId);

  const provider = useMemo(() => {
    const yt = streamUrl ? parseYouTubeId(streamUrl) : null;
    return yt ? "yt" : "html5";
  }, [streamUrl]);

  const source = useMemo(() => {
    if (!currentLecture || !streamUrl) return null;

    return toPlyrSource(
      streamUrl,
      currentLecture.title || course?.title,
      course?.thumbnail
    );
  }, [currentLecture, streamUrl, course]);

  const playerKey = useMemo(() => {
    return [
      courseId || "no-course",
      currentLecture?.lecId || "no-lecture",
      provider,
    ].join("|");
  }, [courseId, currentLecture?.lecId, provider]);

  const lectureProgressMap = useMemo(() => {
    const finalMap = {};

    if (Array.isArray(progress?.lectures)) {
      progress.lectures.forEach((item) => {
        const lecId = item.lecId || item.lectureId;

        if (lecId) {
          finalMap[lecId] = {
            ...item,
            lecId,
          };
        }
      });
    }

    Object.entries(localProgressOverrides).forEach(([lecId, override]) => {
      const server = finalMap[lecId] || {};
      const merged = {
        ...server,
        ...override,
      };

      if (server.status === "completed") {
        merged.status = "completed";
        merged.durationSec = Math.max(
          server.durationSec || 0,
          override.durationSec || 0
        );
      }

      finalMap[lecId] = merged;
    });

    return finalMap;
  }, [progress, localProgressOverrides]);

  const currentProgress = currentLecture?.lecId
    ? lectureProgressMap[currentLecture.lecId] || null
    : null;

  return {
    sections,
    lectures,
    currentLecture,
    streamLoading,
    streamError,
    source,
    playerKey,
    lectureProgressMap,
    currentProgress,
    progressLoading,
    progressError,
    progressReady,
  };
}