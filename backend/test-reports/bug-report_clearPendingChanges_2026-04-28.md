# Bug Report — BUG-1

| Field | Detail |
|---|---|
| **ID** | BUG-1 |
| **Date found** | 2026-04-28 |
| **Found by** | Automated test audit (GitHub Copilot) |
| **Severity** | Medium |
| **Status** | Open |

---

## Summary

Duplicate `if (hasCurriculumChanges)` block in `clearPendingChanges` causes every pending curriculum video ID to be collected **twice** into `videosToRemove`, resulting in `expireOrphanVideos` being called with a list containing duplicate IDs.

---

## Affected Location

| Field | Value |
|---|---|
| **File** | `backend/src/modules/course/course.service.js` |
| **Function** | `clearPendingChanges` |
| **Lines** | 729–748 (two identical consecutive `if (hasCurriculumChanges)` blocks) |
| **Endpoint** | `DELETE /api/instructor/courses/:courseId/changes` |

---

## Root Cause

Copy-paste error. The block that collects `lectureVideos` into `videosToRemove` was pasted twice in a row with the **same condition and identical body**, so it runs twice every time there are pending curriculum changes.

```js
// BLOCK 1 — correct
if (hasCurriculumChanges) {
  const pendingCurrData = getPlainPendingData(curriculumDoc.pendingUpdate);
  const lectureVideos = (pendingCurrData.sections || [])
    .flatMap(sec => sec.lectures || [])
    .map(l => l.videoId)
    .filter(Boolean);
  videosToRemove.push(...lectureVideos);   // ← pushes N videos
}

// BLOCK 2 — duplicate (lines ~740–748), should NOT exist
if (hasCurriculumChanges) {
  const pendingCurrData = getPlainPendingData(curriculumDoc.pendingUpdate);
  const lectureVideos = (pendingCurrData.sections || [])
    .flatMap(sec => sec.lectures || [])
    .map(l => l.videoId)
    .filter(Boolean);
  videosToRemove.push(...lectureVideos);   // ← pushes the same N videos again
}
```

---

## Expected vs Actual

| | Expected | Actual |
|---|---|---|
| `videosToRemove` length (N pending videos) | N | **2N** |
| `expireOrphanVideos` called with | unique IDs | duplicate IDs |

---

## Impact

`expireOrphanVideos` uses `DraftVideo.updateMany({ videoId: { $in: videoIds } }, ...)` which is **idempotent** — the same document will just be updated twice with the same `expireAt` value in the same call, so the **DB result is correct**.

However:
1. **Wasted work** — the `$in` query set is twice as large as needed; MongoDB deduplicates matching documents but the array passed in is still larger than it should be.
2. **Code is semantically wrong** — signals a logic error that could introduce a real bug if `expireOrphanVideos` is ever changed to a non-idempotent implementation (e.g. counting expirations, queueing jobs, calling an external API per ID).
3. **Hard to maintain** — the dead duplicate block is confusing for future developers.

---

## Fix

Remove the second (duplicate) `if (hasCurriculumChanges)` block entirely. No behaviour change is needed — only the first block is correct.

```diff
-   if (hasCurriculumChanges) {
-     const pendingCurrData = getPlainPendingData(curriculumDoc.pendingUpdate);
-     const lectureVideos = (pendingCurrData.sections || [])
-       .flatMap(sec => sec.lectures || [])
-       .map(l => l.videoId)
-       .filter(Boolean);
-     videosToRemove.push(...lectureVideos);
-   }
-
    course.pendingUpdate = {
```

---

## Reproduction

1. Instructor A creates a draft course and updates the curriculum with at least one lecture (e.g. `videoId: "vid-001"`).
2. Instructor A calls `DELETE /api/instructor/courses/:courseId/changes`.
3. Inspect the array passed to `expireOrphanVideos` — it will contain `["vid-001", "vid-001"]` instead of `["vid-001"]`.

---

## Verification After Fix

Run the existing test:

```
npm run test:instructor
> "DB verify: course pendingUpdate.data is null after clear" ✅
> "GET edit view confirms hasPendingChanges=false after clear"  ✅
```

Both tests already pass with the duplicate block present (because `expireOrphanVideos` is idempotent). After removing the duplicate block, both tests must continue to pass.
