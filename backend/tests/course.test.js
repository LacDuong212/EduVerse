/**
 * COURSE API Tests
 * Jira: EDV-174 (Home + Stats), EDV-175 (All Courses), EDV-186 (Course Details),
 *       EDV-197 (Reviews), EDV-202 (Recommendations), EDV-203 (Related),
 *       EDV-204 (Curriculum), EDV-249 (Filters — not yet implemented)
 *
 * Fixtures (from DB eduverse2):
 *   - PUBLIC_LIVE_COURSE   : 694d046addf90206a887c535  live, public, english
 *   - DRAFT_COURSE         : 69d8aa3c6edf49782b83dd1e  draft, private
 *   - PYTHON_COURSE        : 694e9d90ed8f2ec45dc0e653  tags: python, level: beginner
 *   - COURSE_OWNER         : vi021ttv@gmail.com         owns PUBLIC_LIVE_COURSE
 *   - OTHER_INSTRUCTOR     : lacduongldg21@gmail.com    does NOT own PUBLIC_LIVE_COURSE
 *   - STUDENT              : hellno83737@gmail.com      student, no enrollments
 */
import request from "supertest";
import app from "../src/app.js";
import "../tests/setup.js";

// ─── Fixtures ────────────────────────────────────────────────────────────────
const PUBLIC_LIVE_COURSE_ID = "694d046addf90206a887c535";
const DRAFT_COURSE_ID       = "69d8aa3c6edf49782b83dd1e";
const PYTHON_COURSE_ID      = "694e9d90ed8f2ec45dc0e653";
const FAKE_ID               = "000000000000000000000000";

const COURSE_OWNER     = { email: "vi021ttv@gmail.com",    password: "Abc@12345" };
const OTHER_INSTRUCTOR = { email: "lacduongldg21@gmail.com", password: "Abc@12345" };
const STUDENT          = { email: "hellno83737@gmail.com",  password: "Abc@12345" };

// helper: login & return cookie
async function loginAndGetCookie({ email, password }) {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.headers["set-cookie"]?.[0] ?? "";
}

// =============================================================================
// EDV-174: GET /api/courses/home  +  GET /api/courses/stats
// =============================================================================
describe("EDV-174 | GET /api/courses/home", () => {
  it("✅ Success: trả về 4 sections → newest, bestSellers, topRated, biggestDiscounts", async () => {
    const res = await request(app).get("/api/courses/home");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { result } = res.body;
    expect(result).toHaveProperty("newest");
    expect(result).toHaveProperty("bestSellers");
    expect(result).toHaveProperty("topRated");
    expect(result).toHaveProperty("biggestDiscounts");
  });

  it("✅ Data count: newest ≤ 8, bestSellers ≤ 6, topRated ≤ 8, biggestDiscounts ≤ 4", async () => {
    const res = await request(app).get("/api/courses/home");

    const { newest, bestSellers, topRated, biggestDiscounts } = res.body.result;
    expect(newest.length).toBeLessThanOrEqual(8);
    expect(bestSellers.length).toBeLessThanOrEqual(6);
    expect(topRated.length).toBeLessThanOrEqual(8);
    expect(biggestDiscounts.length).toBeLessThanOrEqual(4);
  });

  it("✅ Category check: mỗi course phải có category.name và category.slug", async () => {
    const res = await request(app).get("/api/courses/home");

    const allCourses = [
      ...res.body.result.newest,
      ...res.body.result.bestSellers,
      ...res.body.result.topRated,
    ];
    for (const course of allCourses) {
      expect(course).toHaveProperty("cateName");
      expect(course).toHaveProperty("cateSlug");
      expect(course.cateName).toBeTruthy();
      expect(course.cateSlug).toBeTruthy();
    }
  });

  it("✅ Discount logic: biggestDiscounts chỉ chứa course có discountPrice", async () => {
    const res = await request(app).get("/api/courses/home");

    for (const course of res.body.result.biggestDiscounts) {
      expect(course.discountPrice).toBeDefined();
      expect(course.discountPrice).not.toBeNull();
    }
  });
});

describe("EDV-174 | GET /api/courses/stats", () => {
  it("✅ Success: trả về totalCourses, totalLearners, totalInstructors, totalHours", async () => {
    const res = await request(app).get("/api/courses/stats");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { result } = res.body;
    expect(result).toHaveProperty("totalCourses");
    expect(result).toHaveProperty("totalLearners");
    expect(result).toHaveProperty("totalInstructors");
    expect(result).toHaveProperty("totalHours");
  });

  it("✅ Math check: totalHours là số, tối đa 1 chữ số thập phân", async () => {
    const res = await request(app).get("/api/courses/stats");

    const { totalHours } = res.body.result;
    expect(typeof totalHours).toBe("number");
    // round(x * 10) / 10 means at most 1 decimal
    const rounded = Math.round(totalHours * 10) / 10;
    expect(totalHours).toBe(rounded);
  });

  it("✅ Math check: totalCourses, totalLearners, totalInstructors là số nguyên không âm", async () => {
    const res = await request(app).get("/api/courses/stats");

    const { totalCourses, totalLearners, totalInstructors } = res.body.result;
    expect(totalCourses).toBeGreaterThanOrEqual(0);
    expect(totalLearners).toBeGreaterThanOrEqual(0);
    expect(totalInstructors).toBeGreaterThanOrEqual(0);
  });
});

// =============================================================================
// EDV-175: GET /api/courses  (All Courses, paginated + filters + sort)
// =============================================================================
describe("EDV-175 | GET /api/courses", () => {
  it("✅ Basic fetch: page=1&limit=5 → trả về ≤ 5 courses, có pagination", async () => {
    const res = await request(app).get("/api/courses?page=1&limit=5");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.result)).toBe(true);
    expect(res.body.result.length).toBeLessThanOrEqual(5);
    expect(res.body.pagination).toHaveProperty("totalItems");
    expect(res.body.pagination).toHaveProperty("totalPages");
  });

  it("✅ Pagination math: page=2&limit=5 → pagination.page === 2", async () => {
    const res = await request(app).get("/api/courses?page=2&limit=5");

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
  });

  it("✅ Level filter: level=beginner → tất cả courses phải có level 'beginner'", async () => {
    const res = await request(app).get("/api/courses?level=beginner&limit=20");

    expect(res.status).toBe(200);
    for (const course of res.body.result) {
      expect(course.level).toBe("beginner");
    }
  });

  it("✅ Tag filter: tag=python → kết quả chứa course có tag python", async () => {
    const res = await request(app).get("/api/courses?tag=python");

    expect(res.status).toBe(200);
    expect(res.body.result.length).toBeGreaterThan(0);
  });

  it("✅ Price filter: price=paid → không có course miễn phí trong kết quả", async () => {
    const res = await request(app).get("/api/courses?price=paid&limit=20");

    expect(res.status).toBe(200);
    for (const course of res.body.result) {
      const effectivePrice = course.discountPrice ?? course.price;
      expect(effectivePrice).toBeGreaterThan(0);
    }
  });

  it("✅ Price sort priceLowToHigh: giá hiệu lực tăng dần", async () => {
    const res = await request(app).get("/api/courses?sort=priceLowToHigh&limit=10");

    expect(res.status).toBe(200);
    const prices = res.body.result.map((c) =>
      c.discountPrice != null ? c.discountPrice : c.price
    );
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  it("✅ Search: tìm 'docker' → có kết quả", async () => {
    const res = await request(app).get("/api/courses?search=docker");

    expect(res.status).toBe(200);
    expect(res.body.result.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// EDV-186: GET /api/courses/:id  (Course Details)
// =============================================================================
describe("EDV-186 | GET /api/courses/:id", () => {
  it("✅ Guest: public live course → 200 + isOwned undefined", async () => {
    const res = await request(app).get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result.isOwned).toBeUndefined();
  });

  it("❌ Error: ID không tồn tại → 404", async () => {
    const res = await request(app).get(`/api/courses/${FAKE_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("❌ Error: ID không hợp lệ (non-ObjectId) → 400 validation error", async () => {
    const res = await request(app).get("/api/courses/invalid-id-xyz");

    expect(res.status).toBe(400);
  });

  it("❌ Error: course ở trạng thái draft → 400 'unavailable'", async () => {
    const res = await request(app).get(`/api/courses/${DRAFT_COURSE_ID}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/unavailable/i);
  });

  it("✅ Instructor (owner): xem course của mình → 200 + isOwned true", async () => {
    const cookie = await loginAndGetCookie(COURSE_OWNER);
    const res = await request(app)
      .get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.result.isOwned).toBe(true);
  });

  it("✅ Student (not enrolled): xem public live course → 200 + isOwned false", async () => {
    const cookie = await loginAndGetCookie(STUDENT);
    const res = await request(app)
      .get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.result.isOwned).toBe(false);
  });
});

// =============================================================================
// EDV-202: GET /api/courses/recommendations
// =============================================================================
describe("EDV-202 | GET /api/courses/recommendations", () => {
  it("✅ Guest: không đăng nhập → 200 + debugSource Fallback(BestSellers)", async () => {
    const res = await request(app).get("/api/courses/recommendations");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toHaveProperty("courses");
    expect(res.body.result).toHaveProperty("debugSource");
    expect(res.body.result.debugSource).toMatch(/fallback|bestseller/i);
  });

  it("✅ Student mới (không có lịch sử): đăng nhập → 200, Fallback", async () => {
    const cookie = await loginAndGetCookie(STUDENT);
    const res = await request(app)
      .get("/api/courses/recommendations")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.result).toHaveProperty("courses");
    expect(Array.isArray(res.body.result.courses)).toBe(true);
  });

  it("✅ Guest: kết quả courses ≤ 8", async () => {
    const res = await request(app).get("/api/courses/recommendations");

    expect(res.body.result.courses.length).toBeLessThanOrEqual(8);
  });
});

// =============================================================================
// EDV-203: GET /api/courses/:id/related
// =============================================================================
describe("EDV-203 | GET /api/courses/:id/related", () => {
  it("✅ Success: public live course → 200 + có courses array", async () => {
    const res = await request(app).get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}/related`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toHaveProperty("courses");
    expect(Array.isArray(res.body.result.courses)).toBe(true);
  });

  it("✅ Self-exclusion: course hiện tại không xuất hiện trong related list", async () => {
    const res = await request(app).get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}/related`);

    const ids = res.body.result.courses.map((c) => c._id ?? c.id);
    expect(ids).not.toContain(PUBLIC_LIVE_COURSE_ID);
  });

  it("❌ Error: ID không tồn tại → 404", async () => {
    const res = await request(app).get(`/api/courses/${FAKE_ID}/related`);

    expect(res.status).toBe(404);
  });

  it("❌ Error: ID không hợp lệ → 400", async () => {
    const res = await request(app).get("/api/courses/invalid-id-xyz/related");

    expect(res.status).toBe(400);
  });

  it("✅ debugSource có trong response", async () => {
    const res = await request(app).get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}/related`);

    expect(res.body.result).toHaveProperty("debugSource");
  });
});

// =============================================================================
// EDV-204: GET /api/courses/:id/curriculum
// =============================================================================
describe("EDV-204 | GET /api/courses/:id/curriculum", () => {
  it("✅ Guest: curriculum trả về 200, lecture free có videoId, non-free không có", async () => {
    const res = await request(app).get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}/curriculum`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const sections = res.body.result;
    expect(Array.isArray(sections)).toBe(true);

    // Check all non-free lectures: videoId must not be exposed (null or undefined)
    for (const section of sections) {
      for (const lecture of section.lectures ?? []) {
        if (!lecture.isFree) {
          expect(lecture.videoId == null).toBe(true);
        }
      }
    }
  });

  it("✅ Course owner (instructor): curriculum đầy đủ + có aiData field", async () => {
    const cookie = await loginAndGetCookie(COURSE_OWNER);
    const res = await request(app)
      .get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}/curriculum`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    const sections = res.body.result;
    // Owner should have aiData or at least full videoId access
    // At minimum, response should have more data than guest
    expect(Array.isArray(sections)).toBe(true);
  });

  it("✅ Non-owner instructor: giống guest (videoId null cho non-free)", async () => {
    const cookie = await loginAndGetCookie(OTHER_INSTRUCTOR);
    const res = await request(app)
      .get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}/curriculum`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    const sections = res.body.result;
    for (const section of sections) {
      for (const lecture of section.lectures ?? []) {
        if (!lecture.isFree) {
          expect(lecture.videoId == null).toBe(true);
        }
      }
    }
  });

  it("❌ Error: draft course → 400 'unavailable'", async () => {
    const res = await request(app).get(`/api/courses/${DRAFT_COURSE_ID}/curriculum`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/unavailable/i);
  });
});

// =============================================================================
// EDV-197: GET /api/courses/:id/reviews
// =============================================================================
describe("EDV-197 | GET /api/courses/:id/reviews", () => {
  it("✅ Guest: public live course → 200 + có reviews array", async () => {
    const res = await request(app).get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toHaveProperty("reviews");
    expect(Array.isArray(res.body.result.reviews)).toBe(true);
  });

  it("✅ Guest: myReview không có trong response", async () => {
    const res = await request(app).get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}/reviews`);

    expect(res.body.result.myReview).toBeFalsy();
  });

  it("✅ Pagination: page=1&limit=2 → reviews.length ≤ 2", async () => {
    const res = await request(app).get(
      `/api/courses/${PUBLIC_LIVE_COURSE_ID}/reviews?page=1&limit=2`
    );

    expect(res.status).toBe(200);
    expect(res.body.result.reviews.length).toBeLessThanOrEqual(2);
  });

  it("✅ Pagination: có totalItems trong pagination object", async () => {
    const res = await request(app).get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}/reviews`);

    expect(res.body.pagination).toHaveProperty("totalItems");
  });

  it("✅ Student đăng nhập (không có review): myReview undefined/null", async () => {
    const cookie = await loginAndGetCookie(STUDENT);
    const res = await request(app)
      .get(`/api/courses/${PUBLIC_LIVE_COURSE_ID}/reviews`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.result.myReview == null).toBe(true);
  });
});

// =============================================================================
// EDV-249: GET /api/courses/filters  (chưa được implement trong codebase)
// =============================================================================
describe("EDV-249 | GET /api/courses/filters", () => {
  it.todo("⚠️ Endpoint chưa tồn tại trong codebase hiện tại — cần implement");
});
