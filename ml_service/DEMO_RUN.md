# Hướng dẫn chạy ML Service khi Demo

## TL;DR — Chỉ cần 1 lệnh

```powershell
cd ml_service
py app.py
```

Model đã được train sẵn (lưu trong `/model/`), server tự load khi khởi động. **Không cần train lại.**

---

## Khi nào cần train lại?

| Tình huống | Cần train lại? | Lệnh |
|---|---|---|
| Demo bình thường | ❌ Không | `py app.py` |
| Thêm khoá học mới vào DB | ✅ Có | `py train.py` rồi `py app.py` |
| Xoá thư mục `/model/` | ✅ Có | `py train.py` rồi `py app.py` |
| Thay đổi code engine.py | ❌ Không (model files không đổi) | `py app.py` |
| Muốn thêm synthetic users | Tuỳ | `py seed_data.py` rồi `py train.py` |

---

## Checklist trước khi demo

1. **Kiểm tra thư mục `/model/` có đủ file:**
   ```
   model/
   ├── tfidf_vectorizer.joblib  ✓
   ├── kmeans_model.joblib      ✓
   ├── course_vectors.joblib    ✓
   ├── course_ids.joblib        ✓
   ├── item_item_matrix.joblib  ✓
   └── train_metadata.joblib    ✓
   ```

2. **File `.env` có đúng MongoDB URI:**
   ```
   MONGODB_URI=mongodb+srv://xxxxxxxxxxxxx.net/test
   ML_PORT=5002
   MODEL_PATH=./model
   ```

3. **Start server:**
   ```powershell
   cd ml_service
   py app.py
   ```
   Thấy log `Pre-trained model loaded successfully` → OK.

---

## Test nhanh sau khi start

```powershell
# Health check
curl http://localhost:5002/api/health

# Xem thông tin model
curl http://localhost:5002/api/model/info

# Lấy gợi ý cho user thật
curl -X POST http://localhost:5002/api/recommend -H "Content-Type: application/json" -d "{\"user_id\": \"694d32d7ebe694fc49e59a67\", \"top_k\": 5}"
```

---

## Nếu gặp lỗi 

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| `No pre-trained model found` | Thiếu file trong `/model/` | `py train.py` |
| `MONGODB_URI is not set` | Thiếu `.env` | Tạo file `.env` theo mẫu trên |
| `ModuleNotFoundError` | Chưa cài dependencies | `pip install -r requirements.txt` |
| `Address already in use` | Port 5002 đang bị chiếm | Kill process cũ hoặc đổi port trong `.env` |

---

## Thứ tự start đầy đủ (Frontend + Backend + ML)

```powershell
# Terminal 1: ML Service
cd ml_service
py app.py

# Terminal 2: Node.js Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

Node.js backend tự gọi ML service qua `http://localhost:5002`. Nếu ML service chưa chạy, backend fallback sang BM25+Jaccard (Node.js built-in).
