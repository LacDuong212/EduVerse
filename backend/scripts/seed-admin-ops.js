/**
 * Seed ADMIN-SIDE + operational activity:
 *   - 1 admin account (login: Abc@12345)         → collection `admins`
 *   - audit logs (login / approve / payout / coupon ...) → `auditlogs`
 *   - instructor payouts (pending / paid / rejected)     → `payouts`
 *   - coupons (percent + money, valid schema)            → `coupons`
 *   - notifications for students (streak/enroll/complete) + instructors (payout)
 *
 * Everything is stamped `_synthetic: true`; a manifest lets `--cleanup` remove it.
 * No derived counters are touched, so cleanup is a pure delete-by-id.
 *
 * Usage (from backend/):
 *   node scripts/seed-admin-ops.js --dry-run
 *   node scripts/seed-admin-ops.js
 *   node scripts/seed-admin-ops.js --cleanup
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "#config/database.js";
import User from "#modules/user/user.model.js";
import Instructor from "#modules/instructor/instructor.model.js";
import Course, { STATUS_ENUM as COURSE_STATUS } from "#modules/course/course.model.js";
import Payout from "#modules/payout/payout.model.js";
import Coupon from "#modules/coupon/coupon.model.js";
import Notification, { TYPE_ENUM } from "#modules/notification/notification.model.js";
import CourseProgress from "#modules/learning/course-progress.model.js";
import Streak from "#modules/streak/streak.model.js";
import Enrollment from "#modules/enrollment/enrollment.model.js";

const ARGV = process.argv.slice(2);
const DRY_RUN = ARGV.includes("--dry-run");
const CLEANUP = ARGV.includes("--cleanup");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.join(__dirname, "seed-admin-ops.manifest.json");
const ADMIN_EMAIL = "admin.ops@eduverse.io.vn";
const ADMIN_PASSWORD = "Abc@12345";

// deterministic PRNG
let _seed = 20260704 >>> 0;
function rnd() { _seed |= 0; _seed = (_seed + 0x6d2b79f5) | 0; let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const rint = (a, b) => Math.floor(rnd() * (b - a + 1)) + a;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const chance = (p) => rnd() < p;
const sample = (a, n) => { const c = [...a], o = []; while (o.length < n && c.length) o.push(c.splice(Math.floor(rnd() * c.length), 1)[0]); return o; };
const daysAgo = (d) => new Date(Date.now() - d * 86400000);

const BANKS = ["Vietcombank", "Techcombank", "BIDV", "VietinBank", "MB Bank", "ACB", "VPBank", "Sacombank", "TPBank", "Agribank"];
const VN_MONTHS = ["01", "02", "03", "04", "05", "06", "07"];
const periodLabel = () => `Month ${pick(VN_MONTHS)}/2026`;
const bankInfo = (name) => ({
  bankName: pick(BANKS),
  accountNumber: String(rint(1000000000, 9999999999)),
  accountName: (name || "Giang Vien").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toUpperCase(),
});

const UA = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
];
const IP = () => `${rint(14, 220)}.${rint(0, 255)}.${rint(0, 255)}.${rint(1, 254)}`;

const weightedPick = (entries) => {
  const total = entries.reduce((s, e) => s + e[1], 0);
  let r = rnd() * total;
  for (const [v, w] of entries) { if ((r -= w) <= 0) return v; }
  return entries[entries.length - 1][0];
};
// Registration age (days ago) with a growth ramp, tail back ~10 months.
const regDaysAgo = () => weightedPick([
  [rint(1, 30), 0.24], [rint(31, 90), 0.30], [rint(91, 150), 0.20],
  [rint(151, 210), 0.14], [rint(211, 300), 0.12],
]);

const FIRST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô", "Dương", "Lý", "Phan", "Võ", "Đinh"];
const MID = ["Minh", "Thị", "Văn", "Hoàng", "Thu", "Quốc", "Anh", "Đức", "Hải", "Ngọc", "Gia", "Khánh", "Bảo", "Thanh"];
const LAST = ["Anh", "Hùng", "Hương", "Nam", "Mai", "Khoa", "Tùng", "Vinh", "Lan", "Tuấn", "Ngọc", "Hải", "Thu", "Phong", "Đạt", "Hạnh", "Ánh", "Kiệt", "Quân", "Ngân", "Thành", "Long", "Giang", "Hiền", "Dung", "Cường"];
const OCCUPATIONS = ["Senior Software Engineer", "Solutions Architect", "Data Scientist", "DevOps Engineer", "Frontend Developer", "Mobile Developer", "Tech Lead", "Cloud Consultant", "ML Engineer", "Fullstack Developer", "Security Engineer", "Product Engineer"];
const SKILL_POOL = ["JavaScript", "Python", "React", "Node.js", "Docker", "Kubernetes", "AWS", "Machine Learning", "TypeScript", "SQL", "System Design", "CI/CD", "Flutter", "Go", "Data Analysis"];
const INSTITUTIONS = ["ĐH Bách Khoa TP.HCM", "ĐH Công nghệ Thông tin - ĐHQG", "ĐH Khoa học Tự nhiên", "ĐH FPT", "ĐH Sư phạm Kỹ thuật TP.HCM", "ĐH Bách Khoa Hà Nội"];
const FIELDS = ["Khoa học Máy tính", "Kỹ thuật Phần mềm", "Hệ thống Thông tin", "An toàn Thông tin", "Trí tuệ Nhân tạo"];

function genRealEmail(name) {
  const parts = name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().split(/\s+/).filter(Boolean);
  const first = parts[0] || "user", last = parts[parts.length - 1] || "vn";
  const base = pick([`${last}${first}`, `${last}.${first}`, parts.join(""), `${first}.${last}`, `${last}${(first[0] || "")}${(parts[1]?.[0] || "")}`]);
  const num = chance(0.75) ? String(rint(1, 9999)) : "";
  return `${base}${num}@${pick(["gmail.com", "gmail.com", "gmail.com", "yahoo.com", "outlook.com"])}`;
}
const AV_STYLES = ["initials", "shapes", "identicon", "bottts", "thumbs", "rings"];
const randomAvatar = (id, name = "") => chance(0.35) ? "" :
  `https://api.dicebear.com/9.x/${pick(AV_STYLES)}/svg?seed=${encodeURIComponent(pick(AV_STYLES) === "initials" ? (name || String(id)) : String(id))}`;
const skillSet = () => sample(SKILL_POOL, rint(3, 6)).map((s) => ({ name: s, level: rint(55, 98) }));
const eduSet = (base) => [{ institution: pick(INSTITUTIONS), degree: pick(["Cử nhân", "Kỹ sư", "Thạc sĩ"]), fieldOfStudy: pick(FIELDS), startDate: new Date(base.getFullYear() - rint(6, 10), rint(0, 11), 1), endDate: new Date(base.getFullYear() - rint(2, 5), rint(0, 11), 1), addedAt: base }];

// audit ACTION/ENTITY (mirrors backend_admin/utils/auditLogger.js)
const ACTION = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS", LOGIN_FAILED: "LOGIN_FAILED", LOGOUT: "LOGOUT",
  COURSE_APPROVE: "COURSE_APPROVE", COURSE_REJECT: "COURSE_REJECT", COURSE_BLOCK: "COURSE_BLOCK", COURSE_UNBLOCK: "COURSE_UNBLOCK",
  INSTRUCTOR_APPROVE: "INSTRUCTOR_APPROVE", INSTRUCTOR_REJECT: "INSTRUCTOR_REJECT", INSTRUCTOR_BLOCK: "INSTRUCTOR_BLOCK",
  STUDENT_BLOCK: "STUDENT_BLOCK", STUDENT_UNBLOCK: "STUDENT_UNBLOCK",
  PAYOUT_MARK_PAID: "PAYOUT_MARK_PAID", PAYOUT_REJECT: "PAYOUT_REJECT",
  COUPON_CREATE: "COUPON_CREATE", COUPON_UPDATE_STATUS: "COUPON_UPDATE_STATUS",
  CATEGORY_CREATE: "CATEGORY_CREATE",
};
const ENTITY = { AUTH: "AUTH", COURSE: "COURSE", INSTRUCTOR: "INSTRUCTOR", STUDENT: "STUDENT", PAYOUT: "PAYOUT", COUPON: "COUPON", CATEGORY: "CATEGORY" };

const manifest = { createdAt: new Date().toISOString(), ids: { admins: [], auditlogs: [], payouts: [], coupons: [], notifications: [], users: [], instructors: [] } };

async function stamp(model, ids) {
  if (!ids.length || DRY_RUN) return;
  await model.collection.updateMany({ _id: { $in: ids } }, { $set: { _synthetic: true } });
}

async function seed() {
  const adminsCol = mongoose.connection.collection("admins");
  const auditCol = mongoose.connection.collection("auditlogs");

  // ── load real entities ──
  const [courses, instructorDocs, existingAdmins] = await Promise.all([
    Course.find({ isDeleted: false }).select("_id title status instructor").lean(),
    Instructor.find({}).select("user bankAccounts").lean(),
    adminsCol.find({}).project({ name: 1, email: 1 }).toArray(),
  ]);
  const instructorUserIds = instructorDocs.map((i) => i.user).filter(Boolean);
  const instrUsers = await User.find({ _id: { $in: instructorUserIds } }).select("name email").lean();
  const instrById = new Map(instrUsers.map((u) => [String(u._id), u]));
  const bankByUser = new Map(instructorDocs.map((i) => [String(i.user), i.bankAccounts?.[0] || null]));

  const synthStudents = await User.find({ _synthetic: true, role: "student" }).select("name").lean();
  const liveCourses = courses.filter((c) => c.status === COURSE_STATUS.live);
  const courseTitle = new Map(courses.map((c) => [String(c._id), c.title]));

  // ═══════════ 1. ADMIN ACCOUNT ═══════════
  const adminId = new mongoose.Types.ObjectId();
  const existingAdmin = await adminsCol.findOne({ email: ADMIN_EMAIL });
  const adminDoc = existingAdmin ? null : {
    _id: adminId, name: "Trần Quản Trị", email: ADMIN_EMAIL,
    password: bcrypt.hashSync(ADMIN_PASSWORD, 10),
    verifyOtp: "", verifyOtpExpireAt: 0, isVerified: true, isApproved: true,
    _synthetic: true, createdAt: daysAgo(90), updatedAt: new Date(),
  };
  // actor pool for audit logs = existing admins + the new one
  const actorPool = [
    ...existingAdmins.map((a) => ({ id: a._id, name: a.name || "Admin", email: a.email })),
    { id: adminId, name: "Trần Quản Trị", email: ADMIN_EMAIL },
  ];

  // ═══════════ 1b. NEW INSTRUCTORS + REQUESTS (no courses) ═══════════
  // approved  = User role=instructor + Instructor{isApproved:true}
  // pending   = User role=student    + Instructor{isApproved:false}  (shows in requests)
  // rejected  = User role=student    + NO instructor doc (reject deletes it) → rejected notification + audit
  const N_APPROVED = 20, N_PENDING = 12, N_REJECTED = 8;
  const newUsers = [];
  const newInstructorDocs = [];
  const instrEvents = []; // { userId, name, email, kind, instrDocId?, at }
  const emailSet = new Set((await User.find({}).select("email").lean()).map((u) => u.email?.toLowerCase()).filter(Boolean));
  const makeUser = (role, joinDaysAgo) => {
    const name = `${pick(FIRST)} ${pick(MID)} ${pick(LAST)}`;
    let email = genRealEmail(name);
    while (emailSet.has(email.toLowerCase())) email = genRealEmail(name);
    emailSet.add(email.toLowerCase());
    const _id = new mongoose.Types.ObjectId();
    const createdAt = daysAgo(joinDaysAgo);
    newUsers.push({
      _id, name, email, password: bcrypt.hashSync(ADMIN_PASSWORD, 10),
      bio: "", website: "", socials: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      pfpImg: randomAvatar(_id, name), verifyOtp: "", verifyOtpExpireAt: 0,
      isVerified: true, isActivated: true, role,
      _synthetic: true, createdAt, updatedAt: new Date(),
    });
    return { _id, name, email, createdAt };
  };
  const makeInstructorDoc = (userId, appliedAt, approved) => {
    const _id = new mongoose.Types.ObjectId();
    newInstructorDocs.push({
      _id, user: userId,
      stats: { totalCourses: 0, totalStudents: 0, totalReviews: 0, ratingSum: 0 },
      myCourses: [],
      introduction: "Giảng viên nhiệt huyết, mong muốn chia sẻ kiến thức thực chiến tới học viên.",
      address: pick(["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Bình Dương"]),
      occupation: pick(OCCUPATIONS), skills: skillSet(), education: eduSet(appliedAt),
      isApproved: approved, _synthetic: true, createdAt: appliedAt, updatedAt: new Date(),
    });
    return _id;
  };
  // approved instructors (older, established accounts)
  for (let i = 0; i < N_APPROVED; i++) {
    const join = weightedPick([[rint(60, 300), 0.7], [rint(30, 60), 0.3]]);
    const u = makeUser("instructor", join);
    const appliedAt = daysAgo(Math.max(1, join - rint(0, 20)));
    const instrDocId = makeInstructorDoc(u._id, appliedAt, true);
    instrEvents.push({ userId: u._id, name: u.name, email: u.email, kind: "approved", instrDocId, at: appliedAt });
  }
  // pending requests (recent — waiting for review)
  for (let i = 0; i < N_PENDING; i++) {
    const u = makeUser("student", rint(1, 50));
    const appliedAt = daysAgo(rint(0, 20));
    const instrDocId = makeInstructorDoc(u._id, appliedAt, false);
    instrEvents.push({ userId: u._id, name: u.name, email: u.email, kind: "pending", instrDocId, at: appliedAt });
  }
  // rejected (no instructor doc left; reject produced a notification + audit)
  for (let i = 0; i < N_REJECTED; i++) {
    const u = makeUser("student", regDaysAgo());
    const at = daysAgo(rint(3, 150));
    instrEvents.push({ userId: u._id, name: u.name, email: u.email, kind: "rejected", at });
  }

  // ═══════════ 2. COUPONS ═══════════
  const existingCodes = new Set((await Coupon.find({}).select("code").lean()).map((c) => c.code));
  const baseSpecs = [
    { code: "AUTUMN25", discountType: "percent", discountValue: 25, description: "Ưu đãi mùa thu 25% toàn bộ khóa học" },
    { code: "FLASH15", discountType: "percent", discountValue: 15, description: "Flash sale 15% trong 48 giờ" },
    { code: "NEWLEARNER10", discountType: "percent", discountValue: 10, description: "Giảm 10% cho học viên mới" },
    { code: "MEGA100K", discountType: "money", discountValue: 100000, description: "Giảm ngay 100.000đ cho đơn từ 300k" },
    { code: "SAVE50K", discountType: "money", discountValue: 50000, description: "Giảm 50.000đ mọi khóa học" },
    { code: "BLACKFRIDAY50", discountType: "percent", discountValue: 50, description: "Black Friday giảm sốc 50%" },
    { code: "TET2026", discountType: "money", discountValue: 200000, description: "Lì xì đầu năm 200.000đ" },
  ];
  // scaled: generate more varied coupon codes (percent + money, wide value spread)
  const PREFIX = ["SALE", "PROMO", "DEAL", "EDU", "STUDY", "LEARN", "GIFT", "SPRING", "SUMMER", "WINTER", "COMBO", "VIP", "SUPER", "HELLO", "BOOST"];
  const genSpecs = [];
  for (let i = 0; i < 25; i++) {
    const isPct = chance(0.6);
    const code = `${pick(PREFIX)}${pick(["", ""])}${rint(2, 99)}${pick(["", "K", "X", "2026"])}`;
    genSpecs.push(isPct
      ? { code, discountType: "percent", discountValue: pick([5, 10, 15, 20, 25, 30, 40, 50]), description: `Mã giảm giá ${code}` }
      : { code, discountType: "money", discountValue: pick([20000, 30000, 50000, 100000, 150000, 200000, 300000]), description: `Mã giảm giá ${code}` });
  }
  const seenCode = new Set();
  const couponSpecs = [...baseSpecs, ...genSpecs].filter((c) => {
    if (existingCodes.has(c.code) || seenCode.has(c.code)) return false;
    seenCode.add(c.code); return true;
  });

  const coupons = couponSpecs.map((c) => {
    const startOffset = rint(-30, 5);
    return {
      _id: new mongoose.Types.ObjectId(),
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      description: c.description,
      startDate: daysAgo(startOffset > 0 ? startOffset : Math.abs(startOffset)),
      expiryDate: new Date(Date.now() + rint(15, 90) * 86400000),
      isActive: chance(0.85),
      usersUsed: [], refundees: [],
      createdAt: daysAgo(rint(5, 40)), updatedAt: new Date(),
    };
  });

  // ═══════════ 3. PAYOUTS ═══════════
  const payouts = [];
  for (const iu of instrUsers) {
    const n = rint(4, 10); // scaled up + varied per instructor
    for (let k = 0; k < n; k++) {
      const status = pick(["paid", "paid", "paid", "pending", "rejected"]);
      const created = daysAgo(rint(5, 200));
      // wide spread: most small-mid, a few very large
      const amount = (chance(0.15) ? rint(150, 400) : rint(3, 120)) * 100000; // 300k – 40M VND
      const p = {
        _id: new mongoose.Types.ObjectId(),
        instructor: iu._id, amount,
        bankInfo: bankByUser.get(String(iu._id)) || bankInfo(iu.name),
        status, periodLabel: periodLabel(),
        adminNote: status === "rejected" ? "Account details do not match, please update them." : (status === "paid" ? "Bank transfer completed." : null),
        processedAt: status === "pending" ? null : new Date(created.getTime() + rint(1, 7) * 86400000),
        isDeleted: false,
        createdAt: created, updatedAt: new Date(),
      };
      payouts.push(p);
    }
  }

  // ═══════════ 4. NOTIFICATIONS ═══════════
  const notifications = [];
  const pushNoti = (user, type, message, createdAt) =>
    notifications.push({ user, type, message, isRead: chance(0.5), createdAt, updatedAt: createdAt });

  // students: enroll / streak / completion (corresponding to their real activity)
  const synthIds = synthStudents.map((s) => s._id);
  const [progs, streaks, enrolls] = await Promise.all([
    CourseProgress.find({ user: { $in: synthIds } }).select("user course isCompleted").lean(),
    Streak.find({ user: { $in: synthIds } }).select("user currentStreak longestStreak").lean(),
    Enrollment.find({ student: { $in: synthIds } }).select("student course enrolledAt").lean(),
  ]);
  const streakByUser = new Map(streaks.map((s) => [String(s.user), s]));

  // enrollment notifications (a subset)
  for (const e of sample(enrolls, Math.min(enrolls.length, 60))) {
    pushNoti(e.student, TYPE_ENUM.succeeded, `You have successfully enrolled in the course "${courseTitle.get(String(e.course)) || "the course"}".`, e.enrolledAt || daysAgo(rint(1, 60)));
  }
  // completion + certificate notifications
  for (const p of progs.filter((x) => x.isCompleted)) {
    pushNoti(p.user, TYPE_ENUM.approved, `Congratulations! You have completed the course "${courseTitle.get(String(p.course)) || "the course"}" and earned a certificate.`, daysAgo(rint(1, 30)));
  }
  // streak milestones
  for (const s of streaks) {
    if (s.longestStreak >= 3)
      pushNoti(s.user, TYPE_ENUM.info, `Awesome! You're on a ${s.currentStreak}-day learning streak (record: ${s.longestStreak} days). Keep it up!`, daysAgo(rint(0, 7)));
  }
  // instructor payout notifications (correspond to payouts created above)
  for (const p of payouts) {
    if (p.status === "paid")
      pushNoti(p.instructor, TYPE_ENUM.succeeded, `Your payout request of ${p.amount.toLocaleString("vi-VN")}đ (${p.periodLabel}) has been paid.`, p.processedAt);
    else if (p.status === "rejected")
      pushNoti(p.instructor, TYPE_ENUM.rejected, `Your payout request of ${p.amount.toLocaleString("vi-VN")}đ (${p.periodLabel}) was rejected: ${p.adminNote}`, p.processedAt);
  }
  // instructor application notifications (approved / pending / rejected)
  for (const ev of instrEvents) {
    if (ev.kind === "approved")
      pushNoti(ev.userId, TYPE_ENUM.approved, "Congratulations! Your instructor application has been approved. You can start creating courses.", ev.at);
    else if (ev.kind === "pending")
      pushNoti(ev.userId, TYPE_ENUM.info, "We have received your instructor application and are reviewing it. Please allow a few days.", ev.at);
    else
      pushNoti(ev.userId, TYPE_ENUM.rejected, "Thank you for your interest. After review, your instructor application was not approved at this time.", ev.at);
  }

  // ═══════════ 5. AUDIT LOGS ═══════════
  const auditDocs = [];
  const addAudit = (actor, action, entityType, entity = {}, extra = {}) => {
    const at = daysAgo(rint(0, 120));
    auditDocs.push({
      adminId: actor.id, adminName: actor.name, adminEmail: actor.email,
      action, entityType,
      entityId: entity.id ? String(entity.id) : null, entityLabel: entity.label || null,
      before: extra.before ?? null, after: extra.after ?? null, reason: extra.reason ?? null,
      success: extra.success ?? true, failReason: extra.failReason ?? null,
      ipAddress: IP(), userAgent: pick(UA),
      _synthetic: true, createdAt: at, updatedAt: at,
    });
  };

  // logins (many per actor) + failed + logout — scaled up
  for (const actor of actorPool) {
    for (let i = 0; i < rint(10, 20); i++) addAudit(actor, ACTION.LOGIN_SUCCESS, ENTITY.AUTH);
    for (let i = 0; i < rint(0, 3); i++) addAudit(actor, ACTION.LOGIN_FAILED, ENTITY.AUTH, {}, { success: false, failReason: "Wrong password" });
    for (let i = 0; i < rint(1, 4); i++) addAudit(actor, ACTION.LOGOUT, ENTITY.AUTH);
  }
  // course moderation — multiple passes over the whole catalog
  for (let pass = 0; pass < 3; pass++) for (const c of courses) {
    if (!chance(0.5)) continue;
    const actor = pick(actorPool);
    const act = pick([ACTION.COURSE_APPROVE, ACTION.COURSE_APPROVE, ACTION.COURSE_BLOCK, ACTION.COURSE_UNBLOCK, ACTION.COURSE_REJECT]);
    addAudit(actor, act, ENTITY.COURSE, { id: c._id, label: c.title },
      { before: { status: "pending" }, after: { status: act === ACTION.COURSE_APPROVE ? "live" : act === ACTION.COURSE_BLOCK ? "blocked" : "rejected" } });
  }
  // instructor approvals / blocks (a couple of passes)
  for (let pass = 0; pass < 2; pass++) for (const iu of instrUsers) {
    if (chance(0.6)) addAudit(pick(actorPool), pick([ACTION.INSTRUCTOR_APPROVE, ACTION.INSTRUCTOR_APPROVE, ACTION.INSTRUCTOR_BLOCK]), ENTITY.INSTRUCTOR, { id: iu._id, label: iu.name });
  }
  // audit for the new-instructor lifecycle (approve on instr doc; reject was a delete)
  for (const ev of instrEvents) {
    const at = ev.at;
    if (ev.kind === "approved")
      auditDocs.push({ adminId: pick(actorPool).id, adminName: pick(actorPool).name, adminEmail: null, action: ACTION.INSTRUCTOR_APPROVE, entityType: ENTITY.INSTRUCTOR, entityId: String(ev.instrDocId), entityLabel: `${ev.name} (${ev.email})`, before: { isApproved: false }, after: { isApproved: true, role: "instructor" }, reason: null, success: true, failReason: null, ipAddress: IP(), userAgent: pick(UA), _synthetic: true, createdAt: at, updatedAt: at });
    else if (ev.kind === "rejected")
      auditDocs.push({ adminId: pick(actorPool).id, adminName: pick(actorPool).name, adminEmail: null, action: ACTION.INSTRUCTOR_REJECT, entityType: ENTITY.INSTRUCTOR, entityId: String(ev.userId), entityLabel: `${ev.name} (${ev.email})`, before: { isApproved: false }, after: { deleted: true }, reason: pick(["Hồ sơ chưa đủ kinh nghiệm giảng dạy.", "Thiếu thông tin chuyên môn.", "Chưa đáp ứng tiêu chí nền tảng."]), success: true, failReason: null, ipAddress: IP(), userAgent: pick(UA), _synthetic: true, createdAt: at, updatedAt: at });
  }
  // student blocks/unblocks
  for (const s of sample(synthStudents, Math.min(synthStudents.length, 20))) {
    addAudit(pick(actorPool), pick([ACTION.STUDENT_BLOCK, ACTION.STUDENT_UNBLOCK]), ENTITY.STUDENT, { id: s._id, label: s.name });
  }
  // some category actions
  for (let i = 0; i < rint(4, 8); i++) addAudit(pick(actorPool), ACTION.CATEGORY_CREATE, ENTITY.CATEGORY, { label: pick(["Web", "Mobile", "Data", "Cloud", "AI", "DevOps", "Security", "Design"]) });
  // payout decisions (correspond to non-pending payouts)
  for (const p of payouts.filter((x) => x.status !== "pending")) {
    const u = instrById.get(String(p.instructor));
    addAudit(pick(actorPool), p.status === "paid" ? ACTION.PAYOUT_MARK_PAID : ACTION.PAYOUT_REJECT, ENTITY.PAYOUT,
      { id: p._id, label: u?.name || "Instructor" },
      { before: { status: "pending" }, after: { status: p.status }, reason: p.adminNote });
  }
  // coupon lifecycle
  for (const c of coupons) {
    addAudit(pick(actorPool), ACTION.COUPON_CREATE, ENTITY.COUPON, { id: c._id, label: c.code },
      { after: { code: c.code, discountType: c.discountType, discountValue: c.discountValue } });
    if (chance(0.4)) addAudit(pick(actorPool), ACTION.COUPON_UPDATE_STATUS, ENTITY.COUPON, { id: c._id, label: c.code }, { before: { isActive: true }, after: { isActive: false } });
  }

  // ── summary ──
  const summary = {
    adminCreated: adminDoc ? 1 : 0,
    "instructors(approved)": instrEvents.filter(e=>e.kind==="approved").length,
    "instructorReq(pending)": instrEvents.filter(e=>e.kind==="pending").length,
    "instructorReq(rejected)": instrEvents.filter(e=>e.kind==="rejected").length,
    newUsers: newUsers.length,
    coupons: coupons.length,
    payouts: payouts.length,
    "payouts(paid/pending/rejected)": `${payouts.filter(p=>p.status==="paid").length}/${payouts.filter(p=>p.status==="pending").length}/${payouts.filter(p=>p.status==="rejected").length}`,
    notifications: notifications.length,
    auditLogs: auditDocs.length,
  };
  console.log("\n╔══════════ ADMIN-OPS SEED PLAN ══════════╗");
  for (const [k, v] of Object.entries(summary)) console.log(`  ${k.padEnd(30)} : ${v}`);
  console.log("╚══════════════════════════════════════════╝");

  if (DRY_RUN) {
    console.log(`\n[DRY RUN] Nothing written.`);
    console.log(`  admin: ${adminDoc ? `${adminDoc.email} / ${ADMIN_PASSWORD}` : "(already exists, skip)"}`);
    console.log(`  coupons: ${coupons.map((c) => c.code).join(", ")}`);
    return;
  }

  try {
    console.log("\nInserting...");
    if (adminDoc) { await adminsCol.insertOne(adminDoc); manifest.ids.admins = [adminId]; console.log(`  admin            : 1 (${ADMIN_EMAIL})`); }
    else console.log("  admin            : skipped (exists)");

    if (newUsers.length) {
      const r = await User.insertMany(newUsers, { ordered: false });
      manifest.ids.users = r.map((d) => d._id);
      await stamp(User, manifest.ids.users);
      console.log(`  instructor users : ${r.length}`);
    }
    if (newInstructorDocs.length) {
      const r = await Instructor.insertMany(newInstructorDocs, { ordered: false });
      manifest.ids.instructors = r.map((d) => d._id);
      await stamp(Instructor, manifest.ids.instructors);
      console.log(`  instructor docs  : ${r.length}`);
    }

    if (coupons.length) {
      const r = await Coupon.insertMany(coupons, { ordered: false });
      manifest.ids.coupons = r.map((d) => d._id);
      await stamp(Coupon, manifest.ids.coupons);
      console.log(`  coupons          : ${r.length}`);
    }
    if (payouts.length) {
      const r = await Payout.insertMany(payouts, { ordered: false });
      manifest.ids.payouts = r.map((d) => d._id);
      await stamp(Payout, manifest.ids.payouts);
      console.log(`  payouts          : ${r.length}`);
    }
    if (notifications.length) {
      const r = await Notification.insertMany(notifications, { ordered: false });
      manifest.ids.notifications = r.map((d) => d._id);
      await stamp(Notification, manifest.ids.notifications);
      console.log(`  notifications    : ${r.length}`);
    }
    if (auditDocs.length) {
      const r = await auditCol.insertMany(auditDocs);
      manifest.ids.auditlogs = Object.values(r.insertedIds);
      console.log(`  auditLogs        : ${auditDocs.length}`);
    }

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`\n✅ Done. Manifest → ${MANIFEST_PATH}`);
    if (adminDoc) console.log(`   New admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(`   Rollback: node scripts/seed-admin-ops.js --cleanup`);
  } catch (e) {
    console.error("\n⚠️ Write failed — self-healing (removing this run's data)...");
    await cleanupByIds();
    throw e;
  }
}

async function cleanupByIds(m = manifest) {
  const oid = (x) => new mongoose.Types.ObjectId(x);
  const map = { coupons: Coupon, payouts: Payout, notifications: Notification, instructors: Instructor, users: User };
  for (const [k, model] of Object.entries(map)) {
    const ids = (m.ids[k] || []).map(oid);
    if (ids.length) { const r = await model.collection.deleteMany({ _id: { $in: ids } }); if (r.deletedCount) console.log(`  ${k}: ${r.deletedCount}`); }
  }
  for (const [k, coll] of Object.entries({ admins: "admins", auditlogs: "auditlogs" })) {
    const ids = (m.ids[k] || []).map(oid);
    if (ids.length) { const r = await mongoose.connection.collection(coll).deleteMany({ _id: { $in: ids } }); if (r.deletedCount) console.log(`  ${k}: ${r.deletedCount}`); }
  }
}

async function cleanup() {
  if (fs.existsSync(MANIFEST_PATH)) {
    const m = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    await cleanupByIds(m);
    fs.renameSync(MANIFEST_PATH, MANIFEST_PATH + ".used");
    console.log("\n✅ Cleanup done (by manifest).");
  } else {
    console.log("No manifest — deleting _synthetic admin-ops docs.");
    for (const [name, model] of Object.entries({ Coupon, Payout, Notification })) {
      const r = await model.collection.deleteMany({ _synthetic: true }); if (r.deletedCount) console.log(`  ${name}: ${r.deletedCount}`);
    }
    for (const coll of ["auditlogs", "admins"]) {
      const r = await mongoose.connection.collection(coll).deleteMany({ _synthetic: true }); if (r.deletedCount) console.log(`  ${coll}: ${r.deletedCount}`);
    }
  }
}

async function main() {
  await connectDB();
  console.log(`DB: ${mongoose.connection.name}`);
  if (CLEANUP) await cleanup();
  else await seed();
  await mongoose.disconnect();
  process.exit(0);
}
main().catch((err) => { console.error("\n❌ ERROR:", err); mongoose.disconnect().finally(() => process.exit(1)); });
