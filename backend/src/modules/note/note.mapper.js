export const toNoteDto = (note) => ({
  id: note._id.toString(),
  courseId: note.courseId.toString(),
  lectureId: note.lectureId,
  timestamp: note.timestamp,
  content: note.content,
  tags: note.tags ?? [],
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});
