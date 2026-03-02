import { z } from "zod";

const nameRegex = /^[\p{L}'\-\s]+$/u;
const otpRegex = /^[0-9]{6}$/;

const emailSchema = z
  .string({ required_error: "Email is required" })
  .email("Email must be a valid email");

const complexPasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[!@#$%^&*]/, "Password must contain at least one special character");

  
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Full name is required" })
      .regex(nameRegex, "Full name cannot contain numbers or special characters"),
    email: emailSchema,
    password: complexPasswordSchema,
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z
      .string({ required_error: "OTP is required" })
      .regex(otpRegex, "OTP must be 6 digits"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string({ required_error: "Password is required" }),
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
      .string({ required_error: "OTP is required" })
      .regex(otpRegex, "OTP must be 6 digits"),
    newPassword: complexPasswordSchema,
  }),
});