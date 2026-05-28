import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import AppError from "#exceptions/app.error.js";
import Curriculum from "#modules/course/curriculum.model.js"
import CourseProgress from "#modules/learning/course-progress.model.js";
import QuizProgress from "#modules/quiz/quiz-progress.model.js";
import DraftVideo from "#modules/video/draft-video.model.js";
import { getObject } from "#services/s3.service.js";
import logger from "#utils/logger.js";
import { withTransaction } from "#utils/transaction.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

export const processVideoWithGemini = async (videoId) => {
  let tempFilePath = null;
  let uploadResult = null;

  try {
    const video = await DraftVideo.findOne({ videoId }).lean();
    if (!video) throw new AppError("Video not found.", 404);

    // [1/5] S3 Download
    logger.debug(`> [1/5] Downloading video from S3... (VideoId: ${videoId})`);
    tempFilePath = await downloadS3Video(video.key);

    // [2/5] Upload to Gemini
    logger.debug(`> [2/5] Uploading video to Google Gemini...`);
    uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: video.contentType,
      displayName: "Lecture Video",
    });

    // [3/5] Wait for Processing
    logger.debug(`> [3/5] Waiting for Gemini processing (File URI: ${uploadResult.file.uri})...`);
    await waitForGeminiFile(uploadResult.file.name);

    // [4/5] Generate Content
    logger.debug(`> [4/5] Requesting AI Generation...`);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: LECTURE_CONTENT_SCHEMA
      }
    });

    const result = await model.generateContent([
      { fileData: { mimeType: uploadResult.file.mimeType, fileUri: uploadResult.file.uri } },
      { text: LECTURE_PROMPT }
    ]);

    // [5/5] Finalize
    const aiResponse = JSON.parse(result.response.text());
    await fileManager.deleteFile(uploadResult.file.name);

    logger.debug(`> [5/5] Video analysis complete.`);
    return aiResponse;

  } catch (error) {
    throw new AppError(
      "Error while processing video. Please try again later.",
      500,
      null,
      { cause: error }
    );
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};

const downloadS3Video = async (videoKey) => {
  try {
    const s3Stream = await getObject(videoKey);
    const tempFileName = `temp-${Date.now()}-${path.basename(videoKey)}`;
    const tempFilePath = path.resolve(tempFileName);

    await pipeline(s3Stream, fs.createWriteStream(tempFilePath));
    return tempFilePath;
  } catch (error) {
    throw new AppError(
      "Unable to fetch video for processing. Please try again later.",
      500,
      null,
      { cause: error }
    );
  }
};

const waitForGeminiFile = async (fileName) => {
  let file = await fileManager.getFile(fileName);
  while (file.state === "PROCESSING") {
    // process.stdout.write(".");
    await new Promise((res) => setTimeout(res, 5000));
    file = await fileManager.getFile(fileName);
  }
  // logger.debug(">> Video is ready!");

  if (file.state === "FAILED") {
    const apiError = file.error;

    logger.error(`>> [2.5/5] Gemini processing failed for ${fileName}.`, {
      code: apiError?.code,
      message: apiError?.message
    });

    const userMessage = apiError?.message
      ? `Gemini processing failed: ${apiError.message}`
      : "Failed to process this video. Please try again later.";

    throw new AppError(userMessage, 500);
  }
};

const LECTURE_PROMPT = `
  You are a professional instructor. Analyze the video and generate high-quality learning content in **ENGLISH**:
    1. **Summary:** 2-3 sentences summarizing the video content.

    2. **Lesson Notes:**
      - **Key Concepts:** Extract 3-5 most important terms. For each term, provide a short definition (1 sentence).
      - **Main Points:** Summarize 3-5 core ideas, steps, or logic flows.
      - **Practical Tips:** Provide 1-2 practical pieces of advice, common pitfalls, or real-world applications.

    3. **Quizzes:** Create 5 multiple-choice questions. 
      - **IMPORTANT:** For each question, identify a specific **"topic"** (2-3 words). Example: If asking about useState, the topic is "React State". This helps track student weaknesses.

  **OUTPUT MUST BE IN ENGLISH. RETURN STRICTLY JSON MATCHING THE SCHEMA.**
`;

const LECTURE_CONTENT_SCHEMA = {
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
};

export const generateAssessmentService = async (userId, courseId) => {
  const [quizData, curriculum] = await Promise.all([
    QuizProgress.findOne({ user: userId, course: courseId }).lean(),
    Curriculum.findOne({ courseId }).select("sections").populate("courseId", "title").lean()
  ]);

  if (!quizData || !curriculum) throw new AppError("No learning progress found in course for assessment.", 400);

  const { avgScore, strongPoints, weakTopics } = analyzeStudentData(quizData, curriculum);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: ASSESSMENT_SCHEMA
    }
  });

  const prompt = buildAssessmentPrompt(curriculum.courseId?.title, avgScore, strongPoints, weakTopics);
  const result = await model.generateContent(prompt);
  const aiResponse = JSON.parse(result.response.text());

  return await withTransaction(async (s) => {
    const courseProgress = await CourseProgress.findOne({ user: userId, course: courseId }).session(s);
    if (!courseProgress) throw new AppError("Unable to find your course's progress.", 404);

    courseProgress.isCompleted = true;
    courseProgress.aiAssessment = {
      ...aiResponse,
      overallScore: avgScore,
      generatedAt: new Date()
    };

    await courseProgress.save({ session: s });
    return courseProgress.aiAssessment;
  });
};

const analyzeStudentData = (quizData, curriculum) => {
  let totalScore = 0, totalMax = 0;
  const topicMistakes = {};
  const passedLecIds = [];

  quizData.quizzes.forEach(q => {
    totalScore += q.score;
    totalMax += q.totalQuestions;

    if (q.score === q.totalQuestions && q.totalQuestions > 0)
      passedLecIds.push(q.lectureId.toString());

    q.wrongAnswers.forEach(w => {
      const topic = w.topic || "General Concepts";
      topicMistakes[topic] = (topicMistakes[topic] || 0) + 1;
    });
  });

  const avgScore = totalMax === 0 ? 0 : Math.round((totalScore / totalMax) * 100);

  const lectures = (curriculum.sections || []).flatMap(s => s.lectures);
  const strongPoints = lectures.filter(l => passedLecIds.includes(l._id.toString())).map(l => l.title);

  const weakTopics = Object.entries(topicMistakes).sort(([, a], [, b]) => b - a).slice(0, 3).map(([n]) => n);

  return { avgScore, strongPoints, weakTopics };
};

const ASSESSMENT_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING },
    strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    recommendation: { type: SchemaType.STRING }
  },
  required: ["summary", "strengths", "weaknesses", "recommendation"]
};

const buildAssessmentPrompt = (title, avgScore, strongPoints, weakTopics) => `
  Act as an expert AI Mentor. Evaluate the student's performance for the course: "${title}".
  
  **Student Data:**
    - Overall Course Score: ${avgScore}/100.
    - Mastered Lessons (100% correct): ${strongPoints.length > 0 ? strongPoints.join(", ") : "Showing consistent effort"}.
    - Weak Areas (Concepts missed): ${weakTopics.length > 0 ? weakTopics.join(", ") : "No major weaknesses detected"}.

  **Requirements for your response:**
    1. **Summary:** 2-3 encouraging sentences about their journey in "${title}".
    2. **Strengths:** Identify 2 strengths. Use the Mastered Lessons list as concrete evidence.
    3. **Weaknesses:** Identify 2 areas to review based on the Weak Areas.
    4. **Recommendation:** 1-2 actionable tips to improve or move to advanced topics.

  **OUTPUT MUST BE IN ENGLISH. RETURN JSON ONLY.**
`;