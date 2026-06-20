# PRD: Badges & Achievements System

> **Status:** Phase 2 (planned)  
> **Estimate:** 1.5 days BE + 1.5 days FE = 3–4 days total  
> **Dependency:** Streak feature (implemented), CourseProgress, QuizProgress, Student.stats

---

## 1. Objective

### Problem
EduVerse hiện chỉ có streak counter để giữ học viên quay lại. Streak đơn thuần không đủ — nó chỉ punish khi người dùng bỏ lỡ, không reward khi họ đạt được milestone. Kết quả: học viên không có cảm giác "tiến bộ" rõ ràng ngoài % completion.

### Why it matters
- **Retention**: Badges tạo ra short-term goals ("5 days left to Week Warrior") giữ user trong funnel
- **Social proof**: Hiển thị badge trên profile → word-of-mouth nhẹ
- **Emotional reward**: Completion dopamine — quan trọng với e-learning vì nội dung dài
- **Data signal**: Badge earn events là engagement signal tốt cho recommendation engine

---

## 2. Scope

### IN scope
- Badge model + seeded badge catalog (15 badges)
- UserBadge collection (awarded badges per user)
- Badge evaluation engine triggered from existing services
- Retroactive award cho users hiện tại
- API: list all badges, list user's badges, badge detail
- Frontend: badge shelf trên profile, toast notification khi earn

### OUT of scope (tránh scope creep)
- XP / Level system (separate feature, requires User model change)
- Leaderboard (separate feature, requires ranking infra)
- Custom badge creation cho instructor
- Badge expiry / revocation
- Badge sharing to social media (Phase 3)
- Animated badge reveals (Phase 3)
- Badge-gated course access (future)

---

## 3. User Stories

**Earning:**
- As a learner, I want to earn a badge when my streak reaches a milestone (7, 30, 100 days) so I feel rewarded for consistency
- As a learner, I want to earn a badge when I complete my first course so I feel a sense of accomplishment
- As a learner, I want to earn a badge when I score 100% on a quiz so my performance is acknowledged
- As a learner, I want badges to be awarded automatically without any manual action required

**Viewing:**
- As a learner, I want to see all available badges and which ones I've earned so I can plan what to pursue next
- As a learner, I want to see a toast notification immediately when I earn a badge so I feel the reward in the moment
- As a learner, I want to see when I earned each badge (date) on my profile
- As a learner, I want to see locked badges with greyed-out state and their conditions so I know what to work toward

**Discovery:**
- As a learner, I want to see how far I am from the next streak badge (e.g., "3 more days for Week Warrior") so I'm motivated to continue

---

## 4. Functional Requirements

### 4.1 Badge Awarding Logic
- Badges are awarded **exactly once** per user per badge (no duplicates)
- Award is **immediate** — triggered synchronously within the same request that caused the event
- If a user qualifies for multiple badges from one event (e.g., reaches day 7 and day 3 badges simultaneously), all eligible badges are awarded
- Award creates a `UserBadge` document with `earnedAt`, `triggerEvent`, `triggerValue`

### 4.2 Trigger Conditions

| Event | Service Hook | What to evaluate |
|-------|-------------|-----------------|
| Daily activity registered | `streak.service.registerActivity()` | Streak milestone badges |
| Lecture marked complete | `course-progress.service.markLectureComplete()` | Lecture count badges |
| Course marked complete | `course-progress.service.markCourseComplete()` | Course count badges |
| Quiz submitted | `quiz.service.submitQuiz()` | Quiz performance badges |

### 4.3 Duplicate Prevention
- Before awarding: `UserBadge.exists({ user, badge })` check
- At DB level: compound unique index `{ user: 1, badge: 1 }` on `user_badges`
- If duplicate would occur: silently skip (no error thrown, no performance penalty)

### 4.4 Retroactive Badge Award
- Run once as a migration/script: `scripts/retroactive-badges.js`
- Process all users in batches of 50
- For each user: fetch their streak, courseProgress, quizProgress and evaluate all badge conditions
- Idempotent: uses `upsert` logic — safe to re-run
- Sets `earnedAt = user.createdAt` (approximate) for retroactive badges, `triggerEvent = "retroactive"`

### 4.5 Badge Catalog Management
- Badges are seeded via `badge.seed.js` (run once)
- Badge `key` (snake_case) is the stable identifier used in code
- Disabling a badge: set `isActive: false` — won't be evaluated or returned in public list
- Adding new badges: add to seed + add evaluation case in engine (no model change)

---

## 5. Non-Functional Requirements

### Performance
- Badge evaluation must NOT block the main request response
- Evaluation logic runs after `await` in the service — if badge evaluation fails, the main operation still succeeds (try/catch isolation)
- Each evaluation: single `UserBadge.exists()` check + one insert — O(badges_per_event) where badges_per_event ≤ 5
- No full-collection scans during hot path

### Scalability
- Badge evaluation is stateless — no locking, no queues needed at current scale
- When scale requires it: move to event emitter pattern → BullMQ queue (Phase 3 upgrade path)
- Retroactive script: chunked with `setImmediate` between batches to avoid MongoDB timeout

### Reliability
- Wrapped in try/catch in service hooks — badge failure must NOT break streak/progress/quiz saves
- Unique index at DB level prevents double-award even under concurrent requests
- Retroactive script is idempotent — safe to re-run if interrupted

---

## 6. Badge Catalog

### Category: Streak (6 badges)

| Key | Name | Condition | Rarity |
|-----|------|-----------|--------|
| `streak_3` | First Flame 🔥 | `currentStreak >= 3` | Common |
| `streak_7` | Week Warrior ⚔️ | `currentStreak >= 7` | Common |
| `streak_14` | Fortnight Force 💪 | `currentStreak >= 14` | Rare |
| `streak_30` | Month Master 🏅 | `currentStreak >= 30` | Rare |
| `streak_100` | Century Scholar 💯 | `currentStreak >= 100` | Epic |
| `streak_longest_30` | Iron Will 🦾 | `longestStreak >= 30` (ever achieved, even if broken) | Rare |

> Source fields: `streak.currentStreak`, `streak.longestStreak`

### Category: Completion (5 badges)

| Key | Name | Condition | Rarity |
|-----|------|-----------|--------|
| `lecture_first` | First Step 👣 | Complete 1st lecture ever | Common |
| `lecture_50` | Content Climber 📚 | `student.stats.completedLectures >= 50` | Rare |
| `lecture_200` | Lecture Legend 🎓 | `student.stats.completedLectures >= 200` | Epic |
| `course_first` | Graduate 🎓 | Complete 1st course | Common |
| `course_5` | Course Collector 🏆 | `student.stats.completedCourses >= 5` | Rare |

> Source fields: `student.stats.completedLectures`, `student.stats.completedCourses`

### Category: Performance (4 badges)

| Key | Name | Condition | Rarity |
|-----|------|-----------|--------|
| `quiz_perfect` | Ace ⭐ | Score 100% on any quiz (`score === totalQuestions`) | Common |
| `quiz_perfect_3` | Triple Ace 🌟 | 3 perfect quiz scores (cumulative, any course) | Rare |
| `course_ai_score_90` | AI Approved 🤖 | `courseProgress.aiAssessment.overallScore >= 90` | Epic |
| `fast_finish` | Speed Runner ⚡ | Complete a course within 7 days of first lecture | Rare |

> Source fields: `quizProgress.quizzes[].score`, `quizProgress.quizzes[].totalQuestions`, `courseProgress.aiAssessment.overallScore`, `courseProgress.firstStartedAt` + `isCompleted`

---

## 7. System Design

### 7.1 Database Models

**`Badge` model** — `backend/src/modules/badge/badge.model.js`
```js
{
  key:         String   // unique, snake_case — stable code identifier
  name:        String
  description: String
  icon:        String   // emoji or CDN URL
  category:    enum ['streak', 'completion', 'performance']
  rarity:      enum ['common', 'rare', 'epic', 'legendary']
  condition: {
    type:      String   // 'streak_current', 'streak_longest', 'lectures_total',
                        //  'courses_total', 'quiz_perfect_count', 'ai_score', 'fast_finish'
    threshold: Number
  }
  isActive:    Boolean  // default true — set false to disable without delete
  sortOrder:   Number   // display order in catalog
}
```
Index: `{ key: 1 }` unique

**`UserBadge` model** — `backend/src/modules/badge/user-badge.model.js`
```js
{
  user:         ObjectId (ref User)
  badge:        ObjectId (ref Badge)
  earnedAt:     Date
  triggerEvent: String  // 'streak_updated' | 'lecture_completed' | 'course_completed'
                        //  | 'quiz_submitted' | 'retroactive'
  triggerValue: Number  // value that triggered it (e.g., streakCount=7)
}
```
Index: `{ user: 1, badge: 1 }` **unique** — DB-level duplicate prevention
Index: `{ user: 1 }` — for fetching user's badges

### 7.2 Service: BadgeEvaluator

**File:** `backend/src/modules/badge/badge.evaluator.js`

```js
// Core function called from other services
async function evaluateAndAward(userId, event, context) {
  // event: 'streak_updated' | 'lecture_completed' | 'course_completed' | 'quiz_submitted'
  // context: { streakCurrent, streakLongest, lecturesTotal, coursesTotal,
  //            quizScore, quizTotal, perfectQuizCount, aiScore, daysSinceFirstLecture }

  const relevantBadges = await Badge.find({
    isActive: true,
    'condition.type': { $in: EVENT_TO_CONDITIONS[event] }
  });

  const alreadyEarned = new Set(
    (await UserBadge.find({ user: userId }, 'badge')).map(b => b.badge.toString())
  );

  const toAward = relevantBadges.filter(badge =>
    !alreadyEarned.has(badge._id.toString()) &&
    isConditionMet(badge.condition, context)
  );

  if (!toAward.length) return [];

  const docs = toAward.map(badge => ({
    user: userId, badge: badge._id,
    earnedAt: new Date(), triggerEvent: event,
    triggerValue: getContextValue(badge.condition.type, context)
  }));

  // insertMany with ordered:false — if duplicate slips through, don't throw
  await UserBadge.insertMany(docs, { ordered: false }).catch(() => {});
  return toAward;
}
```

**EVENT_TO_CONDITIONS map:**
```js
{
  streak_updated:     ['streak_current', 'streak_longest'],
  lecture_completed:  ['lectures_total'],
  course_completed:   ['courses_total', 'ai_score', 'fast_finish'],
  quiz_submitted:     ['quiz_perfect_count']
}
```

### 7.3 Service Hooks (injection points)

**`streak.service.js` → `registerActivity()`:**
```js
// After updating streak document:
const awarded = await evaluateAndAward(userId, 'streak_updated', {
  streakCurrent: streak.currentStreak,
  streakLongest: streak.longestStreak
});
```

**`course-progress.service.js` → after `isCompleted = true`:**
```js
const awarded = await evaluateAndAward(userId, 'course_completed', {
  coursesTotal: student.stats.completedCourses,
  aiScore: progress.aiAssessment?.overallScore,
  daysSinceFirstLecture: diffDays(progress.firstStartedAt, new Date())
});
```

**`course-progress.service.js` → after lecture marked complete:**
```js
const awarded = await evaluateAndAward(userId, 'lecture_completed', {
  lecturesTotal: student.stats.completedLectures
});
```

**`quiz.service.js` → after quiz submitted:**
```js
const isPerfect = score === totalQuestions;
const perfectCount = await UserBadge.countDocuments({
  user: userId,
  badge: { $in: PERFECT_QUIZ_BADGE_IDS }  // pre-loaded at startup
});
const awarded = await evaluateAndAward(userId, 'quiz_submitted', {
  quizScore: score, quizTotal: totalQuestions,
  perfectQuizCount: isPerfect ? perfectCount + 1 : perfectCount
});
```

### 7.4 API Endpoints

```
GET  /badges                    → All active badges (public, no auth) — for catalog
GET  /badges/me                 → Current user's earned badges (auth required)
GET  /badges/me/progress        → Streak/count values + next badge targets (auth)
```

**Response shape for `/badges/me`:**
```json
{
  "earned": [
    { "key": "streak_7", "name": "Week Warrior", "earnedAt": "2026-01-15T...", "icon": "⚔️" }
  ],
  "locked": [
    { "key": "streak_30", "name": "Month Master", "condition": "30-day streak", "icon": "🏅" }
  ]
}
```

---

## 8. Retroactive Award Strategy

**Script:** `backend/scripts/retroactive-badges.js`

**Algorithm:**
```
For each user (batch of 50):
  1. Load: streak, student.stats, quizProgress (count perfect scores)
  2. Build context object from current data
  3. Call evaluateAndAward() for all 4 event types
  4. Set earnedAt = earliest relevant date (streak.createdAt, etc.)
  5. Log: { userId, badgesAwarded: [...] }
  
Between batches: await new Promise(resolve => setImmediate(resolve))
```

**Estimated runtime:** ~1000 users × 4 event evaluations × ~5ms = 20 seconds  
**Safe to run:** During off-peak hours, or via `node scripts/retroactive-badges.js --dry-run` first  
**Idempotent:** `insertMany` with `ordered: false` — duplicate key errors silently ignored

---

## 9. Frontend

### Components needed
1. **BadgeShelf** — grid of badge cards on student profile page
   - Earned: full color + earnedAt date tooltip
   - Locked: greyscale + condition text
2. **BadgeToast** — appears top-right when badge earned, auto-dismiss 4s
   - Triggered from API response (any endpoint that hooks into badge evaluation can return `awardedBadges: []`)
3. **StreakBadgeProgress** — "X more days for [next badge]" in streak widget on dashboard

### API integration
- Return `awardedBadges` array in response from streak/progress/quiz endpoints
- Frontend inspects `awardedBadges` and dispatches toast for each

---

## 10. Implementation Plan

### Phase 1 — Streak badges (Day 1, Backend)
1. Create `Badge` and `UserBadge` models
2. Create `badge.seed.js` — seed 6 streak badges only
3. Create `badge.evaluator.js` with streak condition types
4. Inject `evaluateAndAward()` into `streak.service.registerActivity()`
5. Create `GET /badges` and `GET /badges/me` endpoints
6. Run retroactive script for streak badges only
7. Return `awardedBadges` in streak API response

**Deliverable:** Streak badges fully working end-to-end

### Phase 2 — Completion + Performance badges (Day 1.5–2, Backend)
1. Seed remaining 9 badges (completion + performance)
2. Add completion condition types to evaluator
3. Inject hook into `course-progress.service` (lecture + course complete)
4. Inject hook into `quiz.service` (quiz submitted)
5. Run retroactive script for all badge types
6. Add `GET /badges/me/progress` endpoint

**Deliverable:** All 15 badges evaluating correctly

### Phase 3 — Frontend (Day 2.5–3)
1. BadgeShelf component on profile page (earned + locked)
2. BadgeToast notification component
3. Wire toast to API responses (streak, course complete, quiz)
4. StreakBadgeProgress widget update

**Deliverable:** Full user-facing badge experience

---

## 11. Known Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Badge eval throws → breaks main request | Wrap in try/catch in every hook. Main operation always succeeds. |
| Duplicate award under race condition | DB unique index `{ user, badge }` as final guard |
| `fast_finish` badge: `firstStartedAt` might be null | Check `firstStartedAt != null` before evaluating. Skip if null. |
| `quiz_perfect_3` needs count across courses | Pre-query perfect quiz count from UserBadge or quizProgress before calling evaluator |
| Retroactive script too slow | Batch size 50 + setImmediate. Dry-run first. Can reduce batch size if needed. |
| `aiAssessment.overallScore` not always present | `score >= 90 && score != null` check in condition evaluator |
