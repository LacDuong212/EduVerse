import Course from "../models/courseModel.js";
import { processVideoWithGemini } from "../services/aiService.js";

export const processLectureAI = async (req, res) => {
  const { courseId, lectureId, videoKey } = req.body;

  // Validate input
  if (!courseId || !lectureId || !videoKey) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // Trả về response ngay để FE không bị treo
  res.json({ success: true, message: "AI đang xử lý ngầm (Background Job Started)" });

  try {
    // 1. Cập nhật trạng thái Processing
    await Course.updateOne(
      { _id: courseId, "curriculum.lectures._id": lectureId },
      { $set: { "curriculum.$[].lectures.$[lec].aiData.status": "Processing" } },
      { arrayFilters: [{ "lec._id": lectureId }] }
    );

    // 2. Gọi Gemini Service (Mất khoảng 30s - 2 phút tùy độ dài video)
    const aiData = await processVideoWithGemini(videoKey);

    // 3. Cập nhật kết quả vào DB
    await Course.updateOne(
      { _id: courseId, "curriculum.lectures._id": lectureId },
      { 
        $set: { 
          "curriculum.$[].lectures.$[lec].aiData.summary": aiData.summary,
          "curriculum.$[].lectures.$[lec].aiData.quizzes": aiData.quizzes,
          "curriculum.$[].lectures.$[lec].aiData.status": "Completed"
        } 
      },
      { arrayFilters: [{ "lec._id": lectureId }] }
    );

    console.log(`> Xử lý AI thành công cho Lecture: ${lectureId}`);

  } catch (error) {
    console.error(`> Xử lý AI thất bại cho Lecture: ${lectureId}`, error);
    
    // Cập nhật trạng thái Failed
    await Course.updateOne(
      { _id: courseId, "curriculum.lectures._id": lectureId },
      { $set: { "curriculum.$[].lectures.$[lec].aiData.status": "Failed" } },
      { arrayFilters: [{ "lec._id": lectureId }] }
    );
  }
};