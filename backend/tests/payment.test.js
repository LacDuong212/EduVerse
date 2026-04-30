/**
 * PAYMENT API Tests
 * Jira: EDV-209 (Create Payment URL — POST /api/payments)
 *
 * Route map:
 *   POST  /api/payments              → createPayment  [auth: student]
 *   GET   /api/payments/vnpay/ipn    → vnpayIpn       [no auth]
 *   GET   /api/payments/vnpay/return → vnpayReturn    [no auth]
 *   POST  /api/payments/momo/ipn     → momoIpn        [no auth]
 *   GET   /api/payments/momo/return  → momoReturn     [no auth]
 *
 * ⚠️  IDEMPOTENCY NOTE:
 *   Tests marked "ONE-SHOT" complete the order for that course, making it "owned"
 *   by the student. Re-running requires the student to not have a completed order
 *   for that course. Reset DB state before re-running those tests.
 *
 * Course fixtures (student chưa có completed order):
 *   COURSE_A = 69513a22712d2de88391a13d  449 000 ₫  [reusable — chỉ cancel]
 *   COURSE_B = 694eaadfed8f2ec45dc0ee5e  699 000 ₫  [VNPay IPN success    ⚠️ ONE-SHOT]
 *   COURSE_C = 694eb029a3f9fb4adc5d8ce7  549 000 ₫  [VNPay return success  ⚠️ ONE-SHOT]
 *   COURSE_D = 695144b4b08e6cc6cab4ff7f  299 000 ₫  [MoMo IPN success     ⚠️ ONE-SHOT]
 *   COURSE_E = 69513704712d2de88391a0d3  350 000 ₫  [MoMo return success   ⚠️ ONE-SHOT]
 */

import request from "supertest";
import crypto from "crypto";
import qs from "qs";
import app from "../src/app.js";
import "../tests/setup.js";
import Order from "#modules/order/order.model.js";
import Transaction from "#modules/payment/transaction.model.js";

// ─── Fixtures ────────────────────────────────────────────────────────────────
const STUDENT    = { email: "lacduongldg212@gmail.com",       password: "Abc@12345" };
const INSTRUCTOR = { email: "22110304@student.hcmute.edu.vn", password: "Abc@12345" };

const COURSE_A = "69513a22712d2de88391a13d"; // Build your first React JS App   — reusable (cancel)
const COURSE_B = "694eaadfed8f2ec45dc0ee5e"; // Learn Devops Kubernetes         — VNPay IPN success ⚠️
const COURSE_C = "694eb029a3f9fb4adc5d8ce7"; // Microsoft Azure for Beginners  — VNPay return success ⚠️
const COURSE_D = "695144b4b08e6cc6cab4ff7f"; // Full Stack Development Course  — MoMo IPN success ⚠️
const COURSE_E = "69513704712d2de88391a0d3"; // Build Modern API Nest JS        — MoMo return success ⚠️

const COMPLETED_ORDER_ID  = "69e51a9606bb94f99e044438"; // completed, student's
const OTHER_USER_ORDER_ID = "69ce88fce3bcb6f809428be2"; // belongs to another user
const INVALID_ID          = "not-a-valid-id";
const NONEXISTENT_ID      = "000000000000000000000001";

// ─── VNPay signature helpers (mirrors vnpay.provider.js) ─────────────────────

/** Replicate the provider's sortObject to generate identical signatures. */
const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).map(k => encodeURIComponent(k)).sort();
  for (const k of keys) {
    sorted[k] = encodeURIComponent(obj[decodeURIComponent(k)]).replace(/%20/g, "+");
  }
  return sorted;
};

/**
 * Build a signed VNPay query with PLAIN (decoded) values + SecureHash.
 * Pass directly to Supertest .query() — Express decodes the URL before
 * verifySignature sees it, matching what the provider generates.
 */
const buildVnpayQuery = (orderId, amount, rspCode = "00", transNo = null) => {
  const txnNo = transNo ?? `VNP${Date.now()}`;
  const params = {
    vnp_Amount:            String(Math.round(amount * 100)),
    vnp_BankCode:          "NCB",
    vnp_CardType:          "ATM",
    vnp_OrderInfo:         `Payment for EduVerse Order ${orderId}`,
    vnp_PayDate:           "20260422120000",
    vnp_ResponseCode:      rspCode,
    vnp_TmnCode:           process.env.VNP_TMNCODE,
    vnp_TransactionNo:     txnNo,
    vnp_TransactionStatus: rspCode === "00" ? "00" : rspCode,
    vnp_TxnRef:            orderId,
  };
  const sorted   = sortObject(params);
  const signData = qs.stringify(sorted, { encode: false });
  const hash     = crypto
    .createHmac("sha512", process.env.VNP_HASHSECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
  return { ...params, vnp_SecureHash: hash };
};

/** Build signed VNPay params WITHOUT vnp_TxnRef (triggers RspCode 01). */
const buildVnpayQueryNoOrderId = (amount = 449000) => {
  const params = {
    vnp_Amount:            String(Math.round(amount * 100)),
    vnp_BankCode:          "NCB",
    vnp_ResponseCode:      "00",
    vnp_TmnCode:           process.env.VNP_TMNCODE,
    vnp_TransactionNo:     `VNP${Date.now()}`,
    vnp_TransactionStatus: "00",
  };
  const sorted   = sortObject(params);
  const signData = qs.stringify(sorted, { encode: false });
  const hash     = crypto
    .createHmac("sha512", process.env.VNP_HASHSECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
  return { ...params, vnp_SecureHash: hash };
};

// ─── MoMo signature helpers (mirrors momo.provider.verifySignature) ──────────

/**
 * Build a signed MoMo payload.
 * Works for both POST body (momoIpn) and GET query (momoReturn) since
 * verifySignature destructures the same fields from req.body or req.query.
 */
const buildMomoBody = (orderId, amount, resultCode = 0, transId = null) => {
  const txnId        = transId ?? `MMO${Date.now()}`;
  const requestId    = `${orderId}-test-${Date.now()}`;
  const responseTime = Date.now();
  const orderInfo    = `Payment for EduVerse Order ${orderId}`;
  const orderType    = "momo_wallet";
  const payType      = "credit";
  const extraData    = "";
  const message      = "";

  const rawSignature =
    `accessKey=${process.env.MOMO_ACCESS_KEY}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&message=${message}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&orderType=${orderType}` +
    `&partnerCode=${process.env.MOMO_PARTNER_CODE}` +
    `&payType=${payType}` +
    `&requestId=${requestId}` +
    `&responseTime=${responseTime}` +
    `&resultCode=${resultCode}` +
    `&transId=${txnId}`;

  const signature = crypto
    .createHmac("sha256", process.env.MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest("hex");

  return {
    partnerCode:  process.env.MOMO_PARTNER_CODE,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId:      txnId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature,
  };
};

// ─── Auth setup ───────────────────────────────────────────────────────────────
let studentCookie    = "";
let instructorCookie = "";

beforeAll(async () => {
  const [studentRes, instrRes] = await Promise.all([
    request(app).post("/api/auth/login").send(STUDENT),
    request(app).post("/api/auth/login").send(INSTRUCTOR),
  ]);
  studentCookie    = studentRes.headers["set-cookie"]?.[0] ?? "";
  instructorCookie = instrRes.headers["set-cookie"]?.[0]  ?? "";
});

// ─── Helper: create a fresh pending order ────────────────────────────────────
const createPendingOrder = async (courseId = COURSE_A, paymentMethod = "vnpay") => {
  await request(app).delete("/api/cart").set("Cookie", studentCookie);
  await request(app)
    .post("/api/cart/items")
    .set("Cookie", studentCookie)
    .send({ courseId });
  const res = await request(app)
    .post("/api/orders")
    .set("Cookie", studentCookie)
    .send({ selectedCourseIds: [courseId], paymentMethod });
  return res.body.result ?? null; // { orderId, totalAmount, status, ... }
};

/** Huỷ tất cả pending orders + clear cart trước mỗi test */
beforeEach(async () => {
  const ordersRes = await request(app).get("/api/orders").set("Cookie", studentCookie);
  const pending   = (ordersRes.body.result || []).filter(o => o.status === "pending");
  for (const o of pending) {
    await request(app).patch(`/api/orders/${o.orderId}/cancel`).set("Cookie", studentCookie);
  }
  await request(app).delete("/api/cart").set("Cookie", studentCookie);
});

// =============================================================================
// EDV-209 | POST /api/payments — Create Payment URL
// =============================================================================
describe("EDV-209 | POST /api/payments", () => {

  it("✅ Success (VNPay): student + pending order → 200 'Payment URL created successfully', payUrl + paymentMethod", async () => {
    const order = await createPendingOrder(COURSE_A, "vnpay");
    expect(order).not.toBeNull();

    const res = await request(app)
      .post("/api/payments")
      .set("Cookie", studentCookie)
      .send({ orderId: order.orderId, paymentMethod: "vnpay" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Payment URL created successfully");
    expect(res.body.result).toHaveProperty("payUrl");
    expect(res.body.result.payUrl).toContain(process.env.VNP_URL);
    expect(res.body.result.paymentMethod).toBe("vnpay");
  });

  it("✅ Success (MoMo): student + pending order → 200 'Payment URL created successfully', payUrl + paymentMethod", async () => {
    const order = await createPendingOrder(COURSE_A, "momo");
    expect(order).not.toBeNull();

    const res = await request(app)
      .post("/api/payments")
      .set("Cookie", studentCookie)
      .send({ orderId: order.orderId, paymentMethod: "momo" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Payment URL created successfully");
    expect(res.body.result).toHaveProperty("payUrl");
    expect(res.body.result.paymentMethod).toBe("momo");
  }, 30000); // MoMo gọi external sandbox — cần timeout dài hơn

  it("❌ Unauthorized: không đăng nhập → 401", async () => {
    const res = await request(app)
      .post("/api/payments")
      .send({ orderId: NONEXISTENT_ID, paymentMethod: "vnpay" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("❌ Forbidden: instructor role → 403", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Cookie", instructorCookie)
      .send({ orderId: NONEXISTENT_ID, paymentMethod: "vnpay" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("❌ Missing orderId → 400 Zod validation", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Cookie", studentCookie)
      .send({ paymentMethod: "vnpay" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Invalid orderId format (not ObjectId) → 400 Zod validation", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Cookie", studentCookie)
      .send({ orderId: INVALID_ID, paymentMethod: "vnpay" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Missing paymentMethod → 400 Zod validation", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Cookie", studentCookie)
      .send({ orderId: NONEXISTENT_ID });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Invalid paymentMethod ('creditcard') → 400 Zod validation", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Cookie", studentCookie)
      .send({ orderId: NONEXISTENT_ID, paymentMethod: "creditcard" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("❌ Order not found (non-existent ID) → 404 'Order not found'", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Cookie", studentCookie)
      .send({ orderId: NONEXISTENT_ID, paymentMethod: "vnpay" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/order not found/i);
  });

  it("❌ Order belongs to another user → 404 'Order not found'", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Cookie", studentCookie)
      .send({ orderId: OTHER_USER_ORDER_ID, paymentMethod: "vnpay" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/order not found/i);
  });

  it("❌ Order is not pending (completed) → 400 'not pending'", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Cookie", studentCookie)
      .send({ orderId: COMPLETED_ORDER_ID, paymentMethod: "vnpay" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not pending/i);
  });

  it.skip("❌ Order Expired: expiresAt < now → 400 'Order expired.' [cần fixture DB với expiresAt quá khứ]", async () => {
    // Cần một order với status=pending và expiresAt < Date.now() trong DB.
    // Không thể tạo qua API (TTL = 1 giờ); cần insert trực tiếp vào DB (yêu cầu approve).
    const EXPIRED_ORDER_ID = ""; // placeholder
    const res = await request(app)
      .post("/api/payments")
      .set("Cookie", studentCookie)
      .send({ orderId: EXPIRED_ORDER_ID, paymentMethod: "vnpay" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/expired/i);
  });
});

// =============================================================================
// VNPay IPN | GET /api/payments/vnpay/ipn
// =============================================================================
describe("VNPay IPN | GET /api/payments/vnpay/ipn", () => {

  it("✅ Valid sig + rspCode 00 → 200 {RspCode:'00'}, DB: order completed + transaction success [⚠️ ONE-SHOT: COURSE_B]", async () => {
    const order = await createPendingOrder(COURSE_B);
    if (!order) { console.warn("⚠️ ONE-SHOT: COURSE_B already owned — test skipped (DB state exhausted)"); return; }

    const txnNo  = `VNP${Date.now()}`;
    const params = buildVnpayQuery(order.orderId, order.totalAmount, "00", txnNo);

    const res = await request(app).get("/api/payments/vnpay/ipn").query(params);

    expect(res.status).toBe(200);
    expect(res.body.RspCode).toBe("00");
    expect(res.body.Message).toBe("Success");

    // DB cross-validate: order status → completed
    const dbOrder = await Order.findById(order.orderId).lean();
    expect(dbOrder.status).toBe("completed");

    // DB cross-validate: transaction created with correct fields
    const tx = await Transaction.findOne({ transactionId: txnNo }).lean();
    expect(tx).not.toBeNull();
    expect(tx.status).toBe("success");
    expect(tx.gateway).toBe("vnpay");
    expect(tx.amount).toBe(order.totalAmount);
  });

  it("❌ Valid sig + rspCode 24 (user cancelled) → 200 {RspCode:'00'}, DB: order cancelled + transaction failed", async () => {
    const order = await createPendingOrder(COURSE_A);
    expect(order).not.toBeNull();

    const txnNo  = `VNP${Date.now()}`;
    const params = buildVnpayQuery(order.orderId, order.totalAmount, "24", txnNo);

    const res = await request(app).get("/api/payments/vnpay/ipn").query(params);

    expect(res.status).toBe(200);
    expect(res.body.RspCode).toBe("00");
    expect(res.body.Message).toBe("Success");

    // DB cross-validate: order → cancelled
    const dbOrder = await Order.findById(order.orderId).lean();
    expect(dbOrder.status).toBe("cancelled");

    // DB cross-validate: transaction with failed status
    const tx = await Transaction.findOne({ transactionId: txnNo }).lean();
    expect(tx).not.toBeNull();
    expect(tx.status).toBe("failed");
    expect(tx.gateway).toBe("vnpay");
  });

  it("❌ Invalid signature → 200 {RspCode:'97', Message:'Checksum failed'}", async () => {
    const res = await request(app)
      .get("/api/payments/vnpay/ipn")
      .query({
        vnp_TxnRef:       NONEXISTENT_ID,
        vnp_Amount:       "10000000",
        vnp_ResponseCode: "00",
        vnp_SecureHash:   "invalidsignature",
      });

    expect(res.status).toBe(200);
    expect(res.body.RspCode).toBe("97");
    expect(res.body.Message).toContain("Checksum");
  });

  it("❌ No vnp_TxnRef (valid sig) → 200 {RspCode:'01', Message:'Invalid request'}", async () => {
    // Params without vnp_TxnRef but signed correctly over those params
    const params = buildVnpayQueryNoOrderId();

    const res = await request(app).get("/api/payments/vnpay/ipn").query(params);

    expect(res.status).toBe(200);
    expect(res.body.RspCode).toBe("01");
    expect(res.body.Message).toContain("Invalid");
  });
});

// =============================================================================
// VNPay return | GET /api/payments/vnpay/return
// =============================================================================
describe("VNPay return | GET /api/payments/vnpay/return", () => {

  it("✅ Valid sig + rspCode 00 → 302 redirect to /student/payment-success [⚠️ ONE-SHOT: COURSE_C]", async () => {
    const order = await createPendingOrder(COURSE_C);
    if (!order) { console.warn("⚠️ ONE-SHOT: COURSE_C already owned — test skipped (DB state exhausted)"); return; }

    const txnNo  = `VNP${Date.now()}`;
    const params = buildVnpayQuery(order.orderId, order.totalAmount, "00", txnNo);

    const res = await request(app).get("/api/payments/vnpay/return").query(params);

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("/student/payment-success");
    expect(res.headers.location).toContain(order.orderId);
    expect(res.headers.location).toContain("gateway=vnpay");
  });

  it("❌ Valid sig + rspCode 24 → 302 redirect to /student/payment-failed, DB: order cancelled", async () => {
    const order = await createPendingOrder(COURSE_A);
    expect(order).not.toBeNull();

    const txnNo  = `VNP${Date.now()}`;
    const params = buildVnpayQuery(order.orderId, order.totalAmount, "24", txnNo);

    const res = await request(app).get("/api/payments/vnpay/return").query(params);

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("/student/payment-failed");

    // DB cross-validate: order → cancelled
    const dbOrder = await Order.findById(order.orderId).lean();
    expect(dbOrder.status).toBe("cancelled");
  });
});

// =============================================================================
// MoMo IPN | POST /api/payments/momo/ipn
// =============================================================================
describe("MoMo IPN | POST /api/payments/momo/ipn", () => {

  it("✅ Valid sig + resultCode 0 → 204, DB: order completed + transaction success [⚠️ ONE-SHOT: COURSE_D]", async () => {
    const order = await createPendingOrder(COURSE_D);
    if (!order) { console.warn("⚠️ ONE-SHOT: COURSE_D already owned — test skipped (DB state exhausted)"); return; }

    const txnId = `MMO${Date.now()}`;
    const body  = buildMomoBody(order.orderId, order.totalAmount, 0, txnId);

    const res = await request(app).post("/api/payments/momo/ipn").send(body);

    expect(res.status).toBe(204);

    // DB cross-validate: order → completed
    const dbOrder = await Order.findById(order.orderId).lean();
    expect(dbOrder.status).toBe("completed");

    // DB cross-validate: transaction created
    const tx = await Transaction.findOne({ transactionId: txnId }).lean();
    expect(tx).not.toBeNull();
    expect(tx.status).toBe("success");
    expect(tx.gateway).toBe("momo");
    expect(tx.amount).toBe(order.totalAmount);
  });

  it("❌ Valid sig + resultCode 1006 (failed) → 204, DB: order cancelled + transaction failed", async () => {
    const order = await createPendingOrder(COURSE_A);
    expect(order).not.toBeNull();

    const txnId = `MMO${Date.now()}`;
    const body  = buildMomoBody(order.orderId, order.totalAmount, 1006, txnId);

    const res = await request(app).post("/api/payments/momo/ipn").send(body);

    expect(res.status).toBe(204);

    // DB cross-validate: order → cancelled
    const dbOrder = await Order.findById(order.orderId).lean();
    expect(dbOrder.status).toBe("cancelled");

    // DB cross-validate: transaction with failed status
    const tx = await Transaction.findOne({ transactionId: txnId }).lean();
    expect(tx).not.toBeNull();
    expect(tx.status).toBe("failed");
    expect(tx.gateway).toBe("momo");
  });

  it("❌ Invalid signature → 200 {message: 'Invalid signature'}", async () => {
    const res = await request(app)
      .post("/api/payments/momo/ipn")
      .send({
        partnerCode:  "MOMO",
        orderId:      NONEXISTENT_ID,
        requestId:    "test-req",
        amount:       100000,
        resultCode:   0,
        transId:      "test-txn",
        orderType:    "momo_wallet",
        payType:      "credit",
        responseTime: Date.now(),
        extraData:    "",
        message:      "",
        orderInfo:    "test",
        signature:    "invalidsignature",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Invalid signature");
  });
});

// =============================================================================
// MoMo return | GET /api/payments/momo/return
// =============================================================================
describe("MoMo return | GET /api/payments/momo/return", () => {

  it("✅ Valid sig + resultCode 0 → 302 redirect to /student/payment-success [⚠️ ONE-SHOT: COURSE_E]", async () => {
    const order = await createPendingOrder(COURSE_E);
    if (!order) { console.warn("⚠️ ONE-SHOT: COURSE_E already owned — test skipped (DB state exhausted)"); return; }

    const txnId  = `MMO${Date.now()}`;
    const params = buildMomoBody(order.orderId, order.totalAmount, 0, txnId);

    const res = await request(app).get("/api/payments/momo/return").query(params);

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("/student/payment-success");
    expect(res.headers.location).toContain(order.orderId);
    expect(res.headers.location).toContain("gateway=momo");
  });

  it("❌ Valid sig + resultCode 1006 → 302 redirect to /student/payment-failed, DB: order cancelled", async () => {
    const order = await createPendingOrder(COURSE_A);
    expect(order).not.toBeNull();

    const txnId  = `MMO${Date.now()}`;
    const params = buildMomoBody(order.orderId, order.totalAmount, 1006, txnId);

    const res = await request(app).get("/api/payments/momo/return").query(params);

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("/student/payment-failed");

    // DB cross-validate: order → cancelled
    const dbOrder = await Order.findById(order.orderId).lean();
    expect(dbOrder.status).toBe("cancelled");
  });
});

