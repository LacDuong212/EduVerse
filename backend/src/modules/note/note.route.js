import { Router } from "express";
import { protect } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as noteController from "./note.controller.js";
import * as noteSchema from "./note.validation.js";

// @route /notes
const noteRoute = Router();

noteRoute.use(protect);

noteRoute.get(
  "/lectures/:lectureId",
  validate(noteSchema.getNotesRequest),
  noteController.getNotes
);

noteRoute.get(
  "/courses/:courseId",
  validate(noteSchema.getCourseNotesRequest),
  noteController.getCourseNotes
);

noteRoute.post(
  "/",
  validate(noteSchema.createNoteRequest),
  noteController.createNote
);

noteRoute.patch(
  "/:id",
  validate(noteSchema.updateNoteRequest),
  noteController.updateNote
);

noteRoute.delete(
  "/:id",
  validate(noteSchema.deleteNoteRequest),
  noteController.deleteNote
);

export default noteRoute;
