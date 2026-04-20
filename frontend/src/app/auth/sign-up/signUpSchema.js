import { z } from "zod";

export const complexPasswordSchema = z
  .string("Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character");

export const signUpSchema = z
  .object({
    name: z
      .string("Please enter your name")
      .trim()
      .min(1, "Please enter your name"),

    email: z
      .string("Please enter your email")
      .trim()
      .email("Please enter a valid email"),

    password: complexPasswordSchema,

    confirmPassword: z
      .string("Please confirm your password")
      .min(1, "Please confirm your password"),

    terms: z
      .literal(true, {
        errorMap: () => ({ message: "You must accept the terms of service" }),
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });