import { useMemo } from "react";
import { useVideoStream } from "@/hooks/useStreamUrl";
import { toPlyrSource, parseYouTubeId } from "@/utils/plyrSource";
import useCourseProgress from "@/hooks/useCourseProgress";

export default function useVideoPlayerData(course, courseId, lectureId, localProgressOverrides) {
  const { progress } = useCourseProgress(courseId);

  // 1. Chuẩn hóa lectures
  const lectures = useMemo(
    () => (course?.curriculum ? course.curriculum.flatMap((s) => s.lectures || []) : []),
    [course]
  );

  // 2. Chọn lecture hiện tại
  const currentLecture = useMemo(() => {
    if (!course) return null;
    return (
      lectures.find((l) => l._id === lectureId) ||
      lectures.find((l) => l.isFree) ||
      (course.previewVideo
        ? { _id: "preview", title: course.title, videoUrl: course.previewVideo, isFree: true, duration: course.duration }
        : null)
    );
  }, [course, lectures, lectureId]);

  const rawVideoSource = currentLecture?.videoUrl || null;

  // 3. Lấy stream URL
  const { streamUrl, loading: streamLoading, error: streamError } = useVideoStream(courseId, rawVideoSource);

  // 4. Xác định Provider (Youtube / HTML5)
  const provider = useMemo(() => {
    const urlForDetect = streamUrl || rawVideoSource;
    const yt = urlForDetect ? parseYouTubeId(urlForDetect) : null;
    return yt ? "yt" : "html5";
  }, [streamUrl, rawVideoSource]);

  // 5. Tạo Source cho Plyr
  const source = useMemo(() => {
    if (!currentLecture || !course) return null;
    const effectiveUrl = provider === "yt" ? streamUrl || rawVideoSource : streamUrl;
    if (!effectiveUrl) return null;
    return toPlyrSource(effectiveUrl, currentLecture.title || course.title, course.thumbnail);
  }, [currentLecture, course, provider, streamUrl, rawVideoSource]);

  // 6. Tạo Key để remount Plyr
  const playerKey = useMemo(() => {
    return [courseId || "no-course", currentLecture?._id || "no-lecture", provider].join("|");
  }, [courseId, currentLecture?._id, provider]);

  // 7. Merge Progress (Server + Local)
  const lectureProgressMap = useMemo(() => {
    const finalMap = {};
    // Server data
    if (progress?.lectures) {
      progress.lectures.forEach((lec) => {
        if (lec.lectureId) finalMap[lec.lectureId] = { ...lec };
      });
    }
    // Local overrides
    Object.entries(localProgressOverrides || {}).forEach(([lecId, override]) => {
      const server = finalMap[lecId] || {};
      const merged = { ...server, ...override };
      if (server?.status === "completed") {
        merged.status = "completed"; // Không bao giờ downgrade status
        merged.durationSec = Math.max(server.durationSec || 0, override.durationSec || 0);
      }
      finalMap[lecId] = merged;
    });
    return finalMap;
  }, [progress, localProgressOverrides]);

  const currentProgress = currentLecture?._id ? lectureProgressMap[currentLecture._id] : null;

  return {
    lectures,
    currentLecture,
    streamLoading,
    streamError,
    source,
    playerKey,
    lectureProgressMap,
    currentProgress,
  };
}