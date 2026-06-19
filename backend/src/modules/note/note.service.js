import AppError from "#exceptions/app.error.js";
import Note from "./note.model.js";

const BASE_QUERY = { isDeleted: false };

export const getNotesByLecture = async (userId, lectureId) => {
  return Note.find({ userId, lectureId, ...BASE_QUERY }).sort({ timestamp: -1 });
};

export const getNotesByCourse = async (userId, courseId) => {
  return Note.find({ userId, courseId, ...BASE_QUERY }).sort({ timestamp: 1 });
};

export const createNote = async (userId, { courseId, lectureId, timestamp, content, tags }) => {
  return Note.create({ userId, courseId, lectureId, timestamp, content, tags: tags ?? [] });
};

export const updateNote = async (userId, noteId, { content, tags }) => {
  const note = await Note.findOne({ _id: noteId, ...BASE_QUERY });
  if (!note) throw new AppError("Note not found.", 404);
  if (note.userId.toString() !== userId) throw new AppError("Access denied.", 403);

  if (content !== undefined) note.content = content;
  if (tags !== undefined) note.tags = tags;

  await note.save();
  return note;
};

export const deleteNote = async (userId, noteId) => {
  const note = await Note.findOne({ _id: noteId, ...BASE_QUERY });
  if (!note) throw new AppError("Note not found.", 404);
  if (note.userId.toString() !== userId) throw new AppError("Access denied.", 403);

  note.isDeleted = true;
  await note.save();
};
