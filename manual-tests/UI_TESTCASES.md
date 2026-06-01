# EduVerse – System Test Cases (Browser / UI)

> **Scope**: System-level testing of the EduVerse platform from the end-user's perspective.
> Each test case is a **complete user scenario** that exercises one business function across multiple components.
> Tests verify **system behavior** (data persisted, access granted/denied, state consistent across pages) — not individual UI elements.
> Base URL: `http://localhost:5173` (dev) or production deployment.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| **[P]** | Positive — happy path / requirements met |
| **[N]** | Negative — system handles invalid/incorrect input |
| **[E]** | Edge case — boundary, empty, or exceptional state |
| **[S]** | Security — access control, authorization, data isolation |
| **P1** | Critical — system unusable if fails |
| **P2** | High — major feature broken |
| **P3** | Medium — degraded but system usable |
| **P4** | Low — minor inconvenience |

**Test ID format**: `TC-SYS-[FEATURE]-[SEQ]`

---

## 1. User Registration & Email Verification

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-REG-001 | [P] | P1 | New user completes full registration and can sign in | Email not registered; SMTP working | 1. Navigate to `/auth/sign-up` 2. Enter full name, valid email, strong password, confirm password 3. Submit form 4. Enter OTP code received in email 5. Navigate to `/auth/sign-in` 6. Sign in with the registered credentials | OTP modal appears after sign-up submit; after correct OTP, sign-in succeeds; user lands on `/student/dashboard`; navbar shows logged-in state |
| TC-SYS-REG-002 | [N] | P1 | System rejects registration with already-used email | Email already registered | 1. Navigate to `/auth/sign-up` 2. Enter a previously registered email 3. Fill other valid fields 4. Submit | System shows error "Email already in use" (or equivalent); no new account created; user remains on sign-up page |
| TC-SYS-REG-003 | [N] | P2 | System rejects registration when passwords do not match | Sign-up page open | 1. Enter valid name and email 2. Enter "Password1!" in Password field 3. Enter "Different1!" in Confirm Password 4. Submit | System blocks submission and shows "Passwords do not match" message; account is NOT created |
| TC-SYS-REG-004 | [N] | P2 | System rejects registration with weak password | Sign-up page open | 1. Enter valid name and email 2. Enter "123" as password 3. Submit | System blocks submission with password-strength validation error; account is NOT created |
| TC-SYS-REG-005 | [N] | P1 | System rejects incorrect OTP and does not activate account | Sign-up submitted, OTP modal shown | 1. Enter wrong OTP code "000000" 2. Click Verify | Error "Invalid code" shown; account remains unverified; subsequent sign-in with these credentials fails (or shows unverified prompt) |
| TC-SYS-REG-006 | [P] | P2 | User can resend OTP and activate account with new code | OTP modal shown after sign-up | 1. Click "Resend Code" in OTP modal 2. Wait for new email 3. Enter new OTP code 4. Click Verify | New code accepted; account activated; user can proceed to sign-in |
| TC-SYS-REG-007 | [S] | P1 | Logged-in user is prevented from accessing registration page | Already logged in as student | 1. While logged in, navigate directly to `/auth/sign-up` | System redirects user to `/student/dashboard`; registration page is NOT shown |

---

## 2. User Authentication – Sign In & Sign Out

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-AUTH-001 | [P] | P1 | Verified student can sign in and reach student dashboard | Verified student account exists | 1. Navigate to `/auth/sign-in` 2. Enter student email and password 3. Click "Sign In" | System authenticates user; redirects to `/student/dashboard`; navbar shows student name/avatar; sidebar shows student menu |
| TC-SYS-AUTH-002 | [P] | P1 | Verified instructor can sign in and reach instructor dashboard | Verified instructor account exists | 1. Navigate to `/auth/sign-in` 2. Enter instructor email and password 3. Click "Sign In" | System redirects to `/instructor/dashboard`; sidebar shows instructor menu items |
| TC-SYS-AUTH-003 | [N] | P1 | System rejects sign-in with wrong password | Account exists | 1. Enter valid email + incorrect password 2. Click "Sign In" | Error message "Invalid email or password" shown; user stays on sign-in page; no session created |
| TC-SYS-AUTH-004 | [N] | P2 | System rejects sign-in for non-existent email | Sign-in page open | 1. Enter email that does not exist 2. Enter any password 3. Submit | Error message shown; user stays on sign-in page |
| TC-SYS-AUTH-005 | [P] | P1 | User can sign out and session is terminated | Logged in as student | 1. Click user avatar in navbar 2. Click "Logout" | User redirected to `/home` (or `/auth/sign-in`); navbar reverts to guest state; navigating to `/student/dashboard` redirects to sign-in page |
| TC-SYS-AUTH-006 | [S] | P1 | Unauthenticated user cannot access any protected page | Not logged in | 1. Directly navigate to `/student/dashboard` 2. Then try `/student/courses` 3. Then try `/instructor/dashboard` | All three attempts redirect to `/auth/sign-in`; no protected content shown |
| TC-SYS-AUTH-007 | [S] | P1 | Student role cannot access instructor pages | Logged in as student | 1. Navigate to `/instructor/dashboard` 2. Navigate to `/instructor/courses` | System denies access for both pages; either redirects to student dashboard or shows "Access denied" |
| TC-SYS-AUTH-008 | [S] | P1 | Instructor role cannot access student-only pages | Logged in as instructor | 1. Navigate to `/student/courses` 2. Navigate to `/student/cart` | System denies access or redirects; student-specific content not shown to instructor |
| TC-SYS-AUTH-009 | [P] | P2 | Google OAuth sign-in grants access | Google account linked to an EduVerse account | 1. On `/auth/sign-in`, click "Continue with Google" 2. Complete Google consent | User authenticated; redirected to appropriate dashboard based on role |

---

## 3. Password Reset

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-PWD-001 | [P] | P1 | User can reset password and sign in with new password | Registered account; email accessible | 1. Navigate to `/auth/forgot-password` 2. Enter registered email 3. Submit 4. Open reset link from email 5. Enter new strong password 6. Confirm password 7. Submit 8. Sign in with new password | Reset link delivered; new password accepted; sign-in with new password succeeds; sign-in with old password fails |
| TC-SYS-PWD-002 | [N] | P2 | Expired reset link cannot be used | Reset link older than expiry window | 1. Open an expired password reset link 2. Attempt to set new password | System shows error "Reset link expired or invalid"; password is NOT changed |
| TC-SYS-PWD-003 | [N] | P2 | Reset with mismatched passwords is blocked | Reset page open via valid link | 1. Enter new password "NewPass1!" 2. Enter confirm "DifferentPass!" 3. Submit | Validation error shown; password is NOT updated |

---

## 4. Course Discovery & Search

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-DISC-001 | [P] | P2 | Guest can browse all published courses without login | Not logged in; published courses exist | 1. Navigate to `/courses` | Course listing renders; all published course cards visible; no sign-in gate |
| TC-SYS-DISC-002 | [P] | P2 | Keyword search returns only matching courses | `/courses` page open; courses with "JavaScript" in title/description exist | 1. Type "JavaScript" in search box 2. Submit search | Only courses containing "JavaScript" shown; unrelated courses not listed; result count reflects actual matches |
| TC-SYS-DISC-003 | [P] | P2 | Combining category + level + price filters narrows results consistently | `/courses` page; courses in multiple categories exist | 1. Select category "Programming" 2. Select level "Beginner" 3. Select price "Free" 4. Observe results | Only free, beginner-level Programming courses shown; all three filters applied simultaneously; counts match |
| TC-SYS-DISC-004 | [N] | P2 | Search that matches no courses shows empty-state message | `/courses` page | 1. Enter "xyzabc999doesnotexist" in search 2. Submit | "No courses found" message (or equivalent empty state) shown; no course cards rendered |
| TC-SYS-DISC-005 | [P] | P2 | Sorting by price low-to-high orders results correctly | `/courses` page; courses with different prices exist | 1. Select sort "Price: Low to High" 2. Observe order of cards | Courses rendered in ascending price order; first card has lowest price; last card has highest |
| TC-SYS-DISC-006 | [P] | P3 | Guest can view full course detail page without login | Not logged in | 1. Click a course card from `/courses` | Course detail page opens at `/courses/:id`; title, description, curriculum, instructor, price all visible; no auth required to view |
| TC-SYS-DISC-007 | [P] | P3 | Navigating from home category section pre-filters course listing | `/home` page; categories visible | 1. Click a category tile on home page | Navigated to `/courses`; selected category filter is pre-applied; only courses in that category shown |
| TC-SYS-DISC-008 | [P] | P2 | Instructor public profile shows their courses | Navigate to `/instructors/:id` | 1. Click instructor name on a course detail page 2. View public instructor profile | Profile page shows instructor bio, rating, and list of their published courses |

---

## 5. Shopping Cart Management

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-CART-001 | [P] | P1 | Student can add multiple courses to cart and cart persists | Logged in as student; courses not already in cart or enrolled | 1. Browse `/courses` 2. Click "Add to Cart" on Course A 3. Navigate to another page 4. Click "Add to Cart" on Course B 5. Navigate to `/student/cart` | Cart page shows both Course A and Course B; cart badge in navbar shows count 2; total price = sum of both courses |
| TC-SYS-CART-002 | [P] | P2 | Removing a course from cart updates total correctly | Cart has 2+ items | 1. Navigate to `/student/cart` 2. Click "Remove" on one course 3. Observe cart | Removed course no longer in list; total price recalculates to reflect remaining items; navbar badge count decrements |
| TC-SYS-CART-003 | [P] | P2 | Valid coupon applies discount and updates order summary | Cart has items; valid coupon code exists | 1. Navigate to `/student/cart` 2. Enter valid coupon code 3. Click "Apply" 4. Observe summary | Discount line shown in summary; total price reduced by correct discount amount; coupon code displayed as applied tag |
| TC-SYS-CART-004 | [N] | P2 | Invalid coupon code does not change cart total | Cart has items | 1. Enter "FAKECODE123" as coupon 2. Click "Apply" | Error message "Invalid or expired coupon" shown; total price unchanged; no discount applied |
| TC-SYS-CART-005 | [N] | P2 | Expired coupon is rejected and total unchanged | Cart has items; expired coupon code known | 1. Enter expired coupon code 2. Click "Apply" | Error indicating coupon is expired; total unchanged |
| TC-SYS-CART-006 | [S] | P1 | Guest user is redirected to sign-in when attempting to view cart | Not logged in | 1. Navigate to `/student/cart` | System redirects to `/auth/sign-in`; cart contents not exposed |
| TC-SYS-CART-007 | [E] | P2 | Student cannot add already-enrolled course to cart | Logged in; already enrolled in Course A | 1. Navigate to Course A detail page 2. Observe the enroll/buy buttons | "Add to Cart" button absent or replaced with "Go to Course"; Course A cannot be added again |
| TC-SYS-CART-008 | [E] | P3 | Student cannot add the same course to cart twice | Logged in; Course A already in cart | 1. Navigate to Course A detail page 2. Attempt to click "Add to Cart" | Either button is disabled/replaced with "Go to Cart", or system prevents duplicate entry; cart still shows Course A once |

---

## 6. Wishlist Management

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-WISH-001 | [P] | P2 | Student can save a course to wishlist and view it later | Logged in as student | 1. Navigate to a course detail page 2. Click "Add to Wishlist" 3. Navigate to `/student/wishlist` | Wishlisted course appears on wishlist page with correct title, thumbnail, and price |
| TC-SYS-WISH-002 | [P] | P2 | Student can move a course from wishlist directly to cart | Course saved in wishlist; not in cart | 1. Navigate to `/student/wishlist` 2. Click "Add to Cart" on a course | Course added to cart (cart badge increments); course still visible in wishlist OR removed from wishlist (per design) |
| TC-SYS-WISH-003 | [P] | P2 | Removing a course from wishlist removes it permanently | Course in wishlist | 1. Navigate to `/student/wishlist` 2. Click remove/heart icon on a course 3. Navigate away and return to wishlist | Removed course no longer appears on wishlist page after page reload/revisit |
| TC-SYS-WISH-004 | [S] | P1 | Guest cannot access wishlist page | Not logged in | 1. Navigate to `/student/wishlist` | Redirected to `/auth/sign-in`; no wishlist content shown |

---

## 7. Course Enrollment (Purchase Flow)

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-ENR-001 | [P] | P1 | Student completes full purchase and gains access to course | Logged in as student; course in cart; valid payment gateway | 1. Navigate to `/student/cart` 2. Click "Proceed to Checkout" 3. Review order summary on `/student/checkout` 4. Select payment method 5. Click "Place Order" 6. Complete payment on gateway page 7. Redirected back to `/student/payment-success` | Payment success page shows order confirmation; course now appears in `/student/courses`; course detail shows "Continue Learning" instead of "Buy Now" |
| TC-SYS-ENR-002 | [P] | P2 | Coupon applied in cart is reflected in checkout total | Valid coupon applied in cart | 1. Apply valid coupon in cart 2. Proceed to checkout | Checkout page order summary shows same discounted total as cart; coupon label visible in summary |
| TC-SYS-ENR-003 | [P] | P2 | Cancelled payment sends student to payment-failed page | Payment initiated; cancel at gateway | 1. Place order and reach payment gateway 2. Click "Cancel" / close gateway 3. Return to EduVerse | System redirects to `/student/payment-failed`; order NOT completed; course NOT added to My Courses |
| TC-SYS-ENR-004 | [P] | P2 | Student with a pending order can resume payment and complete it | Student has a Pending order | 1. Navigate to `/student/orders` 2. Open pending order detail 3. Click "Resume Payment" 4. Complete payment on gateway | Payment completes; order status changes to Completed; course appears in `/student/courses` |
| TC-SYS-ENR-005 | [P] | P3 | Free course enrollment adds course immediately without payment | Free course exists; logged in as student | 1. Open free course detail page 2. Click "Enroll Free" or "Get Now" | Course added to `/student/courses` immediately; no payment gateway redirect; success confirmation shown |
| TC-SYS-ENR-006 | [N] | P2 | Student cannot checkout with empty cart | Logged in student; cart is empty | 1. Navigate directly to `/student/checkout` with empty cart | System redirects to cart page or shows "Cart is empty" message; checkout process does NOT proceed |
| TC-SYS-ENR-007 | [S] | P1 | Unauthenticated user redirected at checkout | Not logged in | 1. Navigate to `/student/checkout` | Redirected to `/auth/sign-in`; no order created |

---

## 8. Learning Experience (Video Player)

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-LRN-001 | [P] | P1 | Enrolled student can play a lecture and progress is tracked | Enrolled in course; at least one lecture exists | 1. Navigate to `/student/courses` 2. Click "Continue" on a course 3. Click a lecture in the curriculum panel 4. Watch video to completion | Video plays; when complete, lecture is marked as done (checkmark in sidebar); overall course progress percentage increases |
| TC-SYS-LRN-002 | [P] | P2 | Student can navigate between lectures sequentially | Learning page open; multi-lecture course | 1. Click "Next" to advance to next lecture 2. Click "Previous" to go back | System loads correct next/previous lecture video; curriculum sidebar highlights the active lecture accordingly |
| TC-SYS-LRN-003 | [P] | P2 | Student progress is preserved and resumes correctly across sessions | Student watched 3 of 10 lectures in a previous session | 1. Log out 2. Log back in 3. Navigate to `/student/courses` and open the course | Progress bar shows ~30% completion; previously watched lectures shown as completed; player opens at last unwatched lecture |
| TC-SYS-LRN-004 | [P] | P2 | Student can add notes for a specific lecture and notes persist | Learning page open | 1. Click "Notes" tab 2. Type a note for current lecture 3. Navigate to another lecture 4. Return to original lecture | Note saved under that lecture; note visible when returning to same lecture; not shown under other lectures |
| TC-SYS-LRN-005 | [P] | P3 | Completing all lectures unlocks course completion and certificate | Student watches all lectures | 1. Complete final lecture in course 2. Navigate to `/student/courses` | Course shows 100% progress and "Completed" badge; "View Certificate" button available; result page accessible |
| TC-SYS-LRN-006 | [S] | P1 | Unenrolled student cannot access learning page for a course | Logged in as student; NOT enrolled in target course | 1. Navigate to `/student/courses/:courseId` for unenrolled course | System denies access; user redirected to course detail page or shown "Purchase to access" prompt |
| TC-SYS-LRN-007 | [S] | P1 | Guest cannot access learning content | Not logged in | 1. Navigate to a learning page URL | Redirected to `/auth/sign-in` |
| TC-SYS-LRN-008 | [P] | P3 | Student can submit a question in Q&A and it appears in the thread | Learning page open; Q&A tab exists | 1. Click Q&A tab 2. Type a question 3. Submit | Question appears in the thread with student name and timestamp; visible on same and subsequent visits |

---

## 9. Orders & Payment History

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-ORD-001 | [P] | P2 | Completed orders are listed with correct status and detail | Student has completed at least one order | 1. Navigate to `/student/orders` 2. Click on a completed order | Orders list shows the order with "Completed" status; detail page shows correct course(s), amount, date, and payment method |
| TC-SYS-ORD-002 | [P] | P2 | Pending order shows correct status and resume option | Student has a pending (abandoned) order | 1. Navigate to `/student/orders` 2. Open pending order | Order shows "Pending" status; "Resume Payment" button available in detail view |
| TC-SYS-ORD-003 | [S] | P1 | Student cannot view another student's order | Two student accounts; Student A has orders | 1. Log in as Student B 2. Navigate to `/student/orders/:id` using Student A's order ID | System returns 404 or "Order not found"; Student A's order data NOT shown to Student B |

---

## 10. Student Profile & Account Management

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-SPROF-001 | [P] | P2 | Student can update profile info and changes persist after reload | Logged in as student | 1. Navigate to `/student/profile` 2. Change display name to "Test User Updated" 3. Click "Save" 4. Reload the page | Profile page reloads showing updated name "Test User Updated"; name also reflects in navbar avatar/greeting |
| TC-SYS-SPROF-002 | [P] | P2 | Student can upload a new avatar and it persists | Student profile page open | 1. Click avatar upload 2. Select a valid image file 3. Save changes 4. Reload page 5. Check navbar avatar | New avatar image shown on profile page AND in navbar after save; persists on reload |
| TC-SYS-SPROF-003 | [P] | P2 | Student can change password and old password no longer works | Logged in as student | 1. Navigate to `/student/settings` 2. Enter current password 3. Enter new password (and confirm) 4. Save 5. Log out 6. Try sign-in with old password 7. Try sign-in with new password | Old password sign-in fails; new password sign-in succeeds |
| TC-SYS-SPROF-004 | [N] | P2 | Student cannot change password with wrong current password | Settings page open | 1. Enter incorrect current password 2. Enter valid new password 3. Save | Error "Current password is incorrect"; password NOT changed; old password still works |

---

## 11. Instructor – Course Lifecycle Management

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-INS-001 | [P] | P1 | Instructor can create a new course draft with all basic fields | Logged in as instructor | 1. Navigate to `/instructor/courses/create` 2. Fill in title, description, category, level, price 3. Upload thumbnail 4. Save | Course created as Draft; appears in `/instructor/courses` list with "Draft" status; course is NOT visible in public `/courses` listing |
| TC-SYS-INS-002 | [P] | P1 | Instructor can add curriculum sections and lectures to a course | Draft course exists | 1. Open edit page for draft course 2. Add a section titled "Introduction" 3. Add a lecture under it with a video upload 4. Save changes | Section and lecture appear in curriculum; video upload completes successfully; curriculum visible on course edit page |
| TC-SYS-INS-003 | [P] | P1 | Instructor can submit course for review and status changes to Pending | Draft course with content exists | 1. Open edit page for draft course 2. Click "Submit for Review" 3. Confirm submission | Course status changes to "Pending Review" in `/instructor/courses`; "Edit" actions limited; course not yet publicly visible |
| TC-SYS-INS-004 | [P] | P2 | Instructor can update course info and changes reflect on public detail page | Published course exists | 1. Navigate to `/instructor/courses/:id/edit` 2. Update course description 3. Save 4. Open public course detail at `/courses/:id` | Public course detail page shows the updated description |
| TC-SYS-INS-005 | [P] | P2 | Instructor can delete a lecture and it no longer appears in curriculum | Course with multiple lectures | 1. Go to course edit page 2. Delete a specific lecture 3. Confirm deletion 4. Check curriculum | Deleted lecture absent from curriculum list; students accessing the course no longer see that lecture |
| TC-SYS-INS-006 | [P] | P3 | Instructor can reorder sections and new order is saved | Course with 2+ sections | 1. Go to course edit, curriculum tab 2. Drag Section B above Section A 3. Save 4. View course on public detail page | Sections displayed in new order on both instructor edit page and public course detail |
| TC-SYS-INS-007 | [N] | P2 | Course creation is blocked when required fields are empty | Create course form open | 1. Leave title empty 2. Click Save/Submit | System blocks submission; required-field error shown; no course record created |
| TC-SYS-INS-008 | [S] | P1 | Instructor cannot edit another instructor's course | Logged in as Instructor B; Instructor A's course exists | 1. Navigate to edit URL for Instructor A's course | System returns 403/404 or redirects; course data NOT editable by Instructor B |

---

## 12. Instructor – Students, Earnings & Profile

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-INS-STU-001 | [P] | P2 | Instructor sees all students enrolled in their courses | Instructor has at least one course with enrolled students | 1. Navigate to `/instructor/students` | Table lists all students enrolled in instructor's courses with name, course name, and enrollment date |
| TC-SYS-INS-STU-002 | [P] | P2 | Instructor can filter students by course | Multiple courses with students | 1. Navigate to `/instructor/students` 2. Filter by a specific course name | Only students enrolled in that specific course shown; students from other courses hidden |
| TC-SYS-INS-EARN-001 | [P] | P2 | Instructor earnings reflect revenue from completed orders | Instructor has completed course sales | 1. Navigate to `/instructor/earnings` | Total earnings figure matches sum of completed order revenues for instructor's courses; monthly chart shows data |
| TC-SYS-INS-PROF-001 | [P] | P2 | Instructor profile update is visible on their public page | Logged in as instructor | 1. Navigate to `/instructor/profile` 2. Update bio text and save 3. Open `/instructors/:id` (public page) | Updated bio visible on public instructor profile page |
| TC-SYS-INS-PROF-002 | [S] | P1 | Instructor earnings page inaccessible to students | Logged in as student | 1. Navigate to `/instructor/earnings` | System denies access; redirects or shows error; no earnings data shown |

---

## 13. Become Instructor Flow

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-BCI-001 | [P] | P2 | Student can submit a Become Instructor application | Logged in as student; not yet an instructor | 1. Navigate to `/student/become-instructor` 2. Fill in application form 3. Submit | Confirmation shown ("Application submitted" or similar); application status visible if page has status tracking |
| TC-SYS-BCI-002 | [S] | P1 | Unauthenticated user cannot access Become Instructor page | Not logged in | 1. Navigate to `/student/become-instructor` | Redirected to `/auth/sign-in` |

---

## 14. Chatbot / AI Recommendation

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-BOT-001 | [P] | P2 | Chatbot responds meaningfully to a course-related query | Logged in or guest; chatbot visible (not on `/`, `/auth/*`, `/404`) | 1. Click chatbot icon to open panel 2. Type "Recommend me a Python course" 3. Send | Bot responds with a relevant reply (course suggestion or guidance); response appears within a few seconds; no blank/error response |
| TC-SYS-BOT-002 | [P] | P3 | Chat conversation history persists within the same session | Chatbot used on one page | 1. Send 2 messages on `/home` 2. Navigate to `/courses` 3. Open chatbot again | Previous 2 messages and bot replies visible in chat panel; history not lost on navigation |
| TC-SYS-BOT-003 | [E] | P3 | Chatbot is hidden on excluded pages | Browser open | 1. Navigate to `/` 2. Navigate to `/auth/sign-in` 3. Navigate to `/404` | Chatbot icon NOT visible on all three excluded pages |
| TC-SYS-BOT-004 | [N] | P3 | Chatbot does not send an empty message | Chatbot open | 1. Click Send button without typing any text | No empty message bubble created; system ignores the action |

---

## 15. Notification System

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-NOTIF-001 | [P] | P2 | Student receives notification after successful course enrollment | Student just completed a purchase | 1. Complete a course purchase 2. Navigate to any page 3. Check notification bell icon | Bell shows a new unread badge; opening notification dropdown shows enrollment confirmation notification |
| TC-SYS-NOTIF-002 | [P] | P2 | Reading a notification marks it as read and decrements badge | Unread notification exists | 1. Click notification bell 2. Click on an unread notification | That notification is marked as read (style change); badge count decrements by 1 |
| TC-SYS-NOTIF-003 | [E] | P3 | Notification badge is hidden when all notifications are read | All notifications read | 1. Read all notifications 2. Close and reopen dropdown | Badge removed (or shows 0); no misleading unread count displayed |

---

## 16. Responsive Layout & Navigation

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-RES-001 | [P] | P2 | Student portal is fully navigable on mobile viewport | Logged in as student; browser resized to 375px width | 1. Open `/student/dashboard` at 375px 2. Click hamburger icon 3. Select "My Courses" from Offcanvas menu 4. Select "Cart" from menu | Offcanvas drawer opens and closes cleanly; navigation to each page works; content renders without horizontal scroll |
| TC-SYS-RES-002 | [P] | P2 | Instructor portal is fully navigable on mobile viewport | Logged in as instructor; browser at 375px | 1. Open `/instructor/dashboard` 2. Open Offcanvas 3. Navigate to "My Courses", "My Students", "Earnings" | All instructor pages accessible via Offcanvas; content readable without overflow |
| TC-SYS-RES-003 | [P] | P3 | Video player page hides the main sidebar layout | Logged in as enrolled student | 1. Navigate to a lecture in `/student/courses/:courseId` | Page layout fills screen; left navigation sidebar from StudentLayout NOT visible; only course curriculum panel + video player shown |
| TC-SYS-RES-004 | [P] | P3 | 404 page renders for any undefined route | Browser open | 1. Navigate to `/this-page-does-not-exist` | 404 page displayed with link back to home; chatbot NOT shown; no JS crash |

---

## 17. Cross-Cutting: Data Isolation & Security

| TC ID | Type | Priority | Objective | Preconditions | Steps | Expected System Behavior |
|-------|------|----------|-----------|---------------|-------|--------------------------|
| TC-SYS-SEC-001 | [S] | P1 | Student A cannot see Student B's cart contents | Two student accounts logged in different browsers | 1. Add course to Student A's cart 2. Log in as Student B in another browser 3. Navigate to `/student/cart` | Cart shows only Student B's items (empty); Student A's items NOT visible |
| TC-SYS-SEC-002 | [S] | P1 | Student A cannot see Student B's order history | Two students; Student A has orders | 1. Log in as Student B 2. Navigate to `/student/orders` | Only Student B's own orders listed; Student A's orders NOT shown |
| TC-SYS-SEC-003 | [S] | P1 | Instructor A cannot view Instructor B's earnings | Two instructor accounts | 1. Log in as Instructor B 2. Navigate to `/instructor/earnings` | Only Instructor B's earnings shown; Instructor A's revenue NOT visible |
| TC-SYS-SEC-004 | [S] | P2 | Session expires and user is redirected on next action | Valid session token has expired (simulated by clearing cookies) | 1. Clear authentication cookies/storage 2. Attempt to navigate to `/student/dashboard` | System detects expired/absent session; redirects to `/auth/sign-in`; no protected data served |

---

## Summary

| # | Feature Area | TC Count |
|---|-------------|----------|
| 1 | User Registration & Email Verification | 7 |
| 2 | User Authentication – Sign In & Sign Out | 9 |
| 3 | Password Reset | 3 |
| 4 | Course Discovery & Search | 8 |
| 5 | Shopping Cart Management | 8 |
| 6 | Wishlist Management | 4 |
| 7 | Course Enrollment (Purchase Flow) | 7 |
| 8 | Learning Experience (Video Player) | 8 |
| 9 | Orders & Payment History | 3 |
| 10 | Student Profile & Account Management | 4 |
| 11 | Instructor – Course Lifecycle Management | 8 |
| 12 | Instructor – Students, Earnings & Profile | 5 |
| 13 | Become Instructor Flow | 2 |
| 14 | Chatbot / AI Recommendation | 4 |
| 15 | Notification System | 3 |
| 16 | Responsive Layout & Navigation | 4 |
| 17 | Cross-Cutting: Data Isolation & Security | 4 |
| **Total** | | **93** |


---

## 1. Navigation Bar (NAV)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-NAV-001 | [P] | P1 | Guest navbar shows correct links | Browser opened, not logged in | 1. Open `/home` 2. Inspect top navigation bar | Logo, "Home", "Courses", "Sign In", "Sign Up" links visible; no user avatar/dropdown |
| TC-UI-NAV-002 | [P] | P1 | Student navbar shows user avatar and dropdown | Logged in as student | 1. Open `/home` 2. Click user avatar icon in top-right | Dropdown shows: "Profile", "My Courses", "Settings", "Logout" options |
| TC-UI-NAV-003 | [P] | P1 | Instructor navbar shows instructor indicator | Logged in as instructor | 1. Open `/instructor/dashboard` 2. Inspect top-right | User avatar/name visible; no "Sign In"/"Sign Up" buttons |
| TC-UI-NAV-004 | [P] | P2 | Logo click navigates to home | Any page | 1. Click site logo in navbar | Redirected to `/home`; home page content renders |
| TC-UI-NAV-005 | [P] | P2 | "Courses" link opens course listing | Guest, on `/home` | 1. Click "Courses" in navbar | URL changes to `/courses`; course grid/list is displayed |
| TC-UI-NAV-006 | [P] | P2 | Notification bell icon shows badge count | Logged in as student with unread notifications | 1. Inspect notification bell icon | Red badge with unread count is displayed on the bell icon |
| TC-UI-NAV-007 | [P] | P2 | Notification dropdown opens on click | Logged in as student | 1. Click notification bell icon | Dropdown/panel appears listing recent notifications |
| TC-UI-NAV-008 | [P] | P3 | Clicking a notification marks it as read | Logged in, unread notification exists | 1. Open notification dropdown 2. Click on one notification | Notification item is marked as read (styling change); badge count decrements |
| TC-UI-NAV-009 | [E] | P3 | Notification badge hides when count is 0 | Logged in, all notifications read | 1. Inspect notification bell icon | No badge or badge shows "0"; badge element hidden |
| TC-UI-NAV-010 | [P] | P2 | Cart icon shows item count for student | Logged in as student, item in cart | 1. Inspect cart icon in navbar | Badge with correct item count displayed on cart icon |
| TC-UI-NAV-011 | [P] | P1 | "Logout" in dropdown signs out user | Logged in as student | 1. Click user avatar 2. Click "Logout" | User redirected to `/home` or `/auth/sign-in`; navbar reverts to guest state |

---

## 2. Home Page (HOME)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-HOME-001 | [P] | P1 | Home page loads for guest | Browser opened, not logged in | 1. Navigate to `/home` | Hero section visible with headline text, CTA button(s); no login error |
| TC-UI-HOME-002 | [P] | P2 | Featured/popular courses section renders | `/home` loaded | 1. Scroll down to course section | Course cards displayed with thumbnail, title, instructor name, rating, price |
| TC-UI-HOME-003 | [P] | P2 | Course card click navigates to detail page | `/home` loaded, course cards visible | 1. Click on a course card | URL changes to `/courses/:id`; course detail page renders |
| TC-UI-HOME-004 | [P] | P2 | Category section renders | `/home` loaded | 1. Scroll to category section | Category tiles/chips visible (e.g., Programming, Design, Business) |
| TC-UI-HOME-005 | [P] | P3 | Category click filters course listing | `/home` loaded | 1. Click a category tile | Redirected to `/courses` with that category pre-filtered |
| TC-UI-HOME-006 | [P] | P2 | CTA button "Get Started" navigates to sign-up | Guest on `/home` | 1. Click hero CTA "Get Started" or "Join Now" button | Redirected to `/auth/sign-up` |
| TC-UI-HOME-007 | [P] | P2 | Instructor section shows instructor cards | `/home` loaded | 1. Scroll to instructor/teacher section | Instructor cards with avatar, name, rating displayed |
| TC-UI-HOME-008 | [P] | P3 | Instructor card click goes to public profile | `/home`, instructor cards visible | 1. Click an instructor card | Redirected to `/instructors/:id`; instructor profile page renders |
| TC-UI-HOME-009 | [E] | P3 | Page renders correctly on mobile viewport | `/home` in mobile browser (375px wide) | 1. Resize browser to 375px 2. Reload `/home` | Layout stacks vertically; no horizontal overflow; hamburger menu visible |
| TC-UI-HOME-010 | [P] | P4 | Footer displays required links | `/home` loaded | 1. Scroll to footer | Footer shows About, Contact, Terms, Privacy links and copyright text |

---

## 3. Courses Listing Page (COURSES)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-COURSES-001 | [P] | P1 | Course grid loads all published courses | Navigate to `/courses` | 1. Open `/courses` | Grid of course cards renders; each card has thumbnail, title, instructor, price |
| TC-UI-COURSES-002 | [P] | P2 | Search by keyword filters results | `/courses` loaded | 1. Type "JavaScript" in search box 2. Press Enter or click Search | Only courses matching "JavaScript" shown; result count updates |
| TC-UI-COURSES-003 | [N] | P2 | Search with no results shows empty state | `/courses` loaded | 1. Type "xyzabc999notexist" 2. Submit search | "No courses found" message or empty-state illustration displayed |
| TC-UI-COURSES-004 | [P] | P2 | Category filter narrows results | `/courses` loaded | 1. Select a category from filter panel 2. Observe results | Only courses in selected category appear; active filter highlighted |
| TC-UI-COURSES-005 | [P] | P2 | Price filter (free/paid) works | `/courses` loaded | 1. Select "Free" price filter | Only free courses shown; paid courses disappear from list |
| TC-UI-COURSES-006 | [P] | P2 | Level filter (Beginner/Intermediate/Advanced) works | `/courses` loaded | 1. Select "Beginner" level filter | Only beginner courses shown |
| TC-UI-COURSES-007 | [P] | P2 | Rating filter works | `/courses` loaded | 1. Select "4 stars and above" rating filter | Courses with rating < 4 disappear |
| TC-UI-COURSES-008 | [P] | P3 | Sort by "Newest" reorders list | `/courses` loaded | 1. Select "Newest" from sort dropdown | Courses reorder with most recently added first |
| TC-UI-COURSES-009 | [P] | P3 | Sort by "Price: Low to High" reorders | `/courses` loaded | 1. Select "Price: Low to High" from sort | Courses reorder ascending by price |
| TC-UI-COURSES-010 | [P] | P3 | Sort by "Rating" reorders | `/courses` loaded | 1. Select "Rating" from sort dropdown | Highest-rated courses appear first |
| TC-UI-COURSES-011 | [P] | P2 | Pagination or "Load More" works | `/courses` loaded, multiple pages exist | 1. Scroll to bottom 2. Click "Load More" or page 2 | Additional course cards appear / page 2 loads |
| TC-UI-COURSES-012 | [P] | P3 | "Add to Cart" on course card works (student) | Logged in as student, `/courses` | 1. Hover or click "Add to Cart" on a course card | Toast "Added to cart" appears; cart badge count increments |
| TC-UI-COURSES-013 | [P] | P3 | "Add to Wishlist" heart icon toggles | Logged in as student | 1. Click heart icon on a course card | Heart turns red/filled; toast confirmation shown |
| TC-UI-COURSES-014 | [S] | P2 | Guest clicking "Add to Cart" prompts login | Not logged in | 1. Click "Add to Cart" on course card | Redirected to `/auth/sign-in` or modal asking to sign in |
| TC-UI-COURSES-015 | [E] | P3 | Enrolled course shows "Go to Course" instead of cart button | Logged in as student, already enrolled | 1. Find enrolled course in listing | "Go to Course" or "Continue Learning" button shown instead of "Add to Cart" |
| TC-UI-COURSES-016 | [E] | P4 | Coupon/discount badge appears on discounted courses | Discounted course exists in listing | 1. View course listing | Course cards for discounted courses show strike-through original price and discounted price |

---

## 4. Course Detail Page (CDETAIL)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-CDETAIL-001 | [P] | P1 | Course detail page loads | Navigate to `/courses/:id` with valid ID | 1. Open `/courses/:id` | Course title, description, instructor name, thumbnail, price, rating all visible |
| TC-UI-CDETAIL-002 | [P] | P2 | Curriculum/section accordion expands | Course detail loaded | 1. Click a curriculum section header | Section expands showing list of lectures; click again collapses |
| TC-UI-CDETAIL-003 | [P] | P2 | "Add to Cart" button works | Not enrolled, logged in as student | 1. Click "Add to Cart" button | Toast "Added to cart" shown; button may change to "Go to Cart" |
| TC-UI-CDETAIL-004 | [P] | P2 | "Buy Now" button goes to checkout | Not enrolled, logged in as student | 1. Click "Buy Now" | Redirected to `/student/checkout` with this course pre-loaded |
| TC-UI-CDETAIL-005 | [P] | P2 | "Add to Wishlist" saves course | Logged in as student | 1. Click "Add to Wishlist" heart/button | Toast confirmation; button state changes to "Saved" or heart fills |
| TC-UI-CDETAIL-006 | [P] | P2 | Student reviews section displays ratings | Course detail loaded | 1. Scroll to reviews section | Star rating distribution chart visible; individual reviews with name, rating, text |
| TC-UI-CDETAIL-007 | [P] | P2 | Free preview lecture plays | Course detail loaded, free preview lecture exists | 1. Click "Preview" on a free lecture | Video player modal/section opens; video plays |
| TC-UI-CDETAIL-008 | [S] | P1 | Enrolled student sees "Go to Course" not "Add to Cart" | Logged in as enrolled student | 1. Open course detail | "Continue Learning" or "Go to Course" button shown; "Add to Cart" hidden |
| TC-UI-CDETAIL-009 | [S] | P1 | Guest sees "Sign In to Enroll" prompt | Not logged in | 1. Open course detail 2. Click "Enroll" or "Buy Now" | Redirected to `/auth/sign-in` or prompt to sign in |
| TC-UI-CDETAIL-010 | [P] | P3 | Instructor name links to instructor profile | Course detail loaded | 1. Click instructor name/avatar | Redirected to `/instructors/:instructorId` |
| TC-UI-CDETAIL-011 | [P] | P3 | Course requirements / what-you-learn sections visible | Course detail loaded | 1. Scroll past thumbnail section | "What you'll learn" and "Requirements" bullet lists visible |
| TC-UI-CDETAIL-012 | [N] | P2 | Invalid course ID shows 404 page | Browser open | 1. Navigate to `/courses/invalid-id-xyz` | 404 page or "Course not found" message displayed |
| TC-UI-CDETAIL-013 | [E] | P3 | Free course shows "Enroll Free" button | Free course exists | 1. Open free course detail 2. Click "Enroll Free" | Enrollment confirmed; button changes to "Go to Course" |
| TC-UI-CDETAIL-014 | [P] | P3 | Course total hours/lecture count visible | Course detail loaded | 1. Inspect curriculum summary | "X total hours", "Y lectures" stats displayed |

---

## 5. Instructor Public Profile Page (INS_PUB)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-INS-PUB-001 | [P] | P2 | Instructor profile page loads | Navigate to `/instructors/:id` | 1. Open `/instructors/:id` | Instructor avatar, name, bio, total students, rating displayed |
| TC-UI-INS-PUB-002 | [P] | P2 | Instructor's courses list shown | Instructor profile loaded | 1. Scroll to "Courses" section | Grid of instructor's published courses visible |
| TC-UI-INS-PUB-003 | [P] | P3 | Course card on profile links to course detail | Instructor profile loaded | 1. Click a course card | Redirected to `/courses/:courseId` |
| TC-UI-INS-PUB-004 | [N] | P2 | Invalid instructor ID shows 404 | Browser open | 1. Navigate to `/instructors/nonexistent-id` | 404 page or "Instructor not found" displayed |
| TC-UI-INS-PUB-005 | [P] | P3 | Social media links open correctly | Instructor has social links set | 1. Click LinkedIn/Twitter/website icon | Link opens in new tab |

---

## 6. Authentication – Sign In (AUTH-SI)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-AUTH-SI-001 | [P] | P1 | Sign-in page loads | Not logged in | 1. Navigate to `/auth/sign-in` | Form with Email, Password fields, "Sign In" button, Google OAuth button visible |
| TC-UI-AUTH-SI-002 | [P] | P1 | Successful sign-in redirects to dashboard | Valid credentials exist | 1. Enter valid email and password 2. Click "Sign In" | Loading indicator then redirect to `/student/dashboard` (student) or `/instructor/dashboard` (instructor); navbar updates to logged-in state |
| TC-UI-AUTH-SI-003 | [N] | P1 | Wrong password shows error message | Account exists | 1. Enter valid email + wrong password 2. Click "Sign In" | Inline error or toast "Invalid email or password" shown; user stays on sign-in page |
| TC-UI-AUTH-SI-004 | [N] | P1 | Empty fields show validation errors | Sign-in page open | 1. Leave Email empty 2. Leave Password empty 3. Click "Sign In" | Required-field validation messages appear under empty fields |
| TC-UI-AUTH-SI-005 | [N] | P2 | Invalid email format shows validation | Sign-in page open | 1. Enter "notanemail" in Email field 2. Click "Sign In" | Email format validation error shown |
| TC-UI-AUTH-SI-006 | [P] | P2 | Password visibility toggle works | Sign-in page open | 1. Enter password 2. Click eye icon | Password switches between hidden (••••) and visible text |
| TC-UI-AUTH-SI-007 | [P] | P2 | "Forgot password" link navigates correctly | Sign-in page open | 1. Click "Forgot password?" link | Redirected to `/auth/forgot-password` |
| TC-UI-AUTH-SI-008 | [P] | P2 | "Sign Up" link on sign-in navigates | Sign-in page open | 1. Click "Sign Up" or "Don't have an account?" link | Redirected to `/auth/sign-up` |
| TC-UI-AUTH-SI-009 | [P] | P2 | Google OAuth button is visible and clickable | Sign-in page open | 1. Click "Continue with Google" button | Browser opens Google OAuth consent screen (or popup) |
| TC-UI-AUTH-SI-010 | [S] | P1 | Already logged-in user is redirected away from sign-in | Logged in as student | 1. Navigate to `/auth/sign-in` | Automatically redirected to `/student/dashboard`; sign-in page not accessible |
| TC-UI-AUTH-SI-011 | [E] | P2 | Unverified email shows verification modal | Account not yet verified | 1. Enter credentials of unverified account 2. Click "Sign In" | Email Verify Modal appears prompting OTP entry |

---

## 7. Authentication – Sign Up (AUTH-SU)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-AUTH-SU-001 | [P] | P1 | Sign-up page loads | Not logged in | 1. Navigate to `/auth/sign-up` | Form with Full Name, Email, Password, Confirm Password fields and "Sign Up" button |
| TC-UI-AUTH-SU-002 | [P] | P1 | Successful sign-up triggers OTP modal | New unique email used | 1. Fill all fields with valid data 2. Click "Sign Up" | Success message or OTP/email-verify modal appears; user stays on auth page |
| TC-UI-AUTH-SU-003 | [N] | P1 | Duplicate email shows error | Email already registered | 1. Enter already-used email 2. Fill other fields 3. Click "Sign Up" | Toast or inline error "Email already in use" / "Account already exists" |
| TC-UI-AUTH-SU-004 | [N] | P1 | Password mismatch shows error | Sign-up page open | 1. Enter different Password and Confirm Password values 2. Click "Sign Up" | Validation error "Passwords do not match" shown |
| TC-UI-AUTH-SU-005 | [N] | P2 | Weak password shows validation error | Sign-up page open | 1. Enter password "123" 2. Click "Sign Up" | Error indicating password requirements (length, complexity) |
| TC-UI-AUTH-SU-006 | [N] | P1 | Empty fields show validation errors | Sign-up page open | 1. Click "Sign Up" without filling any field | Required-field errors appear for all empty fields |
| TC-UI-AUTH-SU-007 | [N] | P2 | Invalid email format blocked | Sign-up page open | 1. Enter "badformat" in email 2. Click "Sign Up" | Email format validation error shown |
| TC-UI-AUTH-SU-008 | [P] | P2 | Google sign-up button present | Sign-up page open | 1. View sign-up form | "Continue with Google" button visible |
| TC-UI-AUTH-SU-009 | [P] | P2 | "Sign In" link on sign-up navigates | Sign-up page open | 1. Click "Already have an account? Sign In" | Redirected to `/auth/sign-in` |
| TC-UI-AUTH-SU-010 | [S] | P1 | Logged-in user redirected away from sign-up | Logged in | 1. Navigate to `/auth/sign-up` | Redirected to dashboard; sign-up page not shown |

---

## 8. Authentication – Email OTP Verification (AUTH-OTP)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-AUTH-OTP-001 | [P] | P1 | OTP modal displays after sign-up | Just completed sign-up with new email | 1. Observe UI after sign-up submit | Modal with OTP/verification code input field and "Verify" button appears |
| TC-UI-AUTH-OTP-002 | [P] | P1 | Correct OTP verifies and proceeds | OTP modal open, correct code received | 1. Enter correct OTP code 2. Click "Verify" | Modal closes; user logged in or redirected to sign-in; success toast appears |
| TC-UI-AUTH-OTP-003 | [N] | P1 | Wrong OTP shows error | OTP modal open | 1. Enter incorrect OTP "000000" 2. Click "Verify" | Error message "Invalid code" shown; modal stays open |
| TC-UI-AUTH-OTP-004 | [P] | P2 | "Resend OTP" button available | OTP modal open | 1. Observe modal | "Resend Code" link/button visible |
| TC-UI-AUTH-OTP-005 | [P] | P2 | Resend OTP sends new code | OTP modal open | 1. Click "Resend Code" | Toast "Code sent to your email" appears; countdown timer resets |

---

## 9. Authentication – Forgot Password (AUTH-FP)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-AUTH-FP-001 | [P] | P1 | Forgot password page loads | Not logged in | 1. Navigate to `/auth/forgot-password` | Page with Email input and "Send Reset Link" button |
| TC-UI-AUTH-FP-002 | [P] | P1 | Valid email submission shows confirmation | Valid registered email | 1. Enter registered email 2. Click "Send Reset Link" | Success message "Check your email for reset link" or similar confirmation |
| TC-UI-AUTH-FP-003 | [N] | P2 | Unregistered email shows appropriate message | Forgot password page open | 1. Enter non-existent email 2. Submit | Error toast or message "Email not found" / generic "If this email exists..." |
| TC-UI-AUTH-FP-004 | [N] | P1 | Empty email shows validation | Forgot password page open | 1. Click Submit without email | Required-field validation error shown |
| TC-UI-AUTH-FP-005 | [P] | P2 | Back to sign-in link works | Forgot password page open | 1. Click "Back to Sign In" | Redirected to `/auth/sign-in` |

---

## 10. Authentication – Reset Password (AUTH-RP)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-AUTH-RP-001 | [P] | P1 | Reset password page loads with valid token | Valid reset link from email | 1. Open reset link URL | Form with New Password and Confirm Password fields displayed |
| TC-UI-AUTH-RP-002 | [P] | P1 | Successful password reset | Valid token, valid new password | 1. Enter matching new passwords 2. Click "Reset Password" | Success toast; redirected to `/auth/sign-in` |
| TC-UI-AUTH-RP-003 | [N] | P1 | Password mismatch shows error | Reset page open | 1. Enter different passwords 2. Submit | Validation error "Passwords do not match" |
| TC-UI-AUTH-RP-004 | [N] | P2 | Expired/invalid token shows error | Expired reset link | 1. Open expired reset link | Error message "Link expired" or "Invalid reset token"; link to request new one |
| TC-UI-AUTH-RP-005 | [N] | P2 | Weak password rejected | Reset page open | 1. Enter password "123" 2. Submit | Password validation error shown |

---

## 11. Student – Dashboard (STU-DASH)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-STU-DASH-001 | [P] | P1 | Dashboard loads for student | Logged in as student | 1. Navigate to `/student/dashboard` | Dashboard page renders with welcome message / summary stats |
| TC-UI-STU-DASH-002 | [P] | P2 | Recent courses / "Continue Learning" section visible | Enrolled courses exist | 1. View dashboard | "Continue Learning" section shows enrolled courses with progress bar |
| TC-UI-STU-DASH-003 | [P] | P2 | Course progress displayed | Student has watched some lectures | 1. Inspect course card on dashboard | Progress bar shows percentage; e.g., "45% complete" |
| TC-UI-STU-DASH-004 | [P] | P3 | Stats widgets show correct data | Enrolled in courses | 1. View dashboard stats | Widgets show total enrolled, completed, certificates, etc. |
| TC-UI-STU-DASH-005 | [P] | P2 | Clicking a course card goes to learning page | Dashboard, enrolled course card visible | 1. Click "Continue" on a course | Navigated to `/student/courses/:courseId` or video player |
| TC-UI-STU-DASH-006 | [S] | P1 | Unauthenticated access redirects to sign-in | Not logged in | 1. Navigate to `/student/dashboard` | Redirected to `/auth/sign-in` |
| TC-UI-STU-DASH-007 | [S] | P1 | Instructor role cannot access student dashboard | Logged in as instructor | 1. Navigate to `/student/dashboard` | Redirected to instructor dashboard or 403/unauthorized page |
| TC-UI-STU-DASH-008 | [P] | P2 | Left sidebar menu renders student navigation | Logged in as student | 1. View sidebar | Menu items: Dashboard, My Courses, Cart, Wishlist, Orders, Profile, Settings visible |
| TC-UI-STU-DASH-009 | [P] | P3 | Sidebar collapses to hamburger on mobile | Mobile viewport (< 1200px) | 1. Resize browser to 375px 2. View dashboard | Sidebar hidden; hamburger/menu icon appears; clicking opens Offcanvas drawer |

---

## 12. Student – My Courses (STU-MC)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-STU-MC-001 | [P] | P1 | My Courses page loads | Logged in as student | 1. Navigate to `/student/courses` | Page renders with enrolled course cards |
| TC-UI-STU-MC-002 | [P] | P2 | Course card shows progress percentage | Enrolled in at least one course | 1. View course cards | Each card shows progress bar and percentage |
| TC-UI-STU-MC-003 | [P] | P2 | Clicking "Continue" starts learning | My Courses page | 1. Click "Continue" or course card | Redirected to learning page `/student/courses/:courseId` |
| TC-UI-STU-MC-004 | [E] | P3 | Empty state when no enrolled courses | Student has 0 enrollments | 1. View My Courses page | "No courses yet" empty-state illustration and CTA "Browse Courses" shown |
| TC-UI-STU-MC-005 | [P] | P3 | Completed course shows completion badge | Completed a course | 1. View My Courses | Completed course card displays "Completed" badge or checkmark |
| TC-UI-STU-MC-006 | [P] | P3 | Search/filter courses in My Courses | Multiple enrolled courses | 1. Type in search field 2. Filter by status | List filters to matching courses |

---

## 13. Student – Learning Course (Video Player) (STU-LEARN)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-STU-LEARN-001 | [P] | P1 | Learning page loads with video player | Logged in as enrolled student | 1. Navigate to `/student/courses/:courseId` | Video player renders in full/main area; left panel shows curriculum |
| TC-UI-STU-LEARN-002 | [P] | P1 | Lecture list / sidebar shows all sections | Learning page loaded | 1. View left sidebar/panel | All course sections and lectures listed; current lecture highlighted |
| TC-UI-STU-LEARN-003 | [P] | P1 | Clicking a lecture loads its video | Learning page loaded | 1. Click on lecture item in sidebar | Video player loads new lecture video; title updates |
| TC-UI-STU-LEARN-004 | [P] | P2 | Video play/pause controls work | Learning page, video loaded | 1. Click play 2. Click pause | Video plays then pauses; control icon toggles correctly |
| TC-UI-STU-LEARN-005 | [P] | P2 | Video progress bar scrubbing works | Video playing | 1. Click at different position on progress bar | Video jumps to clicked position |
| TC-UI-STU-LEARN-006 | [P] | P2 | Fullscreen toggle works | Video player loaded | 1. Click fullscreen icon | Video expands to fullscreen; icon changes to exit-fullscreen |
| TC-UI-STU-LEARN-007 | [P] | P2 | Volume control works | Video player loaded | 1. Adjust volume slider 2. Click mute icon | Volume changes; mute icon toggles |
| TC-UI-STU-LEARN-008 | [P] | P2 | Playback speed selector works | Video playing | 1. Click speed control 2. Select 1.5x | Video plays at 1.5x speed; speed indicator updates |
| TC-UI-STU-LEARN-009 | [P] | P2 | Lecture completion marked when video ends | Video playing | 1. Let video play to end | Lecture marked as completed (checkmark in sidebar); progress bar advances |
| TC-UI-STU-LEARN-010 | [P] | P2 | Notes tab available | Learning page loaded | 1. Click "Notes" tab | Notes input area appears; can type notes |
| TC-UI-STU-LEARN-011 | [P] | P3 | Q&A / Discussion tab works | Learning page loaded | 1. Click "Q&A" or "Discussion" tab | Thread list renders; can type a question |
| TC-UI-STU-LEARN-012 | [P] | P2 | "Next Lecture" button advances to next | Learning page, not last lecture | 1. Click "Next" arrow or button | Next lecture video loads; URL updates |
| TC-UI-STU-LEARN-013 | [P] | P2 | "Previous Lecture" button goes back | Learning page, not first lecture | 1. Click "Previous" arrow | Previous lecture video loads |
| TC-UI-STU-LEARN-014 | [S] | P1 | Unenrolled student cannot access learning page | Logged in but not enrolled | 1. Navigate to `/student/courses/:courseId` for unenrolled course | Redirected to course detail page or "Purchase to access" message |
| TC-UI-STU-LEARN-015 | [S] | P1 | Unauthenticated user redirected | Not logged in | 1. Navigate to learning URL | Redirected to `/auth/sign-in` |
| TC-UI-STU-LEARN-016 | [P] | P3 | Certificate button appears after 100% completion | Course fully completed | 1. View completed course on learning page | "View Certificate" or "Download Certificate" button visible |
| TC-UI-STU-LEARN-017 | [P] | P3 | Layout is fullscreen / no sidebar navigation | Learning page loaded | 1. Observe page layout | Main sidebar layout hidden; video takes primary screen area; dark background |

---

## 14. Course Result Page (RESULT)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-RESULT-001 | [P] | P1 | Result page loads after completing course | Enrolled student navigates to `/course/:courseId/result` | 1. Open result page | Completion summary shown: score %, passed/failed status, confetti/celebration if passed |
| TC-UI-RESULT-002 | [P] | P2 | Certificate download button available | Course passed | 1. View result page | "Download Certificate" button visible and clickable |
| TC-UI-RESULT-003 | [P] | P2 | "Back to Dashboard" navigation works | Result page open | 1. Click "Back to Dashboard" | Redirected to `/student/dashboard` |
| TC-UI-RESULT-004 | [P] | P3 | Quiz scores shown per section | Course had quizzes | 1. View result page | Individual quiz scores listed per section/module |

---

## 15. Shopping Cart (CART)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-CART-001 | [P] | P1 | Cart page loads with items | Logged in as student, item in cart | 1. Navigate to `/student/cart` | Cart items listed with title, thumbnail, instructor, price |
| TC-UI-CART-002 | [P] | P1 | Remove item from cart works | Cart has items | 1. Click "Remove" icon/button on a course | Item removed from list; total price updates; toast confirmation |
| TC-UI-CART-003 | [P] | P2 | Cart total price updates after removal | Cart has multiple items | 1. Remove one item | Total recalculates correctly with remaining items |
| TC-UI-CART-004 | [E] | P2 | Empty cart shows empty state | All items removed | 1. Remove all items from cart | "Your cart is empty" illustration with "Browse Courses" link |
| TC-UI-CART-005 | [P] | P2 | Coupon code input field visible | Cart has items | 1. Scroll to coupon section | Input field and "Apply Coupon" button visible |
| TC-UI-CART-006 | [P] | P2 | Valid coupon applies discount | Valid coupon code exists | 1. Enter valid coupon code 2. Click "Apply" | Discount line appears in summary; total decreases; success toast |
| TC-UI-CART-007 | [N] | P2 | Invalid coupon shows error | Cart page, coupon section visible | 1. Enter "FAKECODE" 2. Click "Apply" | Error "Invalid or expired coupon" shown; total unchanged |
| TC-UI-CART-008 | [N] | P2 | Expired coupon shows error | Cart page | 1. Enter expired coupon code 2. Apply | Error "Coupon has expired" message shown |
| TC-UI-CART-009 | [P] | P2 | "Proceed to Checkout" navigates to checkout | Cart has items | 1. Click "Proceed to Checkout" button | Redirected to `/student/checkout` |
| TC-UI-CART-010 | [S] | P1 | Guest redirect to sign-in | Not logged in | 1. Navigate to `/student/cart` | Redirected to `/auth/sign-in` |
| TC-UI-CART-011 | [P] | P3 | Course title in cart links to detail page | Cart with items | 1. Click course title in cart | Redirected to `/courses/:id` |
| TC-UI-CART-012 | [E] | P3 | Applied coupon tag shows and can be removed | Valid coupon applied | 1. Observe coupon tag 2. Click remove/X on coupon tag | Coupon removed; discount disappears; original total restored |

---

## 16. Wishlist (WISH)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-WISH-001 | [P] | P1 | Wishlist page loads | Logged in as student, wishlist items exist | 1. Navigate to `/student/wishlist` | Wishlist course cards displayed with thumbnail, title, price |
| TC-UI-WISH-002 | [P] | P2 | Remove from wishlist works | Wishlist has items | 1. Click remove/heart icon on item | Item removed from list; toast confirmation shown |
| TC-UI-WISH-003 | [P] | P2 | "Add to Cart" from wishlist works | Wishlist item not in cart | 1. Click "Add to Cart" on wishlist item | Item moved/added to cart; toast confirmation; cart count increments |
| TC-UI-WISH-004 | [E] | P2 | Empty wishlist shows empty state | No items in wishlist | 1. View wishlist page | "Your wishlist is empty" message and "Explore Courses" CTA |
| TC-UI-WISH-005 | [S] | P1 | Guest redirect to sign-in | Not logged in | 1. Navigate to `/student/wishlist` | Redirected to `/auth/sign-in` |
| TC-UI-WISH-006 | [P] | P3 | Already-in-cart item shows different state | Item already in cart | 1. View wishlist | Item shows "Go to Cart" or different button state |

---

## 17. Checkout (CHKOUT)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-CHKOUT-001 | [P] | P1 | Checkout page loads with order summary | Logged in student, items in cart | 1. Navigate to `/student/checkout` | Order summary shows course list, subtotal, discount (if coupon), total |
| TC-UI-CHKOUT-002 | [P] | P1 | Payment method selection visible | Checkout page open | 1. View payment section | Payment options (MoMo, VNPay, or available gateways) shown with radio buttons |
| TC-UI-CHKOUT-003 | [P] | P1 | Confirming order redirects to payment gateway | Checkout page, payment selected | 1. Click "Place Order" or "Pay Now" | Browser redirects to payment gateway (MoMo/VNPay URL) or payment iframe loads |
| TC-UI-CHKOUT-004 | [P] | P2 | Coupon code can be applied on checkout | Checkout page | 1. Enter valid coupon in checkout coupon field 2. Apply | Discount applied; total updates |
| TC-UI-CHKOUT-005 | [P] | P2 | Order summary matches cart items | Came from cart | 1. Compare cart items with checkout summary | Same items, same prices listed |
| TC-UI-CHKOUT-006 | [S] | P1 | Unauthenticated user redirected | Not logged in | 1. Navigate to `/student/checkout` | Redirected to `/auth/sign-in` |
| TC-UI-CHKOUT-007 | [E] | P3 | Empty cart redirect from checkout | No items in cart | 1. Navigate to `/student/checkout` with empty cart | Redirected to cart or "Your cart is empty" message shown |

---

## 18. Payment Result Pages (PAY)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-PAY-001 | [P] | P1 | Payment Success page shows confirmation | After successful payment | 1. Complete payment at gateway 2. Redirected to `/student/payment-success` | Success illustration/checkmark, "Payment Successful" message, order ID, course access button |
| TC-UI-PAY-002 | [P] | P2 | "Go to My Courses" on success page | Payment success page | 1. Click "Go to My Courses" | Redirected to `/student/courses` |
| TC-UI-PAY-003 | [P] | P1 | Payment Failed page shows failure message | After failed payment | 1. Cancel/fail payment at gateway 2. Redirected to `/student/payment-failed` | Error illustration, "Payment Failed" message, "Try Again" button |
| TC-UI-PAY-004 | [P] | P2 | "Try Again" button on failed page | Payment failed page | 1. Click "Try Again" | Redirected to checkout or cart page |
| TC-UI-PAY-005 | [P] | P2 | "Contact Support" link on failed page | Payment failed page | 1. Observe page | Support link/button visible |

---

## 19. My Orders (ORDERS)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-ORDERS-001 | [P] | P1 | Orders list page loads | Logged in as student | 1. Navigate to `/student/orders` | Table/list of orders with order ID, date, total, status visible |
| TC-UI-ORDERS-002 | [P] | P2 | Order status labels correct | Orders with different statuses | 1. View orders list | Status badges (Pending, Completed, Failed) shown with appropriate colors |
| TC-UI-ORDERS-003 | [P] | P2 | Clicking order row goes to detail | Orders list | 1. Click on an order row or "View" button | Redirected to `/student/orders/:id` |
| TC-UI-ORDERS-004 | [P] | P2 | Order detail page shows full order info | Navigate to `/student/orders/:id` | 1. Open order detail | Order ID, date, payment method, items purchased, total price shown |
| TC-UI-ORDERS-005 | [P] | P2 | Pending order shows "Resume Payment" | Order with Pending status | 1. View order detail for pending order | "Resume Payment" or "Complete Payment" button visible |
| TC-UI-ORDERS-006 | [E] | P2 | Empty orders shows empty state | Student with no orders | 1. View `/student/orders` | "No orders yet" message; CTA to browse courses |
| TC-UI-ORDERS-007 | [S] | P1 | Guest redirect to sign-in | Not logged in | 1. Navigate to `/student/orders` | Redirected to `/auth/sign-in` |
| TC-UI-ORDERS-008 | [P] | P3 | Invoice / receipt download available | Completed order detail | 1. View completed order detail | "Download Invoice" or print option available |

---

## 20. Student Profile (STU-PROF)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-STU-PROF-001 | [P] | P1 | Profile page loads with current data | Logged in as student | 1. Navigate to `/student/profile` | Form pre-populated with name, email, bio, avatar, social links |
| TC-UI-STU-PROF-002 | [P] | P2 | Avatar upload works | Profile page open | 1. Click avatar upload button 2. Select image file | Avatar preview updates; save shows new image |
| TC-UI-STU-PROF-003 | [P] | P2 | Save profile changes | Profile page, modified name | 1. Edit display name 2. Click "Save" | Toast "Profile updated" shown; name reflects updated value |
| TC-UI-STU-PROF-004 | [N] | P2 | Invalid URL in social links shows error | Profile page | 1. Enter "notaurl" in website field 2. Save | Validation error "Invalid URL format" shown |
| TC-UI-STU-PROF-005 | [S] | P1 | Unauthenticated access redirected | Not logged in | 1. Navigate to `/student/profile` | Redirected to `/auth/sign-in` |

---

## 21. Account Settings (SETT)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-SETT-001 | [P] | P1 | Settings page loads | Logged in as student | 1. Navigate to `/student/settings` | Settings sections visible (Password change, Notifications, etc.) |
| TC-UI-SETT-002 | [P] | P2 | Change password with correct current password | Settings, password section | 1. Enter current password 2. Enter new password 3. Confirm 4. Save | Success toast "Password changed"; user remains logged in |
| TC-UI-SETT-003 | [N] | P2 | Wrong current password rejected | Settings, password section | 1. Enter wrong current password 2. Enter new password 3. Save | Error "Current password is incorrect" shown |
| TC-UI-SETT-004 | [N] | P2 | New password mismatch rejected | Settings | 1. Enter different values for new/confirm password | Validation error "Passwords do not match" |
| TC-UI-SETT-005 | [P] | P3 | Notification preference toggles save | Settings, notification preferences | 1. Toggle email notification switch 2. Click Save | Preference saved; toast confirmation; toggle reflects new state on reload |
| TC-UI-SETT-006 | [P] | P3 | Deactivate account section visible | Settings page | 1. Scroll to account danger zone | "Deactivate Account" button or section visible with warning text |
| TC-UI-SETT-007 | [S] | P1 | Unauthenticated access redirected | Not logged in | 1. Navigate to `/student/settings` | Redirected to `/auth/sign-in` |

---

## 22. Become Instructor (BECOME)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-BECOME-001 | [P] | P2 | Become Instructor page loads | Logged in as student | 1. Navigate to `/student/become-instructor` | Page with application form or information about becoming instructor |
| TC-UI-BECOME-002 | [P] | P2 | Submitting application shows confirmation | Form filled out | 1. Fill in required fields 2. Submit | Success message "Application submitted" or "We'll review your request" |
| TC-UI-BECOME-003 | [N] | P2 | Empty form submission rejected | Form page open | 1. Click Submit without filling | Required field validation errors shown |
| TC-UI-BECOME-004 | [S] | P1 | Unauthenticated access redirected | Not logged in | 1. Navigate to `/student/become-instructor` | Redirected to `/auth/sign-in` |

---

## 23. Instructor – Dashboard (INS-DASH)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-INS-DASH-001 | [P] | P1 | Instructor dashboard loads | Logged in as instructor | 1. Navigate to `/instructor/dashboard` | Dashboard renders with summary stats: total students, revenue, courses |
| TC-UI-INS-DASH-002 | [P] | P2 | Stat cards show correct data | Dashboard loaded | 1. View summary cards | Cards show: Total Courses, Total Students, Total Revenue, Ratings |
| TC-UI-INS-DASH-003 | [P] | P2 | Revenue chart renders | Dashboard loaded | 1. View revenue chart | Line/bar chart displays; axes labeled; data points visible |
| TC-UI-INS-DASH-004 | [P] | P2 | Recent students table loads | Dashboard | 1. Scroll to recent students section | Table with student name, enrolled course, enrollment date |
| TC-UI-INS-DASH-005 | [P] | P3 | "Create New Course" shortcut visible | Dashboard | 1. View dashboard | Quick-action button/link "Create New Course" visible |
| TC-UI-INS-DASH-006 | [S] | P1 | Student role blocked from instructor dashboard | Logged in as student | 1. Navigate to `/instructor/dashboard` | Redirected or "Access denied" shown |
| TC-UI-INS-DASH-007 | [S] | P1 | Unauthenticated user redirected | Not logged in | 1. Navigate to `/instructor/dashboard` | Redirected to `/auth/sign-in` |
| TC-UI-INS-DASH-008 | [P] | P2 | Instructor sidebar navigation renders | Logged in as instructor | 1. View sidebar | Items: Dashboard, My Courses, My Students, Earnings, Profile, Settings |

---

## 24. Instructor – My Courses (INS-MC)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-INS-MC-001 | [P] | P1 | My Courses page loads | Logged in as instructor | 1. Navigate to `/instructor/courses` | Table/list of courses with title, status, students, revenue |
| TC-UI-INS-MC-002 | [P] | P2 | Course status badges visible | Multiple courses with different statuses | 1. View courses list | Status badges: Draft, Pending, Published, Rejected shown |
| TC-UI-INS-MC-003 | [P] | P2 | "Create New Course" button works | My Courses page | 1. Click "Create New Course" button | Redirected to `/instructor/courses/create` |
| TC-UI-INS-MC-004 | [P] | P2 | Edit button navigates to edit page | My Courses list | 1. Click Edit (pencil icon) on a course | Redirected to `/instructor/courses/:id/edit` |
| TC-UI-INS-MC-005 | [P] | P2 | View/detail button works | My Courses list | 1. Click View (eye icon) on a course | Redirected to `/instructor/courses/:id` |
| TC-UI-INS-MC-006 | [E] | P2 | Empty state when no courses created | Instructor with 0 courses | 1. View My Courses | "No courses yet" with "Create First Course" CTA |
| TC-UI-INS-MC-007 | [P] | P3 | Search/filter courses in list | Multiple courses exist | 1. Type in search input | List filters to matching course names |

---

## 25. Instructor – Create Course (INS-CREATE)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-INS-CREATE-001 | [P] | P1 | Create course page loads | Logged in as instructor | 1. Navigate to `/instructor/courses/create` | Multi-step form or single form with course fields: title, description, category, price |
| TC-UI-INS-CREATE-002 | [P] | P1 | Submitting basic info saves draft | Create course form | 1. Fill title, category, price 2. Click "Save" or "Next" | Draft saved; redirected to next step or edit page; toast "Course created" |
| TC-UI-INS-CREATE-003 | [N] | P2 | Empty required fields blocked | Create course form | 1. Click Submit without filling title | Validation error on required fields |
| TC-UI-INS-CREATE-004 | [P] | P2 | Thumbnail upload preview works | Create course form | 1. Click thumbnail upload area 2. Select image | Thumbnail preview shown in form |
| TC-UI-INS-CREATE-005 | [P] | P2 | Category dropdown lists all categories | Create course form | 1. Click category dropdown | All available categories listed as options |
| TC-UI-INS-CREATE-006 | [P] | P2 | Price input accepts decimal | Create course form | 1. Enter "49.99" in price field | Value accepted without error |
| TC-UI-INS-CREATE-007 | [N] | P2 | Negative price rejected | Create course form | 1. Enter "-100" in price field 2. Submit | Validation error "Price must be positive" |
| TC-UI-INS-CREATE-008 | [P] | P3 | Course level dropdown works | Create course form | 1. Click level dropdown | Options: Beginner, Intermediate, Advanced visible |

---

## 26. Instructor – Edit Course (INS-EDIT)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-INS-EDIT-001 | [P] | P1 | Edit course page loads with current data | Logged in as instructor, own course exists | 1. Navigate to `/instructor/courses/:id/edit` | Form pre-filled with existing course data |
| TC-UI-INS-EDIT-002 | [P] | P1 | Updating course title saves | Edit course page | 1. Change title 2. Click "Save" | Toast "Course updated"; title reflects new value |
| TC-UI-INS-EDIT-003 | [P] | P2 | Adding new section to curriculum | Edit course, curriculum tab | 1. Click "Add Section" 2. Enter section title 3. Save | New section appears in curriculum list |
| TC-UI-INS-EDIT-004 | [P] | P2 | Adding lecture to a section | Edit course, section added | 1. Expand section 2. Click "Add Lecture" 3. Fill title and upload video | Lecture added under section |
| TC-UI-INS-EDIT-005 | [P] | P2 | Uploading course video works | Edit course, add lecture form | 1. Click video upload area 2. Select .mp4 file | Upload progress indicator shown; video saved after complete |
| TC-UI-INS-EDIT-006 | [P] | P2 | Deleting a lecture works | Edit course, lecture exists | 1. Click delete icon on lecture 2. Confirm in dialog | Lecture removed from list; toast confirmation |
| TC-UI-INS-EDIT-007 | [P] | P2 | Reordering sections/lectures via drag | Edit course curriculum | 1. Drag a section to new position | Order updates; new position reflected after save |
| TC-UI-INS-EDIT-008 | [P] | P2 | Submit for review button appears | Draft course | 1. View edit page for draft course | "Submit for Review" button visible; clicking triggers status change |
| TC-UI-INS-EDIT-009 | [S] | P1 | Instructor cannot edit another instructor's course | Logged in as instructor B | 1. Navigate to edit page for instructor A's course | Unauthorized/404 page shown |
| TC-UI-INS-EDIT-010 | [P] | P2 | Pricing tab allows price update | Edit course, pricing tab | 1. Go to pricing tab 2. Change price 3. Save | Price updated; toast confirmation |
| TC-UI-INS-EDIT-011 | [P] | P3 | Rich text editor for description works | Edit course, description field | 1. Type formatted text with bold/italic | Rich text formatting applied in preview |

---

## 27. Instructor – Course Detail (INS-DET)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-INS-DET-001 | [P] | P1 | Course detail page loads for instructor | Navigate to `/instructor/courses/:id` | 1. Open own course detail | Course title, description, curriculum, stats visible |
| TC-UI-INS-DET-002 | [P] | P2 | Student enrollment count visible | Course detail | 1. View stats section | Number of enrolled students displayed |
| TC-UI-INS-DET-003 | [P] | P2 | Revenue stats visible | Course detail | 1. View stats | Course revenue/earnings figure shown |
| TC-UI-INS-DET-004 | [P] | P2 | Edit course button navigates | Course detail page | 1. Click "Edit" button | Redirected to `/instructor/courses/:id/edit` |
| TC-UI-INS-DET-005 | [P] | P3 | Course reviews visible | Course has student reviews | 1. Scroll to reviews section | Student reviews displayed with rating and text |

---

## 28. Instructor – My Students (INS-STU)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-INS-STU-001 | [P] | P1 | My Students page loads | Logged in as instructor | 1. Navigate to `/instructor/students` | Table of enrolled students with name, enrolled course, enrollment date |
| TC-UI-INS-STU-002 | [P] | P2 | Search/filter students | Students exist | 1. Type student name in search | Table filters to matching students |
| TC-UI-INS-STU-003 | [P] | P2 | Filter by course works | Multiple courses with students | 1. Select course from dropdown filter | Only students enrolled in that course shown |
| TC-UI-INS-STU-004 | [E] | P2 | Empty state for new instructor | Instructor has no students | 1. View My Students | "No students yet" message displayed |
| TC-UI-INS-STU-005 | [P] | P3 | Student progress column shows % | Table loaded | 1. View progress column | Percentage completion per student per course shown |

---

## 29. Instructor – Profile (INS-PROF)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-INS-PROF-001 | [P] | P1 | Instructor profile page loads | Logged in as instructor | 1. Navigate to `/instructor/profile` | Form with name, bio, social links, avatar pre-filled |
| TC-UI-INS-PROF-002 | [P] | P2 | Updating bio and saving | Profile page | 1. Edit bio text 2. Click Save | Toast "Profile saved"; bio reflects new content |
| TC-UI-INS-PROF-003 | [P] | P2 | Avatar update works | Profile page | 1. Click avatar 2. Upload new image | Preview shows new avatar; save persists it |
| TC-UI-INS-PROF-004 | [P] | P3 | Social media URL fields visible | Profile page | 1. View form | LinkedIn, Twitter/X, Website URL fields visible |
| TC-UI-INS-PROF-005 | [N] | P2 | Invalid social URL rejected | Profile page | 1. Enter "badlink" in LinkedIn field 2. Save | Validation error "Invalid URL" shown |

---

## 30. Instructor – Earnings (INS-EARN)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-INS-EARN-001 | [P] | P1 | Earnings page loads | Logged in as instructor | 1. Navigate to `/instructor/earnings` | Total earnings, monthly breakdown displayed |
| TC-UI-INS-EARN-002 | [P] | P2 | Revenue chart displays monthly data | Earnings page loaded | 1. View chart | Chart shows monthly revenue bars/lines; hover shows exact value |
| TC-UI-INS-EARN-003 | [P] | P2 | Transactions/payout list visible | Earnings page | 1. Scroll to transactions | Table with date, course, amount, status columns |
| TC-UI-INS-EARN-004 | [P] | P3 | Filter by date range works | Earnings page | 1. Select custom date range 2. Apply | Chart and totals update for selected period |
| TC-UI-INS-EARN-005 | [E] | P3 | Zero earnings shows empty chart | New instructor, no sales | 1. View earnings | Chart shows zero state; total shows "0" not an error |

---

## 31. Instructor – Settings (INS-SETT)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-INS-SETT-001 | [P] | P1 | Settings page loads | Logged in as instructor | 1. Navigate to `/instructor/settings` | Settings sections visible (password, notifications, etc.) |
| TC-UI-INS-SETT-002 | [P] | P2 | Change password works | Settings open | 1. Enter current + new + confirm password 2. Save | Toast "Password changed successfully" |
| TC-UI-INS-SETT-003 | [N] | P2 | Wrong current password rejected | Settings | 1. Enter incorrect current password 2. Save | Error message shown |

---

## 32. Chatbot Widget (BOT)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-BOT-001 | [P] | P2 | Chatbot icon visible on non-excluded pages | Logged in as student on `/home` | 1. View bottom-right of any page except `/`, `/auth/*`, `/404` | Circular chatbot icon/button visible in bottom-right corner |
| TC-UI-BOT-002 | [P] | P2 | Chatbot opens on icon click | Any page with chatbot | 1. Click chatbot icon | Chat panel slides open/expands; welcome message displayed |
| TC-UI-BOT-003 | [P] | P2 | Sending a message gets a response | Chatbot open | 1. Type "What courses do you have?" 2. Press Enter or click Send | User message shown in chat; bot response appears within 2–5 seconds |
| TC-UI-BOT-004 | [P] | P3 | Chatbot can be closed | Chatbot panel open | 1. Click X / close button | Chat panel collapses; chatbot icon still visible |
| TC-UI-BOT-005 | [N] | P3 | Empty message cannot be sent | Chatbot open | 1. Click Send without typing | Nothing sent; input field stays empty; no empty bubble created |
| TC-UI-BOT-006 | [P] | P3 | Chat history persists during session | Chat open, messages sent | 1. Navigate to another page 2. Open chatbot again | Previous conversation messages visible in chat panel |
| TC-UI-BOT-007 | [E] | P3 | Chatbot hidden on excluded pages | Navigate to `/` or `/auth/sign-in` | 1. Open sign-in page | Chatbot icon NOT visible on page |
| TC-UI-BOT-008 | [P] | P3 | Typing indicator shown while bot responds | Message sent | 1. Send message 2. Observe response area | Typing indicator (ellipsis animation or spinner) visible while awaiting response |

---

## 33. Sidebar / Offcanvas Navigation (SIDEBAR)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-SIDEBAR-001 | [P] | P2 | Desktop sidebar visible for student | Logged in as student, viewport ≥ 1200px | 1. Navigate to `/student/dashboard` | Left sidebar menu visible; all menu items accessible |
| TC-UI-SIDEBAR-002 | [P] | P2 | Desktop sidebar visible for instructor | Logged in as instructor, viewport ≥ 1200px | 1. Navigate to `/instructor/dashboard` | Instructor sidebar with correct menu items visible |
| TC-UI-SIDEBAR-003 | [P] | P2 | Mobile: sidebar hidden, hamburger shows | Viewport < 1200px | 1. Resize browser to 375px 2. Navigate to student page | Sidebar not visible; hamburger/toggle button shown |
| TC-UI-SIDEBAR-004 | [P] | P2 | Mobile: hamburger opens Offcanvas drawer | Viewport < 1200px | 1. Click hamburger icon | Offcanvas drawer slides in from left with navigation items |
| TC-UI-SIDEBAR-005 | [P] | P2 | Mobile: Offcanvas closes on menu item click | Offcanvas open | 1. Click a menu item | Offcanvas closes; page navigates to selected section |
| TC-UI-SIDEBAR-006 | [P] | P3 | Active menu item highlighted | On any nested page | 1. View sidebar | Current page's menu item highlighted/active |
| TC-UI-SIDEBAR-007 | [P] | P3 | Sidebar hidden on video player page | Student on learning/video page | 1. Navigate to video player | Main layout sidebar is hidden; full-width video UI shown |

---

## 34. Toast Notifications & Loading States (UX)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-UX-001 | [P] | P2 | Success toast appears after positive action | Logged in student | 1. Add item to cart | Green/success toast notification appears and auto-dismisses |
| TC-UI-UX-002 | [P] | P2 | Error toast appears after failed action | Valid session | 1. Submit form with server-side error | Red/error toast with message appears |
| TC-UI-UX-003 | [P] | P3 | Loading spinner on data fetch | Any data-fetching page | 1. Navigate to a page 2. Observe before data loads | Spinner or skeleton placeholder shown during fetch |
| TC-UI-UX-004 | [P] | P3 | Toast auto-dismisses | Toast visible | 1. Observe toast notification | Toast disappears automatically after 3–5 seconds |
| TC-UI-UX-005 | [P] | P3 | Toast can be dismissed manually | Toast visible | 1. Click X on toast | Toast dismisses immediately |
| TC-UI-UX-006 | [P] | P4 | Page title updates with navigation | Navigate between pages | 1. Navigate from Dashboard to My Courses | Browser tab title updates to reflect current page |

---

## 35. 404 Not Found Page (404)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-404-001 | [P] | P2 | Unknown route shows 404 page | Browser open | 1. Navigate to `/some-random-nonexistent-path` | 404 page displayed with "Page Not Found" message |
| TC-UI-404-002 | [P] | P2 | 404 page has "Go Home" link | 404 page loaded | 1. View 404 page | "Go to Home" or "Back to Home" button/link visible |
| TC-UI-404-003 | [P] | P2 | 404 "Go Home" link works | 404 page | 1. Click "Go Home" | Redirected to `/home` |
| TC-UI-404-004 | [E] | P3 | Chatbot not shown on 404 page | 404 page | 1. View 404 page | Chatbot widget NOT visible (excluded per app config) |

---

## 36. Accessibility & Cross-Browser (A11Y)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-A11Y-001 | [P] | P3 | Tab navigation through sign-in form | Sign-in page | 1. Press Tab key through form | Focus moves Email → Password → Sign In button in order; focus outline visible |
| TC-UI-A11Y-002 | [P] | P3 | Form fields have accessible labels | Sign-in / sign-up page | 1. Inspect form fields | Each input has visible label or aria-label; placeholder not sole label |
| TC-UI-A11Y-003 | [P] | P3 | Images have alt text | Any page with images | 1. Inspect img elements in DevTools | All meaningful images have non-empty alt attributes |
| TC-UI-A11Y-004 | [P] | P4 | Sufficient color contrast on primary buttons | Any page | 1. Inspect primary button text vs background color | Contrast ratio ≥ 4.5:1 (WCAG AA) |
| TC-UI-A11Y-005 | [P] | P3 | Page is usable on mobile Safari (iOS) | iOS Safari browser | 1. Open `/home` on iOS Safari | Page renders correctly; tap targets not too small; no overlapping elements |

---

## 37. End-to-End UI Flows (E2E)

| TC ID | Type | Priority | Description | Preconditions | Steps | Expected UI Result |
|-------|------|----------|-------------|---------------|-------|--------------------|
| TC-UI-E2E-001 | [P] | P1 | Full student onboarding: Register → Verify → Sign In | Fresh email address | 1. Go to `/auth/sign-up` 2. Fill and submit form 3. Enter OTP in modal 4. Navigate to `/auth/sign-in` 5. Sign in with new credentials | OTP modal closes; sign-in succeeds; student dashboard visible |
| TC-UI-E2E-002 | [P] | P1 | Full purchase flow: Browse → Add to Cart → Checkout → Pay | Logged in student, course not enrolled | 1. Browse `/courses` 2. Click course 3. Add to cart 4. Go to `/student/cart` 5. Apply coupon 6. Proceed to checkout 7. Select payment method 8. Complete payment | Course appears in `/student/courses`; success page shown |
| TC-UI-E2E-003 | [P] | P1 | Full learning flow: Enroll → Watch → Complete | Student purchased course | 1. Go to `/student/courses` 2. Click course 3. Watch all lectures 4. Progress reaches 100% | Completion badge on My Courses; result page accessible; certificate available |
| TC-UI-E2E-004 | [P] | P1 | Instructor full course lifecycle: Create → Add Content → Submit → Published | Logged in as instructor | 1. `/instructor/courses/create` 2. Add title, desc, price 3. Add sections and lectures with videos 4. Submit for review 5. (Admin approves) 6. Verify Published status | Course appears in public listing with Published status |
| TC-UI-E2E-005 | [P] | P2 | Wishlist to Purchase flow | Logged in student | 1. Add course to wishlist from `/courses` 2. Go to `/student/wishlist` 3. Click "Add to Cart" 4. Go to cart 5. Checkout | Course purchased and available in My Courses |
| TC-UI-E2E-006 | [P] | P2 | Password reset flow | Existing account | 1. Go to `/auth/forgot-password` 2. Enter email 3. Open reset link from email 4. Enter new password 5. Sign in with new password | Sign-in succeeds with new password; old password no longer works |
| TC-UI-E2E-007 | [P] | P2 | Instructor profile update visible on public page | Logged in as instructor | 1. Update bio and avatar in `/instructor/profile` 2. Save 3. Open public instructor page `/instructors/:id` | New bio and avatar visible on public profile page |
| TC-UI-E2E-008 | [P] | P2 | Resume pending payment | Student with pending order | 1. Go to `/student/orders` 2. Find pending order 3. Click "Resume Payment" 4. Complete payment on gateway | Order status changes to Completed; course in My Courses |
| TC-UI-E2E-009 | [P] | P3 | Become instructor flow | Student account | 1. `/student/become-instructor` 2. Fill form 3. Submit 4. (Admin approves) 5. Log out and log back in | Instructor role granted; redirect to instructor dashboard on next login |
| TC-UI-E2E-010 | [P] | P3 | Chatbot course recommendation | Logged in student | 1. Open chatbot 2. Type "Recommend me a Python course" | Bot responds with course suggestions; clicking a suggestion navigates to course detail |

---

## Summary

| Section | TC Count |
|---------|----------|
| Navigation (NAV) | 11 |
| Home Page (HOME) | 10 |
| Course Listing (COURSES) | 16 |
| Course Detail (CDETAIL) | 14 |
| Instructor Public Profile (INS_PUB) | 5 |
| Sign In (AUTH-SI) | 11 |
| Sign Up (AUTH-SU) | 10 |
| Email OTP (AUTH-OTP) | 5 |
| Forgot Password (AUTH-FP) | 5 |
| Reset Password (AUTH-RP) | 5 |
| Student Dashboard (STU-DASH) | 9 |
| Student My Courses (STU-MC) | 6 |
| Learning / Video Player (STU-LEARN) | 17 |
| Course Result (RESULT) | 4 |
| Cart (CART) | 12 |
| Wishlist (WISH) | 6 |
| Checkout (CHKOUT) | 7 |
| Payment Result (PAY) | 5 |
| My Orders (ORDERS) | 8 |
| Student Profile (STU-PROF) | 5 |
| Account Settings (SETT) | 7 |
| Become Instructor (BECOME) | 4 |
| Instructor Dashboard (INS-DASH) | 8 |
| Instructor My Courses (INS-MC) | 7 |
| Create Course (INS-CREATE) | 8 |
| Edit Course (INS-EDIT) | 11 |
| Instructor Course Detail (INS-DET) | 5 |
| My Students (INS-STU) | 5 |
| Instructor Profile (INS-PROF) | 5 |
| Instructor Earnings (INS-EARN) | 5 |
| Instructor Settings (INS-SETT) | 3 |
| Chatbot (BOT) | 8 |
| Sidebar / Offcanvas (SIDEBAR) | 7 |
| Toast / Loading UX (UX) | 6 |
| 404 Page | 4 |
| Accessibility (A11Y) | 5 |
| End-to-End Flows (E2E) | 10 |
| **Total** | **~318** |
