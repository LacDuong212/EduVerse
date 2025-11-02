# 🎓 EDUVERSE  
### NỀN TẢNG KHÓA HỌC TRỰC TUYẾN ỨNG DỤNG AI  
*(Phát triển bằng công nghệ MERN Stack)*  

---

## 🧭 Giới thiệu đề tài  

Trong bối cảnh giáo dục trực tuyến ngày càng phát triển, nhu cầu xây dựng các nền tảng học tập thông minh, dễ sử dụng và có khả năng cá nhân hóa trải nghiệm học tập trở nên cấp thiết.  

**EduVerse** được phát triển với mục tiêu tạo ra một **nền tảng học trực tuyến thông minh** giúp người học và giảng viên có thể tương tác, chia sẻ và học tập hiệu quả thông qua các tính năng hiện đại và sự hỗ trợ từ **Trí tuệ nhân tạo (AI)**.  

---

## 🎯 Mục tiêu dự án  

- Xây dựng hệ thống học trực tuyến hoàn chỉnh, hỗ trợ ba nhóm người dùng: học viên, giảng viên và quản trị viên.  
- Ứng dụng **AI** để gợi ý khóa học, đánh giá tiến độ học và cá nhân hóa trải nghiệm học tập.  
- Phát triển bằng **MERN Stack** (MongoDB, ExpressJS, ReactJS, NodeJS) nhằm đảm bảo hiệu năng, dễ mở rộng và dễ bảo trì.  
- Thiết kế giao diện trực quan, thân thiện, có khả năng hoạt động trên nhiều thiết bị.  

---

## 🔧 Công nghệ sử dụng  

| Công nghệ | Mô tả |
|------------|--------|
| **ReactJS** | Xây dựng giao diện người dùng (frontend) |
| **NodeJS + ExpressJS** | Xử lý logic và xây dựng RESTful API |
| **MongoDB** | Lưu trữ dữ liệu người dùng, khóa học, tiến trình học |
| **JWT (JSON Web Token)** | Xác thực và phân quyền người dùng |
| **Cloudinary API** | Lưu trữ hình ảnh và video học liệu |
| **Bootstrap 5** | Xây dựng giao diện thân thiện, hiện đại |
| **AI/ML (Machine Learning)** | Gợi ý khóa học và phân tích hành vi học tập |

---

## 🧩 Tính năng chính  

### 👨‍🎓 Học viên  
- Đăng ký, đăng nhập, chỉnh sửa hồ sơ cá nhân  
- Xem danh sách khóa học và nội dung chi tiết  
- Theo dõi tiến độ và kết quả học tập  
- Nhận gợi ý khóa học phù hợp bằng AI  

### 👩‍🏫 Giảng viên  
- Tạo mới và quản lý khóa học của mình  
- Cập nhật nội dung bài giảng, video và tài liệu học  
- Theo dõi số lượng học viên và mức độ hoàn thành  

### 🛠️ Quản trị viên  
- Quản lý người dùng (giảng viên, học viên)  
- Duyệt, chỉnh sửa hoặc xóa khóa học  
- Theo dõi hoạt động hệ thống và thống kê dữ liệu  

---

## ⚙️ Cấu trúc dự án  

```bash
EduVerse/
├── backend/
│   ├── configs/             # Cấu hình hệ thống (database, cloud, v.v.)
│   ├── controllers/         # Xử lý logic cho từng module
│   ├── middlewares/         # Middleware (xác thực, xử lý lỗi, v.v.)
│   ├── models/              # Các mô hình dữ liệu Mongoose
│   ├── routes/              # Định nghĩa các API endpoint
│   ├── utils/               # Các hàm tiện ích dùng chung
│   ├── tmp/                 # Lưu trữ tạm (nếu có)
│   ├── .env.example         # Mẫu cấu hình môi trường
│   ├── server.js            # Điểm khởi chạy backend
│   └── package.json
│
├── frontend/
│   ├── public/              # File tĩnh (favicon, hình ảnh, v.v.)
│   ├── src/
│   │   ├── app/             # Các trang chức năng phân theo vai trò
│   │   ├── assets/          # Ảnh, video, font, data tĩnh
│   │   ├── components/      # Component giao diện tái sử dụng
│   │   ├── context/         # React Context API
│   │   ├── helpers/         # Hàm xử lý logic frontend
│   │   ├── hooks/           # Custom hooks
│   │   ├── layouts/         # Layouts chính (Admin, Student, Instructor, Guest)
│   │   ├── redux/           # Slice + reducer
│   │   ├── routes/          # Định tuyến trang (React Router)
│   │   ├── utils/           # Hàm tiện ích frontend
│   │   ├── App.jsx          # Component gốc
│   │   └── main.jsx         # Entry point của ứng dụng
│   ├── vite.config.js       # Cấu hình Vite
│   └── package.json
│
├── .gitignore
├── README.md
└── package-lock.json
```

---

## 🧠 Ứng dụng AI trong hệ thống  

EduVerse ứng dụng các kỹ thuật **Machine Learning** để:  
- Phân tích hành vi học tập của người dùng  
- Gợi ý các khóa học phù hợp theo sở thích và năng lực  
- Theo dõi tiến độ học tập và đề xuất lộ trình học tối ưu  

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
cd frontend && npm install
```

### 3️⃣ Cấu hình biến môi trường  

#### 📁 Trong thư mục `backend/`  

```bash
MONGODB_URI = 'your_mongodb_connection'
JWT_SECRET = 'your_secret_key'
NODE_ENV = 'development'

EMAIL_USER = 'your@mail.com'
EMAIL_PASS = 'your_app_password'

CLOUDINARY_CLOUD_NAME = 'your_cloud_name'
CLOUDINARY_API_KEY = 'your_api_key'
CLOUDINARY_API_SECRET = 'your_api_secret'

VNP_TMNCODE = 'xxxxxxxx'
VNP_HASHSECRET = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
VNP_RETURNURL =  'http://your_host:your_port/your_path/vnpay_return'
VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'

MOMO_PARTNER_CODE = 'xxxx'
MOMO_ACCESS_KEY = 'xxxxxxxxxxxxxx'
MOMO_SECRET_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
MOMO_API_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/create'
MOMO_REDIRECT_URL = 'http://your_host:your_port/your_path/momo_return'
MOMO_IPN_URL = 'http://your_host:your_port/your_path/momo_ipn'

PROJECT_ID = 'project_id'
KEY_FILENAME = 'key-filename.json'

FRONTEND_URL = 'your_frontend_url'
```

#### 📁 Trong thư mục `frontend/`  

```bash
VITE_BACKEND_URL = 'your_backend_url'
VITE_CURRENCY = '₫'
```

---

## 🚀 Chạy ứng dụng  

### Chạy backend  

```bash
cd backend
npm run server
```

### Chạy frontend  

```bash
cd frontend
npm run dev
```

Ứng dụng sẽ chạy tại:  
👉 **Frontend:** http://localhost:5173  
👉 **Backend API:** http://localhost:5000  

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
Dự án thể hiện khả năng ứng dụng công nghệ hiện đại vào giáo dục, đồng thời là minh chứng cho việc sử dụng hiệu quả **MERN Stack** trong phát triển hệ thống web toàn diện.  

---

## 📄 Giấy phép  

Dự án được phát hành theo giấy phép [MIT License](LICENSE).

---

✨ *Developed with ❤️ by d2v-team*
