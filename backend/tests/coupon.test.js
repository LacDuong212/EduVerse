/**
 * COUPON API Tests
 * Jira: EDV-216 (Apply Coupon), EDV-217 (Get All Coupons)
 *
 * Fixtures (DB eduverse2):
 *   - STUDENT: lacduongldg212@gmail.com (userId: 694d32d7ebe694fc49e59a67)
 *   - SUMMER2025    : active, 20% off, valid Apr 2025–Jun 2026, student NOT in usersUsed
 *   - WELCOME50     : active, valid Dec 2025–Dec 2026, student NOT in usersUsed
 *   - SORRY_ERROR   : active=true but expiryDate 2025-12-13 → triggers "Coupon has expired"
 *
 * Bugs documented:
 *   - EDV-266: usersUsed.includes(userId) — ObjectId vs string, always false (no DB fixture to demo)
 *   - EDV-267: validateCoupon skips startDate check (no future-startDate coupon in DB to demo)
 *
 * Note: "Not Active Yet" & "Already Used" tests are .todo() because:
 *   - No coupon with future startDate exists in DB (EDV-267)
 *   - No coupon has student in usersUsed (EDV-266 bug means check never fires anyway)
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
    // Item shape + type assertions
    const first = res.body.result[0];
    expect(first).toMatchObject({
      couponId:        expect.stringMatching(/^[0-9a-f]{24}$/),
      code:            expect.any(String),
      discountPercent: expect.any(Number),
      startDate:       expect.any(String),
      expiryDate:      expect.any(String),
      isActive:        expect.any(Boolean),
    });
    // Leakage guard — usersUsed must NOT appear in response
    expect(first).not.toHaveProperty("usersUsed");
    expect(first).not.toHaveProperty("__v");
    expect(res.body).not.toHaveProperty("stack");
  });

  it("✅ Get All Coupons: authenticated user also gets 200 (public endpoint)", async () => {
    const res = await request(app).get(BASE).set("Cookie", studentCookie);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
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

  it("✅ Success: valid coupon, student chưa dùng → 200, discount data với correct math", async () => {
    const originalPrice = 500000;
    const res = await request(app)
      .post(`${BASE}/apply`)
      .set("Cookie", studentCookie)
      .send({ code: VALID_COUPON, originalPrice });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Coupon applied successfully.");
    expect(res.body.result).toMatchObject({
      couponCode:      VALID_COUPON,
      discountPercent: 20,
      discountAmount:  100000, // 20% of 500000
      newPrice:        400000, // 500000 - 100000
    });
    // Leakage guard
    expect(res.body.result).not.toHaveProperty("usersUsed");
    expect(res.body.result).not.toHaveProperty("_id");
    expect(res.body.result).not.toHaveProperty("__v");
    expect(res.body).not.toHaveProperty("stack");
  });

  it("✅ Instructor can apply coupon: route has protect only, no restrictTo → 200", async () => {
    const res = await request(app)
      .post(`${BASE}/apply`)
      .set("Cookie", instructorCookie)
      .send({ code: VALID_COUPON, originalPrice: 200000 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("✅ Zero originalPrice: 0 → 200, discountAmount=0, newPrice=0", async () => {
    const res = await request(app)
      .post(`${BASE}/apply`)
      .set("Cookie", studentCookie)
      .send({ code: VALID_COUPON, originalPrice: 0 });
    expect(res.status).toBe(200);
    expect(res.body.result.discountAmount).toBe(0);
    expect(res.body.result.newPrice).toBe(0);
  });

  it.todo("❌ Coupon Not Active Yet: startDate in future → 400 (EDV-267: validateCoupon also missing this check; no fixture in DB)");

  it.todo("❌ [EDV-266] Coupon Already Used: usersUsed.includes(userId) always false (ObjectId vs string) — guard never fires; no fixture with student in usersUsed");
});
