# Bug Report — `POST /api/courses/:id/lectures/:lecId/generate-ai`

**Date:** 2026-05-23  
**Reporter:** QA / Copilot Analysis  
**Severity:** Critical (production 500 with hidden root cause)

---

## Production Log

```
[EXCEPTION] [2026-05-23T00:47:09.825Z]
URL: /api/courses/69515d3fb08e6cc6cab5b322/lectures/69ae9110422b26f30f039c12/generate-ai
Method: POST | StatusCode: 500 | IP: 14.187.152.1
Message: Error while processing video. Please try again later.
```

---

## Root Cause Analysis

### Error propagation chain

```
Controller: generateAiDataForLecture()
  └─ Service: handleLectureGenerateAi()
       └─ AI Service: processVideoWithGemini()
            └─ [Step 1–5: any error thrown]
                 └─ catch (error) { throw new AppError("Error while processing video...", 500, { cause: error }) }
                                                                      ↑ swallows ALL inner errors as 500
Logger: logErrorWithContext()
  └─ err.cause.message  ← LINE WAS COMMENTED OUT → cause never printed in production
```

**Two compounding issues hide the real error:**
1. `processVideoWithGemini` catch-all wraps every error (404, S3 fail, Gemini quota error…) into a single generic 500.
2. `logger.js` had `err.cause.message` commented out → production logs only showed the outer wrapper message.

---

## Bugs Found

### BUG 1 — `processVideoWithGemini` swallows all inner `AppError` status codes

**File:** `src/shared/services/ai.service.js`

**Problem:**  
The catch block unconditionally wraps every thrown error into a new `AppError(500, ...)`. If `DraftVideo.findOne()` throws a 404 (video not found) or `downloadS3Video` throws a 500 with a specific message, both become the same generic 500 response. The `{ cause: error }` is attached but never surfaced.

**Before:**
```js
} catch (error) {
  throw new AppError(
    "Error while processing video. Please try again later.",
    500,
    null,
    { cause: error }
  );
}
```

**After:**
```js
} catch (error) {
  if (error instanceof AppError) throw error;   // ← preserve original status code
  throw new AppError(
    "Error while processing video. Please try again later.",
    500,
    null,
    { cause: error }
  );
}
```

---

### BUG 2 — Logger does not print `err.cause` in production

**File:** `src/shared/utils/logger.js`

**Problem:**  
The line that logs the root cause message was commented out, so even if `cause` was attached, it was never visible in production logs. Only `development` mode printed the cause stack.

**Before:**
```js
if (err.cause) {
  // console.error("\x1b[35mCause:\x1b[0m %s", err.cause.message || err.cause);  ← COMMENTED OUT

  if (process.env.NODE_ENV === "development" && err.cause.stack) {
    console.error("\x1b[2m%s\x1b[0m", err.cause.stack);
  }
}
```

**After:**
```js
if (err.cause) {
  console.error("\x1b[35mCause:\x1b[0m %s", err.cause.message || err.cause);  // ← uncommented

  if (process.env.NODE_ENV === "development" && err.cause.stack) {
    console.error("\x1b[2m%s\x1b[0m", err.cause.stack);
  }
}
```

---

### BUG 3 — No concurrency guard: multiple simultaneous AI jobs possible

**File:** `src/modules/course/course.service.js`

**Problem:**  
Before starting the long Gemini pipeline (can take minutes), no check or lock was set. Concurrent POST requests on the same lecture would all pass validation and spawn parallel AI jobs → wasted Gemini API quota and race condition on the final `save()`.

**Fix:**  
Added an in-progress check then an atomic `findOneAndUpdate` to set `status = "processing"` before calling Gemini. Any concurrent request gets a `409 Conflict`.

```js
// Guard: prevent concurrent/duplicate AI generation
if (lecture.aiData?.status === AI_DATA_STATUS.processing)
  throw new AppError("AI generation is already in progress for this lecture.", 409);

// Atomically set status to "processing" (prevents race condition)
const lockResult = await Curriculum.findOneAndUpdate(
  {
    courseId,
    "sections.lectures": {
      $elemMatch: {
        _id: new mongoose.Types.ObjectId(lecId),
        "aiData.status": { $ne: AI_DATA_STATUS.processing }
      }
    }
  },
  { $set: { "sections.$[sec].lectures.$[lec].aiData.status": AI_DATA_STATUS.processing } },
  {
    arrayFilters: [
      { "sec.lectures._id": new mongoose.Types.ObjectId(lecId) },
      { "lec._id": new mongoose.Types.ObjectId(lecId) }
    ],
    new: true
  }
);

if (!lockResult)
  throw new AppError("AI generation is already in progress for this lecture.", 409);
```

---

### BUG 4 — `status = "failed"` never persisted on error

**File:** `src/modules/course/course.service.js`

**Problem:**  
`AI_DATA_STATUS.failed` was defined in the enum but never used. When Gemini processing failed, `aiData.status` remained `"none"` or `"processing"` — the UI could not show a failure state or enable a retry button.

**Fix:**  
Added a DB update in the catch block before re-throwing:

```js
} catch (error) {
  // Set status to "failed" so UI can show retry option
  await Curriculum.updateOne(
    { courseId, "sections.lectures._id": new mongoose.Types.ObjectId(lecId) },
    { $set: { "sections.$[sec].lectures.$[lec].aiData.status": AI_DATA_STATUS.failed } },
    {
      arrayFilters: [
        { "sec.lectures._id": new mongoose.Types.ObjectId(lecId) },
        { "lec._id": new mongoose.Types.ObjectId(lecId) }
      ]
    }
  );
  // ... send notification, rethrow
}
```

---

### BUG 5 — Gemini uploaded file not cleaned up on error

**File:** `src/shared/services/ai.service.js`

**Problem:**  
`fileManager.deleteFile()` was only called in the happy path. If `model.generateContent()` or `JSON.parse()` threw after the file had already been uploaded to Gemini, the file would be orphaned on Gemini storage indefinitely.

**Fix:**  
Moved Gemini file deletion to the `finally` block alongside the existing temp file cleanup:

```js
} finally {
  if (tempFilePath && fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
  if (uploadResult?.file?.name) {
    fileManager.deleteFile(uploadResult.file.name).catch(() => {});
  }
}
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/shared/services/ai.service.js` | BUG 1: re-throw `AppError` as-is. BUG 5: move `deleteFile` to `finally`. |
| `src/shared/utils/logger.js` | BUG 2: uncomment `err.cause.message` log line. |
| `src/modules/course/course.service.js` | BUG 3: atomic concurrency lock. BUG 4: set `status = "failed"` on error. |

---

## Expected Log After Fix

When the error occurs again after deploying the fix, production logs will show:

```
[EXCEPTION] [...]
URL: /api/courses/.../generate-ai
Method: POST | StatusCode: 404 | IP: ...
Message: Video not found.
```
or
```
Message: Unable to fetch video for processing. Please try again later.
Cause: [real S3 / network error message]
```

This will allow identification of the exact root cause (most likely: `DraftVideo` document does not exist for the lecture's `videoId`, possibly expired via TTL or never created).

---

## Recommended Next Step

Query the DB directly to confirm:

```js
db.draftvideos.findOne({ videoId: "<lecture.videoId from curriculum>" })
```

If the document is missing → the video was uploaded but `DraftVideo` record was deleted (TTL expired or cleanup ran prematurely).
