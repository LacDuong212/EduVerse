import * as yup from "yup";


const nameRegex = /^[\p{L}'\-\s]+$/u;

export const registerSchema = yup.object({
  body: yup.object({
    name: yup
      .string()
      .required("Full name is required")
      .matches(nameRegex, "Full name cannot contain numbers or special characters"),

    email: yup
      .string()
      .email("Email must be a valid email")
      .required("Email is required"),

    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[!@#$%^&*]/, "Password must contain at least one special character"),
  }),
});

export const verifyEmailSchema = yup.object({
  body: yup.object({
    email: yup
      .string()
      .email("Email must be a valid email")
      .required("Email is required"),
    otp: yup
      .string()
      .required("OTP is required")
      .matches(/^[0-9]{6}$/, "OTP must be 6 digits"),
  }),
});

export const loginSchema = yup.object({
  body: yup.object({
    email: yup
      .string()
      .email("Email must be a valid email")
      .required("Email is required"),
    password: yup.string().required("Password is required"),
  }),
});

export const forgotPasswordSchema = yup.object({
  body: yup.object({
    email: yup
      .string()
      .email("Email must be a valid email")
      .required("Email is required"),
  }),
});

export const resetPasswordSchema = yup.object({
  body: yup.object({
    email: yup
      .string()
      .email("Email must be a valid email")
      .required("Email is required"),

    otp: yup
      .string()
      .required("OTP is required")
      .matches(/^[0-9]{6}$/, "OTP must be 6 digits"),

    newPassword: yup
      .string()
      .required("New password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[!@#$%^&*]/, "Password must contain at least one special character"),
  }),
});