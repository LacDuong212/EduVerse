// Map a populated CourseProgress doc to a public-safe certificate DTO.
export const toCertificateDto = (progress) => ({
  certId: progress.certId,
  studentName: progress.user?.name || "Unknown",
  courseTitle: progress.course?.title || "Untitled Course",
  instructorName: progress.course?.instructor?.name || null,
  issuedAt: progress.certIssuedAt || progress.updatedAt || null,
});

// Map a CourseProgress doc to a list-item DTO for the "My Certificates" page.
export const toCertificateListItemDto = (progress) => ({
  certId: progress.certId,
  courseId: progress.course?._id?.toString() || null,
  courseTitle: progress.course?.title || "Untitled Course",
  thumbnail: progress.course?.thumbnail || null,
  instructorName: progress.course?.instructor?.name || null,
  issuedAt: progress.certIssuedAt || progress.updatedAt || null,
});
