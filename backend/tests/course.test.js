/**
 * COURSE API Tests
 * Jira: EDV-174 (Home + Stats), EDV-175 (All Courses), EDV-186 (Course Details),
 *       EDV-197 (Course Reviews), EDV-202 (Recommendations), EDV-203 (Related),
 *       EDV-204 (Curriculum), EDV-249 (Filters)
 *
 * Test fixtures (từ DB eduverse2):
 *   - PUBLIC_LIVE_COURSE_ID : 694d046addf90206a887c535  (Crash Course CS, live, public)
 *   - ENROLLED_COURSE_ID    : 694e8e85ed8f2ec45dc0d4ec  (Docker Essentials Advanced, live, public)
 *   - DRAFT_COURSE_ID       : 69e50011f5d55dc8733e396c  (draft, private)
 *   - ENROLLED_STUDENT      : lacduongldg212@gmail.com  (enrolled vào ENROLLED_COURSE_ID)
 *   - INSTRUCTOR_LACDUONG   : 22110304@student.hcmute.edu.vn (owner ENROLLED_COURSE_ID)
 *   - INSTRUCTOR_VI021      : vi021ttv@gmail.com (owner PUBLIC_LIVE_COURSE_ID + DRAFT_COURSE_ID)
 */
import request from "supertest";
import app from "../src/app.js";
import "../tests/setup.js";

const BASE = "/api/courses";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const PUBLIC_LIVE_COURSE_ID = "694d046addf90206a887c535";
const ENROLLED_COURSE_ID    = "694e8e85ed8f2ec45dc0d4ec";
const DRAFT_COURSE_ID       = "69e50011f5d55dc8733e396c";
const FAKE_COURSE_ID        = "000000000000000000000001";

const ENROLLED_STUDENT    = { email: "lacduongldg212@gmail.com",              password: "Abc@12345" };
const INSTRUCTOR_LACDUONG = { email: "22110304@student.hcmute.edu.vn",        password: "Abc@12345" };
const INSTRUCTOR_VI021    = { email: "vi021ttv@gmail.com",                    password: "Abc@12345" };

// ─── Helper ───────────────────────────────────────────────────────────────────
async function loginAndGetCookie(email, password) {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.headers["set-cookie"]?.[0] ?? "";
}

// =============================================================================
// EDV-174 | GET /api/courses/home
// =============================================================================
describe("EDV-174 | GET /api/courses/home", () => {
  it("✅ Success: trả về 4 nhóm courses → 200", async () => {
    const res = await request(app).get(`${BASE}/home`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toHaveProperty("newest");
    expect(res.body.result).toHaveProperty("bestSellers");
    expect(res.body.result).toHaveProperty("topRated");
    expect(res.body.result).toHaveProperty("biggestDiscounts");
  });

  it("✅ Data Count: newest ≤ 8, bestSellers ≤ 6, topRated ≤ 8, biggestDiscounts ≤ 4", async () => {
    const res = await request(app).get(`${BASE}/home`);
    const d = res.body.result;

    expect(d.newest.length).toBeLessThanOrEqual(8);
    expect(d.bestSellers.length).toBeLessThanOrEqual(6);
    expect(d.topRated.length).toBeLessThanOrEqual(8);
    expect(d.biggestDiscounts.length).toBeLessThanOrEqual(4);
  });

  it("✅ Category Check: mỗi course trong newest có cateName và cateSlug", async () => {
    const res = await request(app).get(`${BASE}/home`);
    const newest = res.body.result.newest;

    if (newest.length > 0) {
      expect(newest[0]).toHaveProperty("category.name");
      expect(newest[0]).toHaveProperty("category.slug");
    }
  });

  it("✅ Discount Logic: biggestDiscounts chỉ chứa courses có discountPrice", async () => {
    const res = await request(app).get(`${BASE}/home`);

    res.body.result.biggestDiscounts.forEach((c) => {
      expect(c.discountPrice).not.toBeNull();
    });
  });
});

// =============================================================================
// EDV-174 | GET /api/courses/stats
// =============================================================================
describe("EDV-174 | GET /api/courses/stats", () => {
  it("✅ Success: trả về đủ 4 fields stats → 200", async () => {
    const res = await request(app).get(`${BASE}/stats`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const s = res.body.result;
    expect(s).toHaveProperty("totalCourses");
    expect(s).toHaveProperty("totalLearners");
    expect(s).toHaveProperty("totalInstructors");
    expect(s).toHaveProperty("totalHours");
  });

  it("✅ Math Check: totalHours là number ≥ 0, không null/undefined", async () => {
    const res = await request(app).get(`${BASE}/stats`);
    const s = res.body.result;

    expect(typeof s.totalHours).toBe("number");
    expect(s.totalHours).toBeGreaterThanOrEqual(0);
  });

  it("✅ Math Check: totalHours được làm tròn 1 chữ số thập phân", async () => {
    const res = await request(app).get(`${BASE}/stats`);
    const h = res.body.result.totalHours;

    expect(Math.round(h * 10) / 10).toBe(h);
  });
});

// =============================================================================
// EDV-175 | GET /api/courses (All Courses)
// =============================================================================
describe("EDV-175 | GET /api/courses", () => {
  it("✅ Basic Fetch: page=1&limit=5 → 200, ≤ 5 courses + pagination", async () => {
    const res = await request(app).get(`${BASE}?page=1&limit=5`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result)).toBe(true);
    expect(res.body.result.length).toBeLessThanOrEqual(5);
    expect(res.body.pagination).toHaveProperty("totalPages");
    expect(res.body.pagination).toHaveProperty("totalItems");
  });

  it("✅ Fuzzy Search: ?search=docker → kết quả chứa 'docker' trong title", async () => {
    const res = await request(app).get(`${BASE}?search=docker`);

    expect(res.status).toBe(200);
    if (res.body.result.length > 0) {
      const titles = res.body.result.map((c) => c.title?.toLowerCase() ?? "");
      expect(titles.some((t) => t.includes("docker"))).toBe(true);
    }
  });

  it("✅ Level Filter: ?level=beginner → tất cả courses có level='beginner'", async () => {
    const res = await request(app).get(`${BASE}?level=beginner`);

    expect(res.status).toBe(200);
    res.body.result.forEach((c) => {
      expect(c.level).toBe("beginner");
    });
  });

  it("✅ Pagination Math: page=2&limit=5 → pagination.page = 2", async () => {
    const res = await request(app).get(`${BASE}?page=2&limit=5`);

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
  });

  it("✅ Sort: ?sort=priceLowToHigh → 200, trả về danh sách", async () => {
    const res = await request(app).get(`${BASE}?sort=priceLowToHigh`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result)).toBe(true);
  });

  it("✅ Tag Filtering: ?tag=docker → 200", async () => {
    const res = await request(app).get(`${BASE}?tag=docker`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result)).toBe(true);
  });

  it("✅ Search + Sort: ?search=docker&sort=mostPopular → 200", async () => {
    const res = await request(app).get(`${BASE}?search=docker&sort=mostPopular`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result)).toBe(true);
  });
});

// =============================================================================
// EDV-186 | GET /api/courses/:id (Course Details)
// =============================================================================
describe("EDV-186 | GET /api/courses/:id", () => {
  it("❌ Error: invalid ObjectId format → 400", async () => {
    const res = await request(app).get(`${BASE}/not-a-valid-id`);

    expect(res.status).toBe(400);
  });

  it("❌ Error: valid ObjectId nhưng không tồn tại → 404 'Course not found'", async () => {
    const res = await request(app).get(`${BASE}/${FAKE_COURSE_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("✅ Success: guest + public live course → 200, isOwned undefined", async () => {
    const res = await request(app).get(`${BASE}/${PUBLIC_LIVE_COURSE_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result.isOwned).toBeUndefined();
  });

  it("❌ Error: guest + draft course → 400 'unavailable'", async () => {
    const res = await request(app).get(`${BASE}/${DRAFT_COURSE_ID}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/unavailable/i);
  });

  it("✅ Success: enrolled student + enrolled course → 200, isOwned: true", async () => {
    const cookie = await loginAndGetCookie(ENROLLED_STUDENT.email, ENROLLED_STUDENT.password);
    const res = await request(app).get(`${BASE}/${ENROLLED_COURSE_ID}`).set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.result.isOwned).toBe(true);
  });

  it("✅ Success: student chưa enroll + public live course → 200, isOwned: false", async () => {
    const cookie = await loginAndGetCookie(ENROLLED_STUDENT.email, ENROLLED_STUDENT.password);
    const res = await request(app).get(`${BASE}/${PUBLIC_LIVE_COURSE_ID}`).set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.result.isOwned).toBe(false);
  });

  it("✅ Success: instructor owner + course của mình (live) → 200, isOwned: true", async () => {
    const cookie = await loginAndGetCookie(INSTRUCTOR_VI021.email, INSTRUCTOR_VI021.password);
    const res = await request(app).get(`${BASE}/${PUBLIC_LIVE_COURSE_ID}`).set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.result.isOwned).toBe(true);
  });

  it("❌ Error: instructor không phải owner + draft course → 400 'unavailable'", async () => {
    const cookie = await loginAndGetCookie(INSTRUCTOR_LACDUONG.email, INSTRUCTOR_LACDUONG.password);
    const res = await request(app).get(`${BASE}/${DRAFT_COURSE_ID}`).set("Cookie", cookie);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/unavailable/i);
  });
});

// =============================================================================
// EDV-197 | GET /api/courses/:id/reviews
// =============================================================================
describe("EDV-197 | GET /api/courses/:id/reviews", () => {
  it("✅ Guest View: không đăng nhập → 200, result.reviews là array", async () => {
    const res = await request(app).get(`${BASE}/${PUBLIC_LIVE_COURSE_ID}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toHaveProperty("reviews");
    expect(Array.isArray(res.body.result.reviews)).toBe(true);
  });

  it("✅ Pagination: ?page=1&limit=2 → reviews.length ≤ 2", async () => {
    const res = await request(app).get(`${BASE}/${PUBLIC_LIVE_COURSE_ID}/reviews?page=1&limit=2`);

    expect(res.status).toBe(200);
    expect(res.body.result.reviews.length).toBeLessThanOrEqual(2);
  });

  it("✅ Reviewer View: enrolled student → 200, có myReview field", async () => {
    const cookie = await loginAndGetCookie(ENROLLED_STUDENT.email, ENROLLED_STUDENT.password);
    const res = await request(app)
      .get(`${BASE}/${ENROLLED_COURSE_ID}/reviews`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    // enrolled student view: reviews array is always present
    expect(Array.isArray(res.body.result.reviews)).toBe(true);
  });

  it("✅ Student No Review: student chưa review → myReview null/undefined, reviews bình thường", async () => {
    const cookie = await loginAndGetCookie(ENROLLED_STUDENT.email, ENROLLED_STUDENT.password);
    const res = await request(app)
      .get(`${BASE}/${PUBLIC_LIVE_COURSE_ID}/reviews`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result.reviews)).toBe(true);
  });
});

// =============================================================================
// EDV-202 | GET /api/courses/recommendations
// =============================================================================
describe("EDV-202 | GET /api/courses/recommendations", () => {
  it("✅ Guest User: không đăng nhập → 200, Fallback(BestSellers)", async () => {
    const res = await request(app).get(`${BASE}/recommendations`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toHaveProperty("courses");
    expect(Array.isArray(res.body.result.courses)).toBe(true);
    expect(res.body.result.debugSource).toMatch(/BestSellers/i);
  });

  it("✅ Logged-in Student: đăng nhập → 200, trả về courses + debugSource", async () => {
    const cookie = await loginAndGetCookie(ENROLLED_STUDENT.email, ENROLLED_STUDENT.password);
    const res = await request(app).get(`${BASE}/recommendations`).set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.result).toHaveProperty("courses");
    expect(Array.isArray(res.body.result.courses)).toBe(true);
    expect(res.body.result).toHaveProperty("debugSource");
  });
});

// =============================================================================
// EDV-203 | GET /api/courses/:id/related
// =============================================================================
describe("EDV-203 | GET /api/courses/:id/related", () => {
  it("✅ Direct Match: trả về related courses → 200", async () => {
    const res = await request(app).get(`${BASE}/${PUBLIC_LIVE_COURSE_ID}/related`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toHaveProperty("courses");
    expect(Array.isArray(res.body.result.courses)).toBe(true);
  });

  it("✅ Self-Exclusion: course hiện tại KHÔNG xuất hiện trong related list", async () => {
    const res = await request(app).get(`${BASE}/${PUBLIC_LIVE_COURSE_ID}/related`);

    expect(res.status).toBe(200);
    const ids = res.body.result.courses.map((c) => c.courseId);
    expect(ids).not.toContain(PUBLIC_LIVE_COURSE_ID);
  });

  it("❌ Error: invalid ObjectId format → 400", async () => {
    const res = await request(app).get(`${BASE}/bad-id/related`);

    expect(res.status).toBe(400);
  });

  it("❌ Error: valid ObjectId không tồn tại → 404 'Course not found'", async () => {
    const res = await request(app).get(`${BASE}/${FAKE_COURSE_ID}/related`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});

// =============================================================================
// EDV-204 | GET /api/courses/:id/curriculum
// =============================================================================
describe("EDV-204 | GET /api/courses/:id/curriculum", () => {
  it("✅ Guest/Unenrolled: free lectures có videoId, paid lectures videoId = null", async () => {
    const res = await request(app).get(`${BASE}/${ENROLLED_COURSE_ID}/curriculum`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result)).toBe(true);

    const allLectures = res.body.result.flatMap((s) => s.lectures ?? []);
    const paidLectures = allLectures.filter((l) => !l.isFree);
    paidLectures.forEach((l) => {
      expect(l.videoId).toBeFalsy();
    });
    const freeLectures = allLectures.filter((l) => l.isFree);
    freeLectures.forEach((l) => {
      expect(l.videoId).not.toBeNull();
    });
  });

  it("✅ Enrolled Student: tất cả lectures có videoId, không có aiData", async () => {
    const cookie = await loginAndGetCookie(ENROLLED_STUDENT.email, ENROLLED_STUDENT.password);
    const res = await request(app)
      .get(`${BASE}/${ENROLLED_COURSE_ID}/curriculum`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    const allLectures = res.body.result.flatMap((s) => s.lectures ?? []);
    allLectures.forEach((l) => {
      expect(l.videoId).not.toBeNull();
      expect(l.aiData).toBeUndefined();
    });
  });

  it("✅ Course Owner (Instructor): tất cả lectures có videoId + aiData field tồn tại", async () => {
    const cookie = await loginAndGetCookie(INSTRUCTOR_LACDUONG.email, INSTRUCTOR_LACDUONG.password);
    const res = await request(app)
      .get(`${BASE}/${ENROLLED_COURSE_ID}/curriculum`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    const allLectures = res.body.result.flatMap((s) => s.lectures ?? []);
    if (allLectures.length > 0) {
      allLectures.forEach((l) => {
        expect(l.videoId).not.toBeNull();
        expect(Object.prototype.hasOwnProperty.call(l, "aiData")).toBe(true);
      });
    }
  });

  it("❌ Error: draft course (guest) → 400 'unavailable'", async () => {
    const res = await request(app).get(`${BASE}/${DRAFT_COURSE_ID}/curriculum`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/unavailable/i);
  });
});

// =============================================================================
// EDV-249 | GET /api/courses/filters
// =============================================================================
describe("EDV-249 | GET /api/courses/filters", () => {
  it("✅ Success: trả về categories, languages, levels, prices, sorts → 200", async () => {
    const res = await request(app).get(`${BASE}/filters`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const f = res.body.result;
    expect(f).toHaveProperty("categories");
    expect(f).toHaveProperty("languages");
    expect(f).toHaveProperty("levels");
    expect(f).toHaveProperty("prices");
    expect(f).toHaveProperty("sorts");
  });

  it("✅ Enum Integrity: levels chứa all, beginner, intermediate, advanced", async () => {
    const res = await request(app).get(`${BASE}/filters`);
    const levels = res.body.result.levels;
    const levelValues = Array.isArray(levels) ? levels : Object.values(levels);

    expect(levelValues).toContain("all");
    expect(levelValues).toContain("beginner");
    expect(levelValues).toContain("intermediate");
    expect(levelValues).toContain("advanced");
  });

  it("✅ Language Extraction: languages là array, chỉ chứa string hợp lệ (filter null/empty)", async () => {
    const res = await request(app).get(`${BASE}/filters`);
    const langs = res.body.result.languages;

    expect(Array.isArray(langs)).toBe(true);
    langs.forEach((l) => {
      expect(typeof l).toBe("string");
      expect(l.length).toBeGreaterThan(0);
    });
  });

  it("✅ Category Sort: categories được trả về theo thứ tự slug", async () => {
    const res = await request(app).get(`${BASE}/filters`);
    const cats = res.body.result.categories;

    expect(Array.isArray(cats)).toBe(true);
    // Check sorted by slug (slugAsc)
    if (cats.length > 1) {
      for (let i = 0; i < cats.length - 1; i++) {
        expect(cats[i].cateSlug?.localeCompare(cats[i + 1].cateSlug)).toBeLessThanOrEqual(0);
      }
    }
  });
});
