import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

import db
import engine

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="[%(name)s] %(levelname)s %(message)s",
)
logger = logging.getLogger("ml_service")


# Lifespan: load model on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the trained model and BERT into memory when the service starts."""
    logger.info("Starting ML service...")

    loaded = engine.reload_model()

    if loaded:
        # Preload MiniLM/BERT model to avoid first-request timeout
        engine._get_bert_model()

        logger.info("Pre-trained model and BERT loaded successfully")
    else:
        logger.warning("No pre-trained model found. Call POST /api/train first.")

    yield

    logger.info("Shutting down ML service")


app = FastAPI(
    title="EduVerse ML Recommendation Service",
    version="1.0.0",
    lifespan=lifespan,
)


# Request/Response schemas

class TrainRequest(BaseModel):
    pass


class TrainResponse(BaseModel):
    status: str
    metadata: dict


class RecommendRequest(BaseModel):
    user_id: str = Field(..., description="MongoDB user ObjectId as string")
    top_k: int = Field(8, ge=1, le=50)


class RecommendationItem(BaseModel):
    courseId: str
    score: float
    scores: dict = {}


class RecommendResponse(BaseModel):
    recommendations: list[RecommendationItem]
    debug_source: str
    model_status: str


# Endpoints

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "ml-recommendation"}


@app.get("/api/model/info")
async def model_info():
    info = engine.get_model_info()
    return info


@app.post("/api/train", response_model=TrainResponse)
async def train(req: TrainRequest = TrainRequest()):
    try:
        logger.info("Training started...")

        courses = db.load_courses()
        if not courses:
            raise HTTPException(status_code=400, detail="No published courses found in DB")

        interactions = db.load_interactions()
        logger.info(f"Loaded {len(courses)} courses, {len(interactions)} interactions")

        metadata = engine.train_model(
            courses=courses,
            interactions=interactions,
        )

        # Reload the newly trained model into memory
        engine.reload_model()

        logger.info("Training completed successfully")
        return TrainResponse(status="trained", metadata=metadata)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Training failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    try:
        model_status = engine.get_model_info().get("status", "not_trained")

        # Load user signals
        user_signals = db.load_user_signals(req.user_id)

        has_history = bool(
            user_signals["enrollments"]
            or user_signals["wishlist"]
            or user_signals["interests"]
        )

        if not has_history:
            return RecommendResponse(
                recommendations=[],
                debug_source="NoSignals",
                model_status=model_status,
            )

        # Get purchased course IDs to exclude
        purchased_ids = {
            str(e["course"])
            for e in user_signals["enrollments"]
        }

        # Load candidate courses (exclude purchased)
        all_courses = db.load_courses()
        candidates = [c for c in all_courses if str(c["_id"]) not in purchased_ids]

        if not candidates:
            return RecommendResponse(
                recommendations=[],
                debug_source="NoCandidates",
                model_status=model_status,
            )

        # Run ML prediction
        results = engine.predict(
            user_signals=user_signals,
            candidate_courses=candidates,
            top_k=req.top_k,
        )

        # Determine debug source
        has_enrollments = bool(user_signals["enrollments"])
        has_interests = bool(user_signals["interests"])
        has_wishlist = bool(user_signals["wishlist"])

        source_parts = ["Gated"]
        if has_enrollments:
            source_parts.append("History")
        if has_interests:
            source_parts.append("Interests")
        if has_wishlist:
            source_parts.append("Wishlist")

        debug_source = f"Hybrid({'+'.join(source_parts)})"

        return RecommendResponse(
            recommendations=[RecommendationItem(**r) for r in results],
            debug_source=debug_source,
            model_status=model_status,
        )

    except Exception as e:
        logger.error(f"Recommendation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Recommendation failed: {str(e)}"
        )


# Main
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("ML_PORT", 5002))
    uvicorn.run("app:app", host="0.0.0.0", port=port)
