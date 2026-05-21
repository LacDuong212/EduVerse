/**
 * Persistence for precomputed recommender artifacts (item-item matrix, IDF, etc).
 *
 * One document per "kind" (e.g. "item-item-jaccard"). Trainer overwrites the
 * record by upserting on `kind`. Service layer lazy-loads it; if missing, it
 * recomputes on the fly (corpus is tiny enough that this is acceptable).
 *
 * `payload` is an arbitrary JSON blob — Mixed type lets us evolve the shape
 * without migrations.
 */
import mongoose from "mongoose";

const recommendationModelSchema = new mongoose.Schema({
  kind: { type: String, required: true, unique: true, index: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  stats: { type: mongoose.Schema.Types.Mixed, default: {} },
  builtAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const REC_MODEL_KINDS = Object.freeze({
  itemItem: "item-item-jaccard"
});

export default mongoose.models.RecommendationModel
  || mongoose.model("RecommendationModel", recommendationModelSchema);
