import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { loginSchema } from "../../schema/auth";

export const auth = new Hono();

auth.post("/login", vValidator("json", loginSchema), async (c) => {
  const body = c.req.valid("json")

  // TODO: Implement actual login logic

  const token = await sign({
    email: body.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  }, process.env.JWT_SECRET!);

  return c.json({ data: token });
});

auth.post("/register", (c) => {
  return c.json({ data: "register" });
});
