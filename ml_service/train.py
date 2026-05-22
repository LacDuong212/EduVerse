"""
EduVerse ML — Standalone Training Script
==========================================
Usage:
  python train.py                  # Train with auto-detected K
  python train.py --clusters 5    # Train with K=5 clusters
  python train.py --evaluate      # Train + evaluate quality

Connects directly to MongoDB, trains the model, and saves to disk.
Can be run as a cron job or called via the /api/train endpoint.
"""

import argparse
import logging
import math

from dotenv import load_dotenv

load_dotenv()

import db
import engine

from sklearn.metrics import silhouette_score

logging.basicConfig(
    level=logging.INFO,
    format="[%(name)s] %(levelname)s %(message)s",
)
logger = logging.getLogger("trainer")


def evaluate_model():
    """
    Evaluate the trained model's quality using:
      1. Silhouette Score — cluster cohesion/separation [-1, 1]
      2. Cluster distribution — evenness check
      3. Coverage — % of interactions represented in model
    """
    info = engine.get_model_info()
    if info.get("status") != "ready":
        logger.error("Model not trained. Run training first.")
        return

    logger.info("=" * 60)
    logger.info("MODEL EVALUATION")
    logger.info("=" * 60)

    # Load trained artifacts
    from sklearn.metrics import silhouette_score as sil_score
    import joblib

    vectors = joblib.load(engine.BERT_VECTORS_PATH)
    kmeans = joblib.load(engine.KMEANS_PATH)
    labels = kmeans.labels_
    course_ids = joblib.load(engine.COURSE_IDS_PATH)

    # 1. Silhouette Score
    if len(set(labels)) >= 2:
        score = sil_score(vectors, labels)
        logger.info(f"Silhouette Score: {score:.4f}")
        if score > 0.5:
            logger.info("  → Good: clusters are well-separated")
        elif score > 0.25:
            logger.info("  → Fair: some overlap between clusters")
        else:
            logger.info("  → Weak: clusters overlap significantly")
    else:
        logger.info("Silhouette Score: N/A (only 1 cluster)")

    # 2. Cluster distribution
    logger.info(f"\nCluster Distribution:")
    dist = info.get("cluster_distribution", {})
    total = sum(dist.values())
    for cluster_id, count in sorted(dist.items()):
        pct = count / total * 100 if total > 0 else 0
        bar = "█" * int(pct / 2)
        logger.info(f"  Cluster {cluster_id}: {count:3d} courses ({pct:5.1f}%) {bar}")

    # 3. Inertia (within-cluster sum of squares)
    logger.info(f"\nInertia (WCSS): {info.get('inertia', 'N/A')}")
    logger.info(f"Features: {info.get('n_features', 'N/A')}")
    logger.info(f"Interactions: {info.get('n_interactions', 'N/A')}")

    # 4. Coverage: what % of courses have at least 1 interaction
    item_item = joblib.load(engine.ITEM_ITEM_PATH) if engine.ITEM_ITEM_PATH else {}
    courses_with_cf = len(item_item)
    logger.info(
        f"\nCF Coverage: {courses_with_cf}/{len(course_ids)} courses "
        f"have collaborative signals ({courses_with_cf / max(len(course_ids), 1) * 100:.0f}%)"
    )

    logger.info("=" * 60)


def main():
    parser = argparse.ArgumentParser(description="Train EduVerse recommendation model")
    parser.add_argument(
        "--clusters", "-k", type=int, default=None,
        help="Number of K-means clusters (auto if omitted)"
    )
    parser.add_argument(
        "--evaluate", "-e", action="store_true",
        help="Evaluate model quality after training"
    )
    args = parser.parse_args()

    logger.info("Loading data from MongoDB...")
    courses = db.load_courses()
    interactions = db.load_interactions()

    if not courses:
        logger.error("No published courses found. Aborting.")
        return

    logger.info(f"Found {len(courses)} courses and {len(interactions)} interactions")

    logger.info("Training model...")
    metadata = engine.train_model(
        courses=courses,
        interactions=interactions,
        n_clusters=args.clusters,
    )

    logger.info(f"Training complete!")
    logger.info(f"  Clusters: {metadata['n_clusters']}")
    logger.info(f"  TF-IDF features: {metadata.get('n_features_tfidf', metadata.get('n_features', 'N/A'))}")
    logger.info(f"  BERT dims: {metadata.get('n_features_bert', 'N/A')}")
    logger.info(f"  Inertia:  {metadata['inertia']:.2f}")

    if args.evaluate:
        engine.reload_model()
        evaluate_model()


if __name__ == "__main__":
    main()
