import natural from 'natural';

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

  const targetText = `${targetProfile.title || ''} ${targetProfile.description || ''} ${targetProfile.tags ? targetProfile.tags.join(' ') : ''}`;
  tfidf.addDocument(targetText);

  candidateCourses.forEach((doc, index) => {
    const content = `${doc.title || ''} ${doc.description || ''} ${doc.category?.name || ''}`;
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
        ...item.doc.toObject(),
        similarityScore: score
      });
    }
  });

  return recommendations
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
};