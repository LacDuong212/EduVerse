/**
 * Seed realistic student/instructor ACTIVITY into the DB.
 * ---------------------------------------------------------------------------
 * Generates data that looks like real people used the platform:
 *   - New synthetic students (+ existing real students, "both" scope)
 *   - Enrollments (new students only)
 *   - CourseProgress (partial / completed + certificate)
 *   - Streak / activityLog (daily learning days)
 *   - Q&A (student questions + instructor replies, some resolved)
 *   - Notes (timestamped lecture notes)
 *   - Reviews (rating + text) -> updates course.rating + instructor stats
 * Also updates counters: Course.studentsEnrolled, Course.rating,
 * Instructor.stats.{totalStudents,totalReviews,ratingSum}, Student.stats.
 *
 * SAFETY:
 *   - Every created document is stamped `_synthetic: true`.
 *   - A manifest (created ids + exact counter deltas) is written to disk so
 *     `--cleanup` reverses everything precisely (deletes docs + un-increments).
 *
 * Usage (from backend/ directory):
 *   node scripts/seed-activity.js --dry-run     # preview, writes nothing
 *   node scripts/seed-activity.js               # seed
 *   node scripts/seed-activity.js --cleanup     # remove all synthetic data + revert counters
 *   node scripts/seed-activity.js --new-only    # skip existing real students
 *   node scripts/seed-activity.js --fill-existing         # enroll + add activity for REAL students with 0 enrollment
 *   node scripts/seed-activity.js --fill-existing --only=vi  # ...only those matching a name/email substring
 *   node scripts/seed-activity.js --humanize    # rewrite demo emails -> real-looking + set random non-human avatars
 *
 * Options:
 *   --students=30   number of NEW synthetic students (default 30)
 *   --force         seed even if synthetic data already exists
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "#config/database.js";
import User from "#modules/user/user.model.js";
import Student from "#modules/student/student.model.js";
import Instructor from "#modules/instructor/instructor.model.js";
import Course, { STATUS_ENUM as COURSE_STATUS } from "#modules/course/course.model.js";
import Curriculum from "#modules/course/curriculum.model.js";
import Enrollment, { STATUS_ENUM as ENROLL_STATUS } from "#modules/enrollment/enrollment.model.js";
import CourseProgress, { LECTURE_STATUS_ENUM as LEC } from "#modules/learning/course-progress.model.js";
import Order, { STATUS_ENUM as ORDER_STATUS, PAYMENT_METHOD_ENUM } from "#modules/order/order.model.js";
import QuizProgress from "#modules/quiz/quiz-progress.model.js";
import QnA from "#modules/qa/qa.model.js";
import Note from "#modules/note/note.model.js";
import Streak from "#modules/streak/streak.model.js";
import Review from "#modules/review/review.model.js";
import { generateCertId } from "#modules/certificate/certificate.util.js";

// ─────────────────────────────────────────────────────────────────────────
// CLI args
// ─────────────────────────────────────────────────────────────────────────
const ARGV = process.argv.slice(2);
const DRY_RUN = ARGV.includes("--dry-run");
const CLEANUP = ARGV.includes("--cleanup");
const FILL_EXISTING = ARGV.includes("--fill-existing");
const HUMANIZE = ARGV.includes("--humanize");
const NEW_ONLY = ARGV.includes("--new-only");
const FORCE = ARGV.includes("--force");
const N_NEW = Number((ARGV.find((a) => a.startsWith("--students=")) || "").split("=")[1]) || 150;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.join(__dirname, "seed-activity.manifest.json");

// ─────────────────────────────────────────────────────────────────────────
// Deterministic PRNG (so dry-run matches the real run)
// ─────────────────────────────────────────────────────────────────────────
let _seed = 1337 >>> 0;
function rnd() {
  _seed |= 0; _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const rint = (min, max) => Math.floor(rnd() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const chance = (p) => rnd() < p;
const sample = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rnd() * copy.length), 1)[0]);
  return out;
};
const daysAgo = (d) => new Date(Date.now() - d * 86400000);
const nameParts = (name) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().split(/\s+/).filter(Boolean);

// Realistic-looking personal email from a Vietnamese full name (no "seed"/demo marker).
function genRealEmail(name) {
  const parts = nameParts(name);
  const first = parts[0] || "user";
  const last = parts[parts.length - 1] || "vn";
  const mid = parts.slice(1, -1);
  const initials = (first[0] || "") + mid.map((m) => m[0]).join("");
  const patterns = [
    `${last}${first}`, `${last}.${first}`, parts.join(""),
    `${first}${last}`, `${last}${initials}`, `${last}_${first}`, `${first}.${last}`,
  ];
  const base = pick(patterns);
  const num = chance(0.75) ? String(rint(1, 9999)) : "";
  const domain = pick(["gmail.com", "gmail.com", "gmail.com", "gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]);
  return `${base}${num}@${domain}`;
}
// Non-human avatars (abstract / letters / robots — no face photos). ~1/3 of users
// get NO avatar so the dataset looks organic rather than uniformly filled.
const AV_STYLES = ["initials", "shapes", "identicon", "bottts", "thumbs", "rings", "fun-emoji", "icons", "glass"];
function randomAvatar(id, name = "") {
  if (chance(0.35)) return ""; // no custom avatar
  const style = pick(AV_STYLES);
  const seed = style === "initials" ? (name || String(id)) : String(id);
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
const ymd = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
// Weighted pick: entries are [value, weight].
const weightedPick = (entries) => {
  const total = entries.reduce((s, e) => s + e[1], 0);
  let r = rnd() * total;
  for (const [v, w] of entries) { if ((r -= w) <= 0) return v; }
  return entries[entries.length - 1][0];
};

// ─────────────────────────────────────────────────────────────────────────
// Engagement archetypes — drive strong between-record variance so the dataset
// is heterogeneous (a few power users, many casual, some dormant) instead of
// every student looking the same.
// ─────────────────────────────────────────────────────────────────────────
const LEVELS = [
  { key: "dormant", weight: 0.18, courses: [1, 2],  ratios: [0, 0, 0.05, 0.1],            noteMax: 1,  qnaP: 0.08, replyP: 0.4, reviewBaseP: 0.05 },
  { key: "casual",  weight: 0.37, courses: [2, 4],  ratios: [0.1, 0.2, 0.35, 0.5, 0.6],   noteMax: 3,  qnaP: 0.3,  replyP: 0.55, reviewBaseP: 0.35 },
  { key: "active",  weight: 0.30, courses: [3, 7],  ratios: [0.3, 0.5, 0.7, 0.85, 1, 1],  noteMax: 7,  qnaP: 0.55, replyP: 0.7,  reviewBaseP: 0.65 },
  { key: "power",   weight: 0.15, courses: [6, 12], ratios: [0.5, 0.75, 1, 1, 1],          noteMax: 12, qnaP: 0.72, replyP: 0.8,  reviewBaseP: 0.85 },
];
const pickLevel = () => weightedPick(LEVELS.map((l) => [l, l.weight]));

// Course ratings skew high; never below 3 (limit low reviews).
const pickRating = (isCompleted) =>
  isCompleted ? weightedPick([[5, 0.55], [4, 0.37], [3, 0.08]])
              : weightedPick([[5, 0.4], [4, 0.45], [3, 0.15]]);

// Registration age (days ago) with a growth ramp: more recent sign-ups, but a
// real tail going back ~10 months so history isn't clustered on "today".
const registrationDaysAgo = () => weightedPick([
  [rint(1, 30), 0.26], [rint(31, 90), 0.30], [rint(91, 150), 0.20],
  [rint(151, 210), 0.14], [rint(211, 300), 0.10],
]);

const QUIZ_TOPICS = ["Cú pháp cơ bản", "Khái niệm cốt lõi", "Best practices", "Xử lý lỗi", "Tối ưu hiệu năng", "Bảo mật", "Kiến trúc", "Debug", "Testing", "Triển khai"];
const QUIZ_WRONG_Q = [
  "Đâu là cách làm đúng trong trường hợp này?",
  "Kết quả của đoạn code sau là gì?",
  "Phương án nào tối ưu nhất?",
  "Khái niệm này được định nghĩa như thế nào?",
  "Lỗi thường gặp ở bước này là gì?",
];

// Build a realistic AI assessment (same shape the /assessment endpoint stores).
function buildAiAssessment(course, avgScorePct, completedAt) {
  const tags = (course.tags || []).filter(Boolean);
  const topicPool = tags.length ? tags : ["chủ đề chính của khóa học"];
  const strengths = sample([...topicPool, ...QUIZ_TOPICS], Math.min(3, Math.max(1, Math.round(avgScorePct / 33))))
    .map((t) => `Nắm vững ${t}`);
  const weaknesses = avgScorePct >= 90 ? [] : sample(QUIZ_TOPICS, rint(1, 2)).map((t) => `Cần ôn thêm về ${t}`);
  const level = avgScorePct >= 85 ? "xuất sắc" : avgScorePct >= 70 ? "tốt" : "khá";
  return {
    generatedAt: completedAt,
    overallScore: avgScorePct,
    summary: `Học viên đã hoàn thành khóa "${course.title}" với kết quả ${level} (điểm trung bình ${avgScorePct}%). Thể hiện sự tiến bộ rõ rệt qua các bài học và bài quiz.`,
    strengths,
    weaknesses,
    recommendation: avgScorePct >= 85
      ? "Bạn đã sẵn sàng cho các khóa nâng cao cùng chủ đề. Hãy thử áp dụng vào một dự án thực tế."
      : "Nên ôn lại các phần còn yếu và làm lại quiz để củng cố kiến thức trước khi học tiếp.",
  };
}

// Course price a student actually pays (0 for free courses).
const pricePaidOf = (course) => {
  const base = course.enableDiscount && course.discountPrice != null ? course.discountPrice : course.price;
  return Number(base) > 0 ? Number(base) : 0;
};

// ─────────────────────────────────────────────────────────────────────────
// Content pools
// ─────────────────────────────────────────────────────────────────────────
const FIRST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô", "Dương", "Lý", "Phan", "Võ", "Đinh"];
const MID = ["Minh", "Thị", "Văn", "Hoàng", "Thu", "Quốc", "Anh", "Đức", "Hải", "Ngọc", "Gia", "Khánh", "Bảo", "Thanh"];
const LAST = ["Anh", "Hùng", "Hương", "Nam", "Mai", "Khoa", "Tùng", "Vinh", "Lan", "Tuấn", "Ngọc", "Hải", "Thu", "Phong", "Đạt", "Hạnh", "Ánh", "Bảo", "Diễm", "Kiệt", "Quân", "Ngân", "Thành", "Long", "Giang", "Hiền", "Dung", "Cường", "Bích"];

const QUESTIONS = [
  "Ở phần này em chưa hiểu rõ đoạn giảng viên demo, thầy/cô giải thích thêm được không ạ?",
  "Cho em hỏi phần này áp dụng vào dự án thực tế như thế nào ạ?",
  "Em làm theo hướng dẫn nhưng bị lỗi, có ai gặp trường hợp tương tự không?",
  "Sự khác nhau giữa hai cách làm ở bài này là gì vậy ạ?",
  "Phần này có tài liệu tham khảo thêm không thầy/cô?",
  "Em nghĩ nên tối ưu đoạn này lại, mọi người thấy sao?",
  "Tại sao ở đây lại dùng cách này thay vì cách kia ạ?",
  "Bài giảng rất hay, nhưng em muốn hiểu sâu hơn về khái niệm ở đầu bài.",
  "Có cách nào làm phần này gọn hơn không mọi người?",
  "Em bị stuck ở bước cấu hình, mong được hỗ trợ ạ.",
];
const INS_REPLIES = [
  "Cảm ơn câu hỏi của em. Phần này em nên xem lại đoạn đầu video để nắm khái niệm gốc trước nhé.",
  "Đúng rồi, cả hai cách đều được nhưng cách trong bài tối ưu hơn về hiệu năng. Em thử benchmark thử xem.",
  "Lỗi này thường do thiếu cấu hình môi trường. Em kiểm tra lại biến môi trường và version nhé.",
  "Thầy sẽ bổ sung thêm tài liệu tham khảo ở phần mô tả bài học. Em theo dõi nhé.",
  "Câu hỏi rất hay! Em có thể áp dụng trực tiếp vào dự án cuối khóa, thầy có ví dụ ở section sau.",
  "Ý tưởng tối ưu của em hợp lý. Trong thực tế production mình sẽ cân nhắc thêm về khả năng maintain.",
];
const STU_REPLIES = [
  "Em cảm ơn thầy/cô, em đã hiểu rồi ạ!",
  "Mình cũng gặp lỗi này, làm theo cách trên thì fix được nhé.",
  "Cảm ơn mọi người, rất hữu ích.",
];
const NOTES = [
  "Điểm quan trọng cần nhớ ở đoạn này.",
  "Khái niệm cốt lõi — ôn lại trước khi làm bài tập.",
  "Ví dụ hay, có thể áp dụng vào dự án.",
  "Chỗ này giảng viên nhấn mạnh, dễ ra thi.",
  "Cần xem lại đoạn này lần nữa.",
  "Tip tối ưu hiệu năng ở phút này.",
  "Lưu ý cú pháp / cấu hình ở bước này.",
  "So sánh ưu nhược điểm của các cách làm.",
];
const NOTE_TAGS = ["quan-trọng", "ôn-tập", "ví-dụ", "khó", "tip", "review"];
const REVIEWS = {
  5: ["Khóa học rất chất lượng, giảng viên dạy dễ hiểu!", "Nội dung thực tế, áp dụng được ngay. Rất đáng tiền.", "Tuyệt vời, mình học được rất nhiều."],
  4: ["Khóa học tốt, nội dung ổn nhưng mong có thêm bài tập.", "Giảng hay, một vài phần hơi nhanh.", "Hài lòng với khóa học này."],
  3: ["Nội dung ổn nhưng còn hơi cơ bản với mình.", "Tạm ổn, cần cập nhật thêm một số phần."],
};

// ─────────────────────────────────────────────────────────────────────────
// Manifest helpers
// ─────────────────────────────────────────────────────────────────────────
const manifest = {
  createdAt: new Date().toISOString(),
  ids: { users: [], students: [], enrollments: [], courseprogresses: [], qnas: [], notes: [], streaks: [], reviews: [], orders: [], quizprogresses: [] },
  counters: { courses: {}, instructors: {}, students: {} }, // students = existing-student stat deltas only
};
function bumpCourse(courseId, field, delta) {
  const c = (manifest.counters.courses[courseId] ||= { studentsEnrolled: 0, ratingCount: 0, ratingTotal: 0, stars: {} });
  if (field === "enroll") c.studentsEnrolled += delta;
  else if (field.startsWith("star:")) { const s = field.split(":")[1]; c.ratingCount += 1; c.ratingTotal += delta; c.stars[s] = (c.stars[s] || 0) + 1; }
}
function bumpInstructor(userId, patch) {
  const i = (manifest.counters.instructors[userId] ||= { totalStudents: 0, totalReviews: 0, ratingSum: 0 });
  i.totalStudents += patch.totalStudents || 0;
  i.totalReviews += patch.totalReviews || 0;
  i.ratingSum += patch.ratingSum || 0;
}
function bumpExistingStudent(userId, patch) {
  const s = (manifest.counters.students[userId] ||= { totalCourses: 0, completedCourses: 0, totalLectures: 0, completedLectures: 0 });
  for (const k of Object.keys(patch)) s[k] += patch[k];
}

// ─────────────────────────────────────────────────────────────────────────
// Build a CourseProgress doc for (user, course) with a target completion ratio
// ─────────────────────────────────────────────────────────────────────────
function buildProgress(userId, course, lectures, ratio, enrolledAt, endAt = new Date()) {
  const total = lectures.length;
  const completed = Math.min(total, Math.floor(total * ratio));
  const isCompleted = completed >= total && total > 0;
  const lectureDocs = [];
  let timeSpent = 0;
  let lastLectureId = null;
  let lastActivityAt = enrolledAt;

  // Spread lecture activity evenly across [enrolledAt, endAt] so dates are
  // historical & never in the future. endAt defaults to now.
  const span = Math.max(0, endAt.getTime() - enrolledAt.getTime());
  const slots = completed + (!isCompleted && completed < total ? 1 : 0) + 1;
  const dateAt = (i) => new Date(enrolledAt.getTime() + Math.round(((i + 1) / slots) * span));

  for (let i = 0; i < completed; i++) {
    const lec = lectures[i];
    const dur = lec.duration || rint(180, 900);
    const at = dateAt(i);
    lastLectureId = lec._id;
    lastActivityAt = at;
    timeSpent += dur;
    lectureDocs.push({
      lectureId: lec._id, status: LEC.completed,
      lastPositionSec: dur, durationSec: dur, totalTimeSpentSec: dur,
      viewCount: rint(1, 3), completedAt: at, lastActivityAt: at,
    });
  }
  // one in-progress lecture if not fully done
  if (!isCompleted && completed < total) {
    const lec = lectures[completed];
    const dur = lec.duration || rint(180, 900);
    const pos = Math.floor(dur * (rnd() * 0.7 + 0.1));
    const at = dateAt(completed);
    lastLectureId = lec._id;
    lastActivityAt = at;
    timeSpent += pos;
    lectureDocs.push({
      lectureId: lec._id, status: LEC.in_progress,
      lastPositionSec: pos, durationSec: dur, totalTimeSpentSec: pos,
      viewCount: 1, lastActivityAt: at,
    });
  }

  const doc = {
    user: userId, course: course._id,
    totalLectures: total, completedLecturesCount: completed,
    totalTimeSpentSec: timeSpent,
    lastLectureId, lastPositionSec: lectureDocs.at(-1)?.lastPositionSec || 0,
    lectures: lectureDocs,
    firstStartedAt: enrolledAt, lastActivityAt,
    isCompleted,
  };
  if (isCompleted) { doc.certId = generateCertId(); doc.certIssuedAt = lastActivityAt; }
  return { doc, completed, isCompleted, activityDates: lectureDocs.map((l) => l.lastActivityAt || l.completedAt).filter(Boolean) };
}

// ─────────────────────────────────────────────────────────────────────────
async function loadCatalog() {
  const courses = await Course.find({ status: COURSE_STATUS.live, isDeleted: false })
    .select("_id title tags lecturesCount instructor price discountPrice enableDiscount").lean();
  const curriculums = await Curriculum.find({ courseId: { $in: courses.map((c) => c._id) } })
    .select("courseId sections").lean();
  const curByCourse = new Map();
  for (const cur of curriculums) {
    const lectures = [];
    for (const sec of cur.sections || []) for (const lec of sec.lectures || []) {
      lectures.push({ _id: lec._id, title: lec.title, duration: lec.duration || 0 });
    }
    curByCourse.set(String(cur.courseId), lectures);
  }
  // Only courses that have a real instructor + at least 1 lecture
  const usable = courses
    .filter((c) => c.instructor?.ref && (curByCourse.get(String(c._id)) || []).length > 0)
    .map((c) => ({ ...c, lectures: curByCourse.get(String(c._id)) }));
  return usable;
}

function planStudentCourses(catalog, level = LEVELS[1]) {
  // Number of courses is driven by the engagement level (adds variance).
  const n = Math.min(catalog.length, rint(level.courses[0], level.courses[1]));
  const withTags = catalog.filter((c) => (c.tags || []).length);
  let chosen;
  let interests = [];
  if (withTags.length && chance(0.8)) {
    const theme = pick(pick(withTags).tags);
    interests = [String(theme)];
    const themed = catalog.filter((c) => (c.tags || []).some((t) => t?.toLowerCase() === String(theme).toLowerCase()));
    const others = catalog.filter((c) => !themed.includes(c));
    chosen = sample(themed, Math.min(themed.length, n));
    if (chosen.length < n) chosen.push(...sample(others, Math.min(others.length, n - chosen.length)));
  } else {
    chosen = sample(catalog, Math.min(catalog.length, n));
  }
  // dedupe by course _id (avoid violating the unique {student,course} index)
  const seen = new Set();
  const unique = [];
  for (const c of chosen) { const k = String(c._id); if (!seen.has(k)) { seen.add(k); unique.push(c); } }
  return { courses: unique.slice(0, n), interests };
}

// Generate all activity for one student across their assigned courses.
// `createEnrollment` = true for new students (they need enrollment + full stats set),
// false for existing students (enrollment already exists; only add missing activity).
function genStudentActivity(userId, assignedCourses, { createEnrollment, level = LEVELS[1], joinedDaysAgo = 120 }, buckets, existingProgressCourseIds, existingReviewCourseIds) {
  const activeDatesSet = new Set();
  const stat = { totalCourses: 0, completedCourses: 0, totalLectures: 0, completedLectures: 0 };
  const newInstructorStudents = new Set(); // instructor userIds this student is newly enrolled with

  for (const course of assignedCourses) {
    // Enroll AFTER registration: pick a day between (join - a few) and now, so
    // enrollment/order timestamps are historically consistent with sign-up.
    const enrollDaysAgo = Math.max(1, rint(1, Math.max(2, joinedDaysAgo)));
    const enrolledAt = daysAgo(enrollDaysAgo);
    const insRef = String(course.instructor.ref);

    // completion ratio driven by engagement level (adds strong variance)
    const ratio = pick(level.ratios);
    const built = buildProgress(userId, course, course.lectures, ratio, enrolledAt);

    // ── AI assessment on completed courses + quiz results ──
    const touchedLecs = built.doc.lectures;
    let quizAvgPct = null;
    if (touchedLecs.length) {
      // quiz on a subset of completed lectures
      const completedLecs = touchedLecs.filter((l) => l.status === LEC.completed);
      const quizLecs = sample(completedLecs, Math.min(completedLecs.length, rint(0, Math.min(6, completedLecs.length))));
      if (quizLecs.length && !existingProgressCourseIds.has(`${userId}:${course._id}`)) {
        const quizzes = quizLecs.map((l) => {
          const totalQ = rint(3, 10);
          // score skews high, with variance
          const score = Math.min(totalQ, Math.max(1, Math.round(totalQ * (rnd() * 0.4 + 0.6))));
          const wrong = totalQ - score;
          return {
            lectureId: l.lectureId, score, totalQuestions: totalQ,
            wrongAnswers: Array.from({ length: wrong }, () => ({ question: pick(QUIZ_WRONG_Q), topic: pick(QUIZ_TOPICS) })),
          };
        });
        const totScore = quizzes.reduce((a, q) => a + q.score, 0);
        const totQ = quizzes.reduce((a, q) => a + q.totalQuestions, 0);
        quizAvgPct = totQ ? Math.round((totScore / totQ) * 100) : null;
        buckets.quizprogresses.push({
          user: userId, course: course._id, quizzes,
          createdAt: built.doc.firstStartedAt, updatedAt: built.doc.lastActivityAt,
        });
      }
    }

    // skip progress if it already exists (existing students)
    if (!existingProgressCourseIds.has(`${userId}:${course._id}`)) {
      if (built.isCompleted) {
        const scorePct = quizAvgPct ?? rint(70, 96);
        built.doc.aiAssessment = buildAiAssessment(course, scorePct, built.doc.lastActivityAt);
      }
      buckets.progress.push(built.doc);
      stat.totalCourses += 1;
      stat.totalLectures += course.lectures.length;
      stat.completedLectures += built.completed;
      if (built.isCompleted) stat.completedCourses += 1;
    }

    if (createEnrollment) {
      buckets.enrollments.push({
        student: userId, course: course._id, instructor: course.instructor.ref,
        status: built.isCompleted ? ENROLL_STATUS.completed : ENROLL_STATUS.active,
        enrolledAt, createdAt: enrolledAt, updatedAt: built.doc.lastActivityAt || enrolledAt,
      });
      bumpCourse(String(course._id), "enroll", 1);
      newInstructorStudents.add(insRef);

      // ── Order (drives revenue + monthly-enrollment dashboards) ──
      const paid = pricePaidOf(course);
      const status = weightedPick([[ORDER_STATUS.completed, 0.9], [ORDER_STATUS.refunded, 0.06], [ORDER_STATUS.cancelled, 0.04]]);
      buckets.orders.push({
        user: userId,
        courses: [{ course: course._id, pricePaid: paid }],
        subTotal: paid, discountAmount: 0, totalAmount: paid,
        paymentMethod: paid === 0 ? PAYMENT_METHOD_ENUM.free : pick([PAYMENT_METHOD_ENUM.momo, PAYMENT_METHOD_ENUM.vnpay]),
        status,
        expiresAt: new Date(enrolledAt.getTime() + 3600000),
        createdAt: enrolledAt, updatedAt: enrolledAt,
      });
    }

    built.activityDates.forEach((d) => activeDatesSet.add(ymd(d)));

    // ── Notes (on completed / in-progress lectures) ──
    const touched = built.doc.lectures;
    const nNotes = touched.length ? rint(0, Math.min(level.noteMax, touched.length)) : 0;
    for (let i = 0; i < nNotes; i++) {
      const lec = pick(touched);
      buckets.notes.push({
        userId, courseId: course._id, lectureId: String(lec.lectureId),
        timestamp: rint(5, Math.max(6, lec.durationSec || 300)),
        content: pick(NOTES), tags: chance(0.5) ? sample(NOTE_TAGS, rint(1, 2)) : [],
        createdAt: lec.lastActivityAt || enrolledAt, updatedAt: lec.lastActivityAt || enrolledAt,
      });
    }

    // ── Q&A: student question (+ maybe instructor reply, maybe resolved) ──
    if (touched.length && chance(level.qnaP)) {
      const lec = pick(touched);
      const qAt = lec.lastActivityAt || enrolledAt;
      const resolved = chance(0.35);
      const q = {
        _tmp: `q${buckets._qseq++}`,
        courseId: course._id, lectureId: chance(0.7) ? String(lec.lectureId) : null,
        author: userId, content: pick(QUESTIONS),
        parentId: null, isInstructorPost: false, isResolved: resolved,
        createdAt: qAt, updatedAt: qAt,
        _replies: [],
      };
      // instructor reply
      if (chance(level.replyP)) {
        const rAt = new Date(qAt.getTime() + rint(1, 48) * 3600000);
        q._replies.push({
          courseId: course._id, lectureId: q.lectureId,
          author: course.instructor.ref, content: pick(INS_REPLIES),
          isInstructorPost: true, isResolved: false,
          createdAt: rAt, updatedAt: rAt,
        });
        // occasional student follow-up
        if (chance(0.3)) {
          const r2 = new Date(rAt.getTime() + rint(1, 24) * 3600000);
          q._replies.push({
            courseId: course._id, lectureId: q.lectureId,
            author: userId, content: pick(STU_REPLIES),
            isInstructorPost: false, isResolved: false,
            createdAt: r2, updatedAt: r2,
          });
        }
      }
      buckets.qaQuestions.push(q);
    }

    // ── Review: driven by engagement level; completed courses very likely ──
    const wantsReview = (built.isCompleted ? chance(level.reviewBaseP + 0.1) : (ratio >= 0.5 && chance(level.reviewBaseP * 0.6)));
    if (wantsReview && !existingReviewCourseIds.has(`${userId}:${course._id}`)) {
      const rating = pickRating(built.isCompleted); // 4-5 heavy, 3 rare, never < 3
      const at = built.doc.lastActivityAt || enrolledAt;
      buckets.reviews.push({
        course: course._id, user: userId, rating,
        description: pick(REVIEWS[rating]), isDeleted: false,
        createdAt: at, updatedAt: at,
      });
      existingReviewCourseIds.add(`${userId}:${course._id}`);
      bumpCourse(String(course._id), `star:${rating}`, rating);
      bumpInstructor(insRef, { totalReviews: 1, ratingSum: rating });
    }
  }

  // instructor totalStudents for newly-enrolled unique students
  for (const insRef of newInstructorStudents) bumpInstructor(insRef, { totalStudents: 1 });

  // ── Streak from active learning days ──
  const dates = [...activeDatesSet].sort();
  if (dates.length) {
    let cur = 1, longest = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]); prev.setDate(prev.getDate() + 1);
      if (ymd(prev) === dates[i]) cur += 1; else cur = 1;
      longest = Math.max(longest, cur);
    }
    const activityLog = {};
    for (const d of dates) activityLog[d] = rint(1, 4);
    buckets.streaks.push({
      user: userId, currentStreak: cur, longestStreak: longest,
      lastActiveDate: dates.at(-1), activeDates: dates, activityLog,
      _hasExistingStreak: false, // flag replaced later
    });
  }

  return stat;
}

// ─────────────────────────────────────────────────────────────────────────
async function stamp(model, ids) {
  if (!ids.length || DRY_RUN) return;
  await model.collection.updateMany({ _id: { $in: ids } }, { $set: { _synthetic: true } });
}

async function seed() {
  const catalog = await loadCatalog();
  if (!catalog.length) throw new Error("No usable live courses with curriculum + instructor found.");

  const existingSynthetic = await User.collection.countDocuments({ _synthetic: true });
  if (existingSynthetic > 0 && !FORCE && !DRY_RUN) {
    throw new Error(`Found ${existingSynthetic} existing synthetic users. Run --cleanup first, or pass --force.`);
  }

  const buckets = {
    users: [], students: [], enrollments: [], progress: [],
    notes: [], qaQuestions: [], reviews: [], streaks: [], orders: [], quizprogresses: [],
    _qseq: 0,
  };
  const studentStatSets = []; // { userId, stat, isNew }

  // Track existing progress/reviews so we don't duplicate for existing students
  const existingProgress = new Set();
  const existingReviews = new Set();
  const existingStreakUsers = new Set();

  // ── NEW synthetic students ──
  const usedEmails = new Set(
    (await User.find({}).select("email").lean()).map((u) => u.email?.toLowerCase()).filter(Boolean)
  );
  for (let i = 0; i < N_NEW; i++) {
    const name = `${pick(FIRST)} ${pick(MID)} ${pick(LAST)}`;
    let email = genRealEmail(name);
    while (usedEmails.has(email.toLowerCase())) email = genRealEmail(name);
    usedEmails.add(email.toLowerCase());

    const userId = new mongoose.Types.ObjectId();
    const joinedDaysAgo = registrationDaysAgo();
    const createdAt = daysAgo(joinedDaysAgo);
    const level = pickLevel();
    const { courses, interests } = planStudentCourses(catalog, level);

    buckets.users.push({
      _id: userId, name, email,
      password: bcrypt.hashSync("Abc@12345", 10),
      bio: "", website: "",
      socials: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      pfpImg: randomAvatar(userId, name), verifyOtp: "", verifyOtpExpireAt: 0,
      isVerified: true, isActivated: true, role: "student",
      createdAt, updatedAt: new Date(),
    });

    const stat = genStudentActivity(userId, courses, { createEnrollment: true, level, joinedDaysAgo }, buckets, existingProgress, existingReviews);
    buckets.students.push({
      _id: new mongoose.Types.ObjectId(), user: userId, interests,
      stats: stat, createdAt, updatedAt: new Date(),
    });
    studentStatSets.push({ userId, stat, isNew: true });
  }

  // ── EXISTING real students (both scope) ──
  let existingHandled = 0;
  if (!NEW_ONLY) {
    const realStudentUsers = await User.find({
      role: "student", _synthetic: { $ne: true },
    }).select("_id").lean();

    for (const u of realStudentUsers) {
      const uid = u._id;
      const enrollments = await Enrollment.find({ student: uid, status: ENROLL_STATUS.active })
        .select("course").lean();
      if (!enrollments.length) continue;

      const catById = new Map(catalog.map((c) => [String(c._id), c]));
      const courses = enrollments.map((e) => catById.get(String(e.course))).filter(Boolean);
      if (!courses.length) continue;

      // mark which (user,course) already have progress / reviews / streak
      const [progs, revs, hasStreak] = await Promise.all([
        CourseProgress.find({ user: uid, course: { $in: courses.map((c) => c._id) } }).select("course").lean(),
        Review.find({ user: uid, course: { $in: courses.map((c) => c._id) }, isDeleted: false }).select("course").lean(),
        Streak.exists({ user: uid }),
      ]);
      progs.forEach((p) => existingProgress.add(`${uid}:${p.course}`));
      revs.forEach((r) => existingReviews.add(`${uid}:${r.course}`));
      if (hasStreak) existingStreakUsers.add(String(uid));

      const before = buckets.streaks.length;
      const stat = genStudentActivity(uid, courses, { createEnrollment: false, level: pickLevel() }, buckets, existingProgress, existingReviews);

      // don't create a streak doc if the real user already has one (avoid clobbering)
      if (existingStreakUsers.has(String(uid))) buckets.streaks.splice(before);

      if (stat.totalCourses || stat.totalLectures) {
        studentStatSets.push({ userId: uid, stat, isNew: false });
        bumpExistingStudent(String(uid), stat);
      }
      existingHandled++;
    }
  }

  // ── Summary ──
  const totalReplies = buckets.qaQuestions.reduce((a, q) => a + q._replies.length, 0);
  const summary = {
    newStudents: buckets.users.length,
    existingStudentsTouched: existingHandled,
    enrollments: buckets.enrollments.length,
    courseProgress: buckets.progress.length,
    completedCourses: buckets.progress.filter((p) => p.isCompleted).length,
    certificates: buckets.progress.filter((p) => p.certId).length,
    qaQuestions: buckets.qaQuestions.length,
    qaReplies: totalReplies,
    notes: buckets.notes.length,
    reviews: buckets.reviews.length,
    streaks: buckets.streaks.length,
    orders: buckets.orders.length,
    aiAssessments: buckets.progress.filter((p) => p.aiAssessment).length,
    quizProgresses: buckets.quizprogresses.length,
    coursesAffected: Object.keys(manifest.counters.courses).length,
    instructorsAffected: Object.keys(manifest.counters.instructors).length,
  };

  console.log("\n╔══════════════ SEED PLAN ══════════════╗");
  for (const [k, v] of Object.entries(summary)) console.log(`  ${k.padEnd(24)} : ${v}`);
  console.log("╚════════════════════════════════════════╝");

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Nothing written. Sample new students:");
    buckets.users.slice(0, 5).forEach((u) => console.log(`   - ${u.name} <${u.email}>`));
    return;
  }

  await persist(buckets, { merge: false, selfHeal: "blanket" });
}

// ─────────────────────────────────────────────────────────────────────────
// Persist buckets + counter updates + manifest. Shared by seed() & fillExisting().
//   merge=true   → combine with an existing on-disk manifest (append ids + deltas)
//   selfHeal="blanket"  → on failure, hardCleanup() (only safe for the first batch)
//   selfHeal="targeted" → on failure, delete only THIS run's recorded ids
// ─────────────────────────────────────────────────────────────────────────
async function persist(buckets, { merge = false, selfHeal = "blanket" } = {}) {
  try {
    console.log("\nInserting...");
    if (buckets.users.length) {
      const r = await User.insertMany(buckets.users, { ordered: false });
      manifest.ids.users = r.map((d) => d._id);
      await stamp(User, manifest.ids.users);
      console.log(`  users            : ${r.length}`);
    }
    if (buckets.students.length) {
      const r = await Student.insertMany(buckets.students, { ordered: false });
      manifest.ids.students = r.map((d) => d._id);
      await stamp(Student, manifest.ids.students);
      console.log(`  students         : ${r.length}`);
    }
    if (buckets.enrollments.length) {
      const r = await Enrollment.insertMany(buckets.enrollments, { ordered: false });
      manifest.ids.enrollments = r.map((d) => d._id);
      await stamp(Enrollment, manifest.ids.enrollments);
      console.log(`  enrollments      : ${r.length}`);
    }
    if (buckets.progress.length) {
      const r = await CourseProgress.insertMany(buckets.progress, { ordered: false });
      manifest.ids.courseprogresses = r.map((d) => d._id);
      await stamp(CourseProgress, manifest.ids.courseprogresses);
      console.log(`  courseProgress   : ${r.length}`);
    }
    if (buckets.notes.length) {
      const r = await Note.insertMany(buckets.notes, { ordered: false });
      manifest.ids.notes = r.map((d) => d._id);
      await stamp(Note, manifest.ids.notes);
      console.log(`  notes            : ${r.length}`);
    }
    if (buckets.streaks.length) {
      const r = await Streak.insertMany(buckets.streaks, { ordered: false });
      manifest.ids.streaks = r.map((d) => d._id);
      await stamp(Streak, manifest.ids.streaks);
      console.log(`  streaks          : ${r.length}`);
    }
    if (buckets.reviews.length) {
      const r = await Review.insertMany(buckets.reviews, { ordered: false });
      manifest.ids.reviews = r.map((d) => d._id);
      await stamp(Review, manifest.ids.reviews);
      console.log(`  reviews          : ${r.length}`);
    }
    if (buckets.orders?.length) {
      const r = await Order.insertMany(buckets.orders, { ordered: false });
      manifest.ids.orders = r.map((d) => d._id);
      await stamp(Order, manifest.ids.orders);
      console.log(`  orders           : ${r.length}`);
    }
    if (buckets.quizprogresses?.length) {
      const r = await QuizProgress.insertMany(buckets.quizprogresses, { ordered: false });
      manifest.ids.quizprogresses = r.map((d) => d._id);
      await stamp(QuizProgress, manifest.ids.quizprogresses);
      console.log(`  quizProgress     : ${r.length}`);
    }
    // Q&A: questions first (to get ids), then replies with parentId
    if (buckets.qaQuestions.length) {
      const qDocs = buckets.qaQuestions.map(({ _tmp, _replies, ...q }) => q);
      const qRes = await QnA.insertMany(qDocs, { ordered: false });
      const qIds = qRes.map((d) => d._id);
      const replyDocs = [];
      buckets.qaQuestions.forEach((q, idx) => {
        for (const rep of q._replies) replyDocs.push({ ...rep, parentId: qIds[idx] });
      });
      let repIds = [];
      if (replyDocs.length) {
        const repRes = await QnA.insertMany(replyDocs, { ordered: false });
        repIds = repRes.map((d) => d._id);
      }
      manifest.ids.qnas = [...qIds, ...repIds];
      await stamp(QnA, manifest.ids.qnas);
      console.log(`  qna (q+replies)  : ${qIds.length} + ${repIds.length}`);
    }

    // ── COUNTER UPDATES ──
    console.log("\nUpdating counters...");
    const courseOps = [];
    for (const [cid, c] of Object.entries(manifest.counters.courses)) {
      const inc = {};
      if (c.studentsEnrolled) inc.studentsEnrolled = c.studentsEnrolled;
      if (c.ratingCount) { inc["rating.count"] = c.ratingCount; inc["rating.total"] = c.ratingTotal; for (const [s, n] of Object.entries(c.stars)) inc[`rating.stars.${s}`] = n; }
      if (Object.keys(inc).length) courseOps.push({ updateOne: { filter: { _id: new mongoose.Types.ObjectId(cid) }, update: { $inc: inc } } });
    }
    if (courseOps.length) await Course.bulkWrite(courseOps);

    const insOps = [];
    for (const [uid, i] of Object.entries(manifest.counters.instructors)) {
      const inc = {};
      if (i.totalStudents) inc["stats.totalStudents"] = i.totalStudents;
      if (i.totalReviews) inc["stats.totalReviews"] = i.totalReviews;
      if (i.ratingSum) inc["stats.ratingSum"] = i.ratingSum;
      if (Object.keys(inc).length) insOps.push({ updateOne: { filter: { user: new mongoose.Types.ObjectId(uid) }, update: { $inc: inc } } });
    }
    if (insOps.length) await Instructor.bulkWrite(insOps);

    const stuOps = [];
    for (const [uid, s] of Object.entries(manifest.counters.students)) {
      stuOps.push({ updateOne: { filter: { user: new mongoose.Types.ObjectId(uid) }, update: { $inc: {
        "stats.totalCourses": s.totalCourses, "stats.completedCourses": s.completedCourses,
        "stats.totalLectures": s.totalLectures, "stats.completedLectures": s.completedLectures,
      } } } });
    }
    if (stuOps.length) await Student.bulkWrite(stuOps);
    console.log(`  courses:${courseOps.length} instructors:${insOps.length} existingStudents:${stuOps.length}`);

    // ── manifest (merge with prior batch if requested) ──
    const finalManifest = (merge && fs.existsSync(MANIFEST_PATH))
      ? mergeManifests(JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")), manifest)
      : manifest;
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(finalManifest, null, 2));
    console.log(`\n✅ Done. Manifest → ${MANIFEST_PATH}`);
    console.log(`   Login password (created users): Abc@12345`);
    console.log(`   Rollback: node scripts/seed-activity.js --cleanup`);
  } catch (e) {
    console.error("\n⚠️ Write failed mid-way — self-healing (removing this run's data)...");
    if (selfHeal === "targeted") await targetedCleanup();
    else await hardCleanup();
    throw e;
  }
}

// Delete only the ids recorded in the current in-memory manifest (this run).
// Used by fill runs so a failure never wipes a previously-seeded batch.
async function targetedCleanup() {
  const map = {
    reviews: Review, streaks: Streak, notes: Note, qnas: QnA, orders: Order, quizprogresses: QuizProgress,
    courseprogresses: CourseProgress, enrollments: Enrollment, students: Student, users: User,
  };
  for (const [key, model] of Object.entries(map)) {
    const ids = (manifest.ids[key] || []).map((id) => new mongoose.Types.ObjectId(id));
    if (!ids.length) continue;
    const r = await model.collection.deleteMany({ _id: { $in: ids } });
    if (r.deletedCount) console.log(`  ${key}: ${r.deletedCount}`);
  }
}

// Combine two manifests (append ids, sum counter deltas) so one --cleanup reverts both.
function mergeManifests(a, b) {
  const out = { createdAt: a.createdAt, updatedAt: b.createdAt, ids: {}, counters: { courses: {}, instructors: {}, students: {} } };
  const keys = new Set([...Object.keys(a.ids || {}), ...Object.keys(b.ids || {})]);
  for (const k of keys) out.ids[k] = [...(a.ids?.[k] || []).map(String), ...(b.ids?.[k] || []).map(String)];
  const addCourses = (src) => { for (const [cid, c] of Object.entries(src || {})) {
    const t = (out.counters.courses[cid] ||= { studentsEnrolled: 0, ratingCount: 0, ratingTotal: 0, stars: {} });
    t.studentsEnrolled += c.studentsEnrolled || 0; t.ratingCount += c.ratingCount || 0; t.ratingTotal += c.ratingTotal || 0;
    for (const [s, n] of Object.entries(c.stars || {})) t.stars[s] = (t.stars[s] || 0) + n;
  } };
  addCourses(a.counters?.courses); addCourses(b.counters?.courses);
  const addIns = (src) => { for (const [uid, i] of Object.entries(src || {})) {
    const t = (out.counters.instructors[uid] ||= { totalStudents: 0, totalReviews: 0, ratingSum: 0 });
    t.totalStudents += i.totalStudents || 0; t.totalReviews += i.totalReviews || 0; t.ratingSum += i.ratingSum || 0;
  } };
  addIns(a.counters?.instructors); addIns(b.counters?.instructors);
  const addStu = (src) => { for (const [uid, s] of Object.entries(src || {})) {
    const t = (out.counters.students[uid] ||= { totalCourses: 0, completedCourses: 0, totalLectures: 0, completedLectures: 0 });
    for (const kk of Object.keys(t)) t[kk] += s[kk] || 0;
  } };
  addStu(a.counters?.students); addStu(b.counters?.students);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// Fill activity for EXISTING REAL students that currently have ZERO enrollment.
// Creates real enrollments + full activity for them (tagged _synthetic so it
// rolls back), and merges into the existing manifest. Real user docs are never
// deleted on cleanup — only the activity we added.
//   --only=<substr>   restrict to real students whose name/email matches substr
// ─────────────────────────────────────────────────────────────────────────
async function fillExisting() {
  const catalog = await loadCatalog();
  if (!catalog.length) throw new Error("No usable live courses with curriculum + instructor found.");

  const reals = await User.find({ role: "student", _synthetic: { $ne: true } })
    .select("_id name email createdAt").lean();

  const targets = [];
  for (const u of reals) {
    if ((await Enrollment.countDocuments({ student: u._id })) === 0) targets.push(u);
  }
  const only = (ARGV.find((a) => a.startsWith("--only=")) || "").split("=")[1];
  const chosen = only
    ? targets.filter((u) => `${u.email} ${u.name}`.toLowerCase().includes(only.toLowerCase()))
    : targets;

  const buckets = { users: [], students: [], enrollments: [], progress: [], notes: [], qaQuestions: [], reviews: [], streaks: [], orders: [], quizprogresses: [], _qseq: 0 };
  const noProgress = new Set(); // these students have no prior progress/reviews
  const noReviews = new Set();

  for (const u of chosen) {
    const [hasStudentDoc, hasStreak] = await Promise.all([
      Student.exists({ user: u._id }), Streak.exists({ user: u._id }),
    ]);
    const level = pickLevel();
    // enroll after the real account's registration date (fallback ~120d)
    const joinedDaysAgo = u.createdAt ? Math.max(2, Math.round((Date.now() - new Date(u.createdAt).getTime()) / 86400000)) : 120;
    const { courses, interests } = planStudentCourses(catalog, level);
    const before = buckets.streaks.length;
    const stat = genStudentActivity(u._id, courses, { createEnrollment: true, level, joinedDaysAgo }, buckets, noProgress, noReviews);
    if (hasStreak) buckets.streaks.splice(before); // don't clobber a real existing streak

    if (hasStudentDoc) {
      if (stat.totalCourses || stat.totalLectures) bumpExistingStudent(String(u._id), stat);
    } else {
      // real user without a Student doc yet — create one (tracked, so cleanup removes it)
      buckets.students.push({
        _id: new mongoose.Types.ObjectId(), user: u._id, interests, stats: stat,
        createdAt: new Date(), updatedAt: new Date(),
      });
    }
  }

  const summary = {
    realStudentsFilled: chosen.length,
    enrollments: buckets.enrollments.length,
    courseProgress: buckets.progress.length,
    completedCourses: buckets.progress.filter((p) => p.isCompleted).length,
    certificates: buckets.progress.filter((p) => p.certId).length,
    qaQuestions: buckets.qaQuestions.length,
    qaReplies: buckets.qaQuestions.reduce((a, q) => a + q._replies.length, 0),
    notes: buckets.notes.length,
    reviews: buckets.reviews.length,
    streaks: buckets.streaks.length,
    studentDocsCreated: buckets.students.length,
    coursesAffected: Object.keys(manifest.counters.courses).length,
    instructorsAffected: Object.keys(manifest.counters.instructors).length,
  };
  console.log("\n╔════════════ FILL-EXISTING PLAN ════════════╗");
  console.log("  Target real students (zero enrollment):");
  chosen.forEach((u) => console.log(`    - ${u.name} <${u.email}>`));
  for (const [k, v] of Object.entries(summary)) console.log(`  ${k.padEnd(24)} : ${v}`);
  console.log("╚═════════════════════════════════════════════╝");

  if (!chosen.length) { console.log("\nNothing to do — no matching zero-enrollment real students."); return; }
  if (DRY_RUN) { console.log("\n[DRY RUN] Nothing written."); return; }

  await persist(buckets, { merge: true, selfHeal: "targeted" });
}

// Delete every synthetic doc without touching counters. Used when there is no
// manifest (e.g. a run that failed mid-way) and as the on-error self-heal.
// Catches both `_synthetic`-tagged docs and any doc referencing a demo user
// (covers rows inserted but not yet stamped when a run aborts).
async function hardCleanup() {
  const demoUsers = await User.find({ _synthetic: true }).select("_id").lean();
  const ids = demoUsers.map((u) => u._id);
  const del = async (label, model, filter) => {
    const r = await model.collection.deleteMany(filter);
    if (r.deletedCount) console.log(`  ${label}: ${r.deletedCount}`);
  };
  // by demo-user reference
  if (ids.length) {
    await del("enrollments(ref)", Enrollment, { student: { $in: ids } });
    await del("courseprogresses(ref)", CourseProgress, { user: { $in: ids } });
    await del("notes(ref)", Note, { userId: { $in: ids } });
    await del("qnas(ref)", QnA, { author: { $in: ids } });
    await del("reviews(ref)", Review, { user: { $in: ids } });
    await del("streaks(ref)", Streak, { user: { $in: ids } });
    await del("orders(ref)", Order, { user: { $in: ids } });
    await del("quizprogresses(ref)", QuizProgress, { user: { $in: ids } });
    await del("students(ref)", Student, { user: { $in: ids } });
  }
  // by _synthetic tag (existing-student activity + instructor replies)
  for (const [name, model] of Object.entries({ Review, Streak, Note, QnA, Order, QuizProgress, CourseProgress, Enrollment, Student })) {
    await del(`${name}(tag)`, model, { _synthetic: true });
  }
  await del("users(demo)", User, { _id: { $in: ids } });
  console.log("  (counters NOT reverted — only safe when the failed run had not reached the counter step)");
}

async function cleanup() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.log("No manifest found — hard cleanup of synthetic/demo data (counters not reverted).");
    await hardCleanup();
    return;
  }
  const m = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

  // delete docs
  const delMap = {
    reviews: Review, streaks: Streak, notes: Note, qnas: QnA, orders: Order, quizprogresses: QuizProgress,
    courseprogresses: CourseProgress, enrollments: Enrollment,
    students: Student, users: User,
  };
  for (const [key, model] of Object.entries(delMap)) {
    const ids = (m.ids[key] || []).map((id) => new mongoose.Types.ObjectId(id));
    if (!ids.length) continue;
    const r = await model.collection.deleteMany({ _id: { $in: ids } });
    console.log(`  deleted ${key}: ${r.deletedCount}`);
  }

  // revert counters
  const courseOps = [];
  for (const [cid, c] of Object.entries(m.counters.courses)) {
    const inc = {};
    if (c.studentsEnrolled) inc.studentsEnrolled = -c.studentsEnrolled;
    if (c.ratingCount) { inc["rating.count"] = -c.ratingCount; inc["rating.total"] = -c.ratingTotal; for (const [s, n] of Object.entries(c.stars)) inc[`rating.stars.${s}`] = -n; }
    if (Object.keys(inc).length) courseOps.push({ updateOne: { filter: { _id: new mongoose.Types.ObjectId(cid) }, update: { $inc: inc } } });
  }
  if (courseOps.length) await Course.bulkWrite(courseOps);

  const insOps = [];
  for (const [uid, i] of Object.entries(m.counters.instructors)) {
    const inc = {};
    if (i.totalStudents) inc["stats.totalStudents"] = -i.totalStudents;
    if (i.totalReviews) inc["stats.totalReviews"] = -i.totalReviews;
    if (i.ratingSum) inc["stats.ratingSum"] = -i.ratingSum;
    if (Object.keys(inc).length) insOps.push({ updateOne: { filter: { user: new mongoose.Types.ObjectId(uid) }, update: { $inc: inc } } });
  }
  if (insOps.length) await Instructor.bulkWrite(insOps);

  const stuOps = [];
  for (const [uid, s] of Object.entries(m.counters.students)) {
    stuOps.push({ updateOne: { filter: { user: new mongoose.Types.ObjectId(uid) }, update: { $inc: {
      "stats.totalCourses": -s.totalCourses, "stats.completedCourses": -s.completedCourses,
      "stats.totalLectures": -s.totalLectures, "stats.completedLectures": -s.completedLectures,
    } } } });
  }
  if (stuOps.length) await Student.bulkWrite(stuOps);

  fs.renameSync(MANIFEST_PATH, MANIFEST_PATH + ".used");
  console.log(`\n✅ Cleanup done. Reverted counters (courses:${courseOps.length} instructors:${insOps.length} students:${stuOps.length}).`);
}

// ─────────────────────────────────────────────────────────────────────────
// Make already-seeded synthetic users look real: rewrite demo emails to
// personal-looking ones (no "seed"/demo marker) + set a RANDOM non-human avatar
// (~1/3 left blank). Also strips any human pravatar photo from real users that a
// prior run added. Cleanup is unaffected (deletes by manifest id).
// ─────────────────────────────────────────────────────────────────────────
async function humanize() {
  const syn = await User.find({ _synthetic: true }).select("_id name email pfpImg").lean();
  // Real users that got a pravatar (human photo) from an earlier run — clean those too.
  const pravatarReals = await User.find({ _synthetic: { $ne: true }, pfpImg: /i\.pravatar\.cc/ })
    .select("_id name email pfpImg").lean();

  if (!syn.length && !pravatarReals.length) { console.log("Nothing to humanize."); return; }

  const existing = new Set(
    (await User.find({}).select("email").lean()).map((u) => u.email?.toLowerCase()).filter(Boolean)
  );

  const ops = [];
  const samples = [];
  let emailChanges = 0, withAvatar = 0, noAvatar = 0;

  // synthetic users: randomize avatar + rewrite demo email (idempotent)
  for (const u of syn) {
    const avatar = randomAvatar(u._id, u.name);
    const set = { pfpImg: avatar };
    avatar ? withAvatar++ : noAvatar++;
    if (/@eduverse\.demo$/i.test(u.email || "") || /^seed\./i.test(u.email || "")) {
      existing.delete((u.email || "").toLowerCase());
      let email; do { email = genRealEmail(u.name); } while (existing.has(email.toLowerCase()));
      existing.add(email.toLowerCase());
      set.email = email; emailChanges++;
    }
    ops.push({ updateOne: { filter: { _id: u._id }, update: { $set: set } } });
    if (samples.length < 8) samples.push(`  ${u.name.padEnd(22)} ${u.email}  →  ${set.email || "(email kept)"} | avatar=${avatar ? avatar.split("/9.x/")[1] : "NONE"}`);
  }
  // real users: only replace the pravatar photo (may become none), never their email
  for (const u of pravatarReals) {
    const avatar = randomAvatar(u._id, u.name);
    avatar ? withAvatar++ : noAvatar++;
    ops.push({ updateOne: { filter: { _id: u._id }, update: { $set: { pfpImg: avatar } } } });
  }

  console.log(`\nHumanize plan: ${syn.length} synthetic + ${pravatarReals.length} real(pravatar cleanup).`);
  console.log(`  email rewrites: ${emailChanges} | with avatar: ${withAvatar} | no avatar: ${noAvatar}`);
  samples.forEach((s) => console.log(s));

  if (DRY_RUN) { console.log("\n[DRY RUN] Nothing written."); return; }
  if (ops.length) await User.bulkWrite(ops);
  console.log(`\n✅ Done. Users updated: ${ops.length} (emails: ${emailChanges}, avatars set: ${withAvatar}, left blank: ${noAvatar}).`);
}

async function main() {
  await connectDB();
  console.log(`DB: ${mongoose.connection.name}`);
  if (CLEANUP) await cleanup();
  else if (HUMANIZE) await humanize();
  else if (FILL_EXISTING) await fillExisting();
  else await seed();
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ ERROR:", err);
  mongoose.disconnect().finally(() => process.exit(1));
});
