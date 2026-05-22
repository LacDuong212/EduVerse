# EduVerse — UAT Test Strategy
**Version:** 1.0
**Date:** 2026-05-21
**Round:** UAT Feature Testing
**Environment:** https://eduverse.io.vn
**Approach:** Black-Box · Flow-Based · UI-Focused

---

## 1. Coverage Goals

| Metric | Target | Definition |
|---|---|---|
| **Main Case Coverage** | **100%** | Mọi TC loại `MAIN` phải được thực thi và pass |
| **Flow Coverage** | **≥ 90%** | ≥ 11/12 flow có đủ MAIN steps pass |
| **Negative Case Coverage** | ≥ 80% | ≥ 80% TC loại `NEG` được thực thi |
| **Alt Case Coverage** | ≥ 70% | ≥ 70% TC loại `ALT` được thực thi |

### 1.1 Phân loại Test Case

| Loại | Ký hiệu | Nghĩa | Bắt buộc? |
|---|---|---|---|
| Main (Happy Path) | `MAIN` | Kịch bản chính — user hoàn thành mục tiêu | ✅ 100% |
| Alternative | `ALT` | Nhánh hợp lệ nhưng không phải con đường chính | ≥ 70% |
| Negative | `NEG` | Input sai / thiếu quyền / điều kiện biên | ≥ 80% |

### 1.2 Flow Coverage Formula

```
Flow Coverage = (Số flow có tất cả MAIN TC pass) / (Tổng số flow) × 100%
Target: ≥ 90%  →  Tối thiểu 11/12 flow phải pass toàn bộ MAIN TC
```

---

## 2. Test Scope

### In Scope — 11 User Flows + 1 Security Flow

| ID | Flow Name | Role | Priority |
|---|---|---|---|
| FL-01 | Onboarding (Register → Verify → Login → Profile) | Guest → Student | 🔴 Critical |
| FL-02 | Course Discovery (Browse → Search → Detail) | Guest / Student | 🔴 Critical |
| FL-03 | Purchase (Cart → Coupon → Checkout → Payment) | Student | 🔴 Critical |
| FL-04 | Learning (Enroll → Watch → Progress → Complete) | Student | 🔴 Critical |
| FL-05 | Review (Write → Edit → Delete) | Student | 🟠 High |
| FL-06 | Order Management (List → Detail → Cancel) | Student | 🟠 High |
| FL-07 | Account Settings (Password → Avatar → Deactivate) | Student / Instructor | 🟠 High |
| FL-08 | Notification (Read → Mark → Delete) | Student | 🟡 Medium |
| FL-09 | Instructor — Course Lifecycle (Create → Edit → Submit) | Instructor | 🟠 High |
| FL-10 | Instructor — Dashboard & Earnings | Instructor | 🟡 Medium |
| FL-11 | Become Instructor (Apply) | Student | 🟡 Medium |
| FL-SEC | Security & Authorization | All roles | 🔴 Critical |

### Out of Scope
- Admin panel (`backend_admin/`)
- ML training pipeline internals
- Infrastructure / CI/CD
- Load / performance testing

---

## 3. Test Data Prerequisites

| Account | Email | Role | State |
|---|---|---|---|
| Student A | `student_a@test.com` | student | Active, verified, no courses enrolled |
| Student B | `student_b@test.com` | student | Active, verified — dùng để test isolation |
| Instructor | `instructor@test.com` | instructor | Active, approved, ≥ 1 live course |
| Unverified | `unverified@test.com` | student | Registered, OTP chưa confirm |
| Deactivated | `deactivated@test.com` | student | Account bị deactivate |

**Test Courses cần có sẵn:**
- **Course A:** live, public, price > 0, có curriculum ≥ 3 lectures
- **Course B:** live, public, free (price = 0)
- **Course Draft:** status = draft (không được hiển thị public)

---

## 4. Flow Test Cases

> **Steps:** Mô tả hành động user trên browser — navigate / click / fill / observe
> **Expected Result:** Mô tả những gì user NHÌN THẤY trên màn hình — toast / redirect / UI state
> **Status:** ⬜ Not Run · ✅ Pass · ❌ Fail · ⚠️ Blocked

---

### FL-01 · Onboarding

**Mục tiêu:** Guest đăng ký → xác nhận email → đăng nhập → hoàn thiện profile

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FL01-TC01 | `MAIN` | Navigate to `/auth/sign-up` → Fill Name, new Email, Password "Test@1234" → Click "Sign Up" | Page shows "Verification email sent" notice; user stays on verify page — NOT redirected to dashboard | ⬜ |
| FL01-TC02 | `MAIN` | Open test email inbox → Copy 6-digit OTP → Navigate to `/auth/verify-email` → Enter OTP → Click "Verify" | Toast "Email verified successfully"; redirect to `/auth/sign-in` | ⬜ |
| FL01-TC03 | `MAIN` | On `/auth/sign-in` → Enter registered email + password → Click "Sign In" | Redirect to `/student/dashboard`; user name visible in navigation bar | ⬜ |
| FL01-TC04 | `MAIN` | Navigate to `/student/profile` → Update Name, Bio, Phone → Click "Save" | Toast "Profile updated"; fields show new values after page reload | ⬜ |
| FL01-TC05 | `MAIN` | On profile page → click avatar upload area → select JPG/PNG ≤ 2MB → confirm | New avatar image displays immediately; initials placeholder no longer shown | ⬜ |
| FL01-TC06 | `MAIN` | In profile Social Links section → enter Facebook URL + LinkedIn URL → Click "Save" | Toast success; social link icons visible on profile page after save | ⬜ |
| FL01-TC07 | `MAIN` | Navigate to `/student/dashboard` → open interests section → select ≥ 2 categories → Save | Recommended courses section updates showing courses matching selected interests | ⬜ |
| FL01-TC08 | `NEG` | On `/auth/sign-up` → enter email of an existing verified account → Click "Sign Up" | Inline error "User already exists" displayed; registration does not proceed | ⬜ |
| FL01-TC09 | `NEG` | On `/auth/sign-up` → enter malformed email (e.g. "abc@") → Click "Sign Up" | Inline validation error on email field; form does not submit | ⬜ |
| FL01-TC10 | `NEG` | On `/auth/sign-up` → enter password with 4 characters → Click "Sign Up" | Inline error on password field (e.g. "Password too short"); registration blocked | ⬜ |
| FL01-TC11 | `NEG` | On `/auth/sign-in` → enter correct email + WRONG password → Click "Sign In" | Error message "Wrong email or password"; user stays on sign-in page | ⬜ |
| FL01-TC12 | `NEG` | On `/auth/sign-in` → log in with Unverified test account → Click "Sign In" | UI shows prompt to verify email; user NOT redirected to dashboard | ⬜ |
| FL01-TC13 | `NEG` | On `/auth/sign-in` → log in with Deactivated test account → Click "Sign In" | UI shows "Account deactivated" message with Reactivate option; user NOT redirected to dashboard | ⬜ |
| FL01-TC14 | `NEG` | On `/auth/verify-email` → enter incorrect OTP code → Click "Verify" | Error message "Invalid OTP"; user stays on verify page | ⬜ |
| FL01-TC15 | `NEG` | Wait for OTP to expire → enter the expired OTP on verify page → Click "Verify" | Error "OTP has expired"; user prompted to resend | ⬜ |
| FL01-TC16 | `ALT` | On `/auth/sign-in` → click "Continue with Google" → complete OAuth with a new Google account | Redirect to `/student/dashboard`; Google account name visible in nav; new account created | ⬜ |
| FL01-TC17 | `ALT` | On `/auth/sign-in` → type email in UPPERCASE (e.g. "STUDENT_A@TEST.COM") + correct password → Sign In | Login succeeds; redirect to dashboard (case-insensitive email) | ⬜ |
| FL01-TC18 | `ALT` | Click "Forgot Password" → enter registered email → Submit → open reset email → click link → enter new password → Confirm | Success message after reset; new password works on next sign-in attempt | ⬜ |
| FL01-TC19 | `ALT` | On `/auth/verify-email` → click "Resend OTP" | UI confirms "New OTP sent"; new OTP arrives in test email inbox | ⬜ |

**FL-01 MAIN: 7 · ALT: 4 · NEG: 8 · Total: 19**

---

### FL-02 · Course Discovery

**Mục tiêu:** User browse, filter, sort, search courses — xem detail page đầy đủ

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FL02-TC01 | `MAIN` | Navigate to `/home` without logging in | Homepage loads with 4 sections: Newest, Best Sellers, Top Rated, Biggest Discounts; global stats (total students / courses / instructors) visible | ⬜ |
| FL02-TC02 | `MAIN` | Navigate to `/courses` | Course cards displayed in a grid; pagination controls visible | ⬜ |
| FL02-TC03 | `MAIN` | On `/courses` → open Category filter → select a category → Apply | Only courses in that category shown; active filter tag displayed | ⬜ |
| FL02-TC04 | `MAIN` | On `/courses` → set Price filter = "Free" → Apply | Only free courses displayed (price badge shows "Free") | ⬜ |
| FL02-TC05 | `MAIN` | On `/courses` → set Price filter = "Paid" → Apply | Only paid courses displayed (price > 0 visible on each card) | ⬜ |
| FL02-TC06 | `MAIN` | On `/courses` → set Level filter = "Beginner" → Apply | Only beginner-level courses shown; level badge visible on cards | ⬜ |
| FL02-TC07 | `MAIN` | On `/courses` → set Sort = "Newest" | Course cards reorder — most recently published courses appear first | ⬜ |
| FL02-TC08 | `MAIN` | On `/courses` → set Sort = "Most Popular" | Course cards reorder — highest enrollment count first | ⬜ |
| FL02-TC09 | `MAIN` | On `/courses` → type a keyword in search box that has results → press Enter | Matching course cards displayed; result count shown | ⬜ |
| FL02-TC10 | `MAIN` | Click on any Course card | Navigate to `/courses/:id`; page shows: title, instructor name, price, description, star rating, curriculum accordion, reviews | ⬜ |
| FL02-TC11 | `MAIN` | On course detail → scroll to Curriculum section → expand a section | Lecture titles and durations visible inside the expanded section | ⬜ |
| FL02-TC12 | `MAIN` | On course detail → scroll to Reviews section | Reviews show user avatar, name, star rating, comment text, date | ⬜ |
| FL02-TC13 | `MAIN` | On course detail → scroll to Related Courses section | At least 1 related course card displayed | ⬜ |
| FL02-TC14 | `MAIN` | Click on instructor name link on course detail | Navigate to `/instructors/:id`; public profile shows: name, bio, total courses, total students, average rating | ⬜ |
| FL02-TC15 | `NEG` | On `/courses` search box → type a keyword with no matching courses → press Enter | "No courses found" empty state message displayed; page does not crash | ⬜ |
| FL02-TC16 | `NEG` | Navigate to URL of a non-existent course (e.g. `/courses/000000000000000000000000`) | 404 page or "Course not found" error state shown; no crash | ⬜ |
| FL02-TC17 | `NEG` | Search for the exact title of Course Draft | Course Draft does NOT appear in search results or course listing | ⬜ |
| FL02-TC18 | `ALT` | Login as Student A (already enrolled in Course A) → navigate to Course A detail | "Go to Course" button shown instead of "Add to Cart" / "Buy Now" | ⬜ |
| FL02-TC19 | `ALT` | On `/courses` → set Sort = "Price: Low to High" | Cheapest courses appear first in the list | ⬜ |
| FL02-TC20 | `ALT` | On `/courses` → set Rating filter = 4 stars and above | Only courses with visible average rating ≥ 4 stars shown | ⬜ |
| FL02-TC21 | `ALT` | On `/courses` → click page 2 of pagination | Second page loads with a different set of course cards | ⬜ |

**FL-02 MAIN: 14 · ALT: 4 · NEG: 3 · Total: 21**

---

### FL-03 · Purchase Flow

**Mục tiêu:** Student thêm cart → apply coupon → checkout → payment → enrolled

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FL03-TC01 | `MAIN` | Login as Student A → Navigate to Course A detail → Click "Add to Cart" | Cart icon count in navbar increases by 1; toast "Added to cart" shown | ⬜ |
| FL03-TC02 | `MAIN` | Navigate to `/student/cart` | Course A shown in cart list with correct title and price | ⬜ |
| FL03-TC03 | `MAIN` | On Course A detail → click "Add to Wishlist" → Navigate to `/student/wishlist` | Course A appears in the wishlist page | ⬜ |
| FL03-TC04 | `MAIN` | On `/student/cart` → enter valid coupon code → click "Apply" | Discount amount shown; total price decreases; "Coupon applied" label displayed | ⬜ |
| FL03-TC05 | `MAIN` | Click "Checkout" button on cart page | Order created; redirect to payment method selection page | ⬜ |
| FL03-TC06 | `MAIN` | On payment page → select MoMo → click "Pay" | Browser redirects to MoMo sandbox payment page | ⬜ |
| FL03-TC07 | `MAIN` | On MoMo sandbox → confirm and complete the payment | Browser redirects back to `/student/payment-success`; success confirmation page displayed | ⬜ |
| FL03-TC08 | `MAIN` | Navigate to `/student/courses` | Course A now listed among enrolled courses | ⬜ |
| FL03-TC09 | `MAIN` | Navigate to `/student/cart` | Cart is empty — Course A no longer listed | ⬜ |
| FL03-TC10 | `MAIN` | Navigate to `/student/orders` → click on the order just completed | Order detail shows: Course A name, MoMo payment method, correct total, status "Completed" | ⬜ |
| FL03-TC11 | `ALT` | On payment page → select VNPay instead of MoMo → click "Pay" | Browser redirects to VNPay sandbox payment page | ⬜ |
| FL03-TC12 | `ALT` | Proceed through checkout without entering any coupon code | Checkout completes with full price; no discount shown | ⬜ |
| FL03-TC13 | `ALT` | On MoMo sandbox → click "Cancel" to abort payment → return to site | Browser redirects to `/student/payment-failed`; failure page shown; Course A NOT in enrolled courses | ⬜ |
| FL03-TC14 | `NEG` | Course A already in cart → click "Add to Cart" on Course A again | Toast/inline error "Course already in cart"; cart count unchanged | ⬜ |
| FL03-TC15 | `NEG` | Already enrolled in Course A → try to click "Add to Cart" on Course A detail | Button absent/disabled or toast "You already own this course" | ⬜ |
| FL03-TC16 | `NEG` | On `/student/cart` coupon field → enter a non-existent coupon code → click "Apply" | Error message "Coupon not found" or "Invalid coupon code" shown | ⬜ |
| FL03-TC17 | `NEG` | Enter an expired coupon code → click "Apply" | Error message "Coupon has expired" or "Coupon is no longer valid" shown | ⬜ |
| FL03-TC18 | `NEG` | Remove all courses from cart → observe Checkout button | "Checkout" button disabled or hidden; error "Your cart is empty" if clicked | ⬜ |
| FL03-TC19 | `NEG` | After successful payment → press browser Back to revisit the payment confirmation step | Course A enrollment does NOT duplicate; cart remains empty; user stays on success/redirect page | ⬜ |
| FL03-TC20 | `NEG` | Try to resume payment for an already-cancelled order | UI shows "Order expired" or "Cannot pay for this order" — payment option unavailable | ⬜ |

**FL-03 MAIN: 10 · ALT: 3 · NEG: 7 · Total: 20**

---

### FL-04 · Learning Flow

**Mục tiêu:** Student enrolled → xem lecture → track progress → course completed

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FL04-TC01 | `MAIN` | Login as Student A (enrolled in Course A) → Navigate to `/student/courses` | Course A card visible with a progress percentage (e.g. "0% complete") | ⬜ |
| FL04-TC02 | `MAIN` | Click on Course A → open learning page | Curriculum sidebar shows list of lectures; first lecture accessible | ⬜ |
| FL04-TC03 | `MAIN` | Click on Lecture 1 title in sidebar | Video player loads and starts playing; lecture title shown in header; no error | ⬜ |
| FL04-TC04 | `MAIN` | Click "Mark as Complete" (or watch video to end) for Lecture 1 | Lecture 1 shows a completion checkmark (✓) in sidebar; progress bar increments | ⬜ |
| FL04-TC05 | `MAIN` | Complete Lecture 2 the same way | Progress bar updates to reflect 2 out of N lectures complete | ⬜ |
| FL04-TC06 | `MAIN` | Complete all remaining lectures one by one | Progress bar reaches 100%; "Course Completed" badge or congratulations banner displayed | ⬜ |
| FL04-TC07 | `MAIN` | Navigate back to `/student/courses` | Course A card now shows 100% progress | ⬜ |
| FL04-TC08 | `ALT` | Click "Mark as Complete" again on a lecture already completed | No change to progress; no error toast; lecture stays marked | ⬜ |
| FL04-TC09 | `ALT` | Login as Student B → copy Course A's learning URL → paste in address bar (Student B not enrolled) | Access denied page or redirect to `/student/courses`; course content NOT visible | ⬜ |
| FL04-TC10 | `NEG` | While logged out → navigate directly to a learning URL (e.g. `/student/courses/:id`) | Redirect to `/auth/sign-in` | ⬜ |
| FL04-TC11 | `NEG` | Login as Student B → navigate to a course learning page for a course Student B is NOT enrolled in | "You are not enrolled in this course" message or redirect; video/content NOT accessible | ⬜ |

**FL-04 MAIN: 7 · ALT: 2 · NEG: 2 · Total: 11**

---

### FL-05 · Review Flow

**Mục tiêu:** Enrolled student writes, edits, deletes a review; course average rating visibly updates

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FL05-TC01 | `MAIN` | Login as Student A (enrolled in Course A) → Navigate to Course A detail → scroll to Reviews → click "Write a Review" → select 4 stars → type a comment → Submit | Toast "Review submitted"; review appears in reviews list with 4-star rating and comment text | ⬜ |
| FL05-TC02 | `MAIN` | Observe the average rating displayed in Course A's detail header/hero area | Average rating number and star display updated to include Student A's new review | ⬜ |
| FL05-TC03 | `MAIN` | Find Student A's review → click "Edit" → change rating to 5 stars, update comment → Save | Review shows updated 5-star rating and new comment; toast "Review updated" | ⬜ |
| FL05-TC04 | `MAIN` | Observe the average rating on Course A detail after edit | Average rating recalculated and displayed correctly on page | ⬜ |
| FL05-TC05 | `MAIN` | Find Student A's review → click "Delete" → confirm deletion | Toast "Review deleted"; Student A's review no longer visible in reviews list | ⬜ |
| FL05-TC06 | `MAIN` | Observe average rating on Course A detail after delete | Average rating updates (recalculates without deleted review; shows "No ratings yet" if it was the only one) | ⬜ |
| FL05-TC07 | `NEG` | Login as Student B (NOT enrolled in Course A) → navigate to Course A detail → try to write a review | "Write a Review" button absent or disabled; error "You must own this course to leave a review" shown | ⬜ |
| FL05-TC08 | `NEG` | Login as Student A (who already reviewed Course A) → try to submit a second review | Review form hidden or "You have already reviewed this course" message shown | ⬜ |
| FL05-TC09 | `NEG` | Login as Student B → attempt to click Edit on Student A's review | Edit button not visible or accessible for other users' reviews; modification blocked | ⬜ |
| FL05-TC10 | `NEG` | Login as Student B → attempt to click Delete on Student A's review | Delete button not visible or accessible; review remains intact | ⬜ |
| FL05-TC11 | `NEG` | On review form → try to submit with no star rating selected | Validation error "Please select a rating"; form does not submit | ⬜ |
| FL05-TC12 | `NEG` | On review form → try to submit with empty comment (if required) | Validation error on comment field; form does not submit | ⬜ |

**FL-05 MAIN: 6 · ALT: 0 · NEG: 6 · Total: 12**

---

### FL-06 · Order Management

**Mục tiêu:** Student views order history, filters by status, views order detail, cancels a pending order

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FL06-TC01 | `MAIN` | Navigate to `/student/orders` | Orders list shown with status badge (Completed / Pending / Cancelled), total amount, and creation date for each order | ⬜ |
| FL06-TC02 | `MAIN` | Observe the summary stats section at the top of `/student/orders` | Stats cards display: Total Orders, Completed, Pending, Cancelled — each with a count | ⬜ |
| FL06-TC03 | `MAIN` | On `/student/orders` → click filter "Completed" | Only completed orders shown; pending and cancelled orders hidden | ⬜ |
| FL06-TC04 | `MAIN` | Click on a completed order | Navigate to `/student/orders/:id`; detail shows: course list, payment method, total amount, status "Completed", creation date | ⬜ |
| FL06-TC05 | `MAIN` | Find a pending order in the list → click "Cancel" → confirm in dialog | Toast "Order cancelled"; order status badge changes to "Cancelled" in the list | ⬜ |
| FL06-TC06 | `NEG` | Open a completed order detail → look for Cancel option | "Cancel" button absent or disabled; no cancellation option available for completed orders | ⬜ |
| FL06-TC07 | `NEG` | Login as Student B → copy an order URL belonging to Student A → paste in address bar | "Order not found" error page or redirect to Student B's orders; Student A's order data not visible | ⬜ |
| FL06-TC08 | `NEG` | Navigate to `/student/orders/invalidOrderId` | 404 page or "Order not found" error message displayed | ⬜ |
| FL06-TC09 | `ALT` | On `/student/orders` → change sort to "Oldest first" | Oldest orders appear at the top of the list | ⬜ |
| FL06-TC10 | `ALT` | On `/student/orders` → type a course name in search/filter input | Only orders containing that course name are shown in the list | ⬜ |

**FL-06 MAIN: 5 · ALT: 2 · NEG: 3 · Total: 10**

---

### FL-07 · Account Settings

**Mục tiêu:** User đổi password → logout → login với password mới; deactivate và reactivate

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FL07-TC01 | `MAIN` | Navigate to `/student/settings` → click "Change Password" | "Change Password" form or modal opens | ⬜ |
| FL07-TC02 | `MAIN` | Fill Current Password (correct value), New Password "New@5678", Confirm Password "New@5678" → click "Save" | Toast "Password changed successfully"; modal or form closes | ⬜ |
| FL07-TC03 | `MAIN` | Click "Logout" → navigate to `/auth/sign-in` → log in with NEW password "New@5678" | Login succeeds; redirect to `/student/dashboard` | ⬜ |
| FL07-TC04 | `MAIN` | On `/student/settings` or profile page → click "Change Avatar" → select an image file → Upload | New avatar image displays in navbar/header immediately; upload spinner/progress shown then complete | ⬜ |
| FL07-TC05 | `MAIN` | On `/student/settings` → click "Deactivate Account" → confirm in the dialog | Toast "Account deactivated"; session ends; redirect to `/auth/sign-in`; logging in again shows reactivation prompt | ⬜ |
| FL07-TC06 | `MAIN` | On sign-in page (after deactivation prompt) → click "Reactivate" → complete OTP email flow | Account reactivated; login succeeds and redirects to dashboard | ⬜ |
| FL07-TC07 | `NEG` | On Change Password form → enter WRONG Current Password → click "Save" | Error "Current password is incorrect" shown; password NOT changed | ⬜ |
| FL07-TC08 | `NEG` | On Change Password form → enter New Password shorter than 8 characters | UI validation error "Password must be at least 8 characters" shown before or on submit | ⬜ |
| FL07-TC09 | `NEG` | On Change Password form → New Password and Confirm Password contain different values → click "Save" | Error "Passwords do not match"; form not submitted | ⬜ |
| FL07-TC10 | `ALT` | Login as Instructor → Navigate to `/instructor/settings` → change password with correct values | Same result as FL07-TC02/TC03; toast success; new password works on re-login | ⬜ |

**FL-07 MAIN: 6 · ALT: 1 · NEG: 3 · Total: 10**

---

### FL-08 · Notification

**Mục tiêu:** Notifications trigger after events; user reads individually and in bulk; deletes all

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FL08-TC01 | `MAIN` | After completing a purchase (FL-03) → click the notification bell icon in the navbar | Notification dropdown opens; a new enrollment-related notification is visible in the list | ⬜ |
| FL08-TC02 | `MAIN` | Observe the notification bell icon after receiving an unread notification | Numeric unread count badge visible on the bell icon | ⬜ |
| FL08-TC03 | `MAIN` | In the notification dropdown → click on a single unread notification | Clicked notification changes to read state (e.g. lighter background, no bold text); badge count decreases by 1 | ⬜ |
| FL08-TC04 | `MAIN` | In the notification dropdown → click "Mark all as read" | All notifications display as read; unread badge count shows 0 or disappears | ⬜ |
| FL08-TC05 | `MAIN` | In the notification dropdown → click "Delete all" or "Clear all" → confirm | Notification list shows empty state "No notifications"; bell badge gone | ⬜ |
| FL08-TC06 | `NEG` | Login as Student B → open notification panel | Only Student B's own notifications shown; Student A's notifications NOT visible | ⬜ |
| FL08-TC07 | `ALT` | Login as user with zero notifications → click the notification bell | Dropdown shows empty state message "No notifications" — no crash | ⬜ |

**FL-08 MAIN: 5 · ALT: 1 · NEG: 1 · Total: 7**

---

### FL-09 · Instructor — Course Lifecycle

**Mục tiêu:** Instructor tạo course → edit → upload thumbnail → submit for review

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FL09-TC01 | `MAIN` | Login as Instructor → Navigate to `/instructor/courses` | Only Instructor's own courses listed; correct titles and status badges (Draft / Live / Pending Review) visible | ⬜ |
| FL09-TC02 | `MAIN` | Click "Create Course" → fill title, category, price, description → Click "Create" / "Save" | Redirect to course edit page; new course appears in list with "Draft" status badge | ⬜ |
| FL09-TC03 | `MAIN` | On course edit page → click thumbnail upload area → select an image file → confirm | Thumbnail preview updates immediately on the edit page | ⬜ |
| FL09-TC04 | `MAIN` | On course edit page → update title, description, price → Click "Save" | Toast "Course updated"; updated values visible on the page | ⬜ |
| FL09-TC05 | `MAIN` | On course edit page → click "Submit for Review" → confirm | Status badge changes to "Pending Review" or "Under Review"; submit button disabled/hidden after submission | ⬜ |
| FL09-TC06 | `MAIN` | Click on the course in the instructor course list → view course detail | All fields shown correctly; "Edit" button visible and accessible | ⬜ |
| FL09-TC07 | `MAIN` | Navigate to `/instructor/dashboard` → observe the stats cards | Stats cards display: Total Courses, Total Students, Total Revenue with numeric values (not blank/null) | ⬜ |
| FL09-TC08 | `NEG` | Login as Instructor A → manually navigate to `/instructor/courses/:courseId/edit` using Instructor B's course ID | Access denied page or redirect to Instructor A's courses; Instructor B's course content NOT shown | ⬜ |
| FL09-TC09 | `NEG` | Login as Student → manually type `/instructor/courses/create` in address bar | Redirect to student area or "Access Denied" page; course creation form NOT shown | ⬜ |
| FL09-TC10 | `ALT` | On course edit page → click "Toggle Privacy" (Public ↔ Private) | Course visibility badge updates (Public / Private) on the edit page and course list | ⬜ |
| FL09-TC11 | `ALT` | On course edit page with unsaved pending changes → click "Discard Changes" or "Clear Draft" | Draft changes removed; course reverts to last published/saved state; confirmation toast shown | ⬜ |

**FL-09 MAIN: 7 · ALT: 2 · NEG: 2 · Total: 11**

---

### FL-10 · Instructor — Dashboard & Earnings

**Mục tiêu:** Instructor xem earnings chart, per-course revenue, students list — data đầy đủ, không crash khi empty

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FL10-TC01 | `MAIN` | Login as Instructor → Navigate to `/instructor/earnings` | Revenue chart with monthly breakdown visible; total earnings figure displayed | ⬜ |
| FL10-TC02 | `MAIN` | On earnings page → scroll to per-course revenue section | Table or chart showing each course's name with its revenue amount | ⬜ |
| FL10-TC03 | `MAIN` | On earnings page or dashboard → scroll to top courses section | Ranked list of courses by revenue or enrollment shown with course names and figures | ⬜ |
| FL10-TC04 | `MAIN` | Navigate to `/instructor/students` | Paginated list of students showing name, enrolled course, enrollment date | ⬜ |
| FL10-TC05 | `MAIN` | On `/instructor/students` → observe stats at top | Total students count and active student count displayed | ⬜ |
| FL10-TC06 | `MAIN` | On `/instructor/courses` → click on a course → view Enrollments/Analytics tab | Monthly enrollment trend chart shown with data points | ⬜ |
| FL10-TC07 | `NEG` | Login as Student → type `/instructor/earnings` in address bar → press Enter | Redirect to student area or "Access Denied" page; earnings data NOT visible | ⬜ |
| FL10-TC08 | `ALT` | Login as a brand-new Instructor with NO courses yet → navigate to `/instructor/earnings` | Page loads without crash; all stats show "0" or "—"; charts show empty state gracefully | ⬜ |

**FL-10 MAIN: 6 · ALT: 1 · NEG: 1 · Total: 8**

---

### FL-11 · Become Instructor

**Mục tiêu:** Student submits instructor application via UI

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FL11-TC01 | `MAIN` | Login as Student A → Navigate to `/student/become-instructor` | Application page loads with the instructor application form | ⬜ |
| FL11-TC02 | `MAIN` | Fill all required fields in the application form → click "Submit Application" | Success confirmation message or toast shown; form clears or redirects to confirmation page | ⬜ |
| FL11-TC03 | `NEG` | Navigate back to `/student/become-instructor` and try submitting the application a second time | Error "Application already submitted" shown or form/button disabled | ⬜ |
| FL11-TC04 | `NEG` | While logged out → navigate to `/student/become-instructor` | Redirect to `/auth/sign-in` | ⬜ |

**FL-11 MAIN: 2 · ALT: 0 · NEG: 2 · Total: 4**

---

### FL-SEC · Security & Authorization

**Mục tiêu:** Role isolation, protected routes, data isolation — verified via visible browser behavior

| TC ID | Type | Steps (UI Actions) | Expected Result (Visible on Screen) | Status |
|---|---|---|---|---|
| FSEC-TC01 | `MAIN` | While logged out → type `/student/profile` in address bar → press Enter | Redirect to `/auth/sign-in` (URL may include `?redirectTo=...` query param) | ⬜ |
| FSEC-TC02 | `MAIN` | Login as Student → type `/instructor/dashboard` in address bar → press Enter | Redirect to student area or "Access Denied" page; instructor dashboard content NOT rendered | ⬜ |
| FSEC-TC03 | `MAIN` | Login as Instructor → type `/student/courses` in address bar → press Enter | Redirect to instructor area or "Access Denied" page | ⬜ |
| FSEC-TC04 | `MAIN` | Login as Student B → Navigate to `/student/orders` | Only Student B's orders shown; no data from Student A visible | ⬜ |
| FSEC-TC05 | `MAIN` | Login as Student B → Navigate to `/student/cart` | Only Student B's cart items shown; Student A's cart items not visible | ⬜ |
| FSEC-TC06 | `MAIN` | Log out completely → type `/student/dashboard` in address bar → press Enter | Redirect to `/auth/sign-in`; dashboard content NOT shown | ⬜ |
| FSEC-TC07 | `MAIN` | Login as Student → observe the main navigation menu | Only student-role items visible (no instructor menu, no admin links) | ⬜ |
| FSEC-TC08 | `NEG` | On `/courses` search box → type `{"$gt":""}` as search term → press Enter | Page shows empty results or "No courses found" — does NOT crash or expose server error | ⬜ |
| FSEC-TC09 | `NEG` | On `/student/profile` → type `<script>alert(1)</script>` in the Name field → Save → reload page | Name field displays the text literally (e.g. `<script>alert(1)</script>`); no JavaScript alert popup executed | ⬜ |
| FSEC-TC10 | `NEG` | Login as Student → type `/auth/sign-in` in address bar → press Enter | Redirect to `/student/dashboard` (guestOnly route blocks logged-in users) | ⬜ |

**FL-SEC MAIN: 7 · ALT: 0 · NEG: 3 · Total: 10**

---

## 5. Coverage Summary & Tracking

### 5.1 TC Count per Flow

| Flow | MAIN | ALT | NEG | Total |
|---|---|---|---|---|
| FL-01 | 7 | 4 | 8 | 19 |
| FL-02 | 14 | 4 | 3 | 21 |
| FL-03 | 10 | 3 | 7 | 20 |
| FL-04 | 7 | 2 | 2 | 11 |
| FL-05 | 6 | 0 | 6 | 12 |
| FL-06 | 5 | 2 | 3 | 10 |
| FL-07 | 6 | 1 | 3 | 10 |
| FL-08 | 5 | 1 | 1 | 7 |
| FL-09 | 7 | 2 | 2 | 11 |
| FL-10 | 6 | 1 | 1 | 8 |
| FL-11 | 2 | 0 | 2 | 4 |
| FL-SEC | 7 | 0 | 3 | 10 |
| **TOTAL** | **82** | **20** | **41** | **143** |

### 5.2 Coverage Targets

```
Main Case Coverage   = (MAIN TCs pass) / 82  × 100%   →  Target: 100%  (82/82)
Flow Coverage        = (Flows all-MAIN pass) / 12      →  Target: ≥ 90% (≥ 11/12)
Negative Coverage    = (NEG TCs executed) / 41 × 100%  →  Target: ≥ 80% (≥ 33/41)
Alt Coverage         = (ALT TCs executed) / 20 × 100%  →  Target: ≥ 70% (≥ 14/20)
```

### 5.3 Minimum Execution Required

| Loại | Total | Minimum |
|---|---|---|
| `MAIN` | 82 | **82** (100%) |
| `NEG` | 41 | **33** (≥ 80%) |
| `ALT` | 20 | **14** (≥ 70%) |
| Flows passing all MAIN | 12 | **≥ 11** (90%) |

---

## 6. Execution Order (Sprint-based)

### Sprint 1 — Blocker (phải pass trước khi chạy tiếp)
```
FL-SEC  →  FL-01  →  FL-03
```
> Lý do: FL-SEC kiểm tra auth gates; FL-01 tạo account; FL-03 tạo enrollment cần cho FL-04, FL-05

### Sprint 2 — Core User Journey
```
FL-02  →  FL-04  →  FL-05  →  FL-06
```

### Sprint 3 — Supporting Features
```
FL-07  →  FL-08  →  FL-09  →  FL-10  →  FL-11
```

---

## 7. Entry & Exit Criteria

### Entry Criteria
- [ ] Env https://eduverse.io.vn accessible và stable
- [ ] Test accounts tạo xong (Student A/B, Instructor, Unverified, Deactivated)
- [ ] Course A (live, paid, ≥ 3 lectures), Course B (free), Course Draft tồn tại trong test DB
- [ ] MoMo + VNPay sandbox credentials configured và accessible
- [ ] Test email inbox accessible (nhận OTP và reset password emails)

### Exit Criteria
- [ ] **Main Case Coverage = 100%** (82/82 MAIN TCs pass)
- [ ] **Flow Coverage ≥ 90%** (≥ 11/12 flows all-MAIN pass)
- [ ] **Negative Coverage ≥ 80%** (≥ 33/41 NEG TCs executed)
- [ ] 0 open P1 (Critical) bugs
- [ ] Tất cả FL-SEC MAIN TCs pass

### Bug Severity

| Severity | Định nghĩa | Tác động đến Exit |
|---|---|---|
| P1 — Critical | MAIN TC fail; user không hoàn thành được flow | Block exit |
| P2 — High | ALT/NEG TC fail; feature degraded nhưng workaround có | Warn; fix trước go-live |
| P3 — Medium | UI/UX issue; wrong label; missing toast | Document; fix sau |
| P4 — Low | Cosmetic; typo | Backlog |

---

## 8. Defect Reporting

Mỗi bug phát hiện → tạo Jira ticket ngay (project: EDV, type: Bug):

```
Summary:  [Module] - [Sub-feature] - [Observed UI symptom] [when/after condition]

Description:
**Steps to Reproduce**
1. Navigate to [URL]
1. [UI action: click / fill field / observe]
1. Observe the UI response

**Expected Result**
* [What user should see: toast message / redirect / page content / UI state]

**Actual Result**
* [What user actually sees or does NOT see]
```

> Black-box rule: Steps và Expected/Actual chỉ mô tả những gì USER THẤY trên UI —
> không claim internal state ("session not created", "data not saved to DB").

---

## 9. Traceability Matrix — Flow × UI Pages × API Endpoints

> API Endpoints trong cột này chỉ dùng làm tham chiếu — KHÔNG xuất hiện trong test steps.

| Flow | UI Pages | API Endpoints (reference only) |
|---|---|---|
| FL-01 | `/auth/sign-up`, `/auth/verify-email`, `/auth/sign-in`, `/student/profile`, `/student/dashboard` | `POST /auth/register`, `POST /auth/verify-email`, `POST /auth/login`, `GET\|PATCH /student/profile`, `PUT /student/interests` |
| FL-02 | `/home`, `/courses`, `/courses/:id`, `/instructors/:id` | `GET /courses/home`, `GET /courses`, `GET /courses/:id`, `GET /courses/:id/curriculum`, `GET /courses/:id/reviews`, `GET /courses/:id/related` |
| FL-03 | `/student/cart`, `/student/checkout`, `/student/payment-success`, `/student/payment-failed`, `/student/orders` | `POST\|DELETE /cart/items`, `POST /coupons/apply`, `POST /orders`, `POST /payments`, `GET /payments/momo/return`, `GET /payments/vnpay/return` |
| FL-04 | `/student/courses`, `/student/courses/:id` | `GET /student/courses`, `GET /student/courses/:id/progress`, `POST /student/courses/:id/lectures/:lecId/progress` |
| FL-05 | `/courses/:id` (reviews section) | `POST /reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id` |
| FL-06 | `/student/orders`, `/student/orders/:id` | `GET /orders`, `GET /orders/stats`, `GET /orders/:id`, `PATCH /orders/:id/cancel` |
| FL-07 | `/student/settings`, `/instructor/settings` | `POST /user/change-password`, `POST /user/deactivate`, `POST /auth/reactivate`, `GET /user/avatar/upload` |
| FL-08 | Notification panel (navbar, all pages) | `GET /notifications`, `GET /notifications/unread/count`, `PUT /notifications/:id/read`, `PUT /notifications/read`, `DELETE /notifications` |
| FL-09 | `/instructor/courses`, `/instructor/courses/create`, `/instructor/courses/:id/edit`, `/instructor/dashboard` | `GET\|POST /instructor/courses`, `PATCH /instructor/courses/:id`, `POST /instructor/courses/:id/submit` |
| FL-10 | `/instructor/earnings`, `/instructor/students`, `/instructor/dashboard` | `GET /instructor/earnings`, `GET /instructor/courses/revenue`, `GET /instructor/courses/top-courses`, `GET /instructor/students` |
| FL-11 | `/student/become-instructor` | `POST /instructors` |
| FL-SEC | All protected pages | All protected endpoints |