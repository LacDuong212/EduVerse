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

  // 1. Chuẩn bị dữ liệu
  const processedDocs = [];

  // Tạo văn bản cho TARGET (Vị trí index 0)
  // Gộp Title + Description + Tags để phân tích
  const targetText = `${targetProfile.title || ''} ${targetProfile.description || ''} ${targetProfile.tags ? targetProfile.tags.join(' ') : ''}`;
  tfidf.addDocument(targetText);

  // Thêm các CANDIDATES (Vị trí index 1 trở đi)
  candidateCourses.forEach((doc, index) => {
    const content = `${doc.title || ''} ${doc.description || ''} ${doc.category?.name || ''}`;
    tfidf.addDocument(content);
    
    processedDocs.push({
      index: index + 1, // +1 vì vị trí 0 là target
      id: doc._id,
      doc: doc
    });
  });

  // 2. Lấy từ khóa đặc trưng của Target
  const targetTerms = [];
  tfidf.listTerms(0).forEach(item => {
    if (item.tfidf > 0) targetTerms.push(item.term);
  });

  // 3. Tính điểm tương đồng
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

  // 4. Sắp xếp và trả về
  return recommendations
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
};