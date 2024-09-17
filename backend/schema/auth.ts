import * as v from 'valibot';

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.string(),
});