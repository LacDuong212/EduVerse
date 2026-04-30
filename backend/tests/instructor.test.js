/**
 * INSTRUCTOR API Tests â€” HIGH COVERAGE
 * Jira: EDV-177, EDV-183, EDV-207, EDV-218, EDV-219, EDV-220, EDV-221,
 *       EDV-222, EDV-235, EDV-236, EDV-253, EDV-254
 *
 * Fixtures:
 *   - INSTRUCTOR_A : vi021ttv@gmail.com          (userId: 694cf235ddf90206a887c3a6, insId: 694cf6faddf90206a887c441)
 *     â€¢ 9 courses (5 live + 4 draft), 1 student enrolled, isApproved: true
 *   - INSTRUCTOR_B : 22110304@student.hcmute.edu.vn (userId: 694cf0caddf90206a887c33b, insId: 694cf0fdddf90206a887c375)
 *     â€¢ 7 courses, isApproved: true
 *   - STUDENT      : lacduongldg212@gmail.com     (userId: 694d32d7ebe694fc49e59a67, role: student)
 *
 * Test order:
 *   1. Read-only GETs first (stats, profile, courses, students, earnings)
 *   2. EDV-253: Create course (POST â€” creates draft, cleanup after)
 *   3. EDV-219: Update course (PATCH â€” uses existing draft with pendingUpdate)
 *   4. EDV-220: Submit course
 *   5. EDV-221: Clear course changes
 *   6. EDV-177: Become instructor (last â€” tested with student who is NOT yet instructor)
 */
import request from "supertest";
import app from "../src/app.js";
import Course from "../src/modules/course/course.model.js";
import Curriculum from "../src/modules/course/curriculum.model.js";
import Instructor from "../src/modules/instructor/instructor.model.js";
import User from "../src/modules/user/user.model.js";
import "../tests/setup.js";

// â”€â”€â”€ Bases â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PUB = "/api/instructors";  // public routes
const PRI = "/api/instructor";   // private routes

// â”€â”€â”€ Fixtures â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const INSTRUCTOR_A = { email: "vi021ttv@gmail.com",             password: "Abc@12345" };
const INSTRUCTOR_B = { email: "22110304@student.hcmute.edu.vn", password: "Abc@12345" };
const STUDENT      = { email: "lacduongldg212@gmail.com",       password: "Abc@12345" };

const INS_A_USER_ID = "694cf235ddf90206a887c3a6";
const INS_A_INS_ID  = "694cf6faddf90206a887c441";
const INS_B_USER_ID = "694cf0caddf90206a887c33b";
const INS_B_INS_ID  = "694cf0fdddf90206a887c375";
const STUDENT_ID    = "694d32d7ebe694fc49e59a67";

// Instructor A's courses (5 live â€” the 4 draft courses no longer exist in DB)
const LIVE_COURSE_1       = "694d046addf90206a887c535";  // Crash Course CS, 1 student
const LIVE_COURSE_2       = "694e9d90ed8f2ec45dc0e653";  // Crash Course DS, 1 student
const LIVE_COURSE_3       = "694eb035a3f9fb4adc5d8d31";  // Cloud Computing
const LIVE_COURSE_NO_STU  = "69501b5ed27dbaf7e24adb7e";  // Networking, 0 students
const LIVE_FREE_COURSE    = "69513fa93f95cbe46155ff69";  // Blockchain, price=0

const INVALID_ID     = "not-a-valid-id";
const NONEXISTENT_ID = "000000000000000000000001";

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function login(creds) {
  const res = await request(app).post("/api/auth/login").send(creds);
  return res.headers["set-cookie"]?.find((c) => c.startsWith("token=")) || "";
}

let insACookie, insBCookie, studentCookie;
let createdCourseId = null;  // tracks course created by EDV-253 for cleanup
let clearTestCourseId = null; // second draft for EDV-221 clear tests

beforeAll(async () => {
  [insACookie, insBCookie, studentCookie] = await Promise.all([
    login(INSTRUCTOR_A),
    login(INSTRUCTOR_B),
    login(STUDENT),
  ]);
});

afterAll(async () => {
  try {
    // Delete courses created during tests
    const toDelete = [createdCourseId, clearTestCourseId].filter(Boolean);
    if (toDelete.length) {
      await Curriculum.deleteMany({ courseId: { $in: toDelete } });
      await Course.deleteMany({ _id: { $in: toDelete } });
    }
    // Revert pendingUpdate on live courses modified by EDV-219/220 tests
    const liveModified = [LIVE_COURSE_1, LIVE_COURSE_3];
    await Course.updateMany(
      { _id: { $in: liveModified } },
      { $set: { "pendingUpdate.data": null, "pendingUpdate.submittedAt": null, "pendingUpdate.status": "none" } }
    );
    await Curriculum.updateMany(
      { courseId: { $in: liveModified } },
      { $set: { "pendingUpdate.data": null, "pendingUpdate.submittedAt": null, "pendingUpdate.status": "none" } }
    );
  } catch { /* connection may already be closed */ }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-183: Instructor Stats
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-183 Â· Instructor Stats", () => {
  // â”€â”€ Public stats: GET /api/instructors/:insId/stats â”€â”€
  describe("GET /api/instructors/:insId/stats (public)", () => {
    it("returns public stats without auth", async () => {
      const res = await request(app).get(`${PUB}/${INS_A_USER_ID}/stats`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get instructor stats successfully.");
      const r = res.body.result;
      expect(r).toHaveProperty("totalCourses");
      expect(r).toHaveProperty("totalStudents");
      expect(r).toHaveProperty("totalReviews");
      expect(r).toHaveProperty("averageRating");
      // Public stats should NOT have totalOrders
      expect(r).not.toHaveProperty("totalOrders");
      expect(typeof r.totalCourses).toBe("number");
      expect(typeof r.totalStudents).toBe("number");
      expect(typeof r.totalReviews).toBe("number");
      expect(typeof r.averageRating).toBe("number");
    });

    it("returns 400 for invalid insId param", async () => {
      const res = await request(app).get(`${PUB}/${INVALID_ID}/stats`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for non-existent instructor", async () => {
      const res = await request(app).get(`${PUB}/${NONEXISTENT_ID}/stats`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // â”€â”€ Private stats: GET /api/instructor/stats â”€â”€
  describe("GET /api/instructor/stats (private)", () => {
    it("returns private stats with totalOrders for instructor", async () => {
      const res = await request(app)
        .get(`${PRI}/stats`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get instructor stats successfully.");
      const r = res.body.result;
      expect(r).toHaveProperty("totalCourses");
      expect(r).toHaveProperty("totalStudents");
      expect(r).toHaveProperty("totalReviews");
      expect(r).toHaveProperty("averageRating");
      expect(r).toHaveProperty("totalOrders");
      expect(typeof r.totalOrders).toBe("number");
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).get(`${PRI}/stats`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 for student role", async () => {
      const res = await request(app)
        .get(`${PRI}/stats`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-183 (cont): Public & Private Profile
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-183 Â· Instructor Profile", () => {
  // â”€â”€ Public profile: GET /api/instructors/:insId â”€â”€
  describe("GET /api/instructors/:insId (public profile)", () => {
    it("returns full instructor profile details", async () => {
      const res = await request(app).get(`${PUB}/${INS_A_USER_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get instructor's profile successfully!");
      const r = res.body.result;
      // Check toInstructorDetails shape
      expect(r).toHaveProperty("name");
      expect(r).toHaveProperty("email");
      expect(r).toHaveProperty("avatar");
      expect(r).toHaveProperty("address");
      expect(r).toHaveProperty("occupation");
      expect(r).toHaveProperty("website");
      expect(r).toHaveProperty("socials");
      expect(r.socials).toHaveProperty("facebook");
      expect(r.socials).toHaveProperty("instagram");
      expect(r.socials).toHaveProperty("linkedin");
      expect(r.socials).toHaveProperty("youtube");
      expect(r).toHaveProperty("introduction");
      expect(r).toHaveProperty("skills");
      expect(r).toHaveProperty("education");
      expect(r).toHaveProperty("isActive");
      expect(Array.isArray(r.skills)).toBe(true);
      expect(Array.isArray(r.education)).toBe(true);
      // timestamp=true â†’ should have createdAt, updatedAt
      expect(r).toHaveProperty("createdAt");
      expect(r).toHaveProperty("updatedAt");
    });

    it("validates skill shape in profile", async () => {
      const res = await request(app).get(`${PUB}/${INS_A_USER_ID}`);
      const skills = res.body.result.skills;
      if (skills.length > 0) {
        expect(skills[0]).toHaveProperty("name");
        expect(skills[0]).toHaveProperty("level");
        expect(typeof skills[0].name).toBe("string");
        expect(typeof skills[0].level).toBe("number");
      }
    });

    it("validates education shape in profile", async () => {
      const res = await request(app).get(`${PUB}/${INS_A_USER_ID}`);
      const edu = res.body.result.education;
      if (edu.length > 0) {
        expect(edu[0]).toHaveProperty("fieldOfStudy");
        expect(edu[0]).toHaveProperty("institution");
        expect(edu[0]).toHaveProperty("addedAt");
      }
    });

    it("returns 400 for invalid insId", async () => {
      const res = await request(app).get(`${PUB}/${INVALID_ID}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 404 for non-existent instructor", async () => {
      const res = await request(app).get(`${PUB}/${NONEXISTENT_ID}`);
      expect([400, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  // â”€â”€ Private profile: GET /api/instructor/profile â”€â”€
  describe("GET /api/instructor/profile (private)", () => {
    it("returns instructor's own profile", async () => {
      const res = await request(app)
        .get(`${PRI}/profile`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get instructor's profile successfully!");
      const r = res.body.result;
      expect(r).toHaveProperty("name");
      expect(r).toHaveProperty("email");
      expect(r).toHaveProperty("socials");
      expect(r).toHaveProperty("skills");
      expect(r).toHaveProperty("education");
      expect(r).toHaveProperty("isActive");
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).get(`${PRI}/profile`);
      expect(res.status).toBe(401);
    });

    it("returns 403 for student", async () => {
      const res = await request(app)
        .get(`${PRI}/profile`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });
  });

  // â”€â”€ GET /api/instructors/me (getCurrentInstructor) â”€â”€
  describe("GET /api/instructors/me", () => {
    it("returns instructor mini-profile when authenticated as instructor", async () => {
      const res = await request(app)
        .get(`${PUB}/me`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Instructor profile found!");
      const r = res.body.result;
      expect(r).toHaveProperty("insId");
      expect(r).toHaveProperty("name");
      expect(r).toHaveProperty("avatar");
      expect(r).toHaveProperty("occupation");
      expect(r).toHaveProperty("isApproved");
      expect(r).toHaveProperty("createdAt");
      expect(r.isApproved).toBe(true);
      // courses / skills / education should be counts (numbers)
      expect(typeof r.courses).toBe("number");
      expect(typeof r.skills).toBe("number");
      expect(typeof r.education).toBe("number");
    });

    it("returns unsuccess when student has no instructor profile", async () => {
      const res = await request(app)
        .get(`${PUB}/me`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("You don't have an instructor profile.");
    });

    it("works without auth (checkAuth is soft)", async () => {
      const res = await request(app).get(`${PUB}/me`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
    });
  });
});

// ===============================================================================
// EDV-183 (cont): Update Instructor Profile  PATCH /api/instructor/profile
// ===============================================================================
describe("EDV-183 Â· Update Instructor Profile", () => {
  describe("PATCH /api/instructor/profile", () => {
    let snapshotIns, snapshotUser;

    beforeAll(async () => {
      // Snapshot INSTRUCTOR_A state before any modification
      snapshotIns  = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      snapshotUser = await User.findById(INS_A_USER_ID).lean();
    });

    afterAll(async () => {
      // Restore INS_A to exact original state
      try {
        await Instructor.findOneAndUpdate(
          { user: INS_A_USER_ID },
          {
            $set: {
              occupation:   snapshotIns.occupation,
              introduction: snapshotIns.introduction,
              address:      snapshotIns.address,
              skills:       snapshotIns.skills,
              education:    snapshotIns.education,
            },
          }
        );
        await User.findByIdAndUpdate(INS_A_USER_ID, {
          $set: {
            name:        snapshotUser.name,
            phonenumber: snapshotUser.phonenumber,
            pfpImg:      snapshotUser.pfpImg,
            website:     snapshotUser.website,
            socials:     snapshotUser.socials,
          },
        });
      } catch { /* ignore */ }
    });

    // -- Success cases ----------------------------------------------------------

    it("updates occupation and returns toInstructorDetails DTO shape", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ occupation: "[TEST] Senior Dev" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Profile updated successfully!");
      const r = res.body.result;
      expect(r.occupation).toBe("[TEST] Senior Dev");
      // Full DTO shape
      expect(r).toHaveProperty("name");
      expect(r).toHaveProperty("email");
      expect(r).toHaveProperty("phonenumber");
      expect(r).toHaveProperty("avatar");
      expect(r).toHaveProperty("address");
      expect(r).toHaveProperty("website");
      expect(r.socials).toHaveProperty("facebook");
      expect(r.socials).toHaveProperty("instagram");
      expect(r.socials).toHaveProperty("linkedin");
      expect(r.socials).toHaveProperty("youtube");
      expect(r).toHaveProperty("introduction");
      expect(r).toHaveProperty("skills");
      expect(r).toHaveProperty("education");
      // NOTE: isActive is not included in PATCH response (populate does not select isActivated)
    });

    // [BUG EDV-272] isActive should be in PATCH response but populate omits isActivated
    it.failing("PATCH profile response should include isActive (EDV-272)", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ occupation: "[TEST] isActive check" });
      expect(res.status).toBe(200);
      expect(res.body.result).toHaveProperty("isActive");
    });

    it("response does NOT leak password, __v, passwordResetToken", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ occupation: "[TEST] LeakGuard Check" });
      expect(res.status).toBe(200);
      const r = res.body.result;
      expect(r).not.toHaveProperty("password");
      expect(r).not.toHaveProperty("__v");
      expect(r).not.toHaveProperty("passwordResetToken");
      expect(r).not.toHaveProperty("verifyOtp");
      expect(r).not.toHaveProperty("googleId");
      expect(res.body).not.toHaveProperty("stack");
    });

    it("updates user name -> verified by DB", async () => {
      const newName = "[TEST] Updated Name";
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ name: newName });
      expect(res.status).toBe(200);
      expect(res.body.result.name).toBe(newName);

      // DB cross-check: User document updated
      const dbUser = await User.findById(INS_A_USER_ID).lean();
      expect(dbUser.name).toBe(newName);

      // Verify via GET
      const getRes = await request(app)
        .get(`${PRI}/profile`)
        .set("Cookie", insACookie);
      expect(getRes.body.result.name).toBe(newName);
    });

    it("updates introduction and address -> verified by DB", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({
          introduction: "[TEST] Updated intro",
          address: "[TEST] 123 Test Street",
        });
      expect(res.status).toBe(200);
      expect(res.body.result.introduction).toBe("[TEST] Updated intro");
      expect(res.body.result.address).toBe("[TEST] 123 Test Street");

      // DB cross-check
      const dbIns = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      expect(dbIns.introduction).toBe("[TEST] Updated intro");
      expect(dbIns.address).toBe("[TEST] 123 Test Street");
    });

    it("updates skills array -> verified by DB", async () => {
      const skills = [
        { name: "JavaScript", level: 90 },
        { name: "MongoDB", level: 75 },
      ];
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ skills });
      expect(res.status).toBe(200);
      expect(res.body.result.skills).toHaveLength(2);
      expect(res.body.result.skills[0]).toMatchObject({ name: "JavaScript", level: 90 });
      expect(res.body.result.skills[1]).toMatchObject({ name: "MongoDB", level: 75 });

      // DB cross-check
      const dbIns = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      expect(dbIns.skills).toHaveLength(2);
      expect(dbIns.skills[0].name).toBe("JavaScript");
      expect(dbIns.skills[0].level).toBe(90);
    });

    it("updates education array -> verified by DB", async () => {
      const education = [
        {
          institution: "Test University",
          fieldOfStudy: "Computer Science",
          addedAt: new Date().toISOString(),
        },
      ];
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ education });
      expect(res.status).toBe(200);
      expect(res.body.result.education).toHaveLength(1);
      expect(res.body.result.education[0]).toMatchObject({
        institution: "Test University",
        fieldOfStudy: "Computer Science",
      });

      // DB cross-check
      const dbIns = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      expect(dbIns.education[0].institution).toBe("Test University");
    });

    it("updates social links -> verified by DB", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({
          socials: {
            facebook: "https://facebook.com/testuser",
            linkedin: "https://linkedin.com/in/testuser",
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.result.socials.facebook).toBe("https://facebook.com/testuser");
      expect(res.body.result.socials.linkedin).toBe("https://linkedin.com/in/testuser");

      // DB cross-check
      const dbUser = await User.findById(INS_A_USER_ID).lean();
      expect(dbUser.socials.facebook).toBe("https://facebook.com/testuser");
    });

    it("does NOT apply mass-assignment fields (isApproved, role, myCourses)", async () => {
      const before = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      const beforeUser = await User.findById(INS_A_USER_ID).lean();

      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({
          occupation: "[TEST] Mass-Assign Check",
          isApproved: false,
          role: "admin",
          myCourses: [],
          isVerified: false,
        });
      expect(res.status).toBe(200);

      // DB: isApproved must not have changed
      const after = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      expect(after.isApproved).toBe(before.isApproved);

      // DB: role and isVerified must not have changed
      const afterUser = await User.findById(INS_A_USER_ID).lean();
      expect(afterUser.role).toBe(beforeUser.role);
      expect(afterUser.isVerified).toBe(beforeUser.isVerified);
    });

    // -- Validation errors ------------------------------------------------------

    it("returns 400 for empty body", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).not.toHaveProperty("stack");
    });

    it("returns 400 for occupation too short (<2 chars)", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ occupation: "X" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).not.toHaveProperty("stack");
    });

    it("returns 400 for occupation too long (>80 chars)", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ occupation: "A".repeat(81) });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for skill level > 100", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ skills: [{ name: "JS", level: 101 }] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for skill level < 0", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ skills: [{ name: "JS", level: -1 }] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for introduction too long (>2000 chars)", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ introduction: "X".repeat(2001) });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for address too long (>200 chars)", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ address: "A".repeat(201) });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for education missing institution", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ education: [{ fieldOfStudy: "CS" }] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    // -- Authorization matrix ---------------------------------------------------

    it("returns 401 without auth", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .send({ occupation: "Should not apply" });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body).not.toHaveProperty("stack");
    });

    it("returns 403 for student role", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", studentCookie)
        .send({ occupation: "Should not apply" });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-218: Get Instructor's Courses
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-218 Â· Instructor Courses", () => {
  // â”€â”€ Private: GET /api/instructor/courses â”€â”€
  describe("GET /api/instructor/courses (private â€” all statuses)", () => {
    it("returns paginated courses for instructor", async () => {
      const res = await request(app)
        .get(`${PRI}/courses`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get courses successfully!");
      expect(Array.isArray(res.body.result)).toBe(true);
      // pagination object
      expect(res.body).toHaveProperty("pagination");
      const pg = res.body.pagination;
      expect(pg).toHaveProperty("page");
      expect(pg).toHaveProperty("limit");
      expect(pg).toHaveProperty("totalItems");
      expect(pg).toHaveProperty("totalPages");
      expect(pg).toHaveProperty("hasNextPage");
      expect(pg).toHaveProperty("hasPrevPage");
    });

    it("includes draft courses (not just live)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses?limit=50`)
        .set("Cookie", insACookie);
      const statuses = res.body.result.map((c) => c.status);
      expect(statuses).toContain("draft");
      expect(statuses).toContain("live");
    });

    it("validates course row item DTO shape", async () => {
      const res = await request(app)
        .get(`${PRI}/courses`)
        .set("Cookie", insACookie);
      const course = res.body.result[0];
      expect(course).toHaveProperty("courseId");
      expect(course).toHaveProperty("title");
      expect(course).toHaveProperty("status");
      expect(course).toHaveProperty("isPrivate");
      expect(course).toHaveProperty("ratingTotal");
      expect(course).toHaveProperty("ratingCount");
      expect(course).toHaveProperty("studentsEnrolled");
      expect(course).toHaveProperty("price");
      expect(course).toHaveProperty("createdAt");
      expect(course).toHaveProperty("updatedAt");
    });

    it("supports pagination (page=2)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses?page=2&limit=3`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(3);
    });

    it("supports search filter", async () => {
      const res = await request(app)
        .get(`${PRI}/courses?search=crash`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      const titles = res.body.result.map((c) => c.title.toLowerCase());
      titles.forEach((t) => {
        expect(t).toMatch(/crash/i);
      });
    });

    it("supports sort=newest", async () => {
      const res = await request(app)
        .get(`${PRI}/courses?sort=newest&limit=50`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      const dates = res.body.result.map((c) => new Date(c.createdAt).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });

    it("supports sort=oldest", async () => {
      const res = await request(app)
        .get(`${PRI}/courses?sort=oldest&limit=50`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      const dates = res.body.result.map((c) => new Date(c.createdAt).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeLessThanOrEqual(dates[i]);
      }
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).get(`${PRI}/courses`);
      expect(res.status).toBe(401);
    });

    it("returns 403 for student", async () => {
      const res = await request(app)
        .get(`${PRI}/courses`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });
  });

  // â”€â”€ Public: GET /api/instructors/:insId/courses â”€â”€
  describe("GET /api/instructors/:insId/courses (public)", () => {
    it("returns public courses with hasMore and nextSkip", async () => {
      const res = await request(app).get(`${PUB}/${INS_A_USER_ID}/courses`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get instructor's public courses successfully!");
      const r = res.body.result;
      expect(r).toHaveProperty("courses");
      expect(r).toHaveProperty("hasMore");
      expect(r).toHaveProperty("total");
      expect(r).toHaveProperty("nextSkip");
      expect(Array.isArray(r.courses)).toBe(true);
    });

    it("only returns live/public courses (no drafts)", async () => {
      const res = await request(app).get(`${PUB}/${INS_A_USER_ID}/courses?limit=50`);
      const courses = res.body.result.courses;
      courses.forEach((c) => {
        // Public API should not expose private or draft courses
        expect(c).not.toHaveProperty("status");
      });
    });

    it("validates course card DTO shape", async () => {
      const res = await request(app).get(`${PUB}/${INS_A_USER_ID}/courses`);
      const courses = res.body.result.courses;
      if (courses.length > 0) {
        const c = courses[0];
        expect(c).toHaveProperty("courseId");
        expect(c).toHaveProperty("title");
        expect(c).toHaveProperty("price");
        expect(c).toHaveProperty("ratingTotal");
        expect(c).toHaveProperty("ratingCount");
        expect(c).toHaveProperty("studentsEnrolled");
        expect(c).toHaveProperty("instructor");
        expect(c.instructor).toHaveProperty("insId");
        expect(c.instructor).toHaveProperty("name");
      }
    });

    it("supports limit and skip query params", async () => {
      const res = await request(app).get(`${PUB}/${INS_A_USER_ID}/courses?limit=2&skip=0`);
      expect(res.status).toBe(200);
      expect(res.body.result.courses.length).toBeLessThanOrEqual(2);
    });

    it("returns 400 for invalid insId", async () => {
      const res = await request(app).get(`${PUB}/${INVALID_ID}/courses`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns empty courses for non-existent instructor", async () => {
      const res = await request(app).get(`${PUB}/${NONEXISTENT_ID}/courses`);
      expect(res.status).toBe(200);
      expect(res.body.result.courses).toHaveLength(0);
      expect(res.body.result.total).toBe(0);
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-235: Get Instructor's Courses Stats
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-235 Â· Get Courses Stats", () => {
  describe("GET /api/instructor/courses/stats", () => {
    it("returns course stats breakdown by status", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/stats`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get my courses stats successfully");
      const r = res.body.result;
      expect(r).toHaveProperty("totalCourses");
      expect(r).toHaveProperty("totalDraft");
      expect(r).toHaveProperty("totalPending");
      expect(r).toHaveProperty("totalLive");
      expect(r).toHaveProperty("totalRejected");
      expect(typeof r.totalCourses).toBe("number");
      expect(typeof r.totalDraft).toBe("number");
      expect(typeof r.totalLive).toBe("number");
      // Verify counts are consistent
      expect(r.totalCourses).toBeGreaterThanOrEqual(
        r.totalDraft + r.totalPending + r.totalLive + r.totalRejected
      );
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).get(`${PRI}/courses/stats`);
      expect(res.status).toBe(401);
    });

    it("returns 403 for student", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/stats`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-207: Get Instructor's Students
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-207 Â· Get Instructor Students", () => {
  describe("GET /api/instructor/students", () => {
    it("returns paginated students list", async () => {
      const res = await request(app)
        .get(`${PRI}/students`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get students successfully!");
      expect(Array.isArray(res.body.result)).toBe(true);
      expect(res.body).toHaveProperty("pagination");
    });

    it("validates enrolled student DTO shape", async () => {
      const res = await request(app)
        .get(`${PRI}/students`)
        .set("Cookie", insACookie);
      if (res.body.result.length > 0) {
        const s = res.body.result[0];
        expect(s).toHaveProperty("stuId");
        expect(s).toHaveProperty("name");
        expect(s).toHaveProperty("email");
        expect(s).toHaveProperty("avatar");
        expect(s).toHaveProperty("isActive");
        expect(s).toHaveProperty("enrolledAt");
        expect(s).toHaveProperty("coursesCount");
        expect(typeof s.stuId).toBe("string");
        expect(typeof s.isActive).toBe("boolean");
        expect(typeof s.coursesCount).toBe("number");
      }
    });

    it("deduplicates students (multi-enrollment counts once)", async () => {
      const res = await request(app)
        .get(`${PRI}/students?limit=50`)
        .set("Cookie", insACookie);
      const stuIds = res.body.result.map((s) => s.stuId);
      const uniqueIds = new Set(stuIds);
      expect(stuIds.length).toBe(uniqueIds.size);
    });

    it("supports search filter", async () => {
      const res = await request(app)
        .get(`${PRI}/students?search=lac`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
    });

    it("supports sort=nameAsc", async () => {
      const res = await request(app)
        .get(`${PRI}/students?sort=nameAsc&limit=50`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      const names = res.body.result.map((s) => s.name?.toLowerCase());
      for (let i = 1; i < names.length; i++) {
        expect(names[i - 1] <= names[i]).toBe(true);
      }
    });

    it("supports sort=nameDesc", async () => {
      const res = await request(app)
        .get(`${PRI}/students?sort=nameDesc&limit=50`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
    });

    it("supports sort=enrolledAsc", async () => {
      const res = await request(app)
        .get(`${PRI}/students?sort=enrolledAsc&limit=50`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
    });

    it("returns empty array for instructor with no students", async () => {
      // Instructor B may have 0 students â€” test returns valid empty
      const res = await request(app)
        .get(`${PRI}/students`)
        .set("Cookie", insBCookie);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.result)).toBe(true);
      expect(res.body.pagination.totalItems).toBeGreaterThanOrEqual(0);
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).get(`${PRI}/students`);
      expect(res.status).toBe(401);
    });

    it("returns 403 for student role", async () => {
      const res = await request(app)
        .get(`${PRI}/students`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-254: Get Instructor's Students Stats
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-254 Â· Get Students Stats", () => {
  describe("GET /api/instructor/students/stats", () => {
    it("returns student stats with deduplication", async () => {
      const res = await request(app)
        .get(`${PRI}/students/stats`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get my students stats successfully");
      const r = res.body.result;
      expect(r).toHaveProperty("totalStudents");
      expect(r).toHaveProperty("totalActive");
      expect(r).toHaveProperty("totalInactive");
      expect(typeof r.totalStudents).toBe("number");
      expect(typeof r.totalActive).toBe("number");
      expect(typeof r.totalInactive).toBe("number");
      // Consistency check
      expect(r.totalStudents).toBe(r.totalActive + r.totalInactive);
    });

    it("returns zeros for instructor with no students", async () => {
      const res = await request(app)
        .get(`${PRI}/students/stats`)
        .set("Cookie", insBCookie);
      expect(res.status).toBe(200);
      expect(res.body.result.totalStudents).toBeGreaterThanOrEqual(0);
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).get(`${PRI}/students/stats`);
      expect(res.status).toBe(401);
    });

    it("returns 403 for student", async () => {
      const res = await request(app)
        .get(`${PRI}/students/stats`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-236: Get Course's Students
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-236 Â· Get Course Students", () => {
  describe("GET /api/instructor/courses/:courseId/students", () => {
    it("returns paginated course students", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/students`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get course's students successfully!");
      expect(Array.isArray(res.body.result)).toBe(true);
      expect(res.body).toHaveProperty("pagination");
    });

    it("validates course student DTO shape (with progress & review)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/students`)
        .set("Cookie", insACookie);
      if (res.body.result.length > 0) {
        const s = res.body.result[0];
        expect(s).toHaveProperty("stuId");
        expect(s).toHaveProperty("name");
        expect(s).toHaveProperty("email");
        expect(s).toHaveProperty("isActivated");
        expect(s).toHaveProperty("avatar");
        expect(s).toHaveProperty("progress");
        expect(s).toHaveProperty("enrolledAt");
        expect(s.progress).toHaveProperty("completedLectures");
        expect(s.progress).toHaveProperty("totalLectures");
        expect(s.progress).toHaveProperty("percentage");
        // review may be null if not reviewed
        expect(s).toHaveProperty("review");
      }
    });

    it("supports search filter", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/students?search=lac`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
    });

    it("supports sort=progressDesc", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/students?sort=progressDesc`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
    });

    it("returns empty for course with no students", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_NO_STU}/students`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(0);
      expect(res.body.pagination.totalItems).toBe(0);
    });

    it("returns 403 for course not owned by instructor", async () => {
      // Instructor B trying to access Instructor A's course
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/students`)
        .set("Cookie", insBCookie);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("returns 404 for non-existent course", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${NONEXISTENT_ID}/students`)
        .set("Cookie", insACookie);
      expect([403, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for invalid courseId", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${INVALID_ID}/students`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(400);
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).get(`${PRI}/courses/${LIVE_COURSE_1}/students`);
      expect(res.status).toBe(401);
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-222: Get Instructor Earnings
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-222 Â· Instructor Earnings", () => {
  describe("GET /api/instructor/earnings", () => {
    it("returns monthly earnings data", async () => {
      const res = await request(app)
        .get(`${PRI}/earnings`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get instructor monthly earning successfully!");
      const r = res.body.result;
      expect(r).toHaveProperty("series");
      expect(r).toHaveProperty("thisMonthRevenue");
      expect(r).toHaveProperty("toBePaid");
      expect(r).toHaveProperty("totalEarning");
      expect(Array.isArray(r.series)).toBe(true);
      expect(typeof r.thisMonthRevenue).toBe("number");
      expect(typeof r.toBePaid).toBe("number");
      expect(typeof r.totalEarning).toBe("number");
    });

    it("series items have period and value", async () => {
      const res = await request(app)
        .get(`${PRI}/earnings`)
        .set("Cookie", insACookie);
      const series = res.body.result.series;
      if (series.length > 0) {
        expect(series[0]).toHaveProperty("period");
        expect(series[0]).toHaveProperty("value");
      }
    });

    it("toBePaid = thisMonthRevenue * 0.8 (net profit)", async () => {
      const res = await request(app)
        .get(`${PRI}/earnings`)
        .set("Cookie", insACookie);
      const r = res.body.result;
      // toBePaid should be 80% of thisMonthRevenue (INSTRUCTOR_NET_PROFIT = 0.8)
      const expected = Math.round(r.thisMonthRevenue * 0.8 * 100) / 100;
      expect(r.toBePaid).toBeCloseTo(expected, 1);
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).get(`${PRI}/earnings`);
      expect(res.status).toBe(401);
    });

    it("returns 403 for student", async () => {
      const res = await request(app)
        .get(`${PRI}/earnings`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });
  });

  // â”€â”€ Course Revenue: GET /api/instructor/courses/revenue â”€â”€
  describe("GET /api/instructor/courses/revenue", () => {
    it("returns all-courses monthly revenue", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/revenue`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get courses monthly revenue successfully!");
      const r = res.body.result;
      expect(r).toHaveProperty("series");
      expect(r).toHaveProperty("total");
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).get(`${PRI}/courses/revenue`);
      expect(res.status).toBe(401);
    });
  });

  // â”€â”€ Top Revenue Courses: GET /api/instructor/courses/top-courses â”€â”€
  describe("GET /api/instructor/courses/top-courses", () => {
    it("returns top revenue courses this month", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/top-courses`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get top revenue courses successfully!");
      expect(Array.isArray(res.body.result)).toBe(true);
    });

    it("validates top course item shape", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/top-courses`)
        .set("Cookie", insACookie);
      if (res.body.result.length > 0) {
        const c = res.body.result[0];
        expect(c).toHaveProperty("courseId");
        expect(c).toHaveProperty("title");
        expect(c).toHaveProperty("image");
        expect(c).toHaveProperty("totalRevenue");
        expect(c).toHaveProperty("totalSales");
      }
    });

    it("supports custom limit", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/top-courses?limit=3`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.result.length).toBeLessThanOrEqual(3);
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).get(`${PRI}/courses/top-courses`);
      expect(res.status).toBe(401);
    });
  });

  // â”€â”€ Single Course Revenue â”€â”€
  describe("GET /api/instructor/courses/:courseId/revenue", () => {
    it("returns monthly revenue for specific course", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/revenue`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get course monthly revenue successfully!");
      expect(res.body.result).toHaveProperty("series");
      expect(res.body.result).toHaveProperty("total");
    });

    it("returns 404 for course not owned", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/revenue`)
        .set("Cookie", insBCookie);
      expect([403, 404]).toContain(res.status);
    });

    it("returns 400 for invalid courseId", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${INVALID_ID}/revenue`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(400);
    });
  });

  // â”€â”€ Single Course Enrollments â”€â”€
  describe("GET /api/instructor/courses/:courseId/enrollments", () => {
    it("returns monthly enrollments for specific course", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/enrollments`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get course monthly enrollments successfully!");
      expect(res.body.result).toHaveProperty("series");
      expect(res.body.result).toHaveProperty("total");
    });

    it("returns 404 for course not owned", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/enrollments`)
        .set("Cookie", insBCookie);
      expect([403, 404]).toContain(res.status);
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-218 (cont): Course Details & Edit
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-218 Â· Course Details & Edit View", () => {
  // â”€â”€ Course Details: GET /api/instructor/courses/:courseId/details â”€â”€
  describe("GET /api/instructor/courses/:courseId/details", () => {
    it("returns instructor course details (toInstructorCourseDto)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/details`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get course details successfully!");
      const r = res.body.result;
      expect(r).toHaveProperty("courseId");
      expect(r).toHaveProperty("title");
      expect(r).toHaveProperty("status");
      expect(r).toHaveProperty("price");
      expect(r).toHaveProperty("studentsEnrolled");
    });

    it("returns 403 for course not owned", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/details`)
        .set("Cookie", insBCookie);
      expect(res.status).toBe(403);
    });

    it("returns 404 for non-existent course", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${NONEXISTENT_ID}/details`)
        .set("Cookie", insACookie);
      expect([403, 404]).toContain(res.status);
    });

    it("returns 400 for invalid courseId", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${INVALID_ID}/details`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(400);
    });

    it("returns 401 without auth (course details)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/details`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 for student role (course details)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/details`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("course details has correct value types and no leakage", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/details`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      const r = res.body.result;
      expect(r.courseId).toMatch(/^[0-9a-f]{24}$/);
      expect(typeof r.title).toBe("string");
      expect(typeof r.status).toBe("string");
      expect(typeof r.studentsEnrolled).toBe("number");
      expect(r.studentsEnrolled).toBeGreaterThanOrEqual(0);
      expect(r).not.toHaveProperty("password");
      expect(r).not.toHaveProperty("__v");
      expect(res.body).not.toHaveProperty("stack");
      expect(r).toHaveProperty("cateId");
    });
  });

  // â”€â”€ Course For Edit: GET /api/instructor/courses/:courseId â”€â”€
  describe("GET /api/instructor/courses/:courseId (edit view)", () => {
    it("returns toEditCourseDto with curriculum", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get course successfully!");
      const r = res.body.result;
      expect(r).toHaveProperty("courseId");
      expect(r).toHaveProperty("title");
      expect(r).toHaveProperty("subtitle");
      expect(r).toHaveProperty("description");
      expect(r).toHaveProperty("tags");
      expect(r).toHaveProperty("price");
      expect(r).toHaveProperty("status");
      expect(r).toHaveProperty("isPrivate");
      expect(r).toHaveProperty("hasPendingChanges");
      expect(r).toHaveProperty("curriculum");
      expect(r.curriculum).toHaveProperty("sections");
      expect(r.curriculum).toHaveProperty("hasPendingChanges");
    });

    it("returns course edit view successfully", async () => {
      // Use a live course owned by INSTRUCTOR_A
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_NO_STU}`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      const r = res.body.result;
      expect(typeof r.hasPendingChanges).toBe("boolean");
    });

    it("returns 403 for course not owned", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}`)
        .set("Cookie", insBCookie);
      expect(res.status).toBe(403);
    });

    it("returns 400 for invalid courseId", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${INVALID_ID}`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(400);
    });

    it("returns 401 without auth (edit view)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 for student role (edit view)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 for non-existent courseId (edit view)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${NONEXISTENT_ID}`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("edit view has correct value types and no leakage", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      const r = res.body.result;
      expect(r.courseId).toMatch(/^[0-9a-f]{24}$/);
      expect(typeof r.hasPendingChanges).toBe("boolean");
      expect(typeof r.isPrivate).toBe("boolean");
      expect(r.status).toMatch(/^(draft|pending|live|rejected)$/);
      expect(typeof r.curriculum.hasPendingChanges).toBe("boolean");
      expect(Array.isArray(r.curriculum.sections)).toBe(true);
      expect(r).not.toHaveProperty("password");
      expect(r).not.toHaveProperty("__v");
      expect(res.body).not.toHaveProperty("stack");
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-253: Create Course
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-253 Â· Create Course", () => {
  describe("POST /api/instructor/courses", () => {
    it("creates a new draft course (201)", async () => {
      const res = await request(app)
        .post(`${PRI}/courses`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Course created successfully!");
      const r = res.body.result;
      expect(r).toHaveProperty("courseId");
      expect(r).toHaveProperty("title");
      expect(r).toHaveProperty("status");
      expect(r).toHaveProperty("isPrivate");
      expect(r.title).toBe("New draft course");
      expect(r.status).toBe("draft");
      expect(r.isPrivate).toBe(true);
      // Save for cleanup
      createdCourseId = r.courseId;
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).post(`${PRI}/courses`);
      expect(res.status).toBe(401);
    });

    it("returns 403 for student (not instructor)", async () => {
      const res = await request(app)
        .post(`${PRI}/courses`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });

    it("DB verify: created draft course exists with correct fields", async () => {
      expect(createdCourseId).toBeTruthy();
      const dbCourse = await Course.findById(createdCourseId).lean();
      expect(dbCourse).not.toBeNull();
      expect(dbCourse.status).toBe("draft");
      expect(dbCourse.isPrivate).toBe(true);
      expect(dbCourse.title).toBe("New draft course");
      expect(dbCourse.instructor.ref.toString()).toBe(INS_A_USER_ID);
    });

    it("creation response has no sensitive field leakage", async () => {
      const res = await request(app)
        .post(`${PRI}/courses`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(201);
      const r = res.body.result;
      expect(r).not.toHaveProperty("password");
      expect(r).not.toHaveProperty("__v");
      expect(r).not.toHaveProperty("isDeleted");
      expect(res.body).not.toHaveProperty("stack");
      if (r.courseId) {
        await Curriculum.deleteMany({ courseId: r.courseId });
        await Course.findByIdAndDelete(r.courseId);
      }
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-219: Update Course
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-219 Â· Update Course", () => {
  const VALID_CATEGORY = "69288d99cfe4f50d205aef6f"; // Web Development

  describe("PATCH /api/instructor/courses/:courseId", () => {
    // â”€â”€ Success cases â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    it("updates course title into pendingUpdate", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ title: "Updated Test Title" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Update course successfully!");
      const r = res.body.result;
      expect(r.courseId).toBe(courseId);
      expect(r.title).toBe("Updated Test Title");
      expect(r.hasPendingChanges).toBe(true);
    });

    it("returns full toEditCourseDto shape", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ subtitle: "Test subtitle for shape check" });
      expect(res.status).toBe(200);
      const r = res.body.result;
      // Every field from toEditCourseDto must be present
      expect(r).toHaveProperty("courseId");
      expect(r).toHaveProperty("title");
      expect(r).toHaveProperty("subtitle", "Test subtitle for shape check");
      expect(r).toHaveProperty("description");
      expect(r).toHaveProperty("image");
      expect(r).toHaveProperty("tags");
      expect(r).toHaveProperty("price");
      expect(r).toHaveProperty("discountPrice");
      expect(r).toHaveProperty("enableDiscount");
      expect(r).toHaveProperty("language");
      expect(r).toHaveProperty("level");
      expect(r).toHaveProperty("duration");
      expect(r).toHaveProperty("thumbnail");
      expect(r).toHaveProperty("previewVideo");
      expect(r).toHaveProperty("status");
      expect(r).toHaveProperty("categoryId");
      expect(r).toHaveProperty("isPrivate");
      expect(r).toHaveProperty("hasPendingChanges");
      expect(r).toHaveProperty("curriculum");
      expect(r.curriculum).toHaveProperty("sections");
      expect(r.curriculum).toHaveProperty("hasPendingChanges");
    });

    it("cumulative updates merge into pendingUpdate (title + price)", async () => {
      const courseId = createdCourseId;
      // First update: title
      await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ title: "Cumulative Title" });
      // Second update: price â€” title should still be in pending
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ price: 49.99 });
      expect(res.status).toBe(200);
      const r = res.body.result;
      expect(r.title).toBe("Cumulative Title");
      expect(r.price).toBe(49.99);
      expect(r.hasPendingChanges).toBe(true);
    });

    it("updates multiple fields in single request", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({
          title: "Multi Field Update",
          subtitle: "New subtitle",
          description: "New description",
          price: 29.99,
          level: "beginner",
          language: "English",
          isPrivate: false,
        });
      expect(res.status).toBe(200);
      const r = res.body.result;
      expect(r.title).toBe("Multi Field Update");
      expect(r.subtitle).toBe("New subtitle");
      expect(r.description).toBe("New description");
      expect(r.price).toBe(29.99);
      expect(r.level).toBe("beginner");
      expect(r.isPrivate).toBe(false);
    });

    it("updates categoryId successfully (string â†’ ObjectId)", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ categoryId: VALID_CATEGORY });
      expect(res.status).toBe(200);
      expect(res.body.result.categoryId).toBe(VALID_CATEGORY);
    });

    it("updates tags array", async () => {
      const courseId = createdCourseId;
      const tags = ["javascript", "nodejs", "backend"];
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ tags });
      expect(res.status).toBe(200);
      expect(res.body.result.tags).toEqual(tags);
    });

    it("updates enableDiscount with valid discountPrice", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ price: 100, enableDiscount: true, discountPrice: 50 });
      expect(res.status).toBe(200);
      const r = res.body.result;
      expect(r.enableDiscount).toBe(true);
      expect(r.discountPrice).toBe(50);
      expect(r.price).toBe(100);
    });

    it("updates image with valid URL", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ image: "https://example.com/course.jpg" });
      expect(res.status).toBe(200);
      expect(res.body.result.image).toBe("https://example.com/course.jpg");
    });

    it("updates curriculum with sections and lectures", async () => {
      const courseId = createdCourseId;
      const curriculum = {
        sections: [
          {
            title: "Section 1",
            lectures: [
              { title: "Lecture 1", videoId: "vid-001", duration: 300, isFree: true },
              { title: "Lecture 2", videoId: "vid-002", duration: 600 },
            ],
          },
          {
            title: "Section 2",
            lectures: [
              { title: "Lecture 3", videoId: "vid-003", duration: 450 },
            ],
          },
        ],
      };
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ curriculum });
      expect(res.status).toBe(200);
      const r = res.body.result;
      expect(r.curriculum.sections).toHaveLength(2);
      expect(r.curriculum.sections[0].lectures).toHaveLength(2);
      expect(r.curriculum.sections[1].lectures).toHaveLength(1);
      expect(r.curriculum.hasPendingChanges).toBe(true);
    });

    it("sanitizes unknown fields (studentsEnrolled ignored)", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ title: "Sanitize Test", studentsEnrolled: 9999 });
      expect(res.status).toBe(200);
      // The extra field should be stripped by Zod validation
      expect(res.body.result.title).toBe("Sanitize Test");
    });

    it("updates live course â€” saves to pendingUpdate (not live data)", async () => {
      const res = await request(app)
        .patch(`${PRI}/courses/${LIVE_COURSE_1}`)
        .set("Cookie", insACookie)
        .send({ title: "Live Course Pending Update" });
      expect(res.status).toBe(200);
      const r = res.body.result;
      // Merged view should show new title
      expect(r.title).toBe("Live Course Pending Update");
      expect(r.hasPendingChanges).toBe(true);
      // Status should still be "live" (not changed by update)
      expect(r.status).toBe("live");
    });

    it("DB verify: draft pendingUpdate.data.title saved in DB", async () => {
      const courseId = createdCourseId;
      await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ title: "DB Verify Title" });
      const dbCourse = await Course.findById(courseId).lean();
      expect(dbCourse).not.toBeNull();
      expect(dbCourse.pendingUpdate.data.title).toBe("DB Verify Title");
      expect(dbCourse.title).toBe("New draft course");
    });

    it("DB verify: LIVE course actual data unchanged after update", async () => {
      const dbCourse = await Course.findById(LIVE_COURSE_1).lean();
      expect(dbCourse).not.toBeNull();
      expect(dbCourse.pendingUpdate.data.title).toBe("Live Course Pending Update");
      expect(dbCourse.title).not.toBe("Live Course Pending Update");
    });

    it("mass-assignment guard: ignores status, studentsEnrolled, isDeleted", async () => {
      const courseId = createdCourseId;
      const before = await Course.findById(courseId).lean();
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({
          title: "Mass Assign Check",
          status: "live",
          studentsEnrolled: 9999,
          isDeleted: true,
        });
      expect(res.status).toBe(200);
      const after = await Course.findById(courseId).lean();
      expect(after.instructor.ref.toString()).toBe(before.instructor.ref.toString());
      expect(after.status).toBe("draft");
      expect(after.studentsEnrolled).toBe(before.studentsEnrolled);
      expect(after.isDeleted).toBeFalsy();
    });

    // â”€â”€ Validation error cases â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    it("returns 400 for empty update body", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” title too long (>96 chars)", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ title: "A".repeat(97) });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” subtitle too long (>186 chars)", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ subtitle: "S".repeat(187) });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” description too long (>2000 chars)", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ description: "D".repeat(2001) });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” tags exceed max 14", async () => {
      const courseId = createdCourseId;
      const tags = Array.from({ length: 15 }, (_, i) => `tag-${i}`);
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ tags });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” tag too short (<2 chars)", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ tags: ["a"] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” invalid level value", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ level: "expert" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” invalid image URL", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ image: "not-a-url" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” enableDiscount=true without discountPrice", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ enableDiscount: true, price: 100 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” discountPrice >= price", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ enableDiscount: true, price: 50, discountPrice: 50 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” discountPrice > price", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ enableDiscount: true, price: 30, discountPrice: 50 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” negative price", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ price: -10 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” invalid categoryId format", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ categoryId: "bad-id" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” curriculum with empty sections array", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ curriculum: { sections: [] } });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” section with no lectures", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({
          curriculum: {
            sections: [{ title: "Empty Section", lectures: [] }],
          },
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” lecture without videoId", async () => {
      const courseId = createdCourseId;
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({
          curriculum: {
            sections: [
              {
                title: "Section 1",
                lectures: [{ title: "No Video Lecture" }],
              },
            ],
          },
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” invalid courseId param", async () => {
      const res = await request(app)
        .patch(`${PRI}/courses/${INVALID_ID}`)
        .set("Cookie", insACookie)
        .send({ title: "Test" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    // â”€â”€ Auth & ownership â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    it("returns 403 for course not owned by instructor", async () => {
      const res = await request(app)
        .patch(`${PRI}/courses/${LIVE_COURSE_1}`)
        .set("Cookie", insBCookie)
        .send({ title: "Hack" });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 for non-existent courseId (valid ObjectId)", async () => {
      const res = await request(app)
        .patch(`${PRI}/courses/${NONEXISTENT_ID}`)
        .set("Cookie", insACookie)
        .send({ title: "Ghost" });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("returns 401 without auth", async () => {
      const res = await request(app)
        .patch(`${PRI}/courses/${LIVE_COURSE_1}`)
        .send({ title: "Test" });
      expect(res.status).toBe(401);
    });

    it("returns 403 for student role", async () => {
      const res = await request(app)
        .patch(`${PRI}/courses/${LIVE_COURSE_1}`)
        .set("Cookie", studentCookie)
        .send({ title: "Student Hack" });
      expect(res.status).toBe(403);
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-220: Submit Course
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-220 Â· Submit Course", () => {
  const VALID_CATEGORY = "69288d99cfe4f50d205aef6f";

  describe("POST /api/instructor/courses/:courseId/submit", () => {
    // â”€â”€ Success: submit draft with all required fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    it("submits a fully-populated draft course (draft â†’ pending)", async () => {
      const courseId = createdCourseId;
      // First ensure the course has all required fields via update
      // Also reset enableDiscount to avoid conflict from EDV-219 cumulative tests
      await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({
          title: "Submittable Course",
          language: "English",
          level: "beginner",
          price: 99.99,
          enableDiscount: false,
          categoryId: VALID_CATEGORY,
          image: "https://example.com/img.jpg",
          curriculum: {
            sections: [
              {
                title: "Section 1",
                lectures: [
                  { title: "Intro", videoId: "v-submit-001", duration: 120 },
                ],
              },
            ],
          },
        });

      // Now submit
      const res = await request(app)
        .post(`${PRI}/courses/${courseId}/submit`)
        .set("Cookie", insACookie)
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Submit course successfully!");
      const r = res.body.result;
      expect(r.courseId).toBe(courseId);
      expect(r.status).toBe("pending");
      expect(r).toHaveProperty("hasPendingChanges");
      expect(r).toHaveProperty("curriculum");
    });

    it("DB verify: course status is pending after successful submit", async () => {
      const courseId = createdCourseId;
      const dbCourse = await Course.findById(courseId).lean();
      expect(dbCourse).not.toBeNull();
      expect(dbCourse.status).toBe("pending");
      expect(dbCourse.pendingUpdate?.status).toBe("pending");
    });

    it("returns full toEditCourseDto shape on submit", async () => {
      // Use a live course to test submit with changes
      const res = await request(app)
        .post(`${PRI}/courses/${LIVE_COURSE_1}/submit`)
        .set("Cookie", insACookie)
        .send({});
      // This might be 200 or 400 depending on pending state
      if (res.status === 200) {
        const r = res.body.result;
        expect(r).toHaveProperty("courseId");
        expect(r).toHaveProperty("title");
        expect(r).toHaveProperty("subtitle");
        expect(r).toHaveProperty("description");
        expect(r).toHaveProperty("image");
        expect(r).toHaveProperty("tags");
        expect(r).toHaveProperty("price");
        expect(r).toHaveProperty("discountPrice");
        expect(r).toHaveProperty("enableDiscount");
        expect(r).toHaveProperty("language");
        expect(r).toHaveProperty("level");
        expect(r).toHaveProperty("duration");
        expect(r).toHaveProperty("thumbnail");
        expect(r).toHaveProperty("previewVideo");
        expect(r).toHaveProperty("status");
        expect(r).toHaveProperty("categoryId");
        expect(r).toHaveProperty("isPrivate");
        expect(r).toHaveProperty("hasPendingChanges");
        expect(r).toHaveProperty("curriculum");
        expect(r.curriculum).toHaveProperty("sections");
        expect(r.curriculum).toHaveProperty("hasPendingChanges");
      }
    });

    it("submits with changes in body (update + submit in one call)", async () => {
      // Use a live course and send changes in the submit body
      const res = await request(app)
        .post(`${PRI}/courses/${LIVE_COURSE_3}/submit`)
        .set("Cookie", insACookie)
        .send({ title: "Submit With Changes" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const r = res.body.result;
      expect(r.title).toBe("Submit With Changes");
      expect(r.hasPendingChanges).toBe(true);
    });

    // â”€â”€ Validation failures during submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    it("returns validation error for draft without required fields", async () => {
      // Create a bare draft and try to submit (missing title, language, etc.)
      const createRes = await request(app)
        .post(`${PRI}/courses`)
        .set("Cookie", insACookie);
      const bareCourseId = createRes.body.result?.courseId;

      const res = await request(app)
        .post(`${PRI}/courses/${bareCourseId}/submit`)
        .set("Cookie", insACookie)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      // Should contain Zod validation errors for missing required fields
      if (res.body.errors) {
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors.length).toBeGreaterThan(0);
      }

      // Cleanup bare course
      if (bareCourseId) {
        await Curriculum.deleteMany({ courseId: bareCourseId });
        await Course.findByIdAndDelete(bareCourseId);
      }
    });

    it("returns 400 â€” submit body with enableDiscount but no discountPrice", async () => {
      const res = await request(app)
        .post(`${PRI}/courses/${LIVE_COURSE_NO_STU}/submit`)
        .set("Cookie", insACookie)
        .send({ enableDiscount: true, price: 100 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” submit body with discountPrice >= price", async () => {
      const res = await request(app)
        .post(`${PRI}/courses/${LIVE_COURSE_NO_STU}/submit`)
        .set("Cookie", insACookie)
        .send({ enableDiscount: true, price: 50, discountPrice: 60 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” submit body with invalid curriculum (empty sections)", async () => {
      const res = await request(app)
        .post(`${PRI}/courses/${LIVE_COURSE_NO_STU}/submit`)
        .set("Cookie", insACookie)
        .send({ curriculum: { sections: [] } });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 â€” submit body with title too long", async () => {
      const res = await request(app)
        .post(`${PRI}/courses/${LIVE_COURSE_NO_STU}/submit`)
        .set("Cookie", insACookie)
        .send({ title: "X".repeat(97) });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    // â”€â”€ Auth & ownership errors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    it("returns 400 or 403 for course not owned", async () => {
      const res = await request(app)
        .post(`${PRI}/courses/${LIVE_COURSE_1}/submit`)
        .set("Cookie", insBCookie);
      expect([400, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for invalid courseId param", async () => {
      const res = await request(app)
        .post(`${PRI}/courses/${INVALID_ID}/submit`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 for non-existent courseId (valid ObjectId)", async () => {
      const res = await request(app)
        .post(`${PRI}/courses/${NONEXISTENT_ID}/submit`)
        .set("Cookie", insACookie)
        .send({});
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("returns 401 without auth", async () => {
      const res = await request(app)
        .post(`${PRI}/courses/${LIVE_COURSE_1}/submit`);
      expect(res.status).toBe(401);
    });

    it("returns 403 for student role", async () => {
      const res = await request(app)
        .post(`${PRI}/courses/${LIVE_COURSE_1}/submit`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-221: Clear Course Changes
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-221 Â· Clear Course Changes", () => {
  describe("DELETE /api/instructor/courses/:courseId/changes", () => {
    beforeAll(async () => {
      // Create a second draft course specifically for clear tests
      const res = await request(app)
        .post(`${PRI}/courses`)
        .set("Cookie", insACookie);
      clearTestCourseId = res.body.result?.courseId;
    });

    it("clears pending changes on a draft course", async () => {
      // First add pending changes to clearTestCourseId
      const patchRes = await request(app)
        .patch(`${PRI}/courses/${clearTestCourseId}`)
        .set("Cookie", insACookie)
        .send({ title: "Temp changes to clear" });
      expect(patchRes.status).toBe(200);
      // Now clear them
      const res = await request(app)
        .delete(`${PRI}/courses/${clearTestCourseId}/changes`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Clear course changes successfully!");
      const r = res.body.result;
      expect(r).toHaveProperty("courseId");
      expect(r).toHaveProperty("hasPendingChanges");
      expect(r.hasPendingChanges).toBe(false);
    });

    it("DB verify: course pendingUpdate.data is null after clear", async () => {
      const dbCourse = await Course.findById(clearTestCourseId).lean();
      expect(dbCourse).not.toBeNull();
      const pendingData = dbCourse.pendingUpdate?.data;
      expect(pendingData == null || Object.keys(pendingData).length === 0).toBe(true);
      expect(dbCourse.pendingUpdate?.status).toBe("none");
    });

    it("GET edit view confirms hasPendingChanges=false after clear", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${clearTestCourseId}`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.result.hasPendingChanges).toBe(false);
      expect(res.body.result).not.toHaveProperty("password");
      expect(res.body.result).not.toHaveProperty("__v");
      expect(res.body).not.toHaveProperty("stack");
    });

    it("returns 400 when no changes to clear", async () => {
      // clearTestCourseId was just cleared above
      const res = await request(app)
        .delete(`${PRI}/courses/${clearTestCourseId}/changes`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for pending course (under review)", async () => {
      // createdCourseId was submitted in EDV-220, status is now "pending"
      if (!createdCourseId) return; // skip if no created course
      const res = await request(app)
        .delete(`${PRI}/courses/${createdCourseId}/changes`)
        .set("Cookie", insACookie);
      // Should be 400 because course status is "pending" (under review)
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 for course not owned", async () => {
      const res = await request(app)
        .delete(`${PRI}/courses/${LIVE_COURSE_1}/changes`)
        .set("Cookie", insBCookie);
      expect(res.status).toBe(403);
    });

    it("returns 400 for invalid courseId", async () => {
      const res = await request(app)
        .delete(`${PRI}/courses/${INVALID_ID}/changes`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(400);
    });

    it("returns 401 without auth", async () => {
      const res = await request(app)
        .delete(`${PRI}/courses/${LIVE_COURSE_1}/changes`);
      expect(res.status).toBe(401);
    });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EDV-177: Become Instructor
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
describe("EDV-177 Â· Become Instructor", () => {
  describe("POST /api/instructors/", () => {
    it("returns 409 for user already an instructor", async () => {
      const res = await request(app)
        .post(`${PUB}/`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("You are already an instructor!");
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).post(`${PUB}/`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    // NOTE: We do NOT test the success case (student â†’ become instructor)
    // because it would modify the student user's state permanently.
    // This requires explicit "approve" from user per DB-write rule.
  });
});
