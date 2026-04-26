/**
 * STUDENT API Tests
 * Jira: EDV-206 (Update Profile), EDV-223 (Get Courses), EDV-233 (Courses Stats),
 *       EDV-234 (Student Stats), EDV-245 (Course Progress), EDV-246 (Update Lecture Progress),
 *       EDV-247 (Get Streak), EDV-248 (Update Streak), EDV-250 (Skill Radar)
 *
 * Fixtures:
 *   - STUDENT  : lacduongldg212@gmail.com (userId: 694d32d7ebe694fc49e59a67)
 *   - 15 active enrollments, 0 completed, Docker Essentials Advanced enrolled
 */
import request from "supertest";
import app from "../src/app.js";
import "../tests/setup.js";

const BASE = "/api/student";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const STUDENT    = { email: "lacduongldg212@gmail.com",       password: "Abc@12345" };
const INSTRUCTOR = { email: "22110304@student.hcmute.edu.vn", password: "Abc@12345" };

const ENROLLED_COURSE     = "694e8e85ed8f2ec45dc0d4ec"; // Docker Essentials Advanced
const NOT_ENROLLED_COURSE = "69501b5ed27dbaf7e24adb7e"; // Networking & Security (not enrolled)
const NONEXISTENT_ID      = "000000000000000000000001";
const SAMPLE_LECTURE_ID   = "69ae9101422b26f30f03858d"; // Real lecture in Docker Essentials

// ─── Helpers ──────────────────────────────────────────────────────────────────
let studentToken;
let instructorToken;

async function login(creds) {
  const res = await request(app).post("/api/auth/login").send(creds);
  const cookie = res.headers["set-cookie"]?.find((c) => c.startsWith("token="));
  return cookie || "";
}

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  studentToken    = await login(STUDENT);
  instructorToken = await login(INSTRUCTOR);
}, 30000);

const studentAuth = () => request(app).get("/").set("Cookie", studentToken);
// Helper to make authenticated requests
const get  = (path) => request(app).get(`${BASE}${path}`).set("Cookie", studentToken);
const patch = (path, body) => request(app).patch(`${BASE}${path}`).set("Cookie", studentToken).send(body);
const put  = (path, body) => request(app).put(`${BASE}${path}`).set("Cookie", studentToken).send(body);
const post = (path, body) => request(app).post(`${BASE}${path}`).set("Cookie", studentToken).send(body);

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-206  PATCH /api/student/profile
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-206: Update Student Profile", () => {
  let originalProfile;

  beforeAll(async () => {
    const res = await get("/profile");
    originalProfile = res.body.result;
  });

  afterAll(async () => {
    // Restore original profile
    await patch("/profile", {
      name: originalProfile.name,
      phone: originalProfile.phonenumber || "",
      bio: originalProfile.bio || "",
      website: originalProfile.website || "",
      socials: originalProfile.socials || {},
      interests: originalProfile.interests || [],
    });
  });

  test("Success: Update single field (name)", async () => {
    const res = await patch("/profile", { name: "Test Student Name" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Profile updated successfully!");
    expect(res.body.result.name).toBe("Test Student Name");
  });

  test("Success: Update socials (nested)", async () => {
    const socials = { facebook: "https://facebook.com/test", linkedin: "https://linkedin.com/in/test" };
    const res = await patch("/profile", { socials });
    expect(res.status).toBe(200);
    expect(res.body.result.socials).toMatchObject(socials);
  });

  test("Success: Update interests", async () => {
    const res = await patch("/profile", { interests: ["devops", "cloud", "backend"] });
    expect(res.status).toBe(200);
    expect(res.body.result.interests).toEqual(expect.arrayContaining(["devops", "cloud", "backend"]));
  });

  test("Success: Combined update (name + website)", async () => {
    const res = await patch("/profile", { name: "Combined Update", website: "https://example.com" });
    expect(res.status).toBe(200);
    expect(res.body.result.name).toBe("Combined Update");
    expect(res.body.result.website).toBe("https://example.com");
  });

  test("Error: Empty body → 400", async () => {
    const res = await patch("/profile", {});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Error: Name too short (min 2) → 400", async () => {
    const res = await patch("/profile", { name: "A" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Error: Invalid phone → 400", async () => {
    const res = await patch("/profile", { phone: "abc123" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Error: Unauthenticated → 401", async () => {
    const res = await request(app).patch(`${BASE}/profile`).send({ name: "Hacker" });
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-223  GET /api/student/courses
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-223: Get Student's Courses", () => {
  test("Success: Default pagination", async () => {
    const res = await get("/courses");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Get courses successfully!");
    expect(Array.isArray(res.body.result)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination).toHaveProperty("page");
    expect(res.body.pagination).toHaveProperty("totalItems");
  });

  test("Success: Custom page & limit", async () => {
    const res = await get("/courses?page=1&limit=6");
    expect(res.status).toBe(200);
    expect(res.body.result.length).toBeLessThanOrEqual(6);
  });

  test("Success: Sort by titleAsc", async () => {
    const res = await get("/courses?sort=titleAsc&limit=50");
    expect(res.status).toBe(200);
    const titles = res.body.result.map((c) => c.title);
    const sorted = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sorted);
  });

  test("Success: Sort by activityDesc (default)", async () => {
    const res = await get("/courses?sort=activityDesc");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Success: Search courses (fuzzy)", async () => {
    const res = await get("/courses?search=Docker");
    expect(res.status).toBe(200);
    // Should return at least the Docker course
    if (res.body.result.length > 0) {
      expect(res.body.result.some((c) => /docker/i.test(c.title))).toBe(true);
    }
  });

  test("Success: Course row has expected fields", async () => {
    const res = await get("/courses?limit=6");
    expect(res.status).toBe(200);
    if (res.body.result.length > 0) {
      const course = res.body.result[0];
      expect(course).toHaveProperty("courseId");
      expect(course).toHaveProperty("title");
      expect(course).toHaveProperty("percentage");
      expect(course).toHaveProperty("totalLectures");
      expect(course).toHaveProperty("completedLectures");
    }
  });

  test("Error: Invalid sort value → 400", async () => {
    const res = await get("/courses?sort=invalidSort");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Error: Limit non-numeric → 400", async () => {
    const res = await get("/courses?limit=abc");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Error: Unauthenticated → 401", async () => {
    const res = await request(app).get(`${BASE}/courses`);
    expect(res.status).toBe(401);
  });

  test("Error: Instructor role → 403", async () => {
    const res = await request(app).get(`${BASE}/courses`).set("Cookie", instructorToken);
    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-233  GET /api/student/courses/stats
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-233: Get Student's Courses Stats", () => {
  test("Success: Returns stats shape", async () => {
    const res = await get("/courses/stats");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Get my courses stats successfully!");
    const r = res.body.result;
    expect(r).toHaveProperty("totalCourses");
    expect(r).toHaveProperty("totalCompleted");
    expect(r).toHaveProperty("totalInProgress");
    expect(r).toHaveProperty("totalNotStarted");
    expect(typeof r.totalCourses).toBe("number");
  });

  test("Success: Math safety (all >= 0)", async () => {
    const res = await get("/courses/stats");
    const r = res.body.result;
    expect(r.totalCourses).toBeGreaterThanOrEqual(0);
    expect(r.totalCompleted).toBeGreaterThanOrEqual(0);
    expect(r.totalInProgress).toBeGreaterThanOrEqual(0);
    expect(r.totalNotStarted).toBeGreaterThanOrEqual(0);
  });

  test("Success: Sum check (completed + inProgress + notStarted ≤ total)", async () => {
    const res = await get("/courses/stats");
    const r = res.body.result;
    expect(r.totalCompleted + r.totalInProgress + r.totalNotStarted).toBeLessThanOrEqual(r.totalCourses);
  });

  test("Error: Unauthenticated → 401", async () => {
    const res = await request(app).get(`${BASE}/courses/stats`);
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-234  GET /api/student/stats
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-234: Get Student's Stats", () => {
  test("Success: Returns stats shape", async () => {
    const res = await get("/stats");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Get student stats successfully!");
    const r = res.body.result;
    expect(r).toHaveProperty("totalCourses");
    expect(r).toHaveProperty("completedCourses");
    expect(r).toHaveProperty("totalLectures");
    expect(r).toHaveProperty("completedLectures");
  });

  test("Success: All values >= 0", async () => {
    const res = await get("/stats");
    const r = res.body.result;
    expect(r.totalCourses).toBeGreaterThanOrEqual(0);
    expect(r.completedCourses).toBeGreaterThanOrEqual(0);
    expect(r.totalLectures).toBeGreaterThanOrEqual(0);
    expect(r.completedLectures).toBeGreaterThanOrEqual(0);
  });

  test("Success: completedCourses ≤ totalCourses", async () => {
    const res = await get("/stats");
    const r = res.body.result;
    expect(r.completedCourses).toBeLessThanOrEqual(r.totalCourses);
  });

  test("Error: Unauthenticated → 401", async () => {
    const res = await request(app).get(`${BASE}/stats`);
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-245  GET /api/student/courses/:courseId/progress
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-245: Get Course Progress", () => {
  test("Success: Fresh start (enrolled, no activity)", async () => {
    const res = await get(`/courses/${ENROLLED_COURSE}/progress`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Get course's progress successfully!");
    const r = res.body.result;
    expect(r).toHaveProperty("courseId");
    expect(r).toHaveProperty("totalLectures");
    expect(r).toHaveProperty("completedLecturesCount");
    expect(r).toHaveProperty("isCompleted");
    expect(r).toHaveProperty("lectures");
    expect(Array.isArray(r.lectures)).toBe(true);
  });

  test("Success: completedLecturesCount ≤ totalLectures", async () => {
    const res = await get(`/courses/${ENROLLED_COURSE}/progress`);
    const r = res.body.result;
    expect(r.completedLecturesCount).toBeLessThanOrEqual(r.totalLectures);
  });

  test("Error: Not enrolled → 403", async () => {
    const res = await get(`/courses/${NOT_ENROLLED_COURSE}/progress`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("Error: Nonexistent course → 403 or 404", async () => {
    const res = await get(`/courses/${NONEXISTENT_ID}/progress`);
    expect([403, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test("Error: Unauthenticated → 401", async () => {
    const res = await request(app).get(`${BASE}/courses/${ENROLLED_COURSE}/progress`);
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-246  POST /api/student/courses/:courseId/lectures/:lecId/progress
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-246: Update Lecture Progress", () => {
  test("Success: Normal play (send position + deltaTime)", async () => {
    const res = await post(`/courses/${ENROLLED_COURSE}/lectures/${SAMPLE_LECTURE_ID}/progress`, {
      currentTimeSec: 30,
      durationSec: 161,
      deltaTimeSec: 10,
      isCompleted: false,
      isNewSession: false,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Update lecture progress successfully!");
    expect(res.body.result).toHaveProperty("courseId");
    expect(res.body.result).toHaveProperty("lectures");
  });

  test("Success: New session (viewCount++)", async () => {
    const res = await post(`/courses/${ENROLLED_COURSE}/lectures/${SAMPLE_LECTURE_ID}/progress`, {
      currentTimeSec: 0,
      durationSec: 161,
      deltaTimeSec: 5,
      isCompleted: false,
      isNewSession: true,
    });
    expect(res.status).toBe(200);
    // Find the lecture in result
    const lec = res.body.result.lectures.find((l) => l.lecId === SAMPLE_LECTURE_ID);
    if (lec) {
      expect(lec.viewCount).toBeGreaterThanOrEqual(1);
    }
  });

  test("Success: Seeking (position jump)", async () => {
    const res = await post(`/courses/${ENROLLED_COURSE}/lectures/${SAMPLE_LECTURE_ID}/progress`, {
      currentTimeSec: 120,
      durationSec: 161,
      deltaTimeSec: 2,
      isCompleted: false,
      isNewSession: false,
    });
    expect(res.status).toBe(200);
    const lec = res.body.result.lectures.find((l) => l.lecId === SAMPLE_LECTURE_ID);
    if (lec) {
      expect(lec.lastPositionSec).toBe(120);
    }
  });

  test("Error: currentTimeSec > durationSec → 400", async () => {
    const res = await post(`/courses/${ENROLLED_COURSE}/lectures/${SAMPLE_LECTURE_ID}/progress`, {
      currentTimeSec: 200,
      durationSec: 100,
      deltaTimeSec: 5,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Error: deltaTimeSec > 60 (suspicious) → 400", async () => {
    const res = await post(`/courses/${ENROLLED_COURSE}/lectures/${SAMPLE_LECTURE_ID}/progress`, {
      currentTimeSec: 30,
      durationSec: 161,
      deltaTimeSec: 65,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Error: Not enrolled → 403", async () => {
    const res = await post(`/courses/${NOT_ENROLLED_COURSE}/lectures/${SAMPLE_LECTURE_ID}/progress`, {
      currentTimeSec: 10,
      durationSec: 100,
      deltaTimeSec: 5,
    });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("Error: Unauthenticated → 401", async () => {
    const res = await request(app)
      .post(`${BASE}/courses/${ENROLLED_COURSE}/lectures/${SAMPLE_LECTURE_ID}/progress`)
      .send({ currentTimeSec: 10, durationSec: 100 });
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-247  GET /api/student/streak
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-247: Get Streak", () => {
  test("Success: Returns streak shape", async () => {
    const res = await get("/streak");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Get student streak successfully!");
    const r = res.body.result;
    expect(r).toHaveProperty("currentStreak");
    expect(r).toHaveProperty("longestStreak");
    expect(r).toHaveProperty("todayDone");
    expect(r).toHaveProperty("activeDates");
    expect(typeof r.currentStreak).toBe("number");
    expect(typeof r.todayDone).toBe("boolean");
  });

  test("Success: longestStreak >= currentStreak", async () => {
    const res = await get("/streak");
    const r = res.body.result;
    expect(r.longestStreak).toBeGreaterThanOrEqual(r.currentStreak);
  });

  test("Error: Unauthenticated → 401", async () => {
    const res = await request(app).get(`${BASE}/streak`);
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-248  POST /api/student/streak
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-248: Update Streak", () => {
  test("Success: Register activity (streak updated)", async () => {
    const res = await post("/streak", {});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Streak updated successfully!");
    const r = res.body.result;
    expect(r.currentStreak).toBeGreaterThanOrEqual(1);
    expect(r.todayDone).toBe(true);
  });

  test("Success: Idempotency (calling again same day)", async () => {
    const res = await post("/streak", {});
    expect(res.status).toBe(200);
    expect(res.body.result.todayDone).toBe(true);
  });

  test("Error: Unauthenticated → 401", async () => {
    const res = await request(app).post(`${BASE}/streak`).send({});
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-250  GET /api/student/skill-radar
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-250: Get Skills Radar", () => {
  test("Success: Returns skill radar shape", async () => {
    const res = await get("/skill-radar");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Get skill radar successfully!");
    const r = res.body.result;
    expect(r).toHaveProperty("labels");
    expect(r).toHaveProperty("values");
    expect(Array.isArray(r.labels)).toBe(true);
    expect(Array.isArray(r.values)).toBe(true);
    expect(r.labels.length).toBe(r.values.length);
  });

  test("Success: Values capped at 100", async () => {
    const res = await get("/skill-radar");
    const r = res.body.result;
    r.values.forEach((v) => {
      expect(v).toBeLessThanOrEqual(100);
      expect(v).toBeGreaterThanOrEqual(0);
    });
  });

  test("Success: Labels sorted alphabetically", async () => {
    const res = await get("/skill-radar");
    const labels = res.body.result.labels;
    const sorted = [...labels].sort((a, b) => a.localeCompare(b));
    expect(labels).toEqual(sorted);
  });

  test("Error: Unauthenticated → 401", async () => {
    const res = await request(app).get(`${BASE}/skill-radar`);
    expect(res.status).toBe(401);
  });
});
