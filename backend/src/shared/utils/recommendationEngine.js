/**
 * Recommendation Engine — Hybrid (Content BM25 + Item-Item Jaccard CF)
 * ---------------------------------------------------------------------
 * Pure-Node implementation. No Python, no external ML service.
 *
 * Why BM25 instead of the previous "sum of TF-IDF weights"?
 * ---------------------------------------------------------
 * The old engine summed TF-IDF weights of the user's terms across each
 * candidate document, which systematically favored *long* candidates
 * (more terms => higher sum). BM25 with cosine on the resulting weighted
 * vectors is length-normalized AND saturating (k1 controls TF saturation),
 * the standard upgrade for short documents like course titles and tag lists.
 *
 * Public API (used by recommendation.service.js):
 *   - tokenize(text)
 *   - buildBm25Index(documents)              -> { idf, avgdl, tfPerDoc, ... }
 *   - bm25Score(queryTokens, index)          -> [{ index, score } ...]
 *   - cosineRank(targetText, candidates, limit)  -> ranked candidates
 *   - jaccard(setA, setB)                    -> 0..1
 *   - buildItemItemMatrix(interactions)      -> { matrix, courseUsers, builtAt }
 *   - getRecommendations(profile, cands, limit)  -> backward-compat shim
 */

import natural from "natural";

// -----------------------------------------------------------------------------
// 1. Tokenization
// -----------------------------------------------------------------------------
// Lightweight stop-word lists for the two languages EduVerse supports.
// Keeping the lists short avoids over-pruning on a tiny corpus (~30 courses).
const STOPWORDS = new Set([
  // english
  "a","an","the","and","or","of","to","for","in","on","with","by","is","are",
  "be","this","that","you","your","i","we","it","as","at","from","but","not",
  "course","courses","learn","learning","intro","introduction","beginner","beginners",
  // vietnamese (very small)
  "và","hoặc","của","cho","trong","trên","là","các","một","những","này","đó",
  "khoá","khóa","học","cơ","bản","nâng","cao","giới","thiệu"
]);

const tokenizer = new natural.WordTokenizer();

export const tokenize = (text) => {
  if (!text) return [];
  const raw = String(text).toLowerCase();
  const words = tokenizer.tokenize(raw) || [];
  return words.filter(w => w.length >= 2 && !STOPWORDS.has(w));
};

// -----------------------------------------------------------------------------
// 2. BM25 index
// -----------------------------------------------------------------------------
// BM25 formula:
//   score(D,Q) = Σ_{t∈Q} IDF(t) · ( f(t,D)·(k1+1) ) / ( f(t,D) + k1·(1 - b + b·|D|/avgdl) )
const BM25_K1 = 1.5;
const BM25_B  = 0.75;

export const buildBm25Index = (documents) => {
  const N = documents.length;
  const df = new Map();
  const docLengths = new Array(N);
  const tfPerDoc = new Array(N);

  documents.forEach((tokens, i) => {
    docLengths[i] = tokens.length || 1;
    const tf = new Map();
    tokens.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
    tfPerDoc[i] = tf;
    for (const term of tf.keys()) df.set(term, (df.get(term) || 0) + 1);
  });

  const avgdl = docLengths.reduce((a,b) => a + b, 0) / Math.max(N, 1);

  // Robertson IDF with +0.5 smoothing; Math.log(1+x) keeps it non-negative.
  const idf = new Map();
  for (const [term, dfi] of df.entries()) {
    idf.set(term, Math.log(1 + (N - dfi + 0.5) / (dfi + 0.5)));
  }

  return { N, idf, avgdl, docLengths, tfPerDoc };
};

const bm25Weight = (term, docIdx, index) => {
  const idf = index.idf.get(term);
  if (!idf) return 0;
  const f = index.tfPerDoc[docIdx].get(term) || 0;
  if (f === 0) return 0;
  const denom = f + BM25_K1 * (1 - BM25_B + BM25_B * (index.docLengths[docIdx] / index.avgdl));
  return idf * (f * (BM25_K1 + 1)) / denom;
};

export const bm25Score = (queryTokens, index) => {
  const uniqueTerms = [...new Set(queryTokens)];
  const out = new Array(index.N);
  for (let i = 0; i < index.N; i++) {
    let s = 0;
    for (const t of uniqueTerms) s += bm25Weight(t, i, index);
    out[i] = { index: i, score: s };
  }
  return out;
};

// -----------------------------------------------------------------------------
// 3. Cosine ranking (content arm of the hybrid)
// -----------------------------------------------------------------------------
// Build BM25-weighted vectors over (target ∪ candidates), then cosine-rank.
// Removes the long-doc bias of "sum of weights" used in the old engine.
const candidateText = (c) => {
  const tags = (c.tags || []).join(" ");
  // Repeat tags once for a cheap field-boost: tags are the strongest signal.
  return `${c.title || ""} ${c.subtitle || ""} ${tags} ${tags} ${c.category?.name || ""}`;
};

export const cosineRank = (targetText, candidates, limit = 8) => {
  if (!candidates || candidates.length === 0) return [];

  const targetTokens = tokenize(targetText);
  if (targetTokens.length === 0) return [];

  const candTokens = candidates.map(c => tokenize(candidateText(c)));
  const allDocs = [targetTokens, ...candTokens];
  const index = buildBm25Index(allDocs);

  const vectorize = (docIdx) => {
    const v = new Map();
    for (const term of index.tfPerDoc[docIdx].keys()) {
      const w = bm25Weight(term, docIdx, index);
      if (w > 0) v.set(term, w);
    }
    return v;
  };
  const targetVec = vectorize(0);
  const targetNorm = Math.sqrt([...targetVec.values()].reduce((a,b) => a + b*b, 0)) || 1;

  const scored = candidates.map((doc, i) => {
    const v = vectorize(i + 1);
    let dot = 0;
    for (const [t, w] of targetVec.entries()) {
      const cw = v.get(t);
      if (cw) dot += w * cw;
    }
    const norm = Math.sqrt([...v.values()].reduce((a,b) => a + b*b, 0)) || 1;
    return { doc, score: dot / (targetNorm * norm) };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// -----------------------------------------------------------------------------
// 4. Item-Item Collaborative Filtering — Jaccard over interaction sets
// -----------------------------------------------------------------------------
// similarity(A, B) = |Users(A) ∩ Users(B)| / |Users(A) ∪ Users(B)|.
// Robust to extreme sparsity; needs no centering (unlike Pearson). Perfect for
// 10 users × 30 courses where Pearson/cosine would produce mostly NaN.
export const jaccard = (setA, setB) => {
  if (!setA?.size || !setB?.size) return 0;
  let inter = 0;
  const [small, big] = setA.size < setB.size ? [setA, setB] : [setB, setA];
  for (const x of small) if (big.has(x)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
};

/**
 * Build item-item similarity matrix.
 * @param {Array<{userId:string, courseId:string}>} interactions
 * @returns {{ matrix:Object, courseUsers:Object, builtAt:Date }}
 */
export const buildItemItemMatrix = (interactions) => {
  const courseUsers = new Map();
  for (const it of interactions) {
    if (!it?.courseId || !it?.userId) continue;
    const cid = String(it.courseId);
    const uid = String(it.userId);
    if (!courseUsers.has(cid)) courseUsers.set(cid, new Set());
    courseUsers.get(cid).add(uid);
  }

  const ids = [...courseUsers.keys()];
  const matrix = {};
  for (let i = 0; i < ids.length; i++) {
    matrix[ids[i]] = {};
    for (let j = 0; j < ids.length; j++) {
      if (i === j) continue;
      const sim = jaccard(courseUsers.get(ids[i]), courseUsers.get(ids[j]));
      if (sim > 0) matrix[ids[i]][ids[j]] = +sim.toFixed(4);
    }
  }

  const courseUsersOut = {};
  for (const [cid, set] of courseUsers.entries()) courseUsersOut[cid] = [...set];

  return { matrix, courseUsers: courseUsersOut, builtAt: new Date() };
};

// -----------------------------------------------------------------------------
// 5. Backward-compat shim
// -----------------------------------------------------------------------------
// The old engine exported getRecommendations(profile, candidates, limit) and
// is still called from getRelatedCourses. Route it through the new ranker.
export const getRecommendations = (targetProfile, candidateCourses, limit = 8) => {
  if (!candidateCourses?.length) return [];
  const targetText = [
    targetProfile?.title, targetProfile?.subtitle,
    targetProfile?.tag,   targetProfile?.category
  ].filter(Boolean).join(" ");

  return cosineRank(targetText, candidateCourses, limit).map(({ doc, score }) => ({
    ...doc,
    similarityScore: score
  }));
};
