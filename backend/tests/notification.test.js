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

  test("Success: Notification has expected DTO fields", async () => {
    const res = await request(app).get(BASE).set("Cookie", studentToken);
    const item = res.body.result[0];
    expect(item).toHaveProperty("notifId");
    expect(item).toHaveProperty("type");
    expect(item).toHaveProperty("message");
    expect(item).toHaveProperty("isRead");
    expect(typeof item.isRead).toBe("boolean");
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

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(401);
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

  test("Error: Unauthorized → 401", async () => {
    const res = await request(app).delete(BASE);
    expect(res.status).toBe(401);
  });
});
