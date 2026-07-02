"""
EduVerse ML — Comprehensive Evaluation Script
===============================================
Produces thesis-ready evaluation results:
  1. Leave-One-Out (LOO): Precision@K, Recall@K, Hit Rate@K, NDCG@K
  2. Baseline Comparison: Random / Popularity / Content-only / CF-only / Hybrid
  3. Elbow Method: Silhouette Score for K=2..8

Usage:
  py evaluate.py               # Run all evaluations
  py evaluate.py --top_k 5     # Evaluate with top-5
  py evaluate.py --top_k 5 8   # Multiple K values
"""

import argparse
import logging
import math
import os
import random
import json
from collections import defaultdict
from copy import deepcopy
from datetime import datetime

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
logger = logging.getLogger("evaluator")


# ═══════════════════════════════════════════════════════════════════════
# METRICS
# ═══════════════════════════════════════════════════════════════════════

def precision_at_k(recommended: list, relevant: set, k: int) -> float:
    """Precision@K = |recommended ∩ relevant| / K"""
    top_k = recommended[:k]
    hits = len(set(top_k) & relevant)
    return hits / k


def recall_at_k(recommended: list, relevant: set, k: int) -> float:
    """Recall@K = |recommended ∩ relevant| / |relevant|"""
    if not relevant:
        return 0.0
    top_k = recommended[:k]
    hits = len(set(top_k) & relevant)
    return hits / len(relevant)


def hit_rate_at_k(recommended: list, relevant: set, k: int) -> float:
    """Hit Rate@K = 1 if any relevant item in top-K, else 0"""
    top_k = set(recommended[:k])
    return 1.0 if top_k & relevant else 0.0


def ndcg_at_k(recommended: list, relevant: set, k: int) -> float:
    """NDCG@K — Normalized Discounted Cumulative Gain"""
    top_k = recommended[:k]
    dcg = 0.0
    for i, item in enumerate(top_k):
        if item in relevant:
            dcg += 1.0 / math.log2(i + 2)  # i+2 because i is 0-indexed

    # IDCG: best possible DCG (all relevant items at top)
    n_relevant_in_k = min(len(relevant), k)
    idcg = sum(1.0 / math.log2(i + 2) for i in range(n_relevant_in_k))

    return dcg / idcg if idcg > 0 else 0.0


# ═══════════════════════════════════════════════════════════════════════
# BASELINE STRATEGIES
# ═══════════════════════════════════════════════════════════════════════

def _strategy_random(candidates, user_signals, vectorizer, kmeans, course_vectors,
                     course_ids, item_item, top_k):
    """Random baseline — shuffled candidate list."""
    ids = [str(c["_id"]) for c in candidates]
    random.shuffle(ids)
    return ids[:top_k]


def _strategy_popularity(candidates, user_signals, vectorizer, kmeans, course_vectors,
                         course_ids, item_item, top_k):
    """Popularity baseline — rank by studentsEnrolled."""
    scored = []
    for c in candidates:
        enrolled = c.get("studentsEnrolled", 0) or 0
        scored.append((str(c["_id"]), enrolled))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [s[0] for s in scored[:top_k]]


def _strategy_content_only(candidates, user_signals, vectorizer, kmeans, course_vectors,
                           course_ids, item_item, top_k):
    """Content-only — TF-IDF cosine similarity, no clustering/CF/popularity."""
    user_text = _build_profile(user_signals, candidates)
    if not user_text.strip():
        return [str(c["_id"]) for c in candidates[:top_k]]

    user_vec = vectorizer.transform([user_text])
    cand_texts = [engine._build_course_text(c) for c in candidates]
    cand_vecs = vectorizer.transform(cand_texts)

    scores = cosine_similarity(user_vec, cand_vecs)[0]
    indexed = [(str(candidates[i]["_id"]), scores[i]) for i in range(len(candidates))]
    indexed.sort(key=lambda x: x[1], reverse=True)
    return [s[0] for s in indexed[:top_k]]


def _strategy_cf_only(candidates, user_signals, vectorizer, kmeans, course_vectors,
                      course_ids, item_item, top_k):
    """CF-only — Jaccard item-item collaborative filtering."""
    scored = []
    for c in candidates:
        cid = str(c["_id"])
        cf = engine._compute_cf_score(user_signals, cid, item_item)
        scored.append((cid, cf))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [s[0] for s in scored[:top_k]]


def _strategy_engine(candidates, user_signals, vectorizer, kmeans, course_vectors,
                     course_ids, item_item, top_k):
    """Whatever engine.predict() currently implements (now: gated pipeline)."""
    results = engine.predict(user_signals, candidates, top_k)
    return [r["courseId"] for r in results]


def _strategy_weighted_old(candidates, user_signals, vectorizer, kmeans, course_vectors,
                           course_ids, item_item, top_k, w=(0.25, 0.35, 0.30, 0.10)):
    """Original 4-signal weighted fusion (cluster + content + cf + popularity),
    min-max normalized. Kept to reproduce the pre-gating baseline (~0.668)."""
    engine._load_model()
    id2idx = {c: i for i, c in enumerate(engine._cache["course_ids"])}
    course_clusters = engine._cache["course_clusters"]
    bert = engine._get_bert_model()

    user_text = _build_profile(user_signals, candidates)
    if not user_text.strip():
        return [str(c["_id"]) for c in candidates[:top_k]]
    u_tfidf = vectorizer.transform([user_text])
    u_bert = bert.encode([user_text], show_progress_bar=False, normalize_embeddings=True)
    user_cluster = kmeans.predict(u_bert)[0]
    cand_texts = [engine._build_course_text(c) for c in candidates]
    cand_tfidf = vectorizer.transform(cand_texts)

    rows = []
    for i, c in enumerate(candidates):
        cid = str(c["_id"])
        idx = id2idx.get(cid)
        cc = course_clusters[idx] if idx is not None else kmeans.predict(
            bert.encode([cand_texts[i]], show_progress_bar=False, normalize_embeddings=True))[0]
        if cc == user_cluster:
            cl = 1.0
        else:
            d = np.linalg.norm(kmeans.cluster_centers_[user_cluster]
                               - kmeans.cluster_centers_[cc])
            cl = 1.0 / (1.0 + d)
        content = float(cosine_similarity(u_tfidf, cand_tfidf[i:i + 1])[0, 0])
        cf = engine._compute_cf_score(user_signals, cid, item_item)
        pop = math.log((c.get("studentsEnrolled", 0) or 0) + 1)
        rows.append([cid, cl, content, cf, pop])

    arr = np.array([r[1:] for r in rows], dtype=float)
    for j in range(4):
        col = arr[:, j]
        lo, hi = col.min(), col.max()
        arr[:, j] = (col - lo) / (hi - lo) if hi > lo else (1.0 if hi > 0 else 0.0)
    scores = arr @ np.array(w)
    order = np.argsort(-scores)
    return [rows[i][0] for i in order[:top_k]]


# ── BERT-cosine + gating helpers (new pipeline) ──────────────────────────────
_bert_lookup_cache = None


def _bert_lookup():
    """(id->index, normalized bert vectors) from the trained model, cached."""
    global _bert_lookup_cache
    if _bert_lookup_cache is None:
        engine._load_model()
        ids = engine._cache["course_ids"]
        _bert_lookup_cache = (
            {c: i for i, c in enumerate(ids)},
            engine._cache["bert_vectors"],
        )
    return _bert_lookup_cache


def _bert_user_emb(user_signals, candidates):
    """Encode the user profile text into a normalized BERT embedding."""
    text = _build_profile(user_signals, candidates)
    if not text.strip():
        return None
    bert = engine._get_bert_model()
    return bert.encode([text], show_progress_bar=False, normalize_embeddings=True)[0]


def _bert_score(user_emb, cid, id2idx, bert_vecs):
    """Cosine = dot product (vectors are normalized). 0 if unavailable."""
    if user_emb is None:
        return 0.0
    idx = id2idx.get(cid)
    return float(np.dot(user_emb, bert_vecs[idx])) if idx is not None else 0.0


def _strategy_bert_only(candidates, user_signals, vectorizer, kmeans, course_vectors,
                        course_ids, item_item, top_k):
    """Semantic content via BERT embedding cosine (deep-learning signal)."""
    id2idx, bert_vecs = _bert_lookup()
    user_emb = _bert_user_emb(user_signals, candidates)
    scored = [(str(c["_id"]), _bert_score(user_emb, str(c["_id"]), id2idx, bert_vecs))
              for c in candidates]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [cid for cid, _ in scored[:top_k]]


def _strategy_gated_bert(candidates, user_signals, vectorizer, kmeans, course_vectors,
                         course_ids, item_item, top_k):
    """New pipeline: CF-led gating, BERT-cosine + popularity as fallback/tie-break.

    Tier 1 (cf>0): trust CF (BERT as tie-break).
    Tier 2 (cf==0): CF is blind → rank by BERT semantic similarity (pop tie-break).
    Tier 1 always ranks above Tier 2 — prevents content-similar-but-not-co-enrolled
    distractors from leapfrogging the CF-correct answer. Handles cold-start naturally.
    """
    id2idx, bert_vecs = _bert_lookup()
    user_emb = _bert_user_emb(user_signals, candidates)

    rows = []
    for c in candidates:
        cid = str(c["_id"])
        cf = engine._compute_cf_score(user_signals, cid, item_item)
        bert = _bert_score(user_emb, cid, id2idx, bert_vecs)
        pop = math.log((c.get("studentsEnrolled", 0) or 0) + 1)
        rows.append((cid, cf, bert, pop))

    tier1 = sorted([r for r in rows if r[1] > 0], key=lambda r: (r[1], r[2]), reverse=True)
    tier2 = sorted([r for r in rows if r[1] == 0], key=lambda r: (r[2], r[3]), reverse=True)
    return [r[0] for r in (tier1 + tier2)[:top_k]]


def _make_soft_gated(alpha):
    """Soft gating: keep tier separation (cf>0 above cf==0) but, WITHIN tier-1,
    blend CF with BERT — score = (1-alpha)*cf_norm + alpha*bert_norm (normalized
    within tier-1). Lets BERT refine ranking among co-enrolled courses without
    reintroducing the cross-tier distractor problem. alpha small → CF leads."""
    def _norm(v, lo, hi):
        return (v - lo) / (hi - lo) if hi > lo else (1.0 if hi > 0 else 0.0)

    def strat(candidates, user_signals, vectorizer, kmeans, course_vectors,
              course_ids, item_item, top_k):
        id2idx, bert_vecs = _bert_lookup()
        user_emb = _bert_user_emb(user_signals, candidates)
        rows = []
        for c in candidates:
            cid = str(c["_id"])
            cf = engine._compute_cf_score(user_signals, cid, item_item)
            bert = _bert_score(user_emb, cid, id2idx, bert_vecs)
            pop = math.log((c.get("studentsEnrolled", 0) or 0) + 1)
            rows.append((cid, cf, bert, pop))

        tier1 = [r for r in rows if r[1] > 0]
        tier2 = [r for r in rows if r[1] == 0]

        if tier1:
            cfs = [r[1] for r in tier1]
            bes = [r[2] for r in tier1]
            cmin, cmax, bmin, bmax = min(cfs), max(cfs), min(bes), max(bes)
            tier1.sort(
                key=lambda r: (1 - alpha) * _norm(r[1], cmin, cmax)
                + alpha * _norm(r[2], bmin, bmax),
                reverse=True,
            )
        tier2.sort(key=lambda r: (r[2], r[3]), reverse=True)
        return [r[0] for r in (tier1 + tier2)[:top_k]]

    return strat


def _build_profile(user_signals, candidate_courses):
    """Replicate engine._build_user_profile_text without importing circular."""
    all_courses = {str(c["_id"]): c for c in db.load_courses()}
    parts = []

    review_map = {
        str(r["course"]): r.get("rating", 0)
        for r in user_signals.get("reviews", [])
    }

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
# EVALUATION 1: Leave-One-Out Cross-Validation
# ═══════════════════════════════════════════════════════════════════════

def leave_one_out_evaluation(top_k_values: list[int]):
    """
    For each user with ≥2 enrollments:
      - For each enrolled course, hold it out
      - Predict with remaining profile
      - Check if held-out course appears in top-K
    """
    logger.info("=" * 70)
    logger.info("EVALUATION 1: Leave-One-Out Cross-Validation")
    logger.info("=" * 70)

    # Load model artifacts
    vectorizer = joblib.load(engine.VECTORIZER_PATH)
    kmeans = joblib.load(engine.KMEANS_PATH)
    course_vectors = joblib.load(engine.COURSE_VECTORS_PATH)
    course_ids = joblib.load(engine.COURSE_IDS_PATH)
    item_item = joblib.load(engine.ITEM_ITEM_PATH)

    # Find all users with ≥2 enrollments
    interactions = db.load_interactions()
    user_enrollments = defaultdict(list)
    for it in interactions:
        if it["action"] in ("active", "completed"):
            user_enrollments[it["userId"]].append(it["courseId"])

    eligible_users = {uid: cids for uid, cids in user_enrollments.items()
                      if len(cids) >= 2}

    if not eligible_users:
        logger.warning("No users with ≥2 enrollments for LOO evaluation")
        return {}

    logger.info(f"Eligible users for LOO: {len(eligible_users)}")
    for uid, cids in eligible_users.items():
        logger.info(f"  User {uid}: {len(cids)} enrollments")

    all_courses = db.load_courses()
    all_course_ids = {str(c["_id"]) for c in all_courses}

    strategies = {
        "Random": _strategy_random,
        "Popularity": _strategy_popularity,
        "Content-only": _strategy_content_only,
        "BERT-only": _strategy_bert_only,
        "CF-only": _strategy_cf_only,
        "Hybrid-weighted (old)": _strategy_weighted_old,
        "Gated-hard": _strategy_gated_bert,
        "Gated-soft a=0.3": _make_soft_gated(0.3),
        "Gated-soft a=0.5": _make_soft_gated(0.5),
        "Engine.predict (gated/prod)": _strategy_engine,
    }

    results = {}

    for k in top_k_values:
        logger.info(f"\n--- Evaluating @{k} ---")
        strategy_metrics = {}

        for strategy_name, strategy_fn in strategies.items():
            # Stratified accumulation: "all" + "cold" (2-3 enroll) + "warm" (4+)
            acc = {s: {"p": [], "r": [], "h": [], "n": []}
                   for s in ("all", "cold", "warm", "cf+", "cf0")}

            def _stratum(n_enroll):
                return "cold" if n_enroll <= 3 else "warm"

            for uid, enrolled_ids in eligible_users.items():
                strat = _stratum(len(enrolled_ids))
                for held_out_idx in range(len(enrolled_ids)):
                    held_out_id = enrolled_ids[held_out_idx]
                    remaining_ids = [cid for i, cid in enumerate(enrolled_ids)
                                     if i != held_out_idx]

                    # Build modified user signals
                    full_signals = db.load_user_signals(uid)
                    modified_signals = deepcopy(full_signals)
                    modified_signals["enrollments"] = [
                        e for e in modified_signals["enrollments"]
                        if str(e["course"]) != held_out_id
                    ]

                    # Candidate courses = all courses minus remaining enrollments
                    candidates = [c for c in all_courses
                                  if str(c["_id"]) not in set(remaining_ids)]

                    relevant = {held_out_id}

                    # Bucket the fold by whether the held-out course has CF signal
                    held_cf = engine._compute_cf_score(modified_signals, held_out_id, item_item)
                    cfb = "cf+" if held_cf > 0 else "cf0"

                    if strategy_name == "Random":
                        # Average over multiple random runs
                        sub_p, sub_r, sub_h, sub_n = [], [], [], []
                        for _ in range(50):
                            rec = strategy_fn(candidates, modified_signals,
                                              vectorizer, kmeans, course_vectors,
                                              course_ids, item_item, k)
                            sub_p.append(precision_at_k(rec, relevant, k))
                            sub_r.append(recall_at_k(rec, relevant, k))
                            sub_h.append(hit_rate_at_k(rec, relevant, k))
                            sub_n.append(ndcg_at_k(rec, relevant, k))
                        p, r, h, n = (np.mean(sub_p), np.mean(sub_r),
                                      np.mean(sub_h), np.mean(sub_n))
                    else:
                        rec = strategy_fn(candidates, modified_signals,
                                          vectorizer, kmeans, course_vectors,
                                          course_ids, item_item, k)
                        p = precision_at_k(rec, relevant, k)
                        r = recall_at_k(rec, relevant, k)
                        h = hit_rate_at_k(rec, relevant, k)
                        n = ndcg_at_k(rec, relevant, k)

                    for tgt in ("all", strat, cfb):
                        acc[tgt]["p"].append(p)
                        acc[tgt]["r"].append(r)
                        acc[tgt]["h"].append(h)
                        acc[tgt]["n"].append(n)

            def _summ(d):
                return {
                    "Precision": round(float(np.mean(d["p"])), 4) if d["p"] else None,
                    "Recall": round(float(np.mean(d["r"])), 4) if d["r"] else None,
                    "Hit Rate": round(float(np.mean(d["h"])), 4) if d["h"] else None,
                    "NDCG": round(float(np.mean(d["n"])), 4) if d["n"] else None,
                    "n_folds": len(d["p"]),
                }

            avg_metrics = _summ(acc["all"])
            avg_metrics["cold"] = _summ(acc["cold"])
            avg_metrics["warm"] = _summ(acc["warm"])
            avg_metrics["cf+"] = _summ(acc["cf+"])
            avg_metrics["cf0"] = _summ(acc["cf0"])
            strategy_metrics[strategy_name] = avg_metrics

            c, w = avg_metrics["cold"], avg_metrics["warm"]
            cp, cz = avg_metrics["cf+"], avg_metrics["cf0"]

            def _n(m):
                return m["NDCG"] if m["NDCG"] is not None else float("nan")

            logger.info(f"  {strategy_name:24s} | NDCG@{k}={avg_metrics['NDCG']:.4f} "
                         f"R@{k}={avg_metrics['Recall']:.4f} (n={avg_metrics['n_folds']})")
            logger.info(f"  {'':24s} |   cold={_n(c):.4f}(n{c['n_folds']}) warm={_n(w):.4f}(n{w['n_folds']})"
                         f"  |  cf+={_n(cp):.4f}(n{cp['n_folds']}) cf0={_n(cz):.4f}(n{cz['n_folds']})")

        results[f"@{k}"] = strategy_metrics

    return results


# ═══════════════════════════════════════════════════════════════════════
# EVALUATION 2: Catalog Coverage & Diversity
# ═══════════════════════════════════════════════════════════════════════

def coverage_evaluation(top_k: int = 8):
    """
    Catalog Coverage: % of total courses that appear in ANY user's top-K
    Diversity: average pairwise distance between recommended courses
    """
    logger.info("=" * 70)
    logger.info("EVALUATION 2: Coverage & Diversity")
    logger.info("=" * 70)

    all_courses = db.load_courses()
    all_course_ids = set(str(c["_id"]) for c in all_courses)

    # Get all users with any interaction
    interactions = db.load_interactions()
    user_ids = set(it["userId"] for it in interactions)

    # Also include users with interests only
    db_handle = db.get_db()
    students_with_interests = db_handle.students.find(
        {"interests": {"$exists": True, "$ne": []}},
        {"user": 1}
    )
    for s in students_with_interests:
        user_ids.add(str(s["user"]))

    recommended_courses = set()
    all_recs = []

    for uid in user_ids:
        signals = db.load_user_signals(uid)
        enrolled_ids = {str(e["course"]) for e in signals.get("enrollments", [])}
        candidates = [c for c in all_courses if str(c["_id"]) not in enrolled_ids]

        if not candidates:
            continue

        recs = engine.predict(signals, candidates, top_k)
        rec_ids = [r["courseId"] for r in recs]
        recommended_courses.update(rec_ids)
        all_recs.append(rec_ids)

    coverage = len(recommended_courses) / len(all_course_ids) * 100 if all_course_ids else 0

    # Diversity: average intra-list distance (1 - cosine_similarity)
    vectorizer = joblib.load(engine.VECTORIZER_PATH)
    diversities = []
    for rec_ids in all_recs:
        if len(rec_ids) < 2:
            continue
        course_lookup = {str(c["_id"]): c for c in all_courses}
        texts = [engine._build_course_text(course_lookup[cid]) for cid in rec_ids
                 if cid in course_lookup]
        if len(texts) < 2:
            continue
        vecs = vectorizer.transform(texts)
        sim_matrix = cosine_similarity(vecs)
        n = sim_matrix.shape[0]
        # Average pairwise distance = 1 - average pairwise similarity
        avg_sim = (sim_matrix.sum() - n) / (n * (n - 1)) if n > 1 else 0
        diversities.append(1 - avg_sim)

    avg_diversity = np.mean(diversities) if diversities else 0

    logger.info(f"  Users evaluated: {len(user_ids)}")
    logger.info(f"  Unique courses recommended: {len(recommended_courses)} / {len(all_course_ids)}")
    logger.info(f"  Catalog Coverage: {coverage:.1f}%")
    logger.info(f"  Average Intra-list Diversity: {avg_diversity:.4f}")

    return {
        "users_evaluated": len(user_ids),
        "unique_recommended": len(recommended_courses),
        "total_courses": len(all_course_ids),
        "coverage_pct": round(coverage, 2),
        "avg_diversity": round(avg_diversity, 4),
    }


# ═══════════════════════════════════════════════════════════════════════
# EVALUATION 3: Elbow Method & Silhouette Analysis
# ═══════════════════════════════════════════════════════════════════════

def elbow_silhouette_analysis(k_range=None):
    """
    Train K-means with different K values and measure:
      - Inertia (WCSS) for Elbow method
      - Silhouette Score for cluster quality
    """
    logger.info("=" * 70)
    logger.info("EVALUATION 3: Elbow Method & Silhouette Analysis")
    logger.info("=" * 70)

    if k_range is None:
        k_range = range(2, 9)

    courses = db.load_courses()
    course_texts = [engine._build_course_text(c) for c in courses]

    vectorizer = TfidfVectorizer(
        max_features=500, ngram_range=(1, 2), min_df=1, max_df=0.95,
        sublinear_tf=True, strip_accents="unicode", lowercase=True,
    )
    vectors = vectorizer.fit_transform(course_texts)
    vectors_dense = vectors.toarray()

    results = []

    logger.info(f"\n  {'K':>3} | {'Inertia':>10} | {'Silhouette':>10} | Distribution")
    logger.info(f"  {'-'*3}-+-{'-'*10}-+-{'-'*10}-+-{'-'*30}")

    for k in k_range:
        if k >= len(courses):
            break

        km = KMeans(n_clusters=k, random_state=42, n_init=10, max_iter=300)
        km.fit(vectors)

        sil = silhouette_score(vectors_dense, km.labels_)
        unique, counts = np.unique(km.labels_, return_counts=True)
        dist = {int(u): int(c) for u, c in zip(unique, counts)}
        dist_str = ", ".join(f"{v}" for v in sorted(dist.values(), reverse=True))

        results.append({
            "k": k,
            "inertia": round(float(km.inertia_), 4),
            "silhouette": round(float(sil), 4),
            "distribution": dist,
        })

        marker = " ◄── current" if k == 4 else ""
        logger.info(f"  {k:3d} | {km.inertia_:10.4f} | {sil:10.4f} | [{dist_str}]{marker}")

    # Find best K by silhouette
    best = max(results, key=lambda x: x["silhouette"])
    logger.info(f"\n  Best K by Silhouette: K={best['k']} (score={best['silhouette']:.4f})")

    return results


# ═══════════════════════════════════════════════════════════════════════
# EVALUATION 4: Trained Matrix Factorization (implicit ALS) — model-based CF
# ═══════════════════════════════════════════════════════════════════════

def _train_als(R, dim=16, reg=0.1, iters=15, alpha=10.0):
    """Implicit-feedback ALS (Hu et al. 2008). Learns user/item latent factors
    by optimization — a genuinely TRAINED model (vs Jaccard's statistics)."""
    nu, ni = R.shape
    C = 1.0 + alpha * R                       # confidence
    P = np.random.normal(0, 0.01, (nu, dim))
    Q = np.random.normal(0, 0.01, (ni, dim))
    eye = reg * np.eye(dim)
    for _ in range(iters):
        YtY = Q.T @ Q
        for u in range(nu):
            ci = C[u]
            A = YtY + (Q * (ci - 1)[:, None]).T @ Q + eye
            b = (Q * (ci * R[u])[:, None]).sum(axis=0)
            P[u] = np.linalg.solve(A, b)
        XtX = P.T @ P
        for i in range(ni):
            ci = C[:, i]
            A = XtX + (P * (ci - 1)[:, None]).T @ P + eye
            b = (P * (ci * R[:, i])[:, None]).sum(axis=0)
            Q[i] = np.linalg.solve(A, b)
    return P, Q


def mf_loo_evaluation(top_k_values):
    """Proper LOO for trained MF: retrain (excluding the held-out interaction)
    each fold, so the model never sees the answer — fair vs CF."""
    np.random.seed(42)
    logger.info("=" * 70)
    logger.info("EVALUATION 4: Trained Matrix Factorization (implicit ALS)")
    logger.info("=" * 70)

    all_courses = db.load_courses()
    items = [str(c["_id"]) for c in all_courses]
    iidx = {c: i for i, c in enumerate(items)}

    interactions = db.load_interactions()
    enroll = [(it["userId"], it["courseId"]) for it in interactions
              if it["action"] in ("active", "completed") and it["courseId"] in iidx]
    users = sorted({u for u, _ in enroll})
    uidx = {u: i for i, u in enumerate(users)}
    base = set((u, c) for u, c in enroll)

    user_items = defaultdict(list)
    for u, c in base:
        user_items[u].append(c)
    eligible = {u: cs for u, cs in user_items.items() if len(cs) >= 2}

    nu, ni = len(users), len(items)
    results = {}
    for k in top_k_values:
        acc = {s: [] for s in ("all", "cold", "warm")}
        for u, cs in eligible.items():
            strat = "cold" if len(cs) <= 3 else "warm"
            for held in cs:
                remaining = set(cs) - {held}
                # Build matrix WITHOUT the held-out interaction
                R = np.zeros((nu, ni))
                for (uu, cc) in base:
                    if uu == u and cc == held:
                        continue
                    R[uidx[uu], iidx[cc]] = 1.0
                P, Q = _train_als(R)
                scores = Q @ P[uidx[u]]
                cand = [(items[i], scores[i]) for i in range(ni)
                        if items[i] not in remaining]
                cand.sort(key=lambda x: x[1], reverse=True)
                ranked = [c for c, _ in cand]
                nd = ndcg_at_k(ranked, {held}, k)
                acc["all"].append(nd)
                acc[strat].append(nd)

        def _m(lst):
            return round(float(np.mean(lst)), 4) if lst else None
        row = {"NDCG": _m(acc["all"]), "cold": _m(acc["cold"]),
               "warm": _m(acc["warm"]), "n_folds": len(acc["all"])}
        results[f"@{k}"] = row
        logger.info(f"  MF-ALS (trained)         | NDCG@{k}={row['NDCG']:.4f} "
                     f"(n={row['n_folds']})  cold={row['cold']}  warm={row['warm']}")
    return results


# ═══════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Evaluate EduVerse ML recommendation model")
    parser.add_argument("--top_k", "-k", type=int, nargs="+", default=[5, 8],
                        help="Top-K values for evaluation (default: 5 8)")
    args = parser.parse_args()

    logger.info("Loading model and data...")
    engine.reload_model()

    # 1. LOO evaluation with baseline comparison
    loo_results = leave_one_out_evaluation(args.top_k)

    # 2. Coverage & diversity
    coverage_results = coverage_evaluation(top_k=max(args.top_k))

    # 3. Elbow & silhouette
    elbow_results = elbow_silhouette_analysis()

    # 4. Trained Matrix Factorization (model-based CF)
    mf_results = mf_loo_evaluation(args.top_k)

    # Save results to JSON
    output = {
        "evaluated_at": datetime.utcnow().isoformat(),
        "top_k_values": args.top_k,
        "loo_evaluation": loo_results,
        "coverage": coverage_results,
        "elbow_silhouette": elbow_results,
        "matrix_factorization": mf_results,
    }

    output_path = os.path.join(engine.MODEL_DIR, "evaluation_results.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    logger.info(f"\nResults saved to {output_path}")
    logger.info("Done!")


if __name__ == "__main__":
    main()
