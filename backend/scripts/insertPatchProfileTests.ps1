param()
$ErrorActionPreference = "Stop"

$f = "C:\personal\EduVerse\backend\tests\instructor.test.js"
$lines = Get-Content $f -Encoding utf8

# Find the line index (0-based) of the "// EDV-218: Get Instructor" comment line
$insertLine = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match "EDV-218: Get Instructor") {
    # We want to insert BEFORE the separator comment that comes 2 lines before this
    # That separator comment starts with "// " followed by garbled box chars
    # Walk backward to find the blank line + separator comment
    $insertLine = $i - 2  # 2 lines before: separator comment line
    break
  }
}

if ($insertLine -lt 0) {
  Write-Error "Could not find insertion point"
  exit 1
}

Write-Host "Inserting before line $($insertLine + 1) (0-indexed: $insertLine)"
Write-Host "Line at insertLine: $($lines[$insertLine])"

$newBlock = @'

// ===============================================================================
// EDV-183 (cont): Update Instructor Profile  PATCH /api/instructor/profile
// ===============================================================================
describe("EDV-183 · Update Instructor Profile", () => {
  describe("PATCH /api/instructor/profile", () => {
    let snapshotIns, snapshotUser;

    beforeAll(async () => {
      // Snapshot INSTRUCTOR_A state before any modification
      snapshotIns  = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      snapshotUser = await User.findById(INS_A_USER_ID).lean();
    });

    afterAll(async () => {
      // Restore INS_A to exact original state
      try {
        await Instructor.findOneAndUpdate(
          { user: INS_A_USER_ID },
          {
            $set: {
              occupation:   snapshotIns.occupation,
              introduction: snapshotIns.introduction,
              address:      snapshotIns.address,
              skills:       snapshotIns.skills,
              education:    snapshotIns.education,
            },
          }
        );
        await User.findByIdAndUpdate(INS_A_USER_ID, {
          $set: {
            name:        snapshotUser.name,
            phonenumber: snapshotUser.phonenumber,
            pfpImg:      snapshotUser.pfpImg,
            website:     snapshotUser.website,
            socials:     snapshotUser.socials,
          },
        });
      } catch { /* ignore */ }
    });

    // -- Success cases ----------------------------------------------------------

    it("updates occupation and returns toInstructorDetails DTO shape", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ occupation: "[TEST] Senior Dev" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Profile updated successfully!");
      const r = res.body.result;
      expect(r.occupation).toBe("[TEST] Senior Dev");
      // Full DTO shape
      expect(r).toHaveProperty("name");
      expect(r).toHaveProperty("email");
      expect(r).toHaveProperty("phonenumber");
      expect(r).toHaveProperty("avatar");
      expect(r).toHaveProperty("address");
      expect(r).toHaveProperty("website");
      expect(r.socials).toHaveProperty("facebook");
      expect(r.socials).toHaveProperty("instagram");
      expect(r.socials).toHaveProperty("linkedin");
      expect(r.socials).toHaveProperty("youtube");
      expect(r).toHaveProperty("introduction");
      expect(r).toHaveProperty("skills");
      expect(r).toHaveProperty("education");
      expect(r).toHaveProperty("isActive");
    });

    it("response does NOT leak password, __v, passwordResetToken", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ occupation: "[TEST] LeakGuard Check" });
      expect(res.status).toBe(200);
      const r = res.body.result;
      expect(r).not.toHaveProperty("password");
      expect(r).not.toHaveProperty("__v");
      expect(r).not.toHaveProperty("passwordResetToken");
      expect(r).not.toHaveProperty("verifyOtp");
      expect(r).not.toHaveProperty("googleId");
      expect(res.body).not.toHaveProperty("stack");
    });

    it("updates user name -> verified by DB", async () => {
      const newName = "[TEST] Updated Name";
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ name: newName });
      expect(res.status).toBe(200);
      expect(res.body.result.name).toBe(newName);

      // DB cross-check: User document updated
      const dbUser = await User.findById(INS_A_USER_ID).lean();
      expect(dbUser.name).toBe(newName);

      // Verify via GET
      const getRes = await request(app)
        .get(`${PRI}/profile`)
        .set("Cookie", insACookie);
      expect(getRes.body.result.name).toBe(newName);
    });

    it("updates introduction and address -> verified by DB", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({
          introduction: "[TEST] Updated intro",
          address: "[TEST] 123 Test Street",
        });
      expect(res.status).toBe(200);
      expect(res.body.result.introduction).toBe("[TEST] Updated intro");
      expect(res.body.result.address).toBe("[TEST] 123 Test Street");

      // DB cross-check
      const dbIns = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      expect(dbIns.introduction).toBe("[TEST] Updated intro");
      expect(dbIns.address).toBe("[TEST] 123 Test Street");
    });

    it("updates skills array -> verified by DB", async () => {
      const skills = [
        { name: "JavaScript", level: 90 },
        { name: "MongoDB", level: 75 },
      ];
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ skills });
      expect(res.status).toBe(200);
      expect(res.body.result.skills).toHaveLength(2);
      expect(res.body.result.skills[0]).toMatchObject({ name: "JavaScript", level: 90 });
      expect(res.body.result.skills[1]).toMatchObject({ name: "MongoDB", level: 75 });

      // DB cross-check
      const dbIns = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      expect(dbIns.skills).toHaveLength(2);
      expect(dbIns.skills[0].name).toBe("JavaScript");
      expect(dbIns.skills[0].level).toBe(90);
    });

    it("updates education array -> verified by DB", async () => {
      const education = [
        {
          institution: "Test University",
          fieldOfStudy: "Computer Science",
          addedAt: new Date().toISOString(),
        },
      ];
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ education });
      expect(res.status).toBe(200);
      expect(res.body.result.education).toHaveLength(1);
      expect(res.body.result.education[0]).toMatchObject({
        institution: "Test University",
        fieldOfStudy: "Computer Science",
      });

      // DB cross-check
      const dbIns = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      expect(dbIns.education[0].institution).toBe("Test University");
    });

    it("updates social links -> verified by DB", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({
          socials: {
            facebook: "https://facebook.com/testuser",
            linkedin: "https://linkedin.com/in/testuser",
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.result.socials.facebook).toBe("https://facebook.com/testuser");
      expect(res.body.result.socials.linkedin).toBe("https://linkedin.com/in/testuser");

      // DB cross-check
      const dbUser = await User.findById(INS_A_USER_ID).lean();
      expect(dbUser.socials.facebook).toBe("https://facebook.com/testuser");
    });

    it("does NOT apply mass-assignment fields (isApproved, role, myCourses)", async () => {
      const before = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      const beforeUser = await User.findById(INS_A_USER_ID).lean();

      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({
          occupation: "[TEST] Mass-Assign Check",
          isApproved: false,
          role: "admin",
          myCourses: [],
          isVerified: false,
        });
      expect(res.status).toBe(200);

      // DB: isApproved must not have changed
      const after = await Instructor.findOne({ user: INS_A_USER_ID }).lean();
      expect(after.isApproved).toBe(before.isApproved);

      // DB: role and isVerified must not have changed
      const afterUser = await User.findById(INS_A_USER_ID).lean();
      expect(afterUser.role).toBe(beforeUser.role);
      expect(afterUser.isVerified).toBe(beforeUser.isVerified);
    });

    // -- Validation errors ------------------------------------------------------

    it("returns 400 for empty body", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).not.toHaveProperty("stack");
    });

    it("returns 400 for occupation too short (<2 chars)", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ occupation: "X" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).not.toHaveProperty("stack");
    });

    it("returns 400 for occupation too long (>80 chars)", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ occupation: "A".repeat(81) });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for skill level > 100", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ skills: [{ name: "JS", level: 101 }] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for skill level < 0", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ skills: [{ name: "JS", level: -1 }] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for introduction too long (>2000 chars)", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ introduction: "X".repeat(2001) });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for address too long (>200 chars)", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ address: "A".repeat(201) });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for education missing institution", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", insACookie)
        .send({ education: [{ fieldOfStudy: "CS" }] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    // -- Authorization matrix ---------------------------------------------------

    it("returns 401 without auth", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .send({ occupation: "Should not apply" });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body).not.toHaveProperty("stack");
    });

    it("returns 403 for student role", async () => {
      const res = await request(app)
        .patch(`${PRI}/profile`)
        .set("Cookie", studentCookie)
        .send({ occupation: "Should not apply" });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
'@

# Split the new block into lines (handle both CRLF and LF)
$newLines = $newBlock -split "`r?`n"

# Build the result: lines before insertLine + new block + lines from insertLine onward
$result = $lines[0..($insertLine - 1)] + $newLines + $lines[$insertLine..($lines.Count - 1)]

Write-Host "Before: $($lines.Count) lines. After: $($result.Count) lines."

# Write back with UTF8 no BOM
$encoding = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($f, $result, $encoding)
Write-Host "Done."
