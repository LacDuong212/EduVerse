"""
EduVerse ML Recommendation Engine
==================================
Hybrid pipeline (Option C — BERT + TF-IDF):
  Layer 1 (Deep Learning) — K-means clustering on BERT embeddings (sentence-transformers)
  Layer 2 (Content)       — Cosine similarity using TF-IDF vectors (best accuracy)
  Layer 3 (CF)            — Item-Item Jaccard collaborative filtering
  Layer 4 (Popularity)    — log(studentsEnrolled + 1) prior

Training:
  - BERT embeddings via sentence-transformers (all-MiniLM-L6-v2, 384-dim)
  - K-means trained on BERT embeddings (better semantic clustering, Silhouette 2x)
  - TF-IDF vectorizer fitted on course text (for content similarity signal)
  - Item-Item Jaccard matrix precomputed from interactions
  - All artifacts persisted via joblib for fast loading

Prediction:
  - Build user profile text from enrollment history + interests
  - BERT-encode user profile → predict cluster (K-means on BERT space)
  - TF-IDF transform user profile → cosine similarity (content signal)
  - Score candidates using 4 weighted signals (cluster, content, CF, popularity)
  - Min-max normalize + fuse → return top-K

Architecture rationale (from evaluation):
  - BERT clustering: Silhouette 0.1243 vs TF-IDF 0.0579 (2x better separation)
  - TF-IDF content: NDCG@5 0.8265 vs BERT 0.7778 (6% better accuracy)
  - Best of both worlds: BERT for semantic grouping, TF-IDF for keyword matching
"""

import os
import math
import time
import logging
from datetime import datetime

import numpy as np
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("ml_engine")

# ── BERT Model ───────────────────────────────────────────────────────────────
BERT_MODEL_NAME = os.getenv("BERT_MODEL", "all-MiniLM-L6-v2")
_bert_model = None


def _get_bert_model():
    """Lazy-load BERT model (avoids loading until first use)."""
    global _bert_model
    if _bert_model is None:
        logger.info(f"Loading BERT model: {BERT_MODEL_NAME}...")
        start = time.time()
        _bert_model = SentenceTransformer(BERT_MODEL_NAME)
        logger.info(f"  BERT loaded in {time.time() - start:.1f}s")
    return _bert_model

# ── Paths ────────────────────────────────────────────────────────────────────
MODEL_DIR = os.getenv("MODEL_PATH", "./model")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")
KMEANS_PATH = os.path.join(MODEL_DIR, "kmeans_model.joblib")
COURSE_VECTORS_PATH = os.path.join(MODEL_DIR, "course_vectors.joblib")
BERT_VECTORS_PATH = os.path.join(MODEL_DIR, "bert_vectors.joblib")
COURSE_IDS_PATH = os.path.join(MODEL_DIR, "course_ids.joblib")
ITEM_ITEM_PATH = os.path.join(MODEL_DIR, "item_item_matrix.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "train_metadata.joblib")

# ── Scoring weights ─────────────────────────────────────────────────────────
W_CLUSTER = 0.25  # K-means cluster proximity
W_CONTENT = 0.35  # TF-IDF cosine similarity
W_CF = 0.30  # Item-item Jaccard CF
W_POPULARITY = 0.10  # Popularity prior

# ── Action weights for user profile ─────────────────────────────────────────
ACTION_WEIGHT = {
    "completed": 3,
    "active": 2,
    "wishlist": 1,
    "interest": 1,
}


def _rating_multiplier(rating):
    """Rating 5★ → 2.0x, 3★ → 1.0x, 1★ → 0.0x"""
    if not rating or rating < 1:
        return 1.0
    return max(0.0, min(2.0, 1.0 + (rating - 3) * 0.5))


# =============================================================================
# TRAINING
# =============================================================================

def _build_course_text(course: dict) -> str:
    """
    Combine course fields into a single text document for TF-IDF.
    Tags are repeated for a field-boost effect (tags are strong signals).
    """
    title = course.get("title", "") or ""
    subtitle = course.get("subtitle", "") or ""
    tags = " ".join(course.get("tags", []) or [])
    category = course.get("categoryName", "") or ""
    level = course.get("level", "") or ""
    # Repeat tags for emphasis (cheap field boosting)
    return f"{title} {subtitle} {tags} {tags} {category} {level}"


def train_model(courses: list, interactions: list, n_clusters: int = None) -> dict:
    """
    Train the full recommendation pipeline:
      1. TF-IDF vectorizer on course text
      2. K-means on course TF-IDF vectors
      3. Item-item Jaccard matrix from interactions

    Args:
        courses: list of course dicts from DB
        interactions: list of { userId, courseId, action, rating? }
        n_clusters: number of K-means clusters (auto-determined if None)

    Returns:
        Training metadata dict
    """
    os.makedirs(MODEL_DIR, exist_ok=True)

    if not courses:
        raise ValueError("No courses to train on")

    # ── Step 1: TF-IDF Vectorization ────────────────────────────────────────
    course_texts = [_build_course_text(c) for c in courses]
    course_ids = [str(c["_id"]) for c in courses]

    vectorizer = TfidfVectorizer(
        max_features=500,  # More than enough for ~30 courses
        ngram_range=(1, 2),  # Capture bigrams like "machine learning"
        min_df=1,  # Keep all terms (small corpus)
        max_df=0.95,  # Remove terms appearing in >95% of docs
        sublinear_tf=True,  # Apply 1 + log(tf) — similar to BM25 saturation
        strip_accents="unicode",
        lowercase=True,
    )
    course_vectors = vectorizer.fit_transform(course_texts)

    logger.info(
        f"TF-IDF: {course_vectors.shape[0]} courses × {course_vectors.shape[1]} features"
    )

    # ── Step 2: BERT Embeddings (Deep Learning) ─────────────────────────────
    bert = _get_bert_model()
    logger.info("Computing BERT embeddings for courses...")
    start_bert = time.time()
    bert_vectors = bert.encode(course_texts, show_progress_bar=False, normalize_embeddings=True)
    logger.info(
        f"BERT: {bert_vectors.shape[0]} courses × {bert_vectors.shape[1]} dims "
        f"({time.time() - start_bert:.2f}s)"
    )

    # ── Step 3: K-means Clustering (on BERT embeddings) ─────────────────────
    # Clustering on BERT space gives better semantic separation:
    # Silhouette BERT=0.1243 vs TF-IDF=0.0579 (2x improvement)
    if n_clusters is None:
        n_clusters = max(2, min(8, int(math.sqrt(len(courses) / 2))))
        n_clusters = min(n_clusters, len(courses) - 1)

    kmeans = KMeans(
        n_clusters=n_clusters,
        random_state=42,
        n_init=10,
        max_iter=300,
    )
    kmeans.fit(bert_vectors)
    cluster_labels = kmeans.labels_

    logger.info(
        f"K-means (on BERT): {n_clusters} clusters, inertia={kmeans.inertia_:.2f}"
    )

    # Log cluster distribution
    unique, counts = np.unique(cluster_labels, return_counts=True)
    for cluster_id, count in zip(unique, counts):
        cluster_course_names = [
            courses[i].get("title", "?")
            for i in range(len(courses))
            if cluster_labels[i] == cluster_id
        ]
        logger.info(f"  Cluster {cluster_id} ({count} courses): {cluster_course_names}")

    # ── Step 4: Item-Item Jaccard Matrix ────────────────────────────────────
    item_item_matrix = _build_jaccard_matrix(interactions, course_ids)

    # ── Step 5: Persist all artifacts ───────────────────────────────────────
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(kmeans, KMEANS_PATH)
    joblib.dump(course_vectors, COURSE_VECTORS_PATH)
    joblib.dump(bert_vectors, BERT_VECTORS_PATH)
    joblib.dump(course_ids, COURSE_IDS_PATH)
    joblib.dump(item_item_matrix, ITEM_ITEM_PATH)

    metadata = {
        "trained_at": datetime.utcnow().isoformat(),
        "n_courses": len(courses),
        "n_features_tfidf": course_vectors.shape[1],
        "n_features_bert": bert_vectors.shape[1],
        "bert_model": BERT_MODEL_NAME,
        "n_clusters": n_clusters,
        "n_interactions": len(interactions),
        "cluster_distribution": {int(k): int(v) for k, v in zip(unique, counts)},
        "inertia": float(kmeans.inertia_),
        "architecture": "Option C: BERT clustering + TF-IDF content",
    }
    joblib.dump(metadata, METADATA_PATH)

    logger.info(f"Model saved to {MODEL_DIR}")
    return metadata


def _build_jaccard_matrix(interactions: list, course_ids: list) -> dict:
    """
    Build item-item Jaccard similarity matrix.
    similarity(A, B) = |Users(A) ∩ Users(B)| / |Users(A) ∪ Users(B)|
    """
    # Build course→users mapping
    course_users = {}
    for it in interactions:
        cid = str(it.get("courseId", ""))
        uid = str(it.get("userId", ""))
        if not cid or not uid:
            continue
        if cid not in course_users:
            course_users[cid] = set()
        course_users[cid].add(uid)

    # Only compute for courses in our trained set
    valid_ids = set(course_ids)
    matrix = {}

    for i, cid_a in enumerate(course_ids):
        users_a = course_users.get(cid_a, set())
        if not users_a:
            continue
        matrix[cid_a] = {}
        for j, cid_b in enumerate(course_ids):
            if i == j:
                continue
            users_b = course_users.get(cid_b, set())
            if not users_b:
                continue
            intersection = len(users_a & users_b)
            union = len(users_a | users_b)
            sim = intersection / union if union > 0 else 0.0
            if sim > 0:
                matrix[cid_a][cid_b] = round(sim, 4)

    logger.info(
        f"Jaccard matrix: {len(matrix)} items with non-zero similarities"
    )
    return matrix


# =============================================================================
# PREDICTION
# =============================================================================

# In-memory cache for loaded model artifacts
_cache = {}


def _load_model():
    """Load trained model artifacts into memory (cached)."""
    if _cache.get("loaded"):
        return True

    required = [VECTORIZER_PATH, KMEANS_PATH, COURSE_VECTORS_PATH, BERT_VECTORS_PATH, COURSE_IDS_PATH]
    for path in required:
        if not os.path.exists(path):
            logger.warning(f"Model file missing: {path}")
            return False

    _cache["vectorizer"] = joblib.load(VECTORIZER_PATH)
    _cache["kmeans"] = joblib.load(KMEANS_PATH)
    _cache["course_vectors"] = joblib.load(COURSE_VECTORS_PATH)
    _cache["bert_vectors"] = joblib.load(BERT_VECTORS_PATH)
    _cache["course_ids"] = joblib.load(COURSE_IDS_PATH)
    _cache["item_item"] = (
        joblib.load(ITEM_ITEM_PATH) if os.path.exists(ITEM_ITEM_PATH) else {}
    )
    _cache["metadata"] = (
        joblib.load(METADATA_PATH) if os.path.exists(METADATA_PATH) else {}
    )
    _cache["loaded"] = True
    logger.info("Model loaded into memory")
    return True


def reload_model():
    """Force reload model from disk (after retraining)."""
    _cache.clear()
    return _load_model()


def get_model_info() -> dict:
    """Return training metadata."""
    if not _load_model():
        return {"status": "not_trained"}
    return {**_cache.get("metadata", {}), "status": "ready"}


def predict(
    user_signals: dict,
    candidate_courses: list,
    top_k: int = 8,
) -> list:
    """
    Generate course recommendations for a user.

    Args:
        user_signals: { enrollments, wishlist, reviews, interests }
        candidate_courses: list of course dicts (already excludes purchased)
        top_k: number of recommendations to return

    Returns:
        list of { courseId, score, scores: { cluster, content, cf, popularity }, cluster }
    """
    if not _load_model():
        logger.warning("Model not trained, returning empty recommendations")
        return []

    if not candidate_courses:
        return []

    vectorizer = _cache["vectorizer"]
    kmeans = _cache["kmeans"]
    trained_course_ids = _cache["course_ids"]
    trained_course_vectors = _cache["course_vectors"]
    trained_bert_vectors = _cache["bert_vectors"]
    item_item = _cache["item_item"]

    # ── Build user profile text (weighted by action + rating) ────────────────
    user_text = _build_user_profile_text(user_signals, candidate_courses)
    if not user_text.strip():
        return []

    # ── Transform user profile to TF-IDF space (for content signal) ─────────
    user_vector = vectorizer.transform([user_text])

    # ── Encode user profile with BERT (for cluster signal) ──────────────────
    bert = _get_bert_model()
    user_bert_vector = bert.encode([user_text], show_progress_bar=False, normalize_embeddings=True)

    # ── Find user's cluster (K-means on BERT space) ─────────────────────────
    user_cluster = kmeans.predict(user_bert_vector)[0]

    # ── Build candidate TF-IDF vectors (for content scoring) ────────────────
    candidate_texts = [_build_course_text(c) for c in candidate_courses]
    candidate_vectors = vectorizer.transform(candidate_texts)

    # ── Encode candidates with BERT (for cluster assignment) ────────────────
    candidate_bert_vectors = bert.encode(candidate_texts, show_progress_bar=False, normalize_embeddings=True)

    # ── Predict cluster for each candidate (BERT space) ─────────────────────
    candidate_clusters = kmeans.predict(candidate_bert_vectors)

    # ── Score each candidate across all 4 signals ────────────────────────────
    scored = []
    for i, course in enumerate(candidate_courses):
        cid = str(course["_id"])

        # Signal 1: CLUSTER proximity (BERT-based K-Means)
        # Same cluster → 1.0; different → decaying by BERT centroid distance
        if candidate_clusters[i] == user_cluster:
            cluster_score = 1.0
        else:
            # Distance between user centroid and candidate centroid (BERT space)
            user_centroid = kmeans.cluster_centers_[user_cluster]
            cand_centroid = kmeans.cluster_centers_[candidate_clusters[i]]
            dist = np.linalg.norm(user_centroid - cand_centroid)
            cluster_score = 1.0 / (1.0 + dist)  # Sigmoid-like decay

        # Signal 2: CONTENT similarity (TF-IDF cosine — best accuracy)
        content_score = float(
            cosine_similarity(user_vector, candidate_vectors[i:i + 1])[0, 0]
        )

        # Signal 3: COLLABORATIVE FILTERING (Jaccard)
        cf_score = _compute_cf_score(user_signals, cid, item_item)

        # Signal 4: POPULARITY prior
        enrolled = course.get("studentsEnrolled", 0) or 0
        rating_data = course.get("rating", {})
        avg_rating = (
            (rating_data.get("total", 0) / rating_data.get("count", 1))
            if rating_data.get("count", 0) > 0
            else 0
        )
        pop_score = math.log(enrolled + 1) + avg_rating * 0.5

        scored.append(
            {
                "courseId": cid,
                "scores": {
                    "cluster": round(cluster_score, 4),
                    "content": round(content_score, 4),
                    "cf": round(cf_score, 4),
                    "popularity": round(pop_score, 4),
                },
                "cluster": int(candidate_clusters[i]),
                "userCluster": int(user_cluster),
            }
        )

    # ── Min-max normalize each signal ────────────────────────────────────────
    for key in ["cluster", "content", "cf", "popularity"]:
        values = [s["scores"][key] for s in scored]
        min_v, max_v = min(values), max(values)
        span = max_v - min_v
        for s in scored:
            if span == 0:
                s["scores"][key] = 1.0 if max_v > 0 else 0.0
            else:
                s["scores"][key] = (s["scores"][key] - min_v) / span

    # ── Weighted fusion ──────────────────────────────────────────────────────
    for s in scored:
        s["score"] = round(
            W_CLUSTER * s["scores"]["cluster"]
            + W_CONTENT * s["scores"]["content"]
            + W_CF * s["scores"]["cf"]
            + W_POPULARITY * s["scores"]["popularity"],
            4,
        )

    # ── Sort and return top-K ────────────────────────────────────────────────
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]


def _build_user_profile_text(user_signals: dict, candidate_courses: list) -> str:
    """
    Build a text representation of the user's taste.
    Uses enrollment/wishlist course data + interests.
    Courses with higher action weight and better rating are repeated more.
    """
    from db import load_courses

    # Create a lookup for all course data
    all_courses = {str(c["_id"]): c for c in load_courses()}

    parts = []

    # Enrolled courses (weighted by status + rating)
    review_map = {
        str(r["course"]): r.get("rating", 0)
        for r in user_signals.get("reviews", [])
    }

    for e in user_signals.get("enrollments", []):
        cid = str(e["course"])
        course = all_courses.get(cid)
        if not course:
            continue

        base_weight = ACTION_WEIGHT.get(e.get("status", "active"), 1)
        rating = review_map.get(cid, 0)
        final_weight = max(1, round(base_weight * _rating_multiplier(rating)))

        text = _build_course_text(course)
        for _ in range(final_weight):
            parts.append(text)

    # Wishlisted courses
    for w in user_signals.get("wishlist", []):
        cid = str(w["course"])
        course = all_courses.get(cid)
        if course:
            parts.append(_build_course_text(course))

    # Interests (from student profile)
    for interest in user_signals.get("interests", []):
        if interest:
            parts.append(str(interest))

    return " ".join(parts)


def _compute_cf_score(user_signals: dict, candidate_id: str, item_item: dict) -> float:
    """
    Score a candidate course using item-item Jaccard CF.
    score(c) = Σ_{h ∈ user_history} weight(h) × sim(h, c)
    """
    if not item_item:
        return 0.0

    review_map = {
        str(r["course"]): r.get("rating", 0)
        for r in user_signals.get("reviews", [])
    }

    total = 0.0
    for e in user_signals.get("enrollments", []):
        cid = str(e["course"])
        weight = ACTION_WEIGHT.get(e.get("status", "active"), 1)
        rating = review_map.get(cid, 0)
        weight *= _rating_multiplier(rating)

        row = item_item.get(cid, {})
        sim = row.get(candidate_id, 0.0)
        total += weight * sim

    for w in user_signals.get("wishlist", []):
        cid = str(w["course"])
        row = item_item.get(cid, {})
        sim = row.get(candidate_id, 0.0)
        total += ACTION_WEIGHT["wishlist"] * sim

    return total
