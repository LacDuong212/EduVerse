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
      mimeType: "video/mp4",
      displayName: "Lecture Video",
    });

    console.log(`> [3/5] Đợi Gemini xử lý video (File URI: ${uploadResult.file.uri})...`);
    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === "PROCESSING") {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 5000));
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
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING },

            lessonNotes: {
              type: SchemaType.OBJECT,
              properties: {
                keyConcepts: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      term: { type: SchemaType.STRING },
                      definition: { type: SchemaType.STRING }
                    },
                    required: ["term", "definition"]
                  },
                  description: "Các thuật ngữ chuyên môn kèm giải thích ngắn gọn"
                },
                mainPoints: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "Tóm tắt các bước hoặc luồng tư duy chính của bài"
                },
                practicalTips: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "Lời khuyên thực tế, lỗi thường gặp hoặc cách áp dụng"
                }
              },
              required: ["keyConcepts", "mainPoints", "practicalTips"]
            },

            // 3. Quizzes (Nằm trong properties)
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
          },
          required: ["summary", "lessonNotes", "quizzes"]
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
      {
        text: `Bạn là giảng viên chuyên nghiệp, tâm huyết. Hãy phân tích video và tạo nội dung học tập chất lượng cao:

        1. **Tóm tắt (Summary):** 2-3 câu tổng quan nội dung video.

        2. **Ghi chú bài học (Lesson Notes) - Phần quan trọng nhất:**
           - **Khái niệm cốt lõi (Key Concepts):** Trích xuất 3-5 thuật ngữ quan trọng nhất. Với mỗi thuật ngữ, hãy giải thích ngắn gọn (1 câu) để người học dễ hiểu.
           - **Nội dung trọng tâm (Main Points):** Tóm tắt 3-5 ý chính, các bước thực hiện hoặc tư duy cốt lõi trong bài.
           - **Mẹo thực tế (Practical Tips):** Đưa ra 1-2 lời khuyên, cảnh báo lỗi thường gặp, hoặc ví dụ ứng dụng thực tế liên quan đến bài học.

        3. **Trắc nghiệm (Quizzes):** 5 câu hỏi kiểm tra kiến thức (khó vừa phải).

        Trả về JSON đúng cấu trúc đã định nghĩa.`
      }
    ]);

    console.log(`> [5/5] Hoàn tất!`);
    const jsonResponse = JSON.parse(result.response.text());

    await fileManager.deleteFile(uploadResult.file.name);

    return jsonResponse;

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};