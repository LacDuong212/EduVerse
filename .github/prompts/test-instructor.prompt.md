---
description: "Audit & refactor automated tests for the EduVerse Instructor module following the project testing rules. Runs tests, reports bugs, and enforces CRUD + DB cross-check + response body assertions."
mode: "agent"
---

# Audit & Harden Tests — Instructor Module

> ⚠️ You MUST follow [.github/instructions/testing.instructions.md](../instructions/testing.instructions.md). Load it before doing anything else. Any test that violates those rules must be flagged or refactored.

## Scope

- **Source**:  `backend/src/modules/instructor/` (controller, service, model, route, validation, mapper)
- **Tests**:   `backend/tests/instructor.test.js`
- **Reports**: `backend/test-reports/instructor_<YYYY-MM-DD_HH-mm>.md`
- **DB**:      `eduverse2` (read fixtures, never mutate seeded data)

## Workflow (do in order — do not skip steps)

### 1. Discover endpoints & current coverage
- List every route exported from `instructor.route.js`. For each route capture: `METHOD PATH`, auth middleware, role required, controller fn.
- Open `backend/tests/instructor.test.js` and map existing `describe/it` to the route table.
- Produce a **coverage gap table**:

  | Endpoint | Has test? | Asserts body? | Asserts DB? | Auth matrix? | Negative case? |

### 2. Audit existing tests against the rules
Mark each existing `it(...)` with one or more violations from `testing.instructions.md`:
- `STATUS_ONLY` — only checks `res.status`
- `SHAPE_ONLY` — only `toHaveProperty` without value/type
- `NO_DB_VERIFY` — write op not verified by GET + DB query
- `NO_NEG_CASE` — happy path only
- `LEAK_RISK` — does not assert sensitive fields are absent
- `NO_AUTHZ` — protected endpoint missing the 4 authorization cases

### 3. Refactor & extend tests
For EVERY endpoint, ensure the following exist (add what is missing):

1. **Status + body envelope** assertion.
2. **Type & value** assertion for every meaningful field (use `expect.any`, regex matchers).
3. **Data-leakage guard**: response must NOT contain `password`, `passwordResetToken`, `__v`, `stack`, internal flags.
4. **Business invariants** specific to instructor:
   - `rating` ∈ [0, 5]
   - `totalStudents`, `totalCourses`, `totalReviews` ≥ 0 and equal to a DB `countDocuments(...)` cross-check.
   - `email` matches valid email regex; `slug` matches `^[a-z0-9-]+$`.
5. **CRUD 3-step protocol** for any write endpoint (response → GET → DB). Include:
   - Mass-assignment guard (try sending `role: "admin"`, `isVerified: true`, `userId: <other>` and assert DB ignored them).
   - Idempotent / duplicate behavior.
6. **Authorization matrix** (4 cases) for every protected route: no token / wrong role / IDOR / owner.
7. **Negative cases** with `errorCode` asserted, no `stack` field leaked.
8. **Pagination & filter correctness** for list endpoints (every returned item satisfies the filter; sort order verified).

### 4. Cleanup discipline
- Any data created by tests must be prefixed `[TEST]` and removed in `afterEach` / `afterAll` via the Mongoose model.
- Never touch documents owned by seed fixtures (e.g., `vi021ttv@gmail.com`, `22110304@student.hcmute.edu.vn`).
- Generate unique values per run (timestamp / uuid) to avoid collisions.

### 5. Run & verify
1. Run: `npm test -- instructor` from `backend/`.
2. If a NEW failure appears:
   - Reproduce manually (curl/Postman) — confirm it is a real bug.
   - Read the suspect file in `backend/src/modules/instructor/`.
   - **DO NOT** modify production code. **DO NOT** weaken assertions to make CI green.
   - File the bug in the report (Section 6) with: severity, endpoint, payload, expected vs actual, suspected file/line.
3. Run with coverage: `npm test -- instructor --coverage`. Target ≥ 80% branch coverage on touched files; list any file below threshold.

### 6. Output the report
Create `backend/test-reports/instructor_<YYYY-MM-DD_HH-mm>.md` with these sections:

```
# Instructor Test Audit — <date>

## 1. Endpoint Coverage Table
| Endpoint | Auth | Test exists | Body asserted | DB verified | Authz matrix | Negative |

## 2. Violations Found in Existing Tests
- <file>:<line> — <violation code> — <short note>

## 3. Tests Added / Refactored
- describe(...) → it(...): purpose

## 4. Bugs Discovered
### BUG-1 — <title>
- Severity: High | Medium | Low
- Endpoint: METHOD /path
- Steps: ...
- Expected: ...
- Actual: ...
- Suspected: backend/src/modules/instructor/<file>:<line>

## 5. Coverage
- Before: __% branches / __% lines
- After:  __% branches / __% lines
- Files still < 80%: ...

## 6. Remaining Gaps (need human review)
- ...
```

## Definition of Done

- [ ] Coverage gap table produced.
- [ ] Every existing `it(...)` audited and labeled with violation codes (or "OK").
- [ ] Each endpoint has: body assertion, DB cross-check, leak guard, 4-case authz matrix, ≥ 1 negative case.
- [ ] Every write endpoint follows the 3-step CRUD protocol with mass-assignment guard.
- [ ] All `[TEST]` data cleaned from DB after the run.
- [ ] `npm test -- instructor` green; bugs (if any) logged in the report rather than silenced.
- [ ] Report file written to `backend/test-reports/`.

## Constraints

- ✋ Do NOT edit any file under `backend/src/**`. This task is read-only on production code.
- ✋ Do NOT use `.skip`, `.only`, or comment out failing assertions.
- ✋ Do NOT mutate seed fixture documents.
- ✅ Use Mongoose models directly for DB cross-check (e.g. `import Instructor from "../src/modules/instructor/instructor.model.js"`).
- ✅ Reuse the login helper pattern already in `backend/tests/instructor.test.js`.
