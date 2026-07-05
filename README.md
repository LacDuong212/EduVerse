# 🎓 EDUVERSE
### NỀN TẢNG KHÓA HỌC TRỰC TUYẾN ỨNG DỤNG AI
*(Phát triển bằng MERN Stack + Microservice ML)*

---

## 🧭 Giới thiệu đề tài

Trong bối cảnh giáo dục trực tuyến ngày càng phát triển, nhu cầu xây dựng các nền tảng học tập thông minh, dễ sử dụng và có khả năng cá nhân hóa trải nghiệm học tập trở nên cấp thiết.

**EduVerse** được phát triển với mục tiêu tạo ra một **nền tảng học trực tuyến thông minh** giúp người học và giảng viên có thể tương tác, chia sẻ và học tập hiệu quả thông qua các tính năng hiện đại và sự hỗ trợ từ **Trí tuệ nhân tạo (AI)**.

---

## 🎯 Mục tiêu dự án

- Xây dựng hệ thống học trực tuyến hoàn chỉnh, hỗ trợ ba nhóm người dùng: **học viên**, **giảng viên** và **quản trị viên**.
- Ứng dụng **AI** để gợi ý khóa học, tạo nội dung bài giảng, đánh giá năng lực (skill radar) và cá nhân hóa trải nghiệm học tập.
- Phát triển trên nền **MERN Stack** kết hợp **microservice ML (Python/FastAPI)** nhằm đảm bảo hiệu năng, dễ mở rộng và dễ bảo trì.
- Thiết kế giao diện trực quan, thân thiện, responsive trên nhiều thiết bị.

---

## 🏛️ Kiến trúc hệ thống

EduVerse gồm **5 service tách biệt** dùng chung một MongoDB database:

| Service | Vai trò | Công nghệ | Port (dev) |
|---|---|---|---|
| `backend/` | API chính cho học viên + giảng viên + public | Node.js + Express (module MVC) | **5001** |
| `backend_admin/` | API riêng cho quản trị viên (duyệt, thống kê, payout, audit log) | Node.js + Express (flat MVC) | **5000** |
| `frontend/` | Web app chính (học viên + giảng viên + public) | React 19 + Vite | **5173** |
| `frontend_admin/` | Web app riêng cho quản trị viên | React 19 + Vite 7 | **5174** |
| `ml_service/` | Microservice gợi ý khóa học & phân tích | Python + FastAPI | **5002** |

> 🔑 **Xác thực tách biệt:** backend chính dùng JWT trong cookie `edv_token`; backend admin dùng cookie `adm_token`. **Admin là một collection riêng (`Admin`)** — không phải một `role` của `User` (User chỉ có `student | instructor`).

---

## 🔧 Công nghệ sử dụng

| Layer | Công nghệ |
|---|---|
| **Frontend** | ReactJS (Vite), React Router v6, Redux Toolkit, React Context, React Bootstrap (Bootstrap 5) |
| **Backend** | Node.js + ExpressJS (ES Modules), Mongoose, Zod (validation), Socket.IO (realtime) |
| **Database** | MongoDB |
| **Auth** | JWT trong httpOnly cookie · Google OAuth 2.0 |
| **Lưu trữ** | AWS S3 (video, signed URL) · Cloudinary (hình ảnh) |
| **Thanh toán** | MoMo · VNPay (webhook/IPN) |
| **AI/ML** | Google Gemini (sinh nội dung bài giảng, assessment, chatbot) · FastAPI ML service (recommendation, skill radar) |
| **Rich text / Charts** | react-quill-new · ApexCharts (admin) |

---

## 🧩 Tính năng chính

### 👨‍🎓 Học viên
- Đăng ký / đăng nhập (email + OTP, Google OAuth), quản lý hồ sơ, đổi mật khẩu, vô hiệu hóa tài khoản
- Duyệt & tìm kiếm khóa học, xem chi tiết, đánh giá (review)
- Giỏ hàng, wishlist, mã giảm giá (coupon), thanh toán MoMo/VNPay, lịch sử đơn hàng
- Học tập: trình phát video, theo dõi tiến độ, ghi chú (notes) theo mốc thời gian, quiz
- Q&A theo khóa học / bài giảng, chatbot AI hỗ trợ
- Gợi ý khóa học bằng AI, skill radar, chuỗi ngày học (streak), huy hiệu (badges) và chứng chỉ (certificate) khi hoàn thành

### 👩‍🏫 Giảng viên
- Đăng ký trở thành giảng viên, quản lý hồ sơ (kỹ năng, học vấn, tài khoản ngân hàng)
- Tạo/sửa khóa học qua wizard nhiều bước, quản lý curriculum (section/lecture/video)
- Sinh nội dung bài giảng bằng AI (tóm tắt, ghi chú, quiz)
- Dashboard: doanh thu, số lượng ghi danh, phân bố tiến độ học viên
- Xem earnings & yêu cầu rút tiền (payout), theo dõi Q&A và học viên

### 🛠️ Quản trị viên (frontend_admin + backend_admin)
- Dashboard thống kê (doanh thu, tăng trưởng người dùng, trạng thái khóa học…)
- Quản lý học viên & giảng viên (block/unblock), duyệt yêu cầu làm giảng viên
- Duyệt / chặn / khôi phục khóa học, quản lý danh mục & coupon
- Quản lý payout, chứng chỉ, và audit log (nhật ký thao tác admin)

---

## ⚙️ Cấu trúc dự án

```bash
EduVerse/
├── backend/                    # API chính — Node.js + Express, port 5001
│   └── src/
│       ├── modules/            # Feature modules theo MVC (auth, course, order, payment, qa,
│       │                       #   badge, certificate, payout, note, streak, ...)
│       │   └── <name>/         #   <name>.{model,validation,service,controller,route,mapper}.js
│       ├── middlewares/        # auth, error handler, zod validator, logger
│       ├── shared/
│       │   ├── utils/          # asyncHandler, response, pagination, enum, scheduler
│       │   ├── services/       # ai (Gemini), cron, mail, recommendation, s3
│       │   ├── constants/ · exceptions/  (AppError)
│       └── app.js · server.js  # Socket.IO + cron + seed badges
│
├── backend_admin/              # API admin — Node.js + Express (flat MVC), port 5000
│   ├── controllers/ routes/ models/ middlewares/ configs/ validations/ utils/
│   └── server.js               # Đăng ký route inline (cookie adm_token)
│
├── frontend/                   # Web app chính — React 19 + Vite 7, port 5173
│   └── src/
│       ├── app/                # Trang chức năng theo vai trò
│       │   ├── auth/ pages/ student/ instructor/ shop/ chatbot/
│       ├── components/ layouts/ routes/ redux/ contexts/ hooks/ utils/ configs/
│
├── frontend_admin/             # Web app admin — React 19 + Vite 7, port 5174
│   └── src/ (app/ routes/ helpers/ redux/ ...)
│
├── ml_service/                 # Microservice ML — Python + FastAPI, port 5002
│   ├── app.py engine.py db.py model/ requirements.txt
│
├── ROADMAP.md · README.md
└── package-lock.json
```

---

## 🧠 Ứng dụng AI trong hệ thống

- **Gợi ý khóa học**: microservice `ml_service` (FastAPI) tính toán recommendation lai (collaborative filtering + BERT semantic + popularity gating).
- **Sinh nội dung bài giảng**: Google Gemini tạo tóm tắt, key concepts, quiz cho từng lecture.
- **Đánh giá năng lực**: skill radar & AI final assessment cho học viên sau khi hoàn thành khóa.
- **Chatbot AI**: hỗ trợ người học trực tiếp trên giao diện.

---

## 🧰 Cài đặt và chạy thử

### 1️⃣ Clone dự án
```bash
git clone https://github.com/LacDuong212/EduVerse.git
cd EduVerse
```

### 2️⃣ Cài đặt dependencies
```bash
cd backend && npm install
cd ../backend_admin && npm install
cd ../frontend && npm install
cd ../frontend_admin && npm install
cd ../ml_service && pip install -r requirements.txt
```

### 3️⃣ Cấu hình biến môi trường

#### 📁 `backend/.env` (tham khảo `backend/.env.example`)
```bash
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
JWT_EXPIRATION=7d
SESSION_SECRET=... · MONGO_SESSION_SECRET=...
BASE_URL=http://localhost:5001
CLIENT_URL=http://localhost:5173

# Email (OTP)
EMAIL_USER=your@mail.com · EMAIL_PASS=your_app_password · MAIL_FROM=...

# Google OAuth
GOOGLE_CLIENT_ID=... · GOOGLE_CLIENT_SECRET=...

# AWS S3 (video)
AWS_ACCESS_KEY=... · AWS_SECRET_KEY=... · AWS_REGION=... · AWS_S3_BUCKET=...

# Cloudinary (ảnh)
CLOUDINARY_CLOUD_NAME=... · CLOUDINARY_API_KEY=... · CLOUDINARY_API_SECRET=...

# AI (Google Gemini)
GEMINI_API_KEY=... · PROJECT_ID=... · KEY_FILENAME=key-filename.json

# Thanh toán
VNP_TMNCODE=... · VNP_HASHSECRET=... · VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
MOMO_PARTNER_CODE=... · MOMO_ACCESS_KEY=... · MOMO_SECRET_KEY=... · MOMO_API_ENDPOINT=...
```

#### 📁 `backend_admin/.env`
```bash
PORT=5000
MONGODB_URI=your_mongodb_connection   # cùng DB với backend
JWT_SECRET=your_secret_key
EDV_SERVER=http://localhost:5001      # trỏ về backend chính
INTERNAL_API_KEY=your_internal_key
CLIENT_URL=http://localhost:5174
```

#### 📁 `frontend/.env` và `frontend_admin/.env`
```bash
# frontend/
VITE_BACKEND_URL=http://localhost:5001
VITE_CURRENCY=₫

# frontend_admin/
VITE_BACKEND_URL=http://localhost:5000
```

#### 📁 `ml_service/.env`
```bash
ML_PORT=5002
MONGODB_URI=your_mongodb_connection
```

---

## 🚀 Chạy ứng dụng

```bash
# 1. Backend chính (http://localhost:5001)
cd backend && npm run server

# 2. Backend admin (http://localhost:5000)
cd backend_admin && npm run server

# 3. Frontend chính (http://localhost:5173)
cd frontend && npm run dev

# 4. Frontend admin (http://localhost:5174)
cd frontend_admin && npm run dev

# 5. ML service (http://localhost:5002)
cd ml_service && python app.py
```

| Service | URL |
|---|---|
| 👉 Frontend (chính) | http://localhost:5173 |
| 👉 Frontend (admin) | http://localhost:5174 |
| 👉 Backend API (chính) | http://localhost:5001/api |
| 👉 Backend API (admin) | http://localhost:5000/api |
| 👉 ML service | http://localhost:5002 |

---

## 🧑‍💻 Nhóm phát triển

| Thành viên | MSSV | GitHub |
|-------------|-------|--------|
| **Hoàng Thị Thùy Dương** | 22110303 | [httdjuly](https://github.com/httdjuly) |
| **Võ Nguyễn Hòa Lạc Dương** | 22110304 | [LacDuong212](https://github.com/LacDuong212) |
| **Trần Triệu Vĩ** | 22110459 | [Vi021](https://github.com/Vi021) |

---

## 🧭 Phương pháp phát triển

Dự án được xây dựng theo **mô hình Waterfall (thác nước)** gồm các giai đoạn:
1. **Phân tích yêu cầu** – Thu thập, xác định yêu cầu chức năng và phi chức năng.
2. **Thiết kế hệ thống** – Xây dựng mô hình cơ sở dữ liệu, kiến trúc hệ thống và luồng xử lý.
3. **Triển khai & Lập trình** – Xây dựng frontend, backend và tích hợp AI.
4. **Kiểm thử** – Đảm bảo hệ thống hoạt động đúng yêu cầu.
5. **Triển khai & Bảo trì** – Đưa hệ thống vào hoạt động và tối ưu định kỳ.

---

## 🏆 Kết luận

**EduVerse** là nền tảng học trực tuyến hướng đến sự **thông minh, thân thiện và cá nhân hóa**, tận dụng **AI** để nâng cao trải nghiệm học tập của người dùng.
Dự án thể hiện khả năng ứng dụng công nghệ hiện đại vào giáo dục, đồng thời là minh chứng cho việc sử dụng hiệu quả **MERN Stack** kết hợp microservice trong phát triển hệ thống web toàn diện.

---

## 📄 Giấy phép

Dự án được phát hành theo giấy phép [MIT License](LICENSE).

---

✨ *Developed with ❤️ by @d2v-team*
