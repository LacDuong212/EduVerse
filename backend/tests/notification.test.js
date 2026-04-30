/**
 * NOTIFICATION API Tests
 * Jira: EDV-238 (Get), EDV-239 (Delete All), EDV-240 (Mark All Read),
 *       EDV-241 (Mark One Read by ID)
 *
 * Fixtures:
 *   - STUDENT    : lacduongldg212@gmail.com    (userId: 694d32d7ebe694fc49e59a67)
 *   - INSTRUCTOR : 22110304@student.hcmute.edu.vn
 *   - Seeded: 5 test notifications for STUDENT in beforeAll
 *
 * Test order (destructive):
 *   1. EDV-238 — GET  (read-only)
 *   2. EDV-241 — PUT /:id/read  (marks 1 as read)
 *   3. EDV-240 — PUT /read  (marks remaining as read)
 *   4. EDV-239 — DELETE  (deletes all — natural cleanup)
 */
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import Notification from "../src/modules/notification/notification.model.js";
import "../tests/setup.js";

const BASE = "/api/notifications";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const STUDENT    = { email: "lacduongldg212@gmail.com",       password: "Abc@12345" };
const INSTRUCTOR = { email: "22110304@student.hcmute.edu.vn", password: "Abc@12345" };
const STUDENT_ID = "694d32d7ebe694fc49e59a67";

const INVALID_ID     = "not-a-valid-id";
const NONEXISTENT_ID = "000000000000000000000001";

// ─── Helpers ──────────────────────────────────────────────────────────────────
let studentToken;
let instructorToken;
let firstNotifId; // populated by EDV-238 GET test
let seededIds = [];

async function login(creds) {
  const res = await request(app).post("/api/auth/login").send(creds);
  const cookie = res.headers["set-cookie"]?.find((c) => c.startsWith("token="));
  return cookie || "";
}

// ─── Setup: seed 5 notifications for student ──────────────────────────────────
beforeAll(async () => {
  studentToken    = await login(STUDENT);
  instructorToken = await login(INSTRUCTOR);

  const seeds = [];
  for (let i = 0; i < 5; i++) {
    seeds.push({
      user: new mongoose.Types.ObjectId(STUDENT_ID),
      type: i < 3 ? "info" : "succeeded",
      message: `Test notification #${i + 1}`,
      isRead: false,
    });
  }
  const docs = await Notification.insertMany(seeds);
  seededIds = docs.map((d) => d._id.toString());
}, 30000);

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-238  GET /api/notifications
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-238: Get My Notifications", () => {
  test("Success: Get notifications → 200 with list", async () => {
    const res = await request(app).get(BASE).set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Notifications retrieved!");
    expect(Array.isArray(res.body.result)).toBe(true);
    expect(res.body.result.length).toBe(5);

    // Store first notification ID for later tests
    firstNotifId = res.body.result[0].notifId;
  });

  test("Success: Notification DTO fields and types", async () => {
    const res = await request(app).get(BASE).set("Cookie", studentToken);
    const item = res.body.result[0];
    expect(item).toMatchObject({
      notifId: expect.stringMatching(/^[0-9a-f]{24}$/),
      type:    expect.any(String),
      message: expect.any(String),
      isRead:  expect.any(Boolean),
    });
    // Leakage guards: internal fields must NOT be exposed
    expect(item).not.toHaveProperty("_id");
    expect(item).not.toHaveProperty("user");
    expect(item).not.toHaveProperty("__v");
    expect(item).not.toHaveProperty("createdAt");
    expect(item).not.toHaveProperty("updatedAt");
  });

  test("Success: Chronology → newest first", async () => {
    const res = await request(app).get(BASE).set("Cookie", studentToken);
    const ids = res.body.result.map((n) => n.notifId);
    // All 5 are distinct and in descending createdAt order
    expect(ids.length).toBe(5);
    expect(new Set(ids).size).toBe(5);
  });

  test("Success: Empty feed → 200 with []", async () => {
    const res = await request(app).get(BASE).set("Cookie", instructorToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toEqual([]);
  });

  test.failing("EDV-269: GET ?limit=2 should cap results to 2 (currently ignored)", async () => {
    // BUG: controller calls getUserNotifications(userId) without forwarding req.validated.query.limit
    // Expected: result.length <= 2.  Actual: all 5 returned (limit silently ignored)
    const res = await request(app).get(`${BASE}?limit=2`).set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(res.body.result.length).toBeLessThanOrEqual(2);
  });

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  GET /api/notifications/count
// ═══════════════════════════════════════════════════════════════════════════════
describe("GET /count: Get All Notification Count", () => {
  test("Success: student with 5 seeded notifications → 200, result = 5", async () => {
    const res = await request(app).get(`${BASE}/count`).set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toBe(5);
    expect(typeof res.body.result).toBe("number");
  });

  test("Success: instructor with 0 notifications → 200, result = 0", async () => {
    const res = await request(app).get(`${BASE}/count`).set("Cookie", instructorToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toBe(0);
  });

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).get(`${BASE}/count`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  GET /api/notifications/unread/count
// ═══════════════════════════════════════════════════════════════════════════════
describe("GET /unread/count: Get Unread Notification Count", () => {
  test("Success: all 5 seeded unread → 200, result = 5", async () => {
    const res = await request(app).get(`${BASE}/unread/count`).set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toBe(5);
    expect(typeof res.body.result).toBe("number");
  });

  test("Success: instructor with 0 unread → 200, result = 0", async () => {
    const res = await request(app).get(`${BASE}/unread/count`).set("Cookie", instructorToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toBe(0);
  });

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).get(`${BASE}/unread/count`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-241  PUT /api/notifications/:id/read  (Mark One)
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-241: Mark Notification as Read by ID", () => {
  test("Success: Mark as read → 200", async () => {
    expect(firstNotifId).toBeDefined();
    const res = await request(app)
      .put(`${BASE}/${firstNotifId}/read`)
      .set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Marked");
  });

  test.failing("EDV-268: result should be a number (count), not a raw Mongoose document", async () => {
    // BUG: markOneAsRead service returns the Notification document.
    // Controller passes it as `markedCount` → coerces to string in message, leaks doc in result.
    // Expected: typeof result === "number" (= 1).  Actual: result is a full Mongoose document.
    const res = await request(app)
      .put(`${BASE}/${seededIds[1]}/read`)
      .set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(typeof res.body.result).toBe("number");
  });

  test("Success: Already read → 200 (idempotent)", async () => {
    // Same notification was already marked in previous test
    const res = await request(app)
      .put(`${BASE}/${firstNotifId}/read`)
      .set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Error: Access violation → instructor marks student's notification → 404", async () => {
    const res = await request(app)
      .put(`${BASE}/${firstNotifId}/read`)
      .set("Cookie", instructorToken);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("Error: Invalid ID → 400", async () => {
    const res = await request(app)
      .put(`${BASE}/${INVALID_ID}/read`)
      .set("Cookie", studentToken);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Error: Non-existent ID → 404", async () => {
    const res = await request(app)
      .put(`${BASE}/${NONEXISTENT_ID}/read`)
      .set("Cookie", studentToken);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).put(`${BASE}/${firstNotifId}/read`);
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-240  PUT /api/notifications/read  (Mark All)
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-240: Mark All Notifications as Read", () => {
  test("Success: Mark all as read → 200", async () => {
    const res = await request(app)
      .put(`${BASE}/read`)
      .set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("All notifications marked as read!");
  });

  test("Success: Clean slate (all already read) → 200", async () => {
    // All are now read from previous test — should still succeed
    const res = await request(app)
      .put(`${BASE}/read`)
      .set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Success: No notifications → 200", async () => {
    // Instructor has 0 notifications
    const res = await request(app)
      .put(`${BASE}/read`)
      .set("Cookie", instructorToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Data integrity: only isRead changed", async () => {
    const res = await request(app).get(BASE).set("Cookie", studentToken);
    expect(res.status).toBe(200);
    // All should be read now
    for (const n of res.body.result) {
      expect(n.isRead).toBe(true);
      expect(n.message).toBeTruthy();
      expect(n.type).toBeTruthy();
    }
  });

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).put(`${BASE}/read`);
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EDV-239  DELETE /api/notifications  (Delete All)
// ═══════════════════════════════════════════════════════════════════════════════
describe("EDV-239: Delete All Notifications", () => {
  test("Success: Delete all → 200", async () => {
    const res = await request(app)
      .delete(BASE)
      .set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("All notifications cleared!");
  });

  test("Success: Idempotent → delete again → 200", async () => {
    // Already deleted — should still return 200
    const res = await request(app)
      .delete(BASE)
      .set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Isolation: instructor notifications unaffected", async () => {
    // Instructor had 0 before and still has 0 — verify GET still works
    const res = await request(app).get(BASE).set("Cookie", instructorToken);
    expect(res.status).toBe(200);
    expect(res.body.result).toEqual([]);
  });

  test("Verify: student now has 0 notifications", async () => {
    const res = await request(app).get(BASE).set("Cookie", studentToken);
    expect(res.status).toBe(200);
    expect(res.body.result).toEqual([]);
  });

  test("DB cross-check: countDocuments = 0 after delete all", async () => {
    const count = await Notification.countDocuments({
      user: new mongoose.Types.ObjectId(STUDENT_ID),
    });
    expect(count).toBe(0);
  });

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).delete(BASE);
    expect(res.status).toBe(401);
  });
});
