import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { getObject } from "../utils/aws/getObject.js"; // Import hàm getObject từ file S3 của bạn

// Khởi tạo Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

// Hàm tải file từ S3 về máy chủ (thư mục temp)
// Vì Gemini cần upload file từ đường dẫn cục bộ
const downloadS3VideoToTemp = async (videoKey) => {
  try {
    const s3Stream = await getObject(videoKey);
    const tempFileName = `temp-${Date.now()}-${path.basename(videoKey)}`;
    const tempFilePath = path.resolve(tempFileName);

    await pipeline(s3Stream, fs.createWriteStream(tempFilePath));
    return tempFilePath;
  } catch (error) {
    console.error("Lỗi tải file từ S3:", error);
    throw new Error("Không thể tải video từ S3");
  }
};

export const processVideoWithGemini = async (videoKey) => {
  let tempFilePath = null;
  let uploadResult = null;

  try {
    console.log(`> [1/5] Đang tải video từ S3 về server... (Key: ${videoKey})`);
    tempFilePath = await downloadS3VideoToTemp(videoKey);

    console.log(`> [2/5] Đang upload video lên Google Gemini...`);
    uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: "video/mp4", // Hoặc check đuôi file để set đúng mimeType
      displayName: "Lecture Video",
    });

    console.log(`> [3/5] Đợi Gemini xử lý video (File URI: ${uploadResult.file.uri})...`);
    // Gemini cần thời gian để xử lý file video sau khi upload (State: PROCESSING -> ACTIVE)
    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === "PROCESSING") {
      process.stdout.write("."); // Hiệu ứng loading
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Chờ 5s check 1 lần
      file = await fileManager.getFile(uploadResult.file.name);
    }
    console.log("\n> Video đã sẵn sàng!");

    if (file.state === "FAILED") {
      throw new Error("Gemini không thể xử lý video này.");
    }

    console.log(`> [4/5] Đang yêu cầu AI tạo Summary & Quiz...`);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json", // Bắt buộc trả về JSON
        responseSchema: {
          type: SchemaType.OBJECT,
          required: ["summary", "quizzes"],
          properties: {
            summary: { type: SchemaType.STRING },
            quizzes: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                required: ["question", "options", "correctAnswer", "explanation"],
                properties: {
                  question: { type: SchemaType.STRING },
                  options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  correctAnswer: { type: SchemaType.STRING },
                  explanation: { type: SchemaType.STRING }
                }
              }
            }
          }
        }
      }
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri
        }
      },
      { text: "Bạn là giảng viên chuyên nghiệp. Nhiệm vụ: 1. Tóm tắt chi tiết video. 2. Tạo chính xác 5 câu hỏi trắc nghiệm (Quiz) từ nội dung video. Bắt buộc trả về JSON có đủ cả summary và quizzes." }
    ]);

    console.log(`> [5/5] Hoàn tất!`);
    const jsonResponse = JSON.parse(result.response.text());

    // Dọn dẹp: Xóa file trên Cloud của Google để không rác
    await fileManager.deleteFile(uploadResult.file.name);
    
    return jsonResponse;

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  } finally {
    // Dọn dẹp: Xóa file tạm trên ổ cứng server
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};