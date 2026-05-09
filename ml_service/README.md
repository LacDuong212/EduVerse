# EduVerse ML Recommendation Service

## Kiến trúc

Python microservice (FastAPI + scikit-learn) cung cấp gợi ý khóa học sử dụng mô hình Machine Learning **K-means Clustering + TF-IDF**, kết hợp Cosine Similarity, Item-Item Jaccard CF, và Popularity Prior.

```
React Frontend → Node.js Backend (Express) → Python ML Service (FastAPI)
                        ↓                            ↓
                   MongoDB ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

## Yêu cầu

- Python 3.10+
- pip

## Cài đặt

```bash
cd ml_service
pip install -r requirements.txt
```

## Cấu hình

Tạo file `.env` (hoặc copy từ `.env.example`):

```env
MONGODB_URI=mongodb+srv://...your-uri.../test
ML_PORT=5002
MODEL_PATH=./model
```

## Train model

```bash
# Train với K tự động
python train.py

# Train với K=5 clusters + đánh giá chất lượng
python train.py --clusters 5 --evaluate
```

## Chạy service

```bash
# Development (auto-reload)
python app.py

# Hoặc trực tiếp với uvicorn
uvicorn app:app --host 0.0.0.0 --port 5002 --reload
```

## API Endpoints

### `GET /api/health`
Health check.

### `POST /api/train`
Train/retrain model từ dữ liệu hiện tại trong MongoDB.

```json
// Request (optional)
{ "n_clusters": 5 }

// Response
{
  "status": "trained",
  "metadata": {
    "n_courses": 30,
    "n_clusters": 4,
    "n_features": 120,
    "n_interactions": 45,
    "inertia": 12.34,
    "cluster_distribution": { "0": 8, "1": 10, "2": 7, "3": 5 }
  }
}
```

### `POST /api/recommend`
Gợi ý khóa học cho user.

```json
// Request
{ "user_id": "665f...", "top_k": 8 }

// Response
{
  "recommendations": [
    {
      "courseId": "665f...",
      "score": 0.85,
      "scores": { "cluster": 0.9, "content": 0.8, "cf": 0.7, "popularity": 0.5 },
      "cluster": 2,
      "userCluster": 2
    }
  ],
  "debug_source": "Hybrid(KMeans+History+Interests)",
  "model_status": "ready"
}
```

### `GET /api/model/info`
Thông tin model đã train.

## Pipeline ML

```
1. OFFLINE TRAINING (train.py hoặc POST /api/train)
   ├─ Load courses từ MongoDB
   ├─ TF-IDF Vectorization (scikit-learn TfidfVectorizer)
   │   └─ title + subtitle + tags + category + level → feature vectors
   ├─ K-means Clustering (scikit-learn KMeans)
   │   └─ Phân cụm courses theo nội dung tương tự
   ├─ Item-Item Jaccard Matrix
   │   └─ Tính similarity giữa các courses dựa trên user interactions
   └─ Save model artifacts (joblib)

2. ONLINE PREDICTION (POST /api/recommend)
   ├─ Load user signals (enrollments, wishlist, reviews, interests)
   ├─ Build weighted user profile text
   ├─ Transform → TF-IDF vector → K-means predict cluster
   ├─ Score candidates:
   │   ├─ Cluster proximity (K-means)     — 25%
   │   ├─ Content similarity (TF-IDF cos) — 35%
   │   ├─ Collaborative filtering (Jaccard)— 30%
   │   └─ Popularity prior                — 10%
   ├─ Min-max normalize → weighted fusion
   └─ Return top-K sorted results
```

## Tích hợp với Node.js Backend

Backend Node.js tự động gọi Python ML service. Nếu service không khả dụng, sẽ fallback sang logic BM25 + Jaccard có sẵn.

Thêm vào `.env` của backend:
```env
ML_SERVICE_URL=http://localhost:5002
ML_TIMEOUT_MS=3000
```
