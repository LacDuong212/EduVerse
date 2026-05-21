"""
EduVerse ML — BERT vs TF-IDF Comparison Evaluation
=====================================================
Compares 3 embedding approaches using the same LOO evaluation framework:
  1. TF-IDF only (current baseline)
  2. BERT only (sentence-transformers)
  3. Hybrid TF-IDF + BERT (averaged embeddings for content signal)

Each approach is evaluated with 4 scoring signals:
  - Cluster (K-Means on respective embeddings)
  - Content (Cosine similarity with respective embeddings)
  - CF (Jaccard — same for all, not affected by embeddings)
  - Popularity (same for all)

Usage:
  py evaluate_bert.py                  # Full comparison
  py evaluate_bert.py --top_k 5        # Specific K
  py evaluate_bert.py --model mini     # Use MiniLM (faster, English)
  py evaluate_bert.py --model multi    # Use multilingual model
"""

import argparse
import logging
import math
import random
import time
from collections import defaultdict
from copy import deepcopy

import numpy as np
import joblib
from dotenv import load_dotenv
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import silhouette_score
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

import db
import engine

logging.basicConfig(level=logging.INFO, format="[%(name)s] %(message)s")
logger = logging.getLogger("bert_eval")

# ═══════════════════════════════════════════════════════════════════════
# BERT EMBEDDING MODULE
# ═══════════════════════════════════════════════════════════════════════

MODELS = {
    "mini": "all-MiniLM-L6-v2",          # 384-dim, English-focused, 90MB, fast
    "multi": "paraphrase-multilingual-MiniLM-L12-v2",  # 384-dim, multilingual, 500MB
}


class BertEmbedder:
    """Wrapper around sentence-transformers for course/user embeddings."""

    def __init__(self, model_name="all-MiniLM-L6-v2"):
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading BERT model: {model_name}...")
        start = time.time()
        self.model = SentenceTransformer(model_name)
        logger.info(f"  Loaded in {time.time() - start:.1f}s")
        self.dim = self.model.get_sentence_embedding_dimension()
        logger.info(f"  Embedding dimension: {self.dim}")

    def encode(self, texts: list[str]) -> np.ndarray:
        """Encode texts to dense vectors. Returns (N, dim) numpy array."""
        return self.model.encode(texts, show_progress_bar=False, normalize_embeddings=True)

    def encode_single(self, text: str) -> np.ndarray:
        """Encode single text. Returns (1, dim) numpy array."""
        return self.model.encode([text], show_progress_bar=False, normalize_embeddings=True)


# ═══════════════════════════════════════════════════════════════════════
# METRICS (same as evaluate.py)
# ═══════════════════════════════════════════════════════════════════════

def precision_at_k(recommended, relevant, k):
    return len(set(recommended[:k]) & relevant) / k

def recall_at_k(recommended, relevant, k):
    if not relevant:
        return 0.0
    return len(set(recommended[:k]) & relevant) / len(relevant)

def hit_rate_at_k(recommended, relevant, k):
    return 1.0 if set(recommended[:k]) & relevant else 0.0

def ndcg_at_k(recommended, relevant, k):
    top_k = recommended[:k]
    dcg = sum(1.0 / math.log2(i + 2) for i, item in enumerate(top_k) if item in relevant)
    n_rel = min(len(relevant), k)
    idcg = sum(1.0 / math.log2(i + 2) for i in range(n_rel))
    return dcg / idcg if idcg > 0 else 0.0


# ═══════════════════════════════════════════════════════════════════════
# SCORING STRATEGIES
# ═══════════════════════════════════════════════════════════════════════

def _score_with_embeddings(candidates, user_signals, course_embeddings, course_id_list,
                           kmeans_model, item_item, user_embedding, top_k):
    """
    Score candidates using a specific embedding type (BERT or TF-IDF).
    Same 4-signal weighted fusion as the main engine.
    """
    W_CLUSTER = 0.25
    W_CONTENT = 0.35
    W_CF = 0.30
    W_POPULARITY = 0.10

    # Map course_id → index in embeddings
    id_to_idx = {cid: i for i, cid in enumerate(course_id_list)}

    # Predict user cluster
    user_cluster = kmeans_model.predict(user_embedding.reshape(1, -1))[0]

    scored = []
    for c in candidates:
        cid = str(c["_id"])
        idx = id_to_idx.get(cid)
        if idx is None:
            continue

        cand_embedding = course_embeddings[idx:idx+1]
        cand_cluster = kmeans_model.predict(cand_embedding)[0]

        # Signal 1: Cluster
        if cand_cluster == user_cluster:
            cluster_score = 1.0
        else:
            user_centroid = kmeans_model.cluster_centers_[user_cluster]
            cand_centroid = kmeans_model.cluster_centers_[cand_cluster]
            dist = np.linalg.norm(user_centroid - cand_centroid)
            cluster_score = 1.0 / (1.0 + dist)

        # Signal 2: Content (cosine similarity)
        content_score = float(cosine_similarity(user_embedding.reshape(1, -1), cand_embedding)[0, 0])

        # Signal 3: CF (Jaccard — same regardless of embedding type)
        cf_score = engine._compute_cf_score(user_signals, cid, item_item)

        # Signal 4: Popularity
        enrolled = c.get("studentsEnrolled", 0) or 0
        rating_data = c.get("rating", {})
        avg_rating = (rating_data.get("total", 0) / rating_data.get("count", 1)
                      if rating_data.get("count", 0) > 0 else 0)
        pop_score = math.log(enrolled + 1) + avg_rating * 0.5

        scored.append({
            "courseId": cid,
            "cluster": cluster_score,
            "content": content_score,
            "cf": cf_score,
            "popularity": pop_score,
        })

    if not scored:
        return []

    # Min-max normalize
    for key in ["cluster", "content", "cf", "popularity"]:
        values = [s[key] for s in scored]
        min_v, max_v = min(values), max(values)
        span = max_v - min_v
        for s in scored:
            s[key] = (s[key] - min_v) / span if span > 0 else (1.0 if max_v > 0 else 0.0)

    # Weighted fusion
    for s in scored:
        s["score"] = (W_CLUSTER * s["cluster"] + W_CONTENT * s["content"]
                      + W_CF * s["cf"] + W_POPULARITY * s["popularity"])

    scored.sort(key=lambda x: x["score"], reverse=True)
    return [s["courseId"] for s in scored[:top_k]]


def _build_user_text(user_signals):
    """Build user profile text for embedding."""
    all_courses = {str(c["_id"]): c for c in db.load_courses()}
    parts = []

    review_map = {str(r["course"]): r.get("rating", 0) for r in user_signals.get("reviews", [])}

    for e in user_signals.get("enrollments", []):
        cid = str(e["course"])
        course = all_courses.get(cid)
        if not course:
            continue
        base_w = engine.ACTION_WEIGHT.get(e.get("status", "active"), 1)
        rating = review_map.get(cid, 0)
        final_w = max(1, round(base_w * engine._rating_multiplier(rating)))
        text = engine._build_course_text(course)
        for _ in range(final_w):
            parts.append(text)

    for w in user_signals.get("wishlist", []):
        cid = str(w["course"])
        course = all_courses.get(cid)
        if course:
            parts.append(engine._build_course_text(course))

    for interest in user_signals.get("interests", []):
        if interest:
            parts.append(str(interest))

    return " ".join(parts)


# ═══════════════════════════════════════════════════════════════════════
# LOO EVALUATION
# ═══════════════════════════════════════════════════════════════════════

def run_comparison(top_k_values: list[int], bert_model_name: str):
    """Run LOO evaluation comparing TF-IDF, BERT, and Hybrid(TF-IDF+BERT)."""

    logger.info("=" * 70)
    logger.info("BERT vs TF-IDF — Leave-One-Out Comparison")
    logger.info("=" * 70)

    # ── Load data ──
    all_courses = db.load_courses()
    interactions = db.load_interactions()
    course_texts = [engine._build_course_text(c) for c in all_courses]
    course_id_list = [str(c["_id"]) for c in all_courses]

    # ── Prepare TF-IDF ──
    logger.info("\n[TF-IDF] Fitting vectorizer...")
    tfidf_vectorizer = TfidfVectorizer(
        max_features=500, ngram_range=(1, 2), min_df=1, max_df=0.95,
        sublinear_tf=True, strip_accents="unicode", lowercase=True,
    )
    tfidf_vectors = tfidf_vectorizer.fit_transform(course_texts)
    tfidf_dense = tfidf_vectors.toarray()
    logger.info(f"  Shape: {tfidf_dense.shape}")

    # ── Prepare BERT ──
    bert = BertEmbedder(bert_model_name)
    logger.info("[BERT] Encoding courses...")
    start = time.time()
    bert_vectors = bert.encode(course_texts)
    logger.info(f"  Shape: {bert_vectors.shape}, took {time.time() - start:.2f}s")

    # ── Prepare Hybrid (concatenate normalized TF-IDF + BERT) ──
    # Normalize TF-IDF to unit vectors for fair combination
    tfidf_norms = np.linalg.norm(tfidf_dense, axis=1, keepdims=True)
    tfidf_norms[tfidf_norms == 0] = 1.0
    tfidf_normalized = tfidf_dense / tfidf_norms
    # BERT is already normalized (normalize_embeddings=True)
    hybrid_vectors = np.hstack([tfidf_normalized * 0.5, bert_vectors * 0.5])
    logger.info(f"[Hybrid] Shape: {hybrid_vectors.shape} (TF-IDF 500 + BERT {bert.dim})")

    # ── K-Means for each embedding type ──
    n_clusters = 4
    logger.info(f"\n[Clustering] K-Means with K={n_clusters}...")

    kmeans_tfidf = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans_tfidf.fit(tfidf_dense)
    sil_tfidf = silhouette_score(tfidf_dense, kmeans_tfidf.labels_)
    logger.info(f"  TF-IDF Silhouette: {sil_tfidf:.4f}")

    kmeans_bert = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans_bert.fit(bert_vectors)
    sil_bert = silhouette_score(bert_vectors, kmeans_bert.labels_)
    logger.info(f"  BERT Silhouette:   {sil_bert:.4f}")

    kmeans_hybrid = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans_hybrid.fit(hybrid_vectors)
    sil_hybrid = silhouette_score(hybrid_vectors, kmeans_hybrid.labels_)
    logger.info(f"  Hybrid Silhouette: {sil_hybrid:.4f}")

    # ── Item-Item Jaccard (shared) ──
    item_item = joblib.load(engine.ITEM_ITEM_PATH)

    # ── Find eligible users ──
    user_enrollments = defaultdict(list)
    for it in interactions:
        if it["action"] in ("active", "completed"):
            user_enrollments[it["userId"]].append(it["courseId"])
    eligible_users = {uid: cids for uid, cids in user_enrollments.items() if len(cids) >= 2}
    logger.info(f"\nEligible users for LOO: {len(eligible_users)}")
    total_folds = sum(len(cids) for cids in eligible_users.values())
    logger.info(f"Total folds: {total_folds}")

    # ── Define strategies ──
    approaches = {
        "TF-IDF (baseline)": {
            "vectors": tfidf_dense,
            "kmeans": kmeans_tfidf,
            "vectorizer": tfidf_vectorizer,
            "bert": None,
        },
        "BERT": {
            "vectors": bert_vectors,
            "kmeans": kmeans_bert,
            "vectorizer": None,
            "bert": bert,
        },
        "Hybrid (TF-IDF+BERT)": {
            "vectors": hybrid_vectors,
            "kmeans": kmeans_hybrid,
            "vectorizer": tfidf_vectorizer,
            "bert": bert,
        },
    }

    results = {}

    for k in top_k_values:
        logger.info(f"\n{'='*60}")
        logger.info(f"  EVALUATING @{k}")
        logger.info(f"{'='*60}")
        k_results = {}

        for approach_name, config in approaches.items():
            logger.info(f"\n  [{approach_name}]")
            all_p, all_r, all_h, all_n = [], [], [], []
            start = time.time()

            for uid, enrolled_ids in eligible_users.items():
                for held_out_idx in range(len(enrolled_ids)):
                    held_out_id = enrolled_ids[held_out_idx]
                    remaining_ids = [cid for i, cid in enumerate(enrolled_ids) if i != held_out_idx]

                    # Modified signals
                    full_signals = db.load_user_signals(uid)
                    modified_signals = deepcopy(full_signals)
                    modified_signals["enrollments"] = [
                        e for e in modified_signals["enrollments"]
                        if str(e["course"]) != held_out_id
                    ]

                    # Candidates
                    candidates = [c for c in all_courses if str(c["_id"]) not in set(remaining_ids)]

                    # Build user embedding
                    user_text = _build_user_text(modified_signals)
                    if not user_text.strip():
                        continue

                    if approach_name == "TF-IDF (baseline)":
                        user_emb = config["vectorizer"].transform([user_text]).toarray()[0]
                        # Normalize
                        norm = np.linalg.norm(user_emb)
                        if norm > 0:
                            user_emb = user_emb / norm
                    elif approach_name == "BERT":
                        user_emb = config["bert"].encode_single(user_text)[0]
                    else:  # Hybrid
                        tfidf_emb = config["vectorizer"].transform([user_text]).toarray()[0]
                        norm = np.linalg.norm(tfidf_emb)
                        if norm > 0:
                            tfidf_emb = tfidf_emb / norm
                        bert_emb = config["bert"].encode_single(user_text)[0]
                        user_emb = np.concatenate([tfidf_emb * 0.5, bert_emb * 0.5])

                    # Score
                    rec = _score_with_embeddings(
                        candidates, modified_signals,
                        config["vectors"], course_id_list,
                        config["kmeans"], item_item, user_emb, k
                    )

                    relevant = {held_out_id}
                    all_p.append(precision_at_k(rec, relevant, k))
                    all_r.append(recall_at_k(rec, relevant, k))
                    all_h.append(hit_rate_at_k(rec, relevant, k))
                    all_n.append(ndcg_at_k(rec, relevant, k))

            elapsed = time.time() - start
            metrics = {
                "Precision": round(np.mean(all_p), 4),
                "Recall": round(np.mean(all_r), 4),
                "Hit Rate": round(np.mean(all_h), 4),
                "NDCG": round(np.mean(all_n), 4),
                "n_folds": len(all_p),
                "time_seconds": round(elapsed, 1),
            }
            k_results[approach_name] = metrics
            logger.info(f"    P@{k}={metrics['Precision']:.4f}  R@{k}={metrics['Recall']:.4f}  "
                        f"HR@{k}={metrics['Hit Rate']:.4f}  NDCG@{k}={metrics['NDCG']:.4f}  "
                        f"({elapsed:.1f}s, {metrics['n_folds']} folds)")

        results[f"@{k}"] = k_results

    # ── Summary ──
    logger.info("\n" + "=" * 70)
    logger.info("SUMMARY — Silhouette Scores")
    logger.info("=" * 70)
    logger.info(f"  TF-IDF:  {sil_tfidf:.4f}")
    logger.info(f"  BERT:    {sil_bert:.4f}")
    logger.info(f"  Hybrid:  {sil_hybrid:.4f}")

    logger.info("\n" + "=" * 70)
    logger.info("SUMMARY — LOO Results")
    logger.info("=" * 70)
    for k_label, k_results in results.items():
        logger.info(f"\n  {k_label}:")
        logger.info(f"  {'Approach':<25s} | {'P':>6s} | {'R':>6s} | {'HR':>6s} | {'NDCG':>6s} | {'Time':>5s}")
        logger.info(f"  {'-'*25}-+-{'-'*6}-+-{'-'*6}-+-{'-'*6}-+-{'-'*6}-+-{'-'*5}")
        for name, m in k_results.items():
            logger.info(f"  {name:<25s} | {m['Precision']:>6.4f} | {m['Recall']:>6.4f} | "
                        f"{m['Hit Rate']:>6.4f} | {m['NDCG']:>6.4f} | {m['time_seconds']:>4.1f}s")

    # ── Analysis ──
    logger.info("\n" + "=" * 70)
    logger.info("ANALYSIS")
    logger.info("=" * 70)

    for k_label, k_results in results.items():
        best_approach = max(k_results.items(), key=lambda x: x[1]["NDCG"])
        worst_approach = min(k_results.items(), key=lambda x: x[1]["NDCG"])
        logger.info(f"\n  {k_label}:")
        logger.info(f"    Best NDCG:  {best_approach[0]} ({best_approach[1]['NDCG']:.4f})")
        logger.info(f"    Worst NDCG: {worst_approach[0]} ({worst_approach[1]['NDCG']:.4f})")

        # Compare BERT vs TF-IDF
        tfidf_ndcg = k_results.get("TF-IDF (baseline)", {}).get("NDCG", 0)
        bert_ndcg = k_results.get("BERT", {}).get("NDCG", 0)
        hybrid_ndcg = k_results.get("Hybrid (TF-IDF+BERT)", {}).get("NDCG", 0)

        if bert_ndcg > tfidf_ndcg:
            diff = (bert_ndcg - tfidf_ndcg) / tfidf_ndcg * 100
            logger.info(f"    BERT > TF-IDF by {diff:.1f}%")
        else:
            diff = (tfidf_ndcg - bert_ndcg) / tfidf_ndcg * 100
            logger.info(f"    TF-IDF > BERT by {diff:.1f}%")

        if hybrid_ndcg > max(tfidf_ndcg, bert_ndcg):
            logger.info(f"    Hybrid wins — combining both is beneficial")
        else:
            logger.info(f"    Hybrid does NOT outperform best single approach")

    return results


def main():
    parser = argparse.ArgumentParser(description="BERT vs TF-IDF evaluation")
    parser.add_argument("--top_k", type=int, nargs="+", default=[5, 8])
    parser.add_argument("--model", choices=["mini", "multi"], default="mini",
                        help="BERT model: 'mini' (English, fast) or 'multi' (multilingual)")
    args = parser.parse_args()

    model_name = MODELS[args.model]
    results = run_comparison(args.top_k, model_name)

    logger.info("\nDone!")


if __name__ == "__main__":
    main()
