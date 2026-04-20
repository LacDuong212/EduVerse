# EduVerse API — Test Report

![PASS](https://img.shields.io/badge/Tests-PASS-brightgreen)

| Field | Value |
|---|---|
| Run date | 2026-04-13 17:45:25 UTC |
| Total suites | 1 |
| Total tests | 38 |
| ✅ Passed | 37 |
| ❌ Failed | 0 |
| ⏭ Skipped | 0 |
| Duration | 18.87s |

---

## ✅ tests/course.test.js

**37 passed** | **0 failed** | 18.87s

| # | Status | Test name | Duration |
|---|---|---|---|
|  1 | ✅ | EDV-174 \| GET /api/courses/home ✅ Success: trả về 4 sections → newest, bestSellers, topRated, biggestDiscounts | 1.10s |
|  2 | ✅ | EDV-174 \| GET /api/courses/home ✅ Data count: newest ≤ 8, bestSellers ≤ 6, topRated ≤ 8, biggestDiscounts ≤ 4 | 185ms |
|  3 | ✅ | EDV-174 \| GET /api/courses/home ✅ Category check: mỗi course phải có category.name và category.slug | 189ms |
|  4 | ✅ | EDV-174 \| GET /api/courses/home ✅ Discount logic: biggestDiscounts chỉ chứa course có discountPrice | 182ms |
|  5 | ✅ | EDV-174 \| GET /api/courses/stats ✅ Success: trả về totalCourses, totalLearners, totalInstructors, totalHours | 49ms |
|  6 | ✅ | EDV-174 \| GET /api/courses/stats ✅ Math check: totalHours là số, tối đa 1 chữ số thập phân | 48ms |
|  7 | ✅ | EDV-174 \| GET /api/courses/stats ✅ Math check: totalCourses, totalLearners, totalInstructors là số nguyên không âm | 45ms |
|  8 | ✅ | EDV-175 \| GET /api/courses ✅ Basic fetch: page=1&limit=5 → trả về ≤ 5 courses, có pagination | 90ms |
|  9 | ✅ | EDV-175 \| GET /api/courses ✅ Pagination math: page=2&limit=5 → pagination.page === 2 | 90ms |
| 10 | ✅ | EDV-175 \| GET /api/courses ✅ Level filter: level=beginner → tất cả courses phải có level 'beginner' | 138ms |
| 11 | ✅ | EDV-175 \| GET /api/courses ✅ Tag filter: tag=python → kết quả chứa course có tag python | 91ms |
| 12 | ✅ | EDV-175 \| GET /api/courses ✅ Price filter: price=paid → không có course miễn phí trong kết quả | 135ms |
| 13 | ✅ | EDV-175 \| GET /api/courses ✅ Price sort priceLowToHigh: giá hiệu lực tăng dần | 90ms |
| 14 | ✅ | EDV-175 \| GET /api/courses ✅ Search: tìm 'docker' → có kết quả | 476ms |
| 15 | ✅ | EDV-186 \| GET /api/courses/:id ✅ Guest: public live course → 200 + isOwned undefined | 101ms |
| 16 | ✅ | EDV-186 \| GET /api/courses/:id ❌ Error: ID không tồn tại → 404 | 96ms |
| 17 | ✅ | EDV-186 \| GET /api/courses/:id ❌ Error: ID không hợp lệ (non-ObjectId) → 400 validation error | 36ms |
| 18 | ✅ | EDV-186 \| GET /api/courses/:id ❌ Error: course ở trạng thái draft → 400 'unavailable' | 97ms |
| 19 | ✅ | EDV-186 \| GET /api/courses/:id ✅ Instructor (owner): xem course của mình → 200 + isOwned true | 423ms |
| 20 | ✅ | EDV-186 \| GET /api/courses/:id ✅ Student (not enrolled): xem public live course → 200 + isOwned false | 377ms |
| 21 | ✅ | EDV-202 \| GET /api/courses/recommendations ✅ Guest: không đăng nhập → 200 + debugSource Fallback(BestSellers) | 116ms |
| 22 | ✅ | EDV-202 \| GET /api/courses/recommendations ✅ Student mới (không có lịch sử): đăng nhập → 200, Fallback | 387ms |
| 23 | ✅ | EDV-202 \| GET /api/courses/recommendations ✅ Guest: kết quả courses ≤ 8 | 97ms |
| 24 | ✅ | EDV-203 \| GET /api/courses/:id/related ✅ Success: public live course → 200 + có courses array | 178ms |
| 25 | ✅ | EDV-203 \| GET /api/courses/:id/related ✅ Self-exclusion: course hiện tại không xuất hiện trong related list | 186ms |
| 26 | ✅ | EDV-203 \| GET /api/courses/:id/related ❌ Error: ID không tồn tại → 404 | 62ms |
| 27 | ✅ | EDV-203 \| GET /api/courses/:id/related ❌ Error: ID không hợp lệ → 400 | 29ms |
| 28 | ✅ | EDV-203 \| GET /api/courses/:id/related ✅ debugSource có trong response | 177ms |
| 29 | ✅ | EDV-204 \| GET /api/courses/:id/curriculum ✅ Guest: curriculum trả về 200, lecture free có videoId, non-free không có | 199ms |
| 30 | ✅ | EDV-204 \| GET /api/courses/:id/curriculum ✅ Course owner (instructor): curriculum đầy đủ + có aiData field | 464ms |
| 31 | ✅ | EDV-204 \| GET /api/courses/:id/curriculum ✅ Non-owner instructor: giống guest (videoId null cho non-free) | 430ms |
| 32 | ✅ | EDV-204 \| GET /api/courses/:id/curriculum ❌ Error: draft course → 400 'unavailable' | 111ms |
| 33 | ✅ | EDV-197 \| GET /api/courses/:id/reviews ✅ Guest: public live course → 200 + có reviews array | 99ms |
| 34 | ✅ | EDV-197 \| GET /api/courses/:id/reviews ✅ Guest: myReview không có trong response | 95ms |
| 35 | ✅ | EDV-197 \| GET /api/courses/:id/reviews ✅ Pagination: page=1&limit=2 → reviews.length ≤ 2 | 99ms |
| 36 | ✅ | EDV-197 \| GET /api/courses/:id/reviews ✅ Pagination: có totalItems trong pagination object | 84ms |
| 37 | ✅ | EDV-197 \| GET /api/courses/:id/reviews ✅ Student đăng nhập (không có review): myReview undefined/null | 391ms |
| 38 | ❌ | EDV-249 \| GET /api/courses/filters ⚠️ Endpoint chưa tồn tại trong codebase hiện tại — cần implement | — |
