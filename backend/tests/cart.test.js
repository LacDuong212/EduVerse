/**
 * CART API Tests
 * Jira: EDV-188 (Get Cart), EDV-190 (Add to Cart), EDV-191 (Remove from Cart),
 *       EDV-198 (Clear Cart), EDV-199 (Count Items)
 *
 * Fixtures:
 *   - ENROLLED_STUDENT : lacduongldg212@gmail.com  (userId: 694d32d7ebe694fc49e59a67)
 *     • enrolled in: Docker Essentials Advanced (OWNED_COURSE_ID)
 *     • NOT enrolled in: Crash Course CS (COURSE_A), Crash Course Data Science (COURSE_B)
 *   - INSTRUCTOR       : 22110304@student.hcmute.edu.vn
 *
 * All cart routes require: protect + restrictTo("student")
 */
import request from "supertest";
import app from "../src/app.js";
import "../tests/setup.js";

const BASE = "/api/cart";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const ENROLLED_STUDENT = { email: "lacduongldg212@gmail.com",         password: "Abc@12345" };
const INSTRUCTOR       = { email: "22110304@student.hcmute.edu.vn",   password: "Abc@12345" };

const OWNED_COURSE_ID = "694e8e85ed8f2ec45dc0d4ec"; // Docker Essentials Advanced (student enrolled)
const COURSE_A        = "694d046addf90206a887c535"; // Crash Course CS (not owned)
const COURSE_B        = "694e9d90ed8f2ec45dc0e653"; // Crash Course Data Science (not owned)
const INVALID_ID      = "not-a-valid-id";

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function loginAndGetCookie(email, password) {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.headers["set-cookie"]?.[0] ?? "";
}

// ─── Shared state ─────────────────────────────────────────────────────────────
let studentCookie = "";
let instructorCookie = "";

beforeAll(async () => {
  [studentCookie, instructorCookie] = await Promise.all([
    loginAndGetCookie(ENROLLED_STUDENT.email, ENROLLED_STUDENT.password),
    loginAndGetCookie(INSTRUCTOR.email, INSTRUCTOR.password),
  ]);
});

beforeEach(async () => {
  // Reset cart to empty state before each test
  await request(app).delete(BASE).set("Cookie", studentCookie);
});

// =============================================================================
// EDV-188 | GET /api/cart
// =============================================================================
describe("EDV-188 | GET /api/cart", () => {
  it("✅ Empty Cart: mới clear → 200, result = []", async () => {
    const res = await request(app).get(BASE).set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toEqual([]);
  });

  it("✅ Populated Cart: sau khi add 1 course → result có 1 item với đủ details", async () => {
    await request(app)
      .post(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseId: COURSE_A });

    const res = await request(app).get(BASE).set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.result).toHaveLength(1);
    expect(res.body.result[0]).toHaveProperty("title");
    expect(res.body.result[0]).toHaveProperty("price");
  });

  it("❌ Role Restriction: instructor → 403", async () => {
    const res = await request(app).get(BASE).set("Cookie", instructorCookie);

    expect(res.status).toBe(403);
  });

  it("❌ Unauthorized: không đăng nhập → 401", async () => {
    const res = await request(app).get(BASE);

    expect(res.status).toBe(401);
  });
});

// =============================================================================
// EDV-190 | POST /api/cart/items
// =============================================================================
describe("EDV-190 | POST /api/cart/items", () => {
  it("✅ Add New: courseId hợp lệ + chưa trong cart → 200, 'Added course to your cart!'", async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseId: COURSE_A });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/added course/i);
    expect(Array.isArray(res.body.result)).toBe(true);
    expect(res.body.result).toHaveLength(1);
  });

  it("❌ Duplicate: add cùng course 2 lần → 409 'Course already in cart'", async () => {
    await request(app)
      .post(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseId: COURSE_A });

    const res = await request(app)
      .post(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseId: COURSE_A });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already in cart/i);
  });

  it("❌ Already Owned: add course đã mua → 409 'You already own this course'", async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseId: OWNED_COURSE_ID });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already own/i);
  });

  it("❌ Bad Format: courseId không phải ObjectId → 400 Zod error", async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseId: INVALID_ID });

    expect(res.status).toBe(400);
  });

  it("❌ Role Restriction: instructor → 403", async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .set("Cookie", instructorCookie)
      .send({ courseId: COURSE_A });

    expect(res.status).toBe(403);
  });

  it("❌ Unauthorized: không đăng nhập → 401", async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .send({ courseId: COURSE_A });

    expect(res.status).toBe(401);
  });
});

// =============================================================================
// EDV-191 | DELETE /api/cart/items
// =============================================================================
describe("EDV-191 | DELETE /api/cart/items", () => {
  it("✅ Remove Single: xoá 1 course → 200, 'Removed 1 course from cart'", async () => {
    await request(app)
      .post(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseId: COURSE_A });

    const res = await request(app)
      .delete(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseIds: [COURSE_A] });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed 1 course from cart/i);
    expect(res.body.result).toHaveLength(0);
  });

  it("✅ Remove Bulk: xoá 2 courses → 200, 'Removed 2 courses from cart'", async () => {
    await Promise.all([
      request(app).post(`${BASE}/items`).set("Cookie", studentCookie).send({ courseId: COURSE_A }),
      request(app).post(`${BASE}/items`).set("Cookie", studentCookie).send({ courseId: COURSE_B }),
    ]);

    const res = await request(app)
      .delete(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseIds: [COURSE_A, COURSE_B] });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed 2 courses from cart/i);
    expect(res.body.result).toHaveLength(0);
  });

  it("✅ Partial Match: 1 ID trong cart, 1 ID không trong cart → 200, removedCount = 1", async () => {
    await request(app)
      .post(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseId: COURSE_A });

    const res = await request(app)
      .delete(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseIds: [COURSE_A, COURSE_B] });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed 1 course from cart/i);
  });

  it("❌ Empty List: gửi [] → 400 Zod 'At least one course ID is required'", async () => {
    const res = await request(app)
      .delete(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseIds: [] });

    expect(res.status).toBe(400);
  });

  it("❌ Cart Empty: cart rỗng → 409 'Your cart is empty'", async () => {
    const res = await request(app)
      .delete(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseIds: [COURSE_A] });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/cart is empty/i);
  });

  it("❌ Invalid Format: ID không phải ObjectId → 400 Zod error", async () => {
    const res = await request(app)
      .delete(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseIds: [INVALID_ID] });

    expect(res.status).toBe(400);
  });
});

// =============================================================================
// EDV-198 | DELETE /api/cart
// =============================================================================
describe("EDV-198 | DELETE /api/cart", () => {
  it("✅ Clear With Items: có items trong cart → 200 'Cart cleared successfully!'", async () => {
    await request(app)
      .post(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseId: COURSE_A });

    const res = await request(app).delete(BASE).set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/cart cleared successfully/i);
  });

  it("✅ Clear Already Empty: cart đã rỗng → vẫn 200 'Cart cleared successfully!'", async () => {
    const res = await request(app).delete(BASE).set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/cart cleared successfully/i);
  });

  it("❌ Role Restriction: instructor → 403", async () => {
    const res = await request(app).delete(BASE).set("Cookie", instructorCookie);

    expect(res.status).toBe(403);
  });

  it("❌ Unauthorized: không đăng nhập → 401", async () => {
    const res = await request(app).delete(BASE);

    expect(res.status).toBe(401);
  });
});

// =============================================================================
// EDV-199 | GET /api/cart/items (Count)
// =============================================================================
describe("EDV-199 | GET /api/cart/items", () => {
  it("✅ Empty Cart: 0 items → result = 0, message 'You have 0 items in cart.'", async () => {
    const res = await request(app).get(`${BASE}/items`).set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(0);
    expect(res.body.message).toBe("You have 0 items in cart.");
  });

  it("✅ Singular: 1 item → message 'You have 1 item in cart.' (không có 's')", async () => {
    await request(app)
      .post(`${BASE}/items`)
      .set("Cookie", studentCookie)
      .send({ courseId: COURSE_A });

    const res = await request(app).get(`${BASE}/items`).set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(1);
    expect(res.body.message).toBe("You have 1 item in cart.");
  });

  it("✅ Plural: 2 items → result = 2, message 'You have 2 items in cart.'", async () => {
    await request(app).post(`${BASE}/items`).set("Cookie", studentCookie).send({ courseId: COURSE_A });
    await request(app).post(`${BASE}/items`).set("Cookie", studentCookie).send({ courseId: COURSE_B });

    const res = await request(app).get(`${BASE}/items`).set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(2);
    expect(res.body.message).toBe("You have 2 items in cart.");
  });

  it("❌ Role Restriction: instructor → 403", async () => {
    const res = await request(app).get(`${BASE}/items`).set("Cookie", instructorCookie);

    expect(res.status).toBe(403);
  });

  it("❌ Unauthorized: không đăng nhập → 401", async () => {
    const res = await request(app).get(`${BASE}/items`);

    expect(res.status).toBe(401);
  });
});
