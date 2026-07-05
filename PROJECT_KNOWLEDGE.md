# EduVerse — Project Knowledge Base

> Quick reference cho AI-assisted development. Đọc file này trước khi implement bất kỳ feature nào.

---

## Architecture Overview — 2 backends + 2 frontends

EduVerse có **kiến trúc 2 backend tách biệt**:

| Service | Vai trò | Port | Cookie auth |
|---|---|---|---|
| `backend/` | API chính cho student + instructor + public | 5001 | `edv_token` |
| `backend_admin/` | API riêng cho Admin (dashboard, duyệt course/instructor, payout, audit log) | 5000 | `adm_token` |
| `frontend/` | App chính (student + instructor + public) | Vite | — |
| `frontend_admin/` | App riêng cho Admin | Vite | — |

- **Admin KHÔNG phải một `role` trong model `User`.** Admin là collection riêng (`Admin`) do `backend_admin` quản lý. `User.role` chỉ có `student | instructor`.
- Cả hai backend dùng chung MongoDB database (`edv2_prod`); `backend_admin` khai báo lại (mirror) các schema của `backend` để ref resolve được, cộng thêm 2 model riêng: `Admin`, `AuditLog`.
- `backend_admin` gọi ngược `backend` qua `EDV_SERVER` + `INTERNAL_API_KEY` khi cần.
- Ngoài ra: `ml_service/` (Python ML — recommendations, skill radar), `knowledge/` (tài liệu).

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js + Express, ES Modules (`import/export`) |
| Database | MongoDB + Mongoose |
| Validation | Zod (backend) · yup + react-hook-form (frontend_admin) |
| Frontend | React 18 + Vite (main) · React 19 + Vite 7 (admin) |
| UI Library | React Bootstrap (Bootstrap 5) |
| State | Redux Toolkit + React Context (main) · Redux Toolkit + redux-persist (admin) |
| HTTP Client | axios (2 instances: `api` và `authApi`) |
| Auth | JWT in httpOnly cookie (`edv_token` main · `adm_token` admin) |
| Storage | AWS S3 (videos, signed URLs) · Cloudinary (images) |
| Payments | MoMo + VNPay (webhook/IPN) |
| AI/ML | Separate ML service (recommendations, skill radar) |
| Rich Text | react-quill-new (snow theme) |
| Charts | ApexCharts (react-apexcharts, chủ yếu ở admin) |
| Icons | react-icons (bs = Bootstrap, fa = FontAwesome) |

---

## Project Structure

```
EduVerse/
├── backend/                   # Main API (student/instructor/public) — port 5001
│   └── src/
│       ├── modules/           # Feature modules (MVC per module)
│       ├── middlewares/       # auth, error, zod validator, logger
│       ├── shared/
│       │   ├── utils/         # asyncHandler, response, pagination, cookie, enum, scheduler
│       │   ├── services/      # ai, cron, dialogflow, mail, recommendation, s3
│       │   ├── constants/
│       │   └── exceptions/    # AppError class
│       └── app.js / server.js
├── backend_admin/             # Admin API — port 5000, FLAT MVC (không theo module pattern)
│   ├── controllers/ routes/ models/ middlewares/ configs/ utils/ validations/
│   └── server.js              # Đăng ký route inline (không có modules/index.js)
├── frontend/                  # Main React app (student/instructor/public)
│   └── src/
│       ├── app/               # Feature pages (by role)
│       │   ├── auth/          # sign-in, sign-up, forgot/reset password, email-verify
│       │   ├── pages/         # home, course grid/detail, video-player, instructors, certificate, accountSettings
│       │   ├── student/       # dashboard, learning, my-courses, my-orders, account, achievements, certificates
│       │   ├── instructor/    # dashboard, course CRUD (+ai), earnings, profile, course-detail, my-students
│       │   ├── shop/          # cart, checkout, payment-result, wishlist, empty-cart
│       │   └── chatbot/       # AI chatbot widget (global)
│       ├── components/        # Shared UI components
│       ├── layouts/           # RoleBasedLayout, etc.
│       ├── routes/            # index.jsx (route definitions) + router.jsx (AppRouter)
│       ├── redux/             # store, authSlice, cartSlice, coursesSlice, wishlistSlice
│       ├── contexts/ hooks/ utils/ configs/
├── frontend_admin/            # Separate React 19 app cho Admin role
├── ml_service/                # Python ML service (recommendations, skill radar)
├── knowledge/                 # Docs / knowledge base
├── ROADMAP.md
└── PROJECT_KNOWLEDGE.md       # This file
```

---

## Backend (main): Module Structure

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

> **Lưu ý:** một số module chỉ là **service nội bộ**, KHÔNG có route và không mount vào `/api`:
> `streak`, `enrollment`, `checkout`, `learning`, `chart`, `image`. Chúng được các module khác gọi như service. (`learning` chứa model `CourseProgress`; `enrollment` chứa model `Enrollment`; `streak` chứa model `Streak`.)

---

## Backend (main): Key Patterns

### 1. Route registration — `backend/src/modules/index.js`
```js
import myRoute from "#modules/my/my.route.js";
apiRouter.use("/my", myRoute);
```
Base path cho tất cả routes: `/api`

### 2. Middleware stack
```js
protect          // Require auth — đọc JWT từ cookie edv_token, set req.user
restrictTo(role) // Role-based — "student" | "instructor"  (KHÔNG có "admin" ở backend chính)
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
sendSuccessResponse(res, 200, "Message", data)
// → { success: true, message, result: data, timestamp }

sendPaginatedResponse(res, 200, "Message", items, { page, limit, totalItems })
// → { success: true, message, result: [...], pagination: { page, limit, totalItems, totalPages, hasNextPage, hasPrevPage } }

sendError(res, 400, "Error message", errors)
```

### 5. Error handling
```js
import AppError from "#exceptions/app.error.js";
throw new AppError("Not found.", 404);   // catch bởi global error middleware → sendError()
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
export const createXRequest = z.object({ body: z.object({ field: z.string().min(1).max(1000) }) });
export const listXRequest   = z.object({ query: z.object({ page: pageSchema, limit: limitSchema() }) });
```

### 8. Soft delete pattern
Dùng `isDeleted: Boolean (default: false)`. Query luôn kèm `isDeleted: false`.

### 9. Enums — `#utils/enum.js`
Enum tập trung ở `shared/utils/enum.js` (vd `ROLE_ENUM`, `STATUS_ENUM`, `LEVEL_ENUM`, `LECTURE_STATUS_ENUM`…). Dùng chung giữa model + validation.

### 10. Import aliases (backend)
```js
import X from "#modules/..."     // = src/modules/
import X from "#utils/..."       // = src/shared/utils/
import X from "#exceptions/..."  // = src/shared/exceptions/
import X from "#middlewares/..." // = src/middlewares/
```

---

## Backend (main): All API Endpoints

Base: `http://localhost:5001/api`

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register |
| POST | `/login` | — | Login (set cookie edv_token) |
| POST | `/logout` | protect | Logout |
| POST | `/forget-password` | — | Request OTP |
| POST | `/reset-password` | — | Reset với OTP |
| POST | `/verify-email` | — | OTP verification |
| POST | `/resend-otp` | — | Resend OTP |
| POST | `/reactivate` · `/reactivate/send-otp` | — | Reactivate deactivated account |
| GET | `/status` | checkAuth | Check login status |
| GET | `/google` · `/google/callback` | — | Google OAuth |

### Courses — `/api/courses`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List courses (filter/search/sort/paginate) |
| GET | `/home` | — | Featured courses for homepage |
| GET | `/filters` | — | Available filter options |
| GET | `/recommendations` | checkAuth | AI-powered recommendations |
| GET | `/stats` | — | Platform course stats |
| GET | `/tags/popular` | — | Popular tags |
| GET | `/:id` | checkAuth | Course detail (kèm enrollment status nếu auth) |
| GET | `/:id/curriculum` | checkAuth | Curriculum (chỉ live course cho student) |
| GET | `/:id/reviews` | checkAuth | Course reviews |
| GET | `/:id/related` | — | Related courses |
| GET | `/:id/assessment` | protect+student | AI final assessment |
| PATCH | `/:id/toggle-privacy` | protect+instructor | Toggle course privacy |
| GET | `/:id/image/upload` | protect+instructor | S3 upload URL cho thumbnail |
| POST | `/:id/lectures/:lecId/generate-ai` | protect+instructor | Generate AI content cho lecture |
| DELETE | `/:id/lectures/:lecId/ai-contents` | protect+instructor | Remove AI content |

### Student — `/api/student` (protect + restrictTo("student"))
| Method | Path | Description |
|---|---|---|
| GET | `/courses` | Enrolled courses list |
| GET | `/courses/stats` | Stats về khóa đang học |
| GET | `/courses/:courseId` | Learning course detail |
| GET | `/courses/:courseId/progress` | Full progress data |
| POST | `/courses/:courseId/lectures/:lecId/progress` | Update lecture progress |
| GET | `/profile` · PATCH `/profile` | Student profile |
| PUT | `/interests` | Update learning interests |
| GET | `/skill-radar` | AI skill radar data |
| GET | `/stats` | Dashboard stats |
| GET | `/streak` | Current streak data |
| GET | `/resume` | Resume/continue-learning card |

### Instructor Public — `/api/instructors`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | protect | Apply to become instructor |
| GET | `/me` | checkAuth | Own instructor profile |
| GET | `/:insId` · `/:insId/courses` · `/:insId/stats` | — | Public profile / courses / stats |

### Instructor Private — `/api/instructor` (protect + restrictTo("instructor"))
| Method | Path | Description |
|---|---|---|
| GET/POST | `/courses` | List / create own courses |
| GET | `/courses/:courseId` | Get course for editing (full curriculum, any status) |
| PATCH | `/courses/:courseId` | Update course |
| DELETE | `/courses/drafts/:courseId` | Delete draft course |
| DELETE | `/courses/:courseId/changes` | Clear pending changes |
| POST | `/courses/:courseId/submit` | Submit for review |
| GET | `/courses/:courseId/approve` | Approve course (self-approve flow) |
| GET | `/courses/:courseId/details` | Course detail stats |
| GET | `/courses/:courseId/enrollments` · `/revenue` | Monthly enrollment / revenue chart |
| GET | `/courses/:courseId/students` · `/students/:stuId/progress` | Students / specific progress |
| GET | `/courses/revenue` · `/courses/top-courses` · `/courses/stats` | Aggregate revenue / top / stats |
| GET | `/earnings` | Earnings summary |
| GET/POST | `/bank-accounts` | List / add bank account |
| PATCH/DELETE | `/bank-accounts/:bankId` | Update / delete bank account |
| GET | `/dashboard/enrollment-trends` · `/progress-breakdown` · `/student-distribution` | Dashboard analytics |
| GET | `/profile` · PATCH `/profile` | Instructor profile |
| GET | `/stats` · `/students` · `/students/stats` | Stats / students |

### Q&A — `/api/qa` (protect required)
| Method | Path | Description |
|---|---|---|
| GET | `/courses/:courseId?lectureId=&page=` | Get Q&A (paginated, optional lecture filter) |
| POST | `/courses/:courseId` | Create question `{ content, lectureId? }` |
| POST | `/:questionId/replies` | Create reply `{ content }` |
| PATCH | `/:id/resolve` | Toggle resolved status |
| DELETE | `/:id` | Soft delete (cascades replies nếu là root) |

### Notes — `/api/notes` (protect) — *NEW*
| Method | Path | Description |
|---|---|---|
| GET | `/lectures/:lectureId` | Notes của user cho 1 lecture |
| GET | `/courses/:courseId` | Notes của user cho cả course (export PDF) |
| POST | `/` | Create note `{ courseId, lectureId, timestamp, content, tags? }` |
| PATCH | `/:id` | Update note |
| DELETE | `/:id` | Soft delete |

### Badges — `/api/badges` — *NEW (gamification)*
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Badge catalog |
| GET | `/me` | protect+student | Earned/locked badges của student |

### Certificates — `/api/certificates` — *NEW*
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | protect | List certificates của user |
| POST | `/courses/:courseId/issue` | protect | Issue (hoặc lấy) certificate cho course đã hoàn thành |
| GET | `/:certId` | — | Verify certificate (public) |

> Certificate KHÔNG có model riêng — dữ liệu lưu trên `CourseProgress` (`certId`, `certIssuedAt`).

### Payouts — *NEW*
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/instructor/payouts` | protect+instructor | Instructor yêu cầu payout |
| GET | `/api/instructor/payouts` | protect+instructor | List payout của mình |
| GET | `/api/admin/payouts` | protect+admin | List tất cả payout |
| PATCH | `/api/admin/payouts/:id` | protect+admin | Update payout status |

### Cart — `/api/cart` (protect)
`GET /` · `POST /` (add) · `DELETE /:courseId` · `DELETE /` (clear) · `GET /count`

### Orders — `/api/orders` (protect)
`GET /` · `POST /` (từ cart) · `GET /:id` · `PATCH /:id/cancel` · `GET /stats`

### Payments — `/api/payments`
`POST /` (MoMo/VNPay) · `POST /momo/ipn` · `GET /momo/return` · `POST /vnpay/ipn` · `GET /vnpay/return`

### Coupons — `/api/coupons`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all coupons |
| POST | `/apply` | protect | Apply coupon |
| GET | `/refund/:courseId/status` | protect | Refund-coupon eligibility |
| POST | `/refund/:courseId/claim` | protect | Claim refund coupon |

### Notifications — `/api/notifications` (protect)
`GET /` · `DELETE /` (all) · `GET /count` · `PATCH /read` (all) · `GET /unread/count` · `PATCH /:id/read`

### User — `/api/user` (protect)
`POST /change-password` · `POST /deactivate` · `GET /avatar/upload`

### Other routes
| Prefix | Key Endpoints |
|---|---|
| `/api/wishlist` | GET/POST/DELETE wishlist, check, count |
| `/api/reviews` | POST/PATCH/DELETE review |
| `/api/categories` | GET all |
| `/api/videos` | GET upload URL, GET view URL |
| `/api/quizzes` | POST save quiz result |
| `/api/chatbot` | POST get response |
| `/api/internal` | POST notify (internal only, x-internal-key header) |

---

## Backend Admin — `backend_admin/` (port 5000)

**Không** dùng module pattern như `backend/`. Là **flat Express MVC**: `controllers/ routes/ models/ middlewares/`. Route đăng ký inline trong `backend_admin/server.js` (không có `modules/index.js`). Base path `/api`.

### Auth — `adminAuth` middleware
- JWT trong cookie **`adm_token`** (fallback `token`, hoặc `Authorization: Bearer`).
- Verify → load `Admin` by id → set `req.adminId`, `req.admin`.
- **Không có role/permission tiers** — có mặt trong collection `admins` = full admin. Model `Admin` chỉ có `name, email, password, verifyOtp, isVerified, isApproved` (không có field `role`).

### ⚠️ Route prefix không nhất quán
Convention là `/api/admin/*` nhưng **chỉ 3 module mới** tuân theo (`payouts`, `audit-logs`, `certificates`). Phần còn lại vẫn ở `/api/*` trần:

| Prefix | Endpoints chính |
|---|---|
| `/api/auth` | register, login, logout, is-auth, forgot/reset-password, verify-email |
| `/api/account` | PATCH change-password, GET profile |
| `/api/courses` | GET overview, GET `/:id`, GET `/:id/reviews`, POST `/:id/status`, DELETE `/:id`, PATCH `/:id/restore` `/unblock` `/approve` |
| `/api/category` | POST / GET / PUT `/:id` / DELETE `/:id` (lưu ý số ít) |
| `/api/dashboard` | dashboard-stats, earnings-chart, user-growth-chart, course-status-chart, top-courses-chart, monthly-enrollments-chart, order-status-chart, courses-by-category-chart, top-instructors-revenue-chart |
| `/api/earnings` | GET history, GET stats |
| `/api/instructors` | GET /, GET requests, GET `/:id/profile` `/stats` `/courses`, PATCH `/:id/block` `/unblock` `/approve`, DELETE `/:id/reject` |
| `/api/students` | GET /, PATCH `/:id/block` `/unblock`, DELETE `/:id` |
| `/api/coupons` | POST / GET / PATCH `/:id` / PUT `/:id/status` / DELETE `/:id` |
| `/api/videos` | GET `/:videoId` (signed admin view URL) |
| `/api/admin/payouts` | GET /, PATCH `/:id` |
| `/api/admin/audit-logs` | GET / |
| `/api/admin/certificates` | GET / |

> Khi thêm route admin mới: **dùng `/api/admin/<resource>`** (không dùng `/api/<resource>` trần).

---

## Frontend (main): Key Patterns

### 1. API calls — `frontend/src/utils/api.js`
```js
import { api, authApi } from "@/utils/api";
// api      → baseURL `${VITE_BACKEND_URL}/api`, KHÔNG withCredentials (public)
// authApi  → cùng baseURL + withCredentials: true (gửi cookie edv_token)
const { data } = await authApi.get("/student/profile");
const { data } = await api.get("/courses");
```
> Không có `baseURL` fallback — phụ thuộc hoàn toàn `VITE_BACKEND_URL`. Cookie name không khai báo ở frontend (backend set httpOnly cookie).

### 2. Auth state — Redux
```js
const { user, isAuthenticated } = useSelector(state => state.auth);
// user: { userId, name, email, role, avatar }
```
Slices thực tế: `authSlice`, `cartSlice`, `coursesSlice`, `wishlistSlice`. (Notifications/achievements/certificates dùng hook riêng, không có slice.)

### 3. Route params
- Student routes dùng `:courseId`; Instructor routes dùng `:id` (course ID).
- Video player: `/student/courses/:courseId/watch/:lectureId?` (lectureId optional).

### 4. URL-driven state
```js
const [searchParams, setSearchParams] = useSearchParams();
```

### 5. Toast — `react-toastify` · 6. Rich text — `react-quill-new`
```js
<div className="ql-editor p-0" dangerouslySetInnerHTML={{ __html: content }} />
```

### 7. Styling conventions
- **NEVER use `text-muted`** — dùng `text-body` thay thế.
- Instructor posts: `backgroundColor: "#F9F9D6"` (không dùng border color).
- Icons: `import { BsXxx } from "react-icons/bs"`, `import { FaXxx } from "react-icons/fa"`.

---

## Frontend (main): Routes Map — `frontend/src/routes/index.jsx`

### Public
| Path | Component |
|---|---|
| `/home` | HomePage |
| `/courses` · `/courses/:id` | CoursesPage · CourseDetails |
| `/instructors` | (renders NotFoundPage) |
| `/instructors/:id` | InstructorDetailsPage |
| `/student/become-instructor` | BecomeInstructorPage |
| `/certificates/:certId` | CertificateVerifyPage *(NEW, public verify)* |

### Auth
`/auth/sign-in` · `/auth/sign-up` · `/auth/forgot-password` · `/auth/reset-password`

### Student (protected, role=student)
| Path | Component | Note |
|---|---|---|
| `/student/dashboard` | StudentDashboard | |
| `/student/courses` | StudentMyCourses | |
| `/student/courses/:courseId` | LearningCourse | tabs: Course Material, Q&A |
| `/student/courses/:courseId/watch/:lectureId?` | VideoPlayer | player + playlist + notes + quiz overlay |
| `/student/courses/:courseId/result` | CourseResultPage | completion + skill radar |
| `/student/cart` · `/student/checkout` | CartDetails · Checkout | |
| `/student/payment-success` · `/student/payment-failed` | PaymentSuccess · PaymentFailed | |
| `/student/orders` · `/student/orders/:id` | OrderListPage · OrderDetailPage | |
| `/student/wishlist` | WishList | |
| `/student/profile` | StudentAccount | *(đổi từ `/student/account`)* |
| `/student/settings` | AccountSettingsPage | *(đổi từ `/accountSettings`)* |
| `/student/achievements` | AchievementsPage | *NEW (badges)* |
| `/student/certificates` | StudentCertificatesPage | *NEW* |

### Instructor (protected, role=instructor)
| Path | Component | Note |
|---|---|---|
| `/instructor/dashboard` | InstructorDashboard | |
| `/instructor/courses` | InstructorMyCourses | |
| `/instructor/courses/create` | CreateCoursePage | 4-step wizard (+ AI content) |
| `/instructor/courses/:id/edit` | EditCoursePage | |
| `/instructor/courses/:id` | InstructorCourseDetail | stats + Q&A + students |
| `/instructor/earnings` | InstructorEarnings | + payout history |
| `/instructor/profile` | InstructorProfile | |
| `/instructor/settings` | AccountSettingsPage | *NEW* |

> `/instructor/my-students` (InstructorMyStudents) — component còn tồn tại nhưng **route đã bị comment out**.

---

## Frontend Admin — `frontend_admin/`

- **React 19 + Vite 7**, JS/JSX. Redux Toolkit + redux-persist (`admin` slice giữ `isAuthenticated`). Bootstrap 5 + ApexCharts + react-hook-form/yup + exceljs + fuse.js.
- API helpers tập trung ở `src/helpers/data.js`; axios `withCredentials = true`; `VITE_BACKEND_URL=http://localhost:5000`.
- Cấu trúc `src/app/<feature>/page.jsx` + co-located `components/` + `use<Feature>.js`. `AdminProtectedRoute` + `AdminLayout` wrap tất cả route admin.

### Routes — `frontend_admin/src/routes/index.jsx`
| Path | Component |
|---|---|
| `/auth/sign-in` | Sign In (sign-up/forgot/reset đã comment out) |
| `/dashboard` | AdminDashboard |
| `/courses` · `/courses/:id` | AdminAllCourses · CourseDetails |
| `/categories` | AdminCategory |
| `/coupons` | AdminCoupons |
| `/students` | AdminStudents |
| `/instructors` · `/instructors/:id` | AdminInstructors · AdminInstructorDetail |
| `/instructor-requests` | AdminInstructorRequests |
| `/earnings` | AdminEarnings |
| `/payouts` | AdminPayouts |
| `/certificates` | AdminCertificates |
| `/audit-logs` | AdminAuditLogs |
| `/settings` | AdminSettings |

> ⚠️ Mismatch: frontend gọi `/api/category` (số ít) trong khi route FE là `/categories` (số nhiều).

---

## Database Models — Key Fields

Tất cả model có `{ timestamps: true }` trừ khi ghi chú. Enum lấy từ `#utils/enum.js`.

| Model | Key Fields | Notes |
|---|---|---|
| **User** | `name, email(unique), phonenumber, bio, website, socials{}, pfpImg, password(select:false), isVerified, isActivated, googleId, role` | **role ∈ `student\|instructor`** (KHÔNG có admin). Method: comparePassword, setOtp |
| **Course** | `title, subtitle, description, image, tags[], price, discountPrice, enableDiscount, language, level, duration, durationUnit, status, previousStatus, category(ref), subCategory, rating{count,total,stars}, instructor{ref→User,name,avatar}, pendingUpdate{data,submittedAt,status}, isPrivate(default true), isDeleted` | level: all/beginner/intermediate/advanced · status: draft/pending/live/blocked/rejected · virtual `curriculum` |
| **Curriculum** | `courseId(ref,unique), sections[{title, lectures[{title, videoId, duration, isFree, aiData}]}], pendingUpdate` | aiData: summary/lessonNotes/quizzes + status(none/processing/completed/failed) |
| **Instructor** | `user(ref,unique), stats{}, myCourses[ref→Course], introduction, address, occupation, skills[{name,level}], education[], bankAccounts[{bankName,accountNumber,accountName}], isApproved` | `bankAccounts` KHÔNG có trong mirror của backend_admin |
| **Student** | `user(ref,unique), stats{}, interests[]` | |
| **Enrollment** | `student(ref→User), course(ref), instructor(ref→Instructor), status, enrolledAt` | status: active/completed/refunded/**inactive** · unique {student,course} · *service-only module* |
| **Order** | `user(ref), courses[{course(ref),pricePaid}], subTotal, coupon(ref,nullable), discountAmount, totalAmount, paymentMethod, status, expiresAt` | paymentMethod: momo/vnpay/free · status: pending/completed/refunded/cancelled · TTL trên expiresAt (pending 1h) |
| **CourseProgress** | `user(ref), course(ref), totalLectures, completedLecturesCount, totalTimeSpentSec, lastLectureId, lastPositionSec, lectures[{lectureId,status,lastPositionSec,durationSec,totalTimeSpentSec,viewCount,completedAt,lastActivityAt}], isCompleted, certId(unique,sparse), certIssuedAt, aiAssessment{}` | lecture status: not_started/in_progress/completed · **certId/certIssuedAt = nơi lưu certificate** · module `learning/` |
| **QnA** | `courseId(ref), lectureId(String,nullable), author(ref→User), content(max 20000), parentId(ref→QnA,nullable), isInstructorPost, isResolved, isDeleted` | parentId null = question; non-null = reply |
| **Streak** | `user(ref,unique), currentStreak, longestStreak, lastActiveDate(YYYY-MM-DD), activeDates[], activityLog(Map<String,Number>)` | statics: registerActivity/getUserStreak/incrementDailyCount · *service-only* |
| **Notification** | `user(ref), type, message, isRead` | type: info/approved/succeeded/rejected/failed/blocked |
| **Review** | `course(ref), user(ref), rating(0-5), description(max 1000), isDeleted` | unique partial {course,user} where isDeleted:false |
| **Transaction** | `orderId(ref), userId(ref), gateway, transactionId(unique), amount, status, rawResponse` | gateway: momo/vnpay · status: success/failed |
| **Coupon** | `code(unique,uppercase), discountType, discountValue, description, startDate, expiryDate, isActive, courseId(ref), refundees[ref→User], usersUsed[ref→User]` | discountType: percent/money |
| **Badge** | `key(unique), name, description, icon, category, rarity, condition{type,threshold}, isActive, sortOrder` | category: streak/completion/performance · rarity: common/rare/epic/legendary · *NEW* |
| **UserBadge** | `user(ref), badge(ref→Badge), earnedAt, triggerEvent, triggerValue` | **no timestamps** · unique {user,badge} · *NEW* |
| **Note** | `userId(ref), courseId(ref), lectureId(String), timestamp(Number, video pos), content(max 5000), tags[], isDeleted` | *NEW* |
| **Payout** | `instructor(ref→User), amount, bankInfo{bankName,accountNumber,accountName}, status, adminNote, periodLabel, processedAt, isDeleted` | status: pending/paid/rejected · *NEW* |
| **Cart** | `user(ref,unique), courses[{course(ref),addedAt}]` | |
| **Category** | `name(unique), slug(auto)` | |
| **Wishlist** | `user(ref), course(ref)` | unique {user,course} |
| **QuizProgress** | `user(ref), course(ref), quizzes[{lectureId,score,totalQuestions,wrongAnswers[{question,topic}]}]` | unique {user,course} |
| **DraftVideo** | `videoId, userId(ref), courseId(ref), key, contentType` | contentType: video/mp4\|webm\|ogg |
| **RecommendationModel** | `kind(unique), payload(Mixed), stats, builtAt` | artifact recommender precomputed (item-item-jaccard) |

### Backend Admin-only models (`backend_admin/models`)
| Model | Key Fields | Notes |
|---|---|---|
| **Admin** | `name, email(unique), password, verifyOtp, verifyOtpExpireAt, isVerified, isApproved` | KHÔNG có `role`; collection tách biệt khỏi User |
| **AuditLog** | `adminId(ref→Admin), adminName, adminEmail, action, entityType, entityId, entityLabel, before(Mixed), after(Mixed), reason, success, failReason, ipAddress, userAgent` | versionKey:false |

> Các model khác trong `backend_admin/models` là **mirror** của backend chính (cùng tên model/collection để ref resolve trên DB chung). `Instructor` mirror thiếu `bankAccounts`; `CourseProgress` mirror là minimal (`strict:false`, chỉ user/course/isCompleted/certId/certIssuedAt).

---

## Key File Locations

### Backend (main)
```
backend/src/middlewares/auth.middleware.js     # protect, restrictTo, checkAuth
backend/src/shared/utils/response.js           # sendSuccessResponse, sendPaginatedResponse
backend/src/shared/utils/pagination.js         # getPaginationOptions, pageSchema, limitSchema
backend/src/shared/utils/enum.js               # tất cả enum tập trung
backend/src/shared/utils/asyncHandler.js       # asyncHandler wrapper
backend/src/shared/exceptions/app.error.js     # AppError class
backend/src/shared/services/s3.service.js      # S3 upload/signed URLs
backend/src/shared/services/mail.service.js    # Email sending
backend/src/modules/index.js                   # Route registration (apiRouter)
```

### Backend Admin
```
backend_admin/server.js                        # Entry + đăng ký route inline (port 5000)
backend_admin/middlewares/adminAuth.js         # adm_token cookie auth
backend_admin/models/adminModel.js             # Admin model
backend_admin/models/auditLogModel.js          # AuditLog model
```

### Frontend (main)
```
frontend/src/utils/api.js                      # axios: api (public), authApi (authenticated)
frontend/src/routes/index.jsx                  # All route definitions
frontend/src/routes/router.jsx                 # AppRouter component (ProtectedRoute + RoleBasedLayout)
frontend/src/redux/store.js                    # Redux store
frontend/src/redux/authSlice.js                # Auth state (user, isAuthenticated)
frontend/src/app/student/learning/hooks/useQna.js   # Q&A hook (reusable)
frontend/src/app/pages/course/video-player/        # player + notes + quiz overlay + tracking
```

### Frontend Admin
```
frontend_admin/src/helpers/data.js             # API helper functions tập trung
frontend_admin/src/routes/index.jsx            # Admin route definitions
frontend_admin/src/App.jsx                     # axios withCredentials, providers
```

---

## Important Conventions & Gotchas

1. **2 backend tách biệt**: `backend` (student/instructor, port 5001, cookie `edv_token`) và `backend_admin` (admin, port 5000, cookie `adm_token`). Admin là collection `Admin` riêng — **không phải `User.role`**.

2. **Admin route prefix**: route admin mới phải mount ở `/api/admin/<resource>`. (Legacy còn nhiều route ở `/api/*` trần — đừng bắt chước.)

3. **Instructor routes split**: public = `/api/instructors`, private = `/api/instructor` (singular). Cả hai export từ `instructor.route.js` với `{ publicRoutes, privateRoutes }`.

4. **Curriculum endpoint restriction**: `GET /api/courses/:id/curriculum` chỉ hoạt động với live course. Instructor lấy curriculum mọi status qua `GET /api/instructor/courses/:courseId` → `data.result.curriculum.sections`.

5. **courseId vs id**: Student routes dùng `:courseId`, Instructor routes dùng `:id`. Hook `useQna` nhận `courseId` prop để override.

6. **Cookie auth**: JWT httpOnly cookie — `edv_token` (main), `adm_token` (admin). Frontend dùng `withCredentials: true`.

7. **Soft delete**: Không hard delete. Set `isDeleted: true`, query kèm `isDeleted: false`.

8. **DTO Mapper pattern**: Service trả Mongoose docs, controller gọi mapper transform sang DTO. Mapper nhận `currentUserId` để compute `isMyPost`.

9. **Q&A 1-level depth**: Reply chỉ reply vào root question (parentId === null). Backend validate.

10. **`isInstructorPost` flag**: Set at write-time bằng `course.instructor.ref.toString() === userId`.

11. **Certificate không có model riêng**: lưu trên `CourseProgress` (`certId` unique sparse + `certIssuedAt`). Verify public qua `GET /api/certificates/:certId`.

12. **Service-only modules**: `streak, enrollment, checkout, learning, chart, image` không mount route — gọi như service từ module khác.
