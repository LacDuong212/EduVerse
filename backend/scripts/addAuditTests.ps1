param()
$ErrorActionPreference = "Stop"

$f = "C:\personal\EduVerse\backend\tests\instructor.test.js"
$encoding = [System.Text.Encoding]::UTF8
$content  = [System.IO.File]::ReadAllText($f, $encoding)
$nl       = if ($content.Contains("`r`n")) { "`r`n" } else { "`n" }
$lines    = [System.Collections.Generic.List[string]]::new(($content -split "`r?`n"))

Write-Host "Total lines before insertions: $($lines.Count)"

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Insert a block of lines AFTER 0-based index $afterIdx
# ─────────────────────────────────────────────────────────────────────────────
function InsertAfter([System.Collections.Generic.List[string]]$lst, [int]$afterIdx, [string]$block) {
    $toInsert = $block -split "`r?`n"
    $insertAt = $afterIdx + 1
    [int]$i = $insertAt
    foreach ($ln in $toInsert) {
        $lst.Insert($i, $ln)
        $i++
    }
    Write-Host "  Inserted $($toInsert.Count) lines after index $afterIdx (0-based)"
}

# ─────────────────────────────────────────────────────────────────────────────
# Find anchor lines (0-based index)
# We process from BOTTOM to TOP to avoid index shifting
# ─────────────────────────────────────────────────────────────────────────────

# Anchor 6 – EDV-221: after closing `});` of "clears pending changes on a draft course"
# Find the it("clears pending changes ...) and walk forward to its closing });
$anchor6 = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'it\("clears pending changes on a draft course"') {
        # Walk forward to find the closing `    });`
        for ($j = $i + 1; $j -lt [Math]::Min($i + 35, $lines.Count); $j++) {
            if ($lines[$j] -match '^\s{4}\}\);$') {
                $anchor6 = $j
                break
            }
        }
        break
    }
}
if ($anchor6 -lt 0) { Write-Error "Could not find anchor 6 (clears pending changes)"; exit 1 }
Write-Host "Anchor 6 (EDV-221 clears): line $($anchor6+1), content: $($lines[$anchor6])"

# Anchor 5 – EDV-220: after closing `});` of "submits a fully-populated draft course"
$anchor5 = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'submits a fully-populated draft course') {
        for ($j = $i + 1; $j -lt [Math]::Min($i + 55, $lines.Count); $j++) {
            if ($lines[$j] -match '^\s{4}\}\);$') {
                $anchor5 = $j
                break
            }
        }
        break
    }
}
if ($anchor5 -lt 0) { Write-Error "Could not find anchor 5 (submits draft course)"; exit 1 }
Write-Host "Anchor 5 (EDV-220 submit): line $($anchor5+1), content: $($lines[$anchor5])"

# Anchor 4 – EDV-219: after closing `});` of "updates live course"
$anchor4 = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'it\("updates live course') {
        for ($j = $i + 1; $j -lt [Math]::Min($i + 25, $lines.Count); $j++) {
            if ($lines[$j] -match '^\s{4}\}\);$') {
                $anchor4 = $j
                break
            }
        }
        break
    }
}
if ($anchor4 -lt 0) { Write-Error "Could not find anchor 4 (updates live course)"; exit 1 }
Write-Host "Anchor 4 (EDV-219 live update): line $($anchor4+1), content: $($lines[$anchor4])"

# Anchor 3 – EDV-253: after closing `});` of "returns 403 for student (not instructor)"
$anchor3 = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'it\("returns 403 for student \(not instructor\)"') {
        for ($j = $i + 1; $j -lt [Math]::Min($i + 15, $lines.Count); $j++) {
            if ($lines[$j] -match '^\s{4}\}\);$') {
                $anchor3 = $j
                break
            }
        }
        break
    }
}
if ($anchor3 -lt 0) { Write-Error "Could not find anchor 3 (EDV-253 403)"; exit 1 }
Write-Host "Anchor 3 (EDV-253 403 student): line $($anchor3+1), content: $($lines[$anchor3])"

# Anchor 2 – EDV-218 edit view: closing `});` of last "returns 400 for invalid courseId"
#   inside the "GET /api/instructor/courses/:courseId (edit view)" describe
$anchor2 = -1
$inEditView = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'describe\("GET /api/instructor/courses/:courseId \(edit view\)"') {
        $inEditView = $true
    }
    if ($inEditView -and $lines[$i] -match 'it\("returns 400 for invalid courseId"') {
        for ($j = $i + 1; $j -lt [Math]::Min($i + 12, $lines.Count); $j++) {
            if ($lines[$j] -match '^\s{4}\}\);$') {
                $anchor2 = $j
                break
            }
        }
        break
    }
}
if ($anchor2 -lt 0) { Write-Error "Could not find anchor 2 (EDV-218 edit view 400)"; exit 1 }
Write-Host "Anchor 2 (EDV-218 edit view 400): line $($anchor2+1), content: $($lines[$anchor2])"

# Anchor 1 – EDV-218 details: closing `});` of "returns 400 for invalid courseId"
#   inside the "GET /api/instructor/courses/:courseId/details" describe
$anchor1 = -1
$inDetails = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'describe\("GET /api/instructor/courses/:courseId/details"') {
        $inDetails = $true
    }
    if ($inDetails -and $lines[$i] -match 'it\("returns 400 for invalid courseId"') {
        for ($j = $i + 1; $j -lt [Math]::Min($i + 12, $lines.Count); $j++) {
            if ($lines[$j] -match '^\s{4}\}\);$') {
                $anchor1 = $j
                break
            }
        }
        break
    }
}
if ($anchor1 -lt 0) { Write-Error "Could not find anchor 1 (EDV-218 details 400)"; exit 1 }
Write-Host "Anchor 1 (EDV-218 details 400): line $($anchor1+1), content: $($lines[$anchor1])"

# Validate ordering: anchors must be strictly ascending
if (-not ($anchor1 -lt $anchor2 -and $anchor2 -lt $anchor3 -and $anchor3 -lt $anchor4 -and $anchor4 -lt $anchor5 -and $anchor5 -lt $anchor6)) {
    Write-Error "Anchor ordering unexpected: $anchor1 $anchor2 $anchor3 $anchor4 $anchor5 $anchor6"
    exit 1
}
Write-Host "All anchors found and in correct order. Inserting from bottom to top..."

# ─────────────────────────────────────────────────────────────────────────────
# INSERTION 6 – EDV-221: DB verify after "clears pending changes"
# ─────────────────────────────────────────────────────────────────────────────
$block6 = @'

    it("DB verify: course pendingUpdate.data is null after clear", async () => {
      const dbCourse = await Course.findById(clearTestCourseId).lean();
      expect(dbCourse).not.toBeNull();
      const pendingData = dbCourse.pendingUpdate?.data;
      expect(pendingData == null || Object.keys(pendingData).length === 0).toBe(true);
      expect(dbCourse.pendingUpdate?.status).toBe("none");
    });

    it("GET edit view confirms hasPendingChanges=false after clear", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${clearTestCourseId}`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      expect(res.body.result.hasPendingChanges).toBe(false);
      expect(res.body.result).not.toHaveProperty("password");
      expect(res.body.result).not.toHaveProperty("__v");
      expect(res.body).not.toHaveProperty("stack");
    });
'@
InsertAfter $lines $anchor6 $block6

# ─────────────────────────────────────────────────────────────────────────────
# INSERTION 5 – EDV-220: DB verify after "submits a fully-populated draft course"
# ─────────────────────────────────────────────────────────────────────────────
$block5 = @'

    it("DB verify: course status is pending after successful submit", async () => {
      const courseId = createdCourseId;
      const dbCourse = await Course.findById(courseId).lean();
      expect(dbCourse).not.toBeNull();
      expect(dbCourse.status).toBe("pending");
      expect(dbCourse.pendingUpdate?.status).toBe("pending");
    });
'@
InsertAfter $lines $anchor5 $block5

# ─────────────────────────────────────────────────────────────────────────────
# INSERTION 4 – EDV-219: DB verify + mass-assignment guard after "updates live course"
# ─────────────────────────────────────────────────────────────────────────────
$block4 = @'

    it("DB verify: draft pendingUpdate.data.title saved in DB", async () => {
      const courseId = createdCourseId;
      await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({ title: "DB Verify Title" });
      const dbCourse = await Course.findById(courseId).lean();
      expect(dbCourse).not.toBeNull();
      expect(dbCourse.pendingUpdate.data.title).toBe("DB Verify Title");
      expect(dbCourse.title).toBe("New draft course");
    });

    it("DB verify: LIVE course actual data unchanged after update", async () => {
      const dbCourse = await Course.findById(LIVE_COURSE_1).lean();
      expect(dbCourse).not.toBeNull();
      expect(dbCourse.pendingUpdate.data.title).toBe("Live Course Pending Update");
      expect(dbCourse.title).not.toBe("Live Course Pending Update");
    });

    it("mass-assignment guard: ignores status, studentsEnrolled, isDeleted", async () => {
      const courseId = createdCourseId;
      const before = await Course.findById(courseId).lean();
      const res = await request(app)
        .patch(`${PRI}/courses/${courseId}`)
        .set("Cookie", insACookie)
        .send({
          title: "Mass Assign Check",
          status: "live",
          studentsEnrolled: 9999,
          isDeleted: true,
        });
      expect(res.status).toBe(200);
      const after = await Course.findById(courseId).lean();
      expect(after.instructor.ref.toString()).toBe(before.instructor.ref.toString());
      expect(after.status).toBe("draft");
      expect(after.studentsEnrolled).toBe(before.studentsEnrolled);
      expect(after.isDeleted).toBeFalsy();
    });
'@
InsertAfter $lines $anchor4 $block4

# ─────────────────────────────────────────────────────────────────────────────
# INSERTION 3 – EDV-253: DB verify + leakage guard after "returns 403 for student"
# ─────────────────────────────────────────────────────────────────────────────
$block3 = @'

    it("DB verify: created draft course exists with correct fields", async () => {
      expect(createdCourseId).toBeTruthy();
      const dbCourse = await Course.findById(createdCourseId).lean();
      expect(dbCourse).not.toBeNull();
      expect(dbCourse.status).toBe("draft");
      expect(dbCourse.isPrivate).toBe(true);
      expect(dbCourse.title).toBe("New draft course");
      expect(dbCourse.instructor.ref.toString()).toBe(INS_A_USER_ID);
    });

    it("creation response has no sensitive field leakage", async () => {
      const res = await request(app)
        .post(`${PRI}/courses`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(201);
      const r = res.body.result;
      expect(r).not.toHaveProperty("password");
      expect(r).not.toHaveProperty("__v");
      expect(r).not.toHaveProperty("isDeleted");
      expect(res.body).not.toHaveProperty("stack");
      if (r.courseId) {
        await Curriculum.deleteMany({ courseId: r.courseId });
        await Course.findByIdAndDelete(r.courseId);
      }
    });
'@
InsertAfter $lines $anchor3 $block3

# ─────────────────────────────────────────────────────────────────────────────
# INSERTION 2 – EDV-218 edit view: 401, 403-student, 403-nonexistent, value types
# ─────────────────────────────────────────────────────────────────────────────
$block2 = @'

    it("returns 401 without auth (edit view)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 for student role (edit view)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 for non-existent courseId (edit view)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${NONEXISTENT_ID}`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("edit view has correct value types and no leakage", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      const r = res.body.result;
      expect(r.courseId).toMatch(/^[0-9a-f]{24}$/);
      expect(typeof r.hasPendingChanges).toBe("boolean");
      expect(typeof r.isPrivate).toBe("boolean");
      expect(r.status).toMatch(/^(draft|pending|live|rejected)$/);
      expect(typeof r.curriculum.hasPendingChanges).toBe("boolean");
      expect(Array.isArray(r.curriculum.sections)).toBe(true);
      expect(r).not.toHaveProperty("password");
      expect(r).not.toHaveProperty("__v");
      expect(res.body).not.toHaveProperty("stack");
    });
'@
InsertAfter $lines $anchor2 $block2

# ─────────────────────────────────────────────────────────────────────────────
# INSERTION 1 – EDV-218 details: 401, 403-student, value types + leakage
# ─────────────────────────────────────────────────────────────────────────────
$block1 = @'

    it("returns 401 without auth (course details)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/details`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 for student role (course details)", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/details`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("course details has correct value types and no leakage", async () => {
      const res = await request(app)
        .get(`${PRI}/courses/${LIVE_COURSE_1}/details`)
        .set("Cookie", insACookie);
      expect(res.status).toBe(200);
      const r = res.body.result;
      expect(r.courseId).toMatch(/^[0-9a-f]{24}$/);
      expect(typeof r.title).toBe("string");
      expect(typeof r.status).toBe("string");
      expect(typeof r.studentsEnrolled).toBe("number");
      expect(r.studentsEnrolled).toBeGreaterThanOrEqual(0);
      expect(r).not.toHaveProperty("password");
      expect(r).not.toHaveProperty("__v");
      expect(res.body).not.toHaveProperty("stack");
      expect(r).toHaveProperty("cateId");
    });
'@
InsertAfter $lines $anchor1 $block1

# ─────────────────────────────────────────────────────────────────────────────
# Write back
# ─────────────────────────────────────────────────────────────────────────────
$finalContent = $lines -join $nl
[System.IO.File]::WriteAllText($f, $finalContent, $encoding)
Write-Host "Done. New line count: $($lines.Count)"
