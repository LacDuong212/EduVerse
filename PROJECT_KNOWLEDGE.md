# EduVerse — Project Knowledge Base

> Quick reference cho AI-assisted development. Đọc file này trước khi implement bất kỳ feature nào.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js + Express, ES Modules (`import/export`) |
| Database | MongoDB + Mongoose |
| Validation | Zod |
| Frontend | React 18 + Vite, React Router v6 |
| UI Library | React Bootstrap |
| State | Redux Toolkit + React Context |
| HTTP Client | axios (2 instances: `api` và `authApi`) |
| Auth | JWT in httpOnly cookie (`edv_token`) |
| Storage | AWS S3 (videos, signed URLs) · Cloudinary (images) |
| Payments | MoMo + VNPay (webhook/IPN) |
| AI/ML | Separate ML service (recommendations, skill radar) |
| Rich Text | react-quill-new (snow theme) |
| Icons | react-icons (bs = Bootstrap, fa = FontAwesome) |

---

## Project Structure

```
EduVerse/
├── backend/
│   └── src/
│       ├── modules/          # Feature modules (MVC per module)
│       ├── middlewares/      # auth, error, zod validator, logger
│       ├── shared/
│       │   ├── utils/        # asyncHandler, response, pagination, cookie, enum, scheduler
│       │   ├── services/     # ai, cron, dialogflow, mail, recommendation, s3
│       │   ├── constants/
│       │   └── exceptions/   # AppError class
│       └── app.js / server.js
├── frontend/
│   └── src/
│       ├── app/              # Feature pages (by role)
│       │   ├── auth/         # sign-in, sign-up, forgot/reset password
│       │   ├── pages/        # home, course grid, course detail, video player, instructors
│       │   ├── student/      # dashboard, learning, my-courses, my-orders, account
│       │   ├── instructor/   # dashboard, course CRUD, earnings, profile, course-detail
│       │   ├── shop/         # cart, checkout, payment-result, wishlist
│       │   └── chatbot/      # AI chatbot widget
│       ├── components/       # Shared UI components
│       ├── layouts/          # RoleBasedLayout, etc.
│       ├── routes/           # index.jsx (route definitions) + router.jsx (AppRouter)
│       ├── redux/            # store, authSlice, cartSlice, coursesSlice, wishlistSlice
│       ├── contexts/         # React contexts
│       ├── hooks/            # Shared hooks
│       ├── utils/            # api.js, currency, date, duration, mapper, request, etc.
│       └── configs/
├── frontend_admin/           # Separate React app cho Admin role
├── ml_service/               # Python ML service (recommendations, skill radar)
├── ROADMAP.md                # Product roadmap + time estimates
└── PROJECT_KNOWLEDGE.md      # This file
```

---

## Backend: Module Structure

Mỗi module theo pattern nhất quán:

```
modules/<name>/
├── <name>.model.js       # Mongoose schema
├── <name>.validation.js  # Zod schemas
├── <name>.service.js     # Business logic
├── <name>.controller.js  # Request handlers (dùng asyncHandler)
├── <name>.route.js       # Express Router
└── <name>.mapper.js      # DTO mappers (optional, nếu cần transform data)
```

---

## Backend: Key Patterns

### 1. Route registration — `backend/src/modules/index.js`
```js
// Thêm module mới vào đây
import myRoute from "#modules/my/my.route.js";
apiRouter.use("/my", myRoute);
```
Base path cho tất cả routes: `/api`

### 2. Middleware stack
```js
protect          // Require auth — đọc JWT từ cookie edv_token, set req.user
restrictTo(role) // Role-based — "student" | "instructor" | "admin"
checkAuth        // Optional auth — set req.user nếu có token, không throw nếu không
internal         // Internal API key via header x-internal-key
validate(schema) // Zod validation middleware
```

**`req.user` shape** (sau khi `protect`):
```js
{ userId, name, email, role, avatar }
```

### 3. asyncHandler — wrap mọi controller
```js
import asyncHandler from "#utils/asyncHandler.js";
export const myHandler = asyncHandler(async (req, res, next) => { ... });
```

### 4. Response helpers — `backend/src/shared/utils/response.js`
```js
// Single item
sendSuccessResponse(res, 200, "Message", data)
// → { success: true, message, result: data, timestamp }

// Paginated list
sendPaginatedResponse(res, 200, "Message", items, { page, limit, totalItems })
// → { success: true, message, result: [...], pagination: { page, limit, totalItems, totalPages, hasNextPage, hasPrevPage } }

// Error (dùng trong AppError handler)
sendError(res, 400, "Error message", errors)
```

### 5. Error handling
```js
import AppError from "#exceptions/app.error.js";
throw new AppError("Not found.", 404);
// Được catch bởi global error middleware → sendError()
```

### 6. Pagination — `backend/src/shared/utils/pagination.js`
```js
const { page, limit, skip } = getPaginationOptions(req.query.page, req.query.limit);
const items = await Model.find(query).skip(skip).limit(limit);
const total = await Model.countDocuments(query);
sendPaginatedResponse(res, 200, "OK", items, { page, limit, totalItems: total });
```

### 7. Zod validation pattern — `<name>.validation.js`
```js
import { z } from "zod";
import { pageSchema, limitSchema } from "#utils/pagination.js";

export const createXRequest = z.object({
  body: z.object({ field: z.string().min(1).max(1000) }),
});
export const listXRequest = z.object({
  query: z.object({ page: pageSchema, limit: limitSchema() }),
});
```

### 8. Soft delete pattern
Dùng `isDeleted: Boolean (default: false)` trên model. Query luôn kèm `isDeleted: false`.

### 9. Import aliases (backend)
```js
import X from "#modules/..."     // = src/modules/
import X from "#utils/..."       // = src/shared/utils/
import X from "#exceptions/..."  // = src/shared/exceptions/
import X from "#middlewares/..."  // = src/middlewares/
```

---

## Backend: All API Endpoints

Base: `http://localhost:<PORT>/api`

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register |
| POST | `/login` | — | Login (set cookie) |
| POST | `/logout` | protect | Logout |
| POST | `/forget-password` | — | Request OTP |
| POST | `/reset-password` | — | Reset với OTP |
| POST | `/verify-email` | — | OTP verification |
| POST | `/resend-otp` | — | Resend OTP |
| POST | `/reactivate` | — | Reactivate deactivated account |
| POST | `/reactivate/send-otp` | — | OTP for reactivation |
| GET | `/status` | checkAuth | Check login status |
| GET | `/google` | — | Google OAuth init |
| GET | `/google/callback` | — | Google OAuth callback |

### Courses — `/api/courses`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List courses (filter/search/sort/paginate) |
| GET | `/home` | — | Featured courses for homepage |
| GET | `/filters` | — | Get available filter options |
| GET | `/recommendations` | checkAuth | AI-powered recommendations |
| GET | `/stats` | — | Platform course stats |
| GET | `/tags/popular` | — | Popular tags |
| GET | `/:id` | checkAuth | Course detail (includes enrollment status if auth) |
| GET | `/:id/curriculum` | checkAuth | Full curriculum (only live courses for students) |
| GET | `/:id/reviews` | checkAuth | Course reviews |
| GET | `/:id/related` | — | Related courses |
| GET | `/:id/assessment` | protect+student | AI final assessment |
| PATCH | `/:id/toggle-privacy` | protect+instructor | Toggle course privacy |
| GET | `/:id/image/upload` | protect+instructor | S3 upload URL for thumbnail |
| POST | `/:id/lectures/:lecId/generate-ai` | protect+instructor | Generate AI content for lecture |
| DELETE | `/:id/lectures/:lecId/ai-contents` | protect+instructor | Remove AI content |

### Student — `/api/student` (protect + restrictTo("student"))
| Method | Path | Description |
|---|---|---|
| GET | `/courses` | Enrolled courses list |
| GET | `/courses/stats` | Stats về các khóa đang học |
| GET | `/courses/:courseId` | Learning course detail |
| GET | `/courses/:courseId/progress` | Full progress data |
| POST | `/courses/:courseId/lectures/:lecId/progress` | Update lecture progress |
| GET | `/profile` | Student profile |
| PATCH | `/profile` | Update profile |
| PUT | `/interests` | Update learning interests |
| GET | `/skill-radar` | AI skill radar data |
| GET | `/stats` | Dashboard stats |
| GET | `/streak` | Current streak data |

### Instructor Public — `/api/instructors`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | protect | Apply to become instructor |
| GET | `/me` | checkAuth | Get own instructor profile |
| GET | `/:insId` | — | Public instructor profile |
| GET | `/:insId/courses` | — | Instructor's public courses |
| GET | `/:insId/stats` | — | Public stats |

### Instructor Private — `/api/instructor` (protect + restrictTo("instructor"))
| Method | Path | Description |
|---|---|---|
| GET | `/courses` | List own courses |
| POST | `/courses` | Create new course |
| GET | `/courses/:courseId` | Get course for editing (includes full curriculum, any status) |
| PATCH | `/courses/:courseId` | Update course |
| DELETE | `/courses/drafts/:courseId` | Delete draft course |
| DELETE | `/courses/:courseId/changes` | Clear pending changes |
| POST | `/courses/:courseId/submit` | Submit for review |
| GET | `/courses/:courseId/approve` | Approve course (self-approve flow) |
| GET | `/courses/:courseId/details` | Course detail stats |
| GET | `/courses/:courseId/enrollments` | Monthly enrollment chart |
| GET | `/courses/:courseId/revenue` | Monthly revenue chart |
| GET | `/courses/:courseId/students` | Students in course |
| GET | `/courses/:courseId/students/:stuId/progress` | Specific student progress |
| GET | `/courses/revenue` | All courses monthly revenue |
| GET | `/courses/top-courses` | Top revenue courses |
| GET | `/courses/stats` | Courses aggregate stats |
| GET | `/earnings` | Instructor earnings summary |
| GET | `/dashboard/enrollment-trends` | 30-day enrollment trend |
| GET | `/dashboard/progress-breakdown` | Student progress breakdown |
| GET | `/dashboard/student-distribution` | Student distribution |
| GET | `/profile` | Instructor profile |
| PATCH | `/profile` | Update profile |
| GET | `/stats` | Instructor stats |
| GET | `/students` | All students across courses |
| GET | `/students/stats` | Student aggregate stats |

### Q&A — `/api/qa` (protect required)
| Method | Path | Description |
|---|---|---|
| GET | `/courses/:courseId?lectureId=&page=` | Get Q&A (paginated, optional lecture filter) |
| POST | `/courses/:courseId` | Create question `{ content, lectureId? }` |
| POST | `/:questionId/replies` | Create reply `{ content }` |
| PATCH | `/:id/resolve` | Toggle resolved status |
| DELETE | `/:id` | Soft delete (cascades replies if root) |

### Cart — `/api/cart` (protect)
| Method | Path | Description |
|---|---|---|
| GET | `/` | Get cart |
| POST | `/` | Add course |
| DELETE | `/:courseId` | Remove course |
| DELETE | `/` | Clear cart |
| GET | `/count` | Cart item count |

### Orders — `/api/orders` (protect)
| Method | Path | Description |
|---|---|---|
| GET | `/` | List user orders |
| POST | `/` | Create order from cart |
| GET | `/:id` | Order detail |
| PATCH | `/:id/cancel` | Cancel order |
| GET | `/stats` | Order stats |

### Payments — `/api/payments`
| Method | Path | Description |
|---|---|---|
| POST | `/` | Initiate payment (MoMo or VNPay) |
| POST | `/momo/ipn` | MoMo webhook |
| GET | `/momo/return` | MoMo redirect return |
| POST | `/vnpay/ipn` | VNPay webhook |
| GET | `/vnpay/return` | VNPay redirect return |

### Other routes
| Prefix | Key Endpoints |
|---|---|
| `/api/wishlist` | GET/POST/DELETE wishlist, check, count |
| `/api/reviews` | POST/PATCH/DELETE review |
| `/api/notifications` | GET (paginated), count unread, mark read, DELETE |
| `/api/coupons` | GET all, POST apply, refund status, claim refund |
| `/api/categories` | GET all |
| `/api/videos` | GET upload URL, GET view URL |
| `/api/quizzes` | POST save quiz result |
| `/api/chatbot` | POST get response |
| `/api/user` | PATCH change password, PATCH deactivate, GET avatar upload URL |
| `/api/internal` | POST notify (internal only, x-internal-key header) |

---

## Frontend: Key Patterns

### 1. API calls
```js
// Dùng authApi cho mọi authenticated request
import { authApi } from "@/utils/api";
const { data } = await authApi.get("/student/profile");

// Dùng api cho public request (không cần credentials)
import { api } from "@/utils/api";
const { data } = await api.get("/courses");

// axios raw (khi cần custom baseURL hoặc không muốn dùng instance)
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
await axios.post(`${backendUrl}/api/qa/...`, body, { withCredentials: true });
```

### 2. Auth state — Redux
```js
import { useSelector } from "react-redux";
const { user, isAuthenticated } = useSelector(state => state.auth);
// user: { userId, name, email, role, avatar }
```

### 3. Route params
```js
import { useParams } from "react-router-dom";
// Student routes dùng :courseId
// Instructor routes dùng :id (course ID)
// Video player: /student/courses/:courseId/watch/:lectureId
```

### 4. URL-driven state (searchParams)
```js
import { useSearchParams } from "react-router-dom";
const [searchParams, setSearchParams] = useSearchParams();
const tab = searchParams.get("tab") || "content";
```

### 5. Toast notifications
```js
import { toast } from "react-toastify";
toast.success("Done!"); toast.error("Failed.");
```

### 6. Styling conventions
- **NEVER use `text-muted`** — dùng `text-body` thay thế
- Instructor posts: `backgroundColor: "#F9F9D6"` (không dùng border color)
- React Bootstrap components: `<Button>`, `<Card>`, `<Modal>`, `<Form>`, `<Badge>`, `<Spinner>`
- Icons: `import { BsXxx } from "react-icons/bs"`, `import { FaXxx } from "react-icons/fa"`

### 7. Rich text
```js
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
// Render saved HTML:
<div className="ql-editor p-0" dangerouslySetInnerHTML={{ __html: content }} />
```

---

## Frontend: Routes Map

### Public (`/`)
| Path | Component | Description |
|---|---|---|
| `/home` | `HomePage` | Landing page |
| `/courses` | `CoursesPage` | Course grid + filter |
| `/courses/:id` | `CourseDetails` | Course detail |
| `/instructors/:id` | `InstructorDetailsPage` | Instructor profile |
| `/student/become-instructor` | `BecomeInstructorPage` | Apply form |

### Auth (`/auth`)
| Path | Component |
|---|---|
| `/auth/sign-in` | `SignIn` |
| `/auth/sign-up` | `SignUp` |
| `/auth/forgot-password` | `ForgotPassword` |
| `/auth/reset-password` | `ResetPassword` |

### Student (protected, role=student)
| Path | Component | Description |
|---|---|---|
| `/student/dashboard` | `StudentDashboard` | Stats, streak, recommendations |
| `/student/courses` | `StudentMyCourses` | Enrolled courses |
| `/student/courses/:courseId` | `LearningCourse` | Course overview + tabs (Course Material, Q&A) |
| `/student/courses/:courseId/watch/:lectureId` | `VideoPlayer` | Video player + Playlist sidebar |
| `/student/courses/:courseId/result` | `CourseResultPage` | Completion + skill radar |
| `/student/cart` | `CartDetails` | Shopping cart |
| `/student/checkout` | `Checkout` | Order + payment method |
| `/student/payment-success` | `PaymentSuccess` | |
| `/student/payment-failed` | `PaymentFailed` | |
| `/student/orders` | `OrderListPage` | Order history |
| `/student/orders/:id` | `OrderDetailPage` | Order detail |
| `/student/wishlist` | `WishList` | Saved courses |
| `/student/account` | `StudentAccount` | Profile + interests |
| `/accountSettings` | `AccountSettingsPage` | Password, deactivate |

### Instructor (protected, role=instructor)
| Path | Component | Description |
|---|---|---|
| `/instructor/dashboard` | `InstructorDashboard` | Revenue, enrollments, trends |
| `/instructor/courses` | `InstructorMyCourses` | Course list |
| `/instructor/courses/create` | `CreateCoursePage` | 4-step wizard |
| `/instructor/courses/:id/edit` | `EditCoursePage` | Edit course |
| `/instructor/courses/:id` | `InstructorCourseDetail` | Stats + Q&A + students |
| `/instructor/earnings` | `InstructorEarnings` | Revenue dashboard |
| `/instructor/my-students` | `InstructorMyStudents` | All students |
| `/instructor/profile` | `InstructorProfile` | Bio, skills, education |

---

## Database Models — Key Fields

| Model | Key Fields | Notes |
|---|---|---|
| **User** | `name, email, password, role (student/instructor), isVerified, googleId, avatar` | Parent for Student, Instructor |
| **Course** | `title, price, discountPrice, status (draft/pending/live/blocked), level, category, instructor: {ref, name}, rating, isPrivate` | `instructor.ref` = User ObjectId |
| **Curriculum** | `courseId, sections[{secId, title, lectures[{lecId, title, videoUrl, duration, aiData}]}]` | Separate from Course doc |
| **Instructor** | `user (ref), stats, myCourses[], skills, education, isApproved` | `user` → User._id |
| **Student** | `user (ref), stats, interests[]` | |
| **Enrollment** | `student (ref), course (ref), instructor (ref), status (active/completed/refunded)` | |
| **Order** | `user, courses[], subTotal, discountAmount, totalAmount, paymentMethod (momo/vnpay/free), status (pending/completed/cancelled/refunded)` | |
| **CourseProgress** | `user, course, lectures[{lecId, status, lastPositionSec, durationSec}], completedLecturesCount, aiAssessment` | |
| **QnA** | `courseId, lectureId (String, nullable), author (ref User), content (HTML, max 20000), parentId (null=root), isInstructorPost, isResolved, isDeleted` | parentId null = question; non-null = reply |
| **Streak** | `user (ref), currentStreak, longestStreak, activeDates[], activityLog[]` | TODO: 365+ edge case chưa fix |
| **Notification** | `user, type, message, isRead` | |
| **Review** | `course, user, rating (0-5), description` | |
| **Transaction** | `orderId, userId, gateway (momo/vnpay), transactionId, amount, status` | |
| **Coupon** | `code, discountType, discountValue, startDate, expiryDate, courseId (optional), usersUsed[]` | |

---

## Key File Locations

### Backend
```
backend/src/middlewares/auth.middleware.js     # protect, restrictTo, checkAuth
backend/src/shared/utils/response.js           # sendSuccessResponse, sendPaginatedResponse
backend/src/shared/utils/pagination.js         # getPaginationOptions, pageSchema, limitSchema
backend/src/shared/utils/asyncHandler.js       # asyncHandler wrapper
backend/src/shared/exceptions/app.error.js     # AppError class
backend/src/shared/services/s3.service.js      # S3 upload/signed URLs
backend/src/shared/services/mail.service.js    # Email sending
backend/src/modules/index.js                   # Route registration (apiRouter)
```

### Frontend
```
frontend/src/utils/api.js                      # axios: api (public), authApi (authenticated)
frontend/src/routes/index.jsx                  # All route definitions
frontend/src/routes/router.jsx                 # AppRouter component
frontend/src/redux/store.js                    # Redux store
frontend/src/redux/authSlice.js                # Auth state (user, isAuthenticated)
frontend/src/app/student/learning/hooks/useQna.js   # Q&A hook (reusable)
frontend/src/app/student/learning/components/       # QnaCompose, QnaQuestion, QnaReply, QnaTab
frontend/src/app/student/learning/components/QnaModal.jsx  # Modal wrapper for lecture Q&A
frontend/src/app/instructor/course-detail/components/CourseQna/index.jsx  # Instructor Q&A view
```

---

## Important Conventions & Gotchas

1. **Instructor routes split**: public = `/api/instructors`, private = `/api/instructor` (singular, no s). Cả hai export từ `instructor.route.js` với `{ publicRoutes, privateRoutes }`.

2. **Course curriculum endpoint restriction**: `GET /api/courses/:id/curriculum` chỉ hoạt động với live courses. Để lấy curriculum của course bất kỳ status, instructor dùng `GET /api/instructor/courses/:courseId` → `data.result.curriculum.sections`.

3. **courseId vs id trong URL params**: Student routes dùng `:courseId`, Instructor routes dùng `:id`. Hook `useQna` nhận `courseId` prop để override.

4. **Cookie auth**: JWT lưu trong httpOnly cookie tên `edv_token`. Frontend dùng `withCredentials: true` cho mọi authenticated request.

5. **Soft delete**: Không bao giờ hard delete. Luôn set `isDeleted: true`. Query luôn kèm `isDeleted: false` condition.

6. **DTO Mapper pattern**: Service trả về Mongoose documents, controller gọi mapper để transform sang DTO trước khi response. Mapper nhận `currentUserId` để compute `isMyPost`.

7. **Q&A 1-level depth**: Reply chỉ được reply vào root question (parentId === null). Backend validates điều này khi create reply.

8. **`isInstructorPost` flag**: Set at write-time bằng cách so sánh `course.instructor.ref.toString() === userId` trong service.
