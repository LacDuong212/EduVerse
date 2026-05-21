# Hướng dẫn chi tiết: ML Recommendation Model — EduVerse

> Tài liệu này giải thích mô hình gợi ý khoá học (recommendation system) của EduVerse, viết cho người **chưa có kinh nghiệm** về Machine Learning. Đọc từ đầu đến cuối sẽ hiểu toàn bộ cách hệ thống hoạt động.

---

## Mục lục

1. [Bài toán đang giải quyết](#1-bài-toán-đang-giải-quyết)
2. [Tổng quan kiến trúc](#2-tổng-quan-kiến-trúc)
3. [Dữ liệu đầu vào](#3-dữ-liệu-đầu-vào)
4. [Phase 1: Training (Huấn luyện)](#4-phase-1-training-huấn-luyện)
   - 4.1 TF-IDF Vectorization
   - 4.2 BERT Sentence Embedding
   - 4.3 K-Means Clustering (trên BERT space)
   - 4.4 Jaccard Item-Item Matrix
5. [Phase 2: Prediction (Dự đoán)](#5-phase-2-prediction-dự-đoán)
   - 5.1 Xây dựng User Profile
   - 5.2 Tính điểm 4 tín hiệu
   - 5.3 Min-Max Normalization
   - 5.4 Weighted Fusion
6. [Ý nghĩa các thông số](#6-ý-nghĩa-các-thông-số)
7. [Cấu trúc file code](#7-cấu-trúc-file-code)
8. [Cách chạy từng bước](#8-cách-chạy-từng-bước)
9. [Evaluation — Đánh giá chất lượng](#9-evaluation--đánh-giá-chất-lượng)
10. [Glossary — Bảng thuật ngữ](#10-glossary--bảng-thuật-ngữ)

---

## 1. Bài toán đang giải quyết

**Vấn đề:** EduVerse là nền tảng khoá học trực tuyến có 35 khoá. Khi sinh viên vào trang chủ, hiển thị khoá nào cho họ? Nếu hiển thị ngẫu nhiên, sinh viên DevOps sẽ thấy khoá Flutter — không liên quan → trải nghiệm kém.

**Giải pháp:** Xây dựng hệ thống **gợi ý tự động** (recommendation system):
- Input: Thông tin sinh viên (khoá đã học, sở thích)
- Output: Danh sách khoá phù hợp nhất, sắp xếp từ cao → thấp

**Ví dụ cụ thể:**
```
Input:  Sinh viên đã học Docker, AWS, Kubernetes
        Sở thích: "devops", "cloud"

Output: 1. Synthetic Data in ML        (score: 0.677)
        2. Mobile App Game             (score: 0.406)
        3. Networking & Security       (score: 0.393)
        4. AI Literacy                 (score: 0.363)
        ...
```

---

## 2. Tổng quan kiến trúc

> **Architecture: Option C — BERT clustering + TF-IDF content**
>
> Hệ thống sử dụng 2 kỹ thuật biểu diễn song song:
> - **BERT (all-MiniLM-L6-v2):** Sentence embedding 384 chiều → K-Means clustering (ngữ nghĩa sâu)
> - **TF-IDF:** Vector 500 chiều → Cosine similarity cho content scoring (keyword chính xác)

```
┌─────────────────── TRAINING (chạy 1 lần hoặc khi có khoá mới) ───────────────────┐
│                                                                                    │
│  MongoDB ──→ 35 khoá học ──→ TF-IDF (500 dims) ──→ Lưu vectorizer + vectors       │
│                           ──→ BERT (384 dims)  ──→ K-Means clustering              │
│                                                ──→ Lưu bert_vectors + kmeans       │
│  MongoDB ──→ 144 tương tác ──→ Jaccard Matrix ──→ Lưu vào /model/                 │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────── PREDICTION (chạy mỗi khi user mở trang) ──────────────────────┐
│                                                                                    │
│  User profile text ──→ BERT encode ──→ kmeans.predict() ──→ Cluster signal         │
│                    ──→ TF-IDF transform ──→ cosine_similarity ──→ Content signal   │
│                    ──→ Jaccard lookup ──→ CF signal                                 │
│                    ──→ Log(enrolled) ──→ Popularity signal                          │
│                    ──→ Normalize ──→ Weighted Fusion ──→ Top-K                      │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Model này được gọi là **Hybrid Recommendation System** vì kết hợp 4 tín hiệu:

| # | Tín hiệu | Kỹ thuật | Trả lời câu hỏi |
|---|---|---|---|
| 1 | **Cluster** | BERT + K-Means | "Khoá này có cùng nhóm ngữ nghĩa với user không?" |
| 2 | **Content** | TF-IDF + Cosine | "Nội dung khoá này giống với sở thích user bao nhiêu?" |
| 3 | **CF** | Jaccard | "Người học giống user có thích khoá này không?" |
| 4 | **Popularity** | Log count | "Khoá này có nhiều người học không?" |

### Tại sao kết hợp BERT + TF-IDF (Option C)?

| Kỹ thuật | Ưu điểm | Nhược điểm | Vai trò trong hệ thống |
|---|---|---|---|
| **BERT** | Hiểu ngữ nghĩa sâu ("Docker" ≈ "containerization") | Chậm hơn, NDCG thấp hơn 6% khi dùng riêng | **Clustering** — nhóm khoá theo ý nghĩa |
| **TF-IDF** | Nhanh, chính xác keyword (NDCG 0.827) | Không hiểu synonyms | **Content scoring** — so sánh chi tiết |

**Kết quả đánh giá:**
- BERT Silhouette Score: 0.1243 (gấp 2.1× so với TF-IDF 0.0579) → clustering tốt hơn
- TF-IDF NDCG@5: 0.8265 (cao hơn BERT 0.7778) → content matching chính xác hơn
- ⇒ Option C lấy ưu điểm cả hai: BERT cho cluster, TF-IDF cho content

---

## 3. Dữ liệu đầu vào

### 3.1 Dữ liệu khoá học (từ MongoDB collection `courses`)

Mỗi khoá học có các trường sau được sử dụng:

| Trường | Ví dụ | Dùng để làm gì |
|---|---|---|
| `title` | "Docker Essentials For Beginners" | Xây dựng văn bản TF-IDF |
| `subtitle` | "Learn Docker from scratch" | Xây dựng văn bản TF-IDF |
| `tags` | ["docker", "devops", "container"] | Xây dựng văn bản TF-IDF (lặp 2x để tăng trọng số) |
| `categoryName` | "DevOps" | Xây dựng văn bản TF-IDF |
| `level` | "beginner" | Xây dựng văn bản TF-IDF |
| `studentsEnrolled` | 42 | Tính Popularity score |
| `rating` | { total: 20, count: 5 } | Tính Popularity score |

**Cách ghép thành text cho TF-IDF:**
```python
text = f"{title} {subtitle} {tags} {tags} {category} {level}"
# tags lặp 2 lần → trọng số cao hơn (gọi là "field boosting")

# Ví dụ:
# "Docker Essentials For Beginners Learn Docker from scratch
#  docker devops container docker devops container DevOps beginner"
```

### 3.2 Dữ liệu tương tác (từ MongoDB)

Hệ thống thu thập 3 loại tương tác:

| Nguồn | Collection | Action | Ý nghĩa |
|---|---|---|---|
| Enrollment (đã mua) | `enrollments` | `active` hoặc `completed` | User đã đăng ký khoá |
| Wishlist | `wishlists` | `wishlist` | User thêm vào danh sách yêu thích |
| Review | `reviews` | `review` | User đánh giá khoá (1-5 sao) |

**File xử lý:** `db.py` → hàm `load_interactions()`

### 3.3 Dữ liệu user (khi predict)

Khi predict cho 1 user, hệ thống lấy:
- **Enrollments:** Khoá đã mua (trạng thái active/completed)
- **Wishlist:** Khoá trong danh sách yêu thích
- **Reviews:** Đánh giá (rating 1-5 sao)
- **Interests:** Từ khoá sở thích (ví dụ: "devops", "react", "python")

**File xử lý:** `db.py` → hàm `load_user_signals(user_id)`

---

## 4. Phase 1: Training (Huấn luyện)

> **File:** `engine.py` → hàm `train_model(courses, interactions, n_clusters)`
> **Khi nào chạy:** Khi cần cập nhật model (thêm khoá mới, có thêm users)
> **Kết quả:** 7 file model lưu trong thư mục `/model/`

### 4.1 TF-IDF Vectorization

#### TF-IDF là gì?

TF-IDF (**T**erm **F**requency — **I**nverse **D**ocument **F**requency) là cách chuyển đổi **văn bản** thành **vector số** để máy tính có thể so sánh.

**Ý tưởng đơn giản:**
- Từ xuất hiện **nhiều** trong 1 khoá học → quan trọng cho khoá đó (TF cao)
- Từ xuất hiện trong **ít** khoá học → phân biệt được các khoá (IDF cao)
- Từ xuất hiện **mọi nơi** (ví dụ: "learn", "course") → không giúp phân biệt (IDF thấp)

**Ví dụ minh hoạ:**

| Từ | TF (Docker course) | IDF (35 khoá) | TF-IDF |
|---|---|---|---|
| "docker" | Cao (xuất hiện 5 lần) | Cao (chỉ 2 khoá có) | **Rất cao** → từ đặc trưng |
| "kubernetes" | 0 (không xuất hiện) | Cao | **0** → không liên quan |
| "learn" | Thấp (1 lần) | Thấp (30 khoá đều có) | **Rất thấp** → từ chung |

#### Các thông số cấu hình

```python
TfidfVectorizer(
    max_features=500,      # Chỉ giữ 500 từ quan trọng nhất
    ngram_range=(1, 2),    # Xét cả từ đơn ("docker") và cặp từ ("machine learning")
    min_df=1,              # Giữ mọi từ (dataset nhỏ, không loại bỏ)
    max_df=0.95,           # Bỏ từ xuất hiện >95% khoá (ví dụ: "course")
    sublinear_tf=True,     # Dùng log(TF) thay vì TF thô → giảm ảnh hưởng từ lặp quá nhiều
    strip_accents="unicode",  # Xoá dấu tiếng Việt khi so sánh
    lowercase=True,        # Chuyển hết thành chữ thường
)
```

**Giải thích từng thông số:**

| Thông số | Giá trị | Tại sao? |
|---|---|---|
| `max_features=500` | Giới hạn 500 từ | 35 khoá không cần hàng ngàn features → giảm noise, tăng tốc |
| `ngram_range=(1,2)` | Unigram + Bigram | Bắt được cụm từ "machine learning" thay vì chỉ "machine" và "learning" riêng lẻ |
| `min_df=1` | Giữ mọi từ | Dataset nhỏ → mỗi từ đều có thể hữu ích |
| `max_df=0.95` | Bỏ từ quá phổ biến | Từ xuất hiện ở >95% khoá (33/35) → không giúp phân biệt |
| `sublinear_tf=True` | Dùng `1 + log(tf)` | Từ "docker" xuất hiện 10 lần không nên có trọng số gấp 10 lần so với 1 lần → dùng log để "triệt tiêu" |

#### Kết quả sau bước này

Mỗi khoá học trở thành 1 vector 500 chiều:
```
Khoá "Docker Essentials" → [0.0, 0.12, 0.0, 0.45, ..., 0.0, 0.33]  (500 số)
Khoá "React JS"          → [0.38, 0.0, 0.15, 0.0, ..., 0.22, 0.0]  (500 số)
```

Tại sao cần vector? Vì máy tính **không hiểu chữ**, chỉ hiểu số. Chuyển thành vector cho phép **tính khoảng cách** giữa các khoá → khoá gần nhau = nội dung tương tự.

> **Lưu ý:** TF-IDF vectors dùng cho **Content signal** (cosine similarity). Clustering dùng BERT vectors (xem mục 4.2).

---

### 4.2 BERT Sentence Embedding

#### BERT là gì?

**BERT** (Bidirectional Encoder Representations from Transformers) là mô hình ngôn ngữ của Google, có khả năng **hiểu ngữ nghĩa** của văn bản — không chỉ đếm từ như TF-IDF.

**Hệ thống sử dụng:** `all-MiniLM-L6-v2` — phiên bản nhỏ gọn (22M tham số, ~90MB) của Microsoft, được train trên 1 tỷ cặp câu.

| Đặc điểm | Giá trị |
|---|---|
| Kiến trúc | MiniLM (distilled từ BERT-large) |
| Số tham số | 22 triệu |
| Output dimension | 384 |
| Kích thước model | ~90MB |
| Tốc độ encode | ~0.5s cho 35 khoá (CPU) |

#### Tại sao cần BERT bên cạnh TF-IDF?

TF-IDF chỉ đếm từ — nếu 2 khoá dùng **từ khác nhau** nhưng **cùng chủ đề**, TF-IDF không nhận ra:

```
Khoá A: "Docker containerization deployment"
Khoá B: "Kubernetes orchestration pods"

TF-IDF: cosine = 0.05 (gần như không liên quan — không có từ trùng)
BERT:   cosine = 0.72 (hiểu rằng cả 2 đều là DevOps/container)
```

→ BERT giúp **nhóm** (clustering) các khoá chính xác hơn theo **ngữ nghĩa thực sự**.

#### Cách hoạt động

```python
from sentence_transformers import SentenceTransformer

bert = SentenceTransformer("all-MiniLM-L6-v2")

# Mỗi khoá → 1 vector 384 chiều (dense, normalized)
course_texts = [build_course_text(c) for c in courses]
bert_vectors = bert.encode(course_texts, normalize_embeddings=True)
# Shape: (35, 384)
```

**So sánh TF-IDF vs BERT:**

| | TF-IDF | BERT |
|---|---|---|
| Kiểu vector | Sparse (nhiều số 0) | Dense (ít số 0) |
| Số chiều | 500 | 384 |
| Hiểu synonyms? | ❌ Không | ✅ Có |
| Tốc độ encode | ~1ms | ~15ms/khoá |
| Silhouette Score | 0.058 | **0.124** (gấp 2.1×) |
| NDCG@5 (content) | **0.827** | 0.778 |
| Vai trò | Content similarity | Clustering |

#### Kết quả sau bước này

Mỗi khoá học trở thành 1 vector **384 chiều (dense)**:
```
Khoá "Docker Essentials" → [0.032, -0.041, 0.087, ..., 0.015]  (384 số, đều khác 0)
Khoá "React JS"          → [-0.018, 0.065, 0.003, ..., -0.041]  (384 số)
```

Các vector này được dùng cho **K-Means clustering** (bước 4.3).

---

### 4.3 K-Means Clustering (trên BERT space)

#### K-Means là gì?

K-Means là thuật toán **nhóm** (clustering) các khoá học vào K nhóm, sao cho khoá cùng nhóm có nội dung **tương tự** nhau.

> **Quan trọng:** Trong Option C, K-Means chạy trên **BERT vectors (384 dims)** thay vì TF-IDF. Điều này cho Silhouette Score 0.1243 (gấp 2.1× so với clustering trên TF-IDF 0.0579) → các cluster tách biệt hơn.

**Ví dụ với K=4 (hệ thống hiện tại, clustering trên BERT space):**

```
Cluster 0 (9 khoá):  CS Crash Course, Data Science, Algorithms, AI, ML, Cybersecurity...  → "CS/AI/Data"
Cluster 1 (7 khoá):  Java, Full Stack, Android, Testing courses...                        → "Lập trình tổng quát"
Cluster 2 (10 khoá): Docker, AWS, K8s, Azure, Cloud, Blockchain, iOS...                   → "DevOps/Cloud/Infra"
Cluster 3 (9 khoá):  NestJS, React, JS/TS, GraphQL, Next.js, Flutter...                   → "Web/Mobile Framework"
```

#### Thuật toán K-Means hoạt động thế nào?

```
Bước 1: Chọn ngẫu nhiên 4 điểm làm "tâm" (centroid) ban đầu
Bước 2: Gán mỗi khoá vào cluster có tâm gần nhất
Bước 3: Tính lại tâm = trung bình tất cả khoá trong cluster
Bước 4: Lặp lại bước 2-3 cho đến khi tâm không đổi nữa (hội tụ)
```

**Hình dung đơn giản:** Bạn có 35 tờ giấy ghi tên khoá, rải trên bàn. K-Means giống như đặt 4 cục nam châm, mỗi cục kéo những tờ giấy gần nó lại → tạo 4 đống.

#### Các thông số

```python
KMeans(
    n_clusters=4,       # Số nhóm (K)
    random_state=42,    # Seed ngẫu nhiên → chạy lại cho cùng kết quả
    n_init=10,          # Chạy 10 lần với tâm ban đầu khác nhau → chọn kết quả tốt nhất
    max_iter=300,       # Tối đa 300 vòng lặp mỗi lần chạy
)
```

| Thông số | Giá trị | Tại sao? |
|---|---|---|
| `n_clusters=4` | 4 nhóm | Chọn bằng Elbow Method: sqrt(35/2) ≈ 4.18 → 4. Xem chi tiết ở mục 9 |
| `random_state=42` | Cố định seed | Đảm bảo reproducible: mỗi lần train cho kết quả giống nhau |
| `n_init=10` | 10 lần khởi tạo | K-Means phụ thuộc điểm bắt đầu → chạy 10 lần, chọn lần có inertia thấp nhất |
| `max_iter=300` | 300 bước lặp | Giới hạn để không chạy vô hạn (thường hội tụ sau ~20-50 bước) |

#### Chọn K bằng cách nào?

Hai phương pháp phổ biến:

**1. Elbow Method (Phương pháp khuỷu tay):**
- Thử K = 2, 3, 4, 5, 6, 7, 8
- Với mỗi K, tính **Inertia** = tổng khoảng cách từ mỗi điểm đến tâm cluster
- Vẽ biểu đồ: Inertia giảm dần khi K tăng
- Chọn K tại điểm "khuỷu tay" — nơi inertia bắt đầu giảm chậm lại

```
Inertia
  31 ┤■
  30 ┤  ■
  29 ┤    ■
  28 ┤      ■  ← KHUỶU TAY (K=4) — sau đây giảm chậm
  27 ┤        ■
  26 ┤
  24 ┤            ■
  22 ┤              ■
  21 ┤                ■
     └──┬──┬──┬──┬──┬──┬─
        2  3  4  5  6  7  8
```

**2. Silhouette Score:**
- Đo mức "tách biệt" giữa các cluster (-1 đến 1, càng cao càng tốt)
- K=4, BERT space → Silhouette = 0.1243 (tốt hơn TF-IDF 0.058)

**Heuristic sqrt(N/2):** sqrt(35/2) ≈ 4.18 → K=4

---

### 4.4 Jaccard Item-Item Matrix

#### Jaccard Similarity là gì?

Đo **mức trùng lặp** giữa 2 tập hợp:

$$Jaccard(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

**Trong context này:**
- A = tập users đã enroll khoá A
- B = tập users đã enroll khoá B

**Ví dụ:**
```
Khoá Docker:     Users = {Hùng, Đức, Mai, Vinh}
Khoá Kubernetes: Users = {Hùng, Đức, Mai}

Giao nhau (∩) = {Hùng, Đức, Mai}     → 3 users
Hợp nhau (∪) = {Hùng, Đức, Mai, Vinh} → 4 users

Jaccard = 3/4 = 0.75  → "rất giống nhau" (cùng nhóm người học)
```

**Ý nghĩa:** Nếu 2 khoá có Jaccard cao → "người học khoá A cũng thường học khoá B" → nếu user đã học A, gợi ý B là hợp lý.

#### Ma trận Jaccard

Hệ thống tính Jaccard cho **tất cả** cặp khoá, lưu thành dictionary:

```python
item_item_matrix = {
    "docker_id": {
        "kubernetes_id": 0.75,    # 75% users trùng
        "aws_id": 0.60,           # 60% users trùng
        "react_id": 0.05,         # 5% trùng → ít liên quan
    },
    "react_id": {
        "nextjs_id": 0.80,
        "nodejs_id": 0.65,
        ...
    },
    ...
}
```

**File xử lý:** `engine.py` → hàm `_build_jaccard_matrix()`

---

### 4.5 Kết quả Training — 7 file model

Sau khi train xong, 7 file được lưu trong `/model/`:

| File | Nội dung | Kích thước |
|---|---|---|
| `tfidf_vectorizer.joblib` | Bộ TF-IDF đã fit (vocabulary, IDF weights) | ~200KB |
| `kmeans_model.joblib` | Model K-Means đã train (centroids trên BERT space) | ~50KB |
| `course_vectors.joblib` | Ma trận TF-IDF vectors (35 × 500) | ~100KB |
| `bert_vectors.joblib` | Ma trận BERT embeddings (35 × 384) | ~55KB |
| `course_ids.joblib` | Danh sách course IDs tương ứng | ~5KB |
| `item_item_matrix.joblib` | Ma trận Jaccard similarity | ~50KB |
| `train_metadata.joblib` | Thông tin train (ngày, config, stats, architecture) | ~2KB |

Tại sao lưu file? Vì **training mất thời gian** (~10s bao gồm BERT encode), nhưng **prediction cần nhanh** (<500ms). Load file đã train → predict ngay, không cần train lại.

---

## 5. Phase 2: Prediction (Dự đoán)

> **File:** `engine.py` → hàm `predict(user_signals, candidate_courses, top_k)`
> **Khi nào chạy:** Mỗi khi user mở trang / xem gợi ý
> **Kết quả:** Danh sách top-K khoá, mỗi khoá có score chi tiết

### 5.1 Xây dựng User Profile

Hệ thống ghép tất cả thông tin user thành 1 đoạn text, rồi chuyển thành TF-IDF vector.

**Bước 1: Thu thập signals**
```
Enrollments: [Docker (completed), AWS (active), React (active)]
Wishlist:    [Next.js]
Reviews:     [Docker: 5★, AWS: 3★]
Interests:   ["devops", "cloud"]
```

**Bước 2: Gán trọng số (Action Weight)**

| Action | Weight | Ý nghĩa |
|---|---|---|
| `completed` | 3 | Đã hoàn thành khoá → quan tâm nhất |
| `active` | 2 | Đang học → quan tâm khá cao |
| `wishlist` | 1 | Thêm yêu thích → có hứng thú |
| `interest` | 1 | Từ khoá sở thích → tín hiệu nhẹ |

**Rating Multiplier:** Rating 5★ → nhân 2.0x, 3★ → nhân 1.0x, 1★ → nhân 0.0x
```python
# Công thức: 1.0 + (rating - 3) * 0.5
# 5★ → 1.0 + (5-3)*0.5 = 2.0
# 4★ → 1.0 + (4-3)*0.5 = 1.5
# 3★ → 1.0 + (3-3)*0.5 = 1.0
# 2★ → 1.0 + (2-3)*0.5 = 0.5
# 1★ → 1.0 + (1-3)*0.5 = 0.0  → khoá bị đánh giá tệ → bỏ qua
```

**Bước 3: Tạo text (lặp theo trọng số)**
```
# Docker (completed, 5★): weight = 3 × 2.0 = 6 → lặp 6 lần
# AWS (active, 3★):       weight = 2 × 1.0 = 2 → lặp 2 lần
# React (active, no rating): weight = 2 × 1.0 = 2 → lặp 2 lần
# Next.js (wishlist):     weight = 1 → lặp 1 lần
# Interests:              lặp 1 lần mỗi từ

user_text = "Docker... Docker... Docker... Docker... Docker... Docker...
             AWS... AWS...
             React... React...
             Next.js...
             devops cloud"
```

**Tại sao lặp?** TF-IDF đếm tần suất từ. Lặp khoá Docker 6 lần → các từ "docker", "container" có TF cao → vector user "nghiêng" về phía Docker/DevOps.

**Bước 4: Dual encoding**
```python
# TF-IDF (cho Content signal)
user_vector = vectorizer.transform([user_text])
# → vector 500 chiều, cùng không gian với course vectors

# BERT (cho Cluster signal)
bert = _get_bert_model()
user_bert_vector = bert.encode([user_text], normalize_embeddings=True)
# → vector 384 chiều, cùng không gian với BERT course vectors
```

### 5.2 Tính điểm 4 tín hiệu

Với **mỗi** khoá chưa enroll (candidate), tính 4 scores:

#### Signal 1: Cluster Score (trọng số 25%) — BERT-based

```
1. Encode user profile + candidate với BERT → vectors 384 chiều
2. kmeans.predict(bert_vector) → cluster assignment
3. Nếu khoá cùng cluster với user → score = 1.0
4. Nếu khác cluster → score = 1/(1 + khoảng cách giữa 2 BERT centroids)
```

**Ví dụ:**
```
User BERT vector → kmeans.predict() → cluster 2 (DevOps/Cloud)
Khoá Docker Advanced → BERT encode → cluster 2 → score = 1.0 ✅
Khoá React JS        → BERT encode → cluster 3 → khoảng cách centroid = 0.8
                                                → score = 1/(1+0.8) = 0.56
```

**Tại sao BERT cho clustering?** BERT hiểu "Docker" ≈ "containerization" ≈ "K8s" → đặt chúng gần nhau → Silhouette 0.1243 (vs TF-IDF 0.058).

#### Signal 2: Content Score (trọng số 35%) — TF-IDF-based

Dùng **Cosine Similarity** giữa user vector và course vector:

$$\text{cosine}(u, c) = \frac{u \cdot c}{||u|| \times ||c||}$$

**Hình dung đơn giản:** Cosine đo **góc** giữa 2 vector:
- Góc 0° (cùng hướng) → cosine = 1.0 → rất giống
- Góc 90° (vuông góc) → cosine = 0.0 → không liên quan
- Giá trị từ 0 đến 1 (TF-IDF luôn không âm)

**Ví dụ:**
```
User vector thiên về từ "docker", "kubernetes", "cloud"
Khoá "AWS Essentials" cũng có từ "cloud" → cosine ≈ 0.45
Khoá "React JS" không có từ nào trùng   → cosine ≈ 0.02
```

**Ý nghĩa:** "Nội dung khoá này **trực tiếp** giống với lịch sử học của user bao nhiêu?"

#### Signal 3: CF Score — Collaborative Filtering (trọng số 30%)

```python
cf_score(khoá_C) = Σ weight(khoá_đã_học) × jaccard(khoá_đã_học, khoá_C)
```

**Ví dụ:**
```
User đã học: Docker (weight=3), AWS (weight=2)

cf_score(Kubernetes) = 3 × jaccard(Docker, K8s) + 2 × jaccard(AWS, K8s)
                     = 3 × 0.75 + 2 × 0.60
                     = 2.25 + 1.20
                     = 3.45
```

**Ý nghĩa:** "Những **người khác** đã học Docker + AWS thì cũng hay học Kubernetes" → gợi ý Kubernetes.

Đây là tín hiệu **hành vi nhóm** — không dựa vào nội dung, mà dựa vào **pattern** của users tương tự.

#### Signal 4: Popularity Score (trọng số 10%)

```python
popularity = log(studentsEnrolled + 1) + avgRating × 0.5
```

**Ví dụ:**
```
Khoá Docker: 42 students, 4.5★ → log(43) + 4.5×0.5 = 3.76 + 2.25 = 6.01
Khoá ML KNN: 3 students, 5.0★  → log(4) + 5.0×0.5  = 1.39 + 2.50 = 3.89
```

**Tại sao dùng log?** Để triệt tiêu sự chênh lệch quá lớn. Khoá 1000 students không nên có trọng số gấp 1000 lần khoá 1 student.

**Ý nghĩa:** "Khoá này có phổ biến không?" → Ưu tiên nhẹ khoá có nhiều người tin tưởng.

**Tại sao chỉ 10%?** Nếu Popularity cao quá → hệ thống chỉ gợi ý khoá "hot", bỏ qua khoá niche nhưng phù hợp → gọi là **echo chamber** (bong bóng thông tin).

---

### 5.3 Min-Max Normalization

**Vấn đề:** 4 signals có thang đo khác nhau:
- Cluster score: 0–1
- Content score: 0–1
- CF score: 0–10+ (phụ thuộc số khoá đã học)
- Popularity: 0–8 (phụ thuộc số students)

Nếu cộng trực tiếp → Popularity/CF chiếm trội vì giá trị tuyệt đối lớn hơn.

**Giải pháp: Min-Max Normalization** — đưa tất cả về thang 0–1:

$$x_{norm} = \frac{x - x_{min}}{x_{max} - x_{min}}$$

**Ví dụ:** CF scores của tất cả candidates: [0.5, 1.2, 3.45, 0.0, 2.1]
```
min = 0.0, max = 3.45
0.5  → (0.5 - 0) / (3.45 - 0)  = 0.145
1.2  → (1.2 - 0) / (3.45 - 0)  = 0.348
3.45 → (3.45 - 0) / (3.45 - 0) = 1.000  ← cao nhất
0.0  → 0.000                             ← thấp nhất
2.1  → 0.609
```

**Trường hợp đặc biệt:** Nếu tất cả giá trị bằng nhau (min = max):
- Nếu giá trị > 0 → normalize thành 1.0
- Nếu giá trị = 0 → normalize thành 0.0

---

### 5.4 Weighted Fusion

Sau normalize, kết hợp 4 signals bằng **trung bình có trọng số:**

$$\text{score} = 0.25 \times \text{cluster} + 0.35 \times \text{content} + 0.30 \times \text{cf} + 0.10 \times \text{popularity}$$

**Ví dụ: Tính score cho khoá Kubernetes**
```
cluster  = 1.000 (cùng cluster DevOps)   × 0.25 = 0.250
content  = 0.650 (cosine similarity)      × 0.35 = 0.228
cf       = 0.800 (sau normalize)          × 0.30 = 0.240
popularity = 0.300 (sau normalize)        × 0.10 = 0.030

Final score = 0.250 + 0.228 + 0.240 + 0.030 = 0.748
```

**Sắp xếp tất cả candidates theo score giảm dần → lấy top-K.**

#### Tại sao dùng trọng số này?

| Signal | Weight | Lý do |
|---|---|---|
| Content | **0.35** | Cao nhất vì **luôn hoạt động** kể cả user mới (cold-start). TF-IDF cosine là tín hiệu tin cậy nhất |
| CF | **0.30** | Mạnh khi có đủ data hành vi. Nhưng user mới chưa enroll gì → CF = 0 |
| Cluster | **0.25** | Bonus cho khoá cùng lĩnh vực. Thấp hơn Content vì cluster boundary không rõ ràng (Silhouette 0.058) |
| Popularity | **0.10** | Thấp nhất để tránh echo chamber |

**Tổng:** 0.35 + 0.30 + 0.25 + 0.10 = **1.00** ✅

---

## 6. Ý nghĩa các thông số

### 6.1 Thông số Model

| Thông số | Giá trị hiện tại | Ý nghĩa | Tốt/Xấu? |
|---|---|---|---|
| **n_courses** | 35 | Tổng khoá học trong catalog | Nhỏ (prototype) |
| **n_interactions** | 144 | Tổng lượt tương tác (enrollment + wishlist + review) | 32 users × ~4.5 enrollments |
| **n_features_tfidf** | 500 | Số chiều TF-IDF vector (content signal) | Đủ cho 35 khoá |
| **n_features_bert** | 384 | Số chiều BERT embedding (cluster signal) | all-MiniLM-L6-v2 output |
| **bert_model** | all-MiniLM-L6-v2 | Sentence transformer model | 22M params, ~90MB |
| **n_clusters** | 4 | Số nhóm K-Means (trên BERT space) | Heuristic sqrt(35/2) ≈ 4 |
| **inertia** | 19.13 | Tổng khoảng cách các điểm → tâm cluster (BERT space) | Càng thấp càng tốt |
| **architecture** | Option C | BERT clustering + TF-IDF content | Hybrid best-of-both |

### 6.2 Thông số đánh giá

| Metric | Giá trị | Ý nghĩa dễ hiểu | Thang |
|---|---|---|---|
| **Precision@K** | 0.194 | Trong K khoá gợi ý, bao nhiêu % thực sự liên quan? | 0–1, cao = tốt |
| **Recall@K** | 0.971 | Trong tất cả khoá liên quan, bao nhiêu % được gợi ý? | 0–1, cao = tốt |
| **Hit Rate@K** | 0.971 | Bao nhiêu % "câu hỏi" mà hệ thống trả lời đúng? | 0–1, cao = tốt |
| **NDCG@K** | 0.827 | Khoá đúng có được xếp ở **vị trí cao** không? (rank quality) | 0–1, cao = tốt |
| **Silhouette** | 0.058 | Các cluster có tách biệt rõ ràng không? | -1–1, >0.5 = tốt, <0.25 = yếu |
| **Coverage** | 88.6% | Bao nhiêu % catalog xuất hiện trong gợi ý? | 0–100%, cao = đa dạng |
| **Diversity** | 0.951 | Khoá trong cùng 1 danh sách gợi ý có đa dạng không? | 0–1, cao = đa dạng |

### 6.3 Giải thích Precision vs Recall vs Hit Rate

**Ví dụ cụ thể: Đánh giá LOO (Leave-One-Out)**

```
User A đã học 5 khoá: [Docker, AWS, K8s, Azure, Cloud]
Giấu 1 khoá: K8s ← đây là "đáp án"

Gợi ý top-5: [K8s, Networking, Security, Docker Adv, ML]
                ↑ HIT! K8s xuất hiện trong top-5

Precision@5 = 1/5 = 0.20 (chỉ 1 trong 5 khoá gợi ý là "đáp án")
Recall@5    = 1/1 = 1.00 (1 đáp án, đã tìm thấy 1)
Hit Rate@5  = 1   (có ít nhất 1 đáp án trong top-5)
```

```
Nếu gợi ý top-5: [Networking, Security, Docker Adv, ML, React]
                   ← K8s KHÔNG có trong top-5

Precision@5 = 0/5 = 0.00
Recall@5    = 0/1 = 0.00
Hit Rate@5  = 0   (miss)
```

### 6.4 NDCG là gì?

**NDCG** = Normalized Discounted Cumulative Gain. Đo **vị trí** của kết quả đúng.

**Ý tưởng:** Tìm đúng khoá ở vị trí #1 tốt hơn tìm đúng ở vị trí #5:

| Vị trí tìm thấy | NDCG@5 |
|---|---|
| #1 (đầu tiên) | 1.000 |
| #2 | 0.631 |
| #3 | 0.500 |
| #4 | 0.431 |
| #5 (cuối cùng) | 0.387 |
| Không tìm thấy | 0.000 |

**Công thức đơn giản:**

$$NDCG = \frac{1}{\log_2(rank + 1)}$$

**NDCG@5 = 0.827** nghĩa là: trung bình, khoá đúng xuất hiện khoảng **vị trí #2** trong top-5.

---

## 7. Cấu trúc file code

```
ml_service/
├── app.py           ← FastAPI server (API endpoints)
├── engine.py        ← Core ML: train_model() + predict() [Option C: BERT+TF-IDF]
├── db.py            ← MongoDB connection + data loading
├── train.py         ← Script train model từ command line
├── evaluate.py      ← Script đánh giá chất lượng model
├── evaluate_bert.py ← So sánh BERT vs TF-IDF (benchmark)
├── seed_data.py     ← Tạo 30 synthetic users để đánh giá
├── requirements.txt ← Python dependencies (incl. sentence-transformers)
├── .env             ← MongoDB URI, port config
├── model/           ← Thư mục chứa model files (auto-generated)
│   ├── tfidf_vectorizer.joblib
│   ├── kmeans_model.joblib
│   ├── course_vectors.joblib   ← TF-IDF vectors (content signal)
│   ├── bert_vectors.joblib     ← BERT embeddings (cluster signal)
│   ├── course_ids.joblib
│   ├── item_item_matrix.joblib
│   └── train_metadata.joblib
├── DEMO_RESULTS.md  ← Kết quả demo + Q&A bảo vệ
└── MODEL_GUIDE.md   ← File này
```

### Luồng gọi giữa các file

```
[User mở trang]
     │
     ▼
Frontend (React) ──HTTP──→ Node.js Backend ──HTTP──→ ml_service/app.py
                                                          │
                                                    POST /api/recommend
                                                          │
                                                          ▼
                                                     app.py calls
                                                    engine.predict()
                                                          │
                                              ┌───────────┼───────────┐
                                              │           │           │
                                         db.load_    engine._    engine._
                                        user_signals  load_model  build_user_
                                              │           │      profile_text
                                              ▼           │           │
                                          MongoDB     /model/     db.load_
                                                     (joblib)     courses()
                                                          │
                                                    Score 4 signals
                                                    Normalize
                                                    Weighted Fusion
                                                    Return top-K
```

### Khi train:

```
[Admin chạy train]
     │
     ├── CLI: py train.py
     │
     └── API: POST /api/train ──→ app.py ──→ engine.train_model()
                                                    │
                                        ┌───────────┼───────────┐
                                        │           │           │
                                      TF-IDF      BERT       Jaccard
                                      .fit()    .encode()    build
                                        │           │           │
                                        │       KMeans.fit()    │
                                        │       (on BERT vecs)  │
                                        └───────────┼───────────┘
                                                    │
                                              Save 7 files
                                              to /model/
```

---

## 8. Cách chạy từng bước

### Bước 0: Cài đặt

```powershell
cd ml_service
pip install -r requirements.txt
```

### Bước 1: Train model

```powershell
# Cách 1: Dùng script
py train.py                    # Train với K tự động
py train.py --clusters 5       # Train với K=5
py train.py --evaluate         # Train + hiển thị đánh giá

# Cách 2: Dùng API (cần start server trước)
py app.py                      # Start server port 5002
# Rồi gọi POST http://localhost:5002/api/train
```

### Bước 2: Chạy server

```powershell
py app.py
# → Server chạy tại http://localhost:5002
# → Tự động load model khi khởi động
```

### Bước 3: Lấy gợi ý

```http
POST http://localhost:5002/api/recommend
Content-Type: application/json

{
    "user_id": "694d32d7ebe694fc49e59a67",
    "top_k": 5
}
```

**Response:**
```json
{
    "recommendations": [
        {
            "courseId": "695166b4b08e6cc6cab5b4ff",
            "score": 0.677,
            "scores": {
                "cluster": 0.108,
                "content": 1.0,
                "cf": 1.0,
                "popularity": 0.0
            },
            "cluster": 0,
            "userCluster": 1
        }
    ],
    "debug_source": "Hybrid(KMeans+History+Interests+Wishlist)",
    "model_status": "ready"
}
```

### Bước 4: Đánh giá chất lượng

```powershell
py evaluate.py --top_k 5 8    # LOO evaluation + baselines + elbow
```

### Bước 5: Seed data (tạo synthetic users)

```powershell
py seed_data.py --dry-run      # Xem preview, không insert
py seed_data.py                # Insert 30 synthetic users
py seed_data.py --cleanup      # Xoá tất cả synthetic data
```

---

## 9. Evaluation — Đánh giá chất lượng

### Leave-One-Out (LOO) là gì?

Phương pháp đánh giá offline, **giả lập** tình huống thực:

```
Với MỖI user có ≥ 2 enrollments:
  Với MỖI khoá đã enroll:
    1. Giấu khoá đó (giả vờ chưa học)
    2. Dùng phần còn lại làm profile
    3. Gợi ý top-K
    4. Kiểm tra: khoá bị giấu có trong top-K không?
    5. Ghi nhận: Hit/Miss

Trung bình tất cả lần thử → metrics cuối cùng
```

**32 users × ~4.4 enrollments trung bình = 140 "câu hỏi" (folds)**

### Kết quả hiện tại

| Strategy | NDCG@5 | HR@5 | Diễn giải |
|---|---|---|---|
| Random | 0.097 | 0.163 | Đoán bừa → đúng 16% |
| Popularity | 0.236 | 0.386 | Gợi ý khoá hot → đúng 39% |
| Content-only | 0.701 | 0.886 | Chỉ dùng TF-IDF cosine → đúng 89% |
| CF-only | 0.903 | 0.993 | Chỉ dùng Jaccard → đúng 99% |
| **Hybrid (ours)** | **0.827** | **0.971** | **Kết hợp 4 signals → đúng 97%** |

**Kết luận:** Hybrid tốt hơn Random 8.5x, tốt hơn Popularity 3.5x, và kết hợp ưu điểm của cả Content + CF.

---

## 10. Glossary — Bảng thuật ngữ

| Thuật ngữ | Tiếng Việt | Giải thích ngắn |
|---|---|---|
| **BERT** | Mã hoá ngữ nghĩa 2 chiều | Mô hình AI hiểu ý nghĩa văn bản, không chỉ đếm từ |
| **Sentence Transformer** | Biến đổi câu thành vector | Thư viện dùng BERT để encode văn bản → vector dense |
| **all-MiniLM-L6-v2** | Model nhỏ gọn của Microsoft | 22M params, 384 dims, train trên 1 tỷ cặp câu |
| **Dense vector** | Vector dày đặc | Vector có ít giá trị 0 (ngược với sparse) |
| **TF-IDF** | Tần suất — Nghịch tần suất tài liệu | Chuyển text → vector số (sparse) |
| **K-Means** | Phân cụm K nhóm | Thuật toán chia data thành K nhóm tương tự |
| **Centroid** | Tâm cụm | Điểm trung tâm đại diện cho 1 cluster |
| **Inertia** | Quán tính | Tổng khoảng cách từ mỗi điểm đến centroid → thấp = cluster chặt |
| **Silhouette Score** | Điểm silhouette | Đo cluster tách biệt rõ không (-1 đến 1) |
| **Cosine Similarity** | Độ tương tự cosine | Đo góc giữa 2 vector (0=khác, 1=giống) |
| **Jaccard Similarity** | Độ tương tự Jaccard | Đo trùng lặp giữa 2 tập hợp |
| **Collaborative Filtering (CF)** | Lọc cộng tác | "Người giống bạn thích gì?" |
| **Content-Based Filtering** | Lọc dựa trên nội dung | "Khoá này nói về gì? Giống sở thích bạn không?" |
| **Cold-start** | Khởi động lạnh | User mới chưa có dữ liệu hành vi |
| **Min-Max Normalization** | Chuẩn hoá min-max | Đưa giá trị về thang 0–1 |
| **LOO (Leave-One-Out)** | Bỏ một ra | Giấu 1 item, test xem model có tìm lại được không |
| **NDCG** | Đo chất lượng xếp hạng | Đúng ở vị trí #1 tốt hơn đúng ở #5 |
| **Hit Rate** | Tỷ lệ hit | Bao nhiêu % câu hỏi model trả lời đúng |
| **Precision@K** | Độ chính xác | Trong K gợi ý, bao nhiêu % đúng |
| **Recall@K** | Độ phủ | Trong tất cả đáp án, bao nhiêu % được tìm thấy |
| **Echo chamber** | Bong bóng thông tin | Chỉ gợi ý thứ phổ biến, user không khám phá được cái mới |
| **Feature** | Đặc trưng | 1 chiều trong vector (tương ứng 1 từ/cụm từ) |
| **Bigram** | Cặp từ | 2 từ liền nhau: "machine learning", "deep learning" |
| **Overfitting** | Quá khớp | Model "học thuộc" data, không generalize được |
| **Hybrid** | Lai/kết hợp | Kết hợp nhiều kỹ thuật → mạnh hơn dùng 1 kỹ thuật |
| **Sparse** | Thưa | Ma trận/vector có nhiều giá trị 0 |
| **joblib** | Thư viện lưu model | Serialize Python objects ra file → load lại nhanh |
| **Option C** | Phương án C | BERT cho clustering + TF-IDF cho content (kiến trúc hiện tại) |

---

> **Cập nhật lần cuối:** 2026-05-21 | **Kiến trúc:** Option C (BERT clustering + TF-IDF content) | **Tác giả:** EduVerse ML Team
