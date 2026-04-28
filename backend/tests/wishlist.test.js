/**
 * WISHLIST API Tests
 * Jira: EDV-225 (Get), EDV-226 (Add), EDV-227 (Delete),
 *       EDV-228 (Check), EDV-229 (Count)
 *
 * Fixtures:
 *   - STUDENT    : lacduongldg212@gmail.com (userId: 694d32d7ebe694fc49e59a67)
 *   - INSTRUCTOR : 22110304@student.hcmute.edu.vn
 *   - Existing wishlist: 2 items (694e8e85ed8f2ec45dc0d4ec, 695166b4b08e6cc6cab5b4ff)
 *
 * Test flow: EDV-226 adds a course → EDV-228 checks it → EDV-229 counts →
 *            EDV-227 removes it → EDV-225 verifies final state
 */
import request from "supertest";
import app from "../src/app.js";
import "../tests/setup.js";

const BASE = "/api/wishlist";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const STUDENT    = { email: "lacduongldg212@gmail.com",       password: "Abc@12345" };
const INSTRUCTOR = { email: "22110304@student.hcmute.edu.vn", password: "Abc@12345" };

const COURSE_NOT_IN_WISHLIST = "694d046addf90206a887c535"; // Crash Course CS — not in wishlist
const COURSE_IN_WISHLIST     = "694e8e85ed8f2ec45dc0d4ec"; // Docker Essentials Advanced — already in wishlist
const INVALID_ID             = "not-a-valid-id";
const NONEXISTENT_ID         = "000000000000000000000001";

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

// Authenticated request helpers
const authGet    = (path)       => request(app).get(`${BASE}${path}`).set("Cookie", studentToken);
const authPost   = (path, body) => request(app).post(`${BASE}${path}`).set("Cookie", studentToken).send(body);
const authDelete = (path, body) => request(app).delete(`${BASE}${path}`).set("Cookie", studentToken).send(body);

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-226  POST /api/wishlist  (Add — run first so other tests can use it)
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-226: Add Course To Wishlist", () => {
  // Clean up after all tests in this block
  afterAll(async () => {
    // Remove the course we added so DB is back to original state
    await authDelete("", { courseId: COURSE_NOT_IN_WISHLIST });
  });

  test("Success: Add to wishlist → 201", async () => {
    const res = await authPost("", { courseId: COURSE_NOT_IN_WISHLIST });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Added to wishlist.");
    expect(res.body.result).toHaveProperty("courseId");
    expect(res.body.result).toHaveProperty("title");
  });

  test("Error: Already in wishlist → 409", async () => {
    const res = await authPost("", { courseId: COURSE_IN_WISHLIST });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("Error: Missing courseId → 400", async () => {
    const res = await authPost("", {});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Error: Invalid courseId → 400", async () => {
    const res = await authPost("", { courseId: INVALID_ID });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).post(BASE).send({ courseId: COURSE_NOT_IN_WISHLIST });
    expect(res.status).toBe(401);
  });

  test("Error: Forbidden (instructor) → 403", async () => {
    const res = await request(app)
      .post(BASE)
      .set("Cookie", instructorToken)
      .send({ courseId: COURSE_NOT_IN_WISHLIST });
    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-225  GET /api/wishlist
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-225: Get Wishlist", () => {
  test("Success: Get wishlist → 200 with courses", async () => {
    const res = await authGet("");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Wishlist fetched.");
    expect(Array.isArray(res.body.result)).toBe(true);
    expect(res.body.result.length).toBeGreaterThanOrEqual(1);
  });

  test("Success: Wishlist item has expected fields", async () => {
    const res = await authGet("");
    expect(res.status).toBe(200);
    if (res.body.result.length > 0) {
      const item = res.body.result[0];
      expect(item).toHaveProperty("courseId");
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("price");
    }
  });

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(401);
  });

  test("Error: Forbidden (instructor) → 403", async () => {
    const res = await request(app).get(BASE).set("Cookie", instructorToken);
    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-228  GET /api/wishlist/check?courseId=
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-228: Check Course In Wishlist", () => {
  test("Success: Course in wishlist → exists: true", async () => {
    const res = await authGet(`/check?courseId=${COURSE_IN_WISHLIST}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Wishlist status fetched");
    expect(res.body.result).toEqual({ exists: true });
  });

  test("Success: Course not in wishlist → exists: false", async () => {
    const res = await authGet(`/check?courseId=${NONEXISTENT_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toEqual({ exists: false });
  });

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).get(`${BASE}/check?courseId=${COURSE_IN_WISHLIST}`);
    expect(res.status).toBe(401);
  });

  test("Error: Forbidden (instructor) → 403", async () => {
    const res = await request(app)
      .get(`${BASE}/check?courseId=${COURSE_IN_WISHLIST}`)
      .set("Cookie", instructorToken);
    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-229  GET /api/wishlist/count
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-229: Get Wishlist Count", () => {
  test("Success: Get count → 200 with number", async () => {
    const res = await authGet("/count");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Wishlist count fetched.");
    expect(res.body.result).toHaveProperty("count");
    expect(typeof res.body.result.count).toBe("number");
    expect(res.body.result.count).toBeGreaterThanOrEqual(1);
  });

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).get(`${BASE}/count`);
    expect(res.status).toBe(401);
  });

  test("Error: Forbidden (instructor) → 403", async () => {
    const res = await request(app).get(`${BASE}/count`).set("Cookie", instructorToken);
    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-227  DELETE /api/wishlist
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-227: Delete Course From Wishlist", () => {
  let tempCourseId = COURSE_NOT_IN_WISHLIST;

  // Add a course first so we can delete it
  beforeAll(async () => {
    await authPost("", { courseId: tempCourseId });
  });

  test("Success: Remove from wishlist → 200", async () => {
    const res = await authDelete("", { courseId: tempCourseId });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Removed from wishlist.");
  });

  test("Error: Course not in wishlist → 404", async () => {
    // tempCourseId was already removed above
    const res = await authDelete("", { courseId: tempCourseId });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).delete(BASE).send({ courseId: COURSE_IN_WISHLIST });
    expect(res.status).toBe(401);
  });

  test("Error: Forbidden (instructor) → 403", async () => {
    const res = await request(app)
      .delete(BASE)
      .set("Cookie", instructorToken)
      .send({ courseId: COURSE_IN_WISHLIST });
    expect(res.status).toBe(403);
  });
});
