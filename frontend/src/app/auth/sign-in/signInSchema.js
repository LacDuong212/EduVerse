import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({
      error: (iss) => iss.input === undefined ? "Email is required" : "Email must be a string"
    })
    .trim()
    .email("Email must be a valid email"),

  password: z
    .string({
      error: (iss) => iss.input === undefined ? "Password is required" : "Password must be a string"
    })
    .min(1, "Password is required"),
});