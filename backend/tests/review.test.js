/**
 * REVIEW API Tests
 * Jira: EDV-193 (Create Review), EDV-195 (Update Review), EDV-196 (Remove Review)
 *
 * Fixtures:
 *   - STUDENT    : lacduongldg212@gmail.com  (userId: 694d32d7ebe694fc49e59a67)
 *     • enrolled in : Docker Essentials Advanced (ENROLLED_COURSE)
 *     • NOT enrolled: Networking & Security Crash Course (NOT_ENROLLED_COURSE)
 *   - INSTRUCTOR : 22110304@student.hcmute.edu.vn
 *
 * Test flow: EDV-193 creates a review (saves createdReviewId) → EDV-195 updates it →
 *            EDV-196 soft-deletes it (tests run in order, no afterAll cleanup needed)
 */
import request from "supertest";
import app from "../src/app.js";
import Review from "../src/modules/review/review.model.js";
import "../tests/setup.js";

const BASE = "/api/reviews";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const STUDENT    = { email: "lacduongldg212@gmail.com",       password: "Abc@12345" };
const INSTRUCTOR = { email: "22110304@student.hcmute.edu.vn", password: "Abc@12345" };

const ENROLLED_COURSE     = "694e8e85ed8f2ec45dc0d4ec"; // Docker Essentials Advanced (enrolled)
const NOT_ENROLLED_COURSE = "69501b5ed27dbaf7e24adb7e"; // Networking & Security (not enrolled)
const INVALID_ID          = "not-a-valid-id";
const NONEXISTENT_ID      = "000000000000000000000001"; // valid ObjectId, no record

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function loginAndGetCookie(email, password) {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.headers["set-cookie"]?.[0] ?? "";
}

// ─── Shared state ─────────────────────────────────────────────────────────────
let studentCookie    = "";
let instructorCookie = "";
let createdReviewId  = "";

beforeAll(async () => {
  // Clean up any leftover reviews from previous test runs
  await Review.deleteMany({ user: "694d32d7ebe694fc49e59a67", course: ENROLLED_COURSE });

  [studentCookie, instructorCookie] = await Promise.all([
    loginAndGetCookie(STUDENT.email, STUDENT.password),
    loginAndGetCookie(INSTRUCTOR.email, INSTRUCTOR.password),
  ]);
});

// =============================================================================
// EDV-193 | POST /api/reviews
// =============================================================================
describe("EDV-193 | POST /api/reviews", () => {
  it("❌ Not Authenticated: no cookie → 401", async () => {
    const res = await request(app)
      .post(BASE)
      .send({ courseId: ENROLLED_COURSE, rating: 4 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("❌ Role Restriction: instructor → 403", async () => {
    const res = await request(app)
      .post(BASE)
      .set("Cookie", instructorCookie)
      .send({ courseId: ENROLLED_COURSE, rating: 4 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("❌ Not Enrolled: student hasn't bought the course → 403", async () => {
    const res = await request(app)
      .post(BASE)
      .set("Cookie", studentCookie)
      .send({ courseId: NOT_ENROLLED_COURSE, rating: 3 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("You cannot review a course that you haven't bought.");
  });

  it("❌ Invalid Rating: rating = 0 → 400", async () => {
    const res = await request(app)
      .post(BASE)
      .set("Cookie", studentCookie)
      .send({ courseId: ENROLLED_COURSE, rating: 0 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Invalid Rating: rating = 6 → 400", async () => {
    const res = await request(app)
      .post(BASE)
      .set("Cookie", studentCookie)
      .send({ courseId: ENROLLED_COURSE, rating: 6 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Long Description: description > 500 chars → 400", async () => {
    const res = await request(app)
      .post(BASE)
      .set("Cookie", studentCookie)
      .send({ courseId: ENROLLED_COURSE, rating: 4, description: "a".repeat(501) });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("✅ Success: enrolled student, first review → 201", async () => {
    const res = await request(app)
      .post(BASE)
      .set("Cookie", studentCookie)
      .send({ courseId: ENROLLED_COURSE, rating: 4, description: "Great course!" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Review created successfully!");
    expect(res.body.result).toHaveProperty("reviewId");
    expect(res.body.result.reviewId).toMatch(/^[0-9a-f]{24}$/);
    expect(res.body.result.rating).toBe(4);
    expect(res.body.result.description).toBe("Great course!");
    // Leakage guards
    expect(res.body.result).not.toHaveProperty("isDeleted");
    expect(res.body.result).not.toHaveProperty("__v");
    expect(res.body).not.toHaveProperty("stack");

    createdReviewId = res.body.result.reviewId;
  });

  it("✅ DB verify: Review document created in database → 201", async () => {
    const doc = await Review.findById(createdReviewId).lean();
    expect(doc).not.toBeNull();
    expect(doc.course.toString()).toBe(ENROLLED_COURSE);
    expect(doc.user.toString()).toBe("694d32d7ebe694fc49e59a67");
    expect(doc.rating).toBe(4);
    expect(doc.description).toBe("Great course!");
    expect(doc.isDeleted).toBe(false);
  });

  it("❌ Missing courseId: no courseId in body → 400", async () => {
    const res = await request(app)
      .post(BASE)
      .set("Cookie", studentCookie)
      .send({ rating: 4 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Missing Rating: no rating in body → 400", async () => {
    const res = await request(app)
      .post(BASE)
      .set("Cookie", studentCookie)
      .send({ courseId: ENROLLED_COURSE });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Already Reviewed: same student, same course → 409", async () => {
    const res = await request(app)
      .post(BASE)
      .set("Cookie", studentCookie)
      .send({ courseId: ENROLLED_COURSE, rating: 5 });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("You already reviewed this course.");
  });
});

// =============================================================================
// EDV-195 | PATCH /api/reviews/:reviewId
// =============================================================================
describe("EDV-195 | PATCH /api/reviews/:reviewId", () => {
  it("❌ Not Authenticated: no cookie → 401", async () => {
    const res = await request(app)
      .patch(`${BASE}/${NONEXISTENT_ID}`)
      .send({ rating: 3 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("❌ Role Restriction: instructor → 403", async () => {
    const res = await request(app)
      .patch(`${BASE}/${NONEXISTENT_ID}`)
      .set("Cookie", instructorCookie)
      .send({ rating: 3 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("❌ Invalid ID: malformed reviewId → 400", async () => {
    const res = await request(app)
      .patch(`${BASE}/${INVALID_ID}`)
      .set("Cookie", studentCookie)
      .send({ rating: 3 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Rating Out of Range: rating = 10 → 400", async () => {
    const res = await request(app)
      .patch(`${BASE}/${NONEXISTENT_ID}`)
      .set("Cookie", studentCookie)
      .send({ rating: 10 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Not Owner: valid ID belonging to another user → 404", async () => {
    const res = await request(app)
      .patch(`${BASE}/${NONEXISTENT_ID}`)
      .set("Cookie", studentCookie)
      .send({ rating: 3 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Review not found.");
  });

  it("✅ Success: Update All — rating + description both change → 200", async () => {
    const res = await request(app)
      .patch(`${BASE}/${createdReviewId}`)
      .set("Cookie", studentCookie)
      .send({ rating: 5, description: "Updated: excellent course!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Review updated successfully!");
    expect(res.body.result.rating).toBe(5);
    expect(res.body.result.description).toBe("Updated: excellent course!");
  });

  it("✅ Success: Text Only — only description, rating stays the same → 200", async () => {
    const res = await request(app)
      .patch(`${BASE}/${createdReviewId}`)
      .set("Cookie", studentCookie)
      .send({ description: "Changed description only" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Review updated successfully!");
    // Rating should still be 5 from the previous update
    expect(res.body.result.rating).toBe(5);
    expect(res.body.result.description).toBe("Changed description only");
  });

  it("✅ DB verify: changes persisted in database", async () => {
    const doc = await Review.findById(createdReviewId).lean();
    expect(doc).not.toBeNull();
    expect(doc.rating).toBe(5);
    expect(doc.description).toBe("Changed description only");
    expect(doc.isDeleted).toBe(false);
  });

  it("✅ No leakage on update response", async () => {
    const res = await request(app)
      .patch(`${BASE}/${createdReviewId}`)
      .set("Cookie", studentCookie)
      .send({ rating: 5 });

    expect(res.status).toBe(200);
    expect(res.body.result).not.toHaveProperty("isDeleted");
    expect(res.body.result).not.toHaveProperty("__v");
    expect(res.body).not.toHaveProperty("stack");
  });
});

// =============================================================================
// EDV-196 | DELETE /api/reviews/:reviewId
// =============================================================================
describe("EDV-196 | DELETE /api/reviews/:reviewId", () => {
  it("❌ Not Authenticated: no cookie → 401", async () => {
    const res = await request(app)
      .delete(`${BASE}/${NONEXISTENT_ID}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("❌ Role Restriction: instructor → 403", async () => {
    const res = await request(app)
      .delete(`${BASE}/${NONEXISTENT_ID}`)
      .set("Cookie", instructorCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("❌ Malformed ID: invalid ObjectId in URL → 400", async () => {
    const res = await request(app)
      .delete(`${BASE}/${INVALID_ID}`)
      .set("Cookie", studentCookie);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Not the Owner: valid ID not owned by student → 404", async () => {
    const res = await request(app)
      .delete(`${BASE}/${NONEXISTENT_ID}`)
      .set("Cookie", studentCookie);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Review not found or already deleted.");
  });

  it("✅ Success: Soft Delete — owned review → 204", async () => {
    const res = await request(app)
      .delete(`${BASE}/${createdReviewId}`)
      .set("Cookie", studentCookie);

    expect(res.status).toBe(204);
  });

  it("✅ DB verify: document still exists with isDeleted=true", async () => {
    const doc = await Review.findById(createdReviewId).lean();
    expect(doc).not.toBeNull();
    expect(doc.isDeleted).toBe(true);
  });

  it("❌ Already Deleted: hit same endpoint twice → 404", async () => {
    const res = await request(app)
      .delete(`${BASE}/${createdReviewId}`)
      .set("Cookie", studentCookie);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Review not found or already deleted.");
  });
});
