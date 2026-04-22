/**
 * ORDER API Tests
 * Jira: EDV-211 (Get Orders), EDV-212 (Get Order Detail),
 *       EDV-213 (Create Order), EDV-214 (Cancel Order)
 *
 * Fixtures dựa trên data thật trong DB:
 *   STUDENT             : lacduongldg212@gmail.com — có 3 orders tồn tại
 *   INSTRUCTOR          : 22110304@student.hcmute.edu.vn
 *   COMPLETED_ORDER_ID  : 69e51a9606bb94f99e044438 (completed, owned by STUDENT)
 *   CANCELLED_ORDER_ID  : 69e637df216c2dc8d602b19b (cancelled, owned by STUDENT)
 *   OTHER_USER_ORDER_ID : 69ce88fce3bcb6f809428be2 (different user)
 *   COURSE_A            : 694d046addf90206a887c535 (Crash Course CS — student chưa own)
 *   COURSE_B            : 694e9d90ed8f2ec45dc0e653 (Crash Course Data Science — student chưa own)
 */

import request from "supertest";
import app from "../src/app.js";
import "../tests/setup.js";

// ─── Fixtures ────────────────────────────────────────────────────────────────
const STUDENT   = { email: "lacduongldg212@gmail.com",       password: "Abc@12345" };
const INSTRUCTOR = { email: "22110304@student.hcmute.edu.vn", password: "Abc@12345" };

const COMPLETED_ORDER_ID  = "69e51a9606bb94f99e044438"; // completed, student's
const CANCELLED_ORDER_ID  = "69e637df216c2dc8d602b19b"; // cancelled, student's
const OTHER_USER_ORDER_ID = "69ce88fce3bcb6f809428be2"; // belongs to another user
const COURSE_A            = "694d046addf90206a887c535"; // Crash Course CS
const COURSE_B            = "694e9d90ed8f2ec45dc0e653"; // Crash Course Data Science
const INVALID_ID          = "not-a-valid-id";
const NONEXISTENT_ID      = "000000000000000000000001";

// ─── Setup ────────────────────────────────────────────────────────────────────
let studentCookie = "";
let instructorCookie = "";

beforeAll(async () => {
  const studentRes = await request(app)
    .post("/api/auth/login")
    .send({ email: STUDENT.email, password: STUDENT.password });
  studentCookie = studentRes.headers["set-cookie"]?.[0] ?? "";

  const instrRes = await request(app)
    .post("/api/auth/login")
    .send({ email: INSTRUCTOR.email, password: INSTRUCTOR.password });
  instructorCookie = instrRes.headers["set-cookie"]?.[0] ?? "";
});

/** Huỷ tất cả pending orders và clear cart trước mỗi test */
beforeEach(async () => {
  const ordersRes = await request(app)
    .get("/api/orders")
    .set("Cookie", studentCookie);
  const pending = (ordersRes.body.result || []).filter(o => o.status === "pending");
  for (const o of pending) {
    await request(app)
      .patch(`/api/orders/${o.orderId}/cancel`)
      .set("Cookie", studentCookie);
  }
  await request(app).delete("/api/cart").set("Cookie", studentCookie);
});

// =============================================================================
// EDV-211 | GET /api/orders
// =============================================================================
describe("EDV-211 | GET /api/orders", () => {
  it("✅ Success: student có orders → 200 'Orders fetched', result là array có đủ fields", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Orders fetched");
    expect(Array.isArray(res.body.result)).toBe(true);
    // Student có ít nhất 2 completed orders từ fixtures
    expect(res.body.result.length).toBeGreaterThan(0);
    // Mỗi item có các fields cơ bản
    const firstOrder = res.body.result[0];
    expect(firstOrder).toHaveProperty("orderId");
    expect(firstOrder).toHaveProperty("status");
    expect(firstOrder).toHaveProperty("paymentMethod");
    expect(firstOrder).toHaveProperty("totalAmount");
    expect(firstOrder).toHaveProperty("courses");
  });

  it("❌ Unauthorized: không đăng nhập → 401", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("❌ Forbidden: instructor → 403", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Cookie", instructorCookie);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// EDV-212 | GET /api/orders/:id
// =============================================================================
describe("EDV-212 | GET /api/orders/:id", () => {
  it("✅ Success: order tồn tại và thuộc student → 200 'Order fetched', đủ fields", async () => {
    const res = await request(app)
      .get(`/api/orders/${COMPLETED_ORDER_ID}`)
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Order fetched");
    expect(res.body.result).toMatchObject({
      orderId: COMPLETED_ORDER_ID,
      status: "completed",
      paymentMethod: "momo",
    });
    expect(Array.isArray(res.body.result.courses)).toBe(true);
  });

  it("❌ Invalid ID: format không hợp lệ → 400 Zod error", async () => {
    const res = await request(app)
      .get(`/api/orders/${INVALID_ID}`)
      .set("Cookie", studentCookie);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Not Found: ObjectId hợp lệ nhưng không tồn tại → 404 'Order not found.'", async () => {
    const res = await request(app)
      .get(`/api/orders/${NONEXISTENT_ID}`)
      .set("Cookie", studentCookie);
    expect(res.status).toBe(404);
    expect(res.body.message).toContain("Order not found");
  });

  it("❌ Not Owned: order của user khác → 404 'Order not found.'", async () => {
    const res = await request(app)
      .get(`/api/orders/${OTHER_USER_ORDER_ID}`)
      .set("Cookie", studentCookie);
    expect(res.status).toBe(404);
    expect(res.body.message).toContain("Order not found");
  });

  it("❌ Unauthorized: không đăng nhập → 401", async () => {
    const res = await request(app).get(`/api/orders/${COMPLETED_ORDER_ID}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// EDV-213 | POST /api/orders
// =============================================================================
describe("EDV-213 | POST /api/orders", () => {
  it("✅ Success: cart có course, paymentMethod hợp lệ → 201 'Order created', status pending", async () => {
    // Add COURSE_A to cart first
    await request(app)
      .post("/api/cart/items")
      .set("Cookie", studentCookie)
      .send({ courseId: COURSE_A });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", studentCookie)
      .send({ selectedCourseIds: [COURSE_A], paymentMethod: "momo" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Order created");
    expect(res.body.result).toHaveProperty("orderId");
    expect(res.body.result.status).toBe("pending");
    expect(res.body.result.paymentMethod).toBe("momo");
  });

  it("❌ Missing selectedCourseIds → 400 Zod error", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", studentCookie)
      .send({ paymentMethod: "momo" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Empty selectedCourseIds array → 400 Zod error", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", studentCookie)
      .send({ selectedCourseIds: [], paymentMethod: "momo" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Invalid paymentMethod → 400 Zod error", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", studentCookie)
      .send({ selectedCourseIds: [COURSE_A], paymentMethod: "creditcard" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Cart empty → 400 'Your cart is empty.'", async () => {
    // beforeEach đã clear cart
    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", studentCookie)
      .send({ selectedCourseIds: [COURSE_A], paymentMethod: "momo" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cart is empty/i);
  });

  it("❌ Courses not in cart → 409 'Selected courses not found in cart.'", async () => {
    // Cart có COURSE_B nhưng ta chọn COURSE_A
    await request(app)
      .post("/api/cart/items")
      .set("Cookie", studentCookie)
      .send({ courseId: COURSE_B });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", studentCookie)
      .send({ selectedCourseIds: [COURSE_A], paymentMethod: "momo" });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/not found in cart/i);
  });

  it("❌ Unauthorized: không đăng nhập → 401", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ selectedCourseIds: [COURSE_A], paymentMethod: "momo" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// EDV-214 | PATCH /api/orders/:id/cancel
// =============================================================================
describe("EDV-214 | PATCH /api/orders/:id/cancel", () => {
  it("✅ Success: huỷ pending order → 200 'Order cancelled', status = 'cancelled'", async () => {
    // Setup: tạo một pending order
    await request(app)
      .post("/api/cart/items")
      .set("Cookie", studentCookie)
      .send({ courseId: COURSE_A });
    const createRes = await request(app)
      .post("/api/orders")
      .set("Cookie", studentCookie)
      .send({ selectedCourseIds: [COURSE_A], paymentMethod: "vnpay" });
    const pendingOrderId = createRes.body.result?.orderId;

    // Act: cancel
    const res = await request(app)
      .patch(`/api/orders/${pendingOrderId}/cancel`)
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Order cancelled");
    expect(res.body.result.status).toBe("cancelled");
  });

  it("❌ Invalid ID: format không hợp lệ → 400 Zod error", async () => {
    const res = await request(app)
      .patch(`/api/orders/${INVALID_ID}/cancel`)
      .set("Cookie", studentCookie);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Not Found: ObjectId hợp lệ nhưng không tồn tại → 404 'Order not found.'", async () => {
    const res = await request(app)
      .patch(`/api/orders/${NONEXISTENT_ID}/cancel`)
      .set("Cookie", studentCookie);
    expect(res.status).toBe(404);
    expect(res.body.message).toContain("Order not found");
  });

  it("❌ Cannot Cancel: order không ở trạng thái pending → 409 'Processed orders cannot be cancelled'", async () => {
    const res = await request(app)
      .patch(`/api/orders/${CANCELLED_ORDER_ID}/cancel`)
      .set("Cookie", studentCookie);
    expect(res.status).toBe(409);
    expect(res.body.message).toContain("cannot be cancelled");
  });

  it("❌ Unauthorized: không đăng nhập → 401", async () => {
    const res = await request(app)
      .patch(`/api/orders/${COMPLETED_ORDER_ID}/cancel`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("❌ Forbidden: instructor → 403", async () => {
    const res = await request(app)
      .patch(`/api/orders/${COMPLETED_ORDER_ID}/cancel`)
      .set("Cookie", instructorCookie);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
