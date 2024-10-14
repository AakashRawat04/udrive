import * as v from "valibot";

export const loginSchema = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.string(),
});

export const registerSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	email: v.pipe(v.string(), v.email()),
	password: v.string(),
});
