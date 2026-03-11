import { z } from "zod";

const nameRegex = /^[\p{L}'\-\s]+$/u;
const otpRegex = /^[0-9]{6}$/;

const emailSchema = z.string({ error: "Email is required" })
  .trim()
  .email("Invalid email format")
  .toLowerCase();

const complexPasswordSchema = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[!@#$%^&*]/, "Password must contain at least one special character");

  
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Full name is required" })
      .regex(nameRegex, "Full name cannot contain numbers or special characters"),
    email: emailSchema,
    password: complexPasswordSchema,
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z
      .string({ error: "OTP is required" })
      .regex(otpRegex, "OTP must be 6 digits"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z
    .string({ error: "Password is required" })
    .trim()
    .min(1, "Password must not be empty"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z
      .string({ error: "OTP is required" })
      .regex(otpRegex, "OTP must be 6 digits"),
    newPassword: complexPasswordSchema,
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});