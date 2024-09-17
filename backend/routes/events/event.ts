import { Hono } from "hono";
import { jwt } from "hono/jwt";

export const events = new Hono()
  .use(jwt({
    secret: process.env.JWT_SECRET!,
  }))

events.get('/', (c) => {
  console.log(c.get('jwtPayload'))
  return c.json({ data: 'login' })
})