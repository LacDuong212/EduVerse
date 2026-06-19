import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as noteService from "./note.service.js";
import { toNoteDto } from "./note.mapper.js";

export const getNotes = asyncHandler(async (req, res) => {
  const { lectureId } = req.params;
  const notes = await noteService.getNotesByLecture(req.user.userId, lectureId);
  sendSuccessResponse(res, 200, "Notes fetched.", notes.map(toNoteDto));
});

export const createNote = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.user.userId, req.body);
  sendSuccessResponse(res, 201, "Note created.", toNoteDto(note));
});

export const updateNote = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(req.user.userId, req.params.id, req.body);
  sendSuccessResponse(res, 200, "Note updated.", toNoteDto(note));
});

export const deleteNote = asyncHandler(async (req, res) => {
  await noteService.deleteNote(req.user.userId, req.params.id);
  sendSuccessResponse(res, 200, "Note deleted.", null);
});

export const getCourseNotes = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const notes = await noteService.getNotesByCourse(req.user.userId, courseId);
  sendSuccessResponse(res, 200, "Course notes fetched.", notes.map(toNoteDto));
});
