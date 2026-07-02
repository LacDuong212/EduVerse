"""
EduVerse ML — Fusion Weight Grid-Search + Per-Strategy Coverage/Diversity
=========================================================================
Completes the evaluation story:
  1. Grid-search fusion weights (cluster/content/cf/popularity) to find the
     config that maximizes LOO NDCG@K. Caches per-signal normalized scores
     ONCE per fold (weights don't affect normalization), so the sweep is cheap.
  2. Per-strategy Coverage + Intra-list Diversity, to quantify the
     accuracy-vs-diversity trade-off (CF-only vs Hybrid-default vs Hybrid-tuned).

Usage:  py grid_search.py --k 10 --step 0.1
Output: prints tables + writes model/grid_search_results.json
"""
import argparse
import json
import logging
import math
from collections import defaultdict
from copy import deepcopy

import numpy as np
import joblib
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()
import db
import engine

logging.basicConfig(level=logging.INFO, format="[grid] %(message)s",
                    stream=__import__("sys").stdout)
logger = logging.getLogger("grid")

SIGNALS = ["cluster", "content", "cf", "popularity"]


def ndcg_at_k(ranked_ids, relevant, k):
    dcg = sum(1.0 / math.log2(i + 2) for i, cid in enumerate(ranked_ids[:k]) if cid in relevant)
    idcg = sum(1.0 / math.log2(i + 2) for i in range(min(len(relevant), k)))
    return dcg / idcg if idcg > 0 else 0.0


def recall_at_k(ranked_ids, relevant, k):
    return len(set(ranked_ids[:k]) & relevant) / len(relevant) if relevant else 0.0


def weight_simplex(step):
    """All weight tuples over SIGNALS on a `step` grid summing to 1.0."""
    n = round(1.0 / step)
    combos = []
    for a in range(n + 1):
        for b in range(n + 1 - a):
            for c in range(n + 1 - a - b):
                d = n - a - b - c
                combos.append((a * step, b * step, c * step, d * step))
    return combos


def _all_scored(signals, candidates):
    """Return list of (courseId, {signal: normalized_score}) for ALL candidates."""
    res = engine.predict(signals, candidates, top_k=len(candidates))
    return [(r["courseId"], r["scores"]) for r in res]


def fuse_rank(scored, w):
    """Re-rank cached per-signal scores under weight tuple w."""
    wc, wo, wf, wp = w
    ranked = sorted(
        scored,
        key=lambda x: wc * x[1]["cluster"] + wo * x[1]["content"]
        + wf * x[1]["cf"] + wp * x[1]["popularity"],
        reverse=True,
    )
    return [cid for cid, _ in ranked]


def cache_loo_folds():
    """For each LOO fold, cache (held_out_id, scored_candidates, stratum)."""
    interactions = db.load_interactions()
    user_enr = defaultdict(list)
    for it in interactions:
        if it["action"] in ("active", "completed"):
            user_enr[it["userId"]].append(it["courseId"])
    eligible = {u: c for u, c in user_enr.items() if len(c) >= 2}

    all_courses = db.load_courses()
    folds = []
    for uid, enrolled in eligible.items():
        strat = "cold" if len(enrolled) <= 3 else "warm"
        full = db.load_user_signals(uid)
        for i, held in enumerate(enrolled):
            remaining = {cid for j, cid in enumerate(enrolled) if j != i}
            sig = deepcopy(full)
            sig["enrollments"] = [e for e in sig["enrollments"]
                                  if str(e["course"]) != held]
            candidates = [c for c in all_courses if str(c["_id"]) not in remaining]
            folds.append((held, _all_scored(sig, candidates), strat))
    logger.info(f"Cached {len(folds)} LOO folds ({sum(1 for f in folds if f[2]=='cold')} cold)")
    return folds


def grid_search(folds, k, step):
    combos = weight_simplex(step)
    logger.info(f"Sweeping {len(combos)} weight combos @k={k}...")
    rows = []
    for w in combos:
        ndcgs = {"all": [], "cold": [], "warm": []}
        for held, scored, strat in folds:
            ranked = fuse_rank(scored, w)
            v = ndcg_at_k(ranked, {held}, k)
            ndcgs["all"].append(v)
            ndcgs[strat].append(v)
        rows.append({
            "w": w,
            "ndcg_all": round(float(np.mean(ndcgs["all"])), 4),
            "ndcg_cold": round(float(np.mean(ndcgs["cold"])), 4) if ndcgs["cold"] else None,
            "ndcg_warm": round(float(np.mean(ndcgs["warm"])), 4) if ndcgs["warm"] else None,
        })
    rows.sort(key=lambda r: r["ndcg_all"], reverse=True)
    return rows


def coverage_diversity(strategy_weights, k):
    """Per-strategy catalog coverage + intra-list diversity over full-profile users."""
    all_courses = db.load_courses()
    n_catalog = len(all_courses)
    course_txt = {str(c["_id"]): engine._build_course_text(c) for c in all_courses}
    vectorizer = joblib.load(engine.VECTORIZER_PATH)

    interactions = db.load_interactions()
    uids = {it["userId"] for it in interactions}

    # Cache full-profile scored candidates per user once
    user_scored = {}
    for uid in uids:
        sig = db.load_user_signals(uid)
        enrolled = {str(e["course"]) for e in sig.get("enrollments", [])}
        cands = [c for c in all_courses if str(c["_id"]) not in enrolled]
        if cands:
            user_scored[uid] = _all_scored(sig, cands)

    out = {}
    for name, w in strategy_weights.items():
        rec_union = set()
        divs = []
        for uid, scored in user_scored.items():
            topk = fuse_rank(scored, w)[:k]
            rec_union.update(topk)
            if len(topk) >= 2:
                vecs = vectorizer.transform([course_txt[c] for c in topk if c in course_txt])
                sim = cosine_similarity(vecs)
                n = sim.shape[0]
                if n >= 2:
                    off = (sim.sum() - n) / (n * (n - 1))  # mean off-diagonal
                    divs.append(1.0 - off)
        out[name] = {
            "coverage_pct": round(len(rec_union) / n_catalog * 100, 1),
            "diversity": round(float(np.mean(divs)), 4) if divs else None,
        }
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--k", type=int, default=10)
    ap.add_argument("--step", type=float, default=0.1)
    args = ap.parse_args()

    engine._load_model()

    folds = cache_loo_folds()
    rows = grid_search(folds, args.k, args.step)

    default_w = (engine.W_CLUSTER, engine.W_CONTENT, engine.W_CF, engine.W_POPULARITY)
    cf_only = (0.0, 0.0, 1.0, 0.0)
    best = rows[0]["w"]

    def find(w):
        wr = tuple(round(x, 2) for x in w)
        for r in rows:
            if tuple(round(x, 2) for x in r["w"]) == wr:
                return r
        return None

    logger.info("\n" + "=" * 64)
    logger.info(f"GRID-SEARCH RESULTS (NDCG@{args.k}) — weights = (cluster, content, cf, pop)")
    logger.info("=" * 64)
    logger.info(f"{'config':28s} {'all':>7s} {'cold':>7s} {'warm':>7s}")
    for label, w in [("DEFAULT " + str(default_w), default_w),
                     ("CF-only " + str(cf_only), cf_only),
                     ("BEST    " + str(tuple(round(x,2) for x in best)), best)]:
        r = find(w)
        if r:
            logger.info(f"{label:28s} {r['ndcg_all']:>7.4f} "
                        f"{(r['ndcg_cold'] or 0):>7.4f} {(r['ndcg_warm'] or 0):>7.4f}")

    logger.info("\nTop 8 configs by NDCG@%d (all):" % args.k)
    for r in rows[:8]:
        w = tuple(round(x, 2) for x in r["w"])
        logger.info(f"  {str(w):30s} all={r['ndcg_all']:.4f} "
                    f"cold={(r['ndcg_cold'] or 0):.4f} warm={(r['ndcg_warm'] or 0):.4f}")

    logger.info("\n" + "=" * 64)
    logger.info(f"COVERAGE / DIVERSITY @{args.k} (accuracy-vs-diversity trade-off)")
    logger.info("=" * 64)
    cov = coverage_diversity({
        "CF-only": cf_only,
        "Content-only": (0.0, 1.0, 0.0, 0.0),
        "Hybrid-default": default_w,
        "Hybrid-best": best,
    }, args.k)
    logger.info(f"{'strategy':18s} {'coverage%':>10s} {'diversity':>10s}")
    for name, m in cov.items():
        logger.info(f"{name:18s} {m['coverage_pct']:>10.1f} "
                    f"{(m['diversity'] if m['diversity'] is not None else 0):>10.4f}")

    with open("model/grid_search_results.json", "w") as f:
        json.dump({"k": args.k, "step": args.step,
                   "best_weights": best, "default_weights": default_w,
                   "top_configs": rows[:20], "coverage_diversity": cov}, f, indent=2)
    logger.info("\nSaved -> model/grid_search_results.json")


if __name__ == "__main__":
    main()
