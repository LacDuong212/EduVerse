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

export const processVideoWithGemini = async (videoId, videoDuration = null) => {
  let tempFilePath = null;
  let uploadResult = null;

  try {
    const video = await DraftVideo.findOne({ videoId }).lean();
    if (!video) throw new AppError("Video not found.", 404);

    // S3 Download
    logger.debug(`> [1/5] Downloading video from S3... (VideoId: ${videoId})`);
    tempFilePath = await downloadS3Video(video.key);

    // Upload to Gemini
    logger.debug(`> [2/5] Uploading video to Google Gemini...`);
    uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: video.contentType,
      displayName: "Lecture Video",
    });

    // Wait for Processing
    logger.debug(`> [3/5] Waiting for Gemini processing (File URI: ${uploadResult.file.uri})...`);
    await waitForGeminiFile(uploadResult.file.name);

    // Generate Content
    logger.debug(`> [4/5] Requesting AI Generation...`);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: buildContentSchema(videoDuration)
      }
    });

    const result = await model.generateContent([
      { fileData: { mimeType: uploadResult.file.mimeType, fileUri: uploadResult.file.uri } },
      { text: buildLecturePrompt(videoDuration) }
    ]);

    // Finalize
    const aiResponse = JSON.parse(result.response.text());
    await fileManager.deleteFile(uploadResult.file.name);

    if (Array.isArray(aiResponse.quizzes)) {
      const quizCount = getQuizCount(videoDuration);

      // Sort by timestamp so any trimming keeps a spread across the video.
      let quizzes = [...aiResponse.quizzes].sort(
        (a, b) => (a.timestamp ?? Infinity) - (b.timestamp ?? Infinity)
      );

      // Hard-cap the number of quizzes. Gemini often over-produces for long
      // videos regardless of the "exactly N" instruction, and the schema has no
      // size limit — so enforce it here. Selection only DROPS whole questions; it
      // never moves a timestamp, so each kept question stays exactly where its
      // own concept was explained.
      if (quizzes.length > quizCount) {
        const first = quizzes[0]?.timestamp;
        const last = quizzes[quizzes.length - 1]?.timestamp;

        if (Number.isFinite(first) && Number.isFinite(last) && last > first) {
          // For each evenly-spaced TARGET TIME across the video, keep the
          // question whose timestamp is nearest — so coverage is spread by real
          // time, not just by list position.
          const used = new Set();
          const picked = [];
          for (let i = 0; i < quizCount; i++) {
            const target = first + (i * (last - first)) / (quizCount - 1);
            let bestIdx = -1;
            let bestDist = Infinity;
            for (let j = 0; j < quizzes.length; j++) {
              const ts = quizzes[j].timestamp;
              if (used.has(j) || !Number.isFinite(ts)) continue;
              const dist = Math.abs(ts - target);
              if (dist < bestDist) { bestDist = dist; bestIdx = j; }
            }
            if (bestIdx !== -1) { used.add(bestIdx); picked.push(quizzes[bestIdx]); }
          }
          quizzes = picked.sort((a, b) => a.timestamp - b.timestamp);
        } else {
          // Timestamps unavailable/degenerate — fall back to spreading by position.
          const picked = [];
          for (let i = 0; i < quizCount; i++) {
            picked.push(quizzes[Math.round((i * (quizzes.length - 1)) / (quizCount - 1))]);
          }
          quizzes = [...new Set(picked)];
        }
      }

      // Normalize timestamps only when the duration is known: clamp into range,
      // then keep markers from overlapping by nudging FORWARD only. The nudge is
      // bounded — a quiz is never delayed more than MAX_DELAY seconds past where
      // its concept was explained, so content placement stays the priority (the
      // user accepts up to ~45s of slack). If full separation would exceed that
      // budget, we stop — content wins over spacing.
      if (videoDuration > 0) {
        const minTs = 10;
        const maxTs = Math.max(minTs, Math.round(videoDuration) - 10);
        const minGap = Math.max(10, Math.round(videoDuration * 0.05));
        const MAX_DELAY = 45;

        quizzes = quizzes.map((quiz) => ({
          ...quiz,
          timestamp: quiz.timestamp != null
            ? Math.min(maxTs, Math.max(minTs, Math.round(quiz.timestamp)))
            : null,
        }));

        let prevTs = null;
        for (const quiz of quizzes) {
          if (quiz.timestamp == null) continue;
          const original = quiz.timestamp;
          let ts = original;
          if (prevTs != null && ts < prevTs + minGap) {
            ts = Math.min(original + MAX_DELAY, prevTs + minGap, maxTs);
          }
          quiz.timestamp = Math.max(minTs, ts);
          prevTs = quiz.timestamp;
        }
      }

      aiResponse.quizzes = quizzes;
    }

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

// Scale the number of quizzes to the video length (~1 per 2 minutes, capped 2-5),
// so short clips aren't crammed and long ones aren't overloaded. Shared by the
// prompt and the post-processing cap so both agree on the target count.
const getQuizCount = (videoDuration = null) =>
  videoDuration > 0 ? Math.min(5, Math.max(2, Math.round(videoDuration / 120))) : 5;

const buildLecturePrompt = (videoDuration = null) => {
  const quizCount = getQuizCount(videoDuration);

  // Soft spacing hint (~5% of the video): used only to guide WHICH concepts to
  // pick, never to move a timestamp away from its concept. Content placement wins.
  const minGap = videoDuration > 0 ? Math.max(10, Math.round(videoDuration * 0.05)) : null;

  const durationNote = videoDuration
    ? `The video is ${Math.round(videoDuration)} seconds long; every timestamp MUST be an integer between 10 and ${Math.max(10, Math.round(videoDuration) - 10)}.`
    : `Every timestamp MUST fall inside the video's actual length and be at least 10 seconds.`;

  const spacingNote = minGap
    ? `so no two markers land closer than about ${minGap} seconds on the progress bar`
    : `so no two markers land too close on the progress bar`;

  return `
  You are a professional instructor. Watch the video and produce high-quality learning content.
  Base everything ONLY on what is actually taught in the video — do not invent facts that are not present.
  Write ALL output in ENGLISH, as plain text (no markdown, asterisks, or bullet characters inside any field value).

    1. **Summary:** 2-3 sentences capturing the main content of the video.

    2. **Lesson Notes:**
      - **Key Concepts:** the 3-5 most important terms; each with a one-sentence, self-contained definition.
      - **Main Points:** 3-5 core ideas, steps, or logic flows, in the order they appear.
      - **Practical Tips:** 1-2 pieces of practical advice, common pitfalls, or real-world applications.

    3. **Quizzes:** exactly ${quizCount} multiple-choice questions that check understanding of what was explained. For each:
      - "question": one clear question about a concept actually covered in the video.
      - "options": EXACTLY 4 distinct, plausible answer choices as plain strings (no duplicates, no "All/None of the above"). Vary which position holds the correct answer across the ${quizCount} questions.
      - "correctAnswer": MUST be an EXACT, character-for-character copy of one of the 4 options — identical text, casing and punctuation, with NO prefix such as "A)". The app matches it against the options by exact string, so any difference makes the question ungradable.
      - "explanation": 1-2 sentences on why the correct answer is right.
      - "topic": a specific 2-3 word topic. Example: "React Hooks", "CSS Flexbox".
      - "timestamp": integer seconds, the moment right AFTER the relevant concept finishes being explained (the video pauses there to ask the student).
      Timestamp rules: place each timestamp AFTER the concept it tests finishes being explained. It does NOT need to be exact — a delay of up to ~45 seconds after the concept is perfectly fine. Use that leeway (and prefer well-separated concepts) ${spacingNote}. Never place a timestamp before or during the concept. List them in increasing time order. ${durationNote}

  **OUTPUT MUST BE IN ENGLISH. RETURN STRICTLY JSON MATCHING THE SCHEMA.**
  `;
};

// Build schema dynamically so timestamp min/max are enforced by Gemini's structured output
const buildContentSchema = (videoDuration = null) => {
  const maxTs = videoDuration > 0 ? Math.max(10, Math.round(videoDuration) - 10) : undefined;

  const timestampSchema = {
    type: SchemaType.INTEGER,
    description: "Second in the video right after the concept is explained — where the quiz will appear",
    ...(maxTs != null ? { minimum: 10, maximum: maxTs } : {}),
  };

  return {
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
          required: ["question", "options", "correctAnswer", "explanation", "topic", "timestamp"],
          properties: {
            question: { type: SchemaType.STRING },
            options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            correctAnswer: { type: SchemaType.STRING },
            explanation: { type: SchemaType.STRING },
            topic: {
              type: SchemaType.STRING,
              description: "Specific technical topic (e.g., 'React Hooks', 'CSS Grid')"
            },
            timestamp: timestampSchema
          }
        }
      }
    },
    required: ["summary", "lessonNotes", "quizzes"]
  };
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