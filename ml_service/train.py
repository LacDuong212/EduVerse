import logging

from dotenv import load_dotenv

load_dotenv()

import db
import engine

logging.basicConfig(
    level=logging.INFO,
    format="[%(name)s] %(levelname)s %(message)s",
)
logger = logging.getLogger("trainer")


def main():
    logger.info("Loading data from MongoDB...")
    courses = db.load_courses()
    interactions = db.load_interactions()

    if not courses:
        logger.error("No published courses found. Aborting.")
        return

    logger.info(f"Found {len(courses)} courses and {len(interactions)} interactions")

    logger.info("Training model...")
    metadata = engine.train_model(courses=courses, interactions=interactions)

    logger.info("Training complete!")
    logger.info(f"  Courses:      {metadata['n_courses']}")
    logger.info(f"  BERT dims:    {metadata.get('n_features_bert', 'N/A')}")
    logger.info(f"  Interactions: {metadata['n_interactions']}")


if __name__ == "__main__":
    main()
