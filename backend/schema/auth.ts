import * as v from "valibot";

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.string(),
});

export const registerSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  email: v.pipe(v.string(), v.email()),
  password: v.string(),
  otp: v.pipe(v.string(), v.minLength(6), v.maxLength(6)),
});

export const adminSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  email: v.pipe(v.string(), v.email()),
  password: v.string(),
});

export const editAdminSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
  email: v.optional(v.pipe(v.string(), v.email())),
  password: v.optional(v.string()),
});

export const getOtpSchema = v.object({
  email: v.pipe(v.string(), v.email()),
});
