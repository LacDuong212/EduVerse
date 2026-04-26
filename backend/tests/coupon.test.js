/**
 * COUPON API Tests
 * Jira: EDV-216 (Apply Coupon), EDV-217 (Get All Coupons)
 *
 * Fixtures:
 *   - STUDENT: lacduongldg212@gmail.com (userId: 694d32d7ebe694fc49e59a67)
 *   - SUMMER2025 : active, 20% off, valid Apr 2025–Jun 2026, student NOT in usersUsed
 *   - SORRY_ERROR: active=true but expiryDate Dec 2025 → triggers "Coupon has expired"
 *
 * Note: "Not Active Yet" & "Already Used" tests are .todo() because:
 *   - No coupon with future startDate exists in DB
 *   - applyCoupon is read-only (doesn't persist), so 409 cannot be triggered in sequence
 */
import request from "supertest";
import app from "../src/app.js";
import "../tests/setup.js";

const BASE = "/api/coupons";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const STUDENT    = { email: "lacduongldg212@gmail.com",       password: "Abc@12345" };
const INSTRUCTOR = { email: "22110304@student.hcmute.edu.vn", password: "Abc@12345" };

const VALID_COUPON   = "SUMMER2025";  // 20% off, valid, student not in usersUsed
const EXPIRED_COUPON = "SORRY_ERROR"; // active=true but expiry: 2025-12-13
const INVALID_COUPON = "NONEXISTENT_CODE_999";

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function loginAndGetCookie(email, password) {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.headers["set-cookie"]?.[0] ?? "";
}

// ─── Shared state ─────────────────────────────────────────────────────────────
let studentCookie    = "";
let instructorCookie = "";

beforeAll(async () => {
  [studentCookie, instructorCookie] = await Promise.all([
    loginAndGetCookie(STUDENT.email, STUDENT.password),
    loginAndGetCookie(INSTRUCTOR.email, INSTRUCTOR.password),
  ]);
});

// =============================================================================
// EDV-217 | GET /api/coupons
// =============================================================================
describe("EDV-217 | GET /api/coupons", () => {
  it("✅ Get All Coupons: no auth required → 200, array of coupons", async () => {
    const res = await request(app).get(BASE);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Coupon fetched successfully.");
    expect(Array.isArray(res.body.result)).toBe(true);
    expect(res.body.result.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// EDV-216 | POST /api/coupons/apply
// =============================================================================
describe("EDV-216 | POST /api/coupons/apply", () => {
  it("❌ Unauthorized: no token → 401", async () => {
    const res = await request(app)
      .post(`${BASE}/apply`)
      .send({ code: VALID_COUPON, originalPrice: 200000 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("❌ Missing Code: body without code → 400", async () => {
    const res = await request(app)
      .post(`${BASE}/apply`)
      .set("Cookie", studentCookie)
      .send({ originalPrice: 200000 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Short Code: code length < 3 → 400", async () => {
    const res = await request(app)
      .post(`${BASE}/apply`)
      .set("Cookie", studentCookie)
      .send({ code: "AB", originalPrice: 200000 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Missing Original Price: body without originalPrice → 400", async () => {
    const res = await request(app)
      .post(`${BASE}/apply`)
      .set("Cookie", studentCookie)
      .send({ code: VALID_COUPON });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Negative Price: originalPrice < 0 → 400", async () => {
    const res = await request(app)
      .post(`${BASE}/apply`)
      .set("Cookie", studentCookie)
      .send({ code: VALID_COUPON, originalPrice: -1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Invalid Coupon: code không tồn tại → 404", async () => {
    const res = await request(app)
      .post(`${BASE}/apply`)
      .set("Cookie", studentCookie)
      .send({ code: INVALID_COUPON, originalPrice: 200000 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid coupon code");
  });

  it("❌ Coupon Expired: expiryDate đã qua → 400", async () => {
    const res = await request(app)
      .post(`${BASE}/apply`)
      .set("Cookie", studentCookie)
      .send({ code: EXPIRED_COUPON, originalPrice: 200000 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Coupon has expired");
  });

  it("✅ Success: valid coupon, student chưa dùng → 200, discount data", async () => {
    const originalPrice = 500000;
    const res = await request(app)
      .post(`${BASE}/apply`)
      .set("Cookie", studentCookie)
      .send({ code: VALID_COUPON, originalPrice });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Coupon applied successfully.");
    expect(res.body.result).toHaveProperty("couponCode", VALID_COUPON);
    expect(res.body.result).toHaveProperty("discountPercent", 20);
    expect(res.body.result.discountAmount).toBe(100000); // 20% of 500000
    expect(res.body.result.newPrice).toBe(400000);       // 500000 - 100000
  });

  it.todo("❌ Coupon Not Active Yet: startDate in future → 400 (no fixture in DB)");

  it.todo("❌ Coupon Already Used: user already in usersUsed → 409 (applyCoupon is read-only, needs DB pre-seeding)");
});
