import * as yup from "yup";

export const signUpSchema = yup.object({
  name: yup.string().required("Please enter your full name"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Please enter your email"),
  password: yup.string().required("Please enter your password"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  terms: yup
    .bool()
    .oneOf([true], "You must accept the terms of service"),
});