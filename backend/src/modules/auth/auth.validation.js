import { z } from "zod";

const nameRegex = /^[\p{L}'\-\s]+$/u;
const otpRegex = /^[0-9]{6}$/;

const emailSchema = z.string({ error: "Email is required" })
  .trim()
  .email("Invalid email format")
  .toLowerCase();

export const complexPasswordSchema = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character");


export const registerRequest = z.object({
  body: z.object({
    name: z
      .string({ error: "Full name is required" })
      .regex(nameRegex, "Full name cannot contain numbers or special characters"),
    email: emailSchema,
    password: complexPasswordSchema,
  }),
});

export const verifyEmailRequest = z.object({
  body: z.object({
    email: emailSchema,
    otp: z
      .string({ error: "OTP is required" })
      .regex(otpRegex, "OTP must be 6 digits"),
  }),
});

export const loginRequest = z.object({
  body: z.object({
    email: emailSchema,
    password: z
      .string({ error: "Password is required" })
      .trim()
      .min(1, "Password must not be empty"),
  }),
});

export const forgetPasswordRequest = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const resetPasswordRequest = z.object({
  body: z.object({
    email: emailSchema,
    otp: z
      .string({ error: "OTP is required" })
      .regex(otpRegex, "OTP must be 6 digits"),
    newPassword: complexPasswordSchema,
  }),
});

export const resendOtpRequest = z.object({
  body: z.object({
    email: emailSchema,
  }),
});