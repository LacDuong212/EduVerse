import Course from "../models/courseModel.js";
import { processVideoWithGemini } from "../services/aiService.js";
import Notification from "../models/notificationModel.js";
import { getIO, getOnlineUsers } from "../configs/socket.js";

const sendInternalNotification = async (userId, type, message) => {
  try {
    await Notification.create({ userId, message, type });

    const onlineUsers = getOnlineUsers();
    const receiver = onlineUsers.find((user) => user.userId === userId);

    if (receiver) {
      const io = getIO();
      if (io) {
        io.to(receiver.socketId).emit("getNotification", {
          userId, message, type, isRead: false, createdAt: new Date()
        });
      }
    }
  } catch (err) {
    console.error("Internal Notification Error:", err.message);
  }
};

export const processLectureAI = async (req, res) => {
  const { courseId, lectureId, videoKey } = req.body;

  // Validate input
  if (!courseId || !lectureId || !videoKey) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  res.json({ success: true, message: "Background Job Started" });

  let instructorId = null;
  let lectureTitle = "lecture";

  try {
    const course = await Course.findById(courseId);
    if (course) {
      let rawId = course.instructor?.ref || course.instructor?._id || course.instructor;
      instructorId = String(rawId);

      const foundLecture = course.curriculum
        .flatMap(c => c.lectures)
        .find(l => l._id.toString() === lectureId);

      if (foundLecture) lectureTitle = foundLecture.title;
    }

    await Course.updateOne(
      { _id: courseId, "curriculum.lectures._id": lectureId },
      { $set: { "curriculum.$[].lectures.$[lec].aiData.status": "Processing" } },
      { arrayFilters: [{ "lec._id": lectureId }] }
    );

    const aiData = await processVideoWithGemini(videoKey);

    await Course.updateOne(
      { _id: courseId, "curriculum.lectures._id": lectureId },
      {
        $set: {
          "curriculum.$[].lectures.$[lec].aiData.summary": aiData.summary,
          "curriculum.$[].lectures.$[lec].aiData.lessonNotes": aiData.lessonNotes,
          "curriculum.$[].lectures.$[lec].aiData.quizzes": aiData.quizzes,
          "curriculum.$[].lectures.$[lec].aiData.status": "Completed"
        }
      },
      { arrayFilters: [{ "lec._id": lectureId }] }
    );

    console.log(`> AI Success: ${lectureId}`);

    if (instructorId) {
      await sendInternalNotification(
        instructorId,
        'SUCCEEDED',
        `AI Processing Completed: Summary and quizzes for "${lectureTitle}" are ready.`
      );
    }

  } catch (error) {
    console.error(`> Xử lý AI thất bại cho Lecture: ${lectureId}`, error);

    await Course.updateOne(
      { _id: courseId, "curriculum.lectures._id": lectureId },
      { $set: { "curriculum.$[].lectures.$[lec].aiData.status": "Failed" } },
      { arrayFilters: [{ "lec._id": lectureId }] }
    );

    if (instructorId) {
      await sendInternalNotification(
        instructorId,
        'FAILED',
        `AI Processing Failed: Could not process video for "${lectureTitle}".`
      );
    }
  }
};