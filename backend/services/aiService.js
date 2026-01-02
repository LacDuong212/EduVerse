import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { getObject } from "../utils/aws/getObject.js";

import Course from "../models/courseModel.js"
import CourseProgress from "../models/courseProgressModel.js";
import QuizProgress from "../models/quizProgressModel.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

const downloadS3VideoToTemp = async (videoKey) => {
  try {
    const s3Stream = await getObject(videoKey);
    const tempFileName = `temp-${Date.now()}-${path.basename(videoKey)}`;
    const tempFilePath = path.resolve(tempFileName);

    await pipeline(s3Stream, fs.createWriteStream(tempFilePath));
    return tempFilePath;
  } catch (error) {
    console.error("File download error from S3:", error);
    throw new Error("Cannot download video from S3");
  }
};

export const processVideoWithGemini = async (videoKey) => {
  let tempFilePath = null;
  let uploadResult = null;

  try {
    console.log(`> [1/5] Downloading video from S3... (Key: ${videoKey})`);
    tempFilePath = await downloadS3VideoToTemp(videoKey);

    console.log(`> [2/5] Uploading video to Google Gemini...`);
    uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: "video/mp4",
      displayName: "Lecture Video",
    });

    console.log(`> [3/5] Waiting for Gemini processing (File URI: ${uploadResult.file.uri})...`);
    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === "PROCESSING") {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      file = await fileManager.getFile(uploadResult.file.name);
    }
    console.log("\n> Video is ready!");

    if (file.state === "FAILED") {
      throw new Error("Gemini failed to process this video.");
    }

    console.log(`> [4/5] Requesting AI to generate Summary & Quiz...`);
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
                  description: "Technical terms with short definitions"
                },
                mainPoints: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "Summary of core steps or logic"
                },
                practicalTips: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "Real-world advice or common pitfalls"
                }
              },
              required: ["keyConcepts", "mainPoints", "practicalTips"]
            },

            // 3. Quizzes (Nằm trong properties)
            quizzes: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                required: ["question", "options", "correctAnswer", "explanation", "topic"],
                properties: {
                  question: { type: SchemaType.STRING },
                  options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  correctAnswer: { type: SchemaType.STRING },
                  explanation: { type: SchemaType.STRING },
                  topic: {
                    type: SchemaType.STRING,
                    description: "Specific technical topic (e.g., 'React Hooks', 'CSS Grid')"
                  }
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
        text: `You are a professional instructor. Analyze the video and generate high-quality learning content in **ENGLISH**:

        1. **Summary:** 2-3 sentences summarizing the video content.

        2. **Lesson Notes:**
           - **Key Concepts:** Extract 3-5 most important terms. For each term, provide a short definition (1 sentence).
           - **Main Points:** Summarize 3-5 core ideas, steps, or logic flows.
           - **Practical Tips:** Provide 1-2 practical pieces of advice, common pitfalls, or real-world applications.

        3. **Quizzes:** Create 5 multiple-choice questions. 
           - **IMPORTANT:** For each question, identify a specific **"topic"** (2-3 words). Example: If asking about useState, the topic is "React State". This helps track student weaknesses.

        **OUTPUT MUST BE IN ENGLISH.**
        Return strictly JSON matching the schema.`
      }
    ]);

    console.log(`> [5/5] Done!`);
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

export const generateAssessmentService = async (userId, courseId) => {
    const [quizData, course] = await Promise.all([
        QuizProgress.findOne({ userId, courseId }),
        Course.findById(courseId).select("title curriculum")
    ]);

    if (!quizData || !course) {
        throw new Error("Required data for assessment not found.");
    }

    const allLecturesInCourse = course.curriculum.flatMap(section => section.lectures);

    let totalScore = 0, totalMax = 0;
    const topicMistakes = {}; 
    const passedLectureIds = [];

    quizData.quizzes.forEach(q => {
        totalScore += q.score;
        totalMax += q.totalQuestions;

        if (q.score === q.totalQuestions && q.totalQuestions > 0) {
            passedLectureIds.push(q.lectureId.toString());
        }

        q.wrongAnswers.forEach(w => {
            const topic = w.topic || "General Concepts";
            topicMistakes[topic] = (topicMistakes[topic] || 0) + 1;
        });
    });

    const strongPointsList = allLecturesInCourse
        .filter(lec => passedLectureIds.includes(lec._id.toString()))
        .map(lec => lec.title);

    const avgScore = totalMax === 0 ? 0 : Math.round((totalScore / totalMax) * 100);
    
    const weakTopics = Object.entries(topicMistakes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([topicName]) => topicName);

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    summary: { type: SchemaType.STRING },
                    strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    recommendation: { type: SchemaType.STRING }
                },
                required: ["summary", "strengths", "weaknesses", "recommendation"]
            }
        }
    });

    const prompt = `
      Act as an expert AI Mentor. Evaluate the student's performance for the course: "${course.title}".
      
      **Student Data:**
      - Overall Course Score: ${avgScore}/100.
      - Mastered Lessons (100% correct): ${strongPointsList.length > 0 ? strongPointsList.join(", ") : "Showing consistent effort"}.
      - Weak Areas (Concepts missed): ${weakTopics.length > 0 ? weakTopics.join(", ") : "No major weaknesses detected"}.
      
      **Requirements for your response:**
      1. **Summary:** 2-3 encouraging sentences about their journey in "${course.title}".
      2. **Strengths:** Identify 2 strengths. Use the Mastered Lessons list as concrete evidence.
      3. **Weaknesses:** Identify 2 areas to review based on the Weak Areas.
      4. **Recommendation:** 1-2 actionable tips to improve or move to advanced topics.

      **OUTPUT MUST BE IN ENGLISH. RETURN JSON ONLY.**
    `;

    const result = await model.generateContent(prompt);
    const aiData = JSON.parse(result.response.text());

    const courseProgress = await CourseProgress.findOne({ userId, courseId });
    if (!courseProgress) throw new Error("Course progress record not found.");

    courseProgress.isCompleted = true;
    courseProgress.aiAssessment = { 
        ...aiData, 
        overallScore: avgScore, 
        generatedAt: new Date() 
    };
    
    await courseProgress.save();
    return courseProgress.aiAssessment;
};