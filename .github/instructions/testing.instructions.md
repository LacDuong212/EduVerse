---
description: "Use when writing, refactoring, or reviewing automated tests (Jest/Supertest) for the EduVerse backend. Enforces DB cross-check, full CRUD verification, response body schema assertion, side-effect verification, and security/data-leakage checks. Apply to any *.test.js / *.spec.js file or when the user mentions 'test', 'coverage', 'lọt bug', 'kiểm tra response', 'CRUD'."
applyTo: "backend/**/*.{test,spec}.js"
---

# EduVerse Testing Rules (MANDATORY)

These rules apply to ALL test files in `backend/tests/**`. Tests that violate these rules MUST be flagged or refactored. The goal is **catching real bugs**, not just achieving green checkmarks.

## 🚫 Forbidden Patterns (auto-reject)

1. ❌ Asserting only `res.status` without asserting `res.body`.
2. ❌ Using `toHaveProperty("x")` alone — it passes even when value is `null`, `undefined`, `""`, or `[]`.
3. ❌ POST/PUT/DELETE tests that do NOT verify the change with a follow-up GET or direct DB query.
4. ❌ "Happy path only" — every endpoint must have at least one negative case with full error-body assertion.
5. ❌ Marking a test "pass" by relaxing assertions when source code is the actual bug. **Never** modify production code from a test file. If a test fails because the API is wrong, log it as a bug — do not weaken the assertion.
6. ❌ Hard-coding expected values that depend on fixture data without a comment explaining the source (e.g. `// from DB eduverse2`).

## ✅ Required Assertions per Endpoint

Every `it(...)` block must cover the relevant items below:

### 1. Status + Body Envelope
```js
expect(res.status).toBe(200);
expect(res.body).toMatchObject({
  success: true,
  result: expect.any(Object), // or Array
});
```

### 2. Field Type & Value (not just existence)
Use `expect.any(...)`, `expect.stringMatching(regex)`, `expect.arrayContaining([...])`. Never rely on `toHaveProperty` alone.
```js
expect(res.body.result).toMatchObject({
  _id:    expect.stringMatching(/^[0-9a-f]{24}$/),
  price:  expect.any(Number),
  slug:   expect.stringMatching(/^[a-z0-9-]+$/),
  email:  expect.stringMatching(/^[^@]+@[^@]+\.[^@]+$/),
});
```

### 3. Data Leakage Guard (security)
Always assert sensitive / internal fields are absent from response.
```js
expect(res.body.result).not.toHaveProperty("password");
expect(res.body.result).not.toHaveProperty("passwordResetToken");
expect(res.body.result).not.toHaveProperty("__v");
expect(res.body).not.toHaveProperty("stack"); // no stack trace in error responses
```

### 4. Business Invariant
Cross-check math/logic that the code COULD break silently.
```js
if (course.discountPrice !== null) {
  expect(course.discountPrice).toBeGreaterThan(0);
  expect(course.discountPrice).toBeLessThan(course.price);
}
expect(order.total).toBe(order.subtotal - order.discount + order.tax);
```

### 5. Error Body Shape (negative cases)
```js
expect(res.status).toBe(404);
expect(res.body).toMatchObject({
  success: false,
  errorCode: expect.any(String),  // must have a stable code, not just message
  message: expect.any(String),
});
expect(res.body).not.toHaveProperty("stack");
```

## 🔄 CRUD Verification Protocol (MANDATORY)

For every write endpoint (`POST`, `PUT`, `PATCH`, `DELETE`), follow this **3-step protocol**. A test missing any step is incomplete.

### CREATE
1. Call POST → assert 201/200 + body contains created resource with generated `_id`.
2. **Verify by GET** the created resource → fields match what was sent.
3. **Verify by DB** (via mongoose model) → document exists with expected values.
4. **Idempotency / duplicate check**: call POST again with same payload → assert proper 409/400 if uniqueness expected.

```js
import Course from "../src/modules/course/course.model.js";

it("CREATE: course persisted correctly", async () => {
  const payload = { title: "Test Course", price: 100 };
  const res = await request(app).post("/api/courses").set("Cookie", instructorCookie).send(payload);

  // Step 1: response
  expect(res.status).toBe(201);
  expect(res.body.result).toMatchObject({ _id: expect.any(String), title: payload.title, price: 100 });
  const newId = res.body.result._id;

  // Step 2: verify by GET
  const get = await request(app).get(`/api/courses/${newId}`);
  expect(get.body.result.title).toBe(payload.title);

  // Step 3: verify by DB
  const inDb = await Course.findById(newId).lean();
  expect(inDb).not.toBeNull();
  expect(inDb.title).toBe(payload.title);
  expect(inDb.price).toBe(100);
  expect(inDb.instructorId.toString()).toBe(INSTRUCTOR_ID); // ownership

  // Cleanup (see Cleanup section below)
  await Course.findByIdAndDelete(newId);
});
```

### READ
1. Assert status + full body schema (Section 1–3 above).
2. **Cross-validate count/aggregate** with DB or sibling endpoint (e.g. `/stats.totalCourses === Course.countDocuments({status:"live"})`).
3. **Pagination**: assert `pagination.total`, `pagination.page`, `pagination.limit`, and `result.length <= limit`.
4. **Filter/sort**: when filter applied, assert EVERY item satisfies the filter; when sorted, assert order.

```js
const res = await request(app).get("/api/courses?status=live&sort=-price&limit=5");
expect(res.body.result.length).toBeLessThanOrEqual(5);
res.body.result.forEach(c => expect(c.status).toBe("live"));        // filter holds
for (let i = 1; i < res.body.result.length; i++) {                  // sort holds
  expect(res.body.result[i-1].price).toBeGreaterThanOrEqual(res.body.result[i].price);
}
const dbCount = await Course.countDocuments({ status: "live" });
expect(res.body.pagination.total).toBe(dbCount);
```

### UPDATE
1. Snapshot DB state BEFORE update.
2. Call PUT/PATCH → assert response.
3. **Verify by DB**: only changed fields differ; unchanged fields are intact; `updatedAt` advanced.
4. **Mass-assignment guard**: send forbidden fields (e.g. `role: "admin"`, `instructorId: <other>`) → assert they are NOT applied in DB.

```js
const before = await Course.findById(id).lean();
const res = await request(app).put(`/api/courses/${id}`)
  .set("Cookie", ownerCookie)
  .send({ title: "New", role: "admin", instructorId: "other" }); // mass assignment attempt

expect(res.status).toBe(200);

const after = await Course.findById(id).lean();
expect(after.title).toBe("New");
expect(after.price).toBe(before.price);                           // untouched
expect(after.instructorId.toString()).toBe(before.instructorId.toString()); // mass-assign blocked
expect(after.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());
```

### DELETE
1. Call DELETE → assert response.
2. **Verify by DB**: hard delete → document gone; soft delete → `isDeleted: true` / `deletedAt` set.
3. **Cascade check**: related data (e.g. cart items, enrollments) handled per spec.
4. **Idempotent**: second DELETE → 404, not 500.

```js
const del = await request(app).delete(`/api/courses/${id}`).set("Cookie", ownerCookie);
expect(del.status).toBe(200);

const inDb = await Course.findById(id);
expect(inDb).toBeNull();                  // or: expect(inDb.isDeleted).toBe(true)

const del2 = await request(app).delete(`/api/courses/${id}`).set("Cookie", ownerCookie);
expect(del2.status).toBe(404);
```

## 🔐 Authorization Matrix (every protected endpoint)

For each protected endpoint, add 4 cases:

| Case | Expected |
|------|----------|
| No token / no cookie | 401 |
| Wrong role (e.g. student calling instructor API) | 403 |
| Correct role but accessing OTHER user's resource (IDOR) | 403 / 404 |
| Owner / correct role | 200 |

## 🧹 Test Data & Cleanup Rules

1. **Read-only tests** use existing fixtures from `eduverse2` DB (already documented at top of each test file). Do NOT mutate them.
2. **Write tests** must:
   - Create their OWN data with a recognizable prefix (e.g. `title: "[TEST] ..."`).
   - Clean up in `afterEach` / `afterAll` via the mongoose model — never leave test data in DB.
   - Wrap cleanup in `try/finally` so a failed assertion still cleans up.
3. Never delete or modify documents owned by seed fixtures.
4. Use unique values per test run (timestamp, uuid) to avoid collision when tests run in parallel.

```js
afterEach(async () => {
  await Course.deleteMany({ title: { $regex: /^\[TEST\]/ } });
});
```

## 📐 Response Schema (recommended)

For complex responses, define a Zod schema in `backend/tests/schemas/` and use `.strict()` so unexpected fields (data leakage, accidental additions) fail the test:

```js
import { z } from "zod";
export const CourseCardSchema = z.object({
  _id: z.string().regex(/^[0-9a-f]{24}$/),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  category: z.object({ name: z.string(), slug: z.string() }).strict(),
}).strict();

// In test
expect(() => CourseCardSchema.parse(item)).not.toThrow();
```

## 📋 Pre-commit Checklist (agent must run before reporting "done")

- [ ] Every `it(...)` asserts both status AND body fields with type/value (not just `toHaveProperty`).
- [ ] Every write endpoint has CREATE/UPDATE/DELETE verified via follow-up GET **and** direct DB query.
- [ ] Every protected endpoint has 4 authorization cases.
- [ ] Every endpoint has at least one negative case with `errorCode` asserted.
- [ ] No sensitive field (`password`, `__v`, `stack`, internal IDs) leaks in any response.
- [ ] All test-created data is cleaned up; no `[TEST]`-prefixed docs remain in DB.
- [ ] `npm test -- <module>` runs green; coverage report shows ≥ 80% branches for the touched files.
- [ ] If a new failure surfaces, it is reported as a BUG (with steps + expected vs actual) — not silenced.

## 🛑 When a Test Fails

1. Reproduce manually (curl / Postman) to confirm.
2. Read the source under `backend/src/modules/<module>/`.
3. If source is wrong → file a bug report in `backend/test-reports/<module>_<date>.md` with: severity, endpoint, payload, expected, actual, suspected file.
4. If test is wrong → fix the test; explain why in a comment.
5. **Never** comment out, `.skip`, or weaken assertions just to make CI pass.
