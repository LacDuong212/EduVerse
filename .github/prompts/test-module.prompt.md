---
description: "Audit & harden automated tests for ANY EduVerse backend module. Prompts for the module name, then runs the full audit/refactor/CRUD-verify/report workflow following the project testing rules."
mode: "agent"
---

# Audit & Harden Tests — `${input:module:Module name (e.g. instructor, course, payment, order, cart, coupon, review, wishlist, notification, auth, student)}`

> ⚠️ You MUST follow [.github/instructions/testing.instructions.md](../instructions/testing.instructions.md). Load it before doing anything else. Any test that violates those rules must be flagged or refactored.

## Scope

- **Source**:  `backend/src/modules/${input:module}/`
- **Tests**:   `backend/tests/${input:module}.test.js`
- **Model**:   `backend/src/modules/${input:module}/${input:module}.model.js` (import for DB cross-check)
- **Reports**: `backend/test-reports/${input:module}_<YYYY-MM-DD_HH-mm>.md`
- **DB**:      `eduverse2` (read fixtures, never mutate seeded data)

## Workflow (do in order — do not skip steps)

### 1. Discover endpoints & current coverage
- List every route exported from `${input:module}.route.js`. For each capture: `METHOD PATH`, auth middleware, role required, controller fn.
- Open the test file and map existing `describe/it` to the route table.
- Produce a **coverage gap table**:

  | Endpoint | Has test? | Asserts body? | Asserts DB? | Auth matrix? | Negative case? |

### 2. Audit existing tests against the rules
Label each existing `it(...)` with one or more violation codes (or `OK`):
- `STATUS_ONLY` — only checks `res.status`
- `SHAPE_ONLY` — only `toHaveProperty` without value/type
- `NO_DB_VERIFY` — write op not verified by GET + DB query
- `NO_NEG_CASE` — happy path only
- `LEAK_RISK` — sensitive fields not asserted absent
- `NO_AUTHZ` — protected endpoint missing the 4 authorization cases

### 3. Refactor & extend tests
For EVERY endpoint, ensure:

1. **Status + body envelope** assertion.
2. **Type & value** assertion for every meaningful field (`expect.any`, regex matchers).
3. **Data-leakage guard**: response must NOT contain `password`, `passwordResetToken`, `__v`, `stack`, internal flags.
4. **Module-specific business invariants** — infer from `${input:module}.service.js` / `${input:module}.model.js`. Examples:
   - prices/totals: `discountPrice < price`, `total = subtotal - discount + tax`, all amounts ≥ 0
   - ratings ∈ [0, 5]
   - counts ≥ 0 and equal to a Mongo `countDocuments(...)` cross-check
   - email regex, slug regex, ObjectId regex `^[0-9a-f]{24}$`
   - status enums match the schema enum list
5. **CRUD 3-step protocol** for every write endpoint (response → GET → DB). Include:
   - Mass-assignment guard — send forbidden fields (`role`, `isVerified`, `userId`, `instructorId`, etc.) and assert DB ignored them.
   - Idempotent / duplicate behavior.
6. **Authorization matrix** (4 cases) for every protected route: no token / wrong role / IDOR / owner.
7. **Negative cases** with `errorCode` asserted, no `stack` field leaked.
8. **Pagination & filter correctness** for list endpoints (every returned item satisfies the filter; sort order verified; `pagination.total` matches DB `countDocuments`).

### 4. Cleanup discipline
- Test-created data must be prefixed `[TEST]` and removed in `afterEach` / `afterAll` via the Mongoose model.
- Never touch seed fixture documents (e.g., `vi021ttv@gmail.com`, `22110304@student.hcmute.edu.vn`, `lacduongldg212@gmail.com`).
- Use unique values per run (timestamp / uuid).

### 5. Run & verify
1. `cd backend && npm test -- ${input:module}`
2. If a NEW failure appears:
   - Reproduce manually (curl/Postman).
   - Read suspect file under `backend/src/modules/${input:module}/`.
   - **DO NOT** modify production code. **DO NOT** weaken assertions.
   - File the bug in the report (Section 6) with severity, endpoint, payload, expected vs actual, suspected file/line.
3. `npm test -- ${input:module} --coverage`. Target ≥ 80% branch coverage on touched files.

### 6. Output the report
Create `backend/test-reports/${input:module}_<YYYY-MM-DD_HH-mm>.md`:

```
# ${input:module} Test Audit — <date>

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
- Suspected: backend/src/modules/${input:module}/<file>:<line>

## 5. Coverage
- Before: __% branches / __% lines
- After:  __% branches / __% lines
- Files still < 80%: ...

## 6. Remaining Gaps (need human review)
- ...
```

## Definition of Done

- [ ] Coverage gap table produced.
- [ ] Every existing `it(...)` audited and labeled (or `OK`).
- [ ] Each endpoint has: body assertion, DB cross-check, leak guard, 4-case authz matrix, ≥ 1 negative case.
- [ ] Every write endpoint follows the 3-step CRUD protocol with mass-assignment guard.
- [ ] All `[TEST]` data cleaned from DB after the run.
- [ ] `npm test -- ${input:module}` green; bugs (if any) logged in the report rather than silenced.
- [ ] Report written to `backend/test-reports/${input:module}_<date>.md`.

## Constraints

- ✋ Do NOT edit any file under `backend/src/**`. Read-only on production code.
- ✋ Do NOT use `.skip`, `.only`, or comment out failing assertions.
- ✋ Do NOT mutate seed fixture documents.
- ✅ Use Mongoose models directly for DB cross-check (e.g. `import Model from "../src/modules/${input:module}/${input:module}.model.js"`).
- ✅ Reuse the login helper pattern already in the existing test file.
