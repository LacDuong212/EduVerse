import os
import math
import time
import logging
from datetime import datetime

import numpy as np
import joblib
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("ml_engine")

BERT_MODEL_NAME = os.getenv("BERT_MODEL", "all-MiniLM-L6-v2")
_bert_model = None


def _get_bert_model():
    global _bert_model
    if _bert_model is None:
        logger.info(f"Loading BERT model: {BERT_MODEL_NAME}...")
        start = time.time()
        _bert_model = SentenceTransformer(BERT_MODEL_NAME)
        logger.info(f"  BERT loaded in {time.time() - start:.1f}s")
    return _bert_model

# Paths
MODEL_DIR = os.getenv("MODEL_PATH", "./model")
BERT_VECTORS_PATH = os.path.join(MODEL_DIR, "bert_vectors.joblib")
COURSE_IDS_PATH = os.path.join(MODEL_DIR, "course_ids.joblib")
ITEM_ITEM_PATH = os.path.join(MODEL_DIR, "item_item_matrix.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "train_metadata.joblib")

# Action weights for user profile
ACTION_WEIGHT = {
    "completed": 3,
    "active": 2,
    "wishlist": 1,
    "interest": 1,
}


def _rating_multiplier(rating):
    if not rating or rating < 1:
        return 1.0
    return ((rating - 1) / 2) # = [0;2]


# TRAINING

def _build_course_text(course: dict) -> str:
    title = course.get("title", "") or ""
    subtitle = course.get("subtitle", "") or ""
    tags = " ".join(course.get("tags", []) or [])
    category = course.get("categoryName", "") or ""
    level = course.get("level", "") or ""
    # Repeat tags for emphasis (cheap field boosting)
    return f"{title} {subtitle} {tags} {tags} {category} {level}"


def train_model(courses: list, interactions: list) -> dict:
    os.makedirs(MODEL_DIR, exist_ok=True)

    if not courses:
        raise ValueError("No courses to train on")

    course_texts = [_build_course_text(c) for c in courses]
    course_ids = [str(c["_id"]) for c in courses]

    # BERT embeddings (semantic content)
    bert = _get_bert_model()
    logger.info("Computing BERT embeddings for courses...")
    start_bert = time.time()
    bert_vectors = bert.encode(course_texts, show_progress_bar=False, normalize_embeddings=True)
    logger.info(
        f"BERT: {bert_vectors.shape[0]} courses × {bert_vectors.shape[1]} dims "
        f"({time.time() - start_bert:.2f}s)"
    )

    # Item-Item Jaccard matrix (collaborative)
    item_item_matrix = _build_jaccard_matrix(interactions, course_ids)

    # Persist artifacts
    joblib.dump(bert_vectors, BERT_VECTORS_PATH)
    joblib.dump(course_ids, COURSE_IDS_PATH)
    joblib.dump(item_item_matrix, ITEM_ITEM_PATH)

    metadata = {
        "trained_at": datetime.utcnow().isoformat(),
        "n_courses": len(courses),
        "n_features_bert": bert_vectors.shape[1],
        "bert_model": BERT_MODEL_NAME,
        "n_interactions": len(interactions),
        "architecture": "Gating: BERT semantic + Item-Item Jaccard CF + popularity",
    }
    joblib.dump(metadata, METADATA_PATH)

    logger.info(f"Model saved to {MODEL_DIR}")
    return metadata


def _build_jaccard_matrix(interactions: list, course_ids: list) -> dict:
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


# PREDICTION

# In-memory cache for loaded model artifacts
_cache = {}


def _load_model():
    if _cache.get("loaded"):
        return True

    required = [
        BERT_VECTORS_PATH,
        COURSE_IDS_PATH,
    ]
    for path in required:
        if not os.path.exists(path):
            logger.warning(f"Model file missing: {path}")
            return False

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
    _cache.clear()
    return _load_model()


def get_model_info() -> dict:
    if not _load_model():
        return {"status": "not_trained"}
    return {**_cache.get("metadata", {}), "status": "ready"}


def predict(
    user_signals: dict,
    candidate_courses: list,
    top_k: int = 8,
) -> list:
    if not _load_model():
        logger.warning("Model not trained, returning empty recommendations")
        return []

    if not candidate_courses:
        return []

    trained_course_ids = _cache["course_ids"]
    trained_bert_vectors = _cache["bert_vectors"]
    item_item = _cache["item_item"]
    id_to_idx = {cid: i for i, cid in enumerate(trained_course_ids)}

    # Build user profile text (weighted by action + rating)
    user_text = _build_user_profile_text(user_signals, candidate_courses)
    if not user_text.strip():
        return []

    # Encode user profile with BERT (for semantic similarity signal)
    bert = _get_bert_model()
    user_bert_vector = bert.encode([user_text], show_progress_bar=False, normalize_embeddings=True)

# Compute CF, semantic similarity and popularity score
    uvec = user_bert_vector[0]
    u_norm = float(np.linalg.norm(uvec)) + 1e-9

    scored = []
    for course in candidate_courses:
        cid = str(course["_id"])

        cf_score = _compute_cf_score(user_signals, cid, item_item)

        idx = id_to_idx.get(cid)
        if idx is not None:
            cvec = trained_bert_vectors[idx]
        else:
            cvec = bert.encode([_build_course_text(course)],
                               show_progress_bar=False,
                               normalize_embeddings=True)[0]
        bert_score = float(np.dot(uvec, cvec) / (u_norm * (np.linalg.norm(cvec) + 1e-9)))

        # Popularity prior — cold-start fallback / tie-break
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
                    "cf": float(round(float(cf_score), 4)),
                    "bert": float(round(float(bert_score), 4)),
                    "popularity": float(round(float(pop_score), 4)),
                },
            }
        )

    tier1 = [s for s in scored if s["scores"]["cf"] > 0]
    tier2 = [s for s in scored if s["scores"]["cf"] == 0]
    tier1.sort(key=lambda s: (s["scores"]["cf"], s["scores"]["bert"]), reverse=True)
    tier2.sort(key=lambda s: (s["scores"]["bert"], s["scores"]["popularity"]), reverse=True)

    ranked = tier1 + tier2
    for s in ranked:
        # Transparency score: CF when present, else semantic similarity
        cf_v = s["scores"]["cf"]
        s["score"] = float(round(cf_v if cf_v > 0 else s["scores"]["bert"], 4))

    return ranked[:top_k]


def _build_user_profile_text(user_signals: dict, candidate_courses: list) -> str:
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
