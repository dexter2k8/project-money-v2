import * as yup from "yup";
import type { TPostUserArgs } from "../api/auth/post-user/types";
import type { TSignInArgs } from "../api/auth/sign-in/types";

export const signInSchema = yup.object({
  email: yup.string().required("Email is required").email("Invalid email format"),
  password: yup.string().required("Password is required"),
}) satisfies yup.Schema<TSignInArgs>;

export const signUpSchema = yup.object({
  email: yup.string().required("Email is required").email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
}) satisfies yup.Schema<TPostUserArgs>;

export const updateUserSchema = yup.object({
  displayName: yup.string().required("Name is required"),
  email: yup.string().required("Email is required").email("Must be a valid email"),
  photoURL: yup.string().optional(),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/(\d)/, "Password must contain a number")
    .optional(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .test("confirm-password", "Confirm password is required", (value, context) => {
      const { password } = context.parent;
      return password === "" || value === password;
    })
    .optional(),
});

export const editUserSchema = yup.object({
  displayName: yup.string().required("Name is required"),
  email: yup.string().required("Email is required").email("Must be a valid email"),
  password: yup
    .string()
    .transform((value) => (value === "" ? undefined : value))
    .min(6, "Password must be at least 6 characters")
    .matches(/(\d)/, "Password must contain a number")
    .optional(),
  photoURL: yup.string().optional(),
});

export const postUserSchema = yup.object({
  displayName: yup.string().required("Name is required"),
  email: yup.string().required("Email is required").email("Must be a valid email"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/(\d)/, "Password must contain a number"),
  photoURL: yup.string().optional(),
});
