# BÁO CÁO TỔNG HỢP DỰ ÁN EDUVERSE

## Nền tảng học trực tuyến tích hợp AI

---

## 1. TỔNG QUAN DỰ ÁN

**EduVerse** là nền tảng học trực tuyến (E-Learning) xây dựng theo mô hình MERN Stack, tích hợp trí tuệ nhân tạo (AI) nhằm **cá nhân hóa trải nghiệm học tập** và **tự động hóa quy trình tạo nội dung** cho giảng viên.

### Tech Stack

| Tầng | Công nghệ |
|------|-----------|
| Frontend | React + Vite, Redux, React Router, Socket.IO |
| Backend | Node.js + Express.js, MongoDB (Mongoose) |
| AI/ML | Python FastAPI, scikit-learn, Google Gemini 2.5 Flash, Google Dialogflow |
| Cloud | AWS S3 (video), Cloudinary (ảnh) |
| Thanh toán | VNPay, MoMo, Stripe |
| Xác thực | JWT, Google OAuth 2.0, Passport.js |
| Realtime | Socket.IO (thông báo) |

---

## 2. CHỨC NĂNG HỖ TRỢ CỦA HỆ THỐNG

### 2.1. Quản lý người dùng & Xác thực
- Đăng ký / Đăng nhập bằng email hoặc Google OAuth
- Phân quyền 3 vai trò: **Student**, **Instructor**, **Admin**
- Đặt lại mật khẩu, xác minh email

### 2.2. Quản lý khóa học (Instructor)
- Tạo, chỉnh sửa, xuất bản khóa học
- Upload video bài giảng lên AWS S3
- Quản lý chương trình giảng dạy (curriculum): section → lesson
- Tạo quiz cho từng bài giảng
- Xem đánh giá từ học viên

### 2.3. Học tập (Student)
- Duyệt, tìm kiếm, lọc khóa học theo danh mục
- Xem chi tiết khóa học, đánh giá, giảng viên
- Theo dõi tiến độ học tập (learning progress)
- Hoàn thành quiz, nhận đánh giá cá nhân
- Streak học tập hàng ngày (gamification)
- Wishlist lưu khóa học yêu thích

### 2.4. Thương mại điện tử
- Giỏ hàng (thêm/xóa khóa học)
- Mã giảm giá (coupon)
- Thanh toán đa kênh: VNPay, MoMo (Việt Nam), Stripe (quốc tế)
- Quản lý đơn hàng: pending → completed / cancelled
- Tự động ghi danh sau thanh toán thành công

### 2.5. Quản trị (Admin)
- Dashboard thống kê doanh thu, lượng người dùng
- Quản lý người dùng (ban/approve)
- Kiểm duyệt khóa học
- Quản lý danh mục, coupon

### 2.6. Thông báo realtime
- Socket.IO push notification khi có khóa học mới, thay đổi giá, đơn hàng hoàn tất

---

## 3. ỨNG DỤNG AI TRONG DỰ ÁN

### 3.1. Hệ thống gợi ý khóa học (Course Recommendation) — AI/ML

| Thuộc tính | Chi tiết |
|------------|----------|
| **Mô hình** | Hybrid: BERT Embeddings + TF-IDF + K-Means Clustering + Collaborative Filtering |
| **Công nghệ** | Python FastAPI (microservice), scikit-learn, sentence-transformers |
| **Mục đích** | Gợi ý khóa học phù hợp nhất cho từng học viên dựa trên lịch sử học, đánh giá, sở thích |

**Cách hoạt động:**

```
Dữ liệu đầu vào (User Profile):
├── Khóa học đã hoàn thành (trọng số cao nhất: 3×)
├── Khóa học đang học (2×)
├── Wishlist (1×)
├── Sở thích/tags (1×)
└── Điểm đánh giá (nhân hệ số theo rating)

Thuật toán Hybrid (4 tín hiệu có trọng số):
├── Cluster (BERT embeddings) — 25%  → Nhóm khóa học tương tự về ngữ nghĩa
├── Content (TF-IDF) — 35%          → Khớp từ khóa chính xác
├── Collaborative Filtering — 30%    → Người học giống bạn cũng thích gì
└── Popularity — 10%                 → Độ phổ biến (lượt mua, đánh giá)

Kết quả: Top-K khóa học xếp hạng theo điểm tổng hợp
```

**Tại sao kết hợp BERT + TF-IDF?**
- BERT: Phân cụm ngữ nghĩa tốt (Silhouette Score: 0.1243 — gấp 2× so với TF-IDF thuần)
- TF-IDF: Khớp từ khóa chính xác hơn (NDCG@5: 0.8265 — cao hơn BERT 6%)
- Kết hợp: Vừa hiểu ý nghĩa, vừa chính xác từ khóa

**Fallback:** Khi Python service không khả dụng → Node.js BM25 + Jaccard (đảm bảo hệ thống luôn có gợi ý)

---

### 3.2. Phân tích video tự động (AI Video Analysis) — Generative AI

| Thuộc tính | Chi tiết |
|------------|----------|
| **Mô hình** | Google Gemini 2.5 Flash (multimodal: vision + speech) |
| **Mục đích** | Tự động trích xuất nội dung từ video bài giảng, giảm tải công việc cho giảng viên |

**Khi nào kích hoạt:** Instructor xuất bản (publish) một bài giảng video

**AI trích xuất được gì từ video:**

| Đầu ra | Mô tả |
|--------|--------|
| **Tóm tắt** | 2-3 câu tổng quan nội dung bài giảng |
| **Key Concepts** | 3-5 thuật ngữ kỹ thuật kèm định nghĩa 1 câu |
| **Main Points** | 3-5 ý chính, bước logic, luồng xử lý |
| **Practical Tips** | 1-2 mẹo ứng dụng thực tế hoặc lỗi thường gặp |
| **Auto Quiz** | 5 câu hỏi trắc nghiệm (4 đáp án, đáp án đúng, giải thích, topic label) |

**Pipeline xử lý:**
```
Video upload (S3) → Download → Upload Gemini API → Phân tích → JSON có cấu trúc → Lưu vào curriculum
```

**Giá trị mang lại:**
- Giảng viên không cần tự viết tóm tắt, quiz thủ công
- Học viên có tài liệu tham khảo tự động ngay khi bài giảng được xuất bản
- Quiz tự động giúp kiểm tra hiểu bài ngay lập tức

---

### 3.3. Đánh giá học tập cá nhân (AI Assessment) — Generative AI

| Thuộc tính | Chi tiết |
|------------|----------|
| **Mô hình** | Google Gemini 2.5 Flash |
| **Mục đích** | Đánh giá điểm mạnh/yếu của học viên sau khi hoàn thành khóa học |

**Khi nào kích hoạt:** Student hoàn thành toàn bộ khóa học

**AI phân tích:**
- Kết quả quiz theo từng lecture (điểm đạt/không đạt theo topic)
- Xác định **Strengths** (topic đạt 100%) và **Weaknesses** (topic sai nhiều)
- Đưa ra **Recommendations** cá nhân hóa (gợi ý chủ đề nên ôn lại, hướng nâng cao)

**Giá trị:** Mỗi học viên nhận phản hồi riêng biệt — không phải đánh giá chung chung.

---

### 3.4. Chatbot thông minh (AI Chatbot) — NLU

| Thuộc tính | Chi tiết |
|------------|----------|
| **Mô hình** | Google Dialogflow (Natural Language Understanding) |
| **Mục đích** | Hỗ trợ học viên tương tác tự nhiên bằng ngôn ngữ, điều hướng, tìm kiếm khóa học |

**Các intent hỗ trợ:**

| Intent | Chức năng | Ví dụ |
|--------|-----------|-------|
| COURSE_SEARCH | Tìm khóa học theo keyword/category | "Tôi muốn học DevOps" |
| PAGE_NAVIGATION | Điều hướng đến trang phù hợp theo vai trò | "Đưa tôi đến dashboard" |
| LEARNING_PROGRESS | Tra cứu tiến độ, tiếp tục bài học cuối | "Tôi đang học đến đâu?" |

**Đặc điểm:**
- Song ngữ: Tiếng Anh & Tiếng Việt
- Nhận biết vai trò: Student / Instructor / Guest → phản hồi khác nhau
- Duy trì ngữ cảnh hội thoại (session-based)

---

## 4. KIẾN TRÚC TỔNG QUAN

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                    │
│   Student App (:5173)          Admin App (:5174)                 │
└──────────────────────┬───────────────────────────────────────────┘
                       │ REST API + Socket.IO
┌──────────────────────▼───────────────────────────────────────────┐
│                   BACKEND (Node.js + Express :5000)               │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │  Auth   │  │  Course  │  │ Payment  │  │   Chatbot       │  │
│  │  User   │  │  Video   │  │  Order   │  │  (Dialogflow)   │  │
│  │ Student │  │Curriculum│  │  Cart    │  │                 │  │
│  │Instructor│ │  Quiz    │  │ Coupon   │  │  Notification   │  │
│  └─────────┘  └──────────┘  └──────────┘  └─────────────────┘  │
│                       │                                          │
│         ┌─────────────┼─────────────┐                           │
│         ▼             ▼             ▼                           │
│  ┌───────────┐ ┌───────────┐ ┌───────────────┐                 │
│  │  MongoDB  │ │  AWS S3   │ │ Google Gemini │                 │
│  │  (Atlas)  │ │  (Video)  │ │ (Video AI +   │                 │
│  └───────────┘ └───────────┘ │  Assessment)  │                 │
│                               └───────────────┘                 │
└──────────────────────┬───────────────────────────────────────────┘
                       │ HTTP (port 5002)
┌──────────────────────▼───────────────────────────────────────────┐
│              ML SERVICE (Python FastAPI :5002)                    │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  BERT Embeddings + TF-IDF + K-Means + Jaccard CF        │     │
│  │  → Hybrid Recommendation Engine                         │     │
│  └─────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. TÓM TẮT AI TRONG EDUVERSE

| # | Tính năng AI | Công nghệ | Mục đích chính |
|---|-------------|-----------|----------------|
| 1 | Gợi ý khóa học | BERT + TF-IDF + K-Means + CF (Python) | Cá nhân hóa lộ trình học tập |
| 2 | Phân tích video | Google Gemini 2.5 Flash | Tự động tạo tóm tắt + quiz từ video |
| 3 | Đánh giá học tập | Google Gemini 2.5 Flash | Phản hồi cá nhân sau hoàn thành khóa |
| 4 | Chatbot | Google Dialogflow | Hỗ trợ tương tác ngôn ngữ tự nhiên |

**Điểm nổi bật:**
- AI không chỉ là tính năng phụ — nó tích hợp sâu vào **cả 3 giai đoạn** của hành trình học tập:
  - **Trước học**: Gợi ý khóa học phù hợp (Recommendation)
  - **Trong khi học**: Tóm tắt bài, quiz tự động, chatbot hỗ trợ (Video AI + Chatbot)
  - **Sau khi học**: Đánh giá cá nhân, gợi ý cải thiện (Assessment)

---

*EduVerse — Nền tảng học tập thông minh, cá nhân hóa bằng AI.*
