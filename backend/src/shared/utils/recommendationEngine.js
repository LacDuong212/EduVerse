import natural from "natural";

/**
 * Hàm AI tính toán độ tương đồng nội dung
 * @param {Object} targetProfile - Object chứa text của (User Profile HOẶC Khóa đang xem)
 * @param {Array} candidateCourses - Danh sách khóa học ứng viên
 * @param {Number} limit - Số lượng trả về
 */
export const getRecommendations = (targetProfile, candidateCourses, limit = 8) => {
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();

  const processedDocs = [];

  const targetText = `${targetProfile.title} ${targetProfile.subtitle} ${targetProfile.tag} ${targetProfile.category}`;
  tfidf.addDocument(targetText);

  candidateCourses.forEach((doc, index) => {
    const candidateTags = (doc.tags || []).join(' ');
    const content = `${doc.title} ${doc.subtitle} ${doc.category?.name || ''} ${candidateTags}`;
    tfidf.addDocument(content);

    processedDocs.push({
      index: index + 1,
      id: doc._id,
      doc: doc
    });
  });

  const targetTerms = [];
  tfidf.listTerms(0).forEach(item => {
    if (item.tfidf > 0) targetTerms.push(item.term);
  });

  const recommendations = [];

  processedDocs.forEach(item => {
    let score = 0;
    targetTerms.forEach(term => {
      tfidf.tfidfs(term, function (i, measure) {
        if (i === item.index) {
          score += measure;
        }
      });
    });

    if (score > 0) {
      recommendations.push({
        ...item.doc,
        similarityScore: score
      });
    }
  });

  return recommendations
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
};