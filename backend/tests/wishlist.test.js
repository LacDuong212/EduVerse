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
import Wishlist from "../src/modules/wishlist/wishlist.model.js";
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

  test("Success: Add to wishlist → 201 with correct shape", async () => {
    const res = await authPost("", { courseId: COURSE_NOT_IN_WISHLIST });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Added to wishlist.");
    const r = res.body.result;
    expect(r.courseId).toMatch(/^[0-9a-f]{24}$/);
    expect(typeof r.title).toBe("string");
    expect(typeof r.isFree).toBe("boolean");
    expect(typeof r.enableDiscount).toBe("boolean");
    // price is number or null
    if (r.price !== null) expect(typeof r.price).toBe("number");
    if (r.enableDiscount && r.discountPrice !== null) {
      expect(r.discountPrice).toBeLessThan(r.price);
    }
  });

  test("DB verify: Wishlist document created in database", async () => {
    const doc = await Wishlist.findOne({
      user: "694d32d7ebe694fc49e59a67",
      course: COURSE_NOT_IN_WISHLIST,
    }).lean();
    expect(doc).not.toBeNull();
    expect(doc.course.toString()).toBe(COURSE_NOT_IN_WISHLIST);
  });

  test("No sensitive field leakage in add response", async () => {
    // Item already in list → 409, so re-check with a GET for leakage
    const res = await authGet("");
    expect(res.status).toBe(200);
    res.body.result.forEach((item) => {
      expect(item).not.toHaveProperty("password");
      expect(item).not.toHaveProperty("__v");
    });
    expect(res.body).not.toHaveProperty("stack");
  });

  // BUG EDV-259: thumbnail typo in mapper — always returns null
  test.failing("[BUG EDV-259] thumnail field should contain thumbnail URL (currently always null)", async () => {
    const res = await authGet("");
    expect(res.status).toBe(200);
    if (res.body.result.length > 0) {
      const item = res.body.result[0];
      // This will fail until EDV-259 is fixed — mapper reads thumnail instead of thumbnail
      expect(item.thumnail).not.toBeNull();
    }
  });

  // BUG EDV-260: lectureCount always 0 (Course model has lecturesCount)
  test.failing("[BUG EDV-260] lectureCount should be removed (always 0, Course has lecturesCount)", async () => {
    const res = await authGet("");
    expect(res.status).toBe(200);
    if (res.body.result.length > 0) {
      const item = res.body.result[0];
      // lecturesCount should have the real value; lectureCount is always 0 — bug
      expect(item.lecturesCount).toBeGreaterThan(0); // real data
      // The following exposes EDV-260 — lectureCount is a phantom field
      expect(item).not.toHaveProperty("lectureCount");
    }
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

  test("Success: Wishlist item has correct field types", async () => {
    const res = await authGet("");
    expect(res.status).toBe(200);
    if (res.body.result.length > 0) {
      const item = res.body.result[0];
      expect(item.courseId).toMatch(/^[0-9a-f]{24}$/);
      expect(typeof item.title).toBe("string");
      expect(typeof item.isFree).toBe("boolean");
      expect(typeof item.enableDiscount).toBe("boolean");
      if (item.price !== null) expect(typeof item.price).toBe("number");
      expect(item.rating).toHaveProperty("total");
      expect(item.rating).toHaveProperty("count");
      expect(typeof item.rating.total).toBe("number");
    }
  });

  test("DB cross-check: result count matches Wishlist.countDocuments", async () => {
    const res = await authGet("");
    expect(res.status).toBe(200);
    const dbCount = await Wishlist.countDocuments({ user: "694d32d7ebe694fc49e59a67" });
    expect(res.body.result.length).toBe(dbCount);
  });

  test("No sensitive field leakage in list response", async () => {
    const res = await authGet("");
    expect(res.status).toBe(200);
    res.body.result.forEach((item) => {
      expect(item).not.toHaveProperty("password");
      expect(item).not.toHaveProperty("__v");
      expect(item).not.toHaveProperty("user");
    });
    expect(res.body).not.toHaveProperty("stack");
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

  test("Error: Invalid courseId format → 400", async () => {
    const res = await authGet(`/check?courseId=${INVALID_ID}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).not.toHaveProperty("stack");
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
    expect(typeof res.body.result.count).toBe("number");
    expect(res.body.result.count).toBeGreaterThanOrEqual(1);
  });

  test("DB cross-check: count matches Wishlist.countDocuments", async () => {
    const res = await authGet("/count");
    expect(res.status).toBe(200);
    const dbCount = await Wishlist.countDocuments({ user: "694d32d7ebe694fc49e59a67" });
    expect(res.body.result.count).toBe(dbCount);
  });

  test("No sensitive field leakage", async () => {
    const res = await authGet("/count");
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("stack");
    expect(res.body.result).not.toHaveProperty("__v");
    expect(res.body.result).not.toHaveProperty("password");
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
    expect(res.body.result).toBe(tempCourseId);
  });

  test("DB verify: Wishlist document removed from database", async () => {
    const doc = await Wishlist.findOne({
      user: "694d32d7ebe694fc49e59a67",
      course: tempCourseId,
    }).lean();
    expect(doc).toBeNull();
  });

  test("Error: Course not in wishlist → 404", async () => {
    // tempCourseId was already removed above
    const res = await authDelete("", { courseId: tempCourseId });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body).not.toHaveProperty("stack");
  });

  test("Error: Invalid courseId format → 400", async () => {
    const res = await authDelete("", { courseId: INVALID_ID });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).not.toHaveProperty("stack");
  });

  test("No sensitive field leakage in delete response", async () => {
    // Already removed — just check that error responses don't leak internals
    const res = await authDelete("", { courseId: NONEXISTENT_ID });
    expect(res.status).toBe(404);
    expect(res.body).not.toHaveProperty("stack");
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
