import { z } from "zod";

const idSchema = z.string("Instructor ID is required")
  .trim()
  .min(1, "Instructor ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid instructor ID format",
    })
  );

export const insIdParamRequest = z.object({
  params: z.object({
    insId: idSchema,
  })
});