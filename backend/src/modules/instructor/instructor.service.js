import { generateUploadUrl } from "#services/s3.service.js";
import Instructor from "./instructor.model.js";

export class InstructorService {
  constructor(Instructor) {
    this.Instructor = Instructor;
  }
}